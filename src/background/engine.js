// ═══════════════════════════════════════════════
//  BrowserMind — Agent engine (service worker)
//
//  The agent loop runs here, not in the side panel, so a task survives the
//  panel being closed. The panel is a pure view: it sends commands and
//  renders SESSION broadcasts.
//
//  This module emits *keys*, never sentences. Localization happens in the
//  view, so the engine has no notion of the user's language and the same
//  session renders correctly if that language changes.
// ═══════════════════════════════════════════════

import {
  PROVIDER_CATALOG, resolveChatUrl, authHeaders, maxTokensFieldFor,
} from '../shared/providers.js';
import { getAllTools, DOM_TOOLS } from '../shared/tools.js';
import {
  normalizeOAI, trimHistory, pruneOldImages, pruneBulkyResults,
  buildSystemPrompt, buildOpeningTurn,
  buildAssistantMessage, buildToolResult, appendToolResults, pendingImageMessage,
  buildRequestBody, extractMemoryTags, stripMemoryTags, extractRefusal,
  parseDirectives, resolveCapabilities, applyReasoning, promptSuffix,
  filterTools, isReasoningRejection,
} from '../shared/llm.js';
import { StreamAssembler, readSSE } from '../shared/stream.js';
import {
  LIMITS, loadSettings, loadPersistentMemory, saveMemoryEntry, resolveLang,
} from '../shared/settings.js';

// Injected by background.js to avoid a circular import.
let deps = {
  executeTool: async () => { throw new Error('engine not initialized'); },
  getTabUrl: () => '',
  acquireKeepAlive: async () => {},
  releaseKeepAlive: async () => {},
  broadcast: () => {},
};

export function initEngine(injected) {
  deps = { ...deps, ...injected };
}

// ─── SESSION STORE ──────────────────────────────
// Sessions live in chrome.storage.session: they survive the service worker
// being recycled mid-task (which MV3 does routinely) and are cleared when the
// browser closes. Runtime-only handles stay in a plain Map.

const SESSION_PREFIX = 'bm_session_';
const sessions = new Map();   // tabId → session (write-through cache)
const runtime = new Map();    // tabId → { abortController, stopRequested }
const pendingNavConfirms = new Map();

const MAX_MESSAGES = 400;
const MAX_HISTORY = 200;

const key = (tabId) => SESSION_PREFIX + tabId;

function blankSession(tabId, url = '', title = '') {
  return {
    tabId, url, title,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
    history: [],
    iterations: 0,
    running: false,
    awaitingContinue: false,
    status: { key: 'ready', state: 'idle' },
    // Which service this conversation talks to. `choice` is what the user
    // picked for this tab; `pinned` is what the history was actually built
    // with, and does not move under a running or paused task.
    choice: null,
    pinned: null,
  };
}

async function readSession(tabId) {
  if (sessions.has(tabId)) return sessions.get(tabId);
  const stored = await chrome.storage.session.get(key(tabId));
  const session = stored[key(tabId)];
  if (session) {
    // The worker restarted: nothing can still be running.
    session.running = false;
    sessions.set(tabId, session);
  }
  return session || null;
}

async function ensureSession(tabId, url, title) {
  const existing = await readSession(tabId);
  if (existing) {
    if (url) existing.url = url;
    if (title) existing.title = title;
    return existing;
  }
  const created = blankSession(tabId, url, title);
  sessions.set(tabId, created);
  return created;
}

let persistTimer = 0;
const persistQueue = new Set();

function schedulePersist(session) {
  persistQueue.add(session.tabId);
  if (persistTimer) return;
  persistTimer = setTimeout(async () => {
    persistTimer = 0;
    const ids = [...persistQueue];
    persistQueue.clear();

    const patch = {};
    for (const id of ids) {
      const s = sessions.get(id);
      if (!s) continue;
      patch[key(id)] = {
        ...s,
        messages: s.messages.slice(-MAX_MESSAGES),
        history: s.history.slice(-MAX_HISTORY),
      };
    }
    if (Object.keys(patch).length > 0) {
      try { await chrome.storage.session.set(patch); }
      catch (e) { console.warn('BrowserMind: session persist failed', e.message); }
    }
  }, 300);
}

function snapshot(session) {
  return {
    tabId: session.tabId,
    url: session.url,
    title: session.title,
    messages: session.messages,
    iterations: session.iterations,
    running: session.running,
    awaitingContinue: session.awaitingContinue,
    status: session.status,
    choice: session.choice,
    pinned: session.pinned,
  };
}

function broadcast(session) {
  session.updatedAt = Date.now();
  schedulePersist(session);
  deps.broadcast({ type: 'SESSION', session: snapshot(session) });
}

// ─── MESSAGE HELPERS ────────────────────────────

function newId() {
  return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
}

function addMessage(session, message) {
  const full = { id: newId(), at: Date.now(), ...message };
  session.messages.push(full);
  if (session.messages.length > MAX_MESSAGES) session.messages.shift();
  broadcast(session);
  return full;
}

function dropMessage(session, message) {
  const at = session.messages.indexOf(message);
  if (at >= 0) session.messages.splice(at, 1);
}

function setStatus(session, statusKey, params = {}, state = 'idle') {
  session.status = { key: statusKey, params, state };
  broadcast(session);
}

// ─── PUBLIC API ─────────────────────────────────

export async function getSession(tabId, url) {
  const existing = await readSession(tabId);
  if (existing) return { session: snapshot(existing) };

  // A tab reopened with Ctrl+Shift+T comes back with a new id, so a
  // conversation can only be found again by the page it was about.
  const adopted = url ? await adoptOrphan(tabId, url) : null;
  return { session: adopted ? snapshot(adopted) : null };
}

// ─── CLOSED TABS ────────────────────────────────
// Closing a tab must stop the task — acting on a page that no longer exists
// is meaningless. It should not throw away the conversation: Ctrl+W is one
// keystroke away from Ctrl+S, and the work behind a long run is real.

const ORPHAN_KEY = 'bm_orphans';
const MAX_ORPHANS = 5;

async function readOrphans() {
  const stored = await chrome.storage.session.get(ORPHAN_KEY);
  return Array.isArray(stored[ORPHAN_KEY]) ? stored[ORPHAN_KEY] : [];
}

/** Stops the task and sets the conversation aside, reachable by its URL. */
export async function retireSession(tabId) {
  const rt = runtime.get(tabId);
  if (rt) {
    rt.stopRequested = true;
    rt.abortController?.abort();
    runtime.delete(tabId);
  }

  const session = await readSession(tabId);
  sessions.delete(tabId);
  await chrome.storage.session.remove(key(tabId)).catch(() => {});

  if (!session || session.messages.length === 0) return { ok: true, kept: false };

  // Two safety nets, on purpose. The orphan pool is for picking the work back
  // up in a reopened tab and dies with the browser; the archive is the
  // permanent, searchable copy in Settings.
  const settings = await loadSettings();
  if (settings.historyEnabled) await archive(session, settings);

  // Every page read in it describes a page that is gone, and the pool has a
  // storage budget to respect.
  pruneBulkyResults(session.history, { keep: 0 });

  const orphans = (await readOrphans()).filter(o => o.url !== session.url);
  orphans.push({ ...session, running: false, awaitingContinue: false, retiredAt: Date.now() });
  await chrome.storage.session.set({ [ORPHAN_KEY]: orphans.slice(-MAX_ORPHANS) });

  return { ok: true, kept: true };
}

/** Hands a set-aside conversation to a new tab showing the same page. */
async function adoptOrphan(tabId, url) {
  const orphans = await readOrphans();
  const match = orphans.find(o => o.url === url);
  if (!match) return null;

  await chrome.storage.session.set({ [ORPHAN_KEY]: orphans.filter(o => o !== match) });

  const session = { ...match, tabId, running: false, status: { key: 'ready', state: 'idle' } };
  delete session.retiredAt;
  sessions.set(tabId, session);

  addMessage(session, { role: 'notice', key: 'resumed' });
  return session;
}

/** Discards a conversation for good. */
export async function dropSession(tabId) {
  const rt = runtime.get(tabId);
  if (rt) {
    rt.stopRequested = true;
    rt.abortController?.abort();
    runtime.delete(tabId);
  }
  sessions.delete(tabId);
  await chrome.storage.session.remove(key(tabId)).catch(() => {});
  return { ok: true };
}

export async function clearTask(tabId) {
  const session = await readSession(tabId);
  if (session?.running) await stopTask(tabId);

  const fresh = blankSession(tabId, session?.url, session?.title);
  sessions.set(tabId, fresh);
  broadcast(fresh);
  return { ok: true };
}

export async function stopTask(tabId) {
  const rt = runtime.get(tabId);
  const session = await readSession(tabId);
  if (!rt || !session) return { error: 'no_task' };

  rt.stopRequested = true;
  rt.abortController?.abort();
  setStatus(session, 'stopping', {}, 'thinking');
  return { ok: true };
}

export function respondNavConfirm(requestId, allowed) {
  const resolve = pendingNavConfirms.get(requestId);
  if (resolve) {
    pendingNavConfirms.delete(requestId);
    resolve(!!allowed);
  }
  return { ok: true };
}

/**
 * The user navigating a tab by hand while a task runs used to go unnoticed:
 * the agent kept acting on whatever page had replaced the one it was reading.
 *
 * Most navigation during a task is the agent's own doing — a click, a form
 * submit, a redirect that follows one. Those are covered by a grace window
 * that opens while a tool runs and stays open briefly afterwards, so only a
 * navigation with no action behind it counts as the user taking the wheel.
 */
export async function notifyTabNavigated(tabId, url) {
  const session = sessions.get(tabId);
  if (!session) return;

  session.url = url;
  if (!session.running) { broadcast(session); return; }

  const rt = runtime.get(tabId);
  if (!rt || rt.toolActive || Date.now() < (rt.navGraceUntil || 0)) {
    broadcast(session);
    return;
  }

  rt.pageChangedUnderneath = url;
  addMessage(session, { role: 'notice', key: 'pageChanged', params: { domain: domainOf(url) } });
}

/**
 * The service a conversation talks to.
 *
 * Per tab, not global: two tabs can be mid-task on two different models, and
 * neither may change under a task that is already running or paused. A global
 * setting sampled at send time gave the model of whoever last touched the
 * dropdown, which is not what "one conversation per tab" means.
 */
function resolveInstance(session, settings, { locked = false } = {}) {
  // A new message is a fresh decision, so what the user picked wins. Resuming
  // a paused task is not: it must carry on with what the history was built
  // with, whatever the dropdown says now.
  const wanted = locked
    ? (session.pinned?.instanceId || session.choice?.instanceId || settings.currentProvider)
    : (session.choice?.instanceId || session.pinned?.instanceId || settings.currentProvider);
  const instance = settings.configuredProviders.find(p => p.instanceId === wanted)
    // The chosen service was deleted since: fall back rather than dead-end.
    || settings.configuredProviders.find(p => p.instanceId === settings.currentProvider)
    || settings.configuredProviders[0]
    || null;

  if (!instance) return null;

  const fromChoice = session.choice?.instanceId === instance.instanceId ? session.choice.model : null;
  const fromPinned = session.pinned?.instanceId === instance.instanceId ? session.pinned.model : null;
  const model = (locked ? (fromPinned || fromChoice) : (fromChoice || fromPinned)) || instance.selectedModel;

  return { ...instance, selectedModel: model };
}

/** Records what the history is being built with, for this tab. */
export async function setSessionProvider(tabId, { instanceId, model }) {
  const session = await ensureSession(tabId);
  if (session.running) return { error: 'busy' };

  session.choice = { instanceId, model };
  broadcast(session);
  return { ok: true };
}

export async function startTask({ tabId, prompt, url, title }) {
  const existing = await readSession(tabId);
  if (existing?.running) return { error: 'already_running' };

  const session = await ensureSession(tabId, url, title);
  const settings = await loadSettings();

  const instance = resolveInstance(session, settings);
  const check = validateProvider(instance);
  if (check) {
    addMessage(session, { role: 'error', ...check });
    return { error: check.key };
  }

  const wire = PROVIDER_CATALOG[instance.typeId].type;

  // Anthropic and OpenAI shape assistant turns differently. Replaying a
  // history built for one against the other is a guaranteed 400, so a switch
  // between wire formats starts the conversation over instead of corrupting it.
  if (session.pinned && session.pinned.wire !== wire && session.history.length > 0) {
    session.history = [];
    session.iterations = 0;
    addMessage(session, { role: 'notice', key: 'providerChanged', params: { provider: instance.name } });
  }
  session.pinned = { instanceId: instance.instanceId, model: instance.selectedModel, wire };

  // /think, /novision and friends steer this run only, and never reach the
  // model as part of the request.
  const { text, overrides } = parseDirectives(prompt);
  session.overrides = overrides;

  const caps = resolveCapabilities({ def: PROVIDER_CATALOG[instance.typeId], instance, overrides });
  const spoken = text + promptSuffix({ mode: caps.reasoningMode, enabled: caps.thinking });

  // First turn of a conversation: hand the agent the page it is standing on,
  // so it does not spend a whole round trip asking for it.
  if (session.history.length === 0) {
    addMessage(session, { role: 'user', text });
    setStatus(session, 'thinking', { i: 1, max: 1 }, 'thinking');

    const page = await readOpeningPage(session.tabId);
    session.history.push({
      role: 'user',
      content: buildOpeningTurn({ title: session.title, url: session.url, page, prompt: spoken }),
    });
  } else {
    session.history.push({ role: 'user', content: spoken });
    addMessage(session, { role: 'user', text });
  }

  return run(session, settings, instance);
}

export async function continueTask(tabId) {
  const session = await readSession(tabId);
  if (!session || session.running || !session.awaitingContinue) {
    return { error: 'nothing_to_continue' };
  }
  const settings = await loadSettings();

  // Carries on with the service the conversation was built with, whatever the
  // dropdown says now.
  const instance = resolveInstance(session, settings, { locked: true });
  const check = validateProvider(instance);
  if (check) {
    addMessage(session, { role: 'error', ...check });
    return { error: check.key };
  }

  session.awaitingContinue = false;
  return run(session, settings, instance);
}

/**
 * Best-effort read of the starting page. A restricted page, or one that
 * refuses injection, simply means the agent starts without it — never that
 * the task fails to start.
 */
async function readOpeningPage(tabId) {
  try {
    const page = await deps.executeTool('read_page', { include_text: true }, tabId);
    return page?.elements ? page : null;
  } catch {
    return null;
  }
}

function validateProvider(instance) {
  if (!instance) return { key: 'noProvider' };

  const def = PROVIDER_CATALOG[instance.typeId];
  if (!def) return { key: 'unknownProvider', params: { type: instance.typeId } };
  if (!instance.key && !def.keyOptional) return { key: 'noKey', params: { provider: instance.name } };
  if (!instance.selectedModel) return { key: 'noModel', params: { provider: instance.name } };
  if (!resolveChatUrl(instance.typeId, instance.customUrl)) return { key: 'noEndpoint' };
  return null;
}

// ─── LOOP DRIVER ────────────────────────────────

async function run(session, settings, instance) {
  const rt = { abortController: null, stopRequested: false, pageChangedUnderneath: null };
  runtime.set(session.tabId, rt);

  session.running = true;
  await deps.acquireKeepAlive();

  runLoop(session, settings, rt, instance)
    .catch((err) => {
      console.error('BrowserMind: loop failed', err);
      addMessage(session, { role: 'error', key: 'apiError', params: { detail: err.message } });
    })
    .finally(async () => {
      session.running = false;
      runtime.delete(session.tabId);

      // Only clear a status the loop left mid-flight: 'done' and 'paused' are
      // conclusions worth keeping on screen.
      const transient = ['thinking', 'acting', 'stopping', 'rateLimitWait', 'awaitingConfirm'];
      if (rt.stopRequested) setStatus(session, 'stopped', {}, 'idle');
      else if (transient.includes(session.status.key)) setStatus(session, 'ready', {}, 'idle');

      broadcast(session);
      await deps.releaseKeepAlive();
      if (settings.historyEnabled) await archive(session, settings);
    });

  return { ok: true };
}

async function runLoop(session, settings, rt, instance) {
  const def = PROVIDER_CATALOG[instance.typeId];
  const isOAI = def.type === 'openai';

  const memory = settings.memoryEnabled ? await loadPersistentMemory() : [];
  let currentMemory = memory;

  const maxIterations = session.iterations + Math.max(1, Number(settings.maxIterations) || 15);
  let emptyResponses = 0;

  while (session.iterations < maxIterations && !rt.stopRequested) {
    session.iterations++;
    setStatus(session, 'thinking', { i: session.iterations, max: maxIterations }, 'thinking');

    // The user moved the tab somewhere else: stop rather than act on a page
    // the model has never seen.
    if (rt.pageChangedUnderneath) {
      addMessage(session, { role: 'notice', key: 'stoppedPageChanged' });
      return;
    }

    const thinking = addMessage(session, { role: 'thinking', text: '', done: false });
    let blocks;

    try {
      blocks = await callModel({ session, settings, instance, def, isOAI, memory: currentMemory, rt, thinking });
    } catch (err) {
      thinking.done = true;
      if (!thinking.text) dropMessage(session, thinking);

      if (err.name === 'AbortError' || rt.stopRequested) {
        addMessage(session, { role: 'notice', key: 'stoppedByUser' });
        return;
      }
      // The model's real context window is not something we can read from
      // anywhere, so it is learned from the refusal: halve the budget for this
      // conversation and try the same step again.
      if (err.code === 'contextTooLong') {
        const current = session.inputBudget || LIMITS.maxInputTokens;
        const reduced = Math.floor(current / 2);

        if (reduced >= LIMITS.minInputTokens) {
          session.inputBudget = reduced;
          pruneBulkyResults(session.history, { keep: 0 });
          addMessage(session, { role: 'notice', key: 'contextTrimmed' });
          session.iterations--;
          continue;
        }
        addMessage(session, { role: 'error', key: 'contextTooLong' });
        return;
      }

      if (err.code === 'rateLimited') {
        const wait = Math.min(err.retryAfter || 30, 120);
        addMessage(session, { role: 'notice', key: 'rateLimited', params: { seconds: wait } });
        setStatus(session, 'rateLimitWait', { seconds: wait }, 'thinking');
        await interruptibleSleep(wait * 1000, rt);
        if (rt.stopRequested) return;
        session.iterations--;
        continue;
      }
      // The provider's own words are the only thing that explains a 500, so
      // they travel with the error instead of being swallowed by a friendly
      // sentence the user cannot act on.
      addMessage(session, {
        role: 'error',
        key: err.code || 'apiError',
        params: { detail: err.message, status: err.status, ...(err.params || {}) },
      });
      return;
    }

    const textBlocks = blocks.filter(b => b.type === 'text');
    const toolBlocks = blocks.filter(b => b.type === 'tool_use');
    const thinkingText = blocks.filter(b => b.type === 'thinking').map(b => b.thinking).join('\n').trim();
    const rawText = textBlocks.map(b => b.text).join('\n').trim();

    thinking.text = thinkingText;
    thinking.done = true;
    if (!thinkingText) dropMessage(session, thinking);
    broadcast(session);

    if (textBlocks.length === 0 && toolBlocks.length === 0) {
      if (++emptyResponses >= 2) {
        addMessage(session, { role: 'error', key: 'emptyResponse' });
        return;
      }
      session.history.push({ role: 'user', content: 'Continue. Use the available tools to make progress on the task.' });
      continue;
    }
    emptyResponses = 0;

    // Persist anything the model asked to remember, and keep the tag out of
    // what the user reads.
    let displayText = rawText;
    if (rawText && settings.memoryEnabled) {
      for (const { key: k, value } of extractMemoryTags(rawText)) {
        currentMemory = await saveMemoryEntry(currentMemory, k, value);
      }
      displayText = stripMemoryTags(rawText);
    }

    const assistantMessage = buildAssistantMessage(isOAI, blocks, rawText, toolBlocks);
    if (assistantMessage) session.history.push(assistantMessage);

    // Text already on screen from the stream is finalized in place; anything
    // that arrived without streaming is appended now. A streamed bubble left
    // empty (the whole reply was a memory tag) is removed rather than left
    // blinking its cursor forever.
    const streamed = session.messages.find(m => m.role === 'assistant' && m.streaming);
    if (streamed) {
      if (displayText) {
        streamed.text = displayText;
        streamed.streaming = false;
      } else {
        dropMessage(session, streamed);
      }
      broadcast(session);
    } else if (displayText) {
      addMessage(session, { role: 'assistant', text: displayText });
    }

    if (toolBlocks.length === 0) {
      setStatus(session, 'done', {}, 'idle');
      return;
    }

    await runTools({ session, toolBlocks, isOAI, rt });
  }

  if (session.iterations >= maxIterations && !rt.stopRequested) {
    session.awaitingContinue = true;
    addMessage(session, { role: 'notice', key: 'maxIterations', params: { max: maxIterations }, offerContinue: true });
    setStatus(session, 'paused', {}, 'idle');
  }
}

// ─── TOOL EXECUTION ─────────────────────────────

async function runTools({ session, toolBlocks, isOAI, rt }) {
  setStatus(session, 'acting', { count: toolBlocks.length }, 'active');

  const card = addMessage(session, {
    role: 'actions',
    items: toolBlocks.map(tb => ({ tool: tb.name, input: tb.input, status: 'pending' })),
  });

  // Every tool_use block MUST get a matching tool_result, even when the tool
  // never runs. Both wire formats reject a turn where an assistant tool call
  // has no answer, and that 400 poisons every later message in the session.
  const execute = async (block, index) => {
    const toolId = block.id || `tool_${newId()}`;
    block.id = toolId;

    const finish = (result) => {
      const item = card.items[index];
      if (item) {
        item.status = result?.cancelled ? 'cancelled' : (result?.error ? 'error' : 'success');
        item.detail = summarize(block.name, result);
        broadcast(session);
      }
      return { block, result, toolResult: buildToolResult(isOAI, toolId, result) };
    };

    if (rt.stopRequested) {
      return finish({ error: 'Stopped by the user before this action ran.', cancelled: true });
    }

    if (block.name === 'navigate') {
      const verdict = await checkNavigation(session, block.input?.url);
      if (verdict) return finish(verdict);
    }

    setStatus(session, 'acting', { tool: block.name }, 'active');

    let result;
    rt.toolActive = true;
    try {
      for (let attempt = LIMITS.toolRetries; attempt > 0; attempt--) {
        try {
          result = await deps.executeTool(block.name, block.input, session.tabId);
          break;
        } catch (e) {
          if (attempt === 1) result = { error: e.message };
          else await sleep(400);
        }
      }
    } finally {
      rt.toolActive = false;
      // Redirects fired by the action land a moment after it returns.
      rt.navGraceUntil = Date.now() + 3000;
    }

    if (block.name === 'navigate' && result?.success) {
      session.url = result.url || session.url;
      session.title = result.title || session.title;
      rt.pageChangedUnderneath = null; // the agent caused this one
    }
    if (block.name === 'generate_document' && result?.success) {
      addMessage(session, { role: 'export', format: result.format, filename: result.filename });
    }
    return finish(result);
  };

  // Page actions collide with each other and must run in order; everything
  // else can go in parallel.
  const results = new Map();
  const pageBlocks = toolBlocks.filter(b => DOM_TOOLS.has(b.name));
  const otherBlocks = toolBlocks.filter(b => !DOM_TOOLS.has(b.name));

  for (const block of pageBlocks) {
    results.set(block, await execute(block, toolBlocks.indexOf(block)));
  }
  await Promise.all(otherBlocks.map(async (block) => {
    results.set(block, await execute(block, toolBlocks.indexOf(block)));
  }));

  const ordered = toolBlocks.map(block => results.get(block) || {
    block,
    result: { error: 'Not executed.', cancelled: true },
    toolResult: buildToolResult(isOAI, block.id, { error: 'Not executed.', cancelled: true }),
  });

  appendToolResults(session.history, isOAI, ordered.map(r => r.toolResult));

  const imageMessage = pendingImageMessage(isOAI, ordered.map(r => r.result));
  if (imageMessage) session.history.push(imageMessage);
}

/** Returns a cancellation result when the navigation must not happen. */
async function checkNavigation(session, rawUrl) {
  if (!rawUrl) return null;

  const { navAlwaysAllow } = await chrome.storage.local.get('navAlwaysAllow');
  if (navAlwaysAllow) return null;

  const currentDomain = domainOf(deps.getTabUrl(session.tabId) || session.url);
  const targetDomain = domainOf(/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`);
  if (!targetDomain || !currentDomain || targetDomain === currentDomain) return null;

  const allowed = await askNavigation(session, rawUrl, targetDomain);
  if (allowed) return null;

  return {
    error: 'Navigation refused by the user. Do not retry this URL; propose another approach.',
    cancelled: true,
  };
}

function askNavigation(session, url, domain) {
  return new Promise((resolve) => {
    const requestId = newId();
    let settled = false;
    const answer = (value) => {
      if (settled) return;
      settled = true;
      pendingNavConfirms.delete(requestId);
      resolve(value);
    };

    pendingNavConfirms.set(requestId, answer);
    addMessage(session, { role: 'navRequest', requestId, url, domain });
    setStatus(session, 'awaitingConfirm', { domain }, 'thinking');

    // Nobody is there to answer: refuse rather than navigate silently.
    setTimeout(() => answer(false), 120000);
  });
}

/** One-line summary of a tool result, for the action card. */
function summarize(toolName, result) {
  if (!result) return '';
  if (result.error) return String(result.error).slice(0, 140);

  switch (toolName) {
    case 'read_page':    return result.title || result.url || '';
    case 'click':        return result.clicked?.label || '';
    case 'type_text':    return result.typedInto?.label || '';
    case 'navigate':
    case 'new_tab':      return result.url || '';
    case 'web_search':   return `${result.count ?? 0} results`;
    case 'extract_data': return `${result.count ?? (Array.isArray(result.data) ? result.data.length : 1)} items`;
    case 'generate_document': return result.filename || '';
    case 'take_screenshot':   return result.saved || '';
    default:             return '';
  }
}

// ─── MODEL CALL ─────────────────────────────────

// Capabilities a provider/model pair turned out not to have. Kept only for the
// life of the worker: a gateway can be reconfigured, and the cost of finding
// out again is a single retry.
const reasoningRefused = new Set();
const streamRefused = new Set();
const pairKey = (instance) => `${instance.instanceId}:${instance.selectedModel}`;

async function callModel({ session, settings, instance, def, isOAI, memory, rt, thinking }) {
  const chatUrl = resolveChatUrl(instance.typeId, instance.customUrl);
  const replyLang = resolveLang(settings.agentLang || settings.uiLang, 'en');

  const system = buildSystemPrompt({
    userSystemPrompt: settings.userSystemPrompt,
    memory,
    replyLang,
    cacheable: def.supportsCaching === true,
  });

  // Three layers, cheapest first: drop stale page reads, drop stale
  // screenshots, then trim whole exchanges to fit the budget.
  pruneBulkyResults(session.history, { keep: 1 });
  pruneOldImages(session.history, 2);
  const messages = trimHistory(session.history, session.inputBudget || LIMITS.maxInputTokens);

  const caps = resolveCapabilities({ def, instance, overrides: session.overrides });
  const askReasoning = caps.thinking && !reasoningRefused.has(pairKey(instance));
  const askStream = !streamRefused.has(pairKey(instance));

  const body = buildRequestBody({
    isOAI,
    model: instance.selectedModel,
    system,
    messages,
    // A model with no vision cannot answer a screenshot, so it is not offered
    // the tool rather than being handed an image it will reject.
    tools: filterTools(getAllTools(), caps),
    maxOutputTokens: LIMITS.maxOutputTokens,
    maxTokensField: maxTokensFieldFor(instance.typeId),
    toolChoiceAuto: def.toolChoiceAuto === true,
  });
  body.stream = askStream;
  applyReasoning(body, {
    mode: caps.reasoningMode,
    enabled: askReasoning,
    maxOutputTokens: LIMITS.maxOutputTokens,
  });

  const controller = new AbortController();
  rt.abortController = controller;

  const watchdog = createWatchdog(controller, session, def);
  watchdog.awaitFirstChunk();

  let res;
  try {
    res = await fetch(chatUrl, {
      method: 'POST',
      headers: authHeaders(instance.typeId, instance.key),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    watchdog.stop();
    if (e.name === 'AbortError' && !rt.stopRequested) throw watchdog.timeoutError();
    throw e;
  }

  if (!res.ok) {
    watchdog.stop();
    const error = await httpError(res);

    const again = () => callModel({ session, settings, instance, def, isOAI, memory, rt, thinking });

    // A context overflow is ours to fix, not something to retry blindly.
    if (error.code === 'contextTooLong') throw error;

    // `reasoning_effort` only exists on reasoning models: asking gpt-4o for it
    // is a hard 400. Rather than making the user work out which models accept
    // it, note the refusal and run the turn again without it.
    if (askReasoning && error.status === 400 && isReasoningRejection(error.message)) {
      reasoningRefused.add(pairKey(instance));
      return again();
    }

    // A gateway that answers a plain one-token probe but fails the real call
    // is usually one that cannot stream. Losing the live text is a far better
    // outcome than an error the user can do nothing about, so it is tried
    // once, silently, and remembered.
    if (askStream && (error.status >= 500 || /stream/i.test(error.message))) {
      streamRefused.add(pairKey(instance));
      return again();
    }

    throw error;
  }

  const contentType = res.headers.get('content-type') || '';
  try {
    if (!contentType.includes('event-stream')) {
      // A proxy answered without streaming. Handle it rather than failing.
      const json = await res.json();
      watchdog.sawChunk();
      const refusal = extractRefusal(json);
      if (refusal) throw Object.assign(new Error(refusal), { code: 'refusal' });
      return isOAI ? normalizeOAI(json) : (json.content || []);
    }
    return await consumeStream(res, isOAI, session, thinking, rt, watchdog);
  } catch (e) {
    if (e.name === 'AbortError' && !rt.stopRequested) throw watchdog.timeoutError();
    throw e;
  } finally {
    watchdog.stop();
  }
}

/**
 * Watches for silence rather than for elapsed time.
 *
 * A local server loading a model into VRAM answers nothing at all for as long
 * as the load takes — there is no signal for it on the OpenAI-compatible
 * endpoint, so the only honest reading is "no bytes yet". Once bytes flow the
 * budget resets per chunk, which lets a slow model stream a long answer
 * without being cut off half way through.
 */
function createWatchdog(controller, session, def) {
  let timer = 0;
  let hint = 0;
  let phase = 'first-chunk';

  const arm = (ms) => {
    clearTimeout(timer);
    timer = setTimeout(() => controller.abort(), ms);
  };

  return {
    awaitFirstChunk() {
      phase = 'first-chunk';
      arm(LIMITS.firstChunkTimeoutMs);

      // Silence past a few seconds needs explaining, or the panel just looks
      // frozen. A self-hosted server is almost certainly loading the model.
      clearTimeout(hint);
      hint = setTimeout(() => {
        setStatus(session, def.custom ? 'loadingModel' : 'waitingModel', {}, 'thinking');
      }, LIMITS.warmupHintMs);
    },

    sawChunk() {
      clearTimeout(hint);
      if (phase === 'first-chunk') phase = 'streaming';
      arm(LIMITS.stallTimeoutMs);
    },

    stop() {
      clearTimeout(timer);
      clearTimeout(hint);
    },

    timeoutError() {
      const ms = phase === 'first-chunk' ? LIMITS.firstChunkTimeoutMs : LIMITS.stallTimeoutMs;
      return Object.assign(new Error('Timed out waiting for the model'), {
        code: 'timeout',
        params: { seconds: Math.round(ms / 1000) },
      });
    },
  };
}

async function consumeStream(res, isOAI, session, thinking, rt, watchdog) {
  const assembler = new StreamAssembler(isOAI);

  // Text lands in a live message so the answer appears as it is written
  // instead of after a minute of nothing.
  let live = null;
  let lastPaint = 0;

  for await (const payload of readSSE(res.body)) {
    watchdog.sawChunk();
    if (rt.stopRequested) break;

    const delta = assembler.push(payload);

    if (delta.thinking) {
      thinking.text += delta.thinking;
      lastPaint = throttle(session, lastPaint);
    }
    if (delta.text) {
      if (!live) live = addMessage(session, { role: 'assistant', text: '', streaming: true });
      live.text += delta.text;
      lastPaint = throttle(session, lastPaint);
    }
  }

  const blocks = assembler.finish();
  if (assembler.refusal) {
    throw Object.assign(new Error(assembler.refusal), { code: 'refusal' });
  }
  if (live) {
    live.text = stripMemoryTags(live.text);
    broadcast(session);
  }
  return blocks;
}

// Repainting on every token floods the message channel; ~10fps is smooth.
function throttle(session, last) {
  const now = Date.now();
  if (now - last < 100) return last;
  broadcast(session);
  return now;
}

// Every provider words it differently; these are the phrases they share.
const CONTEXT_OVERFLOW =
  /context[_ ]?(window|length)|maximum context|too many tokens|reduce the length|input is too long|prompt is too long/i;

async function httpError(res) {
  let text = '';
  try { text = await res.text(); } catch { /* empty body */ }

  let parsed = {};
  try { parsed = JSON.parse(text); } catch { /* not JSON */ }
  const detail = parsed?.error?.message || parsed?.message || text.slice(0, 200);

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get('retry-after') || '30', 10);
    return Object.assign(new Error(detail || 'Rate limited'), { code: 'rateLimited', retryAfter });
  }
  // A context-window rejection is not a bad request the user can act on; it
  // means we sent too much, and the budget is ours to fix.
  if (res.status === 400 && CONTEXT_OVERFLOW.test(detail)) {
    return Object.assign(new Error(detail), { code: 'contextTooLong', status: 400 });
  }

  const code = {
    401: 'badKey', 403: 'badKey', 402: 'noCredit',
    404: 'badEndpoint', 400: 'badRequest',
  }[res.status] || (res.status >= 500 ? 'providerDown' : 'apiError');

  return Object.assign(new Error(detail || `HTTP ${res.status}`), { code, status: res.status });
}

// ─── ARCHIVE ────────────────────────────────────

async function archive(session, settings) {
  const userTurns = session.messages.filter(m => m.role === 'user');
  if (userTurns.length === 0) return;

  const id = `${session.tabId}_${session.createdAt}`;
  const entry = {
    id,
    url: session.url,
    title: session.title || domainOf(session.url),
    provider: session.pinned?.instanceId || settings.currentProvider,
    model: session.pinned?.model || '',
    firstMessage: (userTurns[0].text || '').slice(0, 120),
    messageCount: session.messages.length,
    messages: session.messages.slice(-MAX_MESSAGES),
    createdAt: session.createdAt,
    updatedAt: Date.now(),
  };

  const { historyIndex } = await chrome.storage.local.get('historyIndex');
  const index = [id, ...(historyIndex || []).filter(i => i !== id)];

  // Apply the retention setting, and actually delete what falls out of it.
  // Trimming only the index leaked orphan records until storage.local hit its
  // quota and writes started failing silently.
  const keepCount = Math.max(1, Math.min(Number(settings.historyRetention) || 30, 200));
  const kept = index.slice(0, keepCount);
  const evicted = index.slice(keepCount);

  await chrome.storage.local.set({ [`hist_${id}`]: entry, historyIndex: kept });
  if (evicted.length > 0) {
    await chrome.storage.local.remove(evicted.map(i => `hist_${i}`));
  }
}

// ─── UTILS ──────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * A rate-limit backoff can be two minutes long. Polling lets Stop take effect
 * during it instead of leaving the user staring at a frozen panel.
 */
async function interruptibleSleep(ms, rt) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline && !rt.stopRequested) {
    await sleep(Math.min(250, deadline - Date.now()));
  }
}

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}
