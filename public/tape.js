// Beat the Tape: 60 secondi, un titolo, un flusso di notizie.
// Il prezzo segue un random walk; ogni notizia (dopo un breve ritardo) aggiunge un drift nella sua direzione.
// I rumor hanno un effetto casuale: a volte veri, a volte al contrario.
(function () {
  const $ = (id) => document.getElementById(id);
  if (!$('tapeChart')) return;

  const DURATION = 60, TICK_MS = 100, TICKS_PER_CANDLE = 10;
  const TOTAL_TICKS = (DURATION * 1000) / TICK_MS;
  const START = 100000, SHARES = 1000, SPREAD = 0.04, MARGIN = 0.8;
  const SIGMA = 0.0022;          // volatilità per tick
  const DELAY = 7, IMPACT = 24;  // tick tra titolo e movimento, durata del movimento
  const BEST_KEY = 'beat-the-tape-best';

  const T = () => window.SITE_TEXT[window.currentLang].tape;
  const LOCALES = { it: 'it-IT', en: 'en-GB', sv: 'sv-SE' };
  const fmt = (x, d = 0) => new Intl.NumberFormat(LOCALES[window.currentLang] || 'en-GB', { maximumFractionDigits: d, minimumFractionDigits: d }).format(x);
  const money = (x) => (x > 0 ? '+' : x < 0 ? '−' : '') + fmt(Math.abs(x)) + ' kr';
  const randn = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  let S = null, timer = null;

  function schedule() {
    const events = [];
    let t = 25 + Math.floor(Math.random() * 10);
    let lastKind = '';
    while (t < TOTAL_TICKS - DELAY - IMPACT) {
      let kind = Math.random() < 0.22 ? 'rumour' : Math.random() < 0.5 ? 'up' : 'down';
      if (kind === 'rumour' && lastKind === 'rumour') kind = Math.random() < 0.5 ? 'up' : 'down';
      const idx = Math.floor(Math.random() * 100);
      let dir, mag;
      if (kind === 'rumour') {
        const r = Math.random();
        dir = Math.random() < 0.5 ? 1 : -1;
        mag = r < 0.35 ? 0.035 : r < 0.7 ? 0.01 : -0.03; // vero, nulla, oppure al contrario
      } else {
        dir = kind === 'up' ? 1 : -1;
        mag = 0.03 + Math.random() * 0.025;
      }
      events.push({ t, kind, idx, dir, mag, scored: false });
      lastKind = kind;
      t += 50 + Math.floor(Math.random() * 30);
    }
    return events;
  }

  function newGame() {
    S = {
      tick: 0, price: 100, pos: 0, eq: START, peak: START, maxDD: 0, trades: 0,
      candles: [{ o: 100, h: 100, l: 100, c: 100 }],
      events: schedule(), shown: [], news: null,
      reads: 0, readable: 0, streak: 0,
      running: false, paused: false, over: false, reason: ''
    };
    renderStats();
    setNews(null);
    draw();
  }

  // ---------- Motore ----------
  function step() {
    const s = S;
    s.tick++;

    // notizie che escono adesso
    s.events.forEach((e) => {
      if (e.t === s.tick) {
        s.news = e;
        s.shown.push({ candle: s.candles.length - 1, kind: e.kind });
        setNews(e);
      }
    });

    // drift delle notizie in corso
    let mu = 0;
    s.events.forEach((e) => {
      const k = s.tick - e.t - DELAY;
      if (k >= 0 && k < IMPACT) mu += (e.dir * e.mag) / IMPACT;
    });

    const prev = s.price;
    s.price = Math.max(1, prev * Math.exp(mu + SIGMA * randn()));
    s.eq += s.pos * SHARES * (s.price - prev);

    const c = s.candles[s.candles.length - 1];
    c.c = s.price; c.h = Math.max(c.h, s.price); c.l = Math.min(c.l, s.price);
    if (s.tick % TICKS_PER_CANDLE === 0 && s.tick < TOTAL_TICKS) s.candles.push({ o: s.price, h: s.price, l: s.price, c: s.price });

    // valutazione della lettura, a metà del movimento
    s.events.forEach((e) => {
      if (e.kind === 'rumour' || e.scored) return;
      if (s.tick - e.t - DELAY === Math.floor(IMPACT / 2)) {
        e.scored = true; s.readable++;
        if (s.pos === e.dir) { s.reads++; s.streak++; toast(s.streak > 1 ? `${T().goodRead}: ${s.streak} ${T().streak}` : T().goodRead, true); }
        else if (s.pos === -e.dir) { s.streak = 0; toast(T().wrongWay, false); }
        else s.streak = 0;
      }
    });

    s.peak = Math.max(s.peak, s.eq);
    s.maxDD = Math.max(s.maxDD, 1 - s.eq / s.peak);

    if (s.eq < START * MARGIN) { s.reason = 'margin'; return end(); }
    if (s.tick >= TOTAL_TICKS) return end();

    renderStats();
    draw();
  }

  function trade(target) {
    if (!S || !S.running || S.paused || target === S.pos) return;
    const units = Math.abs(target - S.pos);
    S.eq -= units * SHARES * SPREAD;
    S.pos = target;
    S.trades++;
    popPrice();
    renderStats();
    draw();
    if (navigator.vibrate) navigator.vibrate(12);
  }

  function start() {
    newGame();
    S.running = true;
    $('tStart').hidden = true; $('tEnd').hidden = true;
    $('tPause').disabled = false;
    timer = setInterval(step, TICK_MS);
    renderStats();
    $('tapeBox').focus({ preventScroll: true });
  }

  function pause(force) {
    if (!S || !S.running) return;
    S.paused = force === true ? true : !S.paused;
    clearInterval(timer); timer = null;
    if (!S.paused) timer = setInterval(step, TICK_MS);
    renderStats();
    if (S.paused) setNews({ pausedLabel: true });
    else setNews(S.news);
  }

  function end() {
    clearInterval(timer); timer = null;
    S.running = false; S.over = true;
    // chiusura della posizione al suono della campanella
    if (S.pos !== 0) { S.eq -= Math.abs(S.pos) * SHARES * SPREAD; S.pos = 0; }
    const pnl = S.eq - START;
    const best = parseFloat(localStorage.getItem(BEST_KEY) || 'NaN');
    const isBest = isNaN(best) || pnl > best;
    if (isBest) localStorage.setItem(BEST_KEY, String(pnl));
    renderStats(); draw();
    showEnd(isBest);
    if (S.reason === 'margin' && navigator.vibrate) navigator.vibrate([60, 40, 60]);
  }

  function rankIndex(pnl) {
    if (S && S.trades === 0) return 0; // chi non opera porta il caffè
    const cuts = [-5000, 0, 5000, 12000, 20000];
    let i = 0;
    while (i < cuts.length && pnl >= cuts[i]) i++;
    return i;
  }

  function showEnd(isBest) {
    const t = T(), pnl = S.eq - START;
    $('tEndKicker').textContent = S.reason === 'margin' ? t.marginCall : t.endTitle;
    $('tRank').textContent = `${t.rankLabel}: ${t.ranks[rankIndex(pnl)]}`;
    const p = $('teP'); p.textContent = money(pnl); p.className = pnl > 0 ? 'up' : pnl < 0 ? 'down' : '';
    $('teT').textContent = S.trades;
    $('teH').textContent = S.readable ? `${S.reads} / ${S.readable}` : '–';
    $('teD').textContent = (S.maxDD * 100).toFixed(1) + '%';
    $('tEnd').hidden = false;
    $('tAgain').focus({ preventScroll: true });
  }

  // ---------- Interfaccia ----------
  function renderStats() {
    if (!S) return;
    const t = T();
    const left = Math.max(0, (TOTAL_TICKS - S.tick) * TICK_MS / 1000);
    const timeEl = $('tTime');
    timeEl.textContent = left.toFixed(1);
    timeEl.className = left <= 10 && S.running ? 'down' : '';
    const pnl = S.eq - START;
    const p = $('tPnl'); p.textContent = money(pnl); p.className = pnl > 0 ? 'up' : pnl < 0 ? 'down' : '';
    const posEl = $('tPos');
    posEl.textContent = S.pos === 1 ? t.posLong : S.pos === -1 ? t.posShort : t.posFlat;
    posEl.className = S.pos === 1 ? 'up' : S.pos === -1 ? 'down' : '';
    $('tPrice').textContent = fmt(S.price, 2);
    const best = parseFloat(localStorage.getItem(BEST_KEY) || 'NaN');
    $('tBest').textContent = isNaN(best) ? '–' : money(best);
    document.querySelectorAll('[data-tape]').forEach((b) => {
      b.setAttribute('aria-pressed', String(Number(b.dataset.tape) === S.pos));
      b.disabled = !S.running || S.paused;
    });
    $('tPause').textContent = S.paused ? t.resume : t.pause;
    $('tPause').disabled = !S.running;
  }

  function setNews(e) {
    const t = T();
    const box = $('tNews'), tag = $('tNewsTag'), txt = $('tNewsText');
    box.classList.remove('flash');
    if (!e) { tag.textContent = ''; tag.hidden = true; txt.textContent = t.waiting; box.classList.add('idle'); return; }
    box.classList.remove('idle');
    if (e.pausedLabel) { tag.hidden = true; txt.textContent = t.paused; return; }
    const list = t.news[e.kind];
    tag.hidden = e.kind !== 'rumour';
    tag.textContent = t.rumour;
    txt.textContent = list[e.idx % list.length];
    void box.offsetWidth; // riavvia l'animazione
    if (!NS.reducedMotion) box.classList.add('flash');
  }

  let toastTimer = null;
  function toast(msg, good) {
    const el = $('tToast');
    el.textContent = msg;
    el.className = 'toast show' + (good ? ' good' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (el.className = 'toast'), 1300);
  }

  function popPrice() {
    const el = $('tPop');
    const t = T();
    el.textContent = S.pos === 1 ? `${t.buy} @ ${fmt(S.price, 2)}` : S.pos === -1 ? `${t.sell} @ ${fmt(S.price, 2)}` : `${t.close} @ ${fmt(S.price, 2)}`;
    el.className = 'tape-pop show ' + (S.pos === 1 ? 'up' : S.pos === -1 ? 'down' : '');
    clearTimeout(popPrice.t);
    popPrice.t = setTimeout(() => (el.className = 'tape-pop'), 900);
  }

  // ---------- Grafico a candele ----------
  function draw() {
    const canvas = $('tapeChart');
    if (!canvas.offsetParent) return; // pannello nascosto
    const { ctx, w, h } = NS.setup(canvas);
    const up = NS.css('--up'), down = NS.css('--down'), line = NS.css('--line'), soft = NS.css('--ink-soft'), acc = NS.css('--accent'), ink = NS.css('--ink');
    ctx.clearRect(0, 0, w, h);

    const padR = 58, padT = 10, padB = 18;
    const n = DURATION;
    const cw = (w - padR) / n;
    let lo = Infinity, hi = -Infinity;
    S.candles.forEach((c) => { lo = Math.min(lo, c.l); hi = Math.max(hi, c.h); });
    const mid = (lo + hi) / 2, span = Math.max(hi - lo, 6) * 1.15;
    lo = mid - span / 2; hi = mid + span / 2;
    const Y = (v) => padT + (1 - (v - lo) / (hi - lo)) * (h - padT - padB);

    // sfondo della posizione
    if (S.pos !== 0) {
      ctx.fillStyle = S.pos === 1 ? up : down;
      ctx.globalAlpha = 0.07; ctx.fillRect(0, 0, w - padR, h); ctx.globalAlpha = 1;
    }

    // griglia di prezzo
    ctx.font = '12px ' + NS.css('--f-body');
    ctx.textBaseline = 'middle';
    const stepV = span > 30 ? 10 : span > 12 ? 5 : 2;
    ctx.strokeStyle = line; ctx.lineWidth = 1; ctx.fillStyle = soft;
    for (let v = Math.ceil(lo / stepV) * stepV; v <= hi; v += stepV) {
      ctx.beginPath(); ctx.moveTo(0, Y(v)); ctx.lineTo(w - padR, Y(v)); ctx.stroke();
      if (Math.abs(Y(v) - Y(S.price)) > 14) ctx.fillText(fmt(v), w - padR + 8, Y(v));
    }

    // marcatori delle notizie
    S.shown.forEach((m) => {
      const x = (m.candle + 0.5) * cw;
      ctx.strokeStyle = m.kind === 'rumour' ? soft : acc;
      ctx.setLineDash([3, 4]);
      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, h - padB); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = m.kind === 'rumour' ? soft : acc;
      ctx.textAlign = 'center';
      ctx.fillText(m.kind === 'rumour' ? '?' : '!', x, h - 7);
      ctx.textAlign = 'left';
    });

    // candele
    S.candles.forEach((c, i) => {
      const x = i * cw + cw / 2;
      const col = c.c >= c.o ? up : down;
      ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, Y(c.h)); ctx.lineTo(x, Y(c.l)); ctx.stroke();
      const top = Y(Math.max(c.o, c.c)), bot = Y(Math.min(c.o, c.c));
      const bw = Math.max(2, cw * 0.62);
      ctx.fillRect(x - bw / 2, top, bw, Math.max(1.5, bot - top));
    });

    // prezzo corrente
    const py = Y(S.price);
    ctx.strokeStyle = ink; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(w - padR, py); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = ink;
    ctx.fillRect(w - padR + 2, py - 10, padR - 2, 20);
    ctx.fillStyle = NS.css('--bg');
    ctx.font = '600 12px ' + NS.css('--f-body');
    ctx.fillText(fmt(S.price, 2), w - padR + 7, py);
  }

  // ---------- Input ----------
  document.querySelectorAll('[data-tape]').forEach((b) => b.addEventListener('click', () => trade(Number(b.dataset.tape))));
  $('tStartBtn').onclick = start;
  $('tAgain').onclick = start;
  $('tPause').onclick = () => pause();
  $('tShare').onclick = async () => {
    const t = T(), pnl = S.eq - START;
    const text = t.shareText.replace('{pnl}', money(pnl)).replace('{rank}', t.ranks[rankIndex(pnl)]) + ' ' + location.origin + '/#game';
    try { await navigator.clipboard.writeText(text); toast(t.copied, true); } catch { prompt('', text); }
  };

  document.addEventListener('keydown', (e) => {
    if (!S || !S.running || $('panelTape').hidden || /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const k = e.key.toLowerCase();
    const map = { arrowup: 1, b: 1, arrowdown: -1, s: -1, arrowright: 0, c: 0 };
    if (k in map) { e.preventDefault(); trade(map[k]); }
    if (e.key === ' ') { e.preventDefault(); pause(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(true); });
  window.addEventListener('resize', () => S && draw());
  window.addEventListener('arcade:switch', (e) => { if (e.detail === 'tape') { if (S) draw(); } else pause(true); });
  window.addEventListener('langchange', () => { if (!S) return; renderStats(); if (!S.running) setNews(null); else setNews(S.paused ? { pausedLabel: true } : S.news); if (S.over) showEnd(false); });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => S && draw());

  window.TAPE = { start };
  newGame();
})();
