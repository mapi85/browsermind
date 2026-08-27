// ═══════════════════════════════════════════════
//  BrowserMind — Background service worker
//
//  Owns everything that touches Chrome: tab lifecycle, script injection,
//  downloads and outbound HTTP. The agent loop itself lives in
//  background/engine.js and reaches the browser only through executeTool().
// ═══════════════════════════════════════════════

import { migrateStorage } from './shared/settings.js';
import { fetchProviderModels, testProvider, mergeModelLists } from './shared/providers.js';
import {
  initEngine, startTask, continueTask, stopTask, clearTask,
  getSession, respondNavConfirm, retireSession, notifyTabNavigated,
  setSessionProvider,
} from './background/engine.js';

// ─── LIFECYCLE ──────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
  const { removed } = await migrateStorage();
  if (removed.length > 0) console.info('BrowserMind: removed retired settings', removed);
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch(e => console.warn('BrowserMind: setPanelBehavior failed', e.message));

// ─── KEEP-ALIVE ─────────────────────────────────
// MV3 kills an idle worker after ~30s, which would abandon a running task
// mid-flight. The alarm only exists while a task is actually running: a
// permanent heartbeat drains battery and reads badly in review.
// 30s is the platform minimum — anything lower is silently clamped.

const KEEPALIVE = 'bm-keepalive';
let keepAliveHolders = 0;

async function acquireKeepAlive() {
  keepAliveHolders++;
  if (keepAliveHolders === 1) {
    await chrome.alarms.create(KEEPALIVE, { periodInMinutes: 0.5 });
  }
}

async function releaseKeepAlive() {
  keepAliveHolders = Math.max(0, keepAliveHolders - 1);
  if (keepAliveHolders === 0) {
    await chrome.alarms.clear(KEEPALIVE);
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === KEEPALIVE) {
    // Touching storage resets the worker's idle timer.
    chrome.storage.local.get('__bm_ping__', () => {});
  }
});

// ─── TAB TRACKING ───────────────────────────────
// The engine needs to know which page a tab is actually on: the navigation
// guard compares domains, and a task must not keep acting on a page the user
// navigated away from underneath it.

const tabUrls = new Map();

async function primeTabUrls() {
  try {
    const tabs = await chrome.tabs.query({});
    for (const tab of tabs) if (tab.id != null) tabUrls.set(tab.id, tab.url || '');
  } catch { /* nothing to prime */ }
}
primeTabUrls();

function broadcastToPanel(message) {
  chrome.runtime.sendMessage(message).catch(() => {
    // No panel open. Not an error: state is replayed when one opens.
  });
}

chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    tabUrls.set(tabId, tab.url || '');
    broadcastToPanel({ type: 'TAB_ACTIVATED', tabId, windowId, url: tab.url, title: tab.title });
  } catch { /* tab vanished between event and lookup */ }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url && changeInfo.status !== 'complete') return;

  const previous = tabUrls.get(tabId) || '';
  const current = tab.url || '';
  tabUrls.set(tabId, current);

  if (changeInfo.url && previous && previous !== current) {
    notifyTabNavigated(tabId, current);
  }
  if (changeInfo.status === 'complete') {
    broadcastToPanel({
      type: 'TAB_UPDATED', tabId, windowId: tab.windowId, url: current, title: tab.title,
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  tabUrls.delete(tabId);
  // The task stops, the conversation is set aside: a tab reopened on the
  // same page picks it back up.
  retireSession(tabId);
  broadcastToPanel({ type: 'TAB_CLOSED', tabId });
});

// ─── MESSAGE HUB ────────────────────────────────

const HANDLERS = {
  GET_ACTIVE_TAB: async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return { tab: tab ? { id: tab.id, url: tab.url, title: tab.title, windowId: tab.windowId } : null };
  },

  GET_WINDOW_TABS: async () => {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    return { tabs: tabs.map(t => ({ id: t.id, url: t.url, title: t.title, active: t.active })) };
  },

  FETCH_MODELS: async ({ typeId, apiKey, baseUrl }) => {
    const models = await fetchProviderModels(typeId, apiKey, baseUrl);
    return { models: mergeModelLists(typeId, models) };
  },

  TEST_PROVIDER: ({ typeId, apiKey, baseUrl, probeModel, mode }) =>
    testProvider(typeId, apiKey, baseUrl, probeModel, mode),

  START_TASK: (msg) => startTask(msg),
  CONTINUE_TASK: ({ tabId }) => continueTask(tabId),
  STOP_TASK: ({ tabId }) => stopTask(tabId),
  CLEAR_TASK: ({ tabId }) => clearTask(tabId),
  GET_SESSION: ({ tabId, url }) => getSession(tabId, url),
  SET_SESSION_PROVIDER: ({ tabId, instanceId, model }) => setSessionProvider(tabId, { instanceId, model }),
  NAV_CONFIRM_RESPONSE: ({ requestId, allowed }) => respondNavConfirm(requestId, allowed),

  EXECUTE_TOOL: async ({ tool, input, tabId }) => ({ result: await executeTool(tool, input, tabId) }),
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handler = HANDLERS[message?.type];
  if (!handler) return false;

  Promise.resolve(handler(message))
    .then(sendResponse)
    .catch(err => sendResponse({ error: err.message, code: err.code }));
  return true; // async response
});

// ─── ENGINE WIRING ──────────────────────────────

initEngine({
  executeTool: (tool, input, tabId) => executeTool(tool, input, tabId),
  getTabUrl: (tabId) => tabUrls.get(tabId) || '',
  acquireKeepAlive,
  releaseKeepAlive,
  broadcast: broadcastToPanel,
});

// ═══════════════════════════════════════════════
//  PAGE SNAPSHOT
//
//  The model cannot verify a CSS selector it invented, so it is never asked
//  to. read_page numbers every interactive element and stamps that number on
//  the node as data-bm-idx; actions then address elements by number. Stale
//  numbers simply fail to resolve, which tells the model to read again.
// ═══════════════════════════════════════════════

const SNAPSHOT_ATTR = 'data-bm-idx';

/* eslint-disable no-undef -- the functions below run in the page, not here */

function pageSnapshot(attr, includeText, textLimit) {
  const SELECTOR = [
    'a[href]', 'button', 'input', 'select', 'textarea', 'summary',
    '[role="button"]', '[role="link"]', '[role="checkbox"]', '[role="radio"]',
    '[role="tab"]', '[role="menuitem"]', '[role="switch"]', '[role="option"]',
    '[contenteditable=""]', '[contenteditable="true"]', '[onclick]',
  ].join(',');

  for (const stale of document.querySelectorAll('[' + attr + ']')) {
    stale.removeAttribute(attr);
  }

  const isVisible = (el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return false;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none') return false;
    if (Number(style.opacity) === 0) return false;
    return true;
  };

  const labelFor = (el) => {
    const aria = el.getAttribute('aria-label');
    if (aria) return aria.trim();

    if (el.id) {
      const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (label?.textContent.trim()) return label.textContent.trim();
    }
    const wrapping = el.closest('label');
    if (wrapping?.textContent.trim()) return wrapping.textContent.trim();

    const own = (el.textContent || '').replace(/\s+/g, ' ').trim();
    if (own) return own;

    return el.getAttribute('placeholder')
      || el.getAttribute('title')
      || el.getAttribute('name')
      || el.value
      || '';
  };

  const elements = [];
  let index = 0;

  for (const el of document.querySelectorAll(SELECTOR)) {
    if (elements.length >= 300) break;
    if (el.disabled) continue;
    if (el.type === 'hidden') continue;
    if (!isVisible(el)) continue;

    // Skip a wrapper whose only purpose is to contain another candidate:
    // clicking the inner control is what the user would do.
    if (el.querySelector(SELECTOR) && !['A', 'BUTTON'].includes(el.tagName)) continue;

    el.setAttribute(attr, String(index));
    const rect = el.getBoundingClientRect();

    const entry = {
      i: index,
      tag: el.tagName.toLowerCase(),
      label: labelFor(el).slice(0, 120),
      inView: rect.top < innerHeight && rect.bottom > 0,
    };
    if (el.type) entry.type = el.type;
    const role = el.getAttribute('role');
    if (role) entry.role = role;
    if (el.tagName === 'A' && el.href) entry.href = el.href.slice(0, 200);
    if (el.type === 'checkbox' || el.type === 'radio') entry.checked = !!el.checked;
    if (('value' in el) && el.value && el.type !== 'password') {
      entry.value = String(el.value).slice(0, 60);
    }
    if (el.tagName === 'SELECT') {
      entry.options = Array.from(el.options).slice(0, 25).map(o => o.text.trim().slice(0, 40));
    }

    elements.push(entry);
    index++;
  }

  const result = {
    url: location.href,
    title: document.title,
    scroll: { y: Math.round(scrollY), height: Math.round(document.body.scrollHeight), viewport: innerHeight },
    elements,
  };

  if (includeText) {
    result.text = (document.body.innerText || '')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      .slice(0, textLimit);
  }
  return result;
}

function pageAct(attr, action) {
  const resolve = () => {
    if (action.element !== undefined && action.element !== null) {
      return document.querySelector(`[${attr}="${Number(action.element)}"]`);
    }
    if (action.selector) return document.querySelector(action.selector);
    return null;
  };

  const describe = (el) => ({
    tag: el.tagName.toLowerCase(),
    label: (el.getAttribute('aria-label') || el.textContent || el.value || '')
      .replace(/\s+/g, ' ').trim().slice(0, 60),
  });

  const setNativeValue = (el, value) => {
    const proto = el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const missing = () => ({
    error: action.element !== undefined
      ? `No element numbered ${action.element} on this page. Call read_page again — the page has changed.`
      : `No element matched "${action.selector}".`,
  });

  const highlight = (el) => {
    if (typeof window.__bmHighlight === 'function') {
      try { window.__bmHighlight(el); } catch { /* cosmetic only */ }
    }
  };

  try {
    switch (action.kind) {
      case 'click': {
        const el = resolve();
        if (!el) return missing();
        el.scrollIntoView({ block: 'center', inline: 'nearest' });
        highlight(el);
        el.focus?.({ preventScroll: true });
        el.click();
        return { success: true, clicked: describe(el), url: location.href };
      }

      case 'type': {
        const el = resolve();
        if (!el) return missing();
        el.scrollIntoView({ block: 'center', inline: 'nearest' });
        highlight(el);
        el.focus?.({ preventScroll: true });

        if (el.isContentEditable) {
          if (action.clear_first !== false) el.textContent = '';
          el.textContent += action.text;
          el.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          setNativeValue(el, action.clear_first === false ? (el.value || '') + action.text : action.text);
        }

        if (action.submit) {
          // Enter first, because search boxes and comboboxes usually listen
          // for the key rather than for a form submit. requestSubmit() only
          // runs if the field really belongs to a form and nothing handled
          // the key, and unlike form.submit() it still fires validation and
          // the site's own submit handler.
          const enter = { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 };
          const notCancelled = el.dispatchEvent(new KeyboardEvent('keydown', enter));
          el.dispatchEvent(new KeyboardEvent('keyup', enter));
          if (notCancelled && el.form?.requestSubmit) el.form.requestSubmit();
        }
        return { success: true, typedInto: describe(el), url: location.href };
      }

      case 'fill': {
        const results = [];
        for (const field of action.fields) {
          const el = field.element !== undefined && field.element !== null
            ? document.querySelector(`[${attr}="${Number(field.element)}"]`)
            : (field.selector ? document.querySelector(field.selector) : null);

          if (!el) {
            results.push({ field: field.element ?? field.selector, error: 'not found' });
            continue;
          }
          highlight(el);

          if (el.tagName === 'SELECT') {
            const wanted = String(field.value).toLowerCase();
            const option = Array.from(el.options).find(o =>
              o.value.toLowerCase() === wanted || o.text.trim().toLowerCase().includes(wanted));
            if (option) {
              el.value = option.value;
              el.dispatchEvent(new Event('change', { bubbles: true }));
              results.push({ field: field.element ?? field.selector, success: true, selected: option.text.trim() });
            } else {
              results.push({ field: field.element ?? field.selector, error: `no option matching "${field.value}"` });
            }
          } else if (el.type === 'checkbox' || el.type === 'radio') {
            const want = field.value === true || String(field.value).toLowerCase() === 'true';
            if (el.checked !== want) el.click();
            results.push({ field: field.element ?? field.selector, success: true, checked: el.checked });
          } else {
            setNativeValue(el, String(field.value));
            results.push({ field: field.element ?? field.selector, success: true });
          }
        }

        let submitted = false;
        if (action.submit) {
          const form = document.querySelector('form');
          const button = document.querySelector('form [type="submit"], form button:not([type="button"])');
          if (button) { button.click(); submitted = true; }
          else if (form?.requestSubmit) { form.requestSubmit(); submitted = true; }
        }
        return { success: true, results, submitted, url: location.href };
      }

      case 'scroll': {
        const step = action.amount || Math.round(innerHeight * 0.85);
        const target = {
          down: scrollY + step,
          up: scrollY - step,
          top: 0,
          bottom: document.body.scrollHeight,
        }[action.direction] ?? scrollY + step;

        scrollTo({ top: target, behavior: 'instant' });
        return {
          success: true,
          scrollY: Math.round(scrollY),
          atBottom: scrollY + innerHeight >= document.body.scrollHeight - 4,
        };
      }

      case 'extract': {
        const root = action.selector ? document.querySelector(action.selector) : document;
        if (!root) return { error: `No element matched "${action.selector}".` };

        if (action.data_type === 'table') {
          const tables = Array.from(root.querySelectorAll('table')).map(t => ({
            headers: Array.from(t.querySelectorAll('th')).map(th => th.textContent.trim()),
            rows: Array.from(t.querySelectorAll('tbody tr, tr')).slice(0, 500)
              .map(tr => Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim()))
              .filter(r => r.length > 0),
          }));
          return { data: tables, count: tables.length };
        }
        if (action.data_type === 'links') {
          const links = Array.from(root.querySelectorAll('a[href]')).slice(0, 300)
            .map(a => ({ text: a.textContent.replace(/\s+/g, ' ').trim(), href: a.href }))
            .filter(l => l.text);
          return { data: links, count: links.length };
        }
        if (action.data_type === 'list') {
          const items = Array.from(root.querySelectorAll('li')).slice(0, 500)
            .map(li => li.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
          return { data: items, count: items.length };
        }
        if (action.data_type === 'images') {
          const images = Array.from(root.querySelectorAll('img')).slice(0, 200)
            .map(img => ({ src: img.src, alt: img.alt })).filter(i => i.src);
          return { data: images, count: images.length };
        }
        return { data: (root.innerText || '').replace(/\n{3,}/g, '\n\n').trim().slice(0, 12000) };
      }

      case 'waitFor':
        return { found: !!document.querySelector(action.selector) };

      default:
        return { error: `Unknown page action: ${action.kind}` };
    }
  } catch (e) {
    return { error: e.message };
  }
}

/* eslint-enable no-undef */

// ─── INJECTION HELPERS ──────────────────────────

const RESTRICTED = /^(chrome|edge|about|devtools|view-source|chrome-extension):|^https:\/\/chromewebstore\.google\.com/;

function guardTab(tab) {
  if (!tab?.url) return;
  if (RESTRICTED.test(tab.url)) {
    throw new Error('This page is protected by Chrome and cannot be read or acted on. Ask the user to switch to a normal web page.');
  }
}

async function inPage(tabId, fn, args) {
  const tab = await chrome.tabs.get(tabId);
  guardTab(tab);

  const [frame] = await chrome.scripting.executeScript({
    target: { tabId }, func: fn, args,
  });
  const result = frame?.result;
  if (result?.error) throw new Error(result.error);
  return result ?? { success: true };
}

// The highlight overlay is injected on demand rather than declared as a
// content script, so the extension does not run on every page the user visits.
async function ensureOverlay(tabId) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['src/content.js'] });
  } catch { /* restricted page: the action itself reports the real error */ }
}

async function highlightEnabled() {
  const { highlightActions } = await chrome.storage.local.get('highlightActions');
  return highlightActions !== false;
}

// ─── SNAPSHOT FORMATTING ────────────────────────
// A numbered plain-text list costs roughly a third of the equivalent JSON and
// is what the model reads most reliably.

function formatSnapshot(snap, limit = Infinity) {
  const shown = snap.elements.slice(0, limit);
  const lines = shown.map((el) => {
    const bits = [`[${el.i}]`, `<${el.tag}${el.type ? ' ' + el.type : ''}>`];
    if (el.role) bits.push(`role=${el.role}`);
    if (el.label) bits.push(`"${el.label}"`);
    if (el.value) bits.push(`value="${el.value}"`);
    if (el.checked !== undefined) bits.push(el.checked ? '[checked]' : '[unchecked]');
    if (el.options) bits.push(`options: ${el.options.join(' | ')}`);
    if (!el.inView) bits.push('(off-screen)');
    return bits.join(' ');
  });

  const scrolled = snap.scroll.height > snap.scroll.viewport + 8
    ? `\nScroll: ${Math.round((snap.scroll.y / Math.max(1, snap.scroll.height - snap.scroll.viewport)) * 100)}% of the page`
    : '';

  const hidden = snap.elements.length - shown.length;
  if (hidden > 0) {
    lines.push(`… ${hidden} more elements. Call read_page for the full list.`);
  }

  return {
    url: snap.url,
    title: snap.title,
    elements: lines.join('\n') || '(no interactive element found)',
    text: snap.text,
    hint: `Address elements by their number, e.g. click {"element": 0}.${scrolled}`,
  };
}

// A dense page carries hundreds of controls. The full list is worth its tokens
// when the agent asks to read the page; repeating it after every single click
// is what fills a context window in a dozen steps.
const POST_ACTION_ELEMENTS = 80;

// ═══════════════════════════════════════════════
//  TOOL EXECUTOR
// ═══════════════════════════════════════════════

const PAGE_TOOLS = new Set(['read_page', 'click', 'type_text', 'fill_form', 'scroll', 'extract_data']);

async function executeTool(toolName, input = {}, tabId) {
  let targetTabId = tabId;
  if (!targetTabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    targetTabId = tab?.id;
  }
  if (!targetTabId) throw new Error('No active tab.');

  if (PAGE_TOOLS.has(toolName) && await highlightEnabled()) {
    await ensureOverlay(targetTabId);
  }

  switch (toolName) {
    case 'read_page':         return readPage(targetTabId, input);
    case 'click':             return actOnPage(targetTabId, { kind: 'click', ...input });
    case 'type_text':         return actOnPage(targetTabId, { kind: 'type', ...input });
    case 'fill_form':         return actOnPage(targetTabId, { kind: 'fill', ...input });
    case 'scroll':            return actOnPage(targetTabId, { kind: 'scroll', ...input });
    case 'extract_data':      return actOnPage(targetTabId, { kind: 'extract', ...input });
    case 'navigate':          return navigateTab(targetTabId, input);
    case 'new_tab':           return openTab(input);
    case 'wait':              return waitFor(targetTabId, input);
    case 'take_screenshot':   return screenshot(targetTabId, input);
    case 'generate_document': return generateDocument(targetTabId, input);
    case 'download_file':     return downloadFile(input);
    case 'web_search':        return webSearch(input);
    case 'api_call':          return callApi(input);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

async function readPage(tabId, { include_text = true } = {}) {
  const snap = await inPage(tabId, pageSnapshot, [SNAPSHOT_ATTR, include_text !== false, 8000]);
  return formatSnapshot(snap);
}

// After an action the page usually changes. Re-reading the element list here
// saves the model a whole extra round trip, and the numbers it gets back are
// guaranteed to match the page it is about to act on.
async function actOnPage(tabId, action) {
  const result = await inPage(tabId, pageAct, [SNAPSHOT_ATTR, action]);

  const mutating = ['click', 'type', 'fill', 'scroll'].includes(action.kind);
  if (!mutating || result?.error) return result;

  await settle(tabId);
  try {
    const snap = await inPage(tabId, pageSnapshot, [SNAPSHOT_ATTR, false, 0]);
    return { ...result, page: formatSnapshot(snap, POST_ACTION_ELEMENTS) };
  } catch {
    return result; // navigated away mid-action; the next read_page will catch up
  }
}

// Waits for the page to stop moving: either the navigation completes or the
// DOM settles. Bounded so a busy page cannot stall the loop.
function settle(tabId, timeout = 1200) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      chrome.tabs.onUpdated.removeListener(onUpdate);
      resolve();
    };
    const onUpdate = (id, info) => { if (id === tabId && info.status === 'complete') finish(); };
    chrome.tabs.onUpdated.addListener(onUpdate);
    setTimeout(finish, timeout);
  });
}

async function navigateTab(tabId, { url }) {
  const target = normalizeUrl(url);
  await chrome.tabs.update(tabId, { url: target });
  await waitForLoad(tabId);
  const tab = await chrome.tabs.get(tabId);
  return { success: true, url: tab.url || target, title: tab.title };
}

async function openTab({ url, active = false }) {
  const target = normalizeUrl(url);
  const tab = await chrome.tabs.create({ url: target, active });
  await waitForLoad(tab.id);
  const loaded = await chrome.tabs.get(tab.id);
  return { success: true, tabId: tab.id, url: loaded.url || target, title: loaded.title };
}

function normalizeUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) throw new Error('A URL is required.');
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const parsed = new URL(withScheme); // throws on garbage, which is the point
  if (!/^https?:$/.test(parsed.protocol)) throw new Error('Only http and https URLs can be opened.');
  return parsed.toString();
}

function waitForLoad(tabId, timeout = 15000) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      chrome.tabs.onUpdated.removeListener(onUpdate);
      resolve();
    };
    const onUpdate = (id, info) => { if (id === tabId && info.status === 'complete') finish(); };
    chrome.tabs.onUpdated.addListener(onUpdate);
    setTimeout(finish, timeout);
  });
}

async function waitFor(tabId, { selector, milliseconds }) {
  if (selector) {
    for (let i = 0; i < 20; i++) {
      const { found } = await inPage(tabId, pageAct, [SNAPSHOT_ATTR, { kind: 'waitFor', selector }]);
      if (found) return { found: true, waitedMs: i * 500 };
      await sleep(500);
    }
    return { found: false, timedOut: true };
  }
  const ms = Math.min(Math.max(Number(milliseconds) || 0, 0), 10000);
  await sleep(ms);
  return { success: true, waitedMs: ms };
}

// ─── SCREENSHOT (vision) ────────────────────────

async function screenshot(tabId, { save = false } = {}) {
  const tab = await chrome.tabs.get(tabId);
  guardTab(tab);

  // captureVisibleTab photographs whatever is on screen in that window, not
  // the tab it is handed. With the user on another tab, that silently returns
  // a picture of a completely different page — and the agent then reasons
  // about it as if it were the page it is working on.
  if (!tab.active) {
    return {
      error: 'This tab is not the one currently on screen, and only the visible tab can be '
        + 'captured. Use read_page instead, or ask the user to switch back to this tab.',
    };
  }

  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
  const downscaled = await downscalePng(dataUrl, 1024);

  let filename;
  if (save) {
    filename = timestamped(hostnameOf(tab.url) || 'screenshot', 'png');
    await chrome.downloads.download({ url: dataUrl, filename, conflictAction: 'uniquify' });
  }

  // The base64 payload is handed to the model as an image block, so a
  // screenshot is something the agent can actually look at rather than a file
  // it drops blindly on disk.
  return {
    success: true,
    url: tab.url,
    saved: filename || false,
    image: downscaled.replace(/^data:image\/png;base64,/, ''),
  };
}

// Full-resolution captures are enormous in tokens. Cap the long edge; fall
// back to the original if the worker has no canvas.
async function downscalePng(dataUrl, maxWidth) {
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const bitmap = await createImageBitmap(blob);
    if (bitmap.width <= maxWidth) return dataUrl;

    const scale = maxWidth / bitmap.width;
    const canvas = new OffscreenCanvas(maxWidth, Math.round(bitmap.height * scale));
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const out = await canvas.convertToBlob({ type: 'image/png' });
    const buffer = new Uint8Array(await out.arrayBuffer());
    let binary = '';
    for (const byte of buffer) binary += String.fromCharCode(byte);
    return `data:image/png;base64,${btoa(binary)}`;
  } catch {
    return dataUrl;
  }
}

// ─── DOCUMENTS ──────────────────────────────────

const MIME = {
  csv: 'text/csv', html: 'text/html', json: 'application/json',
  md: 'text/markdown', txt: 'text/plain',
};

async function generateDocument(tabId, { format = 'txt', content = '', filename }) {
  const ext = MIME[format] ? format : 'txt';
  const body = String(content).replace(/\\n/g, '\n').replace(/\\t/g, '\t');

  let base = String(filename || '').replace(/\.[^.]+$/, '');
  if (!base || /^export$/i.test(base)) {
    const tab = await chrome.tabs.get(tabId).catch(() => null);
    base = slug(tab?.title) || 'browsermind';
  }

  const name = timestamped(slug(base) || 'document', ext);
  const url = `data:${MIME[ext]};charset=utf-8,${encodeURIComponent(body)}`;

  // Downloaded straight from the worker. The previous version injected a
  // script into the page to build the URL, which meant no export was possible
  // from a PDF viewer, a Chrome page, or any tab that refused injection.
  const downloadId = await chrome.downloads.download({ url, filename: name, conflictAction: 'uniquify' });
  return { success: true, format: ext, filename: name, downloadId, bytes: body.length };
}

async function downloadFile({ url, filename }) {
  const target = normalizeUrl(url);
  const downloadId = await chrome.downloads.download({
    url: target,
    filename: filename ? slug(filename.replace(/\.[^.]+$/, '')) + extensionOf(filename, target) : undefined,
    conflictAction: 'uniquify',
  });
  return { success: true, downloadId, url: target };
}

function extensionOf(filename, url) {
  const fromName = /\.[a-z0-9]{1,6}$/i.exec(filename || '');
  if (fromName) return fromName[0];
  const fromUrl = /\.[a-z0-9]{1,6}(?=$|\?)/i.exec(url || '');
  return fromUrl ? fromUrl[0] : '';
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

function timestamped(base, ext) {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  return `${base}_${date}_${time}.${ext}`;
}

function hostnameOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

// ═══════════════════════════════════════════════
//  WEB SEARCH
//
//  Runs a real search in a background tab and reads the results page.
//  The previous implementation called DuckDuckGo's Instant Answer API, which
//  only answers encyclopedic lookups: for an ordinary query it returned an
//  empty list and the agent concluded the web had nothing to say.
// ═══════════════════════════════════════════════

async function webSearch({ query, max_results = 6 }) {
  const q = String(query || '').trim();
  if (!q) throw new Error('A search query is required.');
  const limit = Math.min(Math.max(Number(max_results) || 6, 1), 10);

  const tab = await chrome.tabs.create({
    url: `https://duckduckgo.com/?q=${encodeURIComponent(q)}&kl=wt-wt`,
    active: false,
  });

  try {
    await waitForLoad(tab.id);
    await sleep(400); // results render just after load
    const [frame] = await chrome.scripting.executeScript({
      target: { tabId: tab.id }, func: scrapeResults, args: [limit],
    });
    const results = frame?.result || [];
    return { query: q, count: results.length, results };
  } finally {
    await chrome.tabs.remove(tab.id).catch(() => {});
  }
}

/* eslint-disable no-undef -- runs in the results page */
function scrapeResults(limit) {
  const seen = new Set();
  const out = [];

  const push = (title, href, snippet) => {
    if (out.length >= limit) return;
    if (!href || !title) return;
    let host;
    try { host = new URL(href).hostname; } catch { return; }
    if (/duckduckgo\.com$/.test(host)) return;
    if (seen.has(href)) return;
    seen.add(href);
    out.push({
      title: title.replace(/\s+/g, ' ').trim().slice(0, 160),
      url: href,
      snippet: (snippet || '').replace(/\s+/g, ' ').trim().slice(0, 300),
    });
  };

  for (const article of document.querySelectorAll('article[data-testid="result"], article[data-nrn="result"]')) {
    const link = article.querySelector('a[data-testid="result-title-a"], h2 a');
    const snippet = article.querySelector('[data-result="snippet"], [data-testid="result-snippet"]');
    if (link) push(link.textContent, link.href, snippet?.textContent);
  }

  if (out.length === 0) {
    // Layout changed or the lite page was served: fall back to plain links.
    for (const link of document.querySelectorAll('#links a.result__a, .result__title a, h2 a[href^="http"]')) {
      push(link.textContent, link.href, link.closest('.result')?.querySelector('.result__snippet')?.textContent);
    }
  }
  return out;
}
/* eslint-enable no-undef */

// ═══════════════════════════════════════════════
//  STRUCTURED DATA APIS
//  Two APIs that return values browsing cannot produce reliably. Everything
//  else the agent can simply read on the web.
// ═══════════════════════════════════════════════

const API_REGISTRY = {
  nominatim: {
    name: 'Nominatim (OpenStreetMap)',
    baseUrl: 'https://nominatim.openstreetmap.org',
    defaultParams: { format: 'json', addressdetails: 1, limit: 5 },
    headers: { 'User-Agent': 'BrowserMind browser extension' },
  },
  open_meteo: {
    name: 'Open-Meteo',
    baseUrl: 'https://api.open-meteo.com/v1',
    defaultParams: {},
    headers: {},
  },
};

async function callApi({ api, endpoint = '', params = {} }) {
  const def = API_REGISTRY[api];
  if (!def) {
    throw new Error(`Unknown API "${api}". Available: ${Object.keys(API_REGISTRY).join(', ')}`);
  }

  const path = endpoint.startsWith('/') ? endpoint : (endpoint ? `/${endpoint}` : '');
  const url = new URL(def.baseUrl + path);
  for (const [key, value] of Object.entries({ ...def.defaultParams, ...params })) {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), { headers: { Accept: 'application/json', ...def.headers } });
  if (!res.ok) throw new Error(`${def.name}: HTTP ${res.status}`);

  const type = res.headers.get('content-type') || '';
  const data = type.includes('json') ? await res.json() : await res.text();
  return { api, source: def.name, data };
}

// ─── UTILS ──────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
