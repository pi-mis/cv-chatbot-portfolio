// Nelson-Siegel: y(t) = b0 + b1 * L(t) + b2 * (L(t) - e^(-t/lam)),  L(t) = (1 - e^(-t/lam)) / (t/lam)
window.NS = {
  y(t, b0, b1, b2, lam) {
    const x = Math.max(t, 1e-6) / lam;
    const L = (1 - Math.exp(-x)) / x;
    return b0 + b1 * L + b2 * (L - Math.exp(-x));
  },
  css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  },
  // Canvas nitido su schermi retina; restituisce contesto e dimensioni in px CSS.
  setup(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w: r.width, h: r.height };
  },
  reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

(function heroCurve() {
  const canvas = document.getElementById('curve');
  if (!canvas) return;
  const tip = document.getElementById('curveTip');
  const readout = document.getElementById('curveReadout');
  const ids = ['b0', 'b1', 'b2', 'lam'];
  const inputs = Object.fromEntries(ids.map((id) => [id, document.getElementById(id)]));
  const outs = Object.fromEntries(ids.map((id) => [id, document.getElementById(id + 'v')]));
  const presets = {
    calm: { b0: 21, b1: -7, b2: 2, lam: 2.5 },
    stress: { b0: 24, b1: 14, b2: -4, lam: 1.5 },
    hump: { b0: 20, b1: -4, b2: 12, lam: 2 }
  };
  const T_MAX = 12, Y_MIN = 0, Y_MAX = 50;
  const pad = { l: 34, r: 12, t: 26, b: 30 };
  let progress = NS.reducedMotion ? 1 : 0;
  let hoverT = null;
  let anim = null; // animazione tra preset

  const p = () => Object.fromEntries(ids.map((id) => [id, parseFloat(inputs[id].value)]));

  function draw() {
    const { ctx, w, h } = NS.setup(canvas);
    const P = p();
    const X = (t) => pad.l + (t / T_MAX) * (w - pad.l - pad.r);
    const Y = (v) => pad.t + (1 - (v - Y_MIN) / (Y_MAX - Y_MIN)) * (h - pad.t - pad.b);
    const ink = NS.css('--ink'), soft = NS.css('--ink-soft'), line = NS.css('--line'), acc = NS.css('--accent');
    const t = window.SITE_TEXT[window.currentLang || 'en'].hero;

    ctx.clearRect(0, 0, w, h);
    ctx.font = '12px ' + NS.css('--f-body');
    ctx.fillStyle = soft; ctx.strokeStyle = line; ctx.lineWidth = 1;
    for (let v = 0; v <= Y_MAX; v += 10) {
      ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(v, pad.l - 8, Y(v));
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let m = 0; m <= T_MAX; m += 2) ctx.fillText(m, X(m), h - pad.b + 8);
    ctx.textAlign = 'right'; ctx.fillText(t.axisX, w - pad.r, h - 13);
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(t.axisY, 0, 0);

    // long-run level (b0)
    ctx.setLineDash([4, 4]); ctx.strokeStyle = soft;
    ctx.beginPath(); ctx.moveTo(pad.l, Y(P.b0)); ctx.lineTo(w - pad.r, Y(P.b0)); ctx.stroke();
    ctx.setLineDash([]);

    // area + curva
    const tEnd = T_MAX * progress;
    const pts = [];
    for (let tt = 0.05; tt <= tEnd + 1e-9; tt += 0.05) {
      pts.push([X(tt), Y(Math.min(Y_MAX, Math.max(Y_MIN, NS.y(tt, P.b0, P.b1, P.b2, P.lam))))]);
    }
    if (pts.length > 1) {
      ctx.beginPath(); ctx.moveTo(pts[0][0], Y(0));
      pts.forEach(([x, y]) => ctx.lineTo(x, y));
      ctx.lineTo(pts[pts.length - 1][0], Y(0)); ctx.closePath();
      ctx.globalAlpha = 0.12; ctx.fillStyle = acc; ctx.fill(); ctx.globalAlpha = 1;
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.strokeStyle = acc; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke();
    }

    if (hoverT !== null && progress >= 1) {
      const v = NS.y(hoverT, P.b0, P.b1, P.b2, P.lam);
      const x = X(hoverT), y = Y(Math.min(Y_MAX, Math.max(Y_MIN, v)));
      ctx.strokeStyle = ink; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke();
      ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
      tip.textContent = `${hoverT.toFixed(1)} m: ${v.toFixed(1)}%`;
      tip.style.opacity = 1;
    } else tip.style.opacity = 0;
  }

  function updateText() {
    const P = p();
    outs.b0.textContent = P.b0.toFixed(1);
    outs.b1.textContent = (P.b1 > 0 ? '+' : '') + P.b1.toFixed(1);
    outs.b2.textContent = (P.b2 > 0 ? '+' : '') + P.b2.toFixed(1);
    outs.lam.textContent = P.lam.toFixed(1) + ' m';
    const short = NS.y(0.5, P.b0, P.b1, P.b2, P.lam), long = NS.y(6, P.b0, P.b1, P.b2, P.lam);
    const t = window.SITE_TEXT[window.currentLang || 'en'].hero;
    readout.textContent = short < long - 1 ? t.contango : short > long + 1 ? t.backwardation : t.flat;
  }

  function refresh() { updateText(); draw(); }

  function animateTo(target) {
    cancelAnimationFrame(anim);
    const from = p();
    if (NS.reducedMotion) { ids.forEach((id) => (inputs[id].value = target[id])); return refresh(); }
    const t0 = performance.now(), D = 450;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
      ids.forEach((id) => (inputs[id].value = from[id] + (target[id] - from[id]) * e));
      refresh();
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }

  ids.forEach((id) => inputs[id].addEventListener('input', refresh));
  document.querySelectorAll('[data-preset]').forEach((b) =>
    b.addEventListener('click', () => animateTo(presets[b.dataset.preset]))
  );

  function pointer(e) {
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const t = ((x - pad.l) / (r.width - pad.l - pad.r)) * T_MAX;
    hoverT = t >= 0.05 && t <= T_MAX ? t : null;
    draw();
  }
  canvas.addEventListener('pointermove', pointer);
  canvas.addEventListener('pointerdown', pointer);
  canvas.addEventListener('pointerleave', () => { hoverT = null; draw(); });

  window.addEventListener('resize', draw);
  window.addEventListener('langchange', refresh);
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);

  // Unico momento animato al caricamento: la curva si disegna da sinistra a destra.
  function intro() {
    refresh();
    if (progress >= 1) return;
    const t0 = performance.now();
    const step = (now) => {
      progress = Math.min(1, (now - t0) / 1300);
      progress = 1 - Math.pow(1 - progress, 3);
      draw();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  requestAnimationFrame(intro);
  if (document.fonts) document.fonts.ready.then(draw);
})();
