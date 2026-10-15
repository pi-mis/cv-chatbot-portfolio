// "Things I have built": i progetti come una rete neurale in 3D (idea presa da Sinapsi).
// - Ogni nodo è un progetto con il suo logo; le sinapsi collegano i progetti che condividono un tema.
// - I repository pubblici di GitHub vengono aggiunti da soli (api/github.js, con ripiego diretto su GitHub).
// - Filtri per area, vista 3D o lista, link al sito del progetto cliccando sul nome.
(function () {
  const $ = (id) => document.getElementById(id);
  const root = $('projects');
  if (!root) return;
  const T = () => window.SITE_TEXT[window.currentLang].projects;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GH_USER = 'pi-mis';
  const GH_CACHE = 'gh-repos-v1';
  const VIEW_KEY = 'projects-view';
  // repository da non mostrare mai sul sito, anche se un giorno diventassero pubblici
  const HIDE = /telegram|ibkr|paper[-_ ]?trad/i;

  // ---------- Loghi: icone a tratto su 24x24 ----------
  const ICONS = {
    swords: '<path d="M4 4l10.5 10.5M13 17l4-4M15.5 15.5L20 20M20 4L9.5 14.5M11 17l-4-4M8.5 15.5L4 20"/>',
    curve: '<path d="M3 19c3-8 7-11 18-13"/><circle cx="6.5" cy="13" r="1.6"/><circle cx="12" cy="8.6" r="1.6"/><circle cx="18" cy="6.7" r="1.6"/>',
    chat: '<path d="M4 5h16v10.5H10l-4.5 3.8V15.5H4z"/><path d="M8.5 10.3h.01M12 10.3h.01M15.5 10.3h.01" stroke-width="3.6"/>',
    plank: '<path d="M4 14h16v5H4zM7.5 16.5h4M13.5 16.5h3"/><path d="M12 3.5v3M5.8 6.3l1.6 1.6M18.2 6.3l-1.6 1.6M8.6 11.5a3.4 3.4 0 0 1 6.8 0"/>',
    hanger: '<path d="M10 7a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6 1V11"/><path d="M12 11L3.5 17.5h17z"/>',
    bars: '<path d="M5 19v-5M10 19V9.5M15 19v-7M20 19V5.5"/><path d="M3.5 19.5h17"/>',
    bolt: '<path d="M13 2.5L5 13.5h6.2L10 21.5l8-11h-6.2z"/>',
    ladder: '<path d="M4 6.5h7M6 10.5h5M8 14.5h3M13 8.5h7M13 12.5h5M13 16.5h3"/><path d="M12 4v16"/>',
    spike: '<path d="M3 15h3.5l1.8-5 2.9 9 2.9-14 2.2 10H21"/>',
    neurons: '<circle cx="6" cy="7" r="2"/><circle cx="17.5" cy="5.5" r="2"/><circle cx="12" cy="17.5" r="2"/><circle cx="19" cy="15" r="1.6"/><path d="M7.8 8L11 15.8M8 7l7.5-1.2M16.6 7.3L13.2 15.9M13.9 17l3.6-1.4M18.2 7.4l.6 5.9"/>',
    window: '<rect x="3.5" y="5" width="17" height="14" rx="1.5"/><path d="M3.5 9h17M6.5 7h.01M9 7h.01"/><path d="M8 13h8M8 16h5"/>'
  };

  // ---------- Progetti curati (i testi sono in i18n.js / i18n-v3.js) ----------
  // tags = aree per i filtri; traits = temi condivisi che generano le sinapsi
  const CURATED = [
    { id: 'frontline', tags: ['quant', 'product'], traits: ['bitcoin', 'markets', 'viz', 'web'], icon: 'swords', site: '/frontline/', siteLocal: true, stack: ['Three.js', 'WebSockets', 'Binance · Kraken · Coinbase'] },
    { id: 'ns', tags: ['quant'], traits: ['volatility', 'research', 'python'], icon: 'curve', repo: 'spx-vol-backtest', stack: ['Python', 'ARIMA', 'VIX term structure', 'SVXY / VXX / SPY'] },
    { id: 'dvol', tags: ['quant'], traits: ['bitcoin', 'volatility', 'python'], icon: 'spike', repo: 'btc-dvol-strategy', preferRepoText: true, stack: ['Python', 'Deribit DVOL'] },
    { id: 'btc', tags: ['quant'], traits: ['bitcoin', 'volatility', 'research'], icon: 'bars', repo: 'bitcoin-fee-dynamics-econometrics', stack: ['GARCH', 'Regime switching', 'Long memory'] },
    { id: 'micro', tags: ['quant'], traits: ['markets', 'research'], icon: 'ladder', stack: ['R', 'data.table', 'Tick data'] },
    { id: 'energy', tags: ['quant'], traits: ['energy', 'research'], icon: 'bolt', stack: ['IEA WEO 2025', 'Equity research', 'Portfolio construction'] },
    { id: 'twin', tags: ['product'], traits: ['ai', 'web'], icon: 'chat', repo: 'cv-chatbot-portfolio', site: '#twin', siteLocal: true, stack: ['Vercel', 'Serverless', 'Groq', 'JavaScript'] },
    { id: 'sinapsi', tags: ['product'], traits: ['ai', 'viz', 'web', 'lovable'], icon: 'neurons', repo: 'sinapsi', stack: ['Claude', 'Lovable', 'Groq', 'GitHub'] },
    { id: 'brightwood', tags: ['product'], traits: ['lovable', 'ai', 'web', 'startup'], icon: 'plank', site: 'https://brightwood.it', stack: ['Lovable'] },
    { id: 'websites', tags: ['product'], traits: ['web', 'startup'], icon: 'window', stack: ['HTML', 'Vercel', 'Cloudflare'] },
    { id: 'vintage', tags: ['product'], traits: ['lovable', 'web', 'startup'], icon: 'hanger', stack: ['Lovable'] }
  ];

  // ---------- Riconoscere tema e area dei repository nuovi ----------
  const RULES = [
    ['bitcoin', /bitcoin|btc|crypto|blockchain|ethereum|defi|on-?chain/i],
    ['volatility', /vol(atility)?\b|vix|dvol|option|garch|implied/i],
    ['markets', /order ?book|microstructure|liquidity|market|trading|exchange|spread/i],
    ['research', /econometr|paper|study|thesis|regression|arima|backtest|analysis/i],
    ['ai', /\bai\b|llm|gpt|groq|claude|chat ?bot|agent|machine learning|\bml\b|neural/i],
    ['web', /website|web ?app|landing|site|frontend|html|react|next\.?js|vercel/i],
    ['lovable', /lovable/i],
    ['energy', /energy|gas|oil|power|renewable/i],
    ['viz', /3d|three\.?js|visuali[sz]|dashboard|chart/i],
    ['startup', /startup|e-?commerce|shop|store|go-?to-?market|gtm/i]
  ];
  const QUANT = /quant|vol|backtest|econometr|financ|trading|bitcoin|btc|crypto|market|option|portfolio|risk|garch|arima|strategy|stock|equity|bond/i;

  function inferRepo(r) {
    const hay = [r.name.replace(/[-_]/g, ' '), r.description, (r.topics || []).join(' ')].join(' ');
    const traits = RULES.filter(([, re]) => re.test(hay)).map(([k]) => k);
    if (/python|jupyter/i.test(r.language)) traits.push('python');
    if (!traits.length) traits.push('web');
    const tags = QUANT.test(hay) ? ['quant'] : ['product'];
    return { traits: [...new Set(traits)], tags };
  }
  const prettyName = (n) => n.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bAi\b/g, 'AI').replace(/\bBtc\b/g, 'BTC');
  const initials = (n) => n.split(/[-_ ]+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');

  // ---------- Stato ----------
  let repos = null, ghState = 'syncing';
  let projects = [];                    // lista finale dopo l'unione curati + GitHub
  let edges = [];                       // [i, j, traitsCondivisi]
  let filter = 'all';
  let view = 'net';
  try { view = localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'net'; } catch (e) {}
  if (window.matchMedia('(max-width: 360px)').matches) view = 'list';

  function build() {
    const t = T();
    const byRepo = new Map((repos || []).map((r) => [r.name.toLowerCase(), r]));
    const used = new Set();
    const list = CURATED.map((c) => {
      const r = c.repo ? byRepo.get(c.repo.toLowerCase()) : null;
      if (c.repo) used.add(c.repo.toLowerCase());
      if (c.repo && repos && !r && c.repoOnly) return null;
      const tx = t.items[c.id] || {};
      const site = c.site || (r && r.homepage && !/cv-chatbot-portfolio/.test(r.homepage) ? r.homepage : '');
      return {
        ...c, key: c.id, auto: false,
        name: tx.name || prettyName(c.id),
        line: tx.line || '',
        body: c.preferRepoText && r && r.description ? r.description : (tx.body || ''),
        q: tx.q || '',
        github: r ? r.url : (c.repo ? `https://github.com/${GH_USER}/${c.repo}` : ''),
        site, pushed: r ? r.pushed_at : null
      };
    }).filter(Boolean);

    (repos || []).forEach((r) => {
      const key = r.name.toLowerCase();
      if (used.has(key) || HIDE.test(r.name) || HIDE.test(r.description || '')) return;
      const inf = inferRepo(r);
      list.push({
        id: 'gh-' + key, key, auto: true, tags: inf.tags, traits: inf.traits, icon: null, mono: initials(r.name),
        name: prettyName(r.name),
        line: r.description || t.autoLine,
        body: r.description ? '' : t.noDesc,
        q: (window.currentLang === 'it' ? 'Raccontami del progetto ' : window.currentLang === 'sv' ? 'Berätta om projektet ' : 'Tell me about your project ') + prettyName(r.name) + '.',
        github: r.url, site: r.homepage || '', pushed: r.pushed_at,
        stack: [r.language, ...(r.topics || []).slice(0, 4)].filter(Boolean)
      });
    });

    projects = list;
    edges = [];
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const shared = list[i].traits.filter((x) => list[j].traits.includes(x));
      if (shared.length) edges.push([i, j, shared]);
    }
    window.PROJECT_COUNT = list.length;
    window.dispatchEvent(new Event('projectsupdate'));
  }

  // ---------- GitHub: cache locale subito, poi /api/github, poi GitHub diretto ----------
  async function syncGitHub() {
    try {
      const c = JSON.parse(localStorage.getItem(GH_CACHE) || 'null');
      if (c && Array.isArray(c.repos)) { repos = c.repos; }
    } catch (e) {}
    const tryJSON = async (url) => {
      const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 8000);
      try { const r = await fetch(url, { signal: ctl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
      finally { clearTimeout(timer); }
    };
    let fresh = null;
    try { const d = await tryJSON('/api/github'); if (d && Array.isArray(d.repos)) fresh = d.repos; } catch (e) {}
    if (!fresh) {
      try {
        const d = await tryJSON(`https://api.github.com/users/${GH_USER}/repos?per_page=100&type=owner&sort=pushed`);
        if (Array.isArray(d)) fresh = d.filter((x) => !x.fork && !x.private).map((x) => ({ name: x.name, description: x.description || '', homepage: x.homepage || '', url: x.html_url, language: x.language || '', topics: x.topics || [], stars: x.stargazers_count || 0, pushed_at: x.pushed_at, created_at: x.created_at }));
      } catch (e) {}
    }
    if (fresh) {
      repos = fresh; ghState = 'ok';
      try { localStorage.setItem(GH_CACHE, JSON.stringify({ at: Date.now(), repos: fresh })); } catch (e) {}
    } else ghState = repos ? 'offline' : 'none';
    rebuild();
  }

  // ---------- Disegno del logo ----------
  function logoSVG(p) {
    const both = p.tags.includes('quant') && p.tags.includes('product');
    const cls = both ? 'both' : p.tags.includes('quant') ? 'quant' : 'product';
    const inner = p.icon && ICONS[p.icon]
      ? `<g class="lg-ico" transform="translate(12 12) scale(.92) translate(-12 -12)">${ICONS[p.icon]}</g>`
      : `<text x="12" y="12.5" class="lg-mono">${p.mono || '?'}</text>`;
    const shape = p.auto
      ? '<path class="lg-bg" d="M12 1.2l9.3 5.4v10.8L12 22.8l-9.3-5.4V6.6z"/>'
      : '<circle class="lg-bg" cx="12" cy="12" r="11"/>';
    return `<svg class="lg ${cls}" viewBox="0 0 24 24" aria-hidden="true">${shape}<g transform="translate(5.4 5.4) scale(.55)">${inner}</g></svg>`;
  }

  // ---------- Elementi della sezione ----------
  const els = {
    filters: $('filters'), toggle: $('pjView'), net: $('pjNet'), stage: $('pjStage'), canvas: $('pjEdges'),
    nodes: $('pjNodes'), card: $('pjCard'), list: $('projList'), meta: $('pjMeta'), hint: $('pjHint')
  };

  function rebuild() {
    const keep = focus != null && projects[focus] ? projects[focus].key : null;
    build();
    focus = keep ? projects.findIndex((p) => p.key === keep) : null;
    if (focus === -1) { focus = null; pinned = false; tYaw = null; }
    renderControls();
    renderNodes();
    renderList();
    renderCard();
    renderMeta();
  }

  function renderControls() {
    const t = T(), tAll = window.SITE_TEXT[window.currentLang].projects;
    els.filters.innerHTML = '';
    Object.entries(tAll.filters).forEach(([k, label]) => {
      const b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.setAttribute('aria-pressed', String(k === filter));
      b.onclick = () => { filter = k; if (focus != null && !matches(projects[focus])) clearFocus(true); renderControls(); applyFilter(); renderList(); };
      els.filters.appendChild(b);
    });
    els.toggle.querySelectorAll('button').forEach((b) => {
      b.setAttribute('aria-pressed', String(b.dataset.view === view));
      b.querySelector('span').textContent = b.dataset.view === 'net' ? t.view3d : t.viewList;
    });
    els.net.hidden = view !== 'net';
    els.list.hidden = view !== 'list';
    els.hint.textContent = window.matchMedia('(pointer: coarse)').matches ? t.hintTouch : t.hint;
  }
  els.toggle.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    view = b.dataset.view;
    try { localStorage.setItem(VIEW_KEY, view); } catch (e) {}
    renderControls();
    if (view === 'net') { resize(); kick(); }
  }));

  const matches = (p) => filter === 'all' || p.tags.includes(filter);

  function renderMeta() {
    const t = T();
    const g = projects.filter((p) => p.github && p.pushed).length;
    let s = t.count.replace('{n}', projects.length);
    if (ghState === 'syncing') s += ' · ' + t.syncing;
    else if (ghState === 'ok') s += ' · ' + t.synced.replace('{g}', g);
    else if (ghState === 'offline') s += ' · ' + t.offline;
    els.meta.textContent = s;
  }

  const rtf = () => new Intl.RelativeTimeFormat(window.currentLang, { numeric: 'auto' });
  function ago(iso) {
    const d = (Date.now() - new Date(iso).getTime()) / 864e5;
    if (d < 1) return rtf().format(0, 'day');
    if (d < 30) return rtf().format(-Math.round(d), 'day');
    if (d < 365) return rtf().format(-Math.round(d / 30), 'month');
    return rtf().format(-Math.round(d / 365), 'year');
  }
  const isNew = (p) => p.pushed && Date.now() - new Date(p.pushed).getTime() < 21 * 864e5;

  // link del nome: sito esterno in una nuova scheda, pagine di questo sito nella stessa
  function nameLink(p, cls) {
    const href = p.site || '';
    const el = document.createElement(href ? 'a' : 'span');
    el.className = cls;
    el.textContent = p.name;
    if (href) {
      el.href = href;
      if (!p.siteLocal) { el.target = '_blank'; el.rel = 'noopener'; }
      const ar = document.createElement('span'); ar.className = 'pj-ext'; ar.setAttribute('aria-hidden', 'true'); ar.textContent = p.siteLocal ? ' →' : ' ↗';
      el.appendChild(ar);
    }
    return el;
  }

  function linkButtons(p, wrap) {
    const t = T();
    if (p.site && !/^#/.test(p.site)) {
      const a = document.createElement('a'); a.className = 'btn small'; a.href = p.site;
      a.textContent = p.siteLocal ? t.open3d : t.website;
      if (!p.siteLocal) { a.target = '_blank'; a.rel = 'noopener'; }
      wrap.appendChild(a);
    }
    if (p.github) {
      const a = document.createElement('a'); a.className = 'btn ghost small'; a.href = p.github; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = t.github; wrap.appendChild(a);
    }
    if (p.q) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'link-btn';
      b.textContent = window.SITE_TEXT[window.currentLang].projects.ask;
      b.onclick = () => window.askTwin(p.q); wrap.appendChild(b);
    }
  }

  // ---------- Vista lista ----------
  const openRows = new Set(['frontline']);
  function renderList() {
    const t = T();
    els.list.innerHTML = '';
    projects.forEach((p) => {
      const li = document.createElement('li');
      li.className = 'proj';
      li.hidden = !matches(p);
      const isOpen = openRows.has(p.key);
      li.innerHTML = `
        <div class="proj-row">
          <span class="proj-logo">${logoSVG(p)}</span>
          <div class="proj-title"></div>
          <button type="button" class="proj-toggle" aria-expanded="${isOpen}" aria-controls="pb-${p.key}">+</button>
        </div>
        <div class="proj-body" id="pb-${p.key}" ${isOpen ? '' : 'hidden'}>
          <div><p class="proj-desc"></p><div class="proj-links"></div></div>
          <div><p class="stack-label"></p><div class="chips"></div></div>
        </div>`;
      const title = li.querySelector('.proj-title');
      title.appendChild(nameLink(p, 'proj-name'));
      if (isNew(p)) { const n = document.createElement('span'); n.className = 'pj-new'; n.textContent = t.newBadge; title.appendChild(n); }
      const line = document.createElement('span'); line.className = 'proj-line'; line.textContent = p.line; title.appendChild(line);
      li.querySelector('.proj-desc').textContent = p.body || '';
      if (!p.body) li.querySelector('.proj-desc').hidden = true;
      linkButtons(p, li.querySelector('.proj-links'));
      li.querySelector('.stack-label').textContent = window.SITE_TEXT[window.currentLang].projects.stack;
      const chips = li.querySelector('.chips');
      (p.stack || []).forEach((s) => { const c = document.createElement('span'); c.className = 'chip'; c.textContent = s; chips.appendChild(c); });
      if (p.pushed) { const c = document.createElement('span'); c.className = 'chip soft'; c.textContent = t.updated.replace('{d}', ago(p.pushed)); chips.appendChild(c); }
      const tg = li.querySelector('.proj-toggle');
      tg.setAttribute('aria-label', p.name);
      tg.onclick = () => { openRows.has(p.key) ? openRows.delete(p.key) : openRows.add(p.key); renderList(); };
      els.list.appendChild(li);
    });
  }

  // ---------- Vista 3D: nodi, sinapsi e scheda di dettaglio ----------
  let nodeEls = [], base = [], W = 0, H = 0, R = 1, ctx = null, dpr = 1;
  let yaw = 0.4, pitch = 0.22, tYaw = null, tPitch = 0.22;
  let focus = null, pinned = false, lastSwitch = 0, leaveT = null;
  let running = false, visible = false, last = 0, alpha = [];

  function layout(n) {
    // punti distribuiti sulla sfera (spirale di Fibonacci), con un po' di irregolarità organica
    const pts = [], g = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i + 0.5) / n * 2, r = Math.sqrt(1 - y * y), th = i * g;
      const k = 0.86 + ((i * 37) % 11) / 11 * 0.22;
      pts.push({ x: Math.cos(th) * r * k, y: y * k * 0.92, z: Math.sin(th) * r * k, ph: i * 1.7 });
    }
    return pts;
  }

  function renderNodes() {
    els.nodes.innerHTML = '';
    base = layout(projects.length);
    alpha = projects.map(() => 1);
    nodeEls = projects.map((p, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'pj-node' + (p.auto ? ' auto' : '');
      b.innerHTML = `${logoSVG(p)}<span class="pj-label"></span>`;
      b.querySelector('.pj-label').textContent = p.name;
      b.setAttribute('aria-label', p.name + (p.line ? ': ' + p.line : ''));
      b.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' && !dragging) hoverNode(i); });
      b.addEventListener('click', () => { if (moved) return; setFocus(i, true); });
      b.addEventListener('focus', () => { if (!b.matches(':focus-visible')) return; setFocus(i, true); });
      els.nodes.appendChild(b);
      return b;
    });
    applyFilter();
    resize();
    kick();
  }

  function applyFilter() {
    nodeEls.forEach((b, i) => {
      const on = matches(projects[i]);
      b.classList.toggle('off', !on);
      b.tabIndex = on ? 0 : -1;
      b.setAttribute('aria-hidden', String(!on));
    });
    kick();
  }

  function hoverNode(i) {
    if (focus === i) { clearTimeout(leaveT); return; }
    if (performance.now() - lastSwitch < 380) return;    // evita il tremolio mentre la rete ruota sotto il cursore
    setFocus(i, false);
  }
  function setFocus(i, pin) {
    if (!matches(projects[i])) return;
    clearTimeout(leaveT);
    focus = i; pinned = pin || pinned; lastSwitch = performance.now();
    const p = base[i];
    tYaw = Math.atan2(-p.x, p.z);
    tPitch = Math.atan2(p.y, Math.hypot(p.x, p.z));
    renderCard();
    kick();
  }
  function clearFocus(force) {
    if (pinned && !force) return;
    focus = null; pinned = false; tYaw = null; tPitch = 0.22;
    renderCard();
    kick();
  }
  els.stage.addEventListener('pointerleave', (e) => {
    if (e.pointerType !== 'mouse' || pinned) return;
    clearTimeout(leaveT);
    leaveT = setTimeout(() => clearFocus(false), 650);
  });
  els.stage.addEventListener('pointerenter', () => clearTimeout(leaveT));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && focus != null && root.contains(document.activeElement)) clearFocus(true); });

  // trascinare per ruotare (in verticale su touch la pagina continua a scorrere)
  let dragging = false, moved = false, sx = 0, sy = 0, sYaw = 0, sPitch = 0;
  els.stage.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true; moved = false; sx = e.clientX; sy = e.clientY; sYaw = yaw; sPitch = pitch;
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!moved && Math.hypot(dx, dy) > 6) { moved = true; tYaw = null; if (!pinned) focus = null; els.stage.classList.add('dragging'); }
    if (moved) {
      yaw = sYaw + dx * 0.0065;
      if (e.pointerType === 'mouse') pitch = Math.max(-1.1, Math.min(1.1, sPitch + dy * 0.0055));
      tPitch = pitch;
      kick();
    }
  });
  window.addEventListener('pointercancel', () => { dragging = false; moved = false; els.stage.classList.remove('dragging'); });
  window.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false; els.stage.classList.remove('dragging');
    if (moved) { setTimeout(() => { moved = false; }, 0); if (focus == null) renderCard(); }
  });
  els.stage.addEventListener('click', (e) => { if (!moved && !e.target.closest('.pj-node')) clearFocus(true); });

  function resize() {
    if (view !== 'net') return;
    const r = els.stage.getBoundingClientRect();
    W = r.width; H = r.height;
    if (!W || !H) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    els.canvas.width = W * dpr; els.canvas.height = H * dpr;
    ctx = els.canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W * 0.42, H * 0.4);
  }
  window.addEventListener('resize', () => { resize(); kick(); });

  new IntersectionObserver(([en]) => { visible = en.isIntersecting; kick(); }, { threshold: 0.05 }).observe(els.stage);

  function kick() { if (!running && view === 'net') { running = true; last = performance.now(); requestAnimationFrame(frame); } }

  let COL = null;
  const readColors = () => {
    const cs = getComputedStyle(root), g = (n) => cs.getPropertyValue(n).trim();
    COL = { line: g('--pj-line'), hot: g('--pj-hot'), pulse: g('--pj-pulse'), tagBg: g('--pj-tag-bg'), tagInk: g('--pj-tag-ink'), font: g('--f-body') || 'sans-serif' };
  };
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { COL = null; kick(); });
  const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!visible || view !== 'net' || !W) { running = false; return; }
    // rotazione: verso il progetto in primo piano, altrimenti lenta rotazione automatica
    if (tYaw != null) yaw += angDiff(yaw, tYaw) * Math.min(1, dt * 4.5);
    else if (!dragging && !reduced) yaw += dt * 0.12;
    if (!dragging) pitch += (tPitch - pitch) * Math.min(1, dt * 3.5);
    draw(now / 1000);
    const settling = tYaw != null && Math.abs(angDiff(yaw, tYaw)) > 0.002;
    if (!reduced || dragging || settling || Math.abs(tPitch - pitch) > 0.002) requestAnimationFrame(frame);
    else running = false;
  }

  function project(i, t) {
    const p = base[i];
    const wob = reduced ? 0 : Math.sin(t * 0.9 + p.ph) * 0.035;
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    const x1 = p.x * cy + p.z * sy, z1 = -p.x * sy + p.z * cy;
    const y2 = (p.y + wob) * cp - z1 * sp, z2 = (p.y + wob) * sp + z1 * cp;
    const D = 3.2, f = D / (D - z2);
    return { x: W / 2 + x1 * f * R, y: H / 2 + y2 * f * R, z: z2, f };
  }

  function draw(t) {
    const P = projects.map((_, i) => project(i, t));
    const focusN = focus != null ? new Set(edges.filter((e) => e[0] === focus || e[1] === focus).map((e) => (e[0] === focus ? e[1] : e[0]))) : null;
    // nodi
    P.forEach((q, i) => {
      const on = matches(projects[i]);
      const isF = i === focus, near = focusN && focusN.has(i);
      let s = 0.62 + (q.z + 1) * 0.25;
      if (isF) s = 1.55; else if (focusN && !near) s *= 0.85;
      let a = on ? 0.38 + (q.z + 1) * 0.31 : 0.08;
      if (focusN && !isF && !near && on) a *= 0.45;
      alpha[i] += ((isF ? 1 : a) - alpha[i]) * 0.2;
      const el = nodeEls[i];
      el.style.transform = `translate3d(${q.x.toFixed(1)}px, ${q.y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(on ? s : s * 0.7).toFixed(3)})`;
      el.style.opacity = alpha[i].toFixed(3);
      el.style.zIndex = isF ? 999 : String(Math.round((q.z + 1) * 100));
      el.classList.toggle('focus', isF);
      el.classList.toggle('near', !!near);
      el.classList.toggle('back', q.z < -0.25 && !isF);
    });
    // sinapsi
    ctx.clearRect(0, 0, W, H);
    if (!COL) readColors();
    const line = COL.line, hot = COL.hot, pulse = COL.pulse;
    edges.forEach(([i, j, shared], k) => {
      if (!matches(projects[i]) || !matches(projects[j])) return;
      const a = P[i], b = P[j];
      const involved = focus === i || focus === j;
      const depth = ((a.z + b.z) / 2 + 1) / 2;
      let op = (0.12 + depth * 0.32) * Math.min(1, 0.6 + shared.length * 0.25);
      if (focus != null && !involved) op *= 0.25;
      // curva leggermente piegata verso il centro: sembra più una sinapsi che un segmento
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const cx = mx + (W / 2 - mx) * 0.18, cyy = my + (H / 2 - my) * 0.18;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.quadraticCurveTo(cx, cyy, b.x, b.y);
      ctx.strokeStyle = involved ? hot : line;
      ctx.globalAlpha = involved ? 0.95 : op;
      ctx.lineWidth = involved ? 2 : 1 + (shared.length - 1) * 0.5;
      ctx.stroke();
      // impulso che viaggia lungo la sinapsi
      if (!reduced) {
        const per = 2.6 + (k % 5) * 0.7, u = ((t / per) + k * 0.37) % 1;
        const ux = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * cx + u * u * b.x;
        const uy = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * cyy + u * u * b.y;
        ctx.globalAlpha = involved ? 1 : op * 1.4;
        ctx.fillStyle = involved ? hot : pulse;
        ctx.beginPath(); ctx.arc(ux, uy, involved ? 2.6 : 1.6, 0, 6.283); ctx.fill();
      }
      // etichetta del tema condiviso sui collegamenti del progetto in primo piano
      if (involved) {
        const lab = shared.map((s) => T().traits[s] || s).join(' · ');
        ctx.globalAlpha = 1;
        ctx.font = '600 11.5px ' + COL.font;
        // l'etichetta sta verso il progetto collegato, così non copre quello in primo piano
        const u = focus === i ? 0.62 : 0.38;
        const lx = (1 - u) * (1 - u) * a.x + 2 * (1 - u) * u * cx + u * u * b.x;
        const ly = (1 - u) * (1 - u) * a.y + 2 * (1 - u) * u * cyy + u * u * b.y;
        const w = ctx.measureText(lab).width + 14;
        ctx.fillStyle = COL.tagBg;
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(lx - w / 2, ly - 10, w, 20, 10) : ctx.rect(lx - w / 2, ly - 10, w, 20); ctx.fill();
        ctx.fillStyle = COL.tagInk; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(lab, lx, ly + 0.5);
      }
    });
    ctx.globalAlpha = 1;
  }

  function renderCard() {
    const t = T(), c = els.card;
    c.innerHTML = '';
    if (focus == null) {
      c.classList.remove('has-focus');
      c.innerHTML = `<p class="pj-kicker"></p><h3></h3><p class="pj-body"></p>
        <ul class="pj-legend">
          <li><span class="sw quant"></span><span></span></li>
          <li><span class="sw product"></span><span></span></li>
          <li><span class="sw line"></span><span></span></li>
        </ul>`;
      c.querySelector('.pj-kicker').textContent = t.count.replace('{n}', projects.filter(matches).length);
      c.querySelector('h3').textContent = t.overviewTitle;
      c.querySelector('.pj-body').textContent = t.overviewBody;
      const lg = c.querySelectorAll('.pj-legend li span:last-child');
      lg[0].textContent = t.legendQuant; lg[1].textContent = t.legendProduct; lg[2].textContent = t.legendLine;
      return;
    }
    const p = projects[focus];
    c.classList.add('has-focus');
    const head = document.createElement('div'); head.className = 'pj-head';
    head.innerHTML = `<span class="pj-big-logo">${logoSVG(p)}</span>`;
    const ht = document.createElement('div');
    const kick = document.createElement('p'); kick.className = 'pj-kicker';
    kick.textContent = p.tags.map((x) => (x === 'quant' ? t.legendQuant : t.legendProduct)).join(' · ') + (p.auto ? ' · ' + t.fromGithub : '');
    ht.appendChild(kick);
    const h = document.createElement('h3'); h.appendChild(nameLink(p, 'pj-name'));
    if (isNew(p)) { const n = document.createElement('span'); n.className = 'pj-new'; n.textContent = t.newBadge; h.appendChild(n); }
    ht.appendChild(h); head.appendChild(ht); c.appendChild(head);
    const line = document.createElement('p'); line.className = 'pj-line'; line.textContent = p.line; c.appendChild(line);
    if (p.body) { const b = document.createElement('p'); b.className = 'pj-body'; b.textContent = p.body; c.appendChild(b); }

    const nb = edges.filter((e) => e[0] === focus || e[1] === focus).map((e) => ({ j: e[0] === focus ? e[1] : e[0], shared: e[2] })).filter((x) => matches(projects[x.j]));
    if (nb.length) {
      const lab = document.createElement('p'); lab.className = 'pj-sub'; lab.textContent = t.connected; c.appendChild(lab);
      const row = document.createElement('div'); row.className = 'pj-links-row';
      nb.forEach(({ j, shared }) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'pj-link';
        b.innerHTML = `<span class="mini">${logoSVG(projects[j])}</span><span></span>`;
        b.lastChild.textContent = projects[j].name;
        b.title = shared.map((s) => t.traits[s] || s).join(' · ');
        b.onclick = () => setFocus(j, true);
        row.appendChild(b);
      });
      c.appendChild(row);
    }
    const chips = document.createElement('div'); chips.className = 'chips';
    (p.stack || []).forEach((s) => { const x = document.createElement('span'); x.className = 'chip'; x.textContent = s; chips.appendChild(x); });
    if (p.pushed) { const x = document.createElement('span'); x.className = 'chip soft'; x.textContent = t.updated.replace('{d}', ago(p.pushed)); chips.appendChild(x); }
    c.appendChild(chips);
    const links = document.createElement('div'); links.className = 'proj-links'; linkButtons(p, links); c.appendChild(links);
  }

  window.addEventListener('langchange', rebuild);
  rebuild();
  syncGitHub();
})();
