// Smoke test: the extension has no build step, so nothing else would catch a
// syntax error, a bad import path or a renamed export before Chrome refuses to
// load the extension. Importing each entry point with the thinnest possible
// platform stub does.
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';

function listener() {
  return { addListener: () => {}, removeListener: () => {}, hasListener: () => false };
}

function area() {
  return {
    get: (keys, cb) => (typeof cb === 'function' ? cb({}) : Promise.resolve({})),
    set: (items, cb) => (typeof cb === 'function' ? cb() : Promise.resolve()),
    remove: (keys, cb) => (typeof cb === 'function' ? cb() : Promise.resolve()),
  };
}

beforeAll(() => {
  globalThis.chrome = {
    alarms: { create: () => Promise.resolve(), clear: () => Promise.resolve(true), onAlarm: listener() },
    action: { onClicked: listener() },
    sidePanel: { open: () => Promise.resolve(), setPanelBehavior: () => Promise.resolve() },
    tabs: {
      onActivated: listener(), onUpdated: listener(), onRemoved: listener(),
      query: () => Promise.resolve([]), get: () => Promise.resolve({}),
      create: () => Promise.resolve({ id: 1 }), update: () => Promise.resolve({}),
      remove: () => Promise.resolve(), captureVisibleTab: () => Promise.resolve(''),
    },
    windows: { getCurrent: () => Promise.resolve({ id: 1 }) },
    runtime: {
      onInstalled: listener(), onMessage: listener(),
      sendMessage: () => Promise.resolve(), getURL: (p) => p,
      openOptionsPage: () => {}, lastError: null, id: 'test',
    },
    storage: { local: area(), session: area(), onChanged: listener() },
    scripting: { executeScript: () => Promise.resolve([{ result: null }]) },
    downloads: { download: () => Promise.resolve(1) },
  };
});

describe('module graph', () => {
  it('loads every shared module', async () => {
    for (const path of ['llm', 'providers', 'tools', 'settings', 'icons', 'stream']) {
      await expect(import(`../src/shared/${path}.js`), path).resolves.toBeTruthy();
    }
  });

  it('loads the agent engine and exposes its command surface', async () => {
    const engine = await import('../src/background/engine.js');
    const api = [
      'initEngine', 'startTask', 'continueTask', 'stopTask', 'clearTask',
      'getSession', 'retireSession', 'dropSession', 'respondNavConfirm', 'notifyTabNavigated',
    ];
    for (const fn of api) expect(typeof engine[fn], `engine.${fn}`).toBe('function');
  });

  it('loads the service worker entry point', async () => {
    await expect(import('../src/background.js')).resolves.toBeTruthy();
  });

  // Linking a module verifies every named import actually exists, which is
  // the failure a rename would otherwise only produce in the browser.
  it('links the side panel and settings page modules', async () => {
    const noop = () => {};
    vi.stubGlobal('document', { addEventListener: noop, documentElement: {}, querySelectorAll: () => [] });
    vi.stubGlobal('window', { addEventListener: noop });

    await expect(import('../src/panel/main.js')).resolves.toBeTruthy();
    await expect(import('../src/configpage/main.js')).resolves.toBeTruthy();

    vi.unstubAllGlobals();
  });
});

describe('extension package', () => {
  const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));

  it('points at files that exist', () => {
    const referenced = [
      manifest.background.service_worker,
      manifest.side_panel.default_path,
      manifest.options_page,
      ...Object.values(manifest.icons),
    ];
    for (const path of referenced) expect(existsSync(path), path).toBe(true);
  });

  it('declares the permissions the code actually uses, and no more', () => {
    expect(manifest.permissions.sort()).toEqual(
      ['alarms', 'clipboardWrite', 'downloads', 'scripting', 'sidePanel', 'storage', 'tabs'],
    );
    // activeTab was redundant next to the <all_urls> host permission.
    expect(manifest.permissions).not.toContain('activeTab');
  });

  it('sets a minimum Chrome version covering the APIs in use', () => {
    // AbortSignal/sidePanel/dialog behaviour we rely on.
    expect(Number(manifest.minimum_chrome_version)).toBeGreaterThanOrEqual(114);
  });

  it('declares a content security policy that forbids remote code', () => {
    const csp = manifest.content_security_policy.extension_pages;
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain('unsafe-eval');
  });
});

describe('no dead references remain', () => {
  const sources = [
    'src/background.js', 'src/background/engine.js', 'src/panel/main.js',
    'src/configpage/main.js', 'src/content.js',
    'sidepanel.html', 'config.html', 'src/shared.css',
  ];

  it('does not import the removed modes module', () => {
    for (const path of sources) {
      expect(readFileSync(path, 'utf8'), path).not.toContain('shared/modes.js');
    }
  });

  it('loads no font or asset from a remote host', () => {
    for (const path of sources) {
      const source = readFileSync(path, 'utf8');
      expect(source, path).not.toContain('fonts.googleapis.com');
      expect(source, path).not.toContain('s2/favicons');
    }
  });

  // Nine elements are shown and hidden through el.hidden. Any class that sets
  // `display` beats the browser's own [hidden] rule, so without an explicit
  // override every one of them stays permanently visible.
  it('makes the hidden attribute win over the layout rules', () => {
    const css = readFileSync('src/shared.css', 'utf8').replace(/\s+/g, ' ');
    expect(css).toContain('[hidden] { display: none !important; }');
  });

  it('keeps the anti-detection input emulation out of the codebase', () => {
    const background = readFileSync('src/background.js', 'utf8');
    for (const gone of ['humanMouseMove', 'humanClickFallback', 'humanTypeFallback', 'randomDelayBetweenActions']) {
      expect(background, gone).not.toContain(gone);
    }
  });
});
