// Registrazione delle visite per il pannello analytics (api/track.js).
// Una visita = una sessione nel browser; se torni entro 30 minuti nella stessa scheda continua la stessa visita.
// Il tempo conta solo mentre la pagina è visibile. Le visite dai dispositivi admin vengono marcate come tali.
(function () {
  const rid = () => (Date.now().toString(36) + Math.random().toString(36).slice(2, 12)).slice(0, 20);
  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} } };
  const ss = { get: (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} } };

  let vid = ls.get('cv-vid');
  if (!vid || !/^[a-z0-9]{8,40}$/.test(vid)) { vid = rid(); ls.set('cv-vid', vid); }
  let sid = ss.get('cv-sid');
  const lastSeen = Number(ss.get('cv-sid-last') || 0);
  if (!sid || Date.now() - lastSeen > 30 * 60 * 1000) { sid = rid(); ss.set('cv-sid', sid); }
  ss.set('cv-sid-last', String(Date.now()));

  const dev = () => ls.get('cv-admin-device') || '';
  const payload = (action, extra) => JSON.stringify(Object.assign({ action, sid, vid, dev: dev() }, extra || {}));
  function send(action, extra, beacon) {
    const body = payload(action, extra);
    if (beacon && navigator.sendBeacon) {
      try { if (navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))) return; } catch (e) {}
    }
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  }

  // provenienza: referrer esterno e parametro del link (?ref=linkedin oppure utm_source=linkedin)
  const q = new URLSearchParams(location.search);
  let ref = document.referrer || '';
  try { if (ref && new URL(ref).origin === location.origin) ref = ''; } catch (e) {}
  send('start', {
    ref,
    utm: q.get('ref') || q.get('utm_source') || q.get('src') || '',
    lang: window.currentLang || '',
    bl: navigator.language || '',
    scr: `${screen.width}x${screen.height}`,
    tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || ''),
    path: location.pathname + location.hash
  });

  // tempo attivo e sezioni viste
  const seen = new Set(['hero']);
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting && e.target.id) seen.add(e.target.id); }), { threshold: 0.35 });
  document.querySelectorAll('main > section[id]').forEach((s) => io.observe(s));

  let acc = 0, mark = document.visibilityState === 'visible' ? performance.now() : 0;
  const flush = () => { if (mark) { acc += (performance.now() - mark) / 1000; mark = performance.now(); } };
  function beat(beacon) {
    flush();
    const dt = Math.round(acc);
    if (dt < 1 && !beacon) return;
    acc -= dt;
    ss.set('cv-sid-last', String(Date.now()));
    send('beat', { dt, sec: [...seen] }, beacon);
  }
  setInterval(() => { if (document.visibilityState === 'visible') beat(false); }, 20000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { beat(true); mark = 0; }
    else { mark = performance.now(); ss.set('cv-sid-last', String(Date.now())); }
  });
  window.addEventListener('pagehide', () => beat(true));

  // conversazioni con il gemello AI (chiamato da app.js dopo ogni risposta)
  window.trackChat = (question, answer, lang) => send('chat', { q: question, a: answer, lang: lang || window.currentLang || '' });
  window.CVTrack = { vid, sid, beat: () => beat(false) };
})();
