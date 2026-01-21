import cvContent from '../cv-content.json';

export const maxDuration = 30;

const SYSTEM_LANG_MAP = {
  it: 'Rispondi in italiano.',
  en: 'Answer in English.',
  sv: 'Svara på svenska.'
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, language = 'it' } = req.body || {};
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing messages' });
  }

  const userMsg = messages[messages.length - 1].content.toLowerCase();
  const terms = userMsg.split(/\s+/).filter(w => w.length > 3);

  const chunks = cvContent.filter(c =>
    terms.some(t =>
      c.text.toLowerCase().includes(t) ||
      c.title.toLowerCase().includes(t)
    )
  ).slice(0, 4);

  const context = chunks.length
    ? chunks.map(c => `${c.title}: ${c.text}`).join('\n\n')
    : 'Nessun chunk specifico trovato, rispondi in base al CV generale.';

  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    return res.status(500).json({ error: 'Missing GROQ_API_KEY' });
  }

  const systemLang = SYSTEM_LANG_MAP[language] || SYSTEM_LANG_MAP.it;

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'Sei un assistente che risponde a domande sul CV di Pietro Mischi. ' +
          'Usa solo le informazioni fornite nel contesto.' + ' ' + systemLang
      },
      {
        role: 'system',
        content: `Contesto CV:\n${context}`
      },
      ...messages.slice(-10)
    ],
    stream: true
  };

  // (resto della function uguale: fetch a Groq, parsing streaming, res.write, res.end)
}
