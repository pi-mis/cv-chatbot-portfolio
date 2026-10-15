// Accesso admin: email e password stanno solo nelle variabili d'ambiente di Vercel
// (ADMIN_EMAIL, ADMIN_PASSWORD). Dopo il login il browser riceve due gettoni firmati:
// - "session" (30 giorni): apre il pannello analytics;
// - "device" (2 anni): marca come admin tutte le visite fatte da quel dispositivo.
import crypto from 'crypto';

const EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const PASSWORD = process.env.ADMIN_PASSWORD || '';
const SECRET = process.env.ADMIN_SECRET || crypto.createHash('sha256').update('cv-admin|' + PASSWORD + '|' + EMAIL).digest('hex');

export const adminConfigured = () => !!(EMAIL && PASSWORD);

const h = (s) => crypto.createHash('sha256').update(String(s)).digest();
const same = (a, b) => crypto.timingSafeEqual(h(a), h(b));

export function checkLogin(email, password) {
  if (!adminConfigured()) return false;
  const okE = same(String(email || '').trim().toLowerCase(), EMAIL);
  const okP = same(String(password || ''), PASSWORD);
  return okE && okP;
}

const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (payload) => crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');

export function makeToken(kind, days) {
  const payload = b64(JSON.stringify({ k: kind, exp: Date.now() + days * 864e5 }));
  return payload + '.' + sign(payload);
}

export function verifyToken(token, kind) {
  if (!adminConfigured() || typeof token !== 'string' || !token.includes('.')) return false;
  const [payload, sig] = token.split('.');
  const good = sign(payload);
  if (sig.length !== good.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(good))) return false;
  try {
    const p = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return p.k === kind && p.exp > Date.now();
  } catch (e) { return false; }
}

export function bearer(req) {
  const a = req.headers.authorization || '';
  return a.startsWith('Bearer ') ? a.slice(7) : '';
}
