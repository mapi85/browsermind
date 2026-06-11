// ═══════════════════════════════════════════════
//  BrowserMind — Shared provider catalog
//  Single source of truth for provider types:
//  display info, endpoints, preset models, key hints.
//  Used by the side panel, the config page and the
//  background service worker.
// ═══════════════════════════════════════════════

// type: 'anthropic' → Anthropic Messages API wire format
// type: 'openai'    → OpenAI Chat Completions wire format
export const PROVIDER_CATALOG = {
  anthropic: {
    name: 'Claude-compatible',
    emoji: '🟣',
    type: 'anthropic',
    chatUrl: 'https://api.anthropic.com/v1/messages',
    modelsUrl: 'https://api.anthropic.com/v1/models',
    placeholder: 'sk-ant-api03-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    presetModels: [
      { id: 'claude-opus-4-8',   name: 'Claude Opus 4.8 ✦' },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
      { id: 'claude-haiku-4-5',  name: 'Claude Haiku 4.5' },
    ],
  },
  openai: {
    name: 'GPT-compatible',
    emoji: '🤖',
    type: 'openai',
    chatUrl: 'https://api.openai.com/v1/chat/completions',
    modelsUrl: 'https://api.openai.com/v1/models',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    presetModels: [],
  },
  xai: {
    name: 'Grok-compatible',
    emoji: '⚡',
    type: 'openai',
    chatUrl: 'https://api.x.ai/v1/chat/completions',
    modelsUrl: 'https://api.x.ai/v1/models',
    placeholder: 'xai-...',
    docsUrl: 'https://console.x.ai/',
    presetModels: [],
  },
  mistral: {
    name: 'Mistral',
    emoji: '🌊',
    type: 'openai',
    chatUrl: 'https://api.mistral.ai/v1/chat/completions',
    modelsUrl: null,
    placeholder: 'Clé Mistral...',
    docsUrl: 'https://console.mistral.ai/api-keys/',
    presetModels: [
      { id: 'mistral-large-latest', name: 'Mistral Large' },
      { id: 'mistral-small-latest', name: 'Mistral Small' },
      { id: 'codestral-latest',     name: 'Codestral' },
      { id: 'open-mistral-nemo',    name: 'Mistral Nemo' },
    ],
  },
  deepseek: {
    name: 'DeepSeek',
    emoji: '🔍',
    type: 'openai',
    chatUrl: 'https://api.deepseek.com/v1/chat/completions',
    modelsUrl: null,
    placeholder: 'sk-...',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    presetModels: [
      { id: 'deepseek-chat',     name: 'DeepSeek Chat (V3)' },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner (R1)' },
    ],
  },
  gemini: {
    name: 'Gemini',
    emoji: '🔷',
    type: 'openai',
    chatUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    modelsUrl: null,
    placeholder: 'AIza...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    presetModels: [
      { id: 'gemini-2.0-flash',      name: 'Gemini 2.0 Flash' },
      { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite' },
      { id: 'gemini-1.5-pro',        name: 'Gemini 1.5 Pro' },
    ],
  },
  cohere: {
    name: 'Cohere',
    emoji: '🧩',
    type: 'openai',
    chatUrl: 'https://api.cohere.com/v2/chat',
    modelsUrl: null,
    placeholder: '...',
    docsUrl: 'https://dashboard.cohere.com/api-keys',
    presetModels: [
      { id: 'command-r-plus', name: 'Command R+' },
      { id: 'command-r',      name: 'Command R' },
    ],
  },
  openrouter: {
    name: 'Router',
    emoji: '🔀',
    type: 'openai',
    chatUrl: 'https://openrouter.ai/api/v1/chat/completions',
    modelsUrl: 'https://openrouter.ai/api/v1/models',
    placeholder: 'sk-or-...',
    docsUrl: 'https://openrouter.ai/keys',
    presetModels: [],
  },
  zai: {
    name: 'GLM',
    emoji: '🌐',
    type: 'openai',
    chatUrl: 'https://api.z.ai/api/paas/v4/chat/completions',
    modelsUrl: 'https://api.z.ai/api/paas/v4/models',
    placeholder: 'Clé API...',
    docsUrl: 'https://www.z.ai/',
    presetModels: [],
  },
  custom_openai: {
    name: 'Custom — compatible OpenAI',
    emoji: '🔧',
    type: 'openai',
    chatUrl: null,   // user-provided base URL
    modelsUrl: null, // derived from the base URL
    placeholder: 'Clé API...',
    docsUrl: '',
    presetModels: [],
  },
  custom_anthropic: {
    name: 'Custom — compatible Anthropic',
    emoji: '🔧',
    type: 'anthropic',
    chatUrl: null,
    modelsUrl: null,
    placeholder: 'Clé API...',
    docsUrl: '',
    presetModels: [],
  },
};

export function providerDef(typeId) {
  return PROVIDER_CATALOG[typeId] || null;
}

export function isOpenAIWire(typeId) {
  return (PROVIDER_CATALOG[typeId]?.type || 'openai') === 'openai';
}

export function presetModelsFor(typeId) {
  return PROVIDER_CATALOG[typeId]?.presetModels || [];
}

export function chatUrlFor(typeId) {
  return PROVIDER_CATALOG[typeId]?.chatUrl || null;
}

// Normalize a /models listing payload (OpenAI- or Anthropic-shaped) into [{id, name}]
export function normalizeModelList(data) {
  let models = [];
  if (Array.isArray(data.data)) {
    // OpenAI / xAI / OpenRouter / Anthropic format
    models = data.data
      .map(m => ({ id: m.id, name: m.display_name || m.name || m.id }))
      .filter(m => m.id && !/embedding|whisper|dall-e|tts/.test(m.id))
      .sort((a, b) => a.id.localeCompare(b.id));
  } else if (Array.isArray(data.models)) {
    models = data.models.map(m => ({ id: m.id || m.model, name: m.name || m.id || m.model }));
  }
  return models;
}

// Fetch the model list for a provider type. Falls back to preset models
// when the provider has no public /models endpoint.
export async function fetchProviderModels(typeId, apiKey, baseUrl) {
  const def = PROVIDER_CATALOG[typeId];

  let url;
  if (typeId === 'custom_openai') {
    url = baseUrl?.replace('/chat/completions', '').replace(/\/$/, '') + '/models';
  } else if (typeId === 'custom_anthropic') {
    url = baseUrl?.replace('/messages', '').replace(/\/$/, '') + '/models';
  } else {
    url = def?.modelsUrl;
  }

  if (!url) {
    const presets = presetModelsFor(typeId);
    if (presets.length > 0) return presets;
    throw new Error('Endpoint /models inconnu pour ce provider');
  }

  const headers = def?.type === 'anthropic'
    ? { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }
    : { 'Authorization': `Bearer ${apiKey}` };
  if (typeId === 'zai') headers['Content-Type'] = 'application/json; charset=utf-8';

  const res = await fetch(url, { headers });
  if (!res.ok) {
    // Network/auth failure on a provider that also ships presets → degrade gracefully
    const presets = presetModelsFor(typeId);
    if (presets.length > 0 && res.status !== 401) return presets;
    throw new Error(`HTTP ${res.status}`);
  }

  const models = normalizeModelList(await res.json());
  if (models.length > 0) return models;
  return presetModelsFor(typeId).length > 0
    ? presetModelsFor(typeId)
    : [{ id: 'unknown', name: 'Aucun modèle trouvé' }];
}
