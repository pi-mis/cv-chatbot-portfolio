// Registrazione delle visite per il pannello analytics (vedi public/track.js).
// Azioni: start (inizio visita), beat (tempo attivo e sezioni viste), chat (domanda e risposta del gemello AI).
// Se il database non è collegato non fa nulla: il sito funziona comunque.
import { hasStore, pipe, body, clientIp, rateLimit } from './_lib/store.js';
import { parseUA, classifySource } from './_lib/ua.js';
import { verifyToken } from './_lib/auth.js';

const ID = /^[a-z0-9]{8,40}$/;
const clip = (s, n) => String(s == null ? '' : s).slice(0, n);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  if (!hasStore()) return res.status(204).end();
  try {
    const b = body(req);
    const sid = String(b.sid || ''), vid = String(b.vid || '');
    if (!ID.test(sid)) return res.status(400).end();
    const ip = clientIp(req);
    if (!(await rateLimit('rl:t:' + ip, 150, 60))) return res.status(429).end();
    const now = Date.now();
    const key = 'v:' + sid;
    const devOk = b.dev ? verifyToken(b.dev, 'device') : false;

    if (b.action === 'start') {
      if (!ID.test(vid)) return res.status(400).end();
      const ua = clip(req.headers['user-agent'], 400);
      const u = parseUA(ua);
      if (u.bot) return res.status(204).end();
      const [exists, adminVid] = await pipe([['EXISTS', key], ['SISMEMBER', 'admin_vids', vid]]);
      const admin = devOk || adminVid === 1;
      if (exists) {
        const c = [['HSET', key, 'last', now]];
        if (admin) c.push(['HSET', key, 'admin', '1']);
        await pipe(c);
        return res.status(204).end();
      }
      const h = req.headers;
      const src = classifySource({ ref: b.ref, utm: b.utm, ua });
      const dec = (x) => { try { return decodeURIComponent(x || ''); } catch (e) { return x || ''; } };
      const fields = {
        sid, vid, ip,
        country: clip(h['x-vercel-ip-country'], 4),
        region: clip(dec(h['x-vercel-ip-country-region']), 60),
        city: clip(dec(h['x-vercel-ip-city']), 80),
        ua, device: u.device, os: u.os, browser: u.browser,
        src: src.source, srcHost: clip(src.host, 120), ref: clip(b.ref, 300), utm: clip(b.utm, 80),
        lang: clip(b.lang, 8), bl: clip(b.bl, 20), scr: clip(b.scr, 20), tz: clip(b.tz, 60), path: clip(b.path, 200),
        start: now, last: now, dur: 0, chats: 0, sec: '', admin: admin ? '1' : '0'
      };
      await pipe([
        ['HSET', key, ...Object.entries(fields).flat().map(String)],
        ['ZADD', 'visits', now, sid],
        ['SADD', 'vidv:' + vid, sid]
      ]);
      return res.status(204).end();
    }

    const [exists] = await pipe([['EXISTS', key]]);
    if (!exists) return res.status(204).end();

    if (b.action === 'beat') {
      const dt = Math.max(0, Math.min(65, Math.round(Number(b.dt) || 0)));
      const c = [['HINCRBY', key, 'dur', dt], ['HSET', key, 'last', now]];
      if (Array.isArray(b.sec)) c.push(['HSET', key, 'sec', clip(b.sec.filter((x) => /^[a-z-]{2,20}$/.test(x)).join(','), 200)]);
      if (devOk) c.push(['HSET', key, 'admin', '1']);
      await pipe(c);
      return res.status(204).end();
    }

    if (b.action === 'chat') {
      const msg = JSON.stringify({ t: now, q: clip(b.q, 2000), a: clip(b.a, 6000), lang: clip(b.lang, 8) });
      await pipe([['RPUSH', 'chat:' + sid, msg], ['LTRIM', 'chat:' + sid, -300, -1], ['HINCRBY', key, 'chats', 1], ['HSET', key, 'last', now]]);
      return res.status(204).end();
    }

    return res.status(400).end();
  } catch (e) {
    console.error('track error', e);
    return res.status(204).end();
  }
}
