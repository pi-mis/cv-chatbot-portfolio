// Journey: il percorso di Pietro come il grafico di un titolo.
// La linea è un "indice di carriera" che sale a ogni tappa; passando sopra il grafico, un punto o una data
// il mirino si aggancia alla tappa più vicina e sotto compare il dettaglio (dati presi dal CV).
(function () {
  const $ = (id) => document.getElementById(id);
  const svg = $('jrSvg');
  if (!svg) return;
  const NSV = 'http://www.w3.org/2000/svg';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TT = () => window.SITE_TEXT[window.currentLang].journey;
  const LOCALES = { it: 'it-IT', en: 'en-GB', sv: 'sv-SE' };

  // tappe: data (anno decimale), serie, peso sull'indice, durata (per l'istogramma dell'attività)
  const M = [
    { k: 'hs', t: 2016.7, c: 'edu', w: 8, to: 2021.5 },
    { k: 'unicredit', t: 2019.4, c: 'cert', w: 3 },
    { k: 'lifeguard', t: 2020.5, c: 'cert', w: 3 },
    { k: 'bsc', t: 2021.7, c: 'edu', w: 14, to: 2025.3 },
    { k: 'bloomberg', t: 2022.5, c: 'cert', w: 4 },
    { k: 'ielts', t: 2024.25, c: 'cert', w: 5 },
    { k: 'bdo', t: 2024.68, c: 'work', w: 16, to: 2025.62 },
    { k: 'tether', t: 2025.2, c: 'work', w: 12 },
    { k: 'legambiente', t: 2025.52, c: 'life', w: 3 },
    { k: 'msc', t: 2025.68, c: 'edu', w: 16, to: 2027.45 },
    { k: 'tandem', t: 2026.1, c: 'life', w: 5, to: 2027.45 },
    { k: 'vol', t: 2026.22, c: 'proj', w: 8 },
    { k: 'marathon', t: 2026.4, c: 'life', w: 4 },
    { k: 'kth', t: 2026.62, c: 'edu', w: 8, to: 2027.45 },
    { k: 'builds', t: 2026.7, c: 'proj', w: 9 },
    { k: 'essay', t: 2026.76, c: 'proj', w: 5, link: '#research' },
    { k: 'next', t: 2027.45, c: 'edu', w: 12, future: true }
  ];
  const CATS = ['edu', 'work', 'proj', 'cert', 'life'];
  const T0 = 2016, T1 = 2027.8;
  const now = (() => { const d = new Date(); return d.getFullYear() + (d.getMonth() + d.getDate() / 31) / 12; })();
  const hidden = new Set();
  let idx = M.findIndex((m) => m.k === 'essay'); // si apre sull'ultima tappa già avvenuta
  if (idx < 0) idx = 0;
  let drawn = false, W = 0, H = 0;

  // indice di carriera: somma di gradini morbidi più un po' di "rumore di mercato" deterministico
  const sig = (x) => 1 / (1 + Math.exp(-x));
  function value(t) {
    let v = 100;
    M.forEach((m) => { v += m.w * sig((t - m.t) / 0.09); });
    return v + 1.3 * Math.sin(t * 7.3) + 0.9 * Math.sin(t * 13.1 + 1) + 0.6 * Math.sin(t * 23.7 + 2);
  }
  function activity(t) {
    let n = 0;
    M.forEach((m) => { if (m.to ? t >= m.t && t <= m.to : Math.abs(t - m.t) < 0.13) n++; });
    return n;
  }

  const el = (name, attrs, parent) => {
    const e = document.createElementNS(NSV, name);
    Object.entries(attrs || {}).forEach(([k, v]) => e.setAttribute(k, v));
    if (parent) parent.appendChild(e);
    return e;
  };

  let X, Y, PAD;
  function draw() {
    const box = $('jrChart').getBoundingClientRect();
    W = box.width; H = window.matchMedia('(max-width: 620px)').matches ? 250 : 320;
    if (!W) return;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('height', H);
    svg.innerHTML = '';
    PAD = { l: 8, r: 54, t: 22, b: 30 };
    const vMin = 92, vMax = Math.ceil((value(T1) + 14) / 20) * 20;
    X = (t) => PAD.l + (t - T0) / (T1 - T0) * (W - PAD.l - PAD.r);
    Y = (v) => PAD.t + (1 - (v - vMin) / (vMax - vMin)) * (H - PAD.t - PAD.b);
    const tt = TT();

    // fasce delle due città, come i "regimi" di un grafico
    const split = 2025.62;
    const g0 = el('g', { class: 'jr-bands' }, svg);
    el('rect', { x: X(T0), y: PAD.t - 14, width: X(split) - X(T0), height: H - PAD.t - PAD.b + 14, class: 'band a' }, g0);
    el('rect', { x: X(split), y: PAD.t - 14, width: X(T1) - X(split), height: H - PAD.t - PAD.b + 14, class: 'band b' }, g0);
    const [c1, c2] = tt.exchange.split('→').map((s) => s.trim());
    el('text', { x: X(T0) + 8, y: PAD.t - 2, class: 'band-lab' }, g0).textContent = c1;
    el('text', { x: X(T1) - 8, y: PAD.t - 2, class: 'band-lab', 'text-anchor': 'end' }, g0).textContent = c2;

    // griglia e asse dei valori a destra, come in un terminale
    const gGrid = el('g', { class: 'jr-grid' }, svg);
    for (let v = 100; v <= vMax; v += 40) {
      el('line', { x1: PAD.l, x2: W - PAD.r, y1: Y(v), y2: Y(v) }, gGrid);
      el('text', { x: W - PAD.r + 8, y: Y(v) + 4, class: 'ax' }, gGrid).textContent = v;
    }
    // anni sull'asse orizzontale (passandoci sopra si apre la prima tappa di quell'anno)
    for (let y = T0; y <= 2027; y++) {
      if (W < 560 && y % 2) continue;
      el('line', { x1: X(y), x2: X(y), y1: H - PAD.b, y2: H - PAD.b + 4, class: 'tick' }, gGrid);
      const tx = el('text', { x: X(y + 0.5), y: H - 10, class: 'ax yr', 'data-year': y, 'text-anchor': 'middle' }, gGrid);
      tx.textContent = y;
    }

    // istogramma dell'attività (quante cose in parallelo): il "volume"
    const gVol = el('g', { class: 'jr-vol' }, svg);
    const bw = Math.max(2, (X(T0 + 0.25) - X(T0)) - 1.5);
    for (let t = T0; t < T1; t += 0.25) {
      const n = activity(t + 0.125);
      if (!n) continue;
      const h = n * 7;
      el('rect', { x: X(t) + 0.75, y: H - PAD.b - h, width: bw, height: h, class: t + 0.125 > now ? 'fut' : '' }, gVol);
    }

    // linea dell'indice: passato pieno, futuro tratteggiato
    const step = 1 / 24;
    const past = [], fut = [];
    for (let t = T0; t <= T1 + 1e-6; t += step) {
      const p = [X(t), Y(value(t))];
      if (t <= now) past.push(p); else { if (!fut.length && past.length) fut.push(past[past.length - 1]); fut.push(p); }
    }
    const d = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    el('path', { d: d(past) + ` L${past[past.length - 1][0].toFixed(1)} ${H - PAD.b} L${past[0][0]} ${H - PAD.b} Z`, class: 'jr-area' }, svg);
    const line = el('path', { d: d(past), class: 'jr-line' }, svg);
    if (fut.length > 1) el('path', { d: d(fut), class: 'jr-proj' }, svg);

    // obiettivo: la laurea, come un target price
    const nx = M.find((m) => m.k === 'next');
    if (nx.t > now) {
      const ty = Y(value(nx.t));
      const g = el('g', { class: 'jr-target' }, svg);
      el('line', { x1: X(nx.t), x2: W - PAD.r, y1: ty, y2: ty }, g);
      const lab = `${tt.target}: ${tt.targetLabel}`;
      const r = el('rect', { x: W - PAD.r - 6 - lab.length * 6.4, y: ty - 21, height: 17, rx: 8.5, width: lab.length * 6.4 + 6 }, g);
      el('text', { x: W - PAD.r - 3 - lab.length * 6.4, y: ty - 9 }, g).textContent = lab;
      r.setAttribute('x', W - PAD.r - 8 - lab.length * 6.4);
    }

    // mirino
    const ch = el('g', { class: 'jr-cross', id: 'jrCross' }, svg);
    el('line', { id: 'jrCx', y1: PAD.t - 14, y2: H - PAD.b }, ch);
    el('line', { id: 'jrCy', x1: PAD.l, x2: W - PAD.r }, ch);
    const pr = el('g', { id: 'jrCp' }, ch);
    el('rect', { x: W - PAD.r + 2, y: -9, width: PAD.r - 4, height: 18, rx: 3 }, pr);
    el('text', { x: W - PAD.r + 7, y: 4 }, pr);

    // punti delle tappe
    const gm = el('g', { class: 'jr-marks' }, svg);
    M.forEach((m, i) => {
      if (hidden.has(m.c)) return;
      const cx = X(m.t), cy = Y(value(m.t));
      const g = el('g', { class: `mk c-${m.c}${m.future ? ' fut' : ''}`, 'data-i': i, style: `--d:${(i * 0.06).toFixed(2)}s` }, gm);
      el('circle', { cx, cy, r: 13, class: 'halo' }, g);
      el('circle', { cx, cy, r: 5.5, class: 'dot' }, g);
    });

    // animazione: la linea si disegna la prima volta che la sezione entra nello schermo
    if (!drawn && !reduced) {
      const len = line.getTotalLength();
      line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
      svg.classList.add('pre');
    }
    focusOn(idx, false);
  }

  function nearest(px) {
    let best = -1, bd = Infinity;
    M.forEach((m, i) => {
      if (hidden.has(m.c)) return;
      const dd = Math.abs(X(m.t) - px);
      if (dd < bd) { bd = dd; best = i; }
    });
    return best;
  }

  function focusOn(i, fromUser) {
    if (i < 0 || hidden.has(M[i].c)) { i = M.findIndex((m) => !hidden.has(m.c)); if (i < 0) return; }
    idx = i;
    const m = M[i], cx = X(m.t), v = value(m.t), cy = Y(v);
    const set = (id, a) => { const e = document.getElementById(id); if (e) Object.entries(a).forEach(([k, val]) => e.setAttribute(k, val)); };
    set('jrCx', { x1: cx, x2: cx });
    set('jrCy', { y1: cy, y2: cy });
    const cp = document.getElementById('jrCp');
    if (cp) { cp.setAttribute('transform', `translate(0 ${cy.toFixed(1)})`); cp.querySelector('text').textContent = v.toFixed(1); }
    svg.querySelectorAll('.mk').forEach((g) => g.classList.toggle('on', +g.dataset.i === i));
    // etichetta vicino al punto
    const tip = $('jrTip'), it = TT().items[m.k];
    tip.innerHTML = '<small></small><strong></strong>';
    tip.querySelector('small').textContent = it.date;
    tip.querySelector('strong').textContent = it.title;
    tip.className = `jr-tip c-${m.c}`;
    const left = Math.min(Math.max(cx, 90), W - 150);
    tip.style.transform = `translate(${left.toFixed(0)}px, ${Math.max(cy - 64, 4).toFixed(0)}px) translateX(-50%)`;
    renderDetail();
    renderDates(fromUser);
  }

  function renderDetail() {
    const tt = TT(), m = M[idx], it = tt.items[m.k], box = $('jrDetail');
    box.className = `jr-detail c-${m.c}`;
    box.innerHTML = `
      <div class="jd-meta"><span class="jd-cat"></span><span class="jd-date"></span></div>
      <div class="jd-main"><h3></h3><p class="jd-org"></p><ul></ul></div>
      <div class="jd-act">
        <button type="button" class="btn ghost small jd-prev"><span aria-hidden="true">‹</span></button>
        <button type="button" class="btn ghost small jd-next"><span aria-hidden="true">›</span></button>
        <button type="button" class="btn small jd-ask"></button>
      </div>`;
    box.querySelector('.jd-cat').textContent = tt.cats[m.c];
    box.querySelector('.jd-date').textContent = it.date;
    box.querySelector('h3').textContent = it.title;
    box.querySelector('.jd-org').textContent = it.org;
    const ul = box.querySelector('ul');
    it.bullets.forEach((b) => { const li = document.createElement('li'); li.textContent = b; ul.appendChild(li); });
    const vis = M.map((x, i) => i).filter((i) => !hidden.has(M[i].c));
    const pos = vis.indexOf(idx);
    const prev = box.querySelector('.jd-prev'), next = box.querySelector('.jd-next');
    prev.setAttribute('aria-label', tt.prev); next.setAttribute('aria-label', tt.next);
    prev.disabled = pos <= 0; next.disabled = pos >= vis.length - 1;
    prev.onclick = () => focusOn(vis[pos - 1], true);
    next.onclick = () => focusOn(vis[pos + 1], true);
    const ask = box.querySelector('.jd-ask');
    ask.textContent = tt.ask;
    ask.onclick = () => window.askTwin(it.q);
    if (m.link) {
      const a = document.createElement('a'); a.className = 'btn ghost small'; a.href = m.link; a.textContent = tt.more;
      box.querySelector('.jd-act').appendChild(a);
    }
  }

  // nastro delle date: passarci sopra mostra la tappa
  function renderDates(fromUser) {
    const box = $('jrDates'), tt = TT();
    if (!box.children.length || box.dataset.lang !== window.currentLang || box.dataset.hid !== [...hidden].join()) {
      box.innerHTML = '';
      box.dataset.lang = window.currentLang; box.dataset.hid = [...hidden].join();
      M.forEach((m, i) => {
        if (hidden.has(m.c)) return;
        const b = document.createElement('button');
        b.type = 'button'; b.className = `jr-date c-${m.c}`; b.dataset.i = i;
        b.setAttribute('role', 'tab');
        b.innerHTML = '<span class="dt"></span><span class="nm"></span>';
        b.querySelector('.dt').textContent = tt.items[m.k].date;
        b.querySelector('.nm').textContent = tt.items[m.k].title;
        b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') focusOn(i, false); });
        b.addEventListener('focus', () => focusOn(i, false));
        b.addEventListener('click', () => focusOn(i, true));
        box.appendChild(b);
      });
    }
    [...box.children].forEach((b) => {
      const on = +b.dataset.i === idx;
      b.setAttribute('aria-selected', String(on));
      b.tabIndex = on ? 0 : -1;
      const outside = b.offsetLeft < box.scrollLeft || b.offsetLeft + b.offsetWidth > box.scrollLeft + box.clientWidth;
      if (on && !overStrip && (fromUser || outside)) {
        const l = b.offsetLeft - box.clientWidth / 2 + b.offsetWidth / 2;
        box.scrollTo({ left: l, behavior: reduced ? 'auto' : 'smooth' });
      }
    });
  }
  let overStrip = false;
  $('jrDates').addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') overStrip = true; });
  $('jrDates').addEventListener('pointerleave', () => { overStrip = false; });
  $('jrDates').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const vis = M.map((x, i) => i).filter((i) => !hidden.has(M[i].c));
    const pos = vis.indexOf(idx) + (e.key === 'ArrowRight' ? 1 : -1);
    if (pos < 0 || pos >= vis.length) return;
    focusOn(vis[pos], true);
    const b = $('jrDates').querySelector(`[data-i="${vis[pos]}"]`); if (b) b.focus();
  });

  // passare sopra il grafico (o sugli anni) aggancia il mirino alla tappa più vicina
  const chart = $('jrChart');
  function fromPointer(e) {
    const r = svg.getBoundingClientRect();
    const px = (e.clientX - r.left) * (W / r.width);
    const yr = e.target.closest && e.target.closest('.yr');
    if (yr) {
      const y = +yr.dataset.year;
      const i = M.findIndex((m) => !hidden.has(m.c) && Math.floor(m.t) === y);
      if (i >= 0) return focusOn(i, e.type === 'pointerdown');
    }
    const i = nearest(px);
    if (i !== idx) focusOn(i, e.type === 'pointerdown');
  }
  chart.addEventListener('pointermove', fromPointer);
  chart.addEventListener('pointerdown', fromPointer);

  // legenda: le serie si accendono e si spengono come in un grafico finanziario
  function renderLegend() {
    const box = $('jrLegend'), tt = TT();
    box.innerHTML = '';
    box.setAttribute('aria-label', tt.legendHint);
    CATS.forEach((c) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = `jr-lg c-${c}`;
      b.setAttribute('aria-pressed', String(!hidden.has(c)));
      b.innerHTML = '<span class="sw"></span><span></span>';
      b.lastChild.textContent = tt.cats[c];
      b.title = tt.legendHint;
      b.onclick = () => {
        if (hidden.has(c)) hidden.delete(c);
        else if (hidden.size < CATS.length - 1) hidden.add(c);
        renderLegend(); draw();
      };
      box.appendChild(b);
    });
  }

  function renderQuote() {
    const tt = TT(), nf = new Intl.NumberFormat(LOCALES[window.currentLang], { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const t = Math.min(now, T1);
    const y0 = Math.floor(t);
    const v = value(t), ytd = (v / value(y0) - 1) * 100;
    $('jrPx').textContent = nf.format(v);
    const ch = $('jrChg');
    ch.textContent = `${ytd >= 0 ? '▲ +' : '▼ '}${nf.format(ytd)}% ${tt.ytd}`;
    ch.className = ytd >= 0 ? 'up' : 'down';
    const dl = $('jrStats');
    dl.innerHTML = '';
    tt.stats.forEach((s) => {
      const d = document.createElement('div');
      d.innerHTML = '<dt></dt><dd></dd>';
      d.firstChild.textContent = s.k; d.lastChild.textContent = s.v;
      dl.appendChild(d);
    });
  }

  function all() { renderQuote(); renderLegend(); $('jrDates').innerHTML = ''; draw(); }

  new IntersectionObserver(([en]) => {
    if (!en.isIntersecting || drawn) return;
    drawn = true;
    const line = svg.querySelector('.jr-line');
    if (line && !reduced) {
      line.getBoundingClientRect();
      line.style.transition = 'stroke-dashoffset 1.8s cubic-bezier(.4,.1,.2,1)';
      line.style.strokeDashoffset = '0';
      svg.classList.remove('pre');
      svg.classList.add('play');
    }
  }, { threshold: 0.35 }).observe(chart);

  let rt = null;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { const keep = drawn; draw(); if (keep) { const l = svg.querySelector('.jr-line'); if (l) { l.style.strokeDasharray = ''; l.style.strokeDashoffset = ''; } svg.classList.remove('pre'); } }, 120); });
  window.addEventListener('langchange', () => { all(); if (drawn) { const l = svg.querySelector('.jr-line'); if (l) { l.style.strokeDasharray = ''; l.style.strokeDashoffset = ''; } svg.classList.remove('pre'); } });
  all();
})();
