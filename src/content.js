// BrowserMind v1.0.0 — Content Script
(function () {
  if (window.__bm_loaded) return;
  window.__bm_loaded = true;

  let overlay = null;
  let highlightEnabled = true;

  function getOrCreateOverlay() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = '__bm_hl';
    overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;border:2px solid #7c6af7;border-radius:5px;background:rgba(124,106,247,0.08);display:none;transition:all 0.12s;box-shadow:0 0 0 4px rgba(124,106,247,0.1);';
    document.body.appendChild(overlay);
    return overlay;
  }

  function showToast(text, type = 'info') {
    document.getElementById('__bm_toast')?.remove();
    const colors = { info: '#7c6af7', success: '#34d399', warn: '#fbbf24', error: '#f87171' };
    const t = document.createElement('div');
    t.id = '__bm_toast';
    t.style.cssText = `position:fixed;bottom:20px;right:20px;background:#12121a;border:1px solid ${colors[type]};border-left:3px solid ${colors[type]};color:#e8e8f2;padding:9px 14px;border-radius:8px;font-family:Inter,-apple-system,sans-serif;font-size:13px;z-index:2147483646;max-width:280px;box-shadow:0 4px 20px rgba(0,0,0,0.4);animation:__bm_in 0.18s ease;`;
    const s = document.createElement('style');
    s.textContent = '@keyframes __bm_in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
    t.textContent = text;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2800);
  }

  function ripple(x, y) {
    const r = document.createElement('div');
    r.style.cssText = `position:fixed;left:${x - 16}px;top:${y - 16}px;width:32px;height:32px;border:2px solid #7c6af7;border-radius:50%;pointer-events:none;z-index:2147483647;animation:__bm_rip 0.4s ease-out forwards;`;
    if (!document.getElementById('__bm_rip_style')) {
      const s = document.createElement('style');
      s.id = '__bm_rip_style';
      s.textContent = '@keyframes __bm_rip{from{transform:scale(0.3);opacity:1}to{transform:scale(2.2);opacity:0}}';
      document.head.appendChild(s);
    }
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 400);
  }

  function highlightElement(el) {
    if (!highlightEnabled) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const ov = getOrCreateOverlay();
    ov.style.cssText += `display:block;top:${rect.top}px;left:${rect.left}px;width:${rect.width}px;height:${rect.height}px;`;
    ripple(rect.left + rect.width / 2, rect.top + rect.height / 2);
    setTimeout(() => { ov.style.display = 'none'; }, 800);
  }

  function loadSettings() {
    chrome.storage.local.get(['highlightClicks'], (result) => {
      highlightEnabled = result.highlightClicks !== false;
    });
  }

  loadSettings();
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.highlightClicks) {
      highlightEnabled = changes.highlightClicks.newValue !== false;
    }
  });

  document.addEventListener('click', (e) => {
    if (e.__bm_tracked) return;
    if (!highlightEnabled) return;
    const el = e.target;
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) highlightElement(el);
  }, true);

  window.__bm_highlight = highlightElement;

  chrome.runtime.onMessage.addListener((msg, _, resp) => {
    if (msg.type === 'TOAST') { showToast(msg.text, msg.level); resp({ ok: true }); }
  });
})();
