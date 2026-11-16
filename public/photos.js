// Foto nella sezione delle domande: scorrono con le frecce, i pallini, il dito o i tasti freccia.
// Avanzano da sole ogni 6 secondi finché qualcuno non le tocca; con "riduci movimento" restano ferme.
(function () {
  const track = document.getElementById('phTrack');
  if (!track) return;
  const slides = [...track.children];
  const dots = document.getElementById('phDots');
  let i = 0, timer = 0;
  slides.forEach((_, k) => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'ph-dot'; b.setAttribute('aria-label', `${k + 1} / ${slides.length}`);
    b.onclick = () => { stop(); go(k); };
    dots.appendChild(b);
  });
  function mark() { [...dots.children].forEach((d, k) => d.setAttribute('aria-current', String(k === i))); }
  function go(k, smooth = true) {
    i = (k + slides.length) % slides.length;
    track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: smooth ? 'smooth' : 'auto' });
    mark();
  }
  let raf = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { const k = Math.round(track.scrollLeft / track.clientWidth); if (k !== i) { i = k; mark(); } });
  }, { passive: true });
  document.getElementById('phPrev').onclick = () => { stop(); go(i - 1); };
  document.getElementById('phNext').onclick = () => { stop(); go(i + 1); };
  track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { stop(); go(i + 1); } if (e.key === 'ArrowLeft') { stop(); go(i - 1); } });
  ['pointerdown', 'wheel', 'touchstart'].forEach((ev) => track.addEventListener(ev, stop, { passive: true }));
  function stop() { clearInterval(timer); timer = 0; }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // parte solo quando la sezione è sullo schermo
  if (!reduced && 'IntersectionObserver' in window) {
    let started = false;
    new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && !started) { started = true; timer = setInterval(() => go(i + 1), 6000); }
    }), { threshold: 0.5 }).observe(track);
  }
  mark();
})();
