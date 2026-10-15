// Passaggi narrativi tra le sezioni: la pagina scorre come una giornata di borsa.
// Prima di ogni sezione compare un "lancio d'agenzia" con l'orario, che si scrive da solo quando entra nello schermo;
// le sezioni entrano con un movimento breve e una linea sotto il nastro dei ticker mostra a che ora della giornata sei.
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const T = () => window.SITE_TEXT[window.currentLang].interludes;
  const ORDER = ['twin', 'journey', 'projects', 'research', 'game', 'curve-lab', 'life', 'contact'];
  const typed = new Set();
  const nodes = {};

  ORDER.forEach((id) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    const d = document.createElement('div');
    d.className = 'interlude';
    d.dataset.for = id;
    d.innerHTML = `<div class="wrap"><a class="il-time" href="#${id}"></a><p class="il-text"><span class="il-typed"></span><span class="il-caret" aria-hidden="true"></span></p><svg class="il-spark" viewBox="0 0 120 24" aria-hidden="true"><path d=""/></svg></div>`;
    sec.parentNode.insertBefore(d, sec);
    sec.classList.add('has-interlude');
    nodes[id] = d;
  });

  // piccola linea di prezzo diversa per ogni intermezzo
  function spark(id) {
    let seed = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    let y = 16, d = 'M0 ' + y;
    for (let x = 6; x <= 120; x += 6) { y = Math.max(3, Math.min(21, y - (rnd() - 0.42) * 7)); d += ` L${x} ${y.toFixed(1)}`; }
    return d;
  }

  function fill(id, animate) {
    const d = nodes[id], it = T()[id];
    if (!d || !it) return;
    d.querySelector('.il-time').textContent = it.t;
    d.querySelector('.il-spark path').setAttribute('d', spark(id));
    const out = d.querySelector('.il-typed');
    d.querySelector('.il-text').setAttribute('aria-label', it.s);
    out.setAttribute('aria-hidden', 'true');
    if (!animate || reduced) { out.textContent = it.s; d.classList.add('done'); return; }
    out.textContent = '';
    d.classList.add('typing');
    let i = 0;
    const step = () => {
      i += Math.max(1, Math.round(it.s.length / 70));
      out.textContent = it.s.slice(0, i);
      if (i < it.s.length) setTimeout(step, 18);
      else { d.classList.remove('typing'); d.classList.add('done'); }
    };
    step();
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const id = en.target.dataset.for;
      en.target.classList.add('in');
      if (!typed.has(id)) { typed.add(id); fill(id, true); }
    });
  }, { threshold: 0.6 });
  Object.values(nodes).forEach((n) => io.observe(n));

  // ingresso delle sezioni
  if (!reduced) {
    document.documentElement.classList.add('reveal-on');
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('revealed'); io2.unobserve(en.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('main > section').forEach((s, i) => { if (i) io2.observe(s); else s.classList.add('revealed'); });
  }

  // avanzamento della "giornata" sotto il nastro dei ticker
  const ticker = document.getElementById('ticker');
  if (ticker) {
    const bar = document.createElement('div');
    bar.className = 'day-progress';
    bar.setAttribute('aria-hidden', 'true');
    ticker.appendChild(bar);
    let raf = 0;
    const upd = () => {
      raf = 0;
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${h > 0 ? Math.min(1, scrollY / h) : 0})`;
    };
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    upd();
  }

  // testi già scritti si aggiornano al cambio lingua senza ridigitarli
  window.addEventListener('langchange', () => ORDER.forEach((id) => { if (typed.has(id)) fill(id, false); else if (nodes[id]) { nodes[id].querySelector('.il-time').textContent = (T()[id] || {}).t || ''; } }));
  ORDER.forEach((id) => { if (nodes[id]) nodes[id].querySelector('.il-time').textContent = (T()[id] || {}).t || ''; });
})();
