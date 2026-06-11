// ═══════════════════════════════════════════════
//  BrowserMind — Tools Registry (native + custom + remote)
//
//  CUSTOM TOOL FORMAT (JSON):
//  {
//    "name":        "mon_outil",           // unique snake_case id
//    "icon":        "🔧",                  // emoji shown in the UI
//    "label":       "Mon outil",           // short display name
//    "description": "Fait quelque chose",  // description for the LLM
//    "category":    "custom",              // "custom" | "remote"
//    "source":      "user",                // "user" | remote URL
//    "input_schema": { ... },              // JSON Schema of the parameters
//    "executor":    "api_call_ext"         // optional: maps to a native code path
//  }
//
//  AVAILABLE EXECUTORS (executor field):
//  "generate_document_ext" → enriched alias of generate_document
//  "api_call_ext"          → api_call with pre-configured endpoint
//  "web_search_ext"        → web search with templated query
//  null / absent           → declarative tool (no side effects)
//
//  Custom tools never carry executable code — they only configure
//  native, reviewed code paths in background.js.
// ═══════════════════════════════════════════════

import { BUILTIN_MODES } from './modes.js';

// ─── NATIVE TOOLS (read-only) ───────────────────
export const NATIVE_TOOLS = [
  {
    name: 'get_page_content',
    icon: '📄', label: 'Lire la page',
    description: 'Obtient le contenu complet de la page',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'click',
    icon: '👆', label: 'Cliquer',
    description: 'Clique sur un élément',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { selector: { type: 'string' }, selector_type: { type: 'string', enum: ['css','text','xpath'] } }, required: ['selector'] }
  },
  {
    name: 'type_text',
    icon: '⌨️', label: 'Saisir du texte',
    description: 'Saisit du texte dans un champ',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { selector: { type: 'string' }, text: { type: 'string' }, clear_first: { type: 'boolean' } }, required: ['selector','text'] }
  },
  {
    name: 'scroll',
    icon: '↕️', label: 'Défiler',
    description: 'Fait défiler la page',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { direction: { type: 'string', enum: ['up','down','top','bottom'] }, amount: { type: 'number' } }, required: ['direction'] }
  },
  {
    name: 'navigate',
    icon: '🌐', label: 'Naviguer',
    description: 'Navigue vers une URL',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { url: { type: 'string' } }, required: ['url'] }
  },
  {
    name: 'fill_form',
    icon: '📝', label: 'Remplir formulaire',
    description: 'Remplit plusieurs champs d\'un formulaire',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { fields: { type: 'array', items: { type: 'object', properties: { selector: { type: 'string' }, value: { type: 'string' }, field_type: { type: 'string' } } } }, submit: { type: 'boolean' } }, required: ['fields'] }
  },
  {
    name: 'extract_data',
    icon: '📤', label: 'Extraire données',
    description: 'Extrait des données structurées de la page',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { data_type: { type: 'string', enum: ['table','list','links','images','custom'] }, selector: { type: 'string' }, format: { type: 'string' } }, required: ['data_type'] }
  },
  {
    name: 'generate_document',
    icon: '💾', label: 'Générer document',
    description: 'Génère et télécharge un document. Utilise TOUJOURS un filename descriptif (ex: "rapport-produits-2024.html", "contacts-export.csv"), jamais "export" seul.',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { format: { type: 'string', enum: ['csv','html','json','md','txt'] }, content: { type: 'string', description: 'Contenu du document' }, filename: { type: 'string', description: 'Nom du fichier incluant l\'extension' } }, required: ['format','content','filename'] }
  },
  {
    name: 'download_file',
    icon: '⬇️', label: 'Télécharger fichier',
    description: 'Télécharge un fichier depuis une URL',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { url: { type: 'string' }, filename: { type: 'string' } }, required: ['url'] }
  },
  {
    name: 'wait',
    icon: '⏳', label: 'Attendre',
    description: 'Attend un élément ou un délai',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { selector: { type: 'string' }, milliseconds: { type: 'number' } } }
  },
  {
    name: 'take_screenshot',
    icon: '📸', label: 'Capture écran',
    description: 'Prend une capture d\'écran de la page visible',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'api_call',
    icon: '🔌', label: 'Appel API',
    description: 'Appelle une API externe (géocodage, météo, recherche)',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { api: { type: 'string', enum: ['nominatim','open_meteo','duckduckgo','rest_countries','wikidata'] }, endpoint: { type: 'string' }, params: { type: 'object' } }, required: ['api'] }
  },
  {
    name: 'web_search',
    icon: '🔍', label: 'Recherche web',
    description: 'Recherche sur le web via DuckDuckGo',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { query: { type: 'string' }, max_results: { type: 'number' } }, required: ['query'] }
  },
  {
    name: 'new_tab',
    icon: '🗂️', label: 'Nouvel onglet',
    description: 'Ouvre une URL dans un nouvel onglet',
    category: 'native', source: 'builtin',
    input_schema: { type: 'object', properties: { url: { type: 'string' }, active: { type: 'boolean' } }, required: ['url'] }
  }
];

// ─── IN-MEMORY REGISTRY ─────────────────────────
// native + custom (from storage) + remote (cached)
let _toolRegistry = [...NATIVE_TOOLS];
let _customModes = {};

/** All registered tools (native + custom + remote) */
export function getAllRegisteredTools() {
  return _toolRegistry;
}

/** Lookup by name */
export function getToolByName(name) {
  return _toolRegistry.find(t => t.name === name) || null;
}

/** Custom modes loaded from storage (kept here so panel/config share one copy) */
export function getCustomModes() {
  return _customModes;
}

/** Built-in + custom modes merged into one map */
export function getAllModes() {
  return { ...BUILTIN_MODES, ...customModesOnly() };
}

function customModesOnly() {
  return _customModes || {};
}

/** Resolve a mode by id (builtin first, then custom), defaulting to 'libre' */
export function getModeById(modeId) {
  return BUILTIN_MODES[modeId] || _customModes[modeId] || BUILTIN_MODES.libre;
}

/** Tools allowed for a given mode (mode.tools filter, '*' = all) */
export function getToolsForMode(modeId) {
  const mode = BUILTIN_MODES[modeId] || _customModes[modeId];
  if (!mode) return _toolRegistry;
  if (mode.tools?.includes('*')) return _toolRegistry;
  const allowedNames = new Set(mode.tools || []);
  return _toolRegistry.filter(t => allowedNames.has(t.name));
}

// ─── TEST SEAM ──────────────────────────────────
/** Replace registry contents (used by unit tests) */
export function _setRegistryForTests(tools, customModes = {}) {
  _toolRegistry = tools;
  _customModes = customModes;
}

// ─── STORAGE I/O ────────────────────────────────

/** Load custom tools + custom modes from chrome.storage.local */
export async function loadCustomToolsFromStorage() {
  return new Promise(resolve => {
    chrome.storage.local.get(['customTools', 'customModes'], data => {
      const custom = data.customTools || [];
      _customModes = data.customModes || {};
      _toolRegistry = [
        ...NATIVE_TOOLS,
        ...custom.map(t => ({ ...t, category: t.category || 'custom', source: t.source || 'user' }))
      ];
      resolve({ custom, customModes: _customModes });
    });
  });
}

/** Persist custom tools and rebuild the registry */
export async function saveCustomTools(tools) {
  return new Promise(resolve => {
    chrome.storage.local.set({ customTools: tools }, () => {
      _toolRegistry = [
        ...NATIVE_TOOLS,
        ...tools.map(t => ({ ...t, category: t.category || 'custom', source: t.source || 'user' }))
      ];
      resolve();
    });
  });
}

/** Persist custom modes */
export async function saveCustomModes(modes) {
  return new Promise(resolve => {
    _customModes = modes;
    chrome.storage.local.set({ customModes: modes }, resolve);
  });
}

/** Fetch remote tool definitions (declarative JSON) from a URL */
export async function loadRemoteTools(url) {
  if (!url) return { tools: [], error: null };
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Accepts { tools: [...] } or directly [...]
    const tools = Array.isArray(data) ? data : (data.tools || []);

    const valid = tools.filter(t =>
      t.name && typeof t.name === 'string' &&
      t.description && typeof t.description === 'string' &&
      t.input_schema
    ).map(t => ({ ...t, category: 'remote', source: url }));

    // Merge into the registry (same name replaces)
    valid.forEach(rt => {
      const idx = _toolRegistry.findIndex(t => t.name === rt.name);
      if (idx >= 0) _toolRegistry[idx] = rt;
      else _toolRegistry.push(rt);
    });

    chrome.storage.local.set({ remoteToolsCache: valid, remoteToolsCachedAt: Date.now() });
    return { tools: valid, error: null };
  } catch (e) {
    console.warn('[BrowserMind] Remote tools load failed:', e.message);
    return { tools: [], error: e.message };
  }
}

/** Merge the cached remote tools without refetching */
export function loadRemoteToolsFromCache() {
  return new Promise(resolve => {
    chrome.storage.local.get(['remoteToolsCache'], data => {
      const cached = data.remoteToolsCache || [];
      cached.forEach(rt => {
        const idx = _toolRegistry.findIndex(t => t.name === rt.name);
        if (idx >= 0) _toolRegistry[idx] = rt;
        else _toolRegistry.push(rt);
      });
      resolve(cached);
    });
  });
}

/** Full init at panel startup */
export async function initToolRegistry() {
  await loadCustomToolsFromStorage();
  await loadRemoteToolsFromCache();

  // Refresh remote tools in the background if a URL is configured
  chrome.storage.local.get(['remoteToolsUrl'], async data => {
    if (data.remoteToolsUrl) await loadRemoteTools(data.remoteToolsUrl);
  });
}
