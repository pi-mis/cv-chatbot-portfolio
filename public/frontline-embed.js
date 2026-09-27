// BTC Frontline nella hero: la scena 3D gira in un iframe (/frontline/?embed=1),
// mentre prezzo, pressione e muri arrivano via postMessage e sono mostrati con lo stile del sito.
(function () {
  const $ = (id) => document.getElementById(id);
  const stage = $('flStage'), frame = $('flFrame');
  if (!stage || !frame) return;

  const T = () => window.SITE_TEXT[window.currentLang].frontline;
  const LOCALES = { it: 'it-IT', en: 'en-US', sv: 'sv-SE' };
  const nf = (d) => new Intl.NumberFormat(LOCALES[window.currentLang] || 'en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  const usd = (v) => {
    const a = Math.abs(v);
    if (a >= 1e9) return '$' + nf(1).format(v / 1e9) + T().bn;
    if (a >= 1e6) return '$' + nf(1).format(v / 1e6) + 'M';
    if (a >= 1e3) return '$' + nf(0).format(v / 1e3) + 'K';
    return '$' + nf(0).format(v);
  };
  let state = null, lastPrice = null, expanded = false, visible = true, loadedLang = null;

  const send = (msg) => { try { frame.contentWindow.postMessage({ src: 'site', ...msg }, location.origin); } catch (e) {} };

  // ---------- Caricamento: dopo il resto della pagina ----------
  function load() {
    state = null;
    stage.classList.remove('ready');
    render();
    loadedLang = window.currentLang || 'en';
    frame.src = `/frontline/?embed=1&lang=${loadedLang}`;
  }
  frame.addEventListener('load', () => { send({ type: 'visible', v: visible || expanded }); send({ type: 'interactive', v: expanded }); });
  if (document.readyState === 'complete') setTimeout(load, 300);
  else window.addEventListener('load', () => setTimeout(load, 300));

  // ---------- Dati dalla scena ----------
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || e.data.src !== 'frontline') return;
    if (e.data.type === 'close') return setExpanded(false);
    if (e.data.type !== 'state') return;
    state = e.data;
    if (state.price && state.ready) stage.classList.add('ready'); // mostra la scena solo quando il campo è costruito
    render();
  });

  function render() {
    const t = T();
    // stato del collegamento
    const st = $('flStatus');
    const mode = !state ? 'wait' : state.mode === 'demo' ? 'demo' : state.live ? 'live' : 'wait';
    st.className = 'fl-status ' + mode;
    $('flStatusTxt').textContent = mode === 'live' ? t.live : mode === 'demo' ? t.demo : t.connecting;
    if (!state || !state.price) return;

    const pEl = $('flPrice');
    pEl.textContent = '$' + nf(0).format(state.price);
    if (lastPrice != null && Math.abs(state.price - lastPrice) >= 1) {
      pEl.classList.remove('tick-up', 'tick-down'); void pEl.offsetWidth;
      if (!NS.reducedMotion) pEl.classList.add(state.price > lastPrice ? 'tick-up' : 'tick-down');
    }
    lastPrice = state.price;
    const c = $('flChg');
    if (state.change24 == null) { c.textContent = state.mode === 'demo' ? t.simulated : ''; c.className = ''; }
    else { c.textContent = (state.change24 >= 0 ? '+' : '') + nf(2).format(state.change24) + '% 24h'; c.className = state.change24 >= 0 ? 'up' : 'down'; }

    const press = $('flPress');
    press.textContent = t.press[state.pressure] || '';
    press.className = state.pressure === 'bull' ? 'up' : state.pressure === 'bear' ? 'down' : '';
    const share = typeof state.share === 'number' && isFinite(state.share) ? state.share : 0.5;
    $('flMeter').style.width = (share * 100).toFixed(1) + '%';
    $('flBulls').textContent = Math.round(share * 100) + '%';
    $('flBears').textContent = (100 - Math.round(share * 100)) + '%';
    $('flSup').textContent = state.support ? `${usd(state.support.usd)} @ $${nf(0).format(state.support.p)}` : '–';
    $('flRes').textContent = state.resistance ? `${usd(state.resistance.usd)} @ $${nf(0).format(state.resistance.p)}` : '–';
  }

  // ---------- Pausa quando la scena non si vede ----------
  new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    send({ type: 'visible', v: visible || expanded });
  }, { threshold: 0.05 }).observe(stage);

  // ---------- Vista estesa, esplorabile ----------
  let lastFocus = null;
  function setExpanded(on) {
    if (on === expanded) return;
    expanded = on;
    stage.classList.toggle('expanded', on);
    document.body.classList.toggle('fl-lock', on);
    send({ type: 'interactive', v: on });
    send({ type: 'visible', v: on || visible });
    if (on) {
      lastFocus = document.activeElement;
      frame.tabIndex = 0;
      setTimeout(() => frame.focus(), 50);
    } else {
      frame.tabIndex = -1;
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    window.dispatchEvent(new CustomEvent('arcade:switch', { detail: 'none' })); // mette in pausa i giochi
  }
  $('flOpen').onclick = () => setExpanded(true);
  $('flClose').onclick = () => setExpanded(false);
  document.addEventListener('keydown', (e) => { if (expanded && e.key === 'Escape') setExpanded(false); });
  stage.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => send({ type: 'view', mode: b.dataset.view })));

  // ---------- Lingua ----------
  function labels() { $('flClose').setAttribute('aria-label', T().close); }
  window.addEventListener('langchange', () => { labels(); render(); if (loadedLang && loadedLang !== window.currentLang) load(); });
  labels();
  render();
})();
