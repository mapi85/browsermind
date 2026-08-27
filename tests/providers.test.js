import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  PROVIDER_CATALOG, FEATURED_PROVIDERS, providerDef, isOpenAIWire, presetModelsFor,
  chatUrlFor, maxTokensFieldFor, resolveChatUrl, resolveModelsUrl, authHeaders,
  normalizeModelList, isChatModel, mergeModelLists, defaultModelFor, testProvider,
} from '../src/shared/providers.js';

afterEach(() => { vi.unstubAllGlobals(); });

describe('PROVIDER_CATALOG', () => {
  it('gives every non-custom provider a chat endpoint', () => {
    for (const [id, def] of Object.entries(PROVIDER_CATALOG)) {
      if (def.custom) expect(def.chatUrl, `${id}`).toBeNull();
      else expect(def.chatUrl, `${id} is missing chatUrl`).toMatch(/^https:\/\//);
    }
  });

  it('declares a known wire format everywhere', () => {
    for (const [id, def] of Object.entries(PROVIDER_CATALOG)) {
      expect(['openai', 'anthropic'], `${id}`).toContain(def.type);
    }
  });

  it('offers a handful of featured services, each with a recommended model', () => {
    expect(FEATURED_PROVIDERS.length).toBeGreaterThanOrEqual(3);
    for (const def of FEATURED_PROVIDERS) {
      expect(def.models.some(m => m.recommended), `${def.id} has no recommended model`).toBe(true);
    }
  });

  it('points every catalog model at a tier label', () => {
    for (const def of Object.values(PROVIDER_CATALOG)) {
      for (const model of def.models) {
        expect(model.tierKey, `${def.id}/${model.id}`).toMatch(/^tier/);
      }
    }
  });

  it('asks OpenAI for max_completion_tokens and everyone else for max_tokens', () => {
    expect(maxTokensFieldFor('openai')).toBe('max_completion_tokens');
    expect(maxTokensFieldFor('mistral')).toBe('max_tokens');
    expect(maxTokensFieldFor('anthropic')).toBe('max_tokens');
  });
});

describe('lookup helpers', () => {
  it('resolves definitions and wire formats', () => {
    expect(providerDef('anthropic').type).toBe('anthropic');
    expect(providerDef('nope')).toBeNull();
    expect(isOpenAIWire('mistral')).toBe(true);
    expect(isOpenAIWire('anthropic')).toBe(false);
    expect(chatUrlFor('custom_openai')).toBeNull();
    expect(presetModelsFor('nope')).toEqual([]);
  });
});

describe('resolveChatUrl', () => {
  it('uses the catalog endpoint when no custom URL is set', () => {
    expect(resolveChatUrl('anthropic', '')).toBe('https://api.anthropic.com/v1/messages');
    expect(resolveChatUrl('openai', undefined)).toBe('https://api.openai.com/v1/chat/completions');
  });

  it('appends the OpenAI wire endpoint to a local base URL', () => {
    expect(resolveChatUrl('custom_openai', 'http://localhost:11434/v1'))
      .toBe('http://localhost:11434/v1/chat/completions');
  });

  it('appends the Anthropic wire endpoint to a proxy base URL', () => {
    expect(resolveChatUrl('custom_anthropic', 'https://proxy.example.com/v1'))
      .toBe('https://proxy.example.com/v1/messages');
  });

  it('tolerates a trailing slash', () => {
    expect(resolveChatUrl('custom_openai', 'http://localhost:1234/v1/'))
      .toBe('http://localhost:1234/v1/chat/completions');
  });

  it('leaves an already complete endpoint alone', () => {
    expect(resolveChatUrl('custom_openai', 'http://localhost:11434/v1/chat/completions'))
      .toBe('http://localhost:11434/v1/chat/completions');
  });

  it('lets a custom URL front a catalog provider', () => {
    expect(resolveChatUrl('openai', 'https://proxy.internal/v1'))
      .toBe('https://proxy.internal/v1/chat/completions');
  });
});

describe('resolveModelsUrl', () => {
  it('falls back to the catalog listing endpoint', () => {
    expect(resolveModelsUrl('anthropic', '')).toBe('https://api.anthropic.com/v1/models');
  });

  it('returns null for a provider with no listing endpoint', () => {
    expect(resolveModelsUrl('gemini', '')).toBeNull();
  });

  it('derives /models from a base URL', () => {
    expect(resolveModelsUrl('custom_openai', 'http://localhost:11434/v1'))
      .toBe('http://localhost:11434/v1/models');
  });

  it('derives /models from a full chat endpoint', () => {
    expect(resolveModelsUrl('custom_openai', 'http://localhost:11434/v1/chat/completions'))
      .toBe('http://localhost:11434/v1/models');
    expect(resolveModelsUrl('custom_anthropic', 'https://proxy.example.com/v1/messages'))
      .toBe('https://proxy.example.com/v1/models');
  });
});

describe('authHeaders', () => {
  it('uses x-api-key and a version for Anthropic', () => {
    const headers = authHeaders('anthropic', 'sk-ant');
    expect(headers['x-api-key']).toBe('sk-ant');
    expect(headers['anthropic-version']).toBe('2023-06-01');
    expect(headers.Authorization).toBeUndefined();
  });

  it('uses a bearer token for OpenAI-style providers', () => {
    expect(authHeaders('mistral', 'k').Authorization).toBe('Bearer k');
  });

  it('merges provider-specific headers', () => {
    expect(authHeaders('openrouter', 'k')['X-Title']).toBe('BrowserMind');
  });

  it('omits auth entirely when there is no key', () => {
    const headers = authHeaders('custom_openai', '');
    expect(headers.Authorization).toBeUndefined();
    expect(headers['Content-Type']).toBe('application/json');
  });
});

describe('model list curation', () => {
  it('rejects models that cannot run a chat loop', () => {
    for (const id of ['text-embedding-3-large', 'whisper-1', 'dall-e-3', 'tts-1', 'omni-moderation-latest']) {
      expect(isChatModel(id), id).toBe(false);
    }
    for (const id of ['gpt-4o', 'claude-sonnet-5', 'mistral-large-latest']) {
      expect(isChatModel(id), id).toBe(true);
    }
  });

  it('normalizes an OpenAI listing and drops the noise', () => {
    const models = normalizeModelList({
      data: [{ id: 'gpt-4o' }, { id: 'text-embedding-3-small' }, { id: 'gpt-4o-mini' }],
    });
    expect(models.map(m => m.id)).toEqual(['gpt-4o', 'gpt-4o-mini']);
  });

  it('normalizes an Anthropic listing with display names', () => {
    const models = normalizeModelList({ data: [{ id: 'claude-sonnet-5', display_name: 'Claude Sonnet 5' }] });
    expect(models[0].name).toBe('Claude Sonnet 5');
  });

  it('returns nothing for an unrecognized payload', () => {
    expect(normalizeModelList({})).toEqual([]);
    expect(normalizeModelList(null)).toEqual([]);
  });

  it('puts curated models first and keeps the rest reachable', () => {
    const merged = mergeModelLists('anthropic', [
      { id: 'claude-3-legacy', name: 'legacy' },
      { id: 'claude-sonnet-5', name: 'raw id' },
    ]);
    expect(merged[0].id).toBe('claude-sonnet-5');
    expect(merged[0].curated).toBe(true);
    expect(merged.some(m => m.id === 'claude-3-legacy')).toBe(true);
  });

  it('hides curated models the account cannot actually reach', () => {
    const merged = mergeModelLists('anthropic', [{ id: 'claude-haiku-4-5', name: 'h' }]);
    expect(merged.map(m => m.id)).toEqual(['claude-haiku-4-5']);
  });

  it('falls back to the curated list when the provider lists nothing', () => {
    expect(mergeModelLists('anthropic', []).length).toBe(presetModelsFor('anthropic').length);
  });

  it('preselects the recommended model', () => {
    expect(defaultModelFor('anthropic', [])).toBe('claude-sonnet-5');
    expect(defaultModelFor('xai', [{ id: 'grok-x' }])).toBe('grok-x');
    expect(defaultModelFor('xai', [])).toBe('');
  });
});

describe('testProvider', () => {
  it('refuses to report success without a key', async () => {
    const result = await testProvider('anthropic', '', '');
    expect(result).toEqual({ ok: false, models: [], code: 'missingKey' });
  });

  it('reports an unknown provider type', async () => {
    expect((await testProvider('nope', 'k', '')).code).toBe('unknownProvider');
  });

  it('calls the listing endpoint when there is one', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ data: [{ id: 'claude-sonnet-5' }] }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await testProvider('anthropic', 'sk-ant', '');
    expect(result.ok).toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.anthropic.com/v1/models');
  });

  it('maps an unauthorized listing to a bad key', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 401, text: async () => '{"error":{"message":"invalid key"}}',
    }));
    expect((await testProvider('anthropic', 'wrong', '')).code).toBe('badKey');
  });

  // The old implementation returned the hard-coded preset list without any
  // network call for these providers, so any string looked like a valid key.
  it('probes the chat endpoint when the provider has no listing endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    const result = await testProvider('gemini', 'AIza-test', '');
    expect(result.ok).toBe(true);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(PROVIDER_CATALOG.gemini.chatUrl);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body).max_tokens).toBe(1);
  });

  it('reports a rejected key from the probe instead of claiming success', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false, status: 403, text: async () => 'forbidden',
    }));
    const result = await testProvider('gemini', 'garbage', '');
    expect(result.ok).toBe(false);
    expect(result.code).toBe('badKey');
  });

  it('reports a network failure rather than throwing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const result = await testProvider('custom_openai', '', 'http://localhost:11434/v1');
    expect(result.ok).toBe(false);
    expect(result.code).toBe('networkError');
  });
});
