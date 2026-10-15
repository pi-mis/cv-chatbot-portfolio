// Riconoscimento semplice di dispositivo, sistema, browser e provenienza.

export function parseUA(ua = '') {
  const s = String(ua);
  const tablet = /iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(s);
  const mobile = !tablet && /Mobi|iPhone|iPod|Android|Windows Phone/i.test(s);
  const device = tablet ? 'tablet' : mobile ? 'mobile' : 'desktop';
  const os =
    /iPhone|iPad|iPod/i.test(s) ? 'iOS' :
    /Android/i.test(s) ? 'Android' :
    /Mac OS X|Macintosh/i.test(s) ? 'macOS' :
    /Windows/i.test(s) ? 'Windows' :
    /CrOS/i.test(s) ? 'ChromeOS' :
    /Linux/i.test(s) ? 'Linux' : '';
  const browser =
    /LinkedInApp/i.test(s) ? 'LinkedIn app' :
    /Instagram/i.test(s) ? 'Instagram app' :
    /FBAN|FBAV/i.test(s) ? 'Facebook app' :
    /Edg\//i.test(s) ? 'Edge' :
    /OPR\/|Opera/i.test(s) ? 'Opera' :
    /SamsungBrowser/i.test(s) ? 'Samsung Internet' :
    /Firefox|FxiOS/i.test(s) ? 'Firefox' :
    /Chrome|CriOS/i.test(s) ? 'Chrome' :
    /Safari/i.test(s) ? 'Safari' : '';
  const bot = /bot|crawler|spider|crawling|preview|HeadlessChrome|Lighthouse|facebookexternalhit|Slurp/i.test(s);
  return { device, os, browser, bot };
}

// da dove arriva il visitatore: parametro nel link (?ref= o utm_source), referrer o app di LinkedIn
export function classifySource({ ref = '', utm = '', ua = '' }) {
  const tag = String(utm || '').toLowerCase();
  let host = '';
  try { host = ref ? new URL(ref).hostname.replace(/^www\./, '') : ''; } catch (e) {}
  if (/linkedin|lnkd/.test(tag) || /linkedin\.com|lnkd\.in/.test(host) || /LinkedInApp/i.test(ua)) return { source: 'linkedin', host };
  if (tag) return { source: 'tag', host: tag };
  if (!host) return { source: 'direct', host: '' };
  if (/google\./.test(host)) return { source: 'search', host: 'Google' };
  if (/bing\.com|duckduckgo|yahoo\.|ecosia/.test(host)) return { source: 'search', host };
  if (/github\.com/.test(host)) return { source: 'link', host: 'GitHub' };
  return { source: 'link', host };
}
