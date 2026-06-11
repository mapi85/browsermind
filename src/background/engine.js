// ═══════════════════════════════════════════════
//  BrowserMind — Agent Engine (service worker)
//  Runs the agent loop in the background so tasks
//  survive the side panel being closed. The panel
//  is a view: it sends START/STOP/CONTINUE/CLEAR
//  and renders the AGENT_STATE broadcasts.
// ═══════════════════════════════════════════════

import { I18N_PANEL, makeT } from '../shared/i18n.js';
import { PROVIDER_CATALOG, chatUrlFor } from '../shared/providers.js';
import { initToolRegistry, getToolsForMode, getModeById } from '../shared/tools.js';
import {
  normalizeOAI, trimHistory, buildSystemPrompt, buildAssistantMessage,
  buildToolResult, appendToolResults, toAnthropicTools, toOpenAITools,
  extractMemoryTags,
} from '../shared/llm.js';
import { loadSettingsFromStorage, loadPersistentMemory, saveMemoryEntry } from '../shared/settings.js';

// Injected by background.js to avoid a circular import
let deps = {
  executeTool: async () => { throw new Error('engine not initialized'); },
  getPageContext: async () => ({ context: '' }),
};

export function initEngine(injected) {
  deps = { ...deps, ...injected };
}

// ─── TASK STATE ─────────────────────────────────
// One task per tab. Lives in SW memory; lost if the SW is killed
// (the keepAlive alarm in background.js makes that rare while running).
const tasks = {};
const engineErrorLog = [];
const pendingNavConfirms = {}; // requestId → resolve(boolean)

function logError(type, msg, ctx = {}) {
  engineErrorLog.push({ type, msg, ctx, ts: new Date().toISOString() });
  if (engineErrorLog.length > 50) engineErrorLog.shift();
}

function getTask(tabId) {
  return tasks[tabId] || null;
}

export function getTaskState(tabId) {
  const task = getTask(tabId);
  if (!task) return { tabId, exists: false, errorLog: engineErrorLog };
  return snapshot(task);
}

function snapshot(task) {
  return {
    tabId: task.tabId,
    exists: true,
    running: task.running,
    awaitingContinue: task.awaitingContinue,
    iterations: task.iterations,
    messages: task.messages,
    status: task.status,
    errorLog: engineErrorLog,
  };
}

function broadcast(task) {
  chrome.runtime.sendMessage({ type: 'AGENT_STATE', ...snapshot(task) })
    .catch(() => {}); // panel may be closed — fine, state is replayed on reopen
}

// ─── MESSAGE HELPERS ────────────────────────────
function newMsgId() {
  return Date.now() + '_' + Math.random().toString(36).slice(2, 6);
}

function addMsg(task, type, content, extra = {}) {
  const msg = { id: newMsgId(), type, content, ...extra };
  task.messages.push(msg);
  broadcast(task);
  return msg;
}

function setStatus(task, text, state = 'idle') {
  task.status = { text, state };
  broadcast(task);
}

// ─── PUBLIC API ─────────────────────────────────

export async function startTask({ tabId, prompt, url, title }) {
  if (tasks[tabId]?.running) return { error: 'already_running' };

  await initToolRegistry();
  const settings = await loadSettingsFromStorage();
  const memory = await loadPersistentMemory();
  const t = makeT(I18N_PANEL, () => settings.uiLang || 'fr');

  const existing = tasks[tabId];
  const task = tasks[tabId] = {
    tabId,
    url: url || existing?.url || '',
    title: title || existing?.title || '',
    createdAt: existing?.createdAt || Date.now(),
    history: existing?.history || [],
    messages: existing?.messages || [],
    running: true,
    stopRequested: false,
    awaitingContinue: false,
    iterations: existing?.iterations || 0,
    abortController: new AbortController(),
    settings, memory, t,
  };

  addMsg(task, 'user', prompt);
  task.history.push({ role: 'user', content: prompt });

  runLoop(task, task.iterations).catch(e => {
    logError('LOOP_FATAL', e.message);
    addMsg(task, 'error', `${task.t('apiError')} ${e.message}`);
  }).finally(() => finishTask(task));

  return { ok: true };
}

export function continueTask(tabId) {
  const task = getTask(tabId);
  if (!task || task.running || !task.awaitingContinue) return { error: 'nothing_to_continue' };
  task.running = true;
  task.stopRequested = false;
  task.awaitingContinue = false;
  task.abortController = new AbortController();
  runLoop(task, task.iterations).catch(e => {
    logError('LOOP_FATAL', e.message);
    addMsg(task, 'error', `${task.t('apiError')} ${e.message}`);
  }).finally(() => finishTask(task));
  return { ok: true };
}

export function stopTask(tabId) {
  const task = getTask(tabId);
  if (!task) return { error: 'no_task' };
  task.stopRequested = true;
  task.abortController?.abort();
  setStatus(task, task.t('statusStopping'), 'thinking');
  return { ok: true };
}

export function clearTask(tabId) {
  const task = getTask(tabId);
  if (task?.running) stopTask(tabId);
  delete tasks[tabId];
  return { ok: true };
}

export function respondNavConfirm(requestId, allowed) {
  const resolve = pendingNavConfirms[requestId];
  if (resolve) {
    delete pendingNavConfirms[requestId];
    resolve(!!allowed);
  }
  return { ok: true };
}

async function finishTask(task) {
  task.running = false;
  task.stopRequested = false;
  task.abortController = null;
  if (!task.awaitingContinue) setStatus(task, task.t('statusReady'), 'idle');
  broadcast(task);
  if (task.settings.historyEnabled) await saveToHistory(task);
}

// ─── AGENT LOOP ─────────────────────────────────
async function runLoop(task, startIterations) {
  const { settings, t } = task;
  let iterations = startIterations;
  let emptyResponseRetries = 0;
  const maxEmptyRetries = 2;
  const maxForThisCycle = startIterations + settings.maxIterations;

  while (iterations < maxForThisCycle && !task.stopRequested) {
    iterations++;
    task.iterations = iterations;
    setStatus(task, `${t('iteration')} ${iterations}/${maxForThisCycle} ${t('statusThinking')}`, 'thinking');

    const pageContext = await deps.getPageContext(task.tabId);
    const thinkingMsg = addMsg(task, 'thinking', '', { done: false });

    let response;
    try {
      response = await callAPI(task, pageContext.context);
    } catch (err) {
      logError('API_ERROR', err.message);
      thinkingMsg.done = true;
      thinkingMsg.content = `${t('error')}: ${err.message}`;
      if (err.isRateLimit) {
        const w = err.retryAfter || 60;
        addMsg(task, 'error', `⏱ ${t('rateLimit')} ${w}s…`);
        setStatus(task, `${t('rateLimitWait')} ${w}s`, 'thinking');
        await sleep(w * 1000);
        if (!task.stopRequested) iterations--;
        continue;
      }
      addMsg(task, 'error', `${t('apiError')} ${err.message}`);
      return;
    }

    const providerInstance = (settings.configuredProviders || []).find(p => p.instanceId === settings.currentProvider);
    const typeId = providerInstance?.typeId || settings.currentProvider;
    const isOAI = PROVIDER_CATALOG[typeId]?.type === 'openai';
    const blocks = isOAI ? normalizeOAI(response) : (response.content || []);

    const textBlocks = blocks.filter(b => b.type === 'text');
    const toolBlocks = blocks.filter(b => b.type === 'tool_use');
    const textContent = textBlocks.map(b => b.text).join('\n').trim();

    logError('RESPONSE', `textBlocks=${textBlocks.length}, toolBlocks=${toolBlocks.length}`);

    // Empty response → retry with a hint, then give up
    if (textBlocks.length === 0 && toolBlocks.length === 0) {
      const msg = response.choices?.[0]?.message;
      const refusal = msg?.refusal || msg?.provider_specific_fields?.refusal;
      if (refusal) {
        addMsg(task, 'error', `${t('refusal')} ${refusal}`);
        setStatus(task, t('statusRefusal'), 'idle');
        return;
      }
      emptyResponseRetries++;
      if (emptyResponseRetries >= maxEmptyRetries) {
        addMsg(task, 'error', t('emptyResponse'));
        setStatus(task, t('statusFailEmpty'), 'idle');
        return;
      }
      const hintMsg = {
        fr: 'Continue. Utilise les outils disponibles pour accomplir la tâche.',
        en: 'Continue. Use the available tools to complete the task.',
        es: 'Continúa. Usa las herramientas disponibles para completar la tarea.',
        it: 'Continua. Usa gli strumenti disponibili per completare il compito.',
        de: 'Fortfahren. Verwenden Sie die verfügbaren Tools, um die Aufgabe zu erledigen.',
        pt: 'Continue. Use as ferramentas disponíveis para completar a tarefa.',
      };
      task.history.push({ role: 'user', content: hintMsg[settings.uiLang] || hintMsg.fr });
      setStatus(task, t('statusRetry'), 'thinking');
      continue;
    }
    emptyResponseRetries = 0;

    thinkingMsg.content = textContent || (toolBlocks.length > 0 ? t('actionsInProgress') : t('noAction'));
    thinkingMsg.done = true;
    broadcast(task);

    const assistantMsg = buildAssistantMessage(isOAI, blocks, textContent, toolBlocks);
    if (assistantMsg) task.history.push(assistantMsg);
    if (textContent && settings.memoryEnabled) {
      for (const { key, value } of extractMemoryTags(textContent)) {
        task.memory = await saveMemoryEntry(task.memory, key, value);
      }
    }

    if (textContent) addMsg(task, 'assistant', textContent);
    if (toolBlocks.length === 0) { setStatus(task, t('statusDone'), 'idle'); return; }

    setStatus(task, `⚡ ${toolBlocks.length} ${t('statusActions')}`, 'active');
    const actionMsg = addMsg(task, 'action', '', {
      actions: toolBlocks.map(tb => ({ tool: tb.name, input: tb.input, status: 'pending' })),
    });

    // DOM tools run sequentially (page interactions collide), the rest in parallel
    const DOM_TOOLS = new Set(['click', 'type_text', 'scroll', 'fill_form', 'extract_data', 'get_page_content']);
    const domTools   = toolBlocks.filter(tb => DOM_TOOLS.has(tb.name));
    const asyncTools = toolBlocks.filter(tb => !DOM_TOOLS.has(tb.name));

    const execTool = async (tool) => {
      if (task.stopRequested) return { tool, toolResult: null, result: { error: 'Stopped' } };

      // Navigation guard: cross-domain navigation needs user approval
      if (tool.name === 'navigate' && tool.input?.url) {
        const stored = await chrome.storage.local.get(['navAlwaysAllow']);
        if (!stored.navAlwaysAllow) {
          const currentUrl = task.url || '';
          let currentDomain = '', targetDomain = '';
          try { currentDomain = currentUrl ? new URL(currentUrl).hostname : ''; } catch {}
          try { targetDomain = new URL(tool.input.url.startsWith('http') ? tool.input.url : 'https://' + tool.input.url).hostname; } catch {}
          if (targetDomain && currentDomain && targetDomain !== currentDomain) {
            const confirmed = await requestNavConfirm(task, tool.input.url);
            if (!confirmed) {
              return { tool, toolResult: null, result: { error: 'Navigation annulée par l\'utilisateur.', cancelled: true } };
            }
          }
        }
      }

      const toolId = tool.id || ('tool_' + Date.now() + '_' + tool.name);
      tool.id = toolId;
      setStatus(task, `⚡ ${t('toolLabel')[tool.name] || tool.name}…`, 'active');

      let result;
      let retries = 2;
      while (retries > 0) {
        try {
          result = await deps.executeTool(tool.name, tool.input, task.tabId);
          break;
        } catch (e) {
          retries--;
          if (retries === 0) {
            result = { error: e.message };
            logError('TOOL_ERROR', e.message, { tool: tool.name });
          } else {
            await sleep(500);
          }
        }
      }

      // Reflect the outcome on the action card
      const entry = actionMsg.actions.find(a => a.tool === tool.name && a.status === 'pending');
      if (entry) { entry.status = result?.error ? 'error' : 'success'; broadcast(task); }

      if (tool.name === 'navigate' && result?.success && tool.input?.url) {
        task.url = result.url || tool.input.url; // keep the nav guard's notion of "current page" fresh
      }
      if (tool.name === 'generate_document' && result?.success) {
        addMsg(task, 'export', '', { format: tool.input.format, filename: result.filename });
      }

      return { tool, toolResult: buildToolResult(isOAI, toolId, result), result };
    };

    const domResults = [];
    for (const tool of domTools) {
      if (task.stopRequested) break;
      domResults.push(await execTool(tool));
    }
    const asyncResults = task.stopRequested ? [] : await Promise.all(asyncTools.map(execTool));

    // Restore original order for the history
    const toolResults = toolBlocks.map(tb =>
      domResults.find(r => r.tool === tb) || asyncResults.find(r => r.tool === tb)
    ).filter(Boolean);

    const validResults = toolResults.filter(r => r.toolResult);
    appendToolResults(task.history, isOAI, validResults.map(r => r.toolResult));
  }

  if (iterations >= maxForThisCycle && !task.stopRequested) {
    task.awaitingContinue = true;
    addMsg(task, 'system',
      `⚠ ${t('maxIterations')} ${maxForThisCycle} ${t('iterationsReached')} ${t('maxIterationsContinue')}`,
      { continueOffer: true });
  }
}

// ─── NAV CONFIRMATION (panel round-trip) ────────
function requestNavConfirm(task, targetUrl) {
  return new Promise(resolve => {
    const requestId = newMsgId();
    pendingNavConfirms[requestId] = resolve;
    chrome.runtime.sendMessage({ type: 'NAV_CONFIRM_REQUEST', tabId: task.tabId, requestId, url: targetUrl })
      .catch(() => {
        // Panel closed: nobody can approve — deny rather than navigate silently
        delete pendingNavConfirms[requestId];
        resolve(false);
      });
    // Safety: deny after 2 minutes without an answer
    setTimeout(() => {
      if (pendingNavConfirms[requestId]) {
        delete pendingNavConfirms[requestId];
        resolve(false);
      }
    }, 120000);
  });
}

// ─── API CALL ───────────────────────────────────
async function callAPI(task, pageContext) {
  const { settings, t } = task;
  const instanceId = settings.currentProvider;
  const providerInstance = (settings.configuredProviders || []).find(p => p.instanceId === instanceId);
  const typeId = providerInstance?.typeId || instanceId;
  const def = PROVIDER_CATALOG[typeId] || { type: 'openai' };
  const isOAI = def?.type === 'openai';
  const apiKey = settings.providerKeys[instanceId] || providerInstance?.key;
  const model = settings.providerSelectedModel[instanceId] || '';
  const baseUrl = providerInstance?.customUrl || (typeId.startsWith('custom_')
    ? settings.providerCustomUrl[instanceId]
    : chatUrlFor(typeId));

  const pName = providerInstance?.name || def?.name || typeId;
  if (!apiKey)  throw new Error(`${t('apiKeyMissing')} ${pName}`);
  if (!model)   throw new Error(t('noModelSelected'));
  if (!baseUrl) throw new Error(t('baseUrlNotConfigured'));

  const mode = getModeById(settings.currentMode);
  const sys = buildSystemPrompt({
    userSystemPrompt: settings.userSystemPrompt,
    modeExtra: mode?.systemPromptExtra || '',
    pageContext,
    memory: settings.memoryEnabled ? task.memory : [],
    agentLang: settings.agentLang,
    model,
    bestPractices: settings.bestPractices,
  });

  const trimmed = trimHistory(task.history, settings.maxInputTokens);
  logError('REQUEST', `provider=${typeId}, model=${model}, messages=${trimmed.length}, mode=${settings.currentMode}`);

  let headers, body;
  if (isOAI) {
    headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` };
    if (typeId === 'openrouter') { headers['HTTP-Referer'] = 'https://browsermind.ext'; headers['X-Title'] = 'BrowserMind'; }
    if (typeId === 'zai') headers['Content-Type'] = 'application/json; charset=utf-8';
    body = { model, max_tokens: 4096, messages: [{ role: 'system', content: sys }, ...trimmed], tools: toOpenAITools(getToolsForMode(settings.currentMode)) };
    if (typeId === 'xai') body.tool_choice = 'auto';
  } else {
    headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' };
    body = { model, max_tokens: 4096, system: sys, messages: trimmed, tools: toAnthropicTools(getToolsForMode(settings.currentMode)) };
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 120000);
  let signal;
  if (task.abortController && typeof AbortSignal.any === 'function') {
    signal = AbortSignal.any([task.abortController.signal, timeoutController.signal]);
  } else if (task.abortController) {
    task.abortController.signal.addEventListener('abort', () => timeoutController.abort(), { once: true });
    signal = timeoutController.signal;
  } else {
    signal = timeoutController.signal;
  }

  let res;
  try {
    res = await fetch(baseUrl, { method: 'POST', headers, body: JSON.stringify(body), signal });
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') {
      if (task.stopRequested) throw new Error('Arrêté par l\'utilisateur');
      throw new Error('Délai d\'attente dépassé (120s) - Pas de réponse du serveur');
    }
    throw e;
  }
  clearTimeout(timeoutId);

  if (res.status === 429) {
    const retry = parseInt(res.headers.get('retry-after') || '60');
    const e = new Error('Rate limit'); e.isRateLimit = true; e.retryAfter = retry; throw e;
  }
  if (!res.ok) {
    const errText = await res.text();
    logError('HTTP_ERROR', `status=${res.status}, body=${errText.substring(0, 300)}`);
    let err = {};
    try { err = JSON.parse(errText); } catch {}
    if (err.error?.type === 'rate_limit_error') {
      const e = new Error(err.error.message); e.isRateLimit = true; e.retryAfter = 60; throw e;
    }
    throw new Error(err.error?.message || `HTTP ${res.status}: ${errText.substring(0, 100)}`);
  }
  return res.json();
}

// ─── HISTORY PERSISTENCE ────────────────────────
async function saveToHistory(task) {
  if (task.messages.length === 0) return;
  const userMessages = task.messages.filter(m => m.type === 'user');
  if (userMessages.length === 0) return;

  const id = `${task.tabId}_${task.createdAt}`;
  const entry = {
    id, tabId: task.tabId, url: task.url,
    title: task.title || domainOf(task.url),
    provider: task.settings.currentProvider,
    model: task.settings.providerSelectedModel[task.settings.currentProvider] || '',
    firstMessage: userMessages[0]?.content?.substring(0, 100) || '',
    summary: userMessages.map(m => m.content).join(' ').substring(0, 200),
    messageCount: task.messages.length,
    messages: task.messages,
    apiHistory: task.history,
    createdAt: task.createdAt,
    updatedAt: Date.now(),
  };

  const { historyIndex } = await chrome.storage.local.get('historyIndex');
  const index = (historyIndex || []).filter(i => i !== id);
  index.unshift(id);
  await chrome.storage.local.set({ [`hist_${id}`]: entry, historyIndex: index.slice(0, 200) });
}

// ─── UTILS ──────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function domainOf(url) { try { return new URL(url || '').hostname; } catch { return url || ''; } }
