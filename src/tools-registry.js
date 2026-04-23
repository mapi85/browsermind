// ═══════════════════════════════════════════════
//  BrowserMind v1.0.0 — Tools Registry
//  Gestion des outils natifs + outils custom
// ═══════════════════════════════════════════════
//
//  FORMAT D'UN OUTIL CUSTOM (JSON) :
//  {
//    "name":        "mon_outil",           // identifiant snake_case unique
//    "icon":        "🔧",                  // emoji affiché dans l'UI
//    "label":       "Mon outil",           // nom court affiché
//    "description": "Fait quelque chose",  // description pour le LLM
//    "category":    "custom",              // "custom" | "remote"
//    "source":      "user",               // "user" | URL distante
//    "input_schema": {                     // JSON Schema des paramètres
//      "type": "object",
//      "properties": {
//        "param1": { "type": "string", "description": "..." }
//      },
//      "required": ["param1"]
//    },
//    "executor": "navigate_search"         // clé vers une fonction native étendue
//                                          // OU null si géré dans background.js
//  }
//
//  EXECUTEURS DISPONIBLES (executor field) :
//  "generate_document_ext" → alias enrichi de generate_document
//  "api_call_ext"          → api_call avec endpoints custom
//  "web_search_ext"        → recherche multi-moteurs
//  null / absent           → l'outil est purement déclaratif (décrit une action
//                            que background.js sait déjà gérer via son nom)
//
// ═══════════════════════════════════════════════

// ─── OUTILS NATIFS (lecture seule) ──────────────
const NATIVE_TOOLS = [
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

// ─── REGISTRY EN MÉMOIRE ────────────────────────
// Merge de NATIVE_TOOLS + outils custom chargés depuis storage + distants
let _toolRegistry = [...NATIVE_TOOLS];

// ─── API PUBLIQUE ────────────────────────────────

/** Retourne tous les outils (natifs + custom) */
function getAllRegisteredTools() {
  return _toolRegistry;
}

/** Retourne un outil par son nom */
function getToolByName(name) {
  return _toolRegistry.find(t => t.name === name) || null;
}

/** Retourne les outils pour un mode donné (filtre + custom) */
function getToolsForMode(modeId) {
  const builtinMode = window.BrowserMindModes?.[modeId];
  const customModes = window._customModes || {};
  const mode = builtinMode || customModes[modeId];

  if (!mode) return _toolRegistry;
  if (mode.tools?.includes('*')) return _toolRegistry;

  const allowedNames = new Set(mode.tools || []);
  return _toolRegistry.filter(t => allowedNames.has(t.name));
}

/** Charge les outils custom depuis chrome.storage.local */
async function loadCustomToolsFromStorage() {
  return new Promise(resolve => {
    chrome.storage.local.get(['customTools', 'customModes', 'remoteToolsUrl', 'remoteToolsCache'], data => {
      const custom = data.customTools || [];
      window._customModes = data.customModes || {};

      // Rebuild registry: native + custom
      _toolRegistry = [
        ...NATIVE_TOOLS,
        ...custom.map(t => ({ ...t, category: t.category || 'custom', source: t.source || 'user' }))
      ];

      resolve({ custom, customModes: window._customModes });
    });
  });
}

/** Sauvegarde les outils custom dans chrome.storage.local */
async function saveCustomTools(tools) {
  return new Promise(resolve => {
    chrome.storage.local.set({ customTools: tools }, () => {
      // Rebuild registry
      _toolRegistry = [
        ...NATIVE_TOOLS,
        ...tools.map(t => ({ ...t, category: t.category || 'custom', source: t.source || 'user' }))
      ];
      resolve();
    });
  });
}

/** Sauvegarde les modes custom dans chrome.storage.local */
async function saveCustomModes(modes) {
  return new Promise(resolve => {
    window._customModes = modes;
    chrome.storage.local.set({ customModes: modes }, resolve);
  });
}

/** Charge les outils depuis une URL distante (JSON) */
async function loadRemoteTools(url) {
  if (!url) return { tools: [], error: null };
  try {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Accepte { tools: [...] } ou directement [...]
    const tools = Array.isArray(data) ? data : (data.tools || []);

    // Validation minimale
    const valid = tools.filter(t =>
      t.name && typeof t.name === 'string' &&
      t.description && typeof t.description === 'string' &&
      t.input_schema
    ).map(t => ({ ...t, category: 'remote', source: url }));

    // Merge dans le registry (remplace si même nom)
    valid.forEach(rt => {
      const idx = _toolRegistry.findIndex(t => t.name === rt.name);
      if (idx >= 0) {
        _toolRegistry[idx] = rt;
      } else {
        _toolRegistry.push(rt);
      }
    });

    // Mise en cache
    chrome.storage.local.set({ remoteToolsCache: valid, remoteToolsCachedAt: Date.now() });

    return { tools: valid, error: null };
  } catch (e) {
    console.warn('[BrowserMind] Remote tools load failed:', e.message);
    return { tools: [], error: e.message };
  }
}

/** Charge le cache des outils distants si dispo (sans refetch) */
function loadRemoteToolsFromCache() {
  return new Promise(resolve => {
    chrome.storage.local.get(['remoteToolsCache', 'remoteToolsCachedAt'], data => {
      const cached = data.remoteToolsCache || [];
      if (cached.length > 0) {
        cached.forEach(rt => {
          const idx = _toolRegistry.findIndex(t => t.name === rt.name);
          if (idx >= 0) _toolRegistry[idx] = rt;
          else _toolRegistry.push(rt);
        });
      }
      resolve(cached);
    });
  });
}

/** Initialisation complète au démarrage du panneau */
async function initToolRegistry() {
  await loadCustomToolsFromStorage();
  await loadRemoteToolsFromCache();

  // Refresh distants en arrière-plan si une URL est configurée
  chrome.storage.local.get(['remoteToolsUrl'], async data => {
    if (data.remoteToolsUrl) {
      await loadRemoteTools(data.remoteToolsUrl);
    }
  });
}

// ─── EXPORT GLOBAL ──────────────────────────────
window.ToolRegistry = {
  NATIVE_TOOLS,
  getAll:            getAllRegisteredTools,
  getByName:         getToolByName,
  getForMode:        getToolsForMode,
  loadFromStorage:   loadCustomToolsFromStorage,
  saveCustomTools,
  saveCustomModes,
  loadRemote:        loadRemoteTools,
  init:              initToolRegistry,
};
