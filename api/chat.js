import cvContent from '../cv-content.json';

export const maxDuration = 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body || {};
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

  const body = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content:
          'Sei un assistente che risponde a domande sul CV di Pietro Mischi. ' +
          'Usa solo le informazioni fornite nel contesto. Rispondi in italiano, ' +
          'in modo chiaro e sintetico.'
      },
      {
        role: 'system',
        content: `Contesto CV:\n${context}`
      },
      ...messages.slice(-10)
    ],
    stream: true
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqApiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok || !response.body) {
    const text = await response.text();
    return res.status(500).send(text);
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');

  const reader = response.body.getReader();
  const encoder = new TextEncoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = new TextDecoder().decode(value);
    // Groq usa server-sent events stile OpenAI
    const lines = chunk.split('\n').filter(line => line.startsWith('data: '));
    for (const line of lines) {
      const data = line.replace('data: ', '').trim();
      if (data === '[DONE]') continue;
      try {
        const json = JSON.parse(data);
        const delta = json.choices?.[0]?.delta?.content || '';
        if (delta) {
          res.write(encoder.encode(delta));
        }
      } catch (e) {
        // ignora chunk non parseable
      }
    }
  }

  res.end();
}
