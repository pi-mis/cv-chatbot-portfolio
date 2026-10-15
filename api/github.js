// Elenco dei repository pubblici di GitHub per la sezione "Things I have built".
// La risposta resta in cache sulla CDN di Vercel per un'ora, così GitHub viene interrogato al massimo
// una volta l'ora (e i nuovi progetti compaiono sul sito da soli, senza toccare il codice).
// Facoltativo: una variabile GITHUB_TOKEN su Vercel alza il limite di richieste di GitHub.

const USER = 'pi-mis';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'cv-chatbot-portfolio' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const r = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&type=owner&sort=pushed`, { headers });
    if (!r.ok) {
      res.setHeader('Cache-Control', 'no-store');
      return res.status(502).json({ error: 'GitHub error', status: r.status });
    }
    const repos = (await r.json())
      .filter((x) => !x.fork && !x.private)
      .map((x) => ({
        name: x.name,
        description: x.description || '',
        homepage: x.homepage || '',
        url: x.html_url,
        language: x.language || '',
        topics: x.topics || [],
        stars: x.stargazers_count || 0,
        pushed_at: x.pushed_at,
        created_at: x.created_at,
        archived: !!x.archived
      }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ user: USER, repos });
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(500).json({ error: 'Internal error', message: e.message });
  }
}
