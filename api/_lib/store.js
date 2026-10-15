// Accesso al database Redis (Upstash) tramite la sua API REST: nessuna dipendenza npm.
// Vercel → Storage → Upstash for Redis crea da solo le variabili KV_REST_API_URL e KV_REST_API_TOKEN.
// (Accettati anche i nomi UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN.)

const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const hasStore = () => !!(URL_ && TOKEN);

// esegue più comandi in una sola richiesta; restituisce i risultati nello stesso ordine
export async function pipe(cmds) {
  if (!cmds.length) return [];
  const r = await fetch(URL_.replace(/\/$/, '') + '/pipeline', {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds)
  });
  if (!r.ok) throw new Error('Redis HTTP ' + r.status);
  const out = await r.json();
  return out.map((x) => {
    if (x && x.error) throw new Error('Redis: ' + x.error);
    return x ? x.result : null;
  });
}

export const cmd = async (...c) => (await pipe([c]))[0];

// HGETALL restituisce [campo, valore, campo, valore...]
export function hashToObj(arr) {
  const o = {};
  if (Array.isArray(arr)) for (let i = 0; i < arr.length; i += 2) o[arr[i]] = arr[i + 1];
  return o;
}

// corpo della richiesta: Vercel lo analizza già se è JSON; sendBeacon può arrivare come testo
export function body(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === 'string') { try { return JSON.parse(b); } catch (e) { return {}; } }
  if (Buffer.isBuffer(b)) { try { return JSON.parse(b.toString('utf8')); } catch (e) { return {}; } }
  return b;
}

export function clientIp(req) {
  const h = req.headers;
  const xff = (h['x-forwarded-for'] || '').split(',')[0].trim();
  return xff || h['x-real-ip'] || (req.socket && req.socket.remoteAddress) || '';
}

// limite semplice: al massimo `max` richieste per chiave ogni `sec` secondi
export async function rateLimit(key, max, sec) {
  const [, n] = await pipe([['SET', key, 0, 'EX', sec, 'NX'], ['INCR', key]]);
  return n <= max;
}
