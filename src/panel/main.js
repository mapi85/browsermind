// ═══════════════════════════════════════════════
//  BrowserMind — Side panel
//
//  A view, nothing more. The agent loop and every session live in the service
//  worker; this file renders SESSION broadcasts and sends commands back. It
//  keeps no message state of its own, which is what used to make panel-side
//  messages vanish on the next broadcast.
// ═══════════════════════════════════════════════

import { loadSettings, saveSettings } from '../shared/settings.js';
import { initI18n, applyI18n, t } from '../shared/i18n.js';
import { getToolByName } from '../shared/tools.js';
import { ICO, toolIconSvg, exportIconSvg, stepStatusIcon } from '../shared/icons.js';

const $ = (id) => document.getElementById(id);

let settings = null;
let windowId = null;
let activeTab = null;      // { id, url, title }
let session = null;        // snapshot from the engine
const runningElsewhere = new Map(); // tabId → domain

// ─── BOOT ───────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  settings = await loadSettings();
  await initI18n(settings.uiLang);

  applyTheme(settings.theme);
  paintChrome();
  applyI18n();
  renderModelChip();
  wireEvents();

  const win = await chrome.windows.getCurrent();
  windowId = win.id;

  const { tab } = await send('GET_ACTIVE_TAB');
  if (tab) await switchToTab(tab);

  renderSetupBanner();
});

function paintChrome() {
  $('brand-mark').innerHTML = ICO('brain', 17);
  $('empty-mark').innerHTML = ICO('messageCircle', 32);
  $('new-chat-btn').innerHTML = ICO('plus', 16);
  $('settings-btn').innerHTML = ICO('settings', 16);
  $('page-chip-mark').innerHTML = ICO('globe', 12);
}

function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

// ─── PROVIDER / MODEL ───────────────────────────

// One control for both service and model: switching from Claude to a local
// model is a single choice, and it applies to this tab's conversation only.
function renderModelChip() {
  const chip = $('model-chip');
  const select = $('model-select');
  const providers = settings.configuredProviders;

  if (providers.length === 0) {
    chip.hidden = true;
    return;
  }
  chip.hidden = false;

  const active = activeChoice();
  const groups = providers.map((provider) => {
    const group = document.createElement('optgroup');
    group.label = provider.name;

    const models = provider.models?.length ? provider.models : [{ id: provider.selectedModel }];
    group.append(...models.filter(m => m.id).map((model) => {
      const option = new Option(model.name || model.id, `${provider.instanceId}::${model.id}`);
      option.selected = provider.instanceId === active.instanceId && model.id === active.model;
      return option;
    }));
    return group;
  });

  select.replaceChildren(...groups);
  select.title = providerNamed(active.instanceId)?.name || '';

  // The service is fixed for as long as a task is running on this tab.
  select.disabled = !!session?.running;
}

/** What this tab is set to: its own choice, else the global default. */
function activeChoice() {
  const pinned = session?.pinned;
  const chosen = session?.choice;
  const fallback = settings.configuredProviders.find(p => p.instanceId === settings.currentProvider)
    || settings.configuredProviders[0];

  if (session?.running && pinned) return pinned;
  if (chosen) return chosen;
  return { instanceId: fallback?.instanceId || '', model: fallback?.selectedModel || '' };
}

function providerNamed(instanceId) {
  return settings.configuredProviders.find(p => p.instanceId === instanceId) || null;
}

function currentProvider() {
  return providerNamed(activeChoice().instanceId);
}

function renderSetupBanner() {
  const banner = $('setup-banner');
  const provider = currentProvider();

  const problem = !provider ? 'errNoProvider'
    : !provider.key && !provider.keyOptional ? 'errNoKey'
    : !provider.selectedModel ? 'errNoModel'
    : null;

  banner.hidden = !problem;
  if (problem) {
    $('setup-banner-text').textContent = t(problem, { provider: provider?.name });
  }
}

// ─── TAB TRACKING ───────────────────────────────

async function switchToTab(tab) {
  activeTab = { id: tab.id, url: tab.url || '', title: tab.title || '' };
  renderPageChip();

  // A different conversation entirely: nothing on screen can be reused.
  rendered = new Map();
  $('messages').replaceChildren();

  const { session: loaded } = await send('GET_SESSION', { tabId: tab.id, url: activeTab.url });
  session = loaded;
  renderSession();
  renderModelChip();
  renderBackgroundTask();
}

function renderPageChip() {
  const chip = $('page-chip');
  if (!activeTab?.url) { chip.hidden = true; return; }
  chip.hidden = false;
  $('page-chip-title').textContent = activeTab.title || domainOf(activeTab.url) || activeTab.url;
  chip.title = activeTab.url;
}

function renderBackgroundTask() {
  const button = $('background-task');
  const others = [...runningElsewhere.entries()].filter(([id]) => id !== activeTab?.id);

  if (others.length === 0) { button.hidden = true; return; }
  const [tabId, domain] = others[0];
  button.hidden = false;
  button.innerHTML = `${ICO('loader', 13)}<span>${escapeHtml(t('backgroundTask', { domain }))}</span>`;
  button.onclick = () => chrome.tabs.update(tabId, { active: true });
}

// ─── RENDERING ──────────────────────────────────

// id → { node, signature }. The transcript is reconciled against this rather
// than rebuilt: a streaming answer broadcasts ~10 times a second, and
// replacing every node that often made each bubble replay its entrance
// animation — which is what the flicker was.
let rendered = new Map();

function renderSession() {
  const container = $('messages');
  const messages = session?.messages || [];

  if (messages.length === 0) {
    rendered = new Map();
    container.replaceChildren(emptyState());
    setComposerState();
    return;
  }

  const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 80;
  container.querySelector('.empty-state')?.remove();

  const seen = new Set();
  let previous = null;

  for (const message of messages) {
    const signature = signatureOf(message);
    let entry = rendered.get(message.id);

    if (entry && entry.signature !== signature) {
      // Streaming text is the common case: rewrite the node instead of
      // swapping it, so nothing is torn down mid-animation.
      if (patchInPlace(entry.node, message)) {
        entry.signature = signature;
      } else {
        const node = renderMessage(message);
        if (node) {
          node.classList.add('no-enter');
          entry.node.replaceWith(node);
          entry = { node, signature };
          rendered.set(message.id, entry);
        }
      }
    } else if (!entry) {
      const node = renderMessage(message);
      if (!node) continue;
      entry = { node, signature };
      rendered.set(message.id, entry);
    }

    seen.add(message.id);

    // Place it only when it is not already in the right slot.
    const expected = previous ? previous.nextElementSibling : container.firstElementChild;
    if (expected !== entry.node) {
      container.insertBefore(entry.node, previous ? previous.nextSibling : container.firstChild);
    }
    previous = entry.node;
  }

  for (const [id, entry] of rendered) {
    if (!seen.has(id)) {
      entry.node.remove();
      rendered.delete(id);
    }
  }

  if (atBottom) container.scrollTop = container.scrollHeight;
  setComposerState();
}

/** What, in a message, changes its rendering. */
function signatureOf(message) {
  switch (message.role) {
    case 'assistant': return `a:${message.streaming ? 1 : 0}:${message.text}`;
    case 'thinking':  return `t:${message.done ? 1 : 0}:${message.text.length}`;
    case 'actions':   return 'c:' + message.items.map(i => `${i.status}|${i.detail || ''}`).join(';');
    case 'notice':    return `n:${message.key}:${session?.awaitingContinue ? 1 : 0}`;
    default:          return message.id;
  }
}

/** Updates a node without replacing it. Returns false when it cannot. */
function patchInPlace(node, message) {
  if (message.role === 'assistant') {
    node.innerHTML = renderMarkdown(message.text || '');
    node.classList.toggle('streaming', !!message.streaming);
    return true;
  }
  if (message.role === 'thinking') {
    const body = node.querySelector('.thinking-body');
    if (!body) return false;
    body.textContent = message.text || '';
    // Only the summary changes shape when the block completes.
    return !message.done || node.dataset.done === '1';
  }
  return false;
}

function emptyState() {
  const section = document.createElement('section');
  section.className = 'empty-state';
  section.innerHTML = `
    <span class="empty-mark">${ICO('messageCircle', 32)}</span>
    <h1 class="empty-title">${escapeHtml(t('emptyTitle'))}</h1>
    <p class="empty-body">${escapeHtml(t('emptyBody'))}</p>`;
  return section;
}

function renderMessage(message) {
  switch (message.role) {
    case 'user':       return userBubble(message);
    case 'assistant':  return assistantBubble(message);
    case 'thinking':   return thinkingBlock(message);
    case 'actions':    return actionCard(message);
    case 'export':     return exportCard(message);
    case 'notice':     return noticeCard(message);
    case 'error':      return errorCard(message);
    case 'navRequest': return null; // shown as a dialog, not in the transcript
    default:           return null;
  }
}

function userBubble(message) {
  const div = document.createElement('div');
  div.className = 'msg msg-user';
  div.textContent = message.text || '';
  return div;
}

function assistantBubble(message) {
  const div = document.createElement('div');
  div.className = 'msg msg-assistant' + (message.streaming ? ' streaming' : '');
  div.innerHTML = renderMarkdown(message.text || '');
  return div;
}

function thinkingBlock(message) {
  const details = document.createElement('details');
  details.className = 'msg thinking';
  details.dataset.done = message.done ? '1' : '0';

  const summary = document.createElement('summary');
  summary.innerHTML = message.done
    ? `${ICO('sparkles', 11)}<span>${escapeHtml(t('thinkingDone'))}</span><span class="thinking-peek"></span>`
    : `<span>${escapeHtml(t('thinkingLabel'))}</span><span class="dots"><span></span><span></span><span></span></span>`;

  // A first line of the reasoning is worth more than a row that says nothing.
  const peek = summary.querySelector('.thinking-peek');
  if (peek) peek.textContent = firstLine(message.text);

  const body = document.createElement('div');
  body.className = 'thinking-body';
  body.textContent = message.text || '';

  details.append(summary, body);
  return details;
}

function firstLine(text) {
  const line = String(text || '').split('\n').find(l => l.trim());
  return line ? line.trim().slice(0, 90) : '';
}

function actionCard(message) {
  const div = document.createElement('div');
  div.className = 'msg actions';

  for (const item of message.items) {
    const tool = getToolByName(item.tool);
    const row = document.createElement('div');
    row.className = 'action';
    row.innerHTML = `
      <span class="action-icon">${toolIconSvg(tool?.icon)}</span>
      <span class="action-label">${escapeHtml(t(tool?.labelKey || item.tool))}</span>
      <span class="action-detail">${escapeHtml(item.detail || '')}</span>
      <span class="action-state ${item.status}">${stepStatusIcon(item.status)}</span>`;
    div.appendChild(row);
  }
  return div;
}

function exportCard(message) {
  const div = document.createElement('div');
  div.className = 'msg export';
  div.innerHTML = `
    <span class="export-icon">${exportIconSvg(message.format)}</span>
    <span>
      <span class="export-name">${escapeHtml(message.filename || '')}</span>
      <span class="export-meta">${escapeHtml((message.format || '').toUpperCase())} · ${escapeHtml(t('fileReady'))}</span>
    </span>`;
  return div;
}

function noticeCard(message) {
  const div = document.createElement('div');
  div.className = 'msg notice';

  const text = document.createElement('span');
  text.textContent = t(noticeKey(message.key), message.params);
  div.appendChild(text);

  if (message.offerContinue && session?.awaitingContinue) {
    const button = document.createElement('button');
    button.className = 'btn btn-secondary btn-sm';
    button.textContent = t('continueBtn');
    button.onclick = () => {
      button.disabled = true;
      send('CONTINUE_TASK', { tabId: activeTab.id });
    };
    div.appendChild(button);
  }
  return div;
}

function errorCard(message) {
  const div = document.createElement('div');
  div.className = 'msg notice notice-error';

  const sentence = t(errorKey(message.key), message.params);
  const line = document.createElement('span');
  line.textContent = sentence;
  div.appendChild(line);

  // A friendly sentence is not enough to diagnose a gateway returning 500.
  // Whatever the provider actually said is kept, one click away.
  const detail = message.params?.detail;
  if (detail && !sentence.includes(detail)) {
    const box = document.createElement('details');
    box.className = 'error-detail';

    const summary = document.createElement('summary');
    summary.textContent = t('errorDetails');

    const body = document.createElement('pre');
    body.textContent = message.params.status
      ? `HTTP ${message.params.status}\n${detail}`
      : detail;

    box.append(summary, body);
    div.appendChild(box);
  }
  return div;
}

// The engine emits bare keys; the panel owns the naming and the language.
function noticeKey(key) {
  const known = [
    'maxIterations', 'pageChanged', 'stoppedPageChanged', 'stoppedByUser',
    'rateLimited', 'providerChanged', 'contextTrimmed', 'resumed',
  ];
  return known.includes(key) ? 'notice' + key[0].toUpperCase() + key.slice(1) : key;
}

function errorKey(key) {
  const known = [
    'noProvider', 'noKey', 'noModel', 'noEndpoint', 'badKey', 'noCredit',
    'badEndpoint', 'badRequest', 'providerDown', 'timeout', 'api',
    'emptyResponse', 'refusal', 'offline', 'unknownProvider', 'contextTooLong',
  ];
  const normalized = key === 'apiError' ? 'api' : key;
  return known.includes(normalized) ? 'err' + normalized[0].toUpperCase() + normalized.slice(1) : 'errApi';
}

function setComposerState() {
  const running = !!session?.running;
  $('send-btn').disabled = running;
  $('stop-btn').hidden = !running;
  $('composer-status').textContent = statusText();
}

function statusText() {
  const status = session?.status;
  if (!status || status.key === 'ready') return '';
  const map = {
    thinking: 'statusThinking', acting: 'statusActing', stopping: 'statusStopping',
    stopped: 'statusStopped', done: 'statusDone', paused: 'statusPaused',
    rateLimitWait: 'statusRateLimitWait', awaitingConfirm: 'statusAwaitingConfirm',
    waitingModel: 'statusWaitingModel', loadingModel: 'statusLoadingModel',
  };
  return map[status.key] ? t(map[status.key], status.params) : '';
}

// ─── MARKDOWN ───────────────────────────────────

function renderMarkdown(text) {
  let html;
  try {
    html = marked.parse(text, { breaks: true, gfm: true });
  } catch {
    return escapeHtml(text).replace(/\n/g, '<br>');
  }
  return sanitize(html);
}

// Model output is not trusted markup. A page can try to steer the model
// through its own text, and marked passes raw HTML straight through — so an
// echoed <img onerror> would run inside the panel, which holds the API keys.
// Everything is rebuilt from an allow-list before it reaches the DOM.
const ALLOWED_TAGS = new Set([
  'P', 'BR', 'HR', 'STRONG', 'EM', 'DEL', 'CODE', 'PRE', 'BLOCKQUOTE',
  'UL', 'OL', 'LI', 'A', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD', 'SPAN',
]);
const ALLOWED_ATTRS = { A: ['href', 'title'] };
const SAFE_URL = /^(https?:|mailto:)/i;

function sanitize(html) {
  const template = document.createElement('template');
  template.innerHTML = html;

  const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_ELEMENT);
  const doomed = [];

  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!ALLOWED_TAGS.has(node.tagName)) { doomed.push(node); continue; }

    const allowed = ALLOWED_ATTRS[node.tagName] || [];
    for (const attr of [...node.attributes]) {
      if (!allowed.includes(attr.name.toLowerCase())) node.removeAttribute(attr.name);
    }
    if (node.tagName === 'A') {
      if (!SAFE_URL.test(node.getAttribute('href') || '')) node.removeAttribute('href');
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
    }
  }

  // Unwrap rather than delete, so the text of a stripped tag is still readable.
  for (const node of doomed) node.replaceWith(...node.childNodes);

  return template.innerHTML;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── EVENTS ─────────────────────────────────────

function wireEvents() {
  const prompt = $('prompt');

  prompt.addEventListener('input', () => {
    prompt.style.height = 'auto';
    prompt.style.height = Math.min(prompt.scrollHeight, 160) + 'px';
  });
  prompt.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  });

  $('send-btn').addEventListener('click', submit);
  $('stop-btn').addEventListener('click', () => send('STOP_TASK', { tabId: activeTab?.id }));

  $('new-chat-btn').addEventListener('click', async () => {
    if (!activeTab) return;
    await send('CLEAR_TASK', { tabId: activeTab.id });
    session = null;
    renderSession();
  });

  $('settings-btn').addEventListener('click', () => chrome.runtime.openOptionsPage());
  $('setup-banner-btn').addEventListener('click', () => chrome.runtime.openOptionsPage());

  $('model-select').addEventListener('change', async (e) => {
    const [instanceId, model] = e.target.value.split('::');
    if (!instanceId || !activeTab) return;
    await send('SET_SESSION_PROVIDER', { tabId: activeTab.id, instanceId, model });
  });

  chrome.runtime.onMessage.addListener(onBackgroundMessage);

  chrome.storage.onChanged.addListener(async (changes, area) => {
    if (area !== 'local') return;
    const watched = ['configuredProviders', 'currentProvider', 'theme', 'uiLang'];
    if (!watched.some(k => k in changes)) return;

    settings = await loadSettings();
    if ('uiLang' in changes) { await initI18n(settings.uiLang); applyI18n(); }
    applyTheme(settings.theme);
    renderModelChip();
    renderSetupBanner();
    renderSession();
  });
}

function onBackgroundMessage(message) {
  switch (message.type) {
    case 'SESSION': {
      const incoming = message.session;
      trackRunning(incoming);
      if (incoming.tabId === activeTab?.id) {
        session = incoming;
        renderSession();
        renderModelChip();
      }
      renderBackgroundTask();
      break;
    }

    case 'TAB_ACTIVATED':
      if (message.windowId === windowId) {
        switchToTab({ id: message.tabId, url: message.url, title: message.title });
      }
      break;

    case 'TAB_UPDATED':
      if (message.tabId === activeTab?.id) {
        activeTab.url = message.url;
        activeTab.title = message.title;
        renderPageChip();
      }
      break;

    case 'TAB_CLOSED':
      runningElsewhere.delete(message.tabId);
      renderBackgroundTask();
      break;

    default:
      break;
  }
}

function trackRunning(incoming) {
  if (incoming.running) runningElsewhere.set(incoming.tabId, domainOf(incoming.url));
  else runningElsewhere.delete(incoming.tabId);
}

// ─── SEND ───────────────────────────────────────

async function submit() {
  const prompt = $('prompt');
  const text = prompt.value.trim();
  if (!text || !activeTab || session?.running) return;

  if (!navigator.onLine) {
    showTransientError('offline');
    return;
  }
  if (!currentProvider()) {
    chrome.runtime.openOptionsPage();
    return;
  }

  prompt.value = '';
  prompt.style.height = 'auto';

  const response = await send('START_TASK', {
    tabId: activeTab.id,
    prompt: text,
    url: activeTab.url,
    title: activeTab.title,
  });
  if (response?.error === 'already_running') prompt.value = text;
}

function showTransientError(key) {
  const container = $('messages');
  $('empty-state')?.remove();
  const div = document.createElement('div');
  div.className = 'msg notice notice-error';
  div.textContent = t(errorKey(key));
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

async function send(type, payload = {}) {
  try {
    return await chrome.runtime.sendMessage({ type, ...payload });
  } catch (e) {
    console.warn('BrowserMind: message failed', type, e.message);
    return null;
  }
}

// ─── NAVIGATION DIALOG ──────────────────────────

// Each broadcast carries a fresh copy of the transcript, so "already answered"
// has to be remembered here rather than flagged on the message object.
const answeredNav = new Set();
let navOpen = null;

chrome.runtime.onMessage.addListener((message) => {
  if (message.type !== 'SESSION') return;
  if (message.session.tabId !== activeTab?.id) return;

  const request = message.session.messages?.filter(m => m.role === 'navRequest').at(-1);
  if (request && !answeredNav.has(request.requestId)) askNavigation(request);
});

function askNavigation(request) {
  if (navOpen === request.requestId) return;
  navOpen = request.requestId;

  const dialog = $('nav-dialog');
  $('nav-dialog-body').textContent = t('navBody', { domain: request.domain });
  $('nav-always').checked = false;
  dialog.showModal();

  const answer = async (allowed) => {
    if (navOpen !== request.requestId) return;
    if ($('nav-always').checked && allowed) await saveSettings({ navAlwaysAllow: true });

    answeredNav.add(request.requestId);
    navOpen = null;
    dialog.close();
    await send('NAV_CONFIRM_RESPONSE', { requestId: request.requestId, allowed });
  };

  $('nav-allow').onclick = () => answer(true);
  $('nav-cancel').onclick = () => answer(false);
  dialog.oncancel = (e) => { e.preventDefault(); answer(false); };
}

// ─── UTILS ──────────────────────────────────────

function domainOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}
