// ═══════════════════════════════════════════════
//  BrowserMind — Config Page (main module)
// ═══════════════════════════════════════════════

import { I18N_CONFIG, makeT } from '../shared/i18n.js';
import { PROVIDER_CATALOG, presetModelsFor } from '../shared/providers.js';
import { BUILTIN_MODES } from '../shared/modes.js';
import { NATIVE_TOOLS, getAllRegisteredTools, loadCustomToolsFromStorage, saveCustomModes as persistCustomModes } from '../shared/tools.js';
import { ICO } from '../shared/icons.js';

const tConfig = makeT(I18N_CONFIG, () => state.uiLang || 'fr');

function updateI18nConfig() {
  const $ = id => document.getElementById(id);
  const qa = (sel, root) => (root || document).querySelector(sel);

  // Generic handler: translate all [data-i18n] elements automatically
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = tConfig(key);
    if (!val || val === key) return;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = val;
    } else if (el.tagName === 'OPTION') {
      el.textContent = val;
    } else {
      el.textContent = val;
    }
  });

  qa('.topbar-title').textContent = tConfig('configTitle');
  qa('.back-btn').textContent = '← ' + tConfig('backToChat');

  const tabs = document.querySelectorAll('.tab');
  if (tabs.length >= 4) {
    tabs[0].textContent = tConfig('tabProviders');
    tabs[1].textContent = tConfig('tabGeneral');
    tabs[2].textContent = tConfig('tabMemory');
    tabs[3].textContent = tConfig('tabHistory');
    if (tabs[4]) tabs[4].textContent = tConfig('tabModes');
    if (tabs[5]) tabs[5].textContent = tConfig('tabTools');
  }

  const addTitle = qa('.add-provider-title');
  if (addTitle) addTitle.textContent = tConfig('newProviderTitle');

  const typeSelect = $('new-provider-type');
  if (typeSelect && typeSelect.options.length > 0) {
    typeSelect.options[0].textContent = tConfig('selectPlaceholder');
  }

  const typeLabel = qa('#add-provider-form label.field-label');
  if (typeLabel) typeLabel.textContent = tConfig('providerTypeLabel');

  const urlField = $('new-provider-url-field');
  if (urlField) {
    const lbl = urlField.querySelector('label');
    if (lbl) lbl.textContent = tConfig('baseUrlLabel');
    const hint = urlField.querySelector('.field-hint');
    if (hint) hint.textContent = tConfig('ollamaHint');
  }

  const nameField = $('new-provider-name-field');
  if (nameField) {
    const lbl = nameField.querySelector('label');
    if (lbl) lbl.textContent = tConfig('displayNameLabel');
  }

  const keyField = $('new-provider-key');
  if (keyField) keyField.placeholder = tConfig('apiKeyPlaceholder');

  const addBtn = $('new-provider-add-btn');
  if (addBtn) addBtn.textContent = tConfig('addProviderBtn');
  const cancelBtn = $('new-provider-cancel-btn');
  if (cancelBtn) cancelBtn.textContent = tConfig('cancelBtn');
  const showAddBtn = $('show-add-provider-btn');
  if (showAddBtn) showAddBtn.textContent = '➕ ' + tConfig('addProvider');

  const emptyDiv = $('providers-empty');
  if (emptyDiv) {
    const divs = emptyDiv.querySelectorAll('div');
    if (divs[1]) divs[1].textContent = tConfig('noProviderConfigured');
    if (divs[2]) divs[2].textContent = tConfig('clickToAddProvider');
  }

  const sections = document.querySelectorAll('.settings-section-title');
  if (sections.length >= 3) {
    sections[0].textContent = tConfig('agentBehavior');
    sections[1].textContent = tConfig('memoryContext');
    sections[2].textContent = tConfig('uiSection');
  }

  const fieldLabels = document.querySelectorAll('#tab-general label.field-label');
  if (fieldLabels.length >= 1) fieldLabels[0].textContent = tConfig('maxIterationsLabel');
  if (fieldLabels.length >= 2) fieldLabels[1].textContent = tConfig('maxTokensLabel');
  if (fieldLabels.length >= 3) fieldLabels[2].textContent = tConfig('retentionLabel');
  if (fieldLabels.length >= 4) fieldLabels[3].textContent = tConfig('maxTabSessionsLabel');
  if (fieldLabels.length >= 5) fieldLabels[4].textContent = tConfig('uiLangLabel');
  if (fieldLabels.length >= 6) fieldLabels[5].textContent = tConfig('agentLangLabel');
  if (fieldLabels.length >= 7) fieldLabels[6].textContent = tConfig('bestPracticesLabel');
  if (fieldLabels.length >= 8) fieldLabels[7].textContent = tConfig('systemPromptLabel');

  const fieldHints = document.querySelectorAll('#tab-general .field-hint');
  if (fieldHints.length >= 1) fieldHints[0].textContent = tConfig('maxIterationsHint');
  if (fieldHints.length >= 2) fieldHints[1].textContent = tConfig('maxTokensHint');
  if (fieldHints.length >= 3) fieldHints[2].textContent = tConfig('maxTabSessionsHint');
  if (fieldHints.length >= 4) fieldHints[3].textContent = tConfig('bestPracticesHint');
  if (fieldHints.length >= 5) fieldHints[4].textContent = tConfig('systemPromptHint');

  const toggleLabels = document.querySelectorAll('#tab-general .toggle-wrap > span:last-child');
  if (toggleLabels.length >= 5) {
    toggleLabels[0].textContent = tConfig('enableMemory');
    toggleLabels[1].textContent = tConfig('saveHistory');
    toggleLabels[2].textContent = tConfig('thinkingCollapsedLabel');
    toggleLabels[3].textContent = tConfig('highlightClicksLabel');
    toggleLabels[4].textContent = tConfig('debugModeLabel');
  }

  const retention = $('history-retention');
  if (retention) {
    const opts = retention.options;
    if (opts.length >= 5) {
      opts[0].textContent = tConfig('retention7d');
      opts[1].textContent = tConfig('retention30d');
      opts[2].textContent = tConfig('retention90d');
      opts[3].textContent = tConfig('retention1y');
      opts[4].textContent = tConfig('retentionForever');
    }
  }

  const memSearch = $('mem-search');
  if (memSearch) memSearch.placeholder = tConfig('searchMemory');
  const memExport = $('mem-export-btn');
  if (memExport) memExport.textContent = tConfig('exportBtn');
  const memClear = $('mem-clear-btn');
  if (memClear) memClear.textContent = tConfig('clearAllBtn');
  const memKey = $('mem-new-key');
  if (memKey) memKey.placeholder = tConfig('memoryKeyPh');
  const memVal = $('mem-new-val');
  if (memVal) memVal.placeholder = tConfig('memoryValPh');
  const memAdd = $('mem-add-btn');
  if (memAdd) memAdd.textContent = tConfig('memoryAddBtn');

  const histSearch = $('hist-search');
  if (histSearch) histSearch.placeholder = tConfig('searchHistory');
  const histClear = $('hist-clear-btn');
  if (histClear) histClear.textContent = tConfig('clearAllBtn');

  const saveInfo = $('save-info');
  if (saveInfo) saveInfo.textContent = tConfig('unsavedChanges');
  const saveBtn = $('save-btn');
  if (saveBtn) saveBtn.textContent = tConfig('saveBtn');

  const systemPrompt = $('system-prompt');
  if (systemPrompt) systemPrompt.placeholder = tConfig('systemPromptPlaceholder');

  const bpSelect = $('best-practices');
  if (bpSelect) {
    const bpOpts = bpSelect.options;
    if (bpOpts.length >= 3) {
      bpOpts[0].textContent = tConfig('bestPracticesAuto');
      bpOpts[1].textContent = tConfig('bestPracticesAlways');
      bpOpts[2].textContent = tConfig('bestPracticesNever');
    }
  }

  const keyFieldLabel = $('new-provider-key')?.closest('.field')?.querySelector('.field-label');
  if (keyFieldLabel) keyFieldLabel.textContent = tConfig('apiKeyLabel');

  const aboutTitle = document.querySelector('.about-title');
  if (aboutTitle) aboutTitle.textContent = tConfig('aboutTitle');
  const aboutLinks = document.querySelectorAll('.about-links a');
  if (aboutLinks.length >= 2) {
    aboutLinks[0].textContent = tConfig('aboutWebsite');
    aboutLinks[1].textContent = tConfig('aboutSupport');
  }

  document.title = tConfig('configTitle');

  // ── Modes + Tools tabs ──
  // All static labels use data-i18n and are handled by the generic handler above.
  // Only wire dynamic/non-data-i18n elements below.
  const autoDetectSpan = document.querySelector('#tab-modes .toggle-wrap > span:last-child');
  if (autoDetectSpan && !autoDetectSpan.hasAttribute('data-i18n')) {
    autoDetectSpan.textContent = tConfig('autoDetectMode');
  }
}

// ─── STATE ────────────────────────────────────────
// configuredProviders: [{ instanceId, typeId, name, emoji, type, key, customUrl, models, selectedModel }]
// instanceId = unique id, permet plusieurs instances du même type (ex: 2x custom_openai)
let state = {
  configuredProviders:   [],   // liste des providers créés par l'utilisateur
  currentProvider:       '',   // instanceId du provider actif
  maxIterations:         15,
  maxInputTokens:        40000,
  memoryEnabled:         true,
  historyEnabled:        true,
  historyRetention:      30,
  uiLang:                'fr',
  agentLang:             'fr',
  thinkingCollapsed:     true,
  highlightClicks:       true,
  debugMode:             false,
  theme:                 'light',
  userSystemPrompt:      '',  // custom system prompt for the agent
  bestPractices:         'auto', // 'auto' | 'always' | 'never'
  maxTabSessions:        10, // limite du nombre d'onglets dans l'extension
  currentMode:           'libre',
  autoDetectMode:        true,
  enabledModes:          [], // sera rempli avec tous les modes par défaut
};

let memory = [];
let history = [];

// ─── INIT ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  const logoEl = document.getElementById('logo-icon-config');
  if (logoEl) logoEl.innerHTML = ICO('brain', 18);
  await loadCustomToolsFromStorage();
  await loadAll();
  updateI18nConfig();
  setupTabs();
  setupTheme();
  renderProviders();
  setupAddProviderForm();
  renderMemory();
  renderHistory();
  renderModes();
  setupSaveBar();
  applyFormValues();
  initToolsTab();
  initModesTab();

  // Language change listeners
  document.getElementById('ui-lang').addEventListener('change', (e) => {
    state.uiLang = e.target.value;
    updateI18nConfig();
    markUnsaved();
  });
  document.getElementById('agent-lang').addEventListener('change', (e) => {
    state.agentLang = e.target.value;
    markUnsaved();
  });

  document.getElementById('back-btn').addEventListener('click', () => window.close());
});

async function loadAll() {
  const keys = [
    'configuredProviders', 'currentProvider',
    'maxIterations', 'maxInputTokens', 'memoryEnabled', 'historyEnabled',
    'historyRetention', 'uiLang', 'agentLang', 'thinkingCollapsed', 'highlightClicks', 'debugMode', 'theme',
    'userSystemPrompt', 'bestPractices', 'maxTabSessions',
    'persistentMemory',
    // Legacy keys for migration
    'providerKeys', 'providerModels', 'providerSelectedModel', 'providerCustomUrl',
  ];
  const stored = await chrome.storage.local.get(keys);

  if (stored.configuredProviders && stored.configuredProviders.length > 0) {
    state.configuredProviders = stored.configuredProviders;
  } else if (stored.providerKeys && Object.keys(stored.providerKeys).length > 0) {
    state.configuredProviders = migrateFromV4(stored);
  }

  if (stored.currentProvider) state.currentProvider = stored.currentProvider;
  if (stored.maxIterations)   state.maxIterations   = stored.maxIterations;
  if (stored.maxInputTokens)  state.maxInputTokens  = stored.maxInputTokens;
  if (stored.memoryEnabled  !== undefined) state.memoryEnabled  = stored.memoryEnabled;
  if (stored.historyEnabled !== undefined) state.historyEnabled = stored.historyEnabled;
  if (stored.historyRetention) state.historyRetention = stored.historyRetention;
  if (stored.uiLang)          state.uiLang          = stored.uiLang;
  if (stored.agentLang)       state.agentLang       = stored.agentLang;
  if (stored.thinkingCollapsed !== undefined) state.thinkingCollapsed = stored.thinkingCollapsed;
  if (stored.highlightClicks !== undefined) state.highlightClicks = stored.highlightClicks;
  if (stored.debugMode !== undefined) state.debugMode = stored.debugMode;
  if (stored.theme)           state.theme           = stored.theme;
  if (stored.userSystemPrompt) state.userSystemPrompt = stored.userSystemPrompt;
  if (stored.bestPractices)    state.bestPractices    = stored.bestPractices;
  if (stored.maxTabSessions)  state.maxTabSessions  = stored.maxTabSessions;
  if (stored.currentMode)    state.currentMode    = stored.currentMode;
  if (stored.autoDetectMode !== undefined) state.autoDetectMode = stored.autoDetectMode;
  if (stored.enabledModes && stored.enabledModes.length > 0) {
    state.enabledModes = stored.enabledModes;
  } else {
    state.enabledModes = Object.keys(BUILTIN_MODES);
  }

  memory = stored.persistentMemory || [];
  await loadHistory();
}

// Migrate v4 flat storage to new configuredProviders array
function migrateFromV4(stored) {
  const keys = stored.providerKeys || {};
  const models = stored.providerModels || {};
  const selected = stored.providerSelectedModel || {};
  const urls = stored.providerCustomUrl || {};
  const result = [];
  for (const [typeId, key] of Object.entries(keys)) {
    if (!key) continue;
    const catalog = PROVIDER_CATALOG[typeId];
    if (!catalog) continue;
    result.push({
      instanceId: typeId + '_' + Date.now(),
      typeId,
      name: catalog.name,
      emoji: catalog.emoji,
      type: catalog.type,
      key,
      customUrl: urls[typeId] || '',
      models: models[typeId] || presetModelsFor(typeId),
      selectedModel: selected[typeId] || '',
    });
  }
  return result;
}

function applyFormValues() {
  document.getElementById('max-iterations').value  = state.maxIterations;
  document.getElementById('max-tokens').value       = state.maxInputTokens;
  document.getElementById('memory-enabled').checked = state.memoryEnabled;
  document.getElementById('history-enabled').checked= state.historyEnabled;
  document.getElementById('history-retention').value= state.historyRetention;
  document.getElementById('ui-lang').value          = state.uiLang || 'fr';
  document.getElementById('agent-lang').value       = state.agentLang || 'fr';
  document.getElementById('thinking-collapsed').checked = state.thinkingCollapsed;
  document.getElementById('highlight-clicks').checked = state.highlightClicks;
  document.getElementById('debug-mode').checked = state.debugMode;
  document.getElementById('theme-toggle').checked   = state.theme === 'dark';
  document.getElementById('system-prompt').value    = state.userSystemPrompt || '';
  document.getElementById('best-practices').value   = state.bestPractices || 'auto';
  document.getElementById('max-tab-sessions').value = state.maxTabSessions || 10;
}

// ─── TABS ──────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab)?.classList.add('active');
    });
  });
}

// ─── THEME ──────────────────────────────────────
function setupTheme() {
  document.body.setAttribute('data-theme', state.theme);
  document.getElementById('theme-toggle').addEventListener('change', e => {
    state.theme = e.target.checked ? 'dark' : 'light';
    document.body.setAttribute('data-theme', state.theme);
    markUnsaved();
  });
}

// ─── ADD PROVIDER FORM ──────────────────────────
function setupAddProviderForm() {
  const showBtn   = document.getElementById('show-add-provider-btn');
  const form      = document.getElementById('add-provider-form');
  const cancelBtn = document.getElementById('new-provider-cancel-btn');
  const addBtn    = document.getElementById('new-provider-add-btn');
  const typeSelect= document.getElementById('new-provider-type');
  const urlField  = document.getElementById('new-provider-url-field');
  const nameField = document.getElementById('new-provider-name-field');
  const docsLink  = document.getElementById('new-provider-docs-link');
  const keyInput  = document.getElementById('new-provider-key');

  showBtn.addEventListener('click', () => {
    form.style.display = 'block';
    showBtn.style.display = 'none';
    typeSelect.value = '';
    document.getElementById('new-provider-key').value = '';
    document.getElementById('new-provider-url').value = '';
    document.getElementById('new-provider-name').value = '';
    urlField.style.display = 'none';
    nameField.style.display = 'none';
    docsLink.innerHTML = '';
    typeSelect.focus();
  });

  cancelBtn.addEventListener('click', () => {
    form.style.display = 'none';
    showBtn.style.display = '';
  });

  typeSelect.addEventListener('change', () => {
    const typeId = typeSelect.value;
    const catalog = PROVIDER_CATALOG[typeId];
    if (!catalog) { urlField.style.display = 'none'; nameField.style.display = 'none'; return; }

    // Show URL field for custom providers
    const isCustom = typeId.startsWith('custom_');
    urlField.style.display  = isCustom ? 'flex' : 'none';
    nameField.style.display = isCustom ? 'flex' : 'none';

    // Update URL hint based on provider type
    const hintEl = document.getElementById('provider-url-hint');
    if (hintEl) {
      if (typeId === 'custom_anthropic') {
        hintEl.innerHTML = 'URL complète jusqu\'au <code>/v1</code> — ex: <code>https://votre-proxy.com/v1</code>';
      } else {
        hintEl.innerHTML = 'URL complète jusqu\'au <code>/v1</code> — ex: <code>http://localhost:11434/v1</code> (Ollama), <code>http://localhost:1234/v1</code> (LM Studio)';
      }
    }

    keyInput.placeholder = catalog.placeholder;
    docsLink.innerHTML = catalog.docsUrl
      ? `<a href="${catalog.docsUrl}" target="_blank" style="color:var(--accent2)">🔗 Obtenir une clé API</a>`
      : '';
  });

  addBtn.addEventListener('click', addProvider);
}

async function addProvider() {
  const typeId   = document.getElementById('new-provider-type').value;
  const key      = document.getElementById('new-provider-key').value.trim();
  const customUrl= document.getElementById('new-provider-url').value.trim();
  const customName = document.getElementById('new-provider-name').value.trim();

  if (!typeId) { alert(tConfig('selectProviderType')); return; }
  if (!key)    { alert(tConfig('apiKeyRequired')); return; }

  const isCustom = typeId.startsWith('custom_');
  if (isCustom && !customUrl) { alert(tConfig('baseUrlRequired')); return; }

  const catalog = PROVIDER_CATALOG[typeId];
  const instanceId = typeId + '_' + Date.now();

  const provider = {
    instanceId,
    typeId,
    name:         customName || catalog.name,
    emoji:        catalog.emoji,
    type:         catalog.type,
    key,
    customUrl:    customUrl || '',
    models:       presetModelsFor(typeId),
    selectedModel: presetModelsFor(typeId)[0]?.id || '',
  };

  state.configuredProviders.push(provider);

  // Auto-select if first one
  if (state.configuredProviders.length === 1) {
    state.currentProvider = instanceId;
  }

  // Hide form
  document.getElementById('add-provider-form').style.display = 'none';
  document.getElementById('show-add-provider-btn').style.display = '';

  renderProviders();
  markUnsaved();
  await saveAll();
}

// ─── PROVIDERS LIST ─────────────────────────────
function renderProviders() {
  const grid  = document.getElementById('provider-grid');
  const empty = document.getElementById('providers-empty');
  const count = document.getElementById('providers-count');

  const n = state.configuredProviders.length;
  count.textContent = `${n} ${tConfig('providerCountLabel')}`;

  // Remove existing cards (keep empty placeholder)
  grid.querySelectorAll('.provider-card').forEach(c => c.remove());

  if (n === 0) {
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  state.configuredProviders.forEach(p => {
    grid.appendChild(buildProviderCard(p));
  });
}

function buildProviderCard(provider) {
  const { instanceId, typeId, name, emoji, type, key, customUrl, models, selectedModel } = provider;
  const isCustom   = typeId.startsWith('custom_');
  const isActive   = instanceId === state.currentProvider;
  const catalog    = PROVIDER_CATALOG[typeId] || {};

  const card = document.createElement('div');
  card.className = `provider-card configured`;
  card.id = `pcard-${instanceId}`;

  card.innerHTML = `
    <div class="provider-card-header">
      <div class="provider-card-name">
        <span class="provider-emoji">${emoji}</span>
        <span>${escHtml(name)}</span>
        ${isActive ? `<span class="provider-status ok">${tConfig('active')}</span>` : ''}
      </div>
      <div style="display:flex;gap:6px;align-items:center">
        ${!isActive ? `<button class="fetch-btn" data-action="set-active" title="${tConfig('useProvider')}">${tConfig('activate')}</button>` : ''}
        <button class="provider-delete-btn" data-action="delete" title="${tConfig('deleteProvider')}">🗑</button>
      </div>
    </div>
    <div class="provider-card-body">
      ${isCustom ? `
        <div class="field">
          <label class="field-label">${tConfig('baseUrlLabel')}</label>
          <input class="input input-mono" data-field="url" value="${escHtml(customUrl)}" placeholder="https://..."/>
        </div>
      ` : ''}
      <div class="field">
        <label class="field-label">${tConfig('apiKeyLabel')}</label>
        <div class="provider-card-row" style="align-items:center">
          <div class="field" style="flex:1">
            <input type="password" class="input input-mono" data-field="key"
              placeholder="${catalog.placeholder || tConfig('apiKeyPlaceholder')}"
              value="${'•'.repeat(Math.min(key.length, 12))}"/>
          </div>
          <button class="fetch-btn" data-action="test" title="${tConfig('testConnection')}">${tConfig('testBtn')}</button>
        </div>
        <span class="test-result" data-test-result></span>
      </div>
      <div class="field">
        <label class="field-label">${tConfig('defaultModel')}</label>
        <div class="provider-card-row">
          <div class="model-select-wrap" style="flex:1">
            <select class="input select" data-field="model">
              ${models.length === 0
                ? `<option value="">${tConfig('clickRefresh')}</option>`
                : models.map(m => `<option value="${m.id}"${m.id === selectedModel ? ' selected' : ''}>${m.name || m.id}</option>`).join('')}
            </select>
            ${models.length > 0 ? `<span class="model-count">${models.length}</span>` : ''}
          </div>
          <button class="fetch-btn" data-action="fetch-models" title="${tConfig('refreshModels')}">${tConfig('refreshBtn')}</button>
        </div>
      </div>
    </div>
  `;

  // Events
  card.querySelector('[data-action="delete"]').addEventListener('click', () => deleteProvider(instanceId));
  card.querySelector('[data-action="test"]').addEventListener('click', () => testProvider(instanceId, card));
  card.querySelector('[data-action="fetch-models"]').addEventListener('click', () => fetchModels(instanceId, card));

  card.querySelector('[data-action="set-active"]')?.addEventListener('click', () => {
    state.currentProvider = instanceId;
    renderProviders();
    markUnsaved();
    saveAll();
  });

  card.querySelector('[data-field="key"]').addEventListener('focus', e => {
    if (e.target.value.startsWith('•')) e.target.value = '';
  });
  card.querySelector('[data-field="key"]').addEventListener('blur', e => {
    const val = e.target.value.trim();
    if (val && !val.startsWith('•')) {
      const p = state.configuredProviders.find(p => p.instanceId === instanceId);
      if (p) { p.key = val; markUnsaved(); }
    }
    if (!e.target.value) {
      const p = state.configuredProviders.find(p => p.instanceId === instanceId);
      e.target.value = '•'.repeat(Math.min((p?.key || '').length, 12));
    }
  });
  card.querySelector('[data-field="model"]').addEventListener('change', e => {
    const p = state.configuredProviders.find(p => p.instanceId === instanceId);
    if (p) { p.selectedModel = e.target.value; markUnsaved(); }
  });
  if (isCustom) {
    card.querySelector('[data-field="url"]')?.addEventListener('change', e => {
      const p = state.configuredProviders.find(p => p.instanceId === instanceId);
      if (p) { p.customUrl = e.target.value.trim(); markUnsaved(); }
    });
  }

  return card;
}

function deleteProvider(instanceId) {
  if (!confirm(tConfig('deleteConfirm'))) return;
  state.configuredProviders = state.configuredProviders.filter(p => p.instanceId !== instanceId);
  if (state.currentProvider === instanceId) {
    state.currentProvider = state.configuredProviders[0]?.instanceId || '';
  }
  renderProviders();
  markUnsaved();
  saveAll();
}

// ─── TEST & FETCH MODELS ────────────────────────
async function testProvider(instanceId, card) {
  const p = state.configuredProviders.find(p => p.instanceId === instanceId);
  if (!p) return;

  const resultEl = card.querySelector('[data-test-result]');
  const btn = card.querySelector('[data-action="test"]');
  const keyInput = card.querySelector('[data-field="key"]');
  const key = keyInput.value.startsWith('•') ? p.key : keyInput.value.trim();

  if (!key) { resultEl.textContent = '⚠ Clé API manquante'; resultEl.style.color = 'var(--warn)'; return; }

  btn.textContent = '⏳'; btn.classList.add('loading');
  resultEl.textContent = '';

  try {
    const resp = await sendToBg('FETCH_MODELS', { provider: p.typeId, apiKey: key, baseUrl: p.customUrl });
    if (resp.error) throw new Error(resp.error);
    resultEl.textContent = `✅ OK — ${resp.models.length} modèles`;
    resultEl.style.color = 'var(--success)';
    p.key = key;
    markUnsaved();
  } catch (e) {
    resultEl.textContent = `❌ ${e.message}`;
    resultEl.style.color = 'var(--error)';
  } finally {
    btn.textContent = '🔌 Test'; btn.classList.remove('loading');
  }
}

async function fetchModels(instanceId, card) {
  const p = state.configuredProviders.find(p => p.instanceId === instanceId);
  if (!p) return;

  const btn = card.querySelector('[data-action="fetch-models"]');
  const resultEl = card.querySelector('[data-test-result]');
  const keyInput = card.querySelector('[data-field="key"]');
  const key = keyInput.value.startsWith('•') ? p.key : keyInput.value.trim();

  btn.textContent = '⏳'; btn.classList.add('loading');

  try {
    const resp = await sendToBg('FETCH_MODELS', { provider: p.typeId, apiKey: key, baseUrl: p.customUrl });
    if (resp.error) throw new Error(resp.error);
    p.models = resp.models;
    if (!p.selectedModel && resp.models.length > 0) p.selectedModel = resp.models[0].id;

    const sel = card.querySelector('[data-field="model"]');
    sel.innerHTML = resp.models.map(m => `<option value="${m.id}"${m.id === p.selectedModel ? ' selected' : ''}>${m.name || m.id}</option>`).join('');

    let wrap = card.querySelector('.model-select-wrap');
    let cntEl = wrap.querySelector('.model-count');
    if (!cntEl) { cntEl = document.createElement('span'); cntEl.className = 'model-count'; wrap.appendChild(cntEl); }
    cntEl.textContent = resp.models.length;

    markUnsaved();
  } catch (e) {
    if (resultEl) { resultEl.textContent = `❌ ${e.message}`; resultEl.style.color = 'var(--error)'; }
  } finally {
    btn.textContent = '↻ Actualiser'; btn.classList.remove('loading');
  }
}

// ─── MEMORY ─────────────────────────────────────
function renderMemory(filter = '') {
  const list = document.getElementById('memory-list');
  const items = filter ? memory.filter(m => m.key.includes(filter) || m.value.includes(filter)) : memory;

  if (items.length === 0) {
    list.innerHTML = `<div class="memory-empty">${filter ? tConfig('noResults') : tConfig('noMemoryEntries')}</div>`;
    return;
  }

  list.innerHTML = items.map(m => `
    <div class="memory-item">
      <span class="memory-key">${escHtml(m.key)}</span>
      <span class="memory-val" title="${escHtml(m.value)}">${escHtml(m.value)}</span>
      <span class="memory-ts">${formatDate(m.timestamp)}</span>
      <button class="memory-del" data-key="${escHtml(m.key)}" title="Supprimer">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('.memory-del').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.key;
      memory = memory.filter(m => m.key !== key);
      await chrome.storage.local.set({ persistentMemory: memory });
      renderMemory(document.getElementById('mem-search').value);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Favicon error fallback handler
  document.body.addEventListener('error', e => {
    if (e.target.matches('img[data-fallback="none"]')) {
      e.target.style.display = 'none';
    }
  }, true);

  document.getElementById('mem-search')?.addEventListener('input', e => renderMemory(e.target.value));
  document.getElementById('mem-add-btn')?.addEventListener('click', async () => {
    const k = document.getElementById('mem-new-key').value.trim();
    const v = document.getElementById('mem-new-val').value.trim();
    if (!k || !v) return;
    const idx = memory.findIndex(m => m.key.toLowerCase() === k.toLowerCase());
    const entry = { key: k, value: v, timestamp: Date.now() };
    if (idx >= 0) memory[idx] = entry; else memory.push(entry);
    await chrome.storage.local.set({ persistentMemory: memory });
    document.getElementById('mem-new-key').value = '';
    document.getElementById('mem-new-val').value = '';
    renderMemory();
  });
  document.getElementById('mem-clear-btn')?.addEventListener('click', async () => {
    if (confirm('Effacer toute la mémoire ?')) {
      memory = [];
      await chrome.storage.local.set({ persistentMemory: [] });
      renderMemory();
    }
  });
  document.getElementById('mem-export-btn')?.addEventListener('click', () => {
    const csv = 'clé,valeur,date\n' + memory.map(m =>
      `"${m.key.replace(/"/g, '""')}","${m.value.replace(/"/g, '""')}","${new Date(m.timestamp).toISOString()}"`
    ).join('\n');
    downloadText(csv, 'memory-export.csv', 'text/csv');
  });
});

// ─── HISTORY ────────────────────────────────────
async function loadHistory() {
  const { historyIndex } = await chrome.storage.local.get('historyIndex');
  const index = historyIndex || [];
  if (index.length === 0) { history = []; return; }
  const sessionKeys = index.map(id => `hist_${id}`);
  const sessions = await chrome.storage.local.get(sessionKeys);
  history = index.map(id => sessions[`hist_${id}`]).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
}

function renderHistory(filter = '') {
  const list = document.getElementById('history-list');
  const items = filter
    ? history.filter(h => (h.title || '').toLowerCase().includes(filter.toLowerCase()) ||
                          (h.url || '').toLowerCase().includes(filter.toLowerCase()) ||
                          (h.summary || '').toLowerCase().includes(filter.toLowerCase()))
    : history;

  if (items.length === 0) {
    list.innerHTML = `<div class="history-empty">${filter ? tConfig('noResults') : tConfig('noHistorySaved') + '<br><small style="color:var(--text3)">' + tConfig('historyHint') + '</small>'}</div>`;
    return;
  }

  list.innerHTML = items.map(sess => `
    <div class="history-item" data-id="${sess.id}">
      <img class="history-favicon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(sess.url || '')}&sz=16" data-fallback="none" />
      <div class="history-meta">
        <div class="history-title">${escHtml(sess.title || 'Sans titre')}</div>
        <div class="history-url">${escHtml(sess.url || '')}</div>
        <div class="history-summary">${escHtml(sess.summary || sess.firstMessage || '')}</div>
        <div class="history-footer">
          <span class="history-date">${formatDate(sess.updatedAt)}</span>
          <span class="history-provider">${sess.provider || '—'}</span>
          <span class="history-msg-count">${sess.messageCount || 0} msg</span>
        </div>
      </div>
      <button class="history-del" data-id="${sess.id}" title="Supprimer">✕</button>
    </div>
  `).join('');

  list.querySelectorAll('.history-del').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      await deleteHistorySession(btn.dataset.id);
      renderHistory(document.getElementById('hist-search').value);
    });
  });
}

async function deleteHistorySession(id) {
  history = history.filter(h => h.id !== id);
  const { historyIndex } = await chrome.storage.local.get('historyIndex');
  await chrome.storage.local.remove(`hist_${id}`);
  await chrome.storage.local.set({ historyIndex: (historyIndex || []).filter(i => i !== id) });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('hist-search')?.addEventListener('input', e => renderHistory(e.target.value));
  document.getElementById('hist-clear-btn')?.addEventListener('click', async () => {
    if (confirm('Effacer tout l\'historique ?')) {
      const { historyIndex } = await chrome.storage.local.get('historyIndex');
      await chrome.storage.local.remove([...(historyIndex || []).map(id => `hist_${id}`), 'historyIndex']);
      history = [];
      renderHistory();
    }
  });
});

// ─── SAVE ────────────────────────────────────────
function setupSaveBar() {
  document.getElementById('save-btn').addEventListener('click', saveAll);
  setSaveInfo('Chargé');
}

async function saveAll() {
  state.maxIterations   = parseInt(document.getElementById('max-iterations').value) || 15;
  state.maxInputTokens  = parseInt(document.getElementById('max-tokens').value) || 40000;
  state.memoryEnabled   = document.getElementById('memory-enabled').checked;
  state.historyEnabled  = document.getElementById('history-enabled').checked;
  state.historyRetention= parseInt(document.getElementById('history-retention').value) || 30;
  state.uiLang          = document.getElementById('ui-lang').value;
  state.agentLang       = document.getElementById('agent-lang').value;
  state.thinkingCollapsed = document.getElementById('thinking-collapsed').checked;
  state.highlightClicks = document.getElementById('highlight-clicks').checked;
  state.debugMode = document.getElementById('debug-mode').checked;
  state.theme           = document.getElementById('theme-toggle').checked ? 'dark' : 'light';
  state.userSystemPrompt = document.getElementById('system-prompt').value || '';
  state.bestPractices    = document.getElementById('best-practices').value || 'auto';
  state.maxTabSessions  = parseInt(document.getElementById('max-tab-sessions').value) || 10;
  state.autoDetectMode  = document.getElementById('auto-detect-mode')?.checked ?? true;

  // Collect enabled modes from checkboxes
  const modeCheckboxes = document.querySelectorAll('.mode-toggle-checkbox');
  const enabledModes = [];
  modeCheckboxes.forEach(cb => {
    if (cb.checked) enabledModes.push(cb.value);
  });
  if (enabledModes.length === 0) {
    // Fallback to all modes if none selected
    enabledModes.push(...Object.keys(BUILTIN_MODES));
  }
  state.enabledModes = enabledModes;

  // Build legacy-compatible storage for sidepanel.js to read
  const providerKeys = {};
  const providerModels = {};
  const providerSelectedModel = {};
  const providerCustomUrl = {};
  state.configuredProviders.forEach(p => {
    providerKeys[p.instanceId]          = p.key;
    providerModels[p.instanceId]        = p.models;
    providerSelectedModel[p.instanceId] = p.selectedModel;
    providerCustomUrl[p.instanceId]     = p.customUrl;
  });

  await chrome.storage.local.set({
    configuredProviders:   state.configuredProviders,
    currentProvider:       state.currentProvider,
    providerKeys,
    providerModels,
    providerSelectedModel,
    providerCustomUrl,
    maxIterations:         state.maxIterations,
    maxInputTokens:        state.maxInputTokens,
    memoryEnabled:         state.memoryEnabled,
    historyEnabled:        state.historyEnabled,
    historyRetention:      state.historyRetention,
    uiLang:               state.uiLang,
    agentLang:            state.agentLang,
    thinkingCollapsed:     state.thinkingCollapsed,
    highlightClicks:     state.highlightClicks,
    debugMode:            state.debugMode,
    theme:                 state.theme,
    userSystemPrompt:      state.userSystemPrompt,
    bestPractices:         state.bestPractices,
    maxTabSessions:        state.maxTabSessions,
    currentMode:           state.currentMode,
    autoDetectMode:        state.autoDetectMode,
    enabledModes:          state.enabledModes,
  });

  setSaveInfo(`${tConfig('changesSaved')} — ${new Date().toLocaleTimeString()}`);
  renderProviders();
  // Signal sidepanel to reload
  chrome.runtime.sendMessage({ type: 'SETTINGS_SAVED' }).catch(e => { console.warn('BrowserMind: settings saved notification failed', e.message); });
}

function markUnsaved() {
  setSaveInfo('⚠ ' + tConfig('markUnsaved'));
  document.getElementById('save-info').style.color = 'var(--warn)';
}
function setSaveInfo(text) {
  const el = document.getElementById('save-info');
  el.textContent = text;
  el.style.color = 'var(--text3)';
}

// ─── HELPERS ─────────────────────────────────────
async function sendToBg(type, data) {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ type, ...data }, resp => {
      if (chrome.runtime.lastError) rej(new Error(chrome.runtime.lastError.message));
      else res(resp);
    });
  });
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts), now = new Date(), diff = now - d;
  const localeMap = { fr: 'fr-FR', en: 'en-US', es: 'es-ES', it: 'it-IT', de: 'de-DE', pt: 'pt-BR' };
  const locale = localeMap[state.uiLang] || 'fr-FR';
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (diff < 60000) return rtf.format(-Math.floor(diff / 1000), 'second');
  if (diff < 3600000) return rtf.format(-Math.floor(diff / 60000), 'minute');
  if (diff < 86400000) return rtf.format(-Math.floor(diff / 3600000), 'hour');
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}

function downloadText(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── MODES RENDERING ───────────────────────────────
function renderModes() {
  renderNativeModesList();
  renderCustomModesList();
  // Set auto-detect checkbox
  const autoDetect = document.getElementById('auto-detect-mode');
  if (autoDetect) autoDetect.checked = state.autoDetectMode !== false;
}

function renderNativeModesList() {
  const container = document.getElementById('modes-list');
  if (!container) return;

  const modes = BUILTIN_MODES;
  const enabledModes = state.enabledModes && state.enabledModes.length > 0
    ? state.enabledModes
    : Object.keys(modes);

  container.innerHTML = Object.values(modes).map(mode => {
    const isEnabled  = enabledModes.includes(mode.id);
    const isActive   = state.currentMode === mode.id;
    const toolCount  = mode.tools?.includes('*') ? 'tous' : (mode.tools?.length || 0) + ' outil(s)';
    return `
      <div class="mode-card${isActive ? ' active' : ''}">
        <div class="mode-card-icon">${mode.icon}</div>
        <div class="mode-card-info">
          <div class="mode-card-name">${mode.labelKey ? tConfig('mode' + mode.labelKey.replace('mode','')) || mode.id : mode.id}</div>
          <div class="mode-card-desc">${mode.description || ''}</div>
          <div class="mode-card-meta">${toolCount}</div>
        </div>
        <div class="mode-card-toggle">
          <label class="toggle">
            <input type="checkbox" class="mode-toggle-checkbox" value="${mode.id}" ${isEnabled ? 'checked' : ''}>
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.mode-toggle-checkbox').forEach(cb => {
    cb.addEventListener('change', markUnsaved);
  });
}

// ═══════════════════════════════════════════════
//  CUSTOM MODES — Passe C
// ═══════════════════════════════════════════════

let _customModes = {};   // { modeId: modeObject }
let _editingModeId = null;

async function initModesTab() {
  const data = await new Promise(r => chrome.storage.local.get(['customModes'], r));
  _customModes = data.customModes || {};
  renderCustomModesList();

  document.getElementById('add-mode-btn')?.addEventListener('click', () => openModeModal(null));
  document.getElementById('mode-modal-cancel')?.addEventListener('click', closeModeModal);
  document.getElementById('mode-modal-save')?.addEventListener('click', saveModeFromModal);

  // "Tous les outils" checkbox toggles the grid
  document.getElementById('mode-tools-all')?.addEventListener('change', e => {
    document.getElementById('mode-tools-grid').style.opacity = e.target.checked ? '0.35' : '1';
    document.getElementById('mode-tools-grid').style.pointerEvents = e.target.checked ? 'none' : '';
  });
}

function renderCustomModesList() {
  const container = document.getElementById('custom-modes-list');
  if (!container) return;

  const modes = Object.values(_customModes);
  if (modes.length === 0) {
    container.innerHTML = `<div class="field-hint" style="padding:8px 0">${tConfig('noCustomModes')}</div>`;
    return;
  }

  container.innerHTML = modes.map(m => {
    const toolCount = m.tools?.includes('*') ? 'tous les outils' : `${m.tools?.length || 0} outil(s)`;
    const promptPreview = (m.systemPromptExtra || '').slice(0, 80).replace(/\n/g, ' ');
    return `
      <div class="mode-card mode-card-custom">
        <div class="mode-card-icon">${m.icon || '🧩'}</div>
        <div class="mode-card-info">
          <div class="mode-card-name">${escHtml(m.label || m.id)}</div>
          <code class="tool-card-id">${escHtml(m.id)}</code>
          <div class="mode-card-desc">${escHtml(m.description || '')}</div>
          ${promptPreview ? `<div class="mode-card-prompt-preview">"${escHtml(promptPreview)}${m.systemPromptExtra?.length > 80 ? '…' : ''}"</div>` : ''}
          <div class="mode-card-meta">${toolCount}</div>
        </div>
        <div class="mode-card-toggle">
          <label class="toggle">
            <input type="checkbox" class="mode-toggle-checkbox" value="${m.id}" checked>
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="tool-card-actions" style="margin-left:4px">
          <button class="btn btn-ghost btn-xs" data-mode-edit="${m.id}">✏️</button>
          <button class="btn btn-danger btn-xs" data-mode-del="${m.id}">🗑</button>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-mode-edit]').forEach(btn => {
    btn.addEventListener('click', () => openModeModal(btn.dataset.modeEdit));
  });
  container.querySelectorAll('[data-mode-del]').forEach(btn => {
    btn.addEventListener('click', () => deleteCustomMode(btn.dataset.modeDel));
  });
  container.querySelectorAll('.mode-toggle-checkbox').forEach(cb => {
    cb.addEventListener('change', markUnsaved);
  });
}

function openModeModal(modeId) {
  _editingModeId = modeId;
  const modal = document.getElementById('mode-modal');
  const title = document.getElementById('mode-modal-title');
  if (!modal) return;

  // Populate tools grid
  const grid = document.getElementById('mode-tools-grid');
  const allTools = getAllRegisteredTools();
  grid.innerHTML = allTools.map(t => `
    <label class="mode-tool-checkbox-label" title="${escHtml(t.description)}">
      <input type="checkbox" class="mode-tool-cb" value="${t.name}">
      <span>${t.icon || '🔧'} ${escHtml(t.label || t.name)}</span>
    </label>
  `).join('');

  if (modeId && _customModes[modeId]) {
    const m = _customModes[modeId];
    title.textContent = `✏️ ${tConfig('editModeTitle')} — ${m.label || m.id}`;
    document.getElementById('mode-icon').value   = m.icon || '🧩';
    document.getElementById('mode-id').value     = m.id;
    document.getElementById('mode-id').disabled  = true;
    document.getElementById('mode-label').value  = m.label || '';
    document.getElementById('mode-desc').value   = m.description || '';
    document.getElementById('mode-prompt').value = m.systemPromptExtra || '';
    document.getElementById('mode-urls').value   = (m.urlPatterns || []).join(', ');

    const isAll = m.tools?.includes('*');
    document.getElementById('mode-tools-all').checked = isAll;
    grid.style.opacity = isAll ? '0.35' : '1';
    grid.style.pointerEvents = isAll ? 'none' : '';
    grid.querySelectorAll('.mode-tool-cb').forEach(cb => {
      cb.checked = isAll || (m.tools || []).includes(cb.value);
    });
  } else {
    title.textContent = tConfig('newModeTitle');
    document.getElementById('mode-icon').value   = '🧩';
    document.getElementById('mode-id').value     = '';
    document.getElementById('mode-id').disabled  = false;
    document.getElementById('mode-label').value  = '';
    document.getElementById('mode-desc').value   = '';
    document.getElementById('mode-prompt').value = '';
    document.getElementById('mode-urls').value   = '';
    document.getElementById('mode-tools-all').checked = true;
    grid.style.opacity = '0.35';
    grid.style.pointerEvents = 'none';
    grid.querySelectorAll('.mode-tool-cb').forEach(cb => { cb.checked = false; });
  }

  modal.style.display = 'flex';
}

function closeModeModal() {
  const modal = document.getElementById('mode-modal');
  if (modal) modal.style.display = 'none';
}

function saveModeFromModal() {
  const id     = document.getElementById('mode-id').value.trim();
  const icon   = document.getElementById('mode-icon').value.trim() || '🧩';
  const label  = document.getElementById('mode-label').value.trim();
  const desc   = document.getElementById('mode-desc').value.trim();
  const prompt = document.getElementById('mode-prompt').value.trim();
  const urlsRaw= document.getElementById('mode-urls').value.trim();
  const isAll  = document.getElementById('mode-tools-all').checked;

  if (!id || !label) { alert(tConfig('modeRequiredFields')); return; }
  if (!/^[a-z0-9_]+$/.test(id)) { alert(tConfig('modeIdFormat')); return; }
  if (!_editingModeId && BUILTIN_MODES[id]) {
    alert(tConfig('modeIdExists')); return;
  }

  const tools = isAll ? ['*'] : Array.from(
    document.querySelectorAll('.mode-tool-cb:checked')
  ).map(cb => cb.value);

  const urlPatterns = urlsRaw ? urlsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];

  const mode = {
    id, icon, label,
    labelKey: null,           // pas de clé i18n pour les modes custom
    description: desc,
    systemPromptExtra: prompt,
    tools,
    quickActions: [],
    apis: [],
    urlPatterns,
    isCustom: true,
  };

  _customModes[id] = mode;

  persistCustomModes(_customModes).then(() => {
    renderCustomModesList();
    closeModeModal();
    markUnsaved();
  });
}

function deleteCustomMode(modeId) {
  if (!confirm(tConfig('modeDeleteConfirm'))) return;
  delete _customModes[modeId];
  persistCustomModes(_customModes).then(() => {
    renderCustomModesList();
    markUnsaved();
  });
}

// ═══════════════════════════════════════════════
//  ONGLET OUTILS — Passe B
// ═══════════════════════════════════════════════

let _customTools = [];   // outils user en mémoire
let _editingToolIdx = -1; // index de l'outil en cours d'édition (-1 = nouveau)

async function initToolsTab() {
  // Charger les outils custom depuis storage
  const data = await new Promise(r => chrome.storage.local.get(['customTools', 'remoteToolsUrl', 'remoteToolsCache', 'remoteToolsCachedAt'], r));
  _customTools = data.customTools || [];

  renderNativeToolsList();
  renderCustomToolsList();
  renderRemoteToolsList(data.remoteToolsCache || [], data.remoteToolsCachedAt);

  // Pré-remplir l'URL distante
  const urlInput = document.getElementById('remote-tools-url');
  if (urlInput && data.remoteToolsUrl) urlInput.value = data.remoteToolsUrl;

  // Bouton charger outils distants
  document.getElementById('remote-tools-load-btn')?.addEventListener('click', loadRemoteToolsFromUI);

  // Bouton ajouter outil
  document.getElementById('add-tool-btn')?.addEventListener('click', () => openToolModal(-1));

  // Modal
  document.getElementById('tool-modal-cancel')?.addEventListener('click', closeToolModal);
  document.getElementById('tool-modal-save')?.addEventListener('click', saveToolFromModal);
  document.getElementById('tool-schema-example')?.addEventListener('click', () => {
    document.getElementById('tool-schema').value = JSON.stringify({
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Termes à rechercher' },
        limit: { type: 'number', description: 'Nombre de résultats max' }
      },
      required: ['query']
    }, null, 2);
  });
}

// ── Affichage des outils natifs ──
function renderNativeToolsList() {
  const container = document.getElementById('native-tools-list');
  if (!container) return;
  const natives = NATIVE_TOOLS;
  container.innerHTML = natives.map(t => `
    <div class="tool-card tool-card-native">
      <span class="tool-card-icon">${t.icon || '🔧'}</span>
      <div class="tool-card-info">
        <span class="tool-card-name">${escHtml(t.label || t.name)}</span>
        <span class="tool-card-desc">${escHtml(t.description)}</span>
      </div>
      <span class="tool-card-badge tool-badge-native">${tConfig('badgeNative')}</span>
    </div>
  `).join('');
}

// ── Affichage des outils custom ──
function renderCustomToolsList() {
  const container = document.getElementById('custom-tools-list');
  if (!container) return;
  if (_customTools.length === 0) {
    container.innerHTML = `<div class="field-hint" style="padding:8px 0">${tConfig('noCustomTools')}</div>`;
    return;
  }
  container.innerHTML = _customTools.map((t, i) => `
    <div class="tool-card">
      <span class="tool-card-icon">${t.icon || '🔧'}</span>
      <div class="tool-card-info">
        <span class="tool-card-name">${escHtml(t.label || t.name)}</span>
        <code class="tool-card-id">${escHtml(t.name)}</code>
        <span class="tool-card-desc">${escHtml(t.description)}</span>
      </div>
      <div class="tool-card-actions">
        <button class="btn btn-ghost btn-xs" data-tool-edit="${i}">✏️</button>
        <button class="btn btn-danger btn-xs" data-tool-del="${i}">🗑</button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-tool-edit]').forEach(btn => {
    btn.addEventListener('click', () => openToolModal(parseInt(btn.dataset.toolEdit)));
  });
  container.querySelectorAll('[data-tool-del]').forEach(btn => {
    btn.addEventListener('click', () => deleteCustomTool(parseInt(btn.dataset.toolDel)));
  });
}

// ── Affichage des outils distants ──
function renderRemoteToolsList(tools, cachedAt) {
  const container = document.getElementById('remote-tools-list');
  const status    = document.getElementById('remote-tools-status');
  if (!container) return;

  if (tools.length === 0) {
    container.innerHTML = '';
    return;
  }
  if (status && cachedAt) {
    const d = new Date(cachedAt);
    status.textContent = `✅ ${tools.length} ${tConfig('remoteToolsTitle').replace(/[^\w\s]/g,'')} — ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  }
  container.innerHTML = tools.map(t => `
    <div class="tool-card tool-card-remote">
      <span class="tool-card-icon">${t.icon || '🌐'}</span>
      <div class="tool-card-info">
        <span class="tool-card-name">${escHtml(t.label || t.name)}</span>
        <code class="tool-card-id">${escHtml(t.name)}</code>
        <span class="tool-card-desc">${escHtml(t.description)}</span>
      </div>
      <span class="tool-card-badge tool-badge-remote">${tConfig('badgeRemote')}</span>
    </div>
  `).join('');
}

// ── Charger outils distants depuis l'UI ──
async function loadRemoteToolsFromUI() {
  const urlInput = document.getElementById('remote-tools-url');
  const status   = document.getElementById('remote-tools-status');
  const url = urlInput?.value?.trim();
  if (!url) { if (status) status.textContent = tConfig('remoteToolsUrlRequired'); return; }

  if (status) status.textContent = tConfig('remoteToolsLoading');

  const result = await new Promise(r =>
    chrome.runtime.sendMessage({ type: 'LOAD_REMOTE_TOOLS', url }, r)
  );

  if (result?.error) {
    if (status) status.textContent = `${tConfig('remoteToolsError')} ${result.error}`;
    return;
  }

  renderRemoteToolsList(result.tools, Date.now());
  markUnsaved();
}

// ── Modal outil ──
function openToolModal(idx) {
  _editingToolIdx = idx;
  const modal = document.getElementById('tool-modal');
  const title = document.getElementById('tool-modal-title');
  if (!modal) return;

  if (idx === -1) {
    // Nouveau
    title.textContent = tConfig('newToolTitle');
    document.getElementById('tool-name').value      = '';
    document.getElementById('tool-icon').value      = '🔧';
    document.getElementById('tool-label').value     = '';
    document.getElementById('tool-desc').value      = '';
    document.getElementById('tool-schema').value    = JSON.stringify({ type:'object', properties:{}, required:[] }, null, 2);
    document.getElementById('tool-executor').value  = '';
    document.getElementById('tool-name').disabled   = false;
  } else {
    // Édition
    const t = _customTools[idx];
    title.textContent = `✏️ ${tConfig('editToolTitle')} — ${t.label || t.name}`;
    document.getElementById('tool-name').value      = t.name;
    document.getElementById('tool-icon').value      = t.icon || '🔧';
    document.getElementById('tool-label').value     = t.label || '';
    document.getElementById('tool-desc').value      = t.description || '';
    document.getElementById('tool-schema').value    = JSON.stringify(t.input_schema || {}, null, 2);
    document.getElementById('tool-executor').value  = t.executor || '';
    document.getElementById('tool-name').disabled   = true; // identifiant immuable
  }

  modal.style.display = 'flex';
}

function closeToolModal() {
  const modal = document.getElementById('tool-modal');
  if (modal) modal.style.display = 'none';
}

function saveToolFromModal() {
  const name     = document.getElementById('tool-name').value.trim();
  const icon     = document.getElementById('tool-icon').value.trim() || '🔧';
  const label    = document.getElementById('tool-label').value.trim();
  const desc     = document.getElementById('tool-desc').value.trim();
  const schemaRaw= document.getElementById('tool-schema').value.trim();
  const executor = document.getElementById('tool-executor').value || null;

  if (!name || !desc || !schemaRaw) {
    alert(tConfig('toolRequiredFields'));
    return;
  }
  if (!/^[a-z0-9_]+$/.test(name)) {
    alert(tConfig('toolIdFormat'));
    return;
  }

  let schema;
  try { schema = JSON.parse(schemaRaw); }
  catch(e) { alert(tConfig('toolSchemaInvalid') + ' ' + e.message); return; }

  const tool = {
    name, icon, label: label || name, description: desc,
    category: 'custom', source: 'user',
    input_schema: schema,
    executor: executor || null,
  };

  if (_editingToolIdx === -1) {
    // Vérifier unicité
    if (_customTools.find(t => t.name === name)) {
      alert(tConfig('toolIdDuplicate'));
      return;
    }
    _customTools.push(tool);
  } else {
    _customTools[_editingToolIdx] = tool;
  }

  chrome.storage.local.set({ customTools: _customTools }, () => {
    renderCustomToolsList();
    closeToolModal();
    markUnsaved();
  });
}

function deleteCustomTool(idx) {
  if (!confirm(tConfig('toolDeleteConfirm'))) return;
  _customTools.splice(idx, 1);
  chrome.storage.local.set({ customTools: _customTools }, () => renderCustomToolsList());
  markUnsaved();
}
