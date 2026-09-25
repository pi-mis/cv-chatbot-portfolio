// Parti interattive trasversali: schede della sala giochi, nastro dei ticker, palette comandi (Ctrl/⌘ K), pulsante flottante.
(function () {
  const $ = (id) => document.getElementById(id);
  const T = () => window.SITE_TEXT[window.currentLang];
  const reduced = NS.reducedMotion;

  // ---------- Schede della sala giochi ----------
  const tabs = { tape: [$('tabTape'), $('panelTape')], carry: [$('tabCarry'), $('panelCarry')] };
  function showTab(name, focus) {
    Object.entries(tabs).forEach(([k, [tab, panel]]) => {
      const on = k === name;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      panel.hidden = !on;
    });
    if (focus) tabs[name][0].focus();
    window.dispatchEvent(new CustomEvent('arcade:switch', { detail: name }));
  }
  tabs.tape[0].onclick = () => showTab('tape');
  tabs.carry[0].onclick = () => showTab('carry');
  document.querySelector('.arcade-tabs').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      showTab(tabs.tape[1].hidden ? 'tape' : 'carry', true);
      e.preventDefault();
    }
  });
  function goGame(name, autostart) {
    showTab(name);
    $('game').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    if (autostart) setTimeout(() => (name === 'tape' ? $('tStartBtn') : $('gStartBtn')).click(), reduced ? 0 : 500);
  }

  // ---------- Nastro dei ticker ----------
  const track = $('tickerTrack');
  function renderTicker() {
    const items = T().ticker.items;
    track.innerHTML = '';
    // due copie per lo scorrimento continuo; la seconda è nascosta agli screen reader
    [0, 1].forEach((copy) => {
      const group = document.createElement('div');
      group.className = 'ticker-group';
      if (copy) group.setAttribute('aria-hidden', 'true');
      items.forEach((it) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'tick ' + it.d;
        if (copy) b.tabIndex = -1;
        b.innerHTML = '<span class="sym"></span><span class="val"></span><span class="arr" aria-hidden="true"></span>';
        b.querySelector('.sym').textContent = it.s;
        b.querySelector('.val').textContent = it.v;
        b.querySelector('.arr').textContent = it.d === 'up' ? '▲' : '▼';
        b.title = it.q;
        b.onclick = () => window.askTwin(it.q);
        group.appendChild(b);
      });
      track.appendChild(group);
    });
  }
  // pausa quando un elemento riceve il focus da tastiera
  track.addEventListener('focusin', () => track.classList.add('hold'));
  track.addEventListener('focusout', () => track.classList.remove('hold'));

  // ---------- Palette comandi ----------
  const kbar = $('kbar'), input = $('kbarInput'), list = $('kbarList');
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $('kbarKey').textContent = isMac ? '⌘K' : 'Ctrl K';
  let entries = [], active = 0, lastFocus = null;

  function buildEntries() {
    const t = T(), p = t.palette;
    const out = [];
    document.querySelectorAll('.nav a').forEach((a) => {
      out.push({ group: p.go, label: a.textContent, run: () => document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }) });
    });
    out.push({ group: p.act, label: p.actions.tape, run: () => goGame('tape', true) });
    out.push({ group: p.act, label: p.actions.carry, run: () => goGame('carry', true) });
    out.push({ group: p.act, label: p.actions.email, run: () => $('copyEmail').click() });
    out.push({ group: p.act, label: p.actions.cv, run: () => window.open('https://www.linkedin.com/in/pietro-mischi', '_blank', 'noopener') });
    ['it', 'en', 'sv'].filter((l) => l !== window.currentLang).forEach((l) =>
      out.push({ group: p.act, label: p.actions[l], run: () => document.querySelector(`[data-lang="${l}"]`).click() })
    );
    const qs = new Set(t.chat.suggestions);
    Object.values(t.projects.items).forEach((it) => it.q && qs.add(it.q));
    t.ticker.items.forEach((it) => qs.add(it.q));
    qs.forEach((q) => out.push({ group: p.ask, label: q, run: () => window.askTwin(q) }));
    return out;
  }

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function score(label, q) {
    const l = norm(label);
    if (l.includes(q)) return 100 - l.indexOf(q);
    const words = q.split(/\s+/).filter(Boolean);
    const hits = words.filter((w) => l.includes(w)).length;
    return hits === words.length ? 40 + hits : hits ? hits : 0;
  }

  function renderList() {
    const p = T().palette;
    const raw = input.value.trim();
    const q = norm(raw);
    let shown = buildEntries();
    if (q) {
      shown = shown.map((e) => ({ ...e, s: score(e.label, q) })).filter((e) => e.s > 0).sort((a, b) => b.s - a.s).slice(0, 9);
      shown.push({ group: p.ask, label: `${p.askFree} “${raw}”`, run: () => window.askTwin(raw), free: true });
    }
    entries = shown;
    active = Math.min(active, entries.length - 1);
    list.innerHTML = '';
    if (!entries.length) {
      const li = document.createElement('li'); li.className = 'kbar-empty'; li.textContent = p.empty; list.appendChild(li); return;
    }
    let lastGroup = '';
    entries.forEach((e, i) => {
      if (e.group !== lastGroup && !q) {
        const h = document.createElement('li'); h.className = 'kbar-group'; h.textContent = e.group; h.setAttribute('role', 'presentation'); list.appendChild(h);
        lastGroup = e.group;
      }
      const li = document.createElement('li');
      li.id = 'kbar-opt-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(i === active));
      li.className = 'kbar-item' + (e.free ? ' free' : '');
      li.textContent = e.label;
      li.onmousemove = () => { if (active !== i) { active = i; mark(); } };
      li.onclick = () => choose(i);
      list.appendChild(li);
    });
    mark();
  }
  function mark() {
    list.querySelectorAll('[role=option]').forEach((li) => li.setAttribute('aria-selected', String(li.id === 'kbar-opt-' + active)));
    const el = $('kbar-opt-' + active);
    if (el) { el.scrollIntoView({ block: 'nearest' }); input.setAttribute('aria-activedescendant', el.id); }
  }
  function choose(i) {
    const e = entries[i];
    if (!e) return;
    close();
    e.run();
  }
  function open(prefill) {
    lastFocus = document.activeElement;
    kbar.hidden = false;
    document.body.classList.add('kbar-open');
    input.value = prefill || '';
    input.placeholder = T().palette.placeholder;
    input.setAttribute('aria-label', T().palette.placeholder);
    active = 0;
    renderList();
    input.focus();
    window.dispatchEvent(new CustomEvent('arcade:switch', { detail: 'none' }));
  }
  function close() {
    kbar.hidden = true;
    document.body.classList.remove('kbar-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  input.addEventListener('input', () => { active = 0; renderList(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { active = (active + 1) % entries.length; mark(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { active = (active - 1 + entries.length) % entries.length; mark(); e.preventDefault(); }
    else if (e.key === 'Enter') { e.preventDefault(); if (entries.length) choose(active); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') e.preventDefault(); // il focus resta nella finestra
  });
  kbar.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) close(); });
  $('kbarBtn').onclick = () => open();
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); kbar.hidden ? open() : close(); }
  });

  // ---------- Pulsante flottante: visibile quando la chat è fuori schermo ----------
  const fab = $('fab');
  fab.onclick = () => open();
  const chatSection = $('twin');
  new IntersectionObserver(([en]) => {
    const heroVisible = window.scrollY < window.innerHeight * 0.6;
    fab.hidden = en.isIntersecting || heroVisible;
  }, { threshold: 0.15 }).observe(chatSection);
  window.addEventListener('scroll', () => {
    const r = chatSection.getBoundingClientRect();
    const chatVisible = r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15;
    fab.hidden = chatVisible || window.scrollY < window.innerHeight * 0.6;
  }, { passive: true });

  // ---------- Lingua ----------
  window.addEventListener('langchange', () => { renderTicker(); if (!kbar.hidden) renderList(); });
  renderTicker();
  showTab('tape');
})();
