// ═══════════════════════════════════════════════
//  BrowserMind — Localization
//
//  Strings live in _locales/<lang>/messages.json, the same files Chrome uses
//  to localize the extension name and description in the Web Store listing.
//  They are read at runtime rather than through chrome.i18n.getMessage,
//  because chrome.i18n is locked to the browser's language and the user is
//  allowed to pick a different one for the interface.
//
//  Only user-facing text is localized. Anything the model reads stays in
//  English — see shared/tools.js.
// ═══════════════════════════════════════════════

import { SUPPORTED_LANGS, resolveLang } from './settings.js';

const FALLBACK = 'en';
const cache = new Map();  // lang → { key: message }

let active = FALLBACK;
let messages = {};
let fallbackMessages = {};

async function fetchLocale(lang) {
  if (cache.has(lang)) return cache.get(lang);

  const url = chrome.runtime.getURL(`_locales/${lang}/messages.json`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`locale ${lang}: HTTP ${res.status}`);

  const raw = await res.json();
  const flat = {};
  for (const [key, entry] of Object.entries(raw)) flat[key] = entry.message;

  cache.set(lang, flat);
  return flat;
}

/**
 * Loads a locale and makes it active.
 * @param {string} pref  language code, or '' to follow the browser
 * @returns {Promise<string>} the language actually loaded
 */
export async function initI18n(pref) {
  const browserLang = (typeof navigator !== 'undefined' && navigator.language) || FALLBACK;
  const lang = resolveLang(pref, browserLang);

  if (!fallbackMessages.appName) {
    try { fallbackMessages = await fetchLocale(FALLBACK); }
    catch { fallbackMessages = {}; }
  }

  if (lang === FALLBACK) {
    messages = fallbackMessages;
    active = FALLBACK;
    return active;
  }

  try {
    messages = await fetchLocale(lang);
    active = lang;
  } catch {
    messages = fallbackMessages;
    active = FALLBACK;
  }
  return active;
}

export function currentLang() {
  return active;
}

export { SUPPORTED_LANGS };

/**
 * Looks up a message and fills {placeholders}.
 * Falls back to English, then to the key itself, so a missing translation
 * degrades to readable text instead of an empty element.
 */
export function t(key, params) {
  const template = messages[key] ?? fallbackMessages[key] ?? key;
  if (!params) return template;

  return template.replace(/\{(\w+)\}/g, (whole, name) =>
    (params[name] === undefined ? whole : String(params[name])));
}

/**
 * Applies translations to a document.
 *   data-i18n="key"            → textContent
 *   data-i18n-attr="attr:key"  → attribute (repeatable, comma separated)
 */
export function applyI18n(root = document) {
  for (const el of root.querySelectorAll('[data-i18n]')) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of root.querySelectorAll('[data-i18n-attr]')) {
    for (const pair of el.dataset.i18nAttr.split(',')) {
      const [attr, key] = pair.split(':').map(s => s.trim());
      if (attr && key) el.setAttribute(attr, t(key));
    }
  }
  if (root === document) {
    document.documentElement.lang = active;
  }
}

/** Native language names, for the language picker. */
export const LANG_LABELS = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  de: 'Deutsch',
  pt: 'Português',
};
