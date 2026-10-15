// Pannello admin: login, elenco delle visite con le conversazioni, cancellazione.
// Tutto tranne il login richiede il gettone di sessione firmato (Authorization: Bearer ...).
import { hasStore, pipe, body, clientIp, rateLimit, hashToObj } from './_lib/store.js';
import { adminConfigured, checkLogin, makeToken, verifyToken, bearer } from './_lib/auth.js';

const ID = /^[a-z0-9]{8,40}$/;

async function deleteVisits(ids) {
  ids = ids.filter((x) => ID.test(x));
  if (!ids.length) return 0;
  const vids = await pipe(ids.map((id) => ['HGET', 'v:' + id, 'vid']));
  const c = [];
  ids.forEach((id, i) => {
    c.push(['DEL', 'v:' + id, 'chat:' + id], ['ZREM', 'visits', id]);
    if (vids[i]) c.push(['SREM', 'vidv:' + vids[i], id]);
  });
  for (let i = 0; i < c.length; i += 300) await pipe(c.slice(i, i + 300));
  return ids.length;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  if (!adminConfigured()) return res.status(503).json({ error: 'not_configured' });
  const b = body(req);
  const store = hasStore();

  try {
    if (b.action === 'login') {
      const ip = clientIp(req);
      if (store && !(await rateLimit('rl:login:' + ip, 8, 900))) return res.status(429).json({ error: 'too_many' });
      if (!checkLogin(b.email, b.password)) return res.status(401).json({ error: 'wrong' });
      // questo dispositivo d'ora in poi è "admin", e lo diventano anche le sue visite già registrate
      if (store && ID.test(String(b.vid || ''))) {
        const [, sids] = await pipe([['SADD', 'admin_vids', b.vid], ['SMEMBERS', 'vidv:' + b.vid]]);
        if (sids && sids.length) await pipe(sids.map((s) => ['HSET', 'v:' + s, 'admin', '1']));
      }
      return res.status(200).json({ token: makeToken('session', 30), device: makeToken('device', 730), store });
    }

    if (!verifyToken(bearer(req), 'session')) return res.status(401).json({ error: 'auth' });
    if (b.action === 'status') return res.status(200).json({ ok: true, store });
    if (!store) return res.status(503).json({ error: 'no_store' });

    if (b.action === 'list') {
      const limit = Math.max(1, Math.min(500, Number(b.limit) || 300));
      const offset = Math.max(0, Number(b.offset) || 0);
      const [total, ids] = await pipe([['ZCARD', 'visits'], ['ZREVRANGE', 'visits', offset, offset + limit - 1]]);
      if (!ids || !ids.length) return res.status(200).json({ total: total || 0, visits: [] });
      const raw = await pipe(ids.flatMap((id) => [['HGETALL', 'v:' + id], ['LRANGE', 'chat:' + id, 0, -1]]));
      const visits = [];
      for (let i = 0; i < ids.length; i++) {
        const v = hashToObj(raw[i * 2]);
        if (!v.sid) continue;
        v.chat = (raw[i * 2 + 1] || []).map((m) => { try { return JSON.parse(m); } catch (e) { return null; } }).filter(Boolean);
        visits.push(v);
      }
      // quante visite ha fatto in tutto ciascun dispositivo (anche oltre la pagina caricata)
      const vids = [...new Set(visits.map((v) => v.vid).filter(Boolean))];
      const counts = vids.length ? await pipe(vids.map((v) => ['SCARD', 'vidv:' + v])) : [];
      const byVid = Object.fromEntries(vids.map((v, i) => [v, counts[i] || 1]));
      visits.forEach((v) => { v.vidVisits = byVid[v.vid] || 1; });
      return res.status(200).json({ total, visits });
    }

    if (b.action === 'delete') {
      const n = await deleteVisits(Array.isArray(b.ids) ? b.ids.map(String) : []);
      return res.status(200).json({ deleted: n });
    }

    if (b.action === 'deleteAll') {
      const ids = (await pipe([['ZRANGE', 'visits', 0, -1]]))[0] || [];
      const n = await deleteVisits(ids);
      return res.status(200).json({ deleted: n });
    }

    return res.status(400).json({ error: 'action' });
  } catch (e) {
    console.error('admin error', e);
    return res.status(500).json({ error: 'server', message: e.message });
  }
}
