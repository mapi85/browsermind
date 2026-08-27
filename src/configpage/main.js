// ═══════════════════════════════════════════════
//  BrowserMind — Settings page
//
//  Two tabs and one guided flow for adding a service. The previous version
//  saved a provider without ever contacting it, left the model list empty for
//  half the catalog, and reported "connected" for providers it had not called.
//  Nothing is stored here until the service has actually answered.
// ═══════════════════════════════════════════════

import { loadSettings, saveSettings, loadPersistentMemory, deleteMemoryEntry } from '../shared/settings.js';
import { initI18n, applyI18n, t, LANG_LABELS, SUPPORTED_LANGS } from '../shared/i18n.js';
import {
  PROVIDER_CATALOG, FEATURED_PROVIDERS, OTHER_PROVIDERS,
  presetModelsFor, defaultModelFor,
} from '../shared/providers.js';
import { ICO, providerAvatar } from '../shared/icons.js';

const $ = (id) => document.getElementById(id);

let settings = null;
let memory = [];
let history = [];
let dirty = false;

// ─── BOOT ───────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  settings = await loadSettings();
  await initI18n(settings.uiLang);

  applyTheme(settings.theme);
  $('brand-mark').innerHTML = ICO('brain', 20);
  $('add-provider-icon').innerHTML = ICO('plus', 15);
  $('wizard-close').innerHTML = ICO('x', 16);

  buildLanguageOptions();
  applyI18n();
  fillForm();

  memory = await loadPersistentMemory();
  history = await loadHistory();
  renderProviders();
  renderMemory();
  renderHistory();

  wireTabs();
  wireForm();
  wireWizard();
  wireLists();

  // Land straight on the service tab when there is nothing set up yet.
  if (settings.configuredProviders.length === 0) openWizard();
});

function applyTheme(theme) {
  if (theme === 'light' || theme === 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function buildLanguageOptions() {
  const ui = $('ui-lang');
  const agent = $('agent-lang');

  const auto = new Option(t('optAuto'), '');
  const same = new Option(t('optSameAsUi'), '');
  ui.replaceChildren(auto, ...SUPPORTED_LANGS.map(l => new Option(LANG_LABELS[l], l)));
  agent.replaceChildren(same, ...SUPPORTED_LANGS.map(l => new Option(LANG_LABELS[l], l)));
}

function fillForm() {
  $('ui-lang').value = settings.uiLang || '';
  $('agent-lang').value = settings.agentLang || '';
  $('theme').value = settings.theme || 'system';
  $('highlight-actions').checked = settings.highlightActions !== false;
  $('system-prompt').value = settings.userSystemPrompt || '';
  $('max-iterations').value = settings.maxIterations;
  $('nav-always-allow').checked = !!settings.navAlwaysAllow;
  $('memory-enabled').checked = settings.memoryEnabled !== false;
  $('history-enabled').checked = settings.historyEnabled !== false;
  $('history-retention').value = settings.historyRetention;
  $('debug-mode').checked = !!settings.debugMode;
}

// ─── TABS ───────────────────────────────────────

function wireTabs() {
  $('tabs').addEventListener('click', (e) => {
    const button = e.target.closest('.tab');
    if (!button) return;

    for (const tab of document.querySelectorAll('.tab')) {
      tab.classList.toggle('is-active', tab === button);
    }
    for (const panel of document.querySelectorAll('.panel')) {
      panel.classList.toggle('is-active', panel.id === `panel-${button.dataset.tab}`);
    }
  });
}

// ─── GENERAL FORM ───────────────────────────────

function wireForm() {
  const watch = [
    'ui-lang', 'agent-lang', 'theme', 'highlight-actions', 'system-prompt',
    'max-iterations', 'nav-always-allow', 'memory-enabled', 'history-enabled',
    'history-retention', 'debug-mode',
  ];
  for (const id of watch) {
    $(id).addEventListener('change', markDirty);
    $(id).addEventListener('input', markDirty);
  }

  // Theme and language are visible immediately: waiting for Save to see a
  // colour change reads as a broken control.
  $('theme').addEventListener('change', (e) => applyTheme(e.target.value));
  $('ui-lang').addEventListener('change', async (e) => {
    await initI18n(e.target.value);
    buildLanguageOptions();
    applyI18n();
    fillForm();
    renderProviders();
    renderMemory();
    renderHistory();
  });

  $('save-btn').addEventListener('click', save);
}

function markDirty() {
  dirty = true;
  const state = $('save-state');
  state.textContent = t('saveUnsaved');
  state.classList.add('unsaved');
}

async function save() {
  const patch = {
    uiLang: $('ui-lang').value,
    agentLang: $('agent-lang').value,
    theme: $('theme').value,
    highlightActions: $('highlight-actions').checked,
    userSystemPrompt: $('system-prompt').value.trim(),
    maxIterations: clamp(parseInt($('max-iterations').value, 10) || 15, 3, 60),
    navAlwaysAllow: $('nav-always-allow').checked,
    memoryEnabled: $('memory-enabled').checked,
    historyEnabled: $('history-enabled').checked,
    historyRetention: clamp(parseInt($('history-retention').value, 10) || 30, 1, 200),
    debugMode: $('debug-mode').checked,
    configuredProviders: settings.configuredProviders,
    currentProvider: settings.currentProvider,
  };

  await saveSettings(patch);
  settings = await loadSettings();
  fillForm();

  dirty = false;
  const state = $('save-state');
  state.textContent = t('saveDone');
  state.classList.remove('unsaved');
}

// ─── PROVIDERS ──────────────────────────────────

function renderProviders() {
  const list = $('provider-list');
  const providers = settings.configuredProviders;

  $('providers-empty').hidden = providers.length > 0;
  list.replaceChildren(...providers.map(providerCard));
}

// Which cards are expanded. Kept outside the render so re-rendering a card
// does not fold it shut under the user.
const expanded = new Set();

function providerCard(provider) {
  const isActive = provider.instanceId === settings.currentProvider;
  const def = PROVIDER_CATALOG[provider.typeId] || {};
  const { letter, hue } = providerAvatar(provider.name);
  const isOpen = expanded.has(provider.instanceId);

  const card = document.createElement('div');
  card.className = 'provider-card' + (isActive ? ' is-active' : '');

  // ── Summary row ──
  const head = document.createElement('div');
  head.className = 'provider-head';

  const avatar = document.createElement('span');
  avatar.className = 'provider-avatar';
  avatar.textContent = letter;
  avatar.style.background = `hsl(${hue} 70% 94%)`;
  avatar.style.color = `hsl(${hue} 62% 34%)`;

  const main = document.createElement('div');
  main.className = 'provider-main';

  const name = document.createElement('div');
  name.className = 'provider-name';
  name.textContent = provider.name;
  if (isActive) {
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = t('providerActive');
    name.appendChild(badge);
  }

  const modelRow = document.createElement('div');
  modelRow.className = 'provider-model';
  const modelSelect = document.createElement('select');
  modelSelect.replaceChildren(...(provider.models || []).map((m) => {
    const option = new Option(m.name || m.id, m.id);
    option.selected = m.id === provider.selectedModel;
    return option;
  }));
  modelSelect.addEventListener('change', () => {
    provider.selectedModel = modelSelect.value;
    markDirty();
  });
  modelRow.appendChild(modelSelect);

  main.append(name, modelRow);

  const tools = document.createElement('div');
  tools.className = 'provider-tools';

  if (!isActive) {
    const use = document.createElement('button');
    use.className = 'btn btn-secondary btn-sm';
    use.textContent = t('providerUse');
    use.addEventListener('click', () => {
      settings.currentProvider = provider.instanceId;
      markDirty();
      renderProviders();
    });
    tools.appendChild(use);
  }

  const edit = document.createElement('button');
  edit.className = 'icon-btn';
  edit.title = t('providerEdit');
  edit.setAttribute('aria-expanded', String(isOpen));
  edit.innerHTML = ICO('settings', 15);
  edit.addEventListener('click', () => {
    if (isOpen) expanded.delete(provider.instanceId);
    else expanded.add(provider.instanceId);
    renderProviders();
  });
  tools.appendChild(edit);

  const remove = document.createElement('button');
  remove.className = 'icon-btn';
  remove.title = t('remove');
  remove.innerHTML = ICO('trash', 15);
  remove.addEventListener('click', () => {
    if (!confirm(t('providerRemoveConfirm'))) return;
    settings.configuredProviders = settings.configuredProviders.filter(p => p !== provider);
    if (settings.currentProvider === provider.instanceId) {
      settings.currentProvider = settings.configuredProviders[0]?.instanceId || '';
    }
    expanded.delete(provider.instanceId);
    markDirty();
    renderProviders();
  });
  tools.appendChild(remove);

  head.append(avatar, main, tools);
  card.appendChild(head);

  if (isOpen) card.appendChild(providerEditor(provider, def, modelSelect));
  return card;
}

function providerEditor(provider, def, modelSelect) {
  const body = document.createElement('div');
  body.className = 'provider-body';

  body.appendChild(textField({
    label: t('wizardNameLabel'),
    value: provider.name,
    onInput: (value) => { provider.name = value.trim() || def.name; markDirty(); },
  }));

  if (def.custom) {
    body.appendChild(textField({
      label: t('wizardUrlLabel'),
      value: provider.customUrl || '',
      mono: true,
      hint: t('wizardUrlHint'),
      onInput: (value) => { provider.customUrl = value.trim(); markDirty(); },
    }));
  }

  // The stored key is never written back into the field: an empty box that
  // says "unchanged" cannot leak its length, and cannot be saved by accident.
  body.appendChild(textField({
    label: t('wizardKeyLabel'),
    value: '',
    type: 'password',
    mono: true,
    placeholder: provider.key ? t('providerKeySet') : (def.placeholder || ''),
    onInput: (value) => {
      if (value.trim()) { provider.key = value.trim(); markDirty(); }
    },
  }));

  if (def.reasoning) {
    body.appendChild(switchField({
      label: t('providerThinking'),
      hint: def.reasoning === 'prompt' ? t('providerThinkingPromptHint') : t('providerThinkingHint'),
      checked: provider.thinking === true,
      onChange: (checked) => { provider.thinking = checked; markDirty(); },
    }));
  }

  body.appendChild(switchField({
    label: t('providerVision'),
    hint: t('providerVisionHint'),
    checked: provider.vision === undefined ? def.vision === true : provider.vision,
    onChange: (checked) => { provider.vision = checked; markDirty(); },
  }));

  // ── Live check ──
  const row = document.createElement('div');
  row.className = 'provider-check';

  const status = document.createElement('div');
  status.className = 'status-msg info';
  status.hidden = true;

  const button = document.createElement('button');
  button.className = 'btn btn-secondary btn-sm';
  button.textContent = t('providerCheck');
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.hidden = false;
    status.className = 'status-msg info';
    status.textContent = t('providerChecking');

    const started = Date.now();
    const result = await chrome.runtime.sendMessage({
      type: 'TEST_PROVIDER',
      typeId: provider.typeId,
      apiKey: provider.key,
      baseUrl: provider.customUrl,
      probeModel: modelSelect.value,
      mode: 'chat', // a listing proves the key works, not that the model answers
    });

    button.disabled = false;
    if (result?.ok) {
      status.className = 'status-msg ok';
      status.textContent = t('providerCheckOk', { seconds: ((Date.now() - started) / 1000).toFixed(1) });
    } else {
      status.className = 'status-msg error';
      status.textContent = testMessage(result?.code, result?.detail);
    }
  });

  row.append(button, status);
  body.appendChild(row);
  return body;
}

function textField({ label, value, hint, type = 'text', mono = false, placeholder = '', onInput }) {
  const field = document.createElement('label');
  field.className = 'field';

  const caption = document.createElement('span');
  caption.className = 'label';
  caption.textContent = label;

  const input = document.createElement('input');
  input.className = 'input' + (mono ? ' input-key' : '');
  input.type = type;
  input.value = value;
  input.placeholder = placeholder;
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.addEventListener('input', () => onInput(input.value));

  field.append(caption, input);
  if (hint) {
    const note = document.createElement('span');
    note.className = 'hint';
    note.textContent = hint;
    field.appendChild(note);
  }
  return field;
}

function switchField({ label, hint, checked, onChange }) {
  const row = document.createElement('label');
  row.className = 'switch-row';

  const text = document.createElement('span');
  text.innerHTML = '<span class="label"></span><span class="hint"></span>';
  text.querySelector('.label').textContent = label;
  text.querySelector('.hint').textContent = hint || '';

  const toggle = document.createElement('span');
  toggle.className = 'switch';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = checked;
  input.addEventListener('change', () => onChange(input.checked));
  const track = document.createElement('span');
  track.className = 'switch-track';
  toggle.append(input, track);

  row.append(text, toggle);
  return row;
}

// ─── WIZARD ─────────────────────────────────────

const draft = { typeId: '', key: '', url: '', name: '', models: [], model: '' };

function wireWizard() {
  $('add-provider-btn').addEventListener('click', openWizard);
  $('wizard-close').addEventListener('click', () => $('wizard').close());

  $('wizard-back-2').addEventListener('click', () => showStep(1));
  $('wizard-back-3').addEventListener('click', () => showStep(2));
  $('wizard-check').addEventListener('click', checkConnection);
  $('wizard-finish').addEventListener('click', finishWizard);

  $('show-all-models').addEventListener('click', () => {
    $('all-models-field').hidden = false;
    $('show-all-models').hidden = true;
  });

  $('wizard-key').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); checkConnection(); }
  });
}

function openWizard() {
  draft.typeId = '';
  draft.key = '';
  draft.url = '';
  draft.name = '';
  draft.models = [];
  draft.model = '';

  renderServiceGrid();
  showStep(1);
  $('wizard').showModal();
}

function renderServiceGrid() {
  $('service-grid').replaceChildren(...FEATURED_PROVIDERS.map(serviceCard));
  $('service-grid-others').replaceChildren(...OTHER_PROVIDERS.map(serviceCard));
}

function serviceCard(def) {
  const { letter, hue } = providerAvatar(def.name);

  const button = document.createElement('button');
  button.className = 'service-card';
  button.type = 'button';

  const avatar = document.createElement('span');
  avatar.className = 'provider-avatar';
  avatar.textContent = letter;
  avatar.style.background = `hsl(${hue} 70% 94%)`;
  avatar.style.color = `hsl(${hue} 62% 34%)`;

  const text = document.createElement('span');
  text.innerHTML = `<span class="service-card-name"></span><br><span class="service-card-vendor"></span>`;
  text.querySelector('.service-card-name').textContent = def.name;
  text.querySelector('.service-card-vendor').textContent = def.vendor;

  button.append(avatar, text);
  button.addEventListener('click', () => selectService(def.id));
  return button;
}

function selectService(typeId) {
  const def = PROVIDER_CATALOG[typeId];
  draft.typeId = typeId;
  draft.name = def.name;

  $('wizard-url-field').hidden = !def.custom;
  $('wizard-name-field').hidden = !def.custom;
  $('wizard-name').value = def.name;
  $('wizard-key').placeholder = def.placeholder || '';
  $('wizard-key').value = '';

  const link = $('wizard-key-link');
  link.hidden = !def.keyUrl;
  if (def.keyUrl) link.href = def.keyUrl;

  setStatus(null);
  showStep(2);
  $('wizard-key').focus();
}

function showStep(step) {
  for (const el of document.querySelectorAll('.wizard-step')) {
    el.classList.toggle('is-active', Number(el.dataset.step) === step);
  }
  for (const el of document.querySelectorAll('.wizard-steps li')) {
    const n = Number(el.dataset.step);
    el.classList.toggle('is-active', n === step);
    el.classList.toggle('is-done', n < step);
  }
}

function setStatus(kind, text) {
  const box = $('wizard-status');
  box.hidden = !kind;
  if (!kind) return;
  box.className = `status-msg ${kind}`;
  box.textContent = text;
}

async function checkConnection() {
  const def = PROVIDER_CATALOG[draft.typeId];
  draft.key = $('wizard-key').value.trim();
  draft.url = $('wizard-url').value.trim();
  draft.name = $('wizard-name').value.trim() || def.name;

  if (!draft.key && !def.keyOptional) {
    setStatus('warn', t('testMissingKey'));
    return;
  }

  const button = $('wizard-check');
  button.disabled = true;
  setStatus('info', t('wizardChecking'));

  const result = await chrome.runtime.sendMessage({
    type: 'TEST_PROVIDER',
    typeId: draft.typeId,
    apiKey: draft.key,
    baseUrl: draft.url,
    probeModel: defaultModelFor(draft.typeId, []),
  });

  button.disabled = false;

  if (!result?.ok) {
    setStatus('error', testMessage(result?.code, result?.detail));
    return;
  }

  draft.models = result.models.length > 0 ? result.models : presetModelsFor(draft.typeId);
  draft.model = defaultModelFor(draft.typeId, draft.models);

  setStatus(null);
  renderModelChoice();
  showStep(3);
}

function testMessage(code, detail) {
  const known = {
    badKey: 'testBadKey', noCredit: 'testNoCredit', badUrl: 'testBadUrl',
    rateLimited: 'testRateLimited', providerDown: 'testProviderDown',
    networkError: 'testNetwork', missingKey: 'testMissingKey', noModel: 'testNoModel',
  };
  if (known[code]) return t(known[code]);
  return detail ? t('errApi', { detail }) : t('testNetwork');
}

function renderModelChoice() {
  $('wizard-connected').textContent = t('wizardConnected', { count: draft.models.length });

  const curated = draft.models.filter(m => m.curated || m.tierKey).slice(0, 4);
  const shown = curated.length > 0 ? curated : draft.models.slice(0, 4);

  $('model-options').replaceChildren(...shown.map((model) => {
    const label = document.createElement('label');
    label.className = 'model-option';

    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'wizard-model';
    radio.value = model.id;
    radio.checked = model.id === draft.model;
    radio.addEventListener('change', () => { draft.model = model.id; });

    const main = document.createElement('span');
    main.className = 'model-option-main';
    main.innerHTML = `<span class="model-option-name"></span><span class="model-option-tier"></span>`;

    const name = model.name || model.id;
    main.querySelector('.model-option-name').textContent = name;

    // Curated models get a plain-language tier; anything else falls back to
    // its id, and stays blank when the id is already the visible name — a
    // self-hosted model listed twice reads as a rendering fault.
    const tier = main.querySelector('.model-option-tier');
    const subtitle = model.tierKey ? t(model.tierKey) : (model.id === name ? '' : model.id);
    tier.textContent = subtitle;
    tier.hidden = !subtitle;

    label.append(radio, main);
    return label;
  }));

  const all = $('all-models');
  all.replaceChildren(...draft.models.map((m) => {
    const option = new Option(m.name || m.id, m.id);
    option.selected = m.id === draft.model;
    return option;
  }));
  all.onchange = () => { draft.model = all.value; };

  const hasMore = draft.models.length > shown.length;
  $('show-all-models').hidden = !hasMore;
  $('all-models-field').hidden = true;
}

async function finishWizard() {
  const def = PROVIDER_CATALOG[draft.typeId];

  settings.configuredProviders.push({
    instanceId: `${draft.typeId}_${Date.now().toString(36)}`,
    typeId: draft.typeId,
    name: draft.name,
    key: draft.key,
    keyOptional: !!def.keyOptional,
    customUrl: draft.url,
    models: draft.models,
    selectedModel: draft.model,
  });

  if (!settings.currentProvider) {
    settings.currentProvider = settings.configuredProviders.at(-1).instanceId;
  }

  $('wizard').close();
  renderProviders();
  await save();
}

// ─── MEMORY & HISTORY ───────────────────────────

function wireLists() {
  $('memory-clear').addEventListener('click', async () => {
    if (!confirm(t('memoryForgetAll') + ' ?')) return;
    await chrome.storage.local.set({ persistentMemory: [] });
    memory = [];
    renderMemory();
  });

  $('history-search').addEventListener('input', (e) => renderHistory(e.target.value));

  $('history-clear').addEventListener('click', async () => {
    if (!confirm(t('historyClearConfirm'))) return;
    const { historyIndex } = await chrome.storage.local.get('historyIndex');
    await chrome.storage.local.remove([
      ...(historyIndex || []).map(id => `hist_${id}`),
      'historyIndex',
    ]);
    history = [];
    renderHistory();
  });
}

function renderMemory() {
  const list = $('memory-list');
  if (memory.length === 0) {
    list.replaceChildren(hintRow(t('memoryEmpty')));
    return;
  }

  list.replaceChildren(...memory.map((entry) => {
    const row = document.createElement('div');
    row.className = 'record';

    const main = document.createElement('div');
    main.className = 'record-main';
    main.innerHTML = `<div class="record-key"></div><div class="record-value"></div>`;
    main.querySelector('.record-key').textContent = entry.key;
    main.querySelector('.record-value').textContent = entry.value;

    const forget = document.createElement('button');
    forget.className = 'icon-btn';
    forget.title = t('memoryForget');
    forget.innerHTML = ICO('x', 14);
    forget.addEventListener('click', async () => {
      memory = await deleteMemoryEntry(memory, entry.key);
      renderMemory();
    });

    row.append(main, forget);
    return row;
  }));
}

async function loadHistory() {
  const { historyIndex } = await chrome.storage.local.get('historyIndex');
  const index = historyIndex || [];
  if (index.length === 0) return [];

  const stored = await chrome.storage.local.get(index.map(id => `hist_${id}`));
  return index.map(id => stored[`hist_${id}`]).filter(Boolean);
}

function renderHistory(filter = '') {
  const list = $('history-list');
  const needle = filter.trim().toLowerCase();
  const items = needle
    ? history.filter(h => `${h.title} ${h.url} ${h.firstMessage}`.toLowerCase().includes(needle))
    : history;

  if (items.length === 0) {
    list.replaceChildren(hintRow(t('historyEmpty')));
    return;
  }

  list.replaceChildren(...items.map((entry) => {
    const row = document.createElement('div');
    row.className = 'record';

    const main = document.createElement('div');
    main.className = 'record-main';
    main.innerHTML = `<div class="record-key"></div><div class="record-meta"></div>`;
    main.querySelector('.record-key').textContent = entry.firstMessage || entry.title || '';
    main.querySelector('.record-meta').textContent =
      `${entry.title || ''} · ${formatDate(entry.updatedAt)} · ${entry.messageCount || 0}`;

    const remove = document.createElement('button');
    remove.className = 'icon-btn';
    remove.title = t('remove');
    remove.innerHTML = ICO('x', 14);
    remove.addEventListener('click', async () => {
      const { historyIndex } = await chrome.storage.local.get('historyIndex');
      await chrome.storage.local.remove(`hist_${entry.id}`);
      await chrome.storage.local.set({ historyIndex: (historyIndex || []).filter(i => i !== entry.id) });
      history = history.filter(h => h.id !== entry.id);
      renderHistory($('history-search').value);
    });

    row.append(main, remove);
    return row;
  }));
}

function hintRow(text) {
  const div = document.createElement('div');
  div.className = 'hint';
  div.textContent = text;
  return div;
}

// ─── UTILS ──────────────────────────────────────

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

window.addEventListener('beforeunload', (e) => {
  if (!dirty) return;
  e.preventDefault();
  e.returnValue = '';
});
