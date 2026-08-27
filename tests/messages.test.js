// Every string the UI asks for must exist. With no build step and keys that
// are partly assembled at runtime (err*, notice*, status*), a rename would
// otherwise surface as a raw key printed in the panel.
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { NATIVE_TOOLS } from '../src/shared/tools.js';
import { PROVIDER_CATALOG } from '../src/shared/providers.js';

const messages = JSON.parse(readFileSync('_locales/en/messages.json', 'utf8'));
const KEYS = new Set(Object.keys(messages));

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(js|html)$/.test(path) && !path.includes('lib')) out.push(path);
  }
  return out;
}

const sources = [...walk('src'), 'sidepanel.html', 'config.html']
  // The translator documents the data-i18n contract in its own header, which
  // would otherwise read as a reference to a key called "key".
  .filter(path => !path.endsWith('i18n.js'));

function referencedKeys() {
  const found = new Map(); // key → file

  for (const path of sources) {
    const text = readFileSync(path, 'utf8');

    for (const [, key] of text.matchAll(/\bt\('([A-Za-z0-9_]+)'[,)]/g)) found.set(key, path);
    for (const [, key] of text.matchAll(/data-i18n="([A-Za-z0-9_]+)"/g)) found.set(key, path);
    for (const [, pairs] of text.matchAll(/data-i18n-attr="([^"]+)"/g)) {
      for (const pair of pairs.split(',')) {
        const key = pair.split(':')[1]?.trim();
        if (key) found.set(key, path);
      }
    }
  }
  return found;
}

describe('message coverage', () => {
  it('defines every statically referenced key', () => {
    const missing = [];
    for (const [key, path] of referencedKeys()) {
      // t() is also called with a variable holding an already-resolved key.
      if (!KEYS.has(key)) missing.push(`${key} (${path})`);
    }
    expect(missing).toEqual([]);
  });

  it('defines a label for every tool', () => {
    for (const tool of NATIVE_TOOLS) {
      expect(KEYS.has(tool.labelKey), `${tool.name} → ${tool.labelKey}`).toBe(true);
    }
  });

  it('defines a tier label for every catalog model', () => {
    for (const def of Object.values(PROVIDER_CATALOG)) {
      for (const model of def.models) {
        expect(KEYS.has(model.tierKey), `${def.id}/${model.id} → ${model.tierKey}`).toBe(true);
      }
    }
  });

  // These are assembled from an engine key at render time, so nothing static
  // references them.
  it('defines every status the engine can emit', () => {
    const statuses = [
      'thinking', 'acting', 'stopping', 'stopped', 'done', 'paused',
      'rateLimitWait', 'awaitingConfirm', 'waitingModel', 'loadingModel',
    ];
    for (const key of statuses) {
      expect(KEYS.has('status' + key[0].toUpperCase() + key.slice(1)), key).toBe(true);
    }
  });

  it('defines every notice the engine can emit', () => {
    const notices = [
      'maxIterations', 'pageChanged', 'stoppedPageChanged', 'stoppedByUser',
      'rateLimited', 'providerChanged', 'contextTrimmed', 'resumed',
    ];
    for (const key of notices) {
      expect(KEYS.has('notice' + key[0].toUpperCase() + key.slice(1)), key).toBe(true);
    }
  });

  it('defines every error the engine can emit', () => {
    const errors = [
      'noProvider', 'noKey', 'noModel', 'noEndpoint', 'unknownProvider',
      'badKey', 'noCredit', 'badEndpoint', 'badRequest', 'providerDown',
      'timeout', 'api', 'emptyResponse', 'refusal', 'offline', 'contextTooLong',
    ];
    for (const key of errors) {
      expect(KEYS.has('err' + key[0].toUpperCase() + key.slice(1)), key).toBe(true);
    }
  });

  it('defines every provider test outcome', () => {
    const outcomes = ['MissingKey', 'BadKey', 'NoCredit', 'BadUrl', 'RateLimited', 'ProviderDown', 'Network', 'NoModel'];
    for (const key of outcomes) {
      expect(KEYS.has('test' + key), key).toBe(true);
    }
  });
});
