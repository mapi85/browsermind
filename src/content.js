// ═══════════════════════════════════════════════
//  BrowserMind — action overlay
//
//  Injected on demand, only into the tab the agent is acting on, and only
//  while the "show what the agent is doing" setting is on. Its single job is
//  to make the agent's actions visible: it reads nothing and sends nothing.
// ═══════════════════════════════════════════════

(() => {
  if (window.__bmOverlayLoaded) return;
  window.__bmOverlayLoaded = true;

  const ACCENT = '#5b4ed8';
  let box = null;
  let hideTimer = 0;

  const styles = (rect) => [
    'position:fixed',
    `top:${rect.top}px`,
    `left:${rect.left}px`,
    `width:${rect.width}px`,
    `height:${rect.height}px`,
    'pointer-events:none',
    'z-index:2147483647',
    `border:2px solid ${ACCENT}`,
    'border-radius:6px',
    'background:rgba(91,78,216,0.10)',
    'box-shadow:0 0 0 4px rgba(91,78,216,0.14)',
    'transition:top .12s,left .12s,width .12s,height .12s,opacity .2s',
    'opacity:1',
  ].join(';');

  function highlight(el) {
    if (!el || !document.body) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

    if (!box) {
      box = document.createElement('div');
      box.setAttribute('aria-hidden', 'true');
      document.body.appendChild(box);
    }
    box.style.cssText = styles(rect);

    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (box) box.style.opacity = '0';
    }, 900);
  }

  window.__bmHighlight = highlight;
})();
