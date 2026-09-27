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
  frame.addEventListener('load', () => { send({ type: 'visible', v: visible || expanded }); send({ type: 'interactive', v: expanded }); applySound(); });
  if (document.readyState === 'complete') setTimeout(load, 300);
  else window.addEventListener('load', () => setTimeout(load, 300));

  // ---------- Dati dalla scena ----------
  window.addEventListener('message', (e) => {
    if (e.origin !== location.origin || !e.data || e.data.src !== 'frontline') return;
    if (e.data.type === 'close') return setExpanded(false);
    if (e.data.type === 'sfx') { if (window.FLSound) window.FLSound.play(e.data); return; }
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
    if (!on && tourStep) closeTour();
    applySound();
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
  $('flOpen').onclick = () => { setExpanded(true); setTimeout(() => openTour(), 350); };
  $('flClose').onclick = () => setExpanded(false);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (tourStep) { closeTour(); return; }   // Esc chiude prima il tutorial, poi la vista 3D
    if (expanded) setExpanded(false);
  });
  stage.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => {
    if (tourStep) closeTour();
    send({ type: 'view', mode: b.dataset.view });
  }));

  // ---------- Mini tutorial: come muoversi nella scena ----------
  const tour = $('flTour');
  let tourStep = 0;
  const coarse = () => window.matchMedia('(pointer: coarse)').matches;
  function renderTour() {
    if (!tourStep) return;
    const t = T(), tt = t.tour, list = $('flTourList');
    tour.classList.toggle('step2', tourStep === 2);
    stage.classList.toggle('tour-views', tourStep === 2);
    $('flTourStep').textContent = tt.step.replace('{n}', tourStep);
    $('flTourTitle').textContent = tourStep === 1 ? tt.t1 : tt.t2;
    list.innerHTML = '';
    if (tourStep === 1) {
      const icons = coarse() ? ['1', '⤢', '2'] : ['↻', '±', '✥'];
      (coarse() ? tt.touch : tt.pointer).forEach((line, i) => {
        const li = document.createElement('li');
        li.innerHTML = '<span class="ico" aria-hidden="true"></span><span></span>';
        li.firstChild.textContent = icons[i];
        li.lastChild.textContent = line;
        list.appendChild(li);
      });
    } else {
      [t.vOverview, t.vFront, t.vCinema, t.vHistory].forEach((name, i) => {
        const li = document.createElement('li');
        li.innerHTML = '<span class="ico" aria-hidden="true"></span><span><b></b></span>';
        li.firstChild.textContent = String(i + 1);
        li.querySelector('b').textContent = name;
        li.lastChild.append(document.createTextNode(': ' + tt.views[i]));
        list.appendChild(li);
      });
    }
    $('flTourNext').textContent = tourStep === 1 ? tt.next : tt.done;
    $('flTourSkip').textContent = tt.skip;
    $('flTourSkip').hidden = tourStep === 2;
    if (tourStep === 2) requestAnimationFrame(pointAtViews);
  }
  // passo 2: la scheda si allinea ai pulsanti delle viste e la freccia punta al loro centro
  function pointAtViews() {
    const card = tour.querySelector('.fl-tour-card'), views = stage.querySelector('.fl-views');
    card.style.marginRight = '';
    if (!views || window.innerWidth <= 620) return;
    const v = views.getBoundingClientRect(), t = tour.getBoundingClientRect();
    card.style.marginRight = Math.max(12, t.right - v.right - 20) + 'px';
    const c = card.getBoundingClientRect();
    const x = Math.min(c.width - 30, Math.max(22, v.left + v.width / 2 - c.left));
    card.style.setProperty('--arrow-x', x - 8 + 'px');
  }
  function openTour() {
    if (!expanded) return;
    const bar = stage.querySelector('.fl-bar');
    stage.style.setProperty('--fl-bar-h', (bar ? bar.offsetHeight : 58) + 'px');
    tourStep = 1;
    tour.hidden = false;
    renderTour();
    $('flTourNext').focus({ preventScroll: true });
  }
  function closeTour() {
    tourStep = 0;
    tour.hidden = true;
    stage.classList.remove('tour-views');
    if (expanded) setTimeout(() => frame.focus(), 30); // la tastiera (W A S D) torna alla scena
  }
  $('flTourNext').onclick = () => { if (tourStep === 1) { tourStep = 2; renderTour(); $('flTourNext').focus({ preventScroll: true }); } else closeTour(); };
  $('flTourSkip').onclick = closeTour;
  window.addEventListener('resize', () => { if (tourStep === 2) pointAtViews(); });
  $('flHelp').onclick = () => (tourStep ? closeTour() : openTour());
  // il tutorial resta dentro la finestra: Tab non esce dalla scheda
  tour.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = [...tour.querySelectorAll('button:not([hidden])')];
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
  });

  // ---------- Audio: si sente solo nella vista 3D estesa, se l'utente l'ha attivato ----------
  const SOUND_KEY = 'btcf-sound';
  const soundBtn = $('flSound');
  let soundPref = false;
  try { soundPref = localStorage.getItem(SOUND_KEY) === '1'; } catch (e) {}
  if (!window.FLSound || !window.FLSound.supported) soundBtn.hidden = true;
  function applySound() {
    const want = soundPref && expanded && !document.hidden;
    if (window.FLSound) window.FLSound.set(want);
    send({ type: 'sound', v: want });
    soundBtn.setAttribute('aria-pressed', String(soundPref));
    const label = soundPref ? T().soundOff : T().soundOn;
    soundBtn.setAttribute('aria-label', label); soundBtn.title = label;
  }
  soundBtn.onclick = () => {
    soundPref = !soundPref;
    try { localStorage.setItem(SOUND_KEY, soundPref ? '1' : '0'); } catch (e) {}
    applySound();
  };
  document.addEventListener('visibilitychange', applySound);
  applySound();

  // ---------- Lingua ----------
  function labels() { $('flClose').setAttribute('aria-label', T().close); }
  window.addEventListener('langchange', () => { labels(); render(); renderTour(); applySound(); if (loadedLang && loadedLang !== window.currentLang) load(); });
  labels();
  render();
})();
