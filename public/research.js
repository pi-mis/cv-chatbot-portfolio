// Ricerche e presentazioni: legge public/research/index.json e mostra ogni lavoro come un dossier.
// I PDF si leggono in una finestra dentro la pagina; pptx e xlsx si aprono con l'anteprima PDF se c'è,
// altrimenti con il visualizzatore online di Office. Gli originali sono sempre scaricabili.
(function () {
  const $ = (id) => document.getElementById(id);
  const list = $('rsList');
  if (!list) return;
  const T = () => window.SITE_TEXT[window.currentLang].research;
  const L = () => window.currentLang;
  const LOCALES = { it: 'it-IT', en: 'en-GB', sv: 'sv-SE' };
  let items = [];

  const pick = (v) => (v && typeof v === 'object' ? v[L()] || v.en || '' : v || '');
  const abs = (href) => new URL(href, location.origin).href;
  const monthLabel = (ym) => {
    const [y, m] = ym.split('-').map(Number);
    return new Intl.DateTimeFormat(LOCALES[L()], { month: 'short', year: 'numeric' }).format(new Date(y, (m || 1) - 1, 1));
  };
  const fileName = (href) => href.split('/').pop();

  function viewerSrc(f, page) {
    if (f.preview || f.type === 'pdf') return (f.preview || f.href) + '#view=FitH' + (page ? '&page=' + page : '');
    return 'https://view.officeapps.live.com/op/embed.aspx?src=' + encodeURIComponent(abs(f.href));
  }

  // ---------- Finestra di lettura ----------
  const dlg = $('rsViewer');
  function openViewer(item, f, page) {
    const t = T();
    $('rsvTitle').textContent = item.title + ' · ' + (f.role === 'slides' ? t.slides : t.read);
    $('rsvFrame').src = viewerSrc(f, page);
    const nw = $('rsvNew'); nw.href = f.preview || f.type === 'pdf' ? (f.preview || f.href) : viewerSrc(f); nw.textContent = t.openNew;
    const dl = $('rsvDl'); dl.href = f.href; dl.setAttribute('download', fileName(f.href)); dl.textContent = `${t.download} ${t.types[f.type] || f.type.toUpperCase()}`;
    $('rsvClose').setAttribute('aria-label', t.close);
    $('rsvNote').textContent = t.viewerNote;
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    document.body.classList.add('rs-lock');
  }
  function closeViewer() {
    if (dlg.close) dlg.close(); else dlg.removeAttribute('open');
  }
  dlg.addEventListener('close', () => { $('rsvFrame').src = 'about:blank'; document.body.classList.remove('rs-lock'); });
  $('rsvClose').addEventListener('click', closeViewer);
  dlg.addEventListener('click', (e) => { if (e.target === dlg) closeViewer(); });

  // ---------- Schede ----------
  function render() {
    const t = T();
    list.innerHTML = '';
    items.forEach((it) => {
      const art = document.createElement('article');
      art.className = 'rs-item';
      art.innerHTML = `
        <button type="button" class="rs-cover"><img alt="" loading="lazy" /><span class="rs-types"></span></button>
        <div class="rs-main">
          <p class="rs-kicker"></p>
          <h3></h3>
          <p class="rs-sub"></p>
          <p class="rs-sum"></p>
          <blockquote class="rs-key"><small></small><span></span></blockquote>
          <div class="chips rs-tags"></div>
          <div class="rs-gallery"></div>
          <div class="rs-actions"></div>
        </div>`;
      const read = it.files.find((f) => f.role === 'read') || it.files[0];
      art.querySelector('.rs-cover img').src = it.thumb;
      art.querySelector('.rs-cover').setAttribute('aria-label', `${t.read}: ${it.title}`);
      art.querySelector('.rs-cover').onclick = () => openViewer(it, read);
      const types = art.querySelector('.rs-types');
      [...new Set(it.files.map((f) => f.type))].forEach((ty) => { const s = document.createElement('span'); s.className = 'rs-type ' + ty; s.textContent = t.types[ty] || ty.toUpperCase(); types.appendChild(s); });
      art.querySelector('.rs-kicker').textContent = [pick(it.kind), it.course, it.institution, monthLabel(it.date)].filter(Boolean).join(' · ');
      art.querySelector('h3').textContent = it.title;
      art.querySelector('.rs-sub').textContent = it.subtitle || '';
      art.querySelector('.rs-sum').textContent = pick(it.summary);
      const key = art.querySelector('.rs-key');
      if (it.key) { key.querySelector('small').textContent = t.keyIdea; key.querySelector('span').textContent = pick(it.key); } else key.remove();
      const tags = art.querySelector('.rs-tags');
      (it.tags || []).forEach((x) => { const s = document.createElement('span'); s.className = 'chip'; s.textContent = x; tags.appendChild(s); });

      // anteprime delle slide: un clic apre la presentazione a quella pagina
      const slidesF = it.files.find((f) => f.role === 'slides');
      const gal = art.querySelector('.rs-gallery');
      if (it.gallery && it.gallery.length && slidesF) {
        it.gallery.forEach((src, i) => {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'rs-thumb';
          b.innerHTML = `<img alt="" loading="lazy" src="${src}"/><span>${i + 1}</span>`;
          b.setAttribute('aria-label', `${t.slides} ${i + 1}`);
          b.onclick = () => openViewer(it, slidesF, i + 1);
          gal.appendChild(b);
        });
      } else gal.remove();

      const act = art.querySelector('.rs-actions');
      it.files.forEach((f) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = f === read ? 'btn small' : 'btn ghost small';
        const n = f.pages ? ' · ' + (f.role === 'slides' ? t.slidesN : t.pages).replace('{n}', f.pages) : '';
        b.textContent = (f.role === 'slides' ? t.slides : t.read) + n;
        b.onclick = () => openViewer(it, f);
        act.appendChild(b);
      });
      it.files.forEach((f) => {
        const a = document.createElement('a');
        a.className = 'rs-dl'; a.href = f.href; a.setAttribute('download', fileName(f.href));
        a.textContent = `${t.download} ${t.types[f.type] || f.type.toUpperCase()}`;
        act.appendChild(a);
      });
      if (it.q) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'link-btn';
        b.textContent = t.ask; b.onclick = () => window.askTwin(pick(it.q));
        act.appendChild(b);
      }
      list.appendChild(art);
    });
  }

  fetch('/research/index.json')
    .then((r) => (r.ok ? r.json() : { items: [] }))
    .then((d) => { items = (d.items || []).sort((a, b) => (a.date < b.date ? 1 : -1)); render(); })
    .catch(() => {});
  window.addEventListener('langchange', render);
})();
