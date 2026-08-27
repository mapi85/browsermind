// ═══════════════════════════════════════════════
//  BrowserMind — Provider catalog
//  Single source of truth for provider types: endpoints, wire format,
//  recommended models and key hints. Used by the panel, the settings page
//  and the service worker.
// ═══════════════════════════════════════════════

// type: 'anthropic' → Anthropic Messages API wire format
// type: 'openai'    → OpenAI Chat Completions wire format
//
// maxTokensField: OpenAI itself rejects `max_tokens` on its current models and
// wants `max_completion_tokens`; OpenAI-compatible third parties almost all
// still expect `max_tokens`. Getting this wrong is a silent 400.
//
// reasoning: how — if at all — extended thinking can be asked for.
//   'anthropic' → a `thinking` block on the request
//   'effort'    → `reasoning_effort`, understood only by reasoning models
//   'prompt'    → no API lever; the /think · /no_think convention several
//                 local models follow is appended to the message instead
//   null        → not controllable; the model reasons or it does not
//
// vision: whether images may be sent by default. It is a property of the
// model, not a request parameter — nothing turns it "on". The flag decides
// whether the screenshot tool is offered at all, because handing an image to
// a model that cannot read one is a 400, not a graceful degradation.

export const PROVIDER_CATALOG = {
  anthropic: {
    id: 'anthropic',
    name: 'Claude',
    vendor: 'Anthropic',
    icon: 'anthropic',
    type: 'anthropic',
    chatUrl: 'https://api.anthropic.com/v1/messages',
    modelsUrl: 'https://api.anthropic.com/v1/models',
    placeholder: 'sk-ant-api03-…',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    featured: true,
    supportsCaching: true,
    reasoning: 'anthropic',
    vision: true,
    models: [
      { id: 'claude-sonnet-5', name: 'Claude Sonnet 5', tierKey: 'tierBalanced', recommended: true },
      { id: 'claude-opus-5', name: 'Claude Opus 5', tierKey: 'tierCapable' },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', tierKey: 'tierFast' },
    ],
  },

  openai: {
    id: 'openai',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    icon: 'openai',
    type: 'openai',
    chatUrl: 'https://api.openai.com/v1/chat/completions',
    modelsUrl: 'https://api.openai.com/v1/models',
    placeholder: 'sk-…',
    keyUrl: 'https://platform.openai.com/api-keys',
    featured: true,
    maxTokensField: 'max_completion_tokens',
    reasoning: 'effort',
    vision: true,
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', tierKey: 'tierBalanced', recommended: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o mini', tierKey: 'tierFast' },
    ],
  },

  gemini: {
    id: 'gemini',
    name: 'Gemini',
    vendor: 'Google',
    icon: 'gemini',
    type: 'openai',
    chatUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    modelsUrl: null,
    placeholder: 'AIza…',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    featured: true,
    reasoning: 'effort',
    vision: true,
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tierKey: 'tierFast', recommended: true },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tierKey: 'tierCapable' },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tierKey: 'tierFast' },
    ],
  },

  mistral: {
    id: 'mistral',
    name: 'Mistral',
    vendor: 'Mistral AI',
    icon: 'mistral',
    type: 'openai',
    chatUrl: 'https://api.mistral.ai/v1/chat/completions',
    modelsUrl: 'https://api.mistral.ai/v1/models',
    placeholder: 'Mistral API key…',
    keyUrl: 'https://console.mistral.ai/api-keys/',
    featured: true,
    reasoning: null,
    vision: true,
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', tierKey: 'tierCapable', recommended: true },
      { id: 'mistral-small-latest', name: 'Mistral Small', tierKey: 'tierFast' },
    ],
  },

  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    vendor: 'DeepSeek',
    icon: 'deepseek',
    type: 'openai',
    chatUrl: 'https://api.deepseek.com/v1/chat/completions',
    modelsUrl: 'https://api.deepseek.com/v1/models',
    placeholder: 'sk-…',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    reasoning: null,
    vision: false,
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', tierKey: 'tierBalanced', recommended: true },
      { id: 'deepseek-reasoner', name: 'DeepSeek Reasoner', tierKey: 'tierCapable' },
    ],
  },

  xai: {
    id: 'xai',
    name: 'Grok',
    vendor: 'xAI',
    icon: 'xai',
    type: 'openai',
    chatUrl: 'https://api.x.ai/v1/chat/completions',
    modelsUrl: 'https://api.x.ai/v1/models',
    placeholder: 'xai-…',
    keyUrl: 'https://console.x.ai/',
    toolChoiceAuto: true,
    reasoning: null,
    vision: true,
    models: [],
  },

  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    vendor: 'OpenRouter',
    icon: 'openrouter',
    type: 'openai',
    chatUrl: 'https://openrouter.ai/api/v1/chat/completions',
    modelsUrl: 'https://openrouter.ai/api/v1/models',
    placeholder: 'sk-or-…',
    keyUrl: 'https://openrouter.ai/keys',
    extraHeaders: { 'HTTP-Referer': 'https://browsermind.ext', 'X-Title': 'BrowserMind' },
    reasoning: 'effort',
    vision: true,
    models: [],
  },

  zai: {
    id: 'zai',
    name: 'GLM',
    vendor: 'Z.ai',
    icon: 'zai',
    type: 'openai',
    chatUrl: 'https://api.z.ai/api/paas/v4/chat/completions',
    modelsUrl: 'https://api.z.ai/api/paas/v4/models',
    placeholder: 'API key…',
    keyUrl: 'https://www.z.ai/',
    extraHeaders: { 'Content-Type': 'application/json; charset=utf-8' },
    reasoning: null,
    vision: false,
    models: [],
  },

  custom_openai: {
    id: 'custom_openai',
    name: 'OpenAI-compatible server',
    vendor: 'Self-hosted',
    icon: 'plugin',
    type: 'openai',
    chatUrl: null,
    modelsUrl: null,
    placeholder: 'API key (leave blank if none)',
    keyUrl: '',
    custom: true,
    keyOptional: true,
    reasoning: 'prompt',
    vision: false,
    models: [],
  },

  custom_anthropic: {
    id: 'custom_anthropic',
    name: 'Anthropic-compatible server',
    vendor: 'Self-hosted',
    icon: 'plugin',
    type: 'anthropic',
    chatUrl: null,
    modelsUrl: null,
    placeholder: 'API key…',
    keyUrl: '',
    custom: true,
    reasoning: 'anthropic',
    vision: false,
    models: [],
  },
};

export const FEATURED_PROVIDERS = Object.values(PROVIDER_CATALOG).filter(p => p.featured);
export const OTHER_PROVIDERS = Object.values(PROVIDER_CATALOG).filter(p => !p.featured);

export function providerDef(typeId) {
  return PROVIDER_CATALOG[typeId] || null;
}

export function isOpenAIWire(typeId) {
  return (PROVIDER_CATALOG[typeId]?.type || 'openai') === 'openai';
}

export function presetModelsFor(typeId) {
  return PROVIDER_CATALOG[typeId]?.models || [];
}

export function chatUrlFor(typeId) {
  return PROVIDER_CATALOG[typeId]?.chatUrl || null;
}

export function maxTokensFieldFor(typeId) {
  return PROVIDER_CATALOG[typeId]?.maxTokensField || 'max_tokens';
}

// ─── URL RESOLUTION ─────────────────────────────
// A user-supplied base URL is a *base*: the settings page asks for the URL up
// to /v1, which is what Ollama, LM Studio and most proxies document. The wire
// endpoint is appended here so a custom provider actually reaches
// /v1/chat/completions instead of POSTing to /v1 and getting a 404.

const WIRE_SUFFIX = { openai: '/chat/completions', anthropic: '/messages' };

function stripTrailingSlash(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

/** POST endpoint for a provider instance, given its (optional) custom base URL. */
export function resolveChatUrl(typeId, customUrl) {
  const def = PROVIDER_CATALOG[typeId];
  const base = stripTrailingSlash(customUrl);
  if (!base) return def?.chatUrl || null;

  const suffix = WIRE_SUFFIX[def?.type || 'openai'];
  // Already a full endpoint (someone pasted the complete URL) — leave it alone.
  if (base.endsWith(suffix)) return base;
  return base + suffix;
}

/** /models endpoint for a provider instance, or null when it has none. */
export function resolveModelsUrl(typeId, customUrl) {
  const def = PROVIDER_CATALOG[typeId];
  const base = stripTrailingSlash(customUrl);
  if (!base) return def?.modelsUrl || null;

  const suffix = WIRE_SUFFIX[def?.type || 'openai'];
  const root = base.endsWith(suffix) ? base.slice(0, -suffix.length) : base;
  return stripTrailingSlash(root) + '/models';
}

/** Auth + content headers for a provider instance. */
export function authHeaders(typeId, apiKey) {
  const def = PROVIDER_CATALOG[typeId];
  const headers = { 'Content-Type': 'application/json', ...(def?.extraHeaders || {}) };
  if (!apiKey) return headers;

  if (def?.type === 'anthropic') {
    headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    headers.Authorization = `Bearer ${apiKey}`;
  }
  return headers;
}

// ─── MODEL LISTS ────────────────────────────────

// A /models listing mixes chat models with embeddings, speech, image and
// moderation endpoints. None of those can run an agent loop, and offering
// them is the fastest way to make the extension look broken.
const NON_CHAT = /(embed|embedding|whisper|tts|audio|speech|transcrib|dall-?e|image|vision-preview|moderation|rerank|guard|realtime|search-preview|codex-mini)/i;

export function isChatModel(id) {
  return !!id && !NON_CHAT.test(id);
}

/** Normalizes a /models payload (OpenAI- or Anthropic-shaped) into [{id, name}]. */
export function normalizeModelList(data) {
  let models = [];
  if (Array.isArray(data?.data)) {
    models = data.data.map(m => ({ id: m.id, name: m.display_name || m.name || m.id }));
  } else if (Array.isArray(data?.models)) {
    models = data.models.map(m => ({ id: m.id || m.model, name: m.name || m.id || m.model }));
  }
  return models
    .filter(m => m.id && isChatModel(m.id))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Merges the curated list with what the provider actually reports.
 * Recommended models stay on top and keep their plain-language name; anything
 * else the account can reach is still reachable, just below.
 */
export function mergeModelLists(typeId, fetched) {
  const curated = presetModelsFor(typeId);
  const live = fetched || [];
  const liveIds = new Set(live.map(m => m.id));

  const head = curated
    .filter(m => live.length === 0 || liveIds.has(m.id))
    .map(m => ({ ...m, curated: true }));
  const headIds = new Set(head.map(m => m.id));
  const tail = live.filter(m => !headIds.has(m.id));

  const merged = [...head, ...tail];
  return merged.length > 0 ? merged : curated;
}

/** Model the wizard should preselect. */
export function defaultModelFor(typeId, models) {
  const list = models && models.length > 0 ? models : presetModelsFor(typeId);
  return list.find(m => m.recommended)?.id || list[0]?.id || '';
}

// ─── NETWORK ────────────────────────────────────

function friendlyHttpError(status, body) {
  const detail = String(body || '').slice(0, 200);
  if (status === 401 || status === 403) return { code: 'badKey', status, detail };
  if (status === 402) return { code: 'noCredit', status, detail };
  if (status === 404) return { code: 'badUrl', status, detail };
  if (status === 429) return { code: 'rateLimited', status, detail };
  if (status >= 500) return { code: 'providerDown', status, detail };
  return { code: 'httpError', status, detail };
}

async function readError(res) {
  let text = '';
  try { text = await res.text(); } catch { /* body already consumed */ }
  try {
    const json = JSON.parse(text);
    return json?.error?.message || json?.message || text;
  } catch { return text; }
}

/** Fetches the model list. Throws a {code, status, detail} error on failure. */
export async function fetchProviderModels(typeId, apiKey, baseUrl) {
  const url = resolveModelsUrl(typeId, baseUrl);
  if (!url) return presetModelsFor(typeId);

  const res = await fetch(url, { headers: authHeaders(typeId, apiKey) });
  if (!res.ok) {
    const err = friendlyHttpError(res.status, await readError(res));
    throw Object.assign(new Error(err.detail || `HTTP ${res.status}`), err);
  }
  return normalizeModelList(await res.json());
}

/**
 * Verifies a key for real.
 *
 * The previous version called fetchProviderModels and reported success when a
 * provider simply had no /models endpoint — it returned the hard-coded preset
 * list without touching the network, so a made-up key showed "connected". When
 * there is no listing endpoint this sends a genuine one-token completion
 * instead, which is the only way to know the key works.
 *
 * @returns {Promise<{ok: boolean, models: Array, code?: string, detail?: string}>}
 */
export async function testProvider(typeId, apiKey, baseUrl, probeModel, mode = 'auto') {
  const def = PROVIDER_CATALOG[typeId];
  if (!def) return { ok: false, models: [], code: 'unknownProvider' };
  if (!apiKey && !def.keyOptional) return { ok: false, models: [], code: 'missingKey' };

  // 'auto' answers "is this key usable?" as cheaply as possible.
  // 'chat' answers "does this model actually reply?", which a listing cannot.
  const listingUrl = mode === 'chat' ? null : resolveModelsUrl(typeId, baseUrl);
  if (listingUrl) {
    try {
      const models = await fetchProviderModels(typeId, apiKey, baseUrl);
      return { ok: true, models: mergeModelLists(typeId, models) };
    } catch (e) {
      return { ok: false, models: [], code: e.code || 'networkError', detail: e.message };
    }
  }

  // No listing endpoint: probe the chat endpoint with the cheapest possible call.
  const chatUrl = resolveChatUrl(typeId, baseUrl);
  if (!chatUrl) return { ok: false, models: [], code: 'badUrl' };

  const model = probeModel || defaultModelFor(typeId, []);
  if (!model) return { ok: false, models: [], code: 'noModel' };

  const isOAI = def.type === 'openai';
  const body = isOAI
    ? { model, messages: [{ role: 'user', content: 'hi' }], [maxTokensFieldFor(typeId)]: 1 }
    : { model, messages: [{ role: 'user', content: 'hi' }], max_tokens: 1 };

  try {
    const res = await fetch(chatUrl, {
      method: 'POST',
      headers: authHeaders(typeId, apiKey),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = friendlyHttpError(res.status, await readError(res));
      return { ok: false, models: [], code: err.code, detail: err.detail };
    }
    return { ok: true, models: mergeModelLists(typeId, []) };
  } catch (e) {
    return { ok: false, models: [], code: 'networkError', detail: e.message };
  }
}
