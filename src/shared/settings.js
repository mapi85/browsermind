// ═══════════════════════════════════════════════
//  BrowserMind — Settings access
//  One schema + loader for chrome.storage.local,
//  shared by the panel, the config page and the
//  background service worker.
// ═══════════════════════════════════════════════

export const DEFAULT_SETTINGS = {
  configuredProviders:    [],
  currentProvider:        '',
  providerKeys:           {},
  providerModels:         {},
  providerSelectedModel:  {},
  providerCustomUrl:      {},
  maxIterations:          15,
  maxInputTokens:         40000,
  memoryEnabled:          true,
  historyEnabled:         true,
  uiLang:                 'fr',
  agentLang:              'fr',
  thinkingCollapsed:      true,
  highlightClicks:        true,
  debugMode:              false,
  theme:                  'light',
  maxTabSessions:         10,
  userSystemPrompt:       '',
  bestPractices:          'auto',
  currentMode:            'libre',
  autoDetectMode:         true,
  enabledModes:           [],
  navAlwaysAllow:         false,
};

const STORAGE_KEYS = [
  'configuredProviders', 'currentProvider',
  'providerKeys', 'providerModels', 'providerSelectedModel', 'providerCustomUrl',
  'maxIterations', 'maxInputTokens', 'memoryEnabled',
  'historyEnabled', 'uiLang', 'agentLang', 'thinkingCollapsed', 'highlightClicks', 'debugMode', 'theme',
  'maxTabSessions', 'currentMode', 'autoDetectMode', 'enabledModes',
  'userSystemPrompt', 'bestPractices', 'navAlwaysAllow',
];

// Loads settings from storage, normalizing the configuredProviders array
// into the per-instance lookup maps callAPI relies on.
export async function loadSettingsFromStorage() {
  const s = await chrome.storage.local.get(STORAGE_KEYS);
  const settings = { ...DEFAULT_SETTINGS };

  if (s.configuredProviders && s.configuredProviders.length > 0) {
    settings.configuredProviders = s.configuredProviders;
    settings.providerKeys          = {};
    settings.providerModels        = {};
    settings.providerSelectedModel = {};
    settings.providerCustomUrl     = {};
    s.configuredProviders.forEach(p => {
      settings.providerKeys[p.instanceId]          = p.key;
      settings.providerModels[p.instanceId]        = p.models;
      settings.providerSelectedModel[p.instanceId] = p.selectedModel;
      settings.providerCustomUrl[p.instanceId]     = p.customUrl;
    });
  } else {
    // Legacy flat format
    if (s.providerKeys)          settings.providerKeys          = s.providerKeys;
    if (s.providerModels)        settings.providerModels        = s.providerModels;
    if (s.providerSelectedModel) settings.providerSelectedModel = s.providerSelectedModel;
    if (s.providerCustomUrl)     settings.providerCustomUrl     = s.providerCustomUrl;
  }

  for (const key of [
    'currentProvider', 'maxIterations', 'maxInputTokens', 'uiLang', 'agentLang', 'theme',
    'maxTabSessions', 'currentMode',
  ]) {
    if (s[key]) settings[key] = s[key];
  }
  for (const key of [
    'memoryEnabled', 'historyEnabled', 'thinkingCollapsed', 'highlightClicks',
    'debugMode', 'autoDetectMode', 'navAlwaysAllow',
  ]) {
    if (s[key] !== undefined) settings[key] = s[key];
  }
  if (s.userSystemPrompt !== undefined) settings.userSystemPrompt = s.userSystemPrompt || '';
  if (s.bestPractices !== undefined)    settings.bestPractices    = s.bestPractices || 'auto';
  if (s.enabledModes && s.enabledModes.length > 0) settings.enabledModes = s.enabledModes;

  return settings;
}

export async function loadPersistentMemory() {
  const s = await chrome.storage.local.get(['persistentMemory']);
  return s.persistentMemory || [];
}

export async function saveMemoryEntry(memory, key, value) {
  const idx = memory.findIndex(m => m.key.toLowerCase() === key.toLowerCase());
  const entry = { key, value, timestamp: Date.now() };
  if (idx >= 0) memory[idx] = entry; else memory.push(entry);
  await chrome.storage.local.set({ persistentMemory: memory });
  return memory;
}
