import { describe, it, expect } from 'vitest';
import { I18N_PANEL, I18N_CONFIG, LANG_OPTIONS, makeT } from '../src/shared/i18n.js';

const LANGS = ['fr', 'en', 'es', 'it', 'de', 'pt'];

describe('dictionaries completeness', () => {
  it('both dictionaries cover the six supported languages', () => {
    expect(Object.keys(I18N_PANEL).sort()).toEqual([...LANGS].sort());
    expect(Object.keys(I18N_CONFIG).sort()).toEqual([...LANGS].sort());
    expect(LANG_OPTIONS.map(l => l.code).sort()).toEqual([...LANGS].sort());
  });

  it.each(LANGS)('panel: %s has every key the FR reference has', (lang) => {
    const missing = Object.keys(I18N_PANEL.fr).filter(k => !(k in I18N_PANEL[lang]));
    expect(missing).toEqual([]);
  });

  it.each(LANGS)('config: %s has every key the FR reference has', (lang) => {
    const missing = Object.keys(I18N_CONFIG.fr).filter(k => !(k in I18N_CONFIG[lang]));
    expect(missing).toEqual([]);
  });
});

describe('makeT', () => {
  it('translates in the active language with FR fallback, then key fallback', () => {
    let lang = 'en';
    const t = makeT(I18N_PANEL, () => lang);
    expect(t('send')).toBe(I18N_PANEL.en.send);
    lang = 'fr';
    expect(t('send')).toBe(I18N_PANEL.fr.send);
    expect(t('definitely_not_a_key')).toBe('definitely_not_a_key');
  });

  it('falls back to FR for an unknown language', () => {
    const t = makeT(I18N_PANEL, () => 'zz');
    expect(t('send')).toBe(I18N_PANEL.fr.send);
  });
});
