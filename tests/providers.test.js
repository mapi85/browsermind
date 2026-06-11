import { describe, it, expect } from 'vitest';
import {
  PROVIDER_CATALOG, providerDef, isOpenAIWire, presetModelsFor,
  chatUrlFor, normalizeModelList,
} from '../src/shared/providers.js';

describe('PROVIDER_CATALOG', () => {
  it('every non-custom provider has a chat endpoint', () => {
    for (const [id, def] of Object.entries(PROVIDER_CATALOG)) {
      if (id.startsWith('custom_')) {
        expect(def.chatUrl).toBeNull();
      } else {
        expect(def.chatUrl, `${id} missing chatUrl`).toMatch(/^https:\/\//);
      }
      expect(['anthropic', 'openai']).toContain(def.type);
    }
  });

  it('wire-format helpers agree with the catalog', () => {
    expect(isOpenAIWire('anthropic')).toBe(false);
    expect(isOpenAIWire('custom_anthropic')).toBe(false);
    expect(isOpenAIWire('openai')).toBe(true);
    expect(isOpenAIWire('unknown_provider')).toBe(true); // OpenAI is the safe default
  });

  it('providerDef / chatUrlFor / presetModelsFor handle unknown ids', () => {
    expect(providerDef('nope')).toBeNull();
    expect(chatUrlFor('nope')).toBeNull();
    expect(presetModelsFor('nope')).toEqual([]);
  });

  it('anthropic presets use current model ids', () => {
    const ids = presetModelsFor('anthropic').map(m => m.id);
    expect(ids).toContain('claude-opus-4-8');
    expect(ids).toContain('claude-sonnet-4-6');
    expect(ids).toContain('claude-haiku-4-5');
  });
});

describe('normalizeModelList', () => {
  it('normalizes OpenAI-style listings, filtering non-chat models', () => {
    const models = normalizeModelList({
      data: [
        { id: 'gpt-4o' },
        { id: 'text-embedding-3-small' },
        { id: 'whisper-1' },
        { id: 'a-model', name: 'A Model' },
      ],
    });
    expect(models.map(m => m.id)).toEqual(['a-model', 'gpt-4o']);
    expect(models[0].name).toBe('A Model');
  });

  it('normalizes Anthropic-style listings via display_name', () => {
    const models = normalizeModelList({
      data: [{ id: 'claude-opus-4-8', display_name: 'Claude Opus 4.8' }],
    });
    expect(models).toEqual([{ id: 'claude-opus-4-8', name: 'Claude Opus 4.8' }]);
  });

  it('supports the {models: []} shape and empty payloads', () => {
    expect(normalizeModelList({ models: [{ model: 'm1' }] })).toEqual([{ id: 'm1', name: 'm1' }]);
    expect(normalizeModelList({})).toEqual([]);
  });
});
