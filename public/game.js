// Carry & Crash: una versione giocattolo dell'idea short vol / long vol / cash.
// I regimi (calmo/stress) sono una catena di Markov generata all'inizio della partita.
// Il segnale mostrato ogni giorno è la struttura a termine: spesso si appiattisce il giorno prima di un picco.
(function () {
  const $ = (id) => document.getElementById(id);
  if (!$('gameChart')) return;

  const DAYS = 120, START = 100000, TICK_MS = 420, SWITCH_COST = 0.001;
  const BEST_KEY = 'carry-crash-best';
  const T = () => window.SITE_TEXT[window.currentLang].game;
  const LOCALES = { it: 'it-IT', en: 'en-GB', sv: 'sv-SE' };
  const money = (x) => new Intl.NumberFormat(LOCALES[window.currentLang] || 'en-GB', { maximumFractionDigits: 0 }).format(x) + ' kr';
  const pct = (x, digits = 1) => (x > 0 ? '+' : '') + (x * 100).toFixed(digits) + '%';
  const randn = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };

  let S; // stato della partita
  let timer = null;

  function generate() {
    let r;
    for (let tries = 0; tries < 100; tries++) {
      r = [0];
      for (let t = 1; t <= DAYS + 1; t++) {
        const prev = r[t - 1];
        r.push(t < 10 ? 0 : prev === 0 ? (Math.random() < 0.035 ? 1 : 0) : (Math.random() < 0.22 ? 0 : 1));
      }
      let onsets = 0;
      for (let t = 1; t <= DAYS; t++) if (r[t] === 1 && r[t - 1] === 0) onsets++;
      if (onsets >= 2 && onsets <= 5) break;
    }
    const sig = [], ret = [null];
    for (let t = 0; t <= DAYS; t++) {
      const now = r[t], next = r[t + 1];
      let state;
      if (now === 0) state = (next === 1 && Math.random() < 0.65) || Math.random() < 0.04 ? 'warn' : 'calm';
      else state = next === 0 && Math.random() < 0.6 ? 'warn' : 'stress';
      let back, front;
      if (state === 'calm') { back = 19 + randn() * 0.5; front = 13.5 + randn(); }
      else if (state === 'warn') { back = 21 + randn() * 0.6; front = back - 0.5 + randn(); }
      else { back = 27 + randn(); front = 38 + randn() * 3; }
      sig.push({ state, front, back });
    }
    for (let t = 1; t <= DAYS; t++) {
      const onset = r[t] === 1 && r[t - 1] === 0;
      const recovery = r[t] === 0 && r[t - 1] === 1;
      let sv, lv;
      if (onset) { sv = -0.13 + 0.04 * randn(); lv = 0.2 + 0.06 * randn(); }
      else if (r[t] === 1) { sv = -0.012 + 0.04 * randn(); lv = 0.012 + 0.06 * randn(); }
      else if (recovery) { sv = 0.03 + 0.02 * randn(); lv = -0.05 + 0.03 * randn(); }
      else { sv = 0.0035 + 0.009 * randn(); lv = -0.0045 + 0.016 * randn(); }
      ret.push({ sv: Math.max(-0.5, sv), lv: Math.max(-0.5, lv), onset, recovery });
    }
    return { r, sig, ret };
  }

  function newGame() {
    S = {
      ...generate(),
      day: 0, pos: 'cash', eq: START, bench: START,
      eqHist: [START], benchHist: [START], peak: START, maxDD: 0,
      running: false, paused: false, over: false
    };
    setPos('cash', true);
    renderAll();
  }

  function setPos(p, silent) {
    if (!S || S.over) return;
    if (!silent && p !== S.pos && S.running) S.eq *= 1 - SWITCH_COST;
    S.pos = p;
    document.querySelectorAll('.pos-btn').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.pos === p)));
    renderStats();
  }

  function tick() {
    if (S.day >= DAYS) return end();
    S.day++;
    const d = S.ret[S.day];
    const r = S.pos === 'short' ? d.sv : S.pos === 'long' ? d.lv : 0;
    S.eq *= 1 + r;
    S.bench *= 1 + d.sv;
    S.eqHist.push(S.eq); S.benchHist.push(S.bench);
    S.peak = Math.max(S.peak, S.eq);
    S.maxDD = Math.max(S.maxDD, 1 - S.eq / S.peak);
    if (d.onset) toast(T().spike, false);
    if (d.recovery) toast(T().calmBack, true);
    renderAll();
    if (S.day >= DAYS) end();
  }

  function start() {
    $('gStart').hidden = true; $('gEnd').hidden = true;
    S.running = true; S.paused = false;
    $('gPause').disabled = false;
    run();
  }
  function run() { clearInterval(timer); timer = setInterval(tick, TICK_MS); renderPause(); }
  function pause(force) {
    if (!S.running || S.over) return;
    S.paused = force === undefined ? !S.paused : force;
    if (S.paused) clearInterval(timer); else run();
    renderPause();
  }
  function end() {
    clearInterval(timer);
    S.running = false; S.over = true;
    $('gPause').disabled = true;
    const t = T();
    const best = Math.max(parseFloat(localStorage.getItem(BEST_KEY) || '0'), S.eq);
    localStorage.setItem(BEST_KEY, String(best));
    const ret = S.eq / START - 1, bret = S.bench / START - 1;
    const diff = (ret - bret) * 100;
    $('eEq').textContent = money(S.eq);
    $('eRet').textContent = pct(ret);
    $('eDd').textContent = '-' + (S.maxDD * 100).toFixed(1) + '%';
    $('eVerdict').textContent = `${diff >= 0 ? t.beat : t.lag} ${Math.abs(diff).toFixed(1)} ${t.pts}.`;
    $('gEnd').hidden = false;
    renderStats();
    $('gAgain').focus({ preventScroll: true });
  }

  let toastTimer;
  function toast(msg, good) {
    const el = $('gToast');
    el.textContent = msg;
    el.classList.toggle('good', !!good);
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1400);
  }

  // ---------- Render ----------
  function renderPause() { $('gPause').textContent = S.paused ? T().resume : T().pause; }

  function renderStats() {
    $('gDay').textContent = `${S.day} / ${DAYS}`;
    const eq = $('gEq');
    eq.textContent = money(S.eq);
    eq.className = S.eq >= START ? 'up' : 'down';
    $('gBench').textContent = money(S.bench);
    const best = parseFloat(localStorage.getItem(BEST_KEY) || '0');
    $('gBest').textContent = best ? money(best) : '–';
  }

  function renderSignal() {
    const s = S.sig[S.day];
    const t = T();
    const el = $('sigState');
    el.textContent = s.state === 'calm' ? t.sigCalm : s.state === 'warn' ? t.sigWarn : t.sigStress;
    el.className = 'sig-state ' + s.state;
    $('sigNums').textContent = `1m ${s.front.toFixed(1)}%   6m ${s.back.toFixed(1)}%`;

    const c = $('sigCurve');
    const { ctx, w, h } = NS.setup(c);
    ctx.clearRect(0, 0, w, h);
    const X = (m) => 4 + (m / 6) * (w - 8), Y = (v) => 6 + (1 - (v - 8) / 40) * (h - 12);
    ctx.strokeStyle = NS.css('--line'); ctx.lineWidth = 1;
    [15, 25, 35].forEach((v) => { ctx.beginPath(); ctx.moveTo(0, Y(v)); ctx.lineTo(w, Y(v)); ctx.stroke(); });
    const col = s.state === 'calm' ? NS.css('--up') : s.state === 'warn' ? NS.css('--accent') : NS.css('--down');
    ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let m = 0.05; m <= 6; m += 0.05) {
      const v = NS.y(m, s.back, s.front - s.back, 0, 1.5);
      m < 0.1 ? ctx.moveTo(X(m), Y(v)) : ctx.lineTo(X(m), Y(v));
    }
    ctx.stroke();
  }

  function renderChart() {
    const c = $('gameChart');
    const { ctx, w, h } = NS.setup(c);
    const pad = { l: 8, r: 8, t: 10, b: 10 };
    const all = S.eqHist.concat(S.benchHist);
    let lo = Math.min(START * 0.9, ...all), hi = Math.max(START * 1.1, ...all);
    const span = hi - lo; lo -= span * 0.06; hi += span * 0.06;
    const X = (d) => pad.l + (d / DAYS) * (w - pad.l - pad.r);
    const Y = (v) => pad.t + (1 - (v - lo) / (hi - lo)) * (h - pad.t - pad.b);
    ctx.clearRect(0, 0, w, h);

    // giorni di stress già passati
    ctx.fillStyle = NS.css('--stress');
    for (let d = 1; d <= S.day; d++) if (S.r[d] === 1) ctx.fillRect(X(d - 1), pad.t, X(d) - X(d - 1) + 0.5, h - pad.t - pad.b);

    ctx.strokeStyle = NS.css('--line'); ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
    ctx.beginPath(); ctx.moveTo(pad.l, Y(START)); ctx.lineTo(w - pad.r, Y(START)); ctx.stroke();

    const line = (arr, color, width, dash) => {
      ctx.setLineDash(dash); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineJoin = 'round';
      ctx.beginPath(); arr.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v)))); ctx.stroke();
    };
    line(S.benchHist, NS.css('--ink-soft'), 1.5, [5, 4]);
    line(S.eqHist, NS.css('--accent'), 3, []);
    ctx.setLineDash([]);
    const last = S.eqHist.length - 1;
    ctx.fillStyle = NS.css('--accent');
    ctx.beginPath(); ctx.arc(X(last), Y(S.eqHist[last]), 5, 0, Math.PI * 2); ctx.fill();
  }

  function renderAll() { renderStats(); renderSignal(); renderChart(); renderPause(); }

  // ---------- Input ----------
  document.querySelectorAll('.pos-btn').forEach((b) => b.addEventListener('click', () => setPos(b.dataset.pos)));
  $('gStartBtn').onclick = start;
  $('gAgain').onclick = () => { newGame(); start(); };
  $('gPause').onclick = () => pause();

  document.addEventListener('keydown', (e) => {
    if (!S || !S.running || (document.getElementById('panelCarry') || {}).hidden || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const map = { '1': 'short', s: 'short', '2': 'cash', c: 'cash', '3': 'long', l: 'long' };
    const k = e.key.toLowerCase();
    if (map[k]) { setPos(map[k]); e.preventDefault(); }
    if (e.key === ' ') { pause(); e.preventDefault(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
  window.addEventListener('resize', () => S && renderAll());
  window.addEventListener('arcade:switch', (e) => { if (!S) return; if (e.detail === 'carry') renderAll(); else if (S.running && !S.paused) pause(true); });
  window.addEventListener('langchange', () => S && renderAll());
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => S && renderAll());

  newGame();
})();
