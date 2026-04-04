(function () {
  'use strict';

  if (window.__svaraiLoaded) return;
  window.__svaraiLoaded = true;

  var script = document.currentScript;
  var orgId = (script && script.getAttribute('data-org')) || '';
  var baseUrl = (script && script.getAttribute('data-url')) || 'https://svarai.vercel.app';

  if (!orgId) {
    console.warn('[SvarAI] Mangler data-org attributt på script-taggen.');
    return;
  }

  var EMBED_URL = baseUrl + '/embed?org=' + encodeURIComponent(orgId);
  var BUBBLE_COLOR = '#2563eb';
  var BUBBLE_SIZE = 60;
  var Z_BASE = 2147483640;

  function init() {
    if (!document.body) { setTimeout(init, 100); return; }
    if (document.getElementById('svarai-bubble')) return;
    build();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function build() {
    /* ── Styles ── */
    var style = document.createElement('style');
    style.textContent = [
      '#svarai-bubble{position:fixed!important;bottom:20px;right:20px;width:' + BUBBLE_SIZE + 'px!important;height:' + BUBBLE_SIZE + 'px!important;',
      'background:' + BUBBLE_COLOR + '!important;border-radius:50%!important;',
      'display:flex!important;align-items:center!important;justify-content:center!important;',
      'cursor:pointer!important;box-shadow:0 4px 20px rgba(0,0,0,0.2)!important;',
      'z-index:' + Z_BASE + '!important;transition:transform 0.2s,opacity 0.2s;user-select:none;}',
      '#svarai-bubble:hover{transform:scale(1.08)!important;}',
      '#svarai-bubble.svarai-hidden{opacity:0!important;pointer-events:none!important;transform:scale(0.7)!important;}',
      '#svarai-bubble svg{width:26px;height:26px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}',
      '#svarai-frame-wrap{position:fixed!important;bottom:90px;right:20px;',
      'width:min(380px,calc(100vw - 24px))!important;height:min(600px,calc(100dvh - 110px))!important;',
      'border-radius:16px!important;overflow:hidden!important;',
      'box-shadow:0 12px 48px rgba(0,0,0,0.22)!important;',
      'z-index:' + (Z_BASE + 1) + '!important;',
      'transition:transform 0.3s cubic-bezier(0.34,1.25,0.64,1),opacity 0.25s;transform-origin:bottom right;}',
      '#svarai-frame-wrap.svarai-hidden{opacity:0!important;pointer-events:none!important;transform:scale(0.88) translateY(12px)!important;}',
      '#svarai-frame-wrap iframe{width:100%!important;height:100%!important;border:none!important;display:block!important;}',
      '@media(max-width:600px){',
      '#svarai-frame-wrap{right:0!important;bottom:0!important;width:100vw!important;height:100dvh!important;border-radius:0!important;}',
      '}',
    ].join('');
    (document.head || document.documentElement).appendChild(style);

    /* ── Bubble ── */
    var bubble = document.createElement('div');
    bubble.id = 'svarai-bubble';
    bubble.setAttribute('role', 'button');
    bubble.setAttribute('aria-label', 'Åpne chat');
    bubble.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    document.body.appendChild(bubble);

    /* ── Iframe wrapper ── */
    var wrap = document.createElement('div');
    wrap.id = 'svarai-frame-wrap';
    wrap.classList.add('svarai-hidden');
    var iframe = document.createElement('iframe');
    iframe.src = EMBED_URL;
    iframe.title = 'Chat';
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.setAttribute('loading', 'lazy');
    wrap.appendChild(iframe);
    document.body.appendChild(wrap);

    /* ── State ── */
    var isOpen = false;

    function open() {
      isOpen = true;
      wrap.classList.remove('svarai-hidden');
      bubble.classList.add('svarai-hidden');
      try { iframe.contentWindow.postMessage({ type: 'svarai-open' }, '*'); } catch (e) {}
    }

    function close() {
      isOpen = false;
      wrap.classList.add('svarai-hidden');
      bubble.classList.remove('svarai-hidden');
    }

    bubble.addEventListener('click', function () { if (!isOpen) open(); });

    window.addEventListener('message', function (e) {
      try {
        if (new URL(EMBED_URL).origin !== e.origin) return;
      } catch (e) { return; }
      if (e.data && e.data.type === 'svarai-close') close();
    });
  }
})();
