// ═══════════════════════════════════════════════
//  BrowserMind — Settings
//  One schema and one loader over chrome.storage.local, shared by the side
//  panel, the settings page and the service worker.
//
//  Anything the user does not need to decide is a constant below, not a
//  setting. The settings page only exposes what changes an outcome.
// ═══════════════════════════════════════════════

// ─── TUNING (not user-facing) ───────────────────
//
// Timeouts measure *silence*, not total duration. A local server loading a
// 26B model into VRAM sends nothing for a minute or more, and a slow one then
// streams for several more — a single deadline over the whole request cuts off
// both, and cannot tell either apart from a dead endpoint.
export const LIMITS = {
  maxInputTokens: 40000,     // history budget before trimming
  minInputTokens: 6000,      // floor when a model's real window turns out smaller
  maxOutputTokens: 4096,     // per model response
  firstChunkTimeoutMs: 300000, // silence before the answer starts (cold model load)
  stallTimeoutMs: 90000,       // silence between chunks once it has started
  warmupHintMs: 8000,          // tell the user we are still waiting
  toolRetries: 2,
};

export const DEFAULT_SETTINGS = {
  // Providers
  configuredProviders:   [],
  currentProvider:       '',
  providerKeys:          {},
  providerModels:        {},
  providerSelectedModel: {},
  providerCustomUrl:     {},

  // Behaviour
  maxIterations:      15,
  userSystemPrompt:   '',
  memoryEnabled:      true,
  historyEnabled:     true,
  historyRetention:   30,
  navAlwaysAllow:     false,
  nativeWebSearch:    false,

  // Presentation
  uiLang:             '',        // '' = follow the browser language
  agentLang:          '',        // '' = follow uiLang
  theme:              'system',  // 'system' | 'light' | 'dark'
  highlightActions:   true,
  debugMode:          false,
};

const STORAGE_KEYS = Object.keys(DEFAULT_SETTINGS);

// Settings removed in 2.0. Listed so migrate() can clear them instead of
// leaving dead keys in storage forever.
const RETIRED_KEYS = [
  'currentMode', 'autoDetectMode', 'enabledModes', 'customModes',
  'customTools', 'remoteToolsUrl', 'remoteToolsCache', 'remoteToolsCachedAt',
  'maxTabSessions', 'thinkingCollapsed', 'bestPractices', 'maxInputTokens',
  'highlightClicks',
];

/**
 * Reads settings, normalizing the configuredProviders array into the
 * per-instance lookup maps the API layer uses.
 */
export async function loadSettings() {
  const s = await chrome.storage.local.get([...STORAGE_KEYS, ...RETIRED_KEYS]);
  const settings = { ...DEFAULT_SETTINGS };

  const providers = Array.isArray(s.configuredProviders) ? s.configuredProviders : [];
  settings.configuredProviders = providers;
  for (const p of providers) {
    settings.providerKeys[p.instanceId]          = p.key;
    settings.providerModels[p.instanceId]        = p.models;
    settings.providerSelectedModel[p.instanceId] = p.selectedModel;
    settings.providerCustomUrl[p.instanceId]     = p.customUrl;
  }

  for (const key of STORAGE_KEYS) {
    if (key.startsWith('provider') || key === 'configuredProviders') continue;
    if (s[key] !== undefined && s[key] !== null) settings[key] = s[key];
  }

  // A provider that no longer exists must not stay selected.
  if (settings.currentProvider && !providers.some(p => p.instanceId === settings.currentProvider)) {
    settings.currentProvider = providers[0]?.instanceId || '';
  }

  // highlightClicks was renamed; carry the old value over once.
  if (s.highlightActions === undefined && s.highlightClicks !== undefined) {
    settings.highlightActions = s.highlightClicks !== false;
  }

  return settings;
}

/** Persists a partial settings patch. */
export async function saveSettings(patch) {
  const clean = {};
  for (const [k, v] of Object.entries(patch)) {
    if (STORAGE_KEYS.includes(k)) clean[k] = v;
  }
  await chrome.storage.local.set(clean);
  return clean;
}

/** Drops storage keys belonging to features that no longer exist. */
export async function migrateStorage() {
  const stored = await chrome.storage.local.get(RETIRED_KEYS);
  const present = RETIRED_KEYS.filter(k => stored[k] !== undefined);
  if (present.length === 0) return { removed: [] };
  await chrome.storage.local.remove(present);
  return { removed: present };
}

// ─── LANGUAGE ───────────────────────────────────
export const SUPPORTED_LANGS = ['en', 'fr', 'es', 'it', 'de', 'pt'];

/** Resolves '' (auto) against the browser UI language, falling back to English. */
export function resolveLang(pref, browserLang) {
  if (pref && SUPPORTED_LANGS.includes(pref)) return pref;
  const base = String(browserLang || '').toLowerCase().split('-')[0];
  return SUPPORTED_LANGS.includes(base) ? base : 'en';
}

// ─── PERSISTENT MEMORY ──────────────────────────
const MEMORY_LIMIT = 100;

export async function loadPersistentMemory() {
  const s = await chrome.storage.local.get(['persistentMemory']);
  return Array.isArray(s.persistentMemory) ? s.persistentMemory : [];
}

export async function saveMemoryEntry(memory, key, value) {
  const next = Array.isArray(memory) ? [...memory] : [];
  const idx = next.findIndex(m => m.key.toLowerCase() === key.toLowerCase());
  const entry = { key, value, timestamp: Date.now() };
  if (idx >= 0) next[idx] = entry;
  else next.push(entry);

  // Bound it: the whole list is injected into every request.
  const trimmed = next.slice(-MEMORY_LIMIT);
  await chrome.storage.local.set({ persistentMemory: trimmed });
  return trimmed;
}

export async function deleteMemoryEntry(memory, key) {
  const next = (memory || []).filter(m => m.key !== key);
  await chrome.storage.local.set({ persistentMemory: next });
  return next;
}
