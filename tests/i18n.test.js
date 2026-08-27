import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LOCALES_DIR = '_locales';
const REFERENCE = 'en';

const langs = readdirSync(LOCALES_DIR);
const load = (lang) => JSON.parse(readFileSync(join(LOCALES_DIR, lang, 'messages.json'), 'utf8'));

describe('locale files', () => {
  it('ships the six supported languages', () => {
    expect(langs.sort()).toEqual(['de', 'en', 'es', 'fr', 'it', 'pt']);
  });

  it('gives every language the same keys as English', () => {
    const reference = Object.keys(load(REFERENCE)).sort();
    for (const lang of langs) {
      expect(Object.keys(load(lang)).sort(), `${lang} keys differ`).toEqual(reference);
    }
  });

  it('leaves no message empty', () => {
    for (const lang of langs) {
      for (const [key, entry] of Object.entries(load(lang))) {
        expect(entry.message?.trim(), `${lang}/${key}`).toBeTruthy();
      }
    }
  });

  it('keeps the same placeholders in every translation', () => {
    const placeholders = (text) => (text.match(/\{(\w+)\}/g) || []).sort();
    const reference = load(REFERENCE);

    for (const lang of langs) {
      const messages = load(lang);
      for (const [key, entry] of Object.entries(reference)) {
        expect(placeholders(messages[key].message), `${lang}/${key}`)
          .toEqual(placeholders(entry.message));
      }
    }
  });

  it('localizes the store listing name and description', () => {
    for (const lang of langs) {
      const messages = load(lang);
      expect(messages.appName.message, lang).toBeTruthy();
      expect(messages.appDescription.message.length, lang).toBeLessThanOrEqual(132);
    }
  });

  it('is what the manifest points at', () => {
    const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
    expect(manifest.default_locale).toBe(REFERENCE);
    expect(manifest.name).toBe('__MSG_appName__');
    expect(manifest.description).toBe('__MSG_appDescription__');
  });
});

describe('runtime translator', () => {
  let i18n;

  const setBrowserLang = (language) => vi.stubGlobal('navigator', { language });

  beforeAll(async () => {
    // The loader reads the same files the browser would, over fetch.
    vi.stubGlobal('chrome', { runtime: { getURL: (path) => path } });
    vi.stubGlobal('fetch', async (path) => {
      const lang = /_locales\/([a-z]{2})\//.exec(path)?.[1];
      if (!lang || !langs.includes(lang)) return { ok: false, status: 404 };
      return { ok: true, json: async () => load(lang) };
    });
    setBrowserLang('en-US');

    i18n = await import('../src/shared/i18n.js');
  });

  afterAll(() => { vi.unstubAllGlobals(); });

  it('loads the requested language', async () => {
    expect(await i18n.initI18n('fr')).toBe('fr');
    expect(i18n.t('send')).toBe('Envoyer');
  });

  it('follows the browser language when no preference is set', async () => {
    setBrowserLang('de-DE');
    expect(await i18n.initI18n('')).toBe('de');
    expect(i18n.t('send')).toBe('Senden');
  });

  it('falls back to English for an unsupported language', async () => {
    setBrowserLang('ja-JP');
    expect(await i18n.initI18n('')).toBe('en');
    expect(i18n.t('send')).toBe('Send');
  });

  it('fills placeholders', async () => {
    await i18n.initI18n('en');
    expect(i18n.t('statusThinking', { i: 2, max: 15 })).toBe('Thinking · step 2 of 15');
  });

  it('leaves an unknown placeholder visible rather than blanking it', async () => {
    await i18n.initI18n('en');
    expect(i18n.t('statusThinking', { i: 2 })).toContain('{max}');
  });

  it('returns the key itself when a message is missing', async () => {
    await i18n.initI18n('en');
    expect(i18n.t('nope_not_a_key')).toBe('nope_not_a_key');
  });

  it('offers a native label for each supported language', () => {
    for (const lang of i18n.SUPPORTED_LANGS) {
      expect(i18n.LANG_LABELS[lang], lang).toBeTruthy();
    }
  });
});
