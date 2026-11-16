// Funzioni condivise da giochi e grafici (prima stavano in curve.js, tolto con la sezione della curva).
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
