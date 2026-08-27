import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_SETTINGS, LIMITS, loadSettings, saveSettings, migrateStorage,
  resolveLang, SUPPORTED_LANGS, loadPersistentMemory, saveMemoryEntry, deleteMemoryEntry,
} from '../src/shared/settings.js';

let store = {};

beforeEach(() => {
  store = {};
  globalThis.chrome = {
    storage: {
      local: {
        get: async (keys) => {
          const wanted = Array.isArray(keys) ? keys : [keys];
          const out = {};
          for (const key of wanted) if (key in store) out[key] = store[key];
          return out;
        },
        set: async (items) => { Object.assign(store, items); },
        remove: async (keys) => {
          for (const key of (Array.isArray(keys) ? keys : [keys])) delete store[key];
        },
      },
    },
  };
});

describe('loadSettings', () => {
  it('returns the defaults on a fresh install', async () => {
    const settings = await loadSettings();
    expect(settings.maxIterations).toBe(DEFAULT_SETTINGS.maxIterations);
    expect(settings.configuredProviders).toEqual([]);
    expect(settings.theme).toBe('system');
  });

  it('flattens providers into the lookup maps the API layer uses', async () => {
    store.configuredProviders = [{
      instanceId: 'a1', typeId: 'anthropic', name: 'Claude',
      key: 'sk', models: [{ id: 'm' }], selectedModel: 'm', customUrl: '',
    }];
    store.currentProvider = 'a1';

    const settings = await loadSettings();
    expect(settings.providerKeys.a1).toBe('sk');
    expect(settings.providerSelectedModel.a1).toBe('m');
  });

  it('drops a selection pointing at a provider that no longer exists', async () => {
    store.configuredProviders = [{ instanceId: 'b2', typeId: 'openai', key: 'k' }];
    store.currentProvider = 'deleted';

    expect((await loadSettings()).currentProvider).toBe('b2');
  });

  it('keeps false as a real value rather than falling back to the default', async () => {
    store.memoryEnabled = false;
    store.historyEnabled = false;
    const settings = await loadSettings();
    expect(settings.memoryEnabled).toBe(false);
    expect(settings.historyEnabled).toBe(false);
  });

  it('carries the old highlightClicks preference over to its new name', async () => {
    store.highlightClicks = false;
    expect((await loadSettings()).highlightActions).toBe(false);
  });
});

describe('saveSettings', () => {
  it('writes known keys and ignores unknown ones', async () => {
    await saveSettings({ theme: 'dark', bogusKey: 'x' });
    expect(store.theme).toBe('dark');
    expect(store.bogusKey).toBeUndefined();
  });
});

describe('migrateStorage', () => {
  it('removes storage left over by features that no longer exist', async () => {
    Object.assign(store, {
      currentMode: 'voyage',
      enabledModes: ['voyage'],
      customTools: [{ name: 'x' }],
      remoteToolsUrl: 'https://example.com/tools.json',
      theme: 'dark',
    });

    const { removed } = await migrateStorage();
    expect(removed.sort()).toEqual(['currentMode', 'customTools', 'enabledModes', 'remoteToolsUrl']);
    expect(store.currentMode).toBeUndefined();
    expect(store.theme).toBe('dark');
  });

  it('does nothing on a clean install', async () => {
    expect((await migrateStorage()).removed).toEqual([]);
  });
});

describe('resolveLang', () => {
  it('honours an explicit preference', () => {
    expect(resolveLang('fr', 'en-US')).toBe('fr');
  });
  it('falls back to the browser language', () => {
    expect(resolveLang('', 'pt-BR')).toBe('pt');
  });
  it('falls back to English for anything unsupported', () => {
    expect(resolveLang('', 'ja-JP')).toBe('en');
    expect(resolveLang('kr', undefined)).toBe('en');
  });
  it('only ever returns a supported language', () => {
    for (const input of ['fr', 'zz', '', 'de-AT']) {
      expect(SUPPORTED_LANGS).toContain(resolveLang(input, 'xx'));
    }
  });
});

describe('persistent memory', () => {
  it('starts empty', async () => {
    expect(await loadPersistentMemory()).toEqual([]);
  });

  it('adds an entry and persists it', async () => {
    const memory = await saveMemoryEntry([], 'city', 'Nantes');
    expect(memory).toEqual([{ key: 'city', value: 'Nantes', timestamp: expect.any(Number) }]);
    expect(store.persistentMemory).toHaveLength(1);
  });

  it('updates an existing key regardless of case', async () => {
    let memory = await saveMemoryEntry([], 'City', 'Nantes');
    memory = await saveMemoryEntry(memory, 'city', 'Lisbon');
    expect(memory).toHaveLength(1);
    expect(memory[0].value).toBe('Lisbon');
  });

  it('stays bounded — the whole list goes into every request', async () => {
    let memory = [];
    for (let i = 0; i < 130; i++) memory = await saveMemoryEntry(memory, `k${i}`, 'v');
    expect(memory.length).toBeLessThanOrEqual(100);
    expect(memory.at(-1).key).toBe('k129');
  });

  it('forgets an entry', async () => {
    const memory = await saveMemoryEntry([], 'city', 'Nantes');
    expect(await deleteMemoryEntry(memory, 'city')).toEqual([]);
  });
});

describe('LIMITS', () => {
  it('keeps tuning out of the settings surface', () => {
    expect(LIMITS.maxInputTokens).toBeGreaterThan(1000);
    expect(DEFAULT_SETTINGS.maxInputTokens).toBeUndefined();
  });

  it('allows a cold local model far longer to answer than it allows a stall', () => {
    // Loading a large model into VRAM can take minutes and looks exactly like
    // silence; a gap mid-stream does not.
    expect(LIMITS.firstChunkTimeoutMs).toBeGreaterThanOrEqual(180000);
    expect(LIMITS.stallTimeoutMs).toBeLessThan(LIMITS.firstChunkTimeoutMs);
    expect(LIMITS.warmupHintMs).toBeLessThan(LIMITS.stallTimeoutMs);
  });
});
