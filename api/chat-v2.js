import cvContent from '../cv-content.json';

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  // CORS base
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, language = 'en' } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    const langNames = {
      it: 'italiano',
      en: 'inglese',
      sv: 'svedese',
    };

    const detectedLang = langNames[language] ? language : 'en';

    const userMessage = messages[messages.length - 1]?.content || '';
    const userMessageLower = userMessage.toLowerCase();

    const keywords = userMessageLower
      .split(/\W+/)
      .filter((w) => w.length > 3);

    const scoredChunks = cvContent.map((chunk) => {
      const combinedText = [
        chunk.title,
        chunk.text_it,
        chunk.text_en,
        chunk.text_sv,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      let score = 0;
      keywords.forEach((keyword) => {
        const count =
          (combinedText.match(new RegExp(keyword, 'g')) || []).length;
        score += count;
      });

      return { ...chunk, score };
    });

    scoredChunks.sort((a, b) => b.score - a.score);

    let relevantChunks = scoredChunks.filter((c) => c.score > 0).slice(0, 6);

    if (relevantChunks.length === 0) {
      relevantChunks = scoredChunks.slice(0, 6);
    }

    const alwaysIncludeIds = [1, 2, 3, 6];
    const existingIds = new Set(relevantChunks.map((c) => c.id));
    alwaysIncludeIds.forEach((id) => {
      if (!existingIds.has(id)) {
        const found = cvContent.find((c) => c.id === id);
        if (found) {
          relevantChunks.push(found);
          existingIds.add(id);
        }
      }
    });

    if (relevantChunks.length > 8) {
      relevantChunks = relevantChunks.slice(0, 8);
    }

    const langFieldMap = {
      it: 'text_it',
      en: 'text_en',
      sv: 'text_sv',
    };
    const langField = langFieldMap[detectedLang] || 'text_en';

    const context = relevantChunks
      .map((c) => {
        const mainText = c[langField] || c.text_en || c.text_it || '';
        return `### ${c.title}\n${mainText}`;
      })
      .join('\n\n');

    const langLabel = langNames[detectedLang];
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return res
        .status(500)
        .json({ error: 'Missing GROQ_API_KEY configuration' });
    }

    const systemPrompt = `
Sei un assistente AI che risponde a domande sul CV di Pietro Mischi.

LINGUA:
- Rispondi SEMPRE in ${langLabel}. Ignora la lingua della domanda e usa SOLO ${langLabel} per le risposte.

CONTESTO CV:
- Il contesto contiene profilo, esperienze, formazione, competenze, lingue, progetti, volontariato e interessi.

STILE DI RISPOSTA:
- Risposte molto brevi e dirette: massimo 2–3 frasi.
- Vai dritto al punto.

REGOLE DI RISPOSTA:
1. Usa principalmente le informazioni presenti nel contesto CV e non inventare fatti in contrasto con esso.
2. Collega sempre la risposta a sezioni rilevanti del CV.

CONTESTO CV:

${context}
    `.trim();

    const requestBody = {
      model: 'llama-3.1-8b-instant', // modello alternativo più leggero
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages.slice(-8).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.3,
      max_tokens: 200,
      top_p: 0.9,
      stream: false,
    };

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error (v2):', errorText);
      return res.status(500).json({
        error: 'AI service error',
        details: response.statusText,
      });
    }

    const data = await response.json();
    const answer =
      data.choices?.[0]?.message?.content ||
      'Sorry, I could not generate a response.';

    return res.status(200).json({
      answer,
      language: detectedLang,
    });
  } catch (error) {
    console.error('Handler error (v2):', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
