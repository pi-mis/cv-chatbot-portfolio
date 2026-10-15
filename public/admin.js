// Accesso admin e pannello analytics (in italiano: lo legge solo Pietro).
// Pulsante in fondo alla pagina → email e password → sotto il footer compare la sezione Analytics.
(function () {
  const $ = (id) => document.getElementById(id);
  const sec = $('admin');
  if (!sec) return;
  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }, del: (k) => { try { localStorage.removeItem(k); } catch (e) {} } };
  const SESSION = 'cv-admin-session', DEVICE = 'cv-admin-device';
  let visits = [], total = 0, showAdmin = ls.get('cv-admin-show') === '1', query = '', open = new Set();

  // ---------- chiamate al server ----------
  async function api(action, extra) {
    const r = await fetch('/api/admin', {
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, ls.get(SESSION) ? { Authorization: 'Bearer ' + ls.get(SESSION) } : {}),
      body: JSON.stringify(Object.assign({ action }, extra || {}))
    });
    const d = await r.json().catch(() => ({}));
    if (r.status === 401 && action !== 'login') { ls.del(SESSION); hide(); }
    return { ok: r.ok, status: r.status, d };
  }

  // ---------- login ----------
  const dlg = $('admLogin');
  function openLogin() {
    if (ls.get(SESSION)) return show();
    $('admErr').textContent = '';
    dlg.showModal ? dlg.showModal() : dlg.setAttribute('open', '');
    setTimeout(() => $('admEmail').focus(), 30);
  }
  $('admBtn').addEventListener('click', () => (sec.hidden ? openLogin() : hide()));
  $('admCancel').addEventListener('click', () => dlg.close());
  $('admForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('admGo'); btn.disabled = true; $('admErr').textContent = '';
    const r = await api('login', { email: $('admEmail').value, password: $('admPw').value, vid: window.CVTrack && window.CVTrack.vid });
    btn.disabled = false;
    if (!r.ok) {
      $('admErr').textContent = r.status === 401 ? 'Email o password non corretti.'
        : r.status === 429 ? 'Troppi tentativi. Riprova tra 15 minuti.'
        : r.status === 503 ? 'Accesso admin non ancora configurato su Vercel (ADMIN_EMAIL e ADMIN_PASSWORD).'
        : 'Errore del server. Riprova.';
      return;
    }
    ls.set(SESSION, r.d.token); ls.set(DEVICE, r.d.device);
    $('admPw').value = '';
    dlg.close();
    if (window.CVTrack) window.CVTrack.beat();
    show();
  });

  function hide() {
    sec.hidden = true;
    $('admBtn').textContent = ls.get(SESSION) ? 'Apri analytics' : 'Accesso admin';
  }
  async function show() {
    sec.hidden = false;
    $('admBtn').textContent = 'Chiudi analytics';
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    await load(true);
  }
  $('admOut').addEventListener('click', () => { ls.del(SESSION); hide(); window.scrollTo({ top: document.body.scrollHeight }); });
  $('admReload').addEventListener('click', () => load(true));
  $('admMore').addEventListener('click', () => load(false));
  $('admShowAdmin').checked = showAdmin;
  $('admShowAdmin').addEventListener('change', (e) => { showAdmin = e.target.checked; ls.set('cv-admin-show', showAdmin ? '1' : '0'); render(); });
  $('admSearch').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); renderTable(); });

  async function load(reset) {
    $('admState').textContent = 'Caricamento…';
    const r = await api('list', { limit: 300, offset: reset ? 0 : visits.length });
    if (!r.ok) {
      $('admState').textContent = r.status === 503 && r.d.error === 'no_store'
        ? 'Database non collegato: su Vercel apri Storage, crea “Upstash for Redis” e collegalo a questo progetto.'
        : 'Impossibile caricare i dati.';
      if (reset) { visits = []; render(); }
      return;
    }
    total = r.d.total;
    visits = reset ? r.d.visits : visits.concat(r.d.visits);
    $('admState').textContent = '';
    render();
  }

  // ---------- formattazione ----------
  const N = (x) => Number(x) || 0;
  const flag = (cc) => (/^[A-Z]{2}$/.test(cc || '') ? String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : '🌐');
  const country = (cc) => { try { return new Intl.DisplayNames(['it'], { type: 'region' }).of(cc); } catch (e) { return cc || ''; } };
  const dur = (s) => { s = N(s); if (s < 60) return s + ' s'; const m = Math.floor(s / 60); if (m < 60) return `${m} min ${String(s % 60).padStart(2, '0')} s`; return `${Math.floor(m / 60)} h ${m % 60} min`; };
  const when = (t) => new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(N(t)));
  const ago = (t) => {
    const d = (Date.now() - N(t)) / 1000, r = new Intl.RelativeTimeFormat('it', { numeric: 'auto' });
    if (d < 60) return 'adesso'; if (d < 3600) return r.format(-Math.round(d / 60), 'minute');
    if (d < 86400) return r.format(-Math.round(d / 3600), 'hour'); return r.format(-Math.round(d / 86400), 'day');
  };
  const SRC = { linkedin: 'LinkedIn', search: 'Ricerca', link: 'Link', tag: 'Link con etichetta', direct: 'Diretto' };
  const srcLabel = (v) => (v.src === 'linkedin' ? 'LinkedIn' : v.src === 'direct' ? 'Diretto o link copiato' : `${SRC[v.src] || v.src}${v.srcHost ? ': ' + v.srcHost : ''}`);
  const DEV = { mobile: 'Telefono', tablet: 'Tablet', desktop: 'PC' };
  const LANG = { it: 'IT', en: 'EN', sv: 'SV' };
  const SECT = { hero: 'Hero', twin: 'Gemello AI', journey: 'Percorso', projects: 'Progetti', research: 'Ricerche', game: 'Giochi', 'curve-lab': 'Curva', life: 'Fuori ufficio', contact: 'Contatti' };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const visible = () => visits.filter((v) => showAdmin || v.admin !== '1');
  const matches = (v) => !query || [v.ip, v.city, v.region, country(v.country), v.country, v.srcHost, v.os, v.browser, ...v.chat.map((m) => m.q + ' ' + m.a)].join(' ').toLowerCase().includes(query);

  function render() { renderTiles(); renderBreaks(); renderTable(); }

  function renderTiles() {
    const vs = visible();
    const uniq = new Set(vs.map((v) => v.vid)).size;
    const avg = vs.length ? vs.reduce((a, v) => a + N(v.dur), 0) / vs.length : 0;
    const qs = vs.reduce((a, v) => a + v.chat.length, 0);
    const mob = vs.length ? Math.round(vs.filter((v) => v.device !== 'desktop').length / vs.length * 100) : 0;
    const li = vs.filter((v) => v.src === 'linkedin').length;
    const tiles = [['Visite', vs.length], ['Visitatori unici', uniq], ['Tempo medio', dur(Math.round(avg))], ['Domande al gemello', qs], ['Da telefono o tablet', mob + '%'], ['Da LinkedIn', li]];
    $('admTiles').innerHTML = tiles.map(([k, v]) => `<div class="ad-tile"><small>${k}</small><strong>${esc(v)}</strong></div>`).join('');
    $('admNote').textContent = `${total} visite salvate in totale${showAdmin ? '' : ' · le tue visite admin sono escluse dai numeri'}.`;
  }

  function bars(title, rows) {
    const max = Math.max(1, ...rows.map((r) => r[1]));
    return `<div class="ad-break"><h3>${title}</h3>${rows.length ? rows.map(([k, n]) => `<div class="ad-bar"><span class="k">${esc(k)}</span><span class="b"><i style="width:${(n / max * 100).toFixed(1)}%"></i></span><span class="n">${n}</span></div>`).join('') : '<p class="ad-empty">Nessun dato ancora.</p>'}</div>`;
  }
  const count = (arr, f) => { const m = new Map(); arr.forEach((x) => { const k = f(x); if (k) m.set(k, (m.get(k) || 0) + 1); }); return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 7); };
  function renderBreaks() {
    const vs = visible();
    $('admBreaks').innerHTML =
      bars('Paesi', count(vs, (v) => (v.country ? `${flag(v.country)} ${country(v.country)}` : 'Sconosciuto'))) +
      bars('Provenienza', count(vs, (v) => (v.src === 'linkedin' ? 'LinkedIn' : v.src === 'direct' ? 'Diretto o link copiato' : v.srcHost || SRC[v.src]))) +
      bars('Dispositivo', count(vs, (v) => `${DEV[v.device] || v.device}${v.os ? ' · ' + v.os : ''}`)) +
      bars('Sezioni viste', count(vs.flatMap((v) => (v.sec || '').split(',').filter(Boolean)), (s) => SECT[s] || s));
  }

  function renderTable() {
    const vs = visible().filter(matches);
    $('admCount').textContent = `${vs.length} visite mostrate`;
    $('admMore').hidden = visits.length >= total;
    const tb = $('admRows');
    if (!vs.length) { tb.innerHTML = `<tr><td colspan="9" class="ad-empty">${visits.length ? 'Nessuna visita corrisponde ai filtri.' : 'Ancora nessuna visita registrata.'}</td></tr>`; return; }
    // numero progressivo della visita per ciascun dispositivo (1ª, 2ª...)
    const order = new Map();
    [...visits].sort((a, b) => N(a.start) - N(b.start)).forEach((v) => {
      const k = v.vid, c = (order.get(k) || 0) + 1; order.set(k, c); v._n = c + Math.max(0, N(v.vidVisits) - visits.filter((x) => x.vid === k).length);
    });
    tb.innerHTML = vs.map((v) => {
      const isOpen = open.has(v.sid);
      const place = [v.city, country(v.country)].filter(Boolean).join(', ') || 'Sconosciuto';
      const row = `
        <tr class="ad-row${v.admin === '1' ? ' is-admin' : ''}${isOpen ? ' open' : ''}" data-sid="${esc(v.sid)}">
          <td><button type="button" class="ad-exp" aria-expanded="${isOpen}" aria-label="Dettagli">▸</button></td>
          <td><strong>${when(v.start)}</strong><small>${ago(v.last || v.start)}</small></td>
          <td><span class="mono">${esc(v.ip || '—')}</span>${v.admin === '1' ? '<span class="ad-badge admin">admin</span>' : ''}<small>visita ${v._n} di ${N(v.vidVisits) || 1} da questo dispositivo</small></td>
          <td>${flag(v.country)} ${esc(place)}</td>
          <td>${esc(DEV[v.device] || v.device || '')}<small>${esc([v.os, v.browser].filter(Boolean).join(' · '))}</small></td>
          <td><span class="ad-badge src-${esc(v.src)}">${esc(srcLabel(v))}</span></td>
          <td class="mono">${dur(v.dur)}</td>
          <td class="mono">${v.chat.length || '—'}</td>
          <td><button type="button" class="ad-del" aria-label="Elimina questa visita" title="Elimina">✕</button></td>
        </tr>`;
      if (!isOpen) return row;
      const info = [
        ['Prima e ultima attività', `${when(v.start)} → ${when(v.last)}`],
        ['Referrer', v.ref || '—'], ['Etichetta del link', v.utm || '—'],
        ['Lingua del sito / del browser', `${LANG[v.lang] || v.lang || '—'} / ${v.bl || '—'}`],
        ['Schermo', v.scr || '—'], ['Fuso orario', v.tz || '—'], ['Regione', v.region || '—'],
        ['Sezioni viste', (v.sec || '').split(',').filter(Boolean).map((s) => SECT[s] || s).join(', ') || '—'],
        ['Browser completo', v.ua || '—']
      ].map(([k, x]) => `<dt>${k}</dt><dd>${esc(x)}</dd>`).join('');
      const chat = v.chat.length ? v.chat.map((m) => `
          <div class="ad-msg"><div class="ad-q"><span class="ad-lang">${esc((LANG[m.lang] || m.lang || '').toUpperCase())}</span><span class="ad-t">${esc(when(m.t))}</span>${esc(m.q)}</div>
          <div class="ad-a">${esc(m.a)}</div></div>`).join('') : '<p class="ad-empty">Nessuna domanda al gemello in questa visita.</p>';
      return row + `<tr class="ad-detail"><td colspan="9"><div class="ad-detail-grid"><dl>${info}</dl><div class="ad-chat"><h4>Conversazione con il gemello AI</h4>${chat}</div></div></td></tr>`;
    }).join('');
  }

  $('admRows').addEventListener('click', async (e) => {
    const tr = e.target.closest('.ad-row');
    if (!tr) return;
    const sid = tr.dataset.sid;
    if (e.target.closest('.ad-del')) {
      if (!confirm('Eliminare questa visita e la sua conversazione? Non si può annullare.')) return;
      const r = await api('delete', { ids: [sid] });
      if (r.ok) { visits = visits.filter((v) => v.sid !== sid); total = Math.max(0, total - 1); render(); }
      return;
    }
    open.has(sid) ? open.delete(sid) : open.add(sid);
    renderTable();
  });

  $('admDelAll').addEventListener('click', async () => {
    if (!confirm('Eliminare TUTTE le visite e le conversazioni salvate?')) return;
    if (prompt('Per confermare scrivi ELIMINA') !== 'ELIMINA') return;
    const r = await api('deleteAll');
    if (r.ok) { visits = []; total = 0; render(); }
  });

  $('admCsv').addEventListener('click', () => {
    const cols = ['inizio', 'ultima attività', 'ip', 'paese', 'regione', 'città', 'dispositivo', 'sistema', 'browser', 'provenienza', 'referrer', 'etichetta', 'lingua', 'secondi attivi', 'sezioni', 'admin', 'domande e risposte'];
    const rows = visits.map((v) => [new Date(N(v.start)).toISOString(), new Date(N(v.last)).toISOString(), v.ip, v.country, v.region, v.city, v.device, v.os, v.browser, srcLabel(v), v.ref, v.utm, v.lang, v.dur, v.sec, v.admin === '1' ? 'sì' : 'no', v.chat.map((m) => `[${m.lang}] D: ${m.q} | R: ${m.a}`).join(' || ')]);
    const csv = [cols, ...rows].map((r) => r.map((x) => `"${String(x == null ? '' : x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  hide();
  // link diretto al pannello: …/#admin
  if (location.hash === '#admin') openLogin();
})();
