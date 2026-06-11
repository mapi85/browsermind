// ═══════════════════════════════════════════════
//  BrowserMind — Side Panel (main module)
// ═══════════════════════════════════════════════

import { I18N_PANEL, makeT } from '../shared/i18n.js';
import { BUILTIN_MODES, detectModeFromUrl } from '../shared/modes.js';
import { initToolRegistry, getCustomModes, getModeById } from '../shared/tools.js';
import { DEFAULT_SETTINGS, loadSettingsFromStorage } from '../shared/settings.js';
import {
  ICO, toolIconSvg, roleIconSvg, exportIconSvg, stepStatusIcon,
} from '../shared/icons.js';

const t = makeT(I18N_PANEL, () => settings.uiLang || 'fr');

function updateI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  
  // Update quick action buttons
  const qbtns = document.querySelectorAll('.qbtn');
  if (qbtns.length >= 5) {
    qbtns[0].innerHTML = `<span class="qbtn-icon">${ICO('fileText', 13)}</span> ${t('summarize')}`;
    qbtns[0].dataset.prompt = t('quickPromptSummarize');
    qbtns[1].innerHTML = `<span class="qbtn-icon">${ICO('link', 13)}</span> ${t('linksCsv')}`;
    qbtns[1].dataset.prompt = t('quickPromptLinks');
    qbtns[2].innerHTML = `<span class="qbtn-icon">${ICO('table', 13)}</span> ${t('table')}`;
    qbtns[2].dataset.prompt = t('quickPromptTable');
    qbtns[3].innerHTML = `<span class="qbtn-icon">${ICO('code', 13)}</span> ${t('report')}`;
    qbtns[3].dataset.prompt = t('quickPromptReport');
    qbtns[4].innerHTML = `<span class="qbtn-icon">${ICO('camera', 13)}</span> ${t('screenshot')}`;
    qbtns[4].dataset.prompt = t('quickPromptScreenshot');
  }
  
  // Update input placeholders and labels
  const input = document.getElementById('prompt-input');
  if (input) input.placeholder = t('placeholder');
  
  const hint = document.getElementById('input-hint');
  if (hint) hint.textContent = t('sendHint');
  
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) sendBtn.innerHTML = t('send') + ' ' + ICO('arrowUpRight', 14);
  
  const stopBtn = document.getElementById('stop-btn');
  if (stopBtn) stopBtn.innerHTML = ICO('stop', 14) + ' ' + t('stop');
  
  const emptyText = document.querySelector('.empty-text');
  if (emptyText) emptyText.innerHTML = t('emptyStateDesc');
  
  const providerLabel = document.querySelector('.provider-label');
  if (providerLabel) providerLabel.textContent = t('provider');
  
  // Update model select title
  const modelSel = document.getElementById('model-select');
  if (modelSel) modelSel.title = t('model');

  // Update header buttons titles
  const bugBtn = document.getElementById('bug-btn');
  if (bugBtn) bugBtn.title = t('reportBug');
  
  const clearBtn = document.getElementById('clear-btn');
  if (clearBtn) clearBtn.title = t('newChat');
  
  const configBtn = document.getElementById('config-btn');
  if (configBtn) configBtn.title = t('config');

  // Update theme toggle title
  const themeWrap = document.querySelector('.theme-wrap');
  if (themeWrap) themeWrap.title = t('themeLight');

  // Update bug panel
  const bugPanel = document.getElementById('bug-panel');
  if (bugPanel) {
    const bugTitle = bugPanel.querySelector('.bug-title');
    if (bugTitle) bugTitle.innerHTML = ICO('bug', 14) + ' ' + t('bugPanelTitle').replace(/^[^\s]+\s/, '');
    const bugDescLabel = bugPanel.querySelector('label.field-label');
    if (bugDescLabel) bugDescLabel.textContent = t('bugDescLabel');
    const bugDesc = document.getElementById('bug-desc');
    if (bugDesc) bugDesc.placeholder = t('bugDescPlaceholder');
    const bugLogLabel = bugPanel.querySelectorAll('label.field-label')[1];
    if (bugLogLabel) bugLogLabel.textContent = t('bugLogLabel');
    const bugHint = bugPanel.querySelector('.bug-hint');
    if (bugHint) bugHint.innerHTML = ICO('lightbulb', 13) + ' ' + t('bugHint').replace(/^[^\s]+\s/, '');
    const bugCopyBtn = document.getElementById('bug-copy-btn');
    if (bugCopyBtn) bugCopyBtn.innerHTML = ICO('copy', 14) + ' ' + t('bugCopyBtn').replace(/^[^\s]+\s/, '');
    const bugCloseBtn = document.getElementById('bug-close-btn');
    if (bugCloseBtn) bugCloseBtn.textContent = t('bugCloseBtn');
  }

  // Update API banner
  const apiBanner = document.getElementById('api-banner');
  if (apiBanner) {
    const bannerLabel = apiBanner.querySelector('.api-banner-label');
    if (bannerLabel) {
      const pName = document.getElementById('banner-provider')?.textContent || '';
      bannerLabel.innerHTML = `${ICO('search', 13)} ${t('apiKeyMissing')} ${pName} ${t('clickToConfig')}`;
    }
  }

  initIcons();
}

// ─── ICON INIT ──────────────────────────────────
function initIcons() {
  const set = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
  set('logo-icon', ICO('brain', 18));
  set('theme-sun', ICO('sun', 13));
  set('theme-moon', ICO('moon', 13));
  set('empty-icon', ICO('globe', 36));
  set('bug-btn', ICO('bug', 15));
  set('clear-btn', ICO('trash', 15));
  set('config-btn', ICO('settings', 15));
  // collapse-btn icon is set by initHeaderCollapse() after DOMContentLoaded
  set('qa-summarize', ICO('fileText', 13));
  set('qa-links', ICO('link', 13));
  set('qa-table', ICO('table', 13));
  set('qa-report', ICO('code', 13));
  set('qa-screenshot', ICO('camera', 13));
  set('stop-btn', ICO('stop', 14) + ' ' + t('stop'));
  set('send-btn', t('send') + ' ' + ICO('arrowUpRight', 14));
  set('input-hint', t('sendHint'));
  set('bug-title', ICO('bug', 14) + ' ' + t('bugPanelTitle').replace(/^[^\s]+\s/, ''));
  set('bug-hint', ICO('lightbulb', 13) + ' ' + t('bugHint').replace(/^[^\s]+\s/, ''));
  set('bug-copy-btn', ICO('copy', 14) + ' ' + t('bugCopyBtn').replace(/^[^\s]+\s/, ''));
}

function renderMarkdown(text) {
  if (!text) return '';
  try {
    return marked.parse(text, { breaks: true, gfm: true });
  } catch {
    return escHtml(text).replace(/\n/g, '<br>');
  }
}

// ─── STATE ──────────────────────────────────────
// The agent loop lives in the background service worker; the panel keeps
// per-tab view state and renders the AGENT_STATE broadcasts it receives.
let settings = { ...DEFAULT_SETTINGS };

// Per-tab chat sessions: { [tabId]: { messages, url, title, running, awaitingContinue } }
let tabSessions = {};
let activeTabId = null;

let errorLog = [];        // panel-side errors (bug reporter)
let engineErrorLog = [];  // mirrored from the background engine

// ─── INIT ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  initIcons();
  setupEventListeners();
  initHeaderCollapse();
  applyTheme(settings.theme);
  renderProviderSelect();
  // Init tool registry (custom + remote tools) before rendering modes
  await initToolRegistry();
  renderModeBar();
  renderQuickActions();
  updateI18n();

  const { tab } = await bg('GET_ACTIVE_TAB', {});
  if (tab) {
    activeTabId = tab.id;
    ensureTabSession(tab.id, tab.url, tab.title);
    await syncTaskState(tab.id);
    renderTabBar();
    renderChat();
    if (settings.autoDetectMode) {
      const detected = detectModeFromUrl(tab.url, { ...BUILTIN_MODES, ...getCustomModes() });
      if (detected && detected !== settings.currentMode) {
        settings.currentMode = detected;
        chrome.storage.local.set({ currentMode: detected });
        renderModeBar();
        renderQuickActions();
      }
    }
  }
  updateApiBanner();
});

async function loadSettings() {
  settings = await loadSettingsFromStorage();
  if (!settings.enabledModes || settings.enabledModes.length === 0) {
    settings.enabledModes = Object.keys(BUILTIN_MODES);
  }
  updateDebugButtonVisibility();
}

function updateDebugButtonVisibility() {
  const bugBtn = document.getElementById('bug-btn');
  if (bugBtn) {
    bugBtn.style.display = settings.debugMode ? '' : 'none';
  }
}

// ─── THEME ──────────────────────────────────────
function applyTheme(t) {
  document.body.setAttribute('data-theme', t);
  settings.theme = t;
  // Sync toggle
  const tog = document.getElementById('theme-toggle');
  if (tog) tog.checked = (t === 'dark');
}

// ─── PROVIDER SELECT ────────────────────────────
function renderProviderSelect() {
  const sel = document.getElementById('provider-select');
  const providers = settings.configuredProviders || [];

  if (providers.length === 0) {
    sel.innerHTML = `<option value="">— Configurer un provider (⚙) —</option>`;
    renderModelSelect();
    return;
  }

  sel.innerHTML = providers.map(p =>
    `<option value="${p.instanceId}"${p.instanceId === settings.currentProvider ? ' selected' : ''}>${p.emoji} ${p.name}</option>`
  ).join('');

  // Auto-select first if current not found
  if (!providers.find(p => p.instanceId === settings.currentProvider)) {
    settings.currentProvider = providers[0].instanceId;
    sel.value = settings.currentProvider;
  }

  renderModelSelect();
  updateHeaderSummary();
}

function renderModelSelect() {
  const sel = document.getElementById('model-select');
  const models = settings.providerModels[settings.currentProvider] || [];
  const selected = settings.providerSelectedModel[settings.currentProvider] || '';
  sel.innerHTML = models.length === 0
    ? `<option value="">— configurer les modèles —</option>`
    : models.map(m => `<option value="${m.id}"${m.id === selected ? ' selected' : ''}>${m.name || m.id}</option>`).join('');
  if (selected) sel.value = selected;
}

// ─── MODE SELECTOR ────────────────────────────────
const MODE_CHIPS_MAX = 4;

function getAllModes() {
  return [...Object.values(BUILTIN_MODES), ...Object.values(getCustomModes())];
}

function renderModeBar() {
  const bar = document.getElementById('mode-chips');
  if (!bar) return;

  const allModes = getAllModes();
  const enabledModes = settings.enabledModes.length > 0
    ? settings.enabledModes
    : allModes.map(m => m.id);

  const filteredModes = allModes.filter(m => enabledModes.includes(m.id));
  const visibleModes  = filteredModes.slice(0, MODE_CHIPS_MAX);
  const overflowModes = filteredModes.slice(MODE_CHIPS_MAX);
  const activeInOverflow = overflowModes.some(m => m.id === settings.currentMode);

  bar.innerHTML = visibleModes.map(m => `
    <button class="mode-chip${m.id === settings.currentMode ? ' active' : ''}"
            data-mode="${m.id}" title="${m.description || ''}">
      <span class="mode-chip-icon">${m.icon}</span>
      <span class="mode-chip-label">${m.labelKey ? t(m.labelKey) : m.id}</span>
    </button>
  `).join('');

  if (overflowModes.length > 0) {
    const overflowBtn = document.createElement('button');
    overflowBtn.className = 'mode-chip mode-chip-overflow' + (activeInOverflow ? ' active' : '');
    overflowBtn.title = overflowModes.map(m => t(m.labelKey || m.id)).join(', ');

    const activeOM = overflowModes.find(m => m.id === settings.currentMode);
    overflowBtn.innerHTML = activeOM
      ? `<span class="mode-chip-icon">${activeOM.icon}</span><span class="mode-chip-label">${t(activeOM.labelKey || activeOM.id)}</span><span class="mode-chip-caret">▾</span>`
      : `<span class="mode-chip-label">+${overflowModes.length}</span><span class="mode-chip-caret">▾</span>`;

    const dropdown = document.createElement('div');
    dropdown.className = 'mode-overflow-dropdown';
    dropdown.innerHTML = overflowModes.map(m => `
      <button class="mode-overflow-item${m.id === settings.currentMode ? ' active' : ''}" data-mode="${m.id}">
        <span>${m.icon}</span> <span>${m.labelKey ? t(m.labelKey) : m.id}</span>
      </button>
    `).join('');

    const wrapper = document.createElement('div');
    wrapper.className = 'mode-overflow-wrap';
    wrapper.appendChild(overflowBtn);
    wrapper.appendChild(dropdown);
    bar.appendChild(wrapper);

    let dropOpen = false;
    const closeDropdown = () => { dropOpen = false; dropdown.classList.remove('open'); };
    overflowBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropOpen = !dropOpen;
      if (dropOpen) {
        const rect = overflowBtn.getBoundingClientRect();
        dropdown.style.top  = rect.bottom + 4 + 'px';
        dropdown.style.left = rect.left + 'px';
      }
      dropdown.classList.toggle('open', dropOpen);
    });
    document.addEventListener('click', closeDropdown, { once: false });
    bar._closeOverflow = closeDropdown;

    dropdown.querySelectorAll('.mode-overflow-item').forEach(item => {
      item.addEventListener('click', e => {
        e.stopPropagation();
        closeDropdown();
        selectMode(item.dataset.mode);
      });
    });
  }

  bar.querySelectorAll('.mode-chip[data-mode]').forEach(chip => {
    chip.addEventListener('click', () => selectMode(chip.dataset.mode));
  });
}

function selectMode(newMode) {
  if (newMode === settings.currentMode) return;
  settings.currentMode = newMode;
  chrome.storage.local.set({ currentMode: settings.currentMode });
  renderModeBar();
  renderQuickActions();
  const mode = getModeById(newMode);
  addMsg('system', `${mode?.icon || ''} ${t(mode?.labelKey || newMode)}`);
}

function renderQuickActions() {
  const qa = document.getElementById('quick-actions');
  if (!qa) return;
  
  const mode = getModeById(settings.currentMode);
  if (!mode || !mode.quickActions) {
    qa.innerHTML = '';
    return;
  }
  
  qa.innerHTML = mode.quickActions.map(action => {
    const iconMap = {
      fileText: 'file-text', link: 'link', table: 'table', code: 'code', camera: 'camera',
      home: 'home', plane: 'plane', train: 'train', map: 'map', calendar: 'calendar', download: 'download',
      search: 'search', layers: 'layers', 'git-merge': 'git-merge', 'bar-chart': 'bar-chart', columns: 'columns',
      'file-text': 'file-text', list: 'list', edit: 'edit', 'check-circle': 'check-circle', file: 'file', mail: 'mail',
      'dollar-sign': 'dollar-sign', 'message-square': 'message-square', award: 'award', 'trending-up': 'trending-up',
      'shopping-cart': 'shopping-cart', newspaper: 'newspaper', eye: 'eye', folder: 'folder', 'book': 'book',
      'book-open': 'book-open', clipboard: 'clipboard', 'check-square': 'check-square', helpCircle: 'help-circle',
      calculator: 'calculator', search: 'search'
    };
    return `
      <button class="qbtn" data-prompt="${action.prompt}">
        <span class="qbtn-icon">${ICO(iconMap[action.icon] || 'zap', 13)}</span> ${t(action.labelKey)}
      </button>
    `;
  }).join('');
  
  qa.querySelectorAll('.qbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('prompt-input').value = btn.dataset.prompt;
      handleSend();
    });
  });
}

// #6: reload settings from storage (called after config page saves)
async function refreshFromStorage() {
  await initToolRegistry();
  await loadSettings();
  applyTheme(settings.theme);
  renderProviderSelect();
  renderModeBar();
  renderQuickActions();
  updateI18n();
  updateApiBanner();
  addMsg('system', t('configReloaded'));
}

// ─── TAB MANAGEMENT ─────────────────────────────
function ensureTabSession(tabId, url, title) {
  if (!tabSessions[tabId]) {
    tabSessions[tabId] = {
      tabId, url: url || '', title: title || 'Onglet',
      messages: [],
      createdAt: Date.now(),
      running: false,
      awaitingContinue: false,
    };
  } else {
    if (url) tabSessions[tabId].url = url;
    if (title) tabSessions[tabId].title = title;
  }
  enforceTabLimit();
}

// ─── ENGINE SYNC ────────────────────────────────
// The background engine owns task state; these keep the view in sync.
async function syncTaskState(tabId) {
  try {
    const state = await bg('GET_TASK_STATE', { tabId });
    applyTaskState(state);
  } catch (e) { /* SW briefly unavailable — next broadcast will catch up */ }
}

function applyTaskState(state) {
  if (!state) return;
  engineErrorLog = state.errorLog || engineErrorLog;
  if (!state.exists || !tabSessions[state.tabId]) {
    renderTabBar();
    return;
  }
  const session = tabSessions[state.tabId];
  session.messages = state.messages || [];
  session.running = !!state.running;
  session.awaitingContinue = !!state.awaitingContinue;
  if (state.tabId === activeTabId) {
    renderChat();
    if (state.status) setStatus(state.status.text, state.status.state);
    document.getElementById('send-btn').disabled = session.running;
    document.getElementById('stop-btn').classList.toggle('visible', session.running);
  }
  renderTabBar();
}

function enforceTabLimit() {
  const limit = settings.maxTabSessions || 10;
  const sessions = Object.values(tabSessions);
  if (sessions.length <= limit) return;

  const sortedSessions = sessions
    .filter(s => s.tabId !== activeTabId && !s.running)
    .sort((a, b) => a.createdAt - b.createdAt);

  const toRemove = sessions.length - limit;
  let removed = 0;
  for (const session of sortedSessions) {
    if (removed >= toRemove) break;
    delete tabSessions[session.tabId];
    removed++;
  }
}

function renderTabBar() {
  const bar = document.getElementById('tab-bar');
  const sessions = Object.values(tabSessions);
  if (sessions.length <= 1) { bar.style.display = 'none'; return; }
  bar.style.display = 'flex';

  const TAB_MAX = 4;
  const visibleSessions  = sessions.slice(0, TAB_MAX);
  const overflowSessions = sessions.slice(TAB_MAX);
  const activeInOverflow = overflowSessions.some(s => s.tabId === activeTabId);

  bar.innerHTML = visibleSessions.map(s => {
    const domain = getDomain(s.url);
    const isActive = s.tabId === activeTabId;
    const isLocked = s.running;
    return `
      <div class="tab-chip${isActive ? ' active' : ''}" data-tabid="${s.tabId}">
        <img class="tab-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=16" data-fallback="none"/>
        <span>${truncate(s.title || domain || 'Onglet', 18)}</span>
        ${isLocked ? `<span title="Tâche en cours" style="font-size:11px">🔒</span>` : ''}
        <button class="tab-close" data-tabid="${s.tabId}" title="Fermer">✕</button>
      </div>
    `;
  }).join('');

  if (overflowSessions.length > 0) {
    const activeOS = overflowSessions.find(s => s.tabId === activeTabId);
    const overflowBtn = document.createElement('div');
    overflowBtn.className = 'tab-chip tab-overflow-btn' + (activeInOverflow ? ' active' : '');
    overflowBtn.innerHTML = activeOS
      ? `<span>${truncate(activeOS.title || 'Onglet', 15)}</span><span style="font-size:10px;margin-left:2px">▾</span>`
      : `<span>+${overflowSessions.length}</span><span style="font-size:10px;margin-left:2px">▾</span>`;

    const dropdown = document.createElement('div');
    dropdown.className = 'tab-overflow-dropdown';
    dropdown.innerHTML = overflowSessions.map(s => {
      const domain = getDomain(s.url);
      const isActive = s.tabId === activeTabId;
      const isLocked = s.running;
      return `
        <div class="tab-overflow-item${isActive ? ' active' : ''}" data-tabid="${s.tabId}">
          <img class="tab-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=16" data-fallback="none"/>
          <span>${truncate(s.title || domain || 'Onglet', 22)}</span>
          ${isLocked ? `<span style="font-size:10px">🔒</span>` : ''}
          <button class="tab-close" data-tabid="${s.tabId}">✕</button>
        </div>
      `;
    }).join('');

    const wrapper = document.createElement('div');
    wrapper.className = 'tab-overflow-wrap';
    wrapper.appendChild(overflowBtn);
    wrapper.appendChild(dropdown);
    bar.appendChild(wrapper);

    let dropOpen = false;
    const closeDropdown = () => { dropOpen = false; dropdown.classList.remove('open'); };
    overflowBtn.addEventListener('click', e => {
      e.stopPropagation();
      dropOpen = !dropOpen;
      if (dropOpen) {
        const rect = overflowBtn.getBoundingClientRect();
        dropdown.style.top   = rect.bottom + 2 + 'px';
        dropdown.style.left  = Math.max(0, rect.right - 200) + 'px';
      }
      dropdown.classList.toggle('open', dropOpen);
    });
    document.addEventListener('click', closeDropdown);

    dropdown.querySelectorAll('.tab-overflow-item').forEach(item => {
      item.addEventListener('click', e => {
        if (e.target.classList.contains('tab-close')) return;
        closeDropdown();
        switchToTab(parseInt(item.dataset.tabid));
      });
    });
    dropdown.querySelectorAll('.tab-close').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        closeDropdown();
        closeTab(parseInt(btn.dataset.tabid));
      });
    });
  }

  bar.querySelectorAll('.tab-chip[data-tabid]').forEach(chip => {
    chip.addEventListener('click', e => {
      if (e.target.classList.contains('tab-close')) return;
      switchToTab(parseInt(chip.dataset.tabid));
    });
  });
  bar.querySelectorAll('.tab-close[data-tabid]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      closeTab(parseInt(btn.dataset.tabid));
    });
  });
}

function switchToTab(tabId) {
  activeTabId = tabId;
  renderTabBar();
  renderChat();
  // #5: also tell Chrome to switch to that tab
  chrome.tabs.update(tabId, { active: true }).catch(e => { console.warn('BrowserMind: tab switch failed', e.message); });
  setStatus(`${t('tab')}: ${truncate(tabSessions[tabId]?.title || '', 30)}`, 'idle');
  enforceTabLimit();
  updateHeaderSummary();
}

function closeTab(tabId) {
  delete tabSessions[tabId];
  if (activeTabId === tabId) {
    const remaining = Object.keys(tabSessions);
    activeTabId = remaining.length > 0 ? parseInt(remaining[remaining.length - 1]) : null;
  }
  renderTabBar();
  renderChat();
}

// ─── CHAT RENDERING ─────────────────────────────
function renderChat() {
  const container = document.getElementById('messages');
  const session = activeTabId ? tabSessions[activeTabId] : null;

  if (!session || session.messages.length === 0) {
    container.innerHTML = `
      <div class="empty-state" id="empty-state">
        <div class="empty-icon">${ICO('globe', 36)}</div>
        <div class="empty-text">${t('emptyState')}</div>
      </div>`;
    return;
  }

  container.innerHTML = '';
  session.messages.forEach(msg => appendMessageElement(msg));
  container.scrollTop = container.scrollHeight;
}

// ─── MESSAGES ───────────────────────────────────
function appendMessageElement(msg) {
  const container = document.getElementById('messages');
  document.getElementById('empty-state')?.remove();

  const div = document.createElement('div');
  div.className = `msg ${msg.type}`;
  div.dataset.msgId = msg.id || '';

  const roleLabels = t('roleLabels');

  let bubbleHtml = '';

  if (msg.type === 'action' && msg.actions) {
    const stepsHtml = msg.actions.map(a => `
      <div class="action-step">
        <span class="step-icon">${toolIconSvg(a.tool)}</span>
        <span class="step-text">${formatActionText(a)}</span>
        <span class="step-status">${stepStatusIcon(a.status)}</span>
      </div>`).join('');
    bubbleHtml = `<div class="msg-bubble">${stepsHtml}</div>`;
  } else if (msg.type === 'thinking') {
    const isOpen = !settings.thinkingCollapsed;
    bubbleHtml = `
      <details class="thinking-block"${isOpen ? ' open' : ''}>
        <summary class="thinking-summary">
          ${msg.done
            ? `<span>${t('thinkingDone')}</span>`
            : `<span style="color:var(--accent2)">${t('thinkingThinking')}</span>
               <div class="thinking-dots"><span></span><span></span><span></span></div>`}
        </summary>
        <div class="thinking-body">${escHtml(msg.content || '…')}</div>
      </details>`;
    div.className = 'msg thinking-msg';
  } else if (msg.type === 'export') {
    const icon = exportIconSvg(msg.format);
    bubbleHtml = `
      <div class="msg-bubble">
        <div class="export-action">
          <span class="export-icon">${icon}</span>
          <div class="export-info">
            <div class="export-name">${escHtml(msg.filename || 'export')}</div>
            <div class="export-meta">${(msg.format || '').toUpperCase()} · ${t('done')}</div>
          </div>
        </div>
      </div>`;
  } else if (msg.type === 'assistant') {
    bubbleHtml = `<div class="msg-bubble markdown-body">${renderMarkdown(msg.content || '')}</div>`;
  } else {
    bubbleHtml = `<div class="msg-bubble">${escHtml(msg.content || '').replace(/\n/g, '<br>')}</div>`;
  }

  const roleIcon = roleIconSvg(msg.type);
  const roleText = roleLabels[msg.type] || roleLabels[msg.type.replace('-msg', '')] || msg.type;
  const roleHtml = `<span class="msg-role">${roleIcon} ${escHtml(roleText)}</span>`;

  if (msg.type !== 'thinking-msg') {
    div.innerHTML = roleHtml + bubbleHtml;
  } else {
    div.innerHTML = bubbleHtml;
  }

  // "Continue?" offer after the engine hits the iteration limit
  if (msg.continueOffer) {
    const session = activeTabId ? tabSessions[activeTabId] : null;
    if (session?.awaitingContinue) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary';
      btn.style.cssText = 'margin-top:8px;font-size:12px;padding:4px 12px;';
      btn.textContent = t('maxIterationsBtn');
      btn.addEventListener('click', () => {
        btn.remove();
        bg('CONTINUE_TASK', { tabId: activeTabId }).catch(() => {});
      });
      div.appendChild(btn);
    }
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return div;
}

function addMsg(type, content, extra = {}) {
  if (!activeTabId) return;
  const msg = { id: Date.now() + '_' + Math.random().toString(36).slice(2, 6), type, content, ...extra };
  tabSessions[activeTabId].messages.push(msg);
  appendMessageElement(msg);
  return msg;
}

function addMsgToTab(tabId, type, content, extra = {}) {
  if (!tabSessions[tabId]) return;
  const msg = { id: Date.now() + '_' + Math.random().toString(36).slice(2, 6), type, content, ...extra };
  tabSessions[tabId].messages.push(msg);
  // Only append to DOM if this tab is active
  if (tabId === activeTabId) appendMessageElement(msg);
  return msg;
}

// ─── EVENTS ─────────────────────────────────────
// ─── NAVIGATION CONFIRMATION ────────────────────
function showNavConfirm(targetUrl, tabId) {
  return new Promise(resolve => {
    // Remove any existing dialog
    document.getElementById('nav-confirm-overlay')?.remove();

    const overlay = document.createElement('div');
    overlay.id = 'nav-confirm-overlay';
    overlay.className = 'nav-confirm-overlay';

    let domain = targetUrl;
    try { domain = new URL(targetUrl.startsWith('http') ? targetUrl : 'https://'+targetUrl).hostname; } catch(e) {}

    overlay.innerHTML = `
      <div class="nav-confirm-box">
        <div class="nav-confirm-icon">🌐</div>
        <div class="nav-confirm-title">${t('navConfirmTitle')}</div>
        <div class="nav-confirm-url">${domain}</div>
        <div class="nav-confirm-hint">${t('navConfirmHint')}</div>
        <label class="nav-confirm-remember">
          <input type="checkbox" id="nav-always-allow"/>
          <span>${t('navConfirmAlways')}</span>
        </label>
        <div class="nav-confirm-btns">
          <button class="btn btn-ghost" id="nav-cancel-btn">${t('navConfirmCancel')}</button>
          <button class="btn btn-primary" id="nav-ok-btn">${t('navConfirmOk')}</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('visible'));

    const cleanup = (result) => {
      const always = document.getElementById('nav-always-allow')?.checked;
      if (always && result) chrome.storage.local.set({ navAlwaysAllow: true });
      overlay.classList.remove('visible');
      setTimeout(() => overlay.remove(), 200);
      resolve(result);
    };

    document.getElementById('nav-ok-btn').addEventListener('click',     () => cleanup(true));
    document.getElementById('nav-cancel-btn').addEventListener('click', () => cleanup(false));
    overlay.addEventListener('click', e => { if (e.target === overlay) cleanup(false); });
  });
}

function setupEventListeners() {
  document.getElementById('send-btn').addEventListener('click', handleSend);
  document.getElementById('stop-btn').addEventListener('click', () => {
    if (activeTabId) bg('STOP_TASK', { tabId: activeTabId }).catch(() => {});
    setStatus(t('statusStopping'), 'thinking');
  });

  const ta = document.getElementById('prompt-input');
  ta.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } });
  ta.addEventListener('input', e => { e.target.style.height = 'auto'; e.target.style.height = Math.min(e.target.scrollHeight, 110) + 'px'; });

  document.querySelectorAll('.qbtn').forEach(btn => {
    btn.addEventListener('click', () => { ta.value = btn.dataset.prompt; handleSend(); });
  });

  document.getElementById('clear-btn').addEventListener('click', () => {
    if (!activeTabId) return;
    bg('CLEAR_TASK', { tabId: activeTabId }).catch(() => {});
    tabSessions[activeTabId].messages = [];
    tabSessions[activeTabId].running = false;
    tabSessions[activeTabId].awaitingContinue = false;
    document.getElementById('send-btn').disabled = false;
    document.getElementById('stop-btn').classList.remove('visible');
    renderChat();
    setStatus(t('chatCleared'), 'idle');
  });

  document.getElementById('config-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('config.html') });
  });

  document.body.addEventListener('click', e => {
    if (e.target.matches('[data-action="open-config"]')) {
      e.preventDefault();
      chrome.tabs.create({ url: chrome.runtime.getURL('config.html') });
    }
  });

  // Favicon error fallback handler
  document.body.addEventListener('error', e => {
    if (e.target.matches('img[data-fallback="none"]')) {
      e.target.style.display = 'none';
    }
  }, true);

  // Provider select
  document.getElementById('provider-select').addEventListener('change', e => {
    settings.currentProvider = e.target.value;
    chrome.storage.local.set({ currentProvider: settings.currentProvider });
    renderModelSelect();
    updateApiBanner();
    const p = (settings.configuredProviders || []).find(p => p.instanceId === settings.currentProvider);
    if (p) addMsg('system', `${p.emoji} ${p.name} — ${t('model')}: ${getCurrentModel() || t('noModel')}`);
  });

  document.getElementById('model-select').addEventListener('change', e => {
    const newModel = e.target.value;
    settings.providerSelectedModel[settings.currentProvider] = newModel;
    
    // Also update in configuredProviders for persistence
    const p = settings.configuredProviders.find(p => p.instanceId === settings.currentProvider);
    if (p) p.selectedModel = newModel;
    
    chrome.storage.local.set({ 
      providerSelectedModel: settings.providerSelectedModel,
      configuredProviders: settings.configuredProviders
    });
  });

  // Theme toggle (in header)
  document.getElementById('theme-toggle')?.addEventListener('change', e => {
    applyTheme(e.target.checked ? 'dark' : 'light');
    chrome.storage.local.set({ theme: settings.theme });
  });

  // Bug reporter
  document.getElementById('bug-btn').addEventListener('click', openBugPanel);
  document.getElementById('bug-close-btn').addEventListener('click', () => document.getElementById('bug-panel').classList.remove('show'));
  document.getElementById('bug-copy-btn').addEventListener('click', copyBugReport);

  // Engine broadcasts + tab changes + config page saves
  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === 'AGENT_STATE') {
      ensureTabSession(msg.tabId);
      applyTaskState(msg);
    }
    if (msg.type === 'NAV_CONFIRM_REQUEST') {
      showNavConfirm(msg.url, msg.tabId).then(allowed => {
        bg('NAV_CONFIRM_RESPONSE', { requestId: msg.requestId, allowed }).catch(() => {});
      });
    }
    if (msg.type === 'TAB_CHANGED') {
      const prevId = activeTabId;
      activeTabId = msg.tabId;
      ensureTabSession(msg.tabId, msg.url, msg.title);
      syncTaskState(msg.tabId);
      renderTabBar();
      if (prevId !== msg.tabId) renderChat();
      updateApiBanner();
      if (settings.autoDetectMode && msg.url) {
        const detected = detectModeFromUrl(msg.url, { ...BUILTIN_MODES, ...getCustomModes() });
        if (detected && detected !== settings.currentMode) {
          settings.currentMode = detected;
          chrome.storage.local.set({ currentMode: detected });
          renderModeBar();
          renderQuickActions();
          const mode = getModeById(detected);
          addMsg('system', `${mode?.icon || ''} ${t(mode?.labelKey || detected)} — ${t('modeAutoDetected')}`);
        }
      }
    }
    if (msg.type === 'TAB_UPDATED' && msg.tabId === activeTabId) {
      ensureTabSession(msg.tabId, msg.url, msg.title);
      renderTabBar();
    }
    // #6: Config page signals that settings changed
    if (msg.type === 'SETTINGS_SAVED') {
      refreshFromStorage();
      updateDebugButtonVisibility();
    }
  });

  // #6: Also watch storage changes directly
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    const relevant = ['providerKeys', 'providerModels', 'providerSelectedModel', 'theme', 'currentProvider'];
    if (relevant.some(k => k in changes)) {
      refreshFromStorage();
    }
  });
}

function updateApiBanner() {
  const banner = document.getElementById('api-banner');
  const bannerProvider = document.getElementById('banner-provider');

  if (!banner || !bannerProvider) return;

  const key = settings.providerKeys[settings.currentProvider];
  const p = (settings.configuredProviders || []).find(p => p.instanceId === settings.currentProvider);
  const hasProviders = (settings.configuredProviders || []).length > 0;
  banner.classList.toggle('show', !key && hasProviders || !hasProviders);
  bannerProvider.textContent = p?.name || 'un provider';
}

// ─── STATUS ─────────────────────────────────────
function setStatus(text, state = 'idle') {
  document.getElementById('status-text').textContent = text;
  const dot = document.getElementById('sdot');
  dot.className = 'sdot';
  if (state === 'active') dot.classList.add('active');
  if (state === 'thinking') dot.classList.add('thinking');
  updateHeaderSummary();
}

// ─── HEADER COLLAPSE ────────────────────────────
let headerCollapsed = false;

function initHeaderCollapse() {
  const stored = localStorage.getItem('bm-header-collapsed');
  headerCollapsed = stored === '1';
  applyHeaderCollapse(false);

  // Button inside the full bar (to collapse)
  const btnFull = document.getElementById('collapse-btn');
  if (btnFull) {
    btnFull.addEventListener('click', () => {
      headerCollapsed = true;
      localStorage.setItem('bm-header-collapsed', '1');
      applyHeaderCollapse(true);
    });
  }
  // Button in the summary bar (to expand)
  const btnSummary = document.getElementById('collapse-btn-summary');
  if (btnSummary) {
    btnSummary.addEventListener('click', () => {
      headerCollapsed = false;
      localStorage.setItem('bm-header-collapsed', '0');
      applyHeaderCollapse(true);
    });
  }
}

function applyHeaderCollapse(animate) {
  const full    = document.getElementById('header-full');
  const summary = document.getElementById('header-summary');
  const btnFull = document.getElementById('collapse-btn');
  const btnSum  = document.getElementById('collapse-btn-summary');
  if (!full || !summary) return;

  if (animate) {
    full.style.transition    = 'max-height 0.22s ease, opacity 0.18s ease';
    summary.style.transition = 'max-height 0.22s ease, opacity 0.18s ease';
  }

  // chevronDown = ▾ (collapse),  arrowsUpDown with up = ▴ (expand)
  if (headerCollapsed) {
    full.classList.add('collapsed');
    summary.classList.remove('hidden');
    if (btnFull) btnFull.innerHTML = ICO('chevronDown', 14);
    if (btnSum)  btnSum.innerHTML  = ICO('arrowsUpDown', 14);
  } else {
    full.classList.remove('collapsed');
    summary.classList.add('hidden');
    if (btnFull) btnFull.innerHTML = ICO('chevronDown', 14);
    if (btnSum)  btnSum.innerHTML  = ICO('arrowsUpDown', 14);
  }
  updateHeaderSummary();
}

function updateHeaderSummary() {
  // Provider name
  const provEl = document.getElementById('summary-provider');
  if (provEl) {
    const pInst = (settings.configuredProviders || []).find(p => p.instanceId === settings.currentProvider);
    provEl.textContent = pInst?.name || settings.currentProvider || '—';
  }
  // Mode
  const modeEl = document.getElementById('summary-mode');
  if (modeEl) {
    const mode = getModeById(settings.currentMode);
    modeEl.textContent = mode ? `${mode.icon} ${t(mode.labelKey || mode.id)}` : settings.currentMode || '—';
  }
  // Active tab title
  const tabEl = document.getElementById('summary-tab');
  if (tabEl) {
    const session = activeTabId ? tabSessions[activeTabId] : null;
    const domain = session ? getDomain(session.url) : null;
    tabEl.textContent = session ? truncate(session.title || domain || 'Onglet', 20) : '—';
  }
  // Status
  const statusEl = document.getElementById('summary-status');
  if (statusEl) {
    const txt = document.getElementById('status-text')?.textContent || '';
    statusEl.textContent = txt;
  }
}

// ─── SEND ───────────────────────────────────────
// Hands the task to the background engine; rendering follows AGENT_STATE.
async function handleSend() {
  const session = activeTabId ? tabSessions[activeTabId] : null;
  if (!session || session.running) return;

  if (!navigator.onLine) {
    addMsg('error', t('noConnexion'));
    return;
  }

  const key = settings.providerKeys[settings.currentProvider];
  const pInst = (settings.configuredProviders || []).find(p => p.instanceId === settings.currentProvider);
  if (!key && !pInst?.key) {
    const pName = pInst?.name || 'ce provider';
    addMsg('error', `${t('apiKeyMissing')} ${pName} ${t('clickToConfig')}`);
    return;
  }

  const ta = document.getElementById('prompt-input');
  const prompt = ta.value.trim();
  if (!prompt) return;
  ta.value = ''; ta.style.height = 'auto';

  session.running = true;
  document.getElementById('send-btn').disabled = true;
  document.getElementById('stop-btn').classList.add('visible');
  renderTabBar();

  try {
    const resp = await bg('START_TASK', {
      tabId: activeTabId, prompt, url: session.url, title: session.title,
    });
    if (resp?.error) throw new Error(resp.error);
  } catch (e) {
    session.running = false;
    document.getElementById('send-btn').disabled = false;
    document.getElementById('stop-btn').classList.remove('visible');
    addMsg('error', `${t('apiError')} ${e.message}`);
  }
}

function getCurrentModel() {
  return settings.providerSelectedModel[settings.currentProvider] || '';
}

// ─── BUG REPORTER ────────────────────────────────
function logError(type, msg, ctx = {}) {
  errorLog.push({ type, msg, ctx, ts: new Date().toISOString(), provider: settings.currentProvider });
  if (errorLog.length > 50) errorLog.shift();
}

function openBugPanel() {
  const panel = document.getElementById('bug-panel');
  panel.classList.add('show');
  document.getElementById('bug-desc').value = '';
  document.getElementById('bug-log').textContent = buildBugLog();
}

function buildBugLog() {
  const session = activeTabId ? tabSessions[activeTabId] : null;
  const allErrors = [...engineErrorLog, ...errorLog].sort((a, b) => (a.ts < b.ts ? -1 : 1));
  return [
    `BrowserMind v1.0.0 — Bug Report`,
    `Date: ${new Date().toISOString()}`,
    `Provider: ${settings.currentProvider}`,
    `Model: ${getCurrentModel()}`,
    `Tab: ${session?.url || '—'}`,
    `Messages: ${session?.messages.length || 0}`,
    ``,
    `Errors (${allErrors.length}):`,
    ...allErrors.slice(-20).map(e => `[${e.ts}] ${e.type}: ${e.msg}${Object.keys(e.ctx || {}).length ? ' | ' + JSON.stringify(e.ctx) : ''}`),
  ].join('\n');
}

async function copyBugReport() {
  const desc = document.getElementById('bug-desc').value.trim();
  const log = buildBugLog();
  const report = `## 🐛 Bug Report BrowserMind\n\n### Description\n${desc || '(non renseigné)'}\n\n### Log\n\`\`\`\n${log}\n\`\`\``;
  try {
    await navigator.clipboard.writeText(report);
    const btn = document.getElementById('bug-copy-btn');
    btn.textContent = '✅ Copié !';
    setTimeout(() => { btn.textContent = t('bugCopyBtn'); }, 2500);
  } catch (e) {
    window.prompt('Copiez ce rapport:', report);
  }
}

// ─── HELPERS ─────────────────────────────────────
async function bg(type, data) {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ type, ...data }, r => {
      if (chrome.runtime.lastError) rej(new Error(chrome.runtime.lastError.message));
      else res(r);
    });
  });
}

function toolIcon(t) {
  return { click:'👆', type_text:'⌨️', scroll:'📜', navigate:'🔗', get_page_content:'📄',
           fill_form:'📝', extract_data:'📊', download_file:'⬇️', wait:'⏳',
           take_screenshot:'📸', generate_document:'📁' }[t] || '⚡';
}

function toolLabel(toolName) {
  const labels = t('toolLabel');
  return labels[toolName] || toolName;
}

function formatActionText({ tool, input }) {
  if (tool === 'click') return `${t('toolLabel').click || 'Clic'}: <code>${escHtml(input.selector)}</code>`;
  if (tool === 'type_text') return `${t('toolLabel').type_text || 'Saisie'} "${escHtml((input.text||'').substring(0,30))}" → <code>${escHtml(input.selector)}</code>`;
  if (tool === 'navigate') return `→ ${escHtml((input.url||'').substring(0,50))}`;
  if (tool === 'fill_form') return `${t('toolLabel').fill_form || 'Remplissage'} ${input.fields?.length} champs`;
  if (tool === 'generate_document') return `${t('toolLabel').generate_document || 'Export'} ${(input.format||'').toUpperCase()}: <code>${escHtml(input.filename||'')}</code>`;
  if (tool === 'scroll') return `Scroll ${input.direction}`;
  return toolLabel(tool);
}

function getDomain(url) {
  try { return new URL(url || '').hostname; } catch { return url || ''; }
}
function truncate(str, n) { return str.length > n ? str.substring(0, n) + '…' : str; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
