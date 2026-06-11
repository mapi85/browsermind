import { describe, it, expect, beforeEach } from 'vitest';
import {
  NATIVE_TOOLS, getAllRegisteredTools, getToolByName, getToolsForMode,
  getModeById, _setRegistryForTests,
} from '../src/shared/tools.js';
import { BUILTIN_MODES, detectModeFromUrl } from '../src/shared/modes.js';

beforeEach(() => {
  _setRegistryForTests([...NATIVE_TOOLS], {});
});

describe('native tools', () => {
  it('exposes the 14 native tools with valid schemas', () => {
    expect(NATIVE_TOOLS).toHaveLength(14);
    for (const t of NATIVE_TOOLS) {
      expect(t.name).toMatch(/^[a-z0-9_]+$/);
      expect(typeof t.description).toBe('string');
      expect(t.input_schema.type).toBe('object');
    }
  });

  it('getToolByName resolves and misses cleanly', () => {
    expect(getToolByName('click')?.name).toBe('click');
    expect(getToolByName('nope')).toBeNull();
  });
});

describe('getToolsForMode', () => {
  it("'libre' (tools: ['*']) returns the whole registry", () => {
    expect(getToolsForMode('libre')).toHaveLength(getAllRegisteredTools().length);
  });

  it('filters tools to the mode allowlist', () => {
    const tools = getToolsForMode('recherche');
    const names = tools.map(t => t.name);
    expect(names).toContain('web_search');
    expect(names).not.toContain('fill_form');
    expect([...names].sort()).toEqual([...BUILTIN_MODES.recherche.tools].sort());
  });

  it('unknown mode falls back to the whole registry', () => {
    expect(getToolsForMode('does_not_exist')).toHaveLength(getAllRegisteredTools().length);
  });

  it('custom modes filter custom tools too', () => {
    const customTool = { name: 'meteo', description: 'd', input_schema: { type: 'object' }, category: 'custom' };
    _setRegistryForTests([...NATIVE_TOOLS, customTool], {
      mon_mode: { id: 'mon_mode', tools: ['meteo', 'click'] },
    });
    const names = getToolsForMode('mon_mode').map(t => t.name);
    expect(names.sort()).toEqual(['click', 'meteo']);
  });
});

describe('getModeById', () => {
  it('resolves builtin, then custom, then defaults to libre', () => {
    expect(getModeById('voyage').id).toBe('voyage');
    _setRegistryForTests([...NATIVE_TOOLS], { perso: { id: 'perso' } });
    expect(getModeById('perso').id).toBe('perso');
    expect(getModeById('inconnu').id).toBe('libre');
  });
});

describe('builtin modes integrity', () => {
  it('every allowlisted tool name exists in the registry', () => {
    const known = new Set(NATIVE_TOOLS.map(t => t.name));
    for (const mode of Object.values(BUILTIN_MODES)) {
      for (const name of mode.tools) {
        if (name === '*') continue;
        expect(known.has(name), `${mode.id} references unknown tool ${name}`).toBe(true);
      }
    }
  });

  it('mode ids match their keys', () => {
    for (const [key, mode] of Object.entries(BUILTIN_MODES)) {
      expect(mode.id).toBe(key);
    }
  });
});

describe('detectModeFromUrl', () => {
  it('matches builtin url patterns', () => {
    expect(detectModeFromUrl('https://www.booking.com/hotel/x')).toBe('voyage');
    expect(detectModeFromUrl('https://fr.wikipedia.org/wiki/Lyon')).toBe('recherche');
  });

  it('returns null for unmatched or empty urls', () => {
    expect(detectModeFromUrl('https://example.org')).toBeNull();
    expect(detectModeFromUrl('')).toBeNull();
  });

  it('considers custom modes when a merged map is provided', () => {
    const merged = { ...BUILTIN_MODES, perso: { id: 'perso', urlPatterns: ['monsite.fr'] } };
    expect(detectModeFromUrl('https://monsite.fr/page', merged)).toBe('perso');
  });
});
