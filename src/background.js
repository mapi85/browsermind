// ═══════════════════════════════════════════════
//  BrowserMind v1.0.0 — Background Service Worker
// ═══════════════════════════════════════════════

import { fetchProviderModels } from './shared/providers.js';
import {
  initEngine, startTask, continueTask, stopTask, clearTask,
  getTaskState, respondNavConfirm,
} from './background/engine.js';

// ─── KEEP-ALIVE SERVICE WORKER (MV3) ────────────
// In Manifest V3, the Service Worker is terminated after ~30s of inactivity.
// If an API call is in flight (e.g. 30-60s), the response could be lost.
// Using chrome.alarms is a standard and reliable method to keep the SW active.
chrome.alarms.create('keepAlive', { periodInMinutes: 0.4 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    // Silent heartbeat - keeps the Service Worker awake
    chrome.storage.local.get('__sw_ping__', () => {});
  }
});

// Open side panel on icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// ─── TAB CHANGE DETECTION ───────────────────────
// Notify sidepanel when user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    // Broadcast to sidepanel
    chrome.runtime.sendMessage({
      type: 'TAB_CHANGED',
      tabId: activeInfo.tabId,
      url: tab.url,
      title: tab.title
    }).catch(e => { console.warn('BrowserMind: TAB_CHANGED send failed', e.message); });
  } catch (e) {}
});

// Also notify when a tab's URL changes (navigation within tab)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.runtime.sendMessage({
      type: 'TAB_UPDATED',
      tabId,
      url: tab.url,
      title: tab.title
    }).catch(e => { console.warn('BrowserMind: TAB_UPDATED send failed', e.message); });
  }
});

// ─── MESSAGE HANDLER ────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'DOWNLOAD_DATA_URL') {
    chrome.downloads.download({ url: message.url, filename: message.filename, conflictAction: 'uniquify' })
      .then(id => sendResponse({ downloadId: id }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
  if (message.type === 'LOAD_REMOTE_TOOLS') {
    // Fetch remote tools JSON from a URL, cache them, return result
    const url = message.url;
    if (!url) { sendResponse({ error: 'No URL provided' }); return true; }
    fetch(url, { cache: 'no-cache' })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
        const tools = Array.isArray(data) ? data : (data.tools || []);
        const valid = tools.filter(t => t.name && t.description && t.input_schema)
          .map(t => ({ ...t, category: 'remote', source: url }));
        chrome.storage.local.set({ remoteToolsCache: valid, remoteToolsCachedAt: Date.now(), remoteToolsUrl: url });
        sendResponse({ tools: valid, count: valid.length });
      })
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
  if (message.type === 'GET_PAGE_CONTEXT') {
    getPageContext(message.tabId).then(sendResponse).catch(err =>
      sendResponse({ context: `Erreur: ${err.message}` })
    );
    return true;
  }
  if (message.type === 'EXECUTE_TOOL') {
    executeTool(message.tool, message.input, message.tabId)
      .then(result => sendResponse({ result }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
  if (message.type === 'GET_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(([tab]) => sendResponse({ tab }))
      .catch(() => sendResponse({ tab: null }));
    return true;
  }
  if (message.type === 'FETCH_MODELS') {
    fetchModels(message.provider, message.apiKey, message.baseUrl)
      .then(models => sendResponse({ models }))
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
  // ─── Agent engine (the loop runs here, the panel just renders) ───
  if (message.type === 'START_TASK') {
    startTask(message).then(sendResponse).catch(err => sendResponse({ error: err.message }));
    return true;
  }
  if (message.type === 'CONTINUE_TASK') {
    sendResponse(continueTask(message.tabId));
    return false;
  }
  if (message.type === 'STOP_TASK') {
    sendResponse(stopTask(message.tabId));
    return false;
  }
  if (message.type === 'CLEAR_TASK') {
    sendResponse(clearTask(message.tabId));
    return false;
  }
  if (message.type === 'GET_TASK_STATE') {
    sendResponse(getTaskState(message.tabId));
    return false;
  }
  if (message.type === 'NAV_CONFIRM_RESPONSE') {
    sendResponse(respondNavConfirm(message.requestId, message.allowed));
    return false;
  }
});

// Wire the engine to this worker's tool executor and page-context reader
initEngine({
  executeTool: async (tool, input, tabId) => executeTool(tool, input, tabId),
  getPageContext: (tabId) => getPageContext(tabId),
});

// ─── MODEL FETCHER ──────────────────────────────
// Provider endpoints, preset fallbacks and normalization live in shared/providers.js
async function fetchModels(providerId, apiKey, baseUrl) {
  return fetchProviderModels(providerId, apiKey, baseUrl);
}

// ─── PAGE CONTEXT ────────────────────────────────
async function getPageContext(tabId) {
  let targetTabId = tabId;
  if (!targetTabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    targetTabId = tab?.id;
  }
  if (!targetTabId) return { context: 'Aucun onglet actif.' };

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: targetTabId },
      func: extractPageContext
    });
    return { context: JSON.stringify(result.result, null, 2) };
  } catch (err) {
    return { context: `Page inaccessible: ${err.message}` };
  }
}

function extractPageContext() {
  const info = {
    url: location.href,
    title: document.title,
    textContent: document.body.innerText.substring(0, 3000)
  };
  info.links = Array.from(document.querySelectorAll('a[href]'))
    .slice(0, 30).map(a => ({ text: a.textContent.trim().substring(0, 60), href: a.href })).filter(l => l.text);
  const sensitiveTypes = new Set(['password', 'hidden', 'submit', 'reset', 'button']);
  info.forms = Array.from(document.forms).map(form => ({
    id: form.id || form.name, action: form.action,
    fields: Array.from(form.elements).map(el => ({
      type: el.type, name: el.name || el.id,
      placeholder: el.placeholder,
      value: sensitiveTypes.has(el.type) ? '[redacted]' : (el.value || '').substring(0, 50)
    })).filter(f => f.name && !sensitiveTypes.has(f.type))
  }));
  info.buttons = Array.from(document.querySelectorAll('button,[role="button"],input[type="submit"]'))
    .slice(0, 20).map(b => ({ text: b.textContent.trim().substring(0, 50) || b.value, id: b.id })).filter(b => b.text);
  return info;
}

// ─── TOOL EXECUTOR ──────────────────────────────
async function executeTool(toolName, input, tabId) {
  let targetTabId = tabId;
  if (!targetTabId) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    targetTabId = tab?.id;
  }
  if (!targetTabId) throw new Error('Aucun onglet actif');

  const tab = await chrome.tabs.get(targetTabId);

  if (INTERACTIVE_TOOLS.includes(toolName)) {
    await randomDelayBetweenActions();
  }

  switch (toolName) {
    case 'get_page_content':   return getFullPageContent(targetTabId);
    case 'click':              return executeWithFallback(targetTabId, domClick, humanClickFallback, input);
    case 'type_text':          return executeWithFallback(targetTabId, domTypeText, humanTypeFallback, input);
    case 'scroll':             return executeInPage(targetTabId, domScroll, input);
    case 'navigate':           return navigateTo(targetTabId, input);
    case 'fill_form':          return executeWithFallback(targetTabId, domFillForm, humanFillFormFallback, input);
    case 'extract_data':       return executeInPage(targetTabId, domExtractData, input);
    case 'download_file':      return downloadFile(input);
    case 'wait':               return waitAction(targetTabId, input);
    case 'take_screenshot':    return takeScreenshot(targetTabId);
    case 'generate_document':  return generateDocument(targetTabId, input);
    case 'api_call':           return callExternalAPI(input);
    case 'web_search':         return webSearch(input);
    case 'new_tab':            return openNewTab(input);
    default: {
      // Custom tool: look it up in storage and execute via its executor hint
      const result = await executeCustomTool(toolName, input, targetTabId);
      if (result !== null) return result;
      throw new Error(`Outil inconnu: ${toolName}`);
    }
  }
}

async function executeWithFallback(tabId, primaryFn, fallbackFn, input) {
  try {
    return await executeInPage(tabId, primaryFn, input);
  } catch (primaryErr) {
    console.log(`[HumanFallback] Primary failed: ${primaryErr.message}, trying fallback...`);
    try {
      return await executeInPage(tabId, fallbackFn, input);
    } catch (fallbackErr) {
      console.log(`[HumanFallback] Fallback also failed: ${fallbackErr.message}`);
      throw primaryErr;
    }
  }
}

async function executeInPage(tabId, fn, args) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId }, func: fn, args: [args]
  });
  if (result.result?.error) throw new Error(result.result.error);
  return result.result || { success: true };
}

// ═══════════════════════════════════════════════
//  ANTI-BOT: Random delay between interactive tools
// ═══════════════════════════════════════════════
const INTERACTIVE_TOOLS = ['click', 'type_text', 'scroll', 'fill_form', 'navigate'];

async function randomDelayBetweenActions() {
  const delay = 200 + Math.random() * 600;
  await new Promise(r => setTimeout(r, delay));
}

// ═══════════════════════════════════════════════
//  DOM FUNCTIONS — Improved for reliability
// ═══════════════════════════════════════════════
function domClick({ selector, selector_type = 'css' }) {
  try {
    let el;
    if (selector_type === 'text') {
      const candidates = Array.from(document.querySelectorAll('a,button,[role="button"],input[type="submit"],li,div'))
        .filter(e => e.textContent.trim().toLowerCase().includes(selector.toLowerCase()));
      el = candidates[0];
      if (!el) {
        const partial = Array.from(document.querySelectorAll('a,button,[role="button"],input[type="submit"]'))
          .find(e => e.textContent.trim().toLowerCase().includes(selector.toLowerCase().split(' ')[0]));
        el = partial;
      }
    } else if (selector_type === 'xpath') {
      el = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    } else {
      el = document.querySelector(selector);
    }
    
    if (!el) {
      // Fuzzy text matching for common elements
      const candidates = Array.from(document.querySelectorAll('button, a, [role="button"], input[type="submit"], li, div, span, p')).filter(e =>
        e.textContent && e.textContent.trim().toLowerCase().includes(selector.toLowerCase())
      );
      el = candidates[0];
    }
    
    if (!el) return { error: `Élément non trouvé: ${selector}` };
    
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + (Math.random() - 0.5) * Math.min(rect.width * 0.3, 10);
    const centerY = rect.top + rect.height / 2 + (Math.random() - 0.5) * Math.min(rect.height * 0.3, 10);
    const pageX = centerX + window.scrollX;
    const pageY = centerY + window.scrollY;
    
    const pointerEventInit = (x, y) => ({
      bubbles: true, cancelable: true, view: window,
      clientX: x - window.scrollX, clientY: y - window.scrollY,
      pageX: x, pageY: y, screenX: x, screenY: y,
      pointerId: 1, pointerType: 'mouse', isPrimary: true
    });
    const mouseEventInit = (x, y, type) => ({
      bubbles: true, cancelable: true, view: window,
      clientX: x - window.scrollX, clientY: y - window.scrollY,
      pageX: x, pageY: y, screenX: x, screenY: y,
      button: 0, buttons: 1
    });
    
    setTimeout(() => el.dispatchEvent(new PointerEvent('pointerover', pointerEventInit(pageX, pageY))), 0);
    setTimeout(() => el.dispatchEvent(new MouseEvent('mouseover', mouseEventInit(pageX, pageY, 'mouseover'))), 10);
    setTimeout(() => el.dispatchEvent(new PointerEvent('pointermove', pointerEventInit(pageX, pageY))), 20);
    setTimeout(() => el.dispatchEvent(new MouseEvent('mousemove', mouseEventInit(pageX, pageY, 'mousemove'))), 30);
    setTimeout(() => el.dispatchEvent(new PointerEvent('pointerdown', pointerEventInit(pageX, pageY))), 40);
    setTimeout(() => el.dispatchEvent(new MouseEvent('mousedown', mouseEventInit(pageX, pageY, 'mousedown'))), 50);
    setTimeout(() => el.dispatchEvent(new PointerEvent('pointerup', pointerEventInit(pageX, pageY))), 60);
    setTimeout(() => el.dispatchEvent(new MouseEvent('mouseup', mouseEventInit(pageX, pageY, 'mouseup'))), 70);
    setTimeout(() => {
      try { el.click(); } catch { el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); }
      if (typeof window.__bm_highlight === 'function') window.__bm_highlight(el);
    }, 80);
    
    return { success: true, tag: el.tagName, text: el.textContent.trim().substring(0, 50) };
  } catch (e) { return { error: e.message }; }
}

async function domTypeText({ selector, text, clear_first = true }) {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const randomDelay = () => 40 + Math.random() * 80;

  try {
    const el = document.querySelector(selector);
    if (!el) return { error: `Champ non trouvé: ${selector}` };

    el.focus();
    if (clear_first) el.value = '';

    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    const setValue = (val) => {
      if (nativeInputValueSetter) nativeInputValueSetter.call(el, val);
      else el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
    };

    let current = '';

    for (let idx = 0; idx < text.length; idx++) {
      const char = text[idx];
      current += char;
      setValue(current);

      const keyCode = char.charCodeAt(0);
      const code = 'Key' + char.toUpperCase();

      el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: char, code, keyCode }));
      el.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key: char, code, keyCode }));

      await sleep(randomDelay());

      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: char, code, keyCode }));

      if (idx < text.length - 1) await sleep(randomDelay());
    }

    el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
    return { success: true };
  } catch (e) { return { error: e.message }; }
}

function humanMouseMove(el) {
  const start = window.__bmLastMousePos || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const rect = el.getBoundingClientRect();
  const end = { x: rect.left + rect.width / 2 + window.scrollX, y: rect.top + rect.height / 2 + window.scrollY };
  const control = {
    x: (start.x + end.x) / 2 + (Math.random() - 0.5) * 200,
    y: (start.y + end.y) / 2 + (Math.random() - 0.5) * 200
  };
  const steps = 15 + Math.floor(Math.random() * 10);
  return new Promise((resolve) => {
    let step = 0;
    const move = () => {
      const t = step / steps;
      const x = (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
      const y = (1 - t) * (1 - t) * start.y + 2 * (1 - t) * t * control.y + t * t * end.y;
      const clientX = x - window.scrollX;
      const clientY = y - window.scrollY;
      el.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, cancelable: true, clientX, clientY, pageX: x, pageY: y }));
      el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true, clientX, clientY, pageX: x, pageY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true }));
      window.__bmLastMousePos = { x, y };
      step++;
      if (step <= steps) setTimeout(move, 10 + Math.random() * 10);
      else resolve();
    };
    move();
  });
}

async function humanClickFallback({ selector, selector_type = 'css' }) {
  try {
    let el;
    if (selector_type === 'text') {
      el = Array.from(document.querySelectorAll('a,button,[role="button"],input[type="submit"]')).find(e => e.textContent.trim().toLowerCase().includes(selector.toLowerCase()));
    } else if (selector_type === 'xpath') {
      el = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    } else {
      el = document.querySelector(selector);
    }
    if (!el) return { error: 'Élément non trouvé: ' + selector };
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await humanMouseMove(el);
    await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
    const rect = el.getBoundingClientRect();
    const pageX = rect.left + rect.width / 2 + window.scrollX;
    const pageY = rect.top + rect.height / 2 + window.scrollY;
    const pointerEventInit = (x, y) => ({ bubbles: true, cancelable: true, view: window, clientX: x - window.scrollX, clientY: y - window.scrollY, pageX: x, pageY: y, screenX: x, screenY: y, pointerId: 1, pointerType: 'mouse', isPrimary: true });
    const mouseEventInit = (x, y) => ({ bubbles: true, cancelable: true, view: window, clientX: x - window.scrollX, clientY: y - window.scrollY, pageX: x, pageY: y, screenX: x, screenY: y, button: 0, buttons: 1 });
    el.dispatchEvent(new PointerEvent('pointerover', pointerEventInit(pageX, pageY)));
    el.dispatchEvent(new MouseEvent('mouseover', mouseEventInit(pageX, pageY)));
    el.dispatchEvent(new PointerEvent('pointerdown', pointerEventInit(pageX, pageY)));
    el.dispatchEvent(new MouseEvent('mousedown', mouseEventInit(pageX, pageY)));
    el.dispatchEvent(new PointerEvent('pointerup', pointerEventInit(pageX, pageY)));
    el.dispatchEvent(new MouseEvent('mouseup', mouseEventInit(pageX, pageY)));
    el.dispatchEvent(new MouseEvent('click', mouseEventInit(pageX, pageY)));
    return { success: true, tag: el.tagName, text: el.textContent.trim().substring(0, 50), fallback: true };
  } catch (e) { return { error: e.message }; }
}

async function humanKeyboardNav({ selector, selector_type = 'css' }) {
  try {
    let targetEl;
    if (selector_type === 'text') {
      targetEl = Array.from(document.querySelectorAll('a,button,[role="button"],input,select,textarea,[tabindex]'))[0];
      if (targetEl) {
        const candidates = Array.from(document.querySelectorAll('a,button,[role="button"],input,select,textarea,[tabindex]')).filter(e => e.textContent?.trim().toLowerCase().includes(selector.toLowerCase()) || e.value?.toLowerCase().includes(selector.toLowerCase()));
        targetEl = candidates[0];
      }
    } else if (selector_type === 'xpath') {
      targetEl = document.evaluate(selector, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    } else {
      targetEl = document.querySelector(selector);
    }
    if (!targetEl) return { error: 'Élément non trouvé: ' + selector };
    const focusable = Array.from(document.querySelectorAll('a,button,[role="button"],input,select,textarea,[tabindex]:not([tabindex="-1"])'));
    const targetIndex = focusable.indexOf(targetEl);
    const activeIndex = focusable.indexOf(document.activeElement);
    const tabCount = targetIndex > activeIndex ? targetIndex - activeIndex : focusable.length - activeIndex + targetIndex;
    for (let i = 0; i < tabCount; i++) {
      await new Promise(r => setTimeout(r, 80 + Math.random() * 70));
      document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Tab', keyCode: 9 }));
      document.activeElement.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Tab', keyCode: 9 }));
      focusable[focusable.indexOf(document.activeElement) + 1]?.focus();
    }
    await new Promise(r => setTimeout(r, 50));
    const isButton = targetEl.tagName === 'BUTTON' || targetEl.getAttribute('role') === 'button' || targetEl.type === 'submit';
    const key = isButton || targetEl.tagName === 'A' ? 'Enter' : ' ';
    const keyCode = key === 'Enter' ? 13 : 32;
    targetEl.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key, keyCode }));
    targetEl.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key, keyCode }));
    await new Promise(r => setTimeout(r, 30));
    targetEl.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key, keyCode }));
    if (targetEl.tagName === 'A' || isButton) {
      try { targetEl.click(); } catch { targetEl.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); }
    }
    return { success: true, tag: targetEl.tagName, text: targetEl.textContent?.trim().substring(0, 50) || targetEl.value, fallback: true, keyboard: true };
  } catch (e) { return { error: e.message }; }
}

async function humanTypeFallback({ selector, text, clear_first = true }) {
  try {
    const el = document.querySelector(selector);
    if (!el) return { error: 'Champ non trouvé: ' + selector };
    const focusable = Array.from(document.querySelectorAll('a,button,[role="button"],input,select,textarea,[tabindex]'));
    const targetIndex = focusable.indexOf(el);
    const activeIndex = focusable.indexOf(document.activeElement);
    if (activeIndex !== targetIndex) {
      const tabCount = targetIndex > activeIndex ? targetIndex - activeIndex : focusable.length - activeIndex + targetIndex;
      for (let i = 0; i < tabCount; i++) {
        await new Promise(r => setTimeout(r, 80 + Math.random() * 70));
        document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Tab', keyCode: 9 }));
        document.activeElement.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Tab', keyCode: 9 }));
      }
    }
    el.focus();
    if (clear_first) {
      el.select();
      await new Promise(r => setTimeout(r, 50));
      el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Delete', keyCode: 46 }));
      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Delete', keyCode: 46 }));
    }
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
    const setValue = (val) => {
      if (nativeInputValueSetter) nativeInputValueSetter.call(el, val);
      else el.value = val;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: val.slice(-1) }));
    };
    let current = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      current += char;
      setValue(current);
      el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: char, code: 'Key' + char.toUpperCase(), keyCode: char.charCodeAt(0) }));
      await new Promise(r => setTimeout(r, 40 + Math.random() * 80));
      el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: char, code: 'Key' + char.toUpperCase(), keyCode: char.charCodeAt(0) }));
      if (i > 0 && i % (5 + Math.floor(Math.random() * 5)) === 0) {
        await new Promise(r => setTimeout(r, 200 + Math.random() * 200));
      }
    }
    el.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
    return { success: true, fallback: true, keyboard: true };
  } catch (e) { return { error: e.message }; }
}

function domScroll({ direction, amount = 300 }) {
  return new Promise((resolve) => {
    const map = { down: [0, amount], up: [0, -amount], top: [0, 0], bottom: [0, document.body.scrollHeight] };
    const [targetX, targetY] = map[direction] || [0, amount];
    const startY = window.scrollY;
    const deltaY = targetY - startY;
    const duration = 300 + Math.random() * 300;
    const startTime = performance.now();
    
    const easeOutQuad = (t) => t * (2 - t);
    
    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuad(progress);
      const currentY = startY + deltaY * eased;
      
      window.scrollTo(targetX, currentY);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        resolve({ success: true, scrollY: window.scrollY });
      }
    };
    
    requestAnimationFrame(step);
  });
}

async function humanFillFormFallback({ fields, submit = false }) {
  const results = [];
  for (const f of fields) {
    try {
      const el = document.querySelector(f.selector);
      if (!el) { results.push({ selector: f.selector, error: 'Non trouvé' }); continue; }
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(r => setTimeout(r, 300));
      const focusable = Array.from(document.querySelectorAll('input,select,textarea,button,[role="button"]'));
      const targetIndex = focusable.indexOf(el);
      const activeIndex = focusable.indexOf(document.activeElement);
      if (activeIndex !== targetIndex && targetIndex >= 0) {
        const tabCount = Math.abs(targetIndex - activeIndex);
        for (let i = 0; i < tabCount; i++) {
          document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Tab', keyCode: 9 }));
          document.activeElement.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Tab', keyCode: 9 }));
          await new Promise(r => setTimeout(r, 80 + Math.random() * 70));
        }
      }
      el.focus();
      const type = f.field_type || el.type;
      if (type === 'select') {
        el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowDown', keyCode: 40 }));
        el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'ArrowDown', keyCode: 40 }));
        const opt = Array.from(el.options).find(o => o.value === f.value || o.text.toLowerCase().includes(f.value.toLowerCase()));
        if (opt) { el.value = opt.value; el.dispatchEvent(new Event('change', { bubbles: true })); }
      } else if (type === 'checkbox' || type === 'radio') {
        const shouldCheck = f.value === 'true' || f.value === true;
        if (el.checked !== shouldCheck) {
          el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: ' ', keyCode: 32 }));
          el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: ' ', keyCode: 32 }));
          el.checked = shouldCheck;
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else {
        el.select();
        el.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Delete', keyCode: 46 }));
        await new Promise(r => setTimeout(r, 50));
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(el, f.value);
        } else {
          el.value = f.value;
        }
        el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: f.value }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      results.push({ selector: f.selector, success: true, fallback: true });
    } catch (e) { results.push({ selector: f.selector, error: e.message }); }
  }
  if (submit) {
    const btn = document.querySelector('form [type="submit"], form button:not([type])');
    if (btn) { btn.focus(); btn.click(); } else { document.querySelector('form')?.submit(); }
  }
  return { results, submitted: submit, fallback: true };
}

function domFillForm({ fields, submit = false }) {
  const results = [];
  for (const f of fields) {
    try {
      const el = document.querySelector(f.selector);
      if (!el) { results.push({ selector: f.selector, error: 'Non trouvé' }); continue; }
      const type = f.field_type || el.type;
      if (type === 'select') {
        const opt = Array.from(el.options).find(o => o.value === f.value || o.text.toLowerCase().includes(f.value.toLowerCase()));
        if (opt) { el.value = opt.value; el.dispatchEvent(new Event('change', { bubbles: true })); }
      } else if (type === 'checkbox' || type === 'radio') {
        el.checked = f.value === 'true' || f.value === true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        el.value = f.value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
      results.push({ selector: f.selector, success: true });
    } catch (e) { results.push({ selector: f.selector, error: e.message }); }
  }
  if (submit) {
    const btn = document.querySelector('form [type="submit"], form button:not([type])');
    if (btn) btn.click(); else document.querySelector('form')?.submit();
  }
  return { results, submitted: submit };
}

function domExtractData({ data_type, selector, format = 'json' }) {
  try {
    const root = selector ? document.querySelector(selector) : document;
    let data;
    if (data_type === 'table') {
      data = Array.from(root.querySelectorAll('table')).map(t => ({
        headers: Array.from(t.querySelectorAll('th')).map(th => th.textContent.trim()),
        rows: Array.from(t.querySelectorAll('tr')).slice(1).map(tr =>
          Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim()))
      }));
    } else if (data_type === 'links') {
      data = Array.from(root.querySelectorAll('a[href]')).map(a => ({ text: a.textContent.trim(), href: a.href }));
    } else if (data_type === 'list') {
      data = Array.from(root.querySelectorAll('li')).map(li => li.textContent.trim());
    } else if (data_type === 'images') {
      data = Array.from(root.querySelectorAll('img')).map(img => ({ src: img.src, alt: img.alt }));
    } else {
      data = root?.innerText?.substring(0, 5000) || '';
    }
    return { data, type: data_type, format };
  } catch (e) { return { error: e.message }; }
}

// ─── BACKGROUND-ONLY TOOLS ──────────────────────
async function getFullPageContent(tabId) {
  const [result] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => ({ text: document.body.innerText.substring(0, 10000), html: document.documentElement.outerHTML.substring(0, 5000) })
  });
  return result.result;
}

async function navigateTo(tabId, { url }) {
  if (!url.startsWith('http')) url = 'https://' + url;
  await chrome.tabs.update(tabId, { url });
  await new Promise(resolve => {
    let settled = false;
    const cleanup = () => {
      if (settled) return;
      settled = true;
      chrome.tabs.onUpdated.removeListener(fn);
      resolve();
    };
    const fn = (id, info) => { if (id === tabId && info.status === 'complete') cleanup(); };
    chrome.tabs.onUpdated.addListener(fn);
    setTimeout(cleanup, 8000);
  });
  return { success: true, url };
}

async function downloadFile({ url, filename }) {
  const id = await chrome.downloads.download({ url, filename, conflictAction: 'uniquify' });
  return { success: true, downloadId: id };
}

async function waitAction(tabId, { selector, milliseconds }) {
  if (milliseconds) { await new Promise(r => setTimeout(r, Math.min(milliseconds, 10000))); return { waited: milliseconds }; }
  if (selector) {
    for (let i = 0; i < 20; i++) {
      const [r] = await chrome.scripting.executeScript({ target: { tabId }, func: (s) => !!document.querySelector(s), args: [selector] });
      if (r.result) return { found: true };
      await new Promise(r => setTimeout(r, 500));
    }
    return { found: false, timeout: true };
  }
  return { success: true };
}

async function takeScreenshot(tabId) {
  const tab = await chrome.tabs.get(tabId);
  const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const domainPart = tab.url ? new URL(tab.url).hostname.replace(/^www\./, '').replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-') : 'page';
  const filename = `screenshot-${domainPart}-${dateStr}_${timeStr}.png`;
  await chrome.downloads.download({ url: dataUrl, filename });
  return { success: true };
}

// ─── GENERATE DOCUMENT ──────────────────────────
// Always build a descriptive filename with date+time suffix for uniqueness
async function generateDocument(tabId, { format, content, filename }) {
  const now     = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const suffix  = `${dateStr}_${timeStr}`;

  let resolvedFilename;
  const isGeneric = !filename || filename === 'export' || filename === `export.${format}`;
  if (!isGeneric) {
    const base = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9àâäéèêëîïôùûüç_-]+/gi, '-').substring(0, 40);
    resolvedFilename = `${base}_${suffix}.${format}`;
  } else {
    try {
      const tab = await chrome.tabs.get(tabId);
      const safeName = (tab.title || 'document')
        .toLowerCase()
        .replace(/[^a-z0-9àâäéèêëîïôùûüç]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 35);
      resolvedFilename = `${safeName}_${suffix}.${format}`;
    } catch {
      resolvedFilename = `browsermind_${suffix}.${format}`;
    }
  }

  // Ensure extension
  if (!resolvedFilename.endsWith(`.${format}`)) {
    resolvedFilename = resolvedFilename.replace(/\.[^.]+$/, '') + `.${format}`;
  }

  await chrome.scripting.executeScript({
    target: { tabId },
    func: (fmt, cnt, fname) => {
      // Normalize literal \n sequences to real newlines
      const normalized = cnt.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
      const mimes = {
        csv: 'text/csv;charset=utf-8;',
        html: 'text/html;charset=utf-8;',
        json: 'application/json;charset=utf-8;',
        md:   'text/markdown;charset=utf-8;',
        txt:  'text/plain;charset=utf-8;',
      };
      try {
        // Use data URL via chrome.downloads for reliable download
        const encoded = encodeURIComponent(normalized);
        const dataUrl = `data:${mimes[fmt] || 'text/plain;charset=utf-8;'},${encoded}`;
        chrome.runtime.sendMessage({ type: 'DOWNLOAD_DATA_URL', url: dataUrl, filename: fname });
      } catch {
        // Fallback: blob approach
        const blob = new Blob([normalized], { type: mimes[fmt] || 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fname; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    },
    args: [format, content, resolvedFilename]
  });
  return { success: true, format, filename: resolvedFilename };
}

// ═══════════════════════════════════════════════
//  External APIs (api_call tool)
// ═══════════════════════════════════════════════

const API_REGISTRY = {
  nominatim: {
    name: 'Nominatim (OpenStreetMap)',
    baseUrl: 'https://nominatim.openstreetmap.org',
    method: 'GET',
  },
  open_meteo: {
    name: 'Open-Meteo',
    baseUrl: 'https://api.open-meteo.com/v1',
    method: 'GET',
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    baseUrl: 'https://api.duckduckgo.com',
    method: 'GET',
  },
  rest_countries: {
    name: 'REST Countries',
    baseUrl: 'https://restcountries.com/v3.1',
    method: 'GET',
  },
  wikidata: {
    name: 'Wikidata',
    baseUrl: 'https://www.wikidata.org/w/api.php',
    method: 'GET',
  },
};

async function callExternalAPI({ api, endpoint = '', params = {} }) {
  const registry = API_REGISTRY[api];
  if (!registry) {
    throw new Error(`API inconnue: ${api}. APIs disponibles: ${Object.keys(API_REGISTRY).join(', ')}`);
  }
  
  let url = registry.baseUrl + endpoint;
  const queryParams = { ...params };
  
  if (api === 'nominatim') {
    queryParams.format = 'json';
    queryParams.addressdetails = 1;
  }
  
  const urlObj = new URL(url);
  Object.entries(queryParams).forEach(([k, v]) => {
    urlObj.searchParams.set(k, v);
  });
  
  const headers = {};
  if (api === 'wikidata') {
    headers['Accept'] = 'application/json';
    headers['User-Agent'] = 'BrowserMind/1.0';
  }
  
  const res = await fetch(urlObj.toString(), {
    method: registry.method,
    headers,
  });
  
  if (!res.ok) {
    throw new Error(`API ${api}: HTTP ${res.status}`);
  }
  
  const contentType = res.headers.get('content-type') || '';
  let data;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  
  return { api, name: registry.name, data };
}

// ═══════════════════════════════════════════════
//  Web Search (web_search tool)
// ═══════════════════════════════════════════════

/**
 * Web search using official DuckDuckGo Instant Answer API.
 * Replaces previous HTML scraping to comply with Chrome Web Store policies.
 */
async function webSearch({ query, max_results = 5 }) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&no_redirect=1`;
  
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'BrowserMind/1.0 (Chrome Extension)'
    },
  });
  
  if (!res.ok) {
    throw new Error(`Web search failed: HTTP ${res.status}`);
  }
  
  const data = await res.json();
  const results = [];

  // Extract from Abstract
  if (data.AbstractURL && data.AbstractText) {
    results.push({
      title: data.AbstractSource || 'Abstract',
      url: data.AbstractURL,
      snippet: data.AbstractText.substring(0, 200)
    });
  }

  // Extract from RelatedTopics
  if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
    for (const topic of data.RelatedTopics) {
      if (results.length >= max_results) break;
      
      // RelatedTopics can contain categories or direct results
      if (topic.FirstURL && topic.Text) {
        results.push({
          title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 50),
          url: topic.FirstURL,
          snippet: topic.Text
        });
      } else if (topic.Topics && Array.isArray(topic.Topics)) {
        // Handle sub-topics
        for (const sub of topic.Topics) {
          if (results.length >= max_results) break;
          if (sub.FirstURL && sub.Text) {
            results.push({
              title: sub.Text.split(' - ')[0] || sub.Text.substring(0, 50),
              url: sub.FirstURL,
              snippet: sub.Text
            });
          }
        }
      }
    }
  }
  
  return { query, count: results.length, results };
}

// ═══════════════════════════════════════════════
//  New Tab (new_tab tool)
// ═══════════════════════════════════════════════

async function openNewTab({ url, active = true }) {
  if (!url) {
    throw new Error('URL requise pour new_tab');
  }
  
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  
  const tab = await chrome.tabs.create({ url, active });
  
  await new Promise((resolve) => {
    const fn = (tabId, info) => {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(fn);
        resolve();
      }
    };
    chrome.tabs.onUpdated.addListener(fn);
    setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(fn);
      resolve();
    }, 8000);
  });
  
  return { success: true, tabId: tab.id, url: tab.url, active: tab.active };
}

// ═══════════════════════════════════════════════
//  CUSTOM TOOL EXECUTOR
//  Handles non-native tools defined by the user or loaded remotely.
// ═══════════════════════════════════════════════

async function executeCustomTool(toolName, input, tabId) {
  // Load custom tools from storage
  const data = await chrome.storage.local.get(['customTools', 'remoteToolsCache']);
  const allCustom = [
    ...(data.customTools || []),
    ...(data.remoteToolsCache || [])
  ];

  const tool = allCustom.find(t => t.name === toolName);
  if (!tool) return null;

  // Route via executor hint if present
  const executor = tool.executor || null;

  switch (executor) {
    // Alias to generate_document with forced format
    case 'generate_document_ext':
      return generateDocument(tabId, {
        format: input.format || tool.defaultFormat || 'txt',
        content: input.content || '',
        filename: input.filename || tool.name
      });

    // Alias to api_call with pre-configured endpoint
    case 'api_call_ext':
      return callExternalAPI({
        api: tool.api || input.api,
        endpoint: tool.endpoint || input.endpoint || '',
        params: { ...(tool.defaultParams || {}), ...input }
      });

    // Alias to web_search with constructed query
    case 'web_search_ext':
      return webSearch({
        query: input.query || (tool.queryTemplate || '').replace('{{input}}', JSON.stringify(input)),
        max_results: input.max_results || tool.maxResults || 5
      });

    // No executor → generic return (declarative tools only)
    default: {
      return { 
        success: true, 
        tool: toolName, 
        input, 
        note: 'declarative tool — no executor defined' 
      };
    }
  }
}
