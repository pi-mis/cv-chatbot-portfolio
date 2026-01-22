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

    // Lingua dal selettore
    const langNames = {
      it: 'italiano',
      en: 'inglese',
      sv: 'svedese',
    };

    const detectedLang = langNames[language] ? language : 'en';

    // Ultimo messaggio utente
    const userMessage = messages[messages.length - 1]?.content || '';
    const userMessageLower = userMessage.toLowerCase();

    // Keyword dal messaggio
    const keywords = userMessageLower
      .split(/\W+/)
      .filter((w) => w.length > 3);

    // Costruisci testo combinato per lo scoring (tutte le lingue)
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

    // 1) chunk rilevanti per keyword
    let relevantChunks = scoredChunks.filter((c) => c.score > 0).slice(0, 6);

    // 2) fallback se nessun match
    if (relevantChunks.length === 0) {
      relevantChunks = scoredChunks.slice(0, 6);
    }

    // 3) assicurati di includere sempre profilo + formazione + lingue
    const alwaysIncludeIds = [1, 2, 3, 5];
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

    // 4) limita a massimo 8 chunk
    if (relevantChunks.length > 8) {
      relevantChunks = relevantChunks.slice(0, 8);
    }

    // scegli il campo lingua da usare per il context principale
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
- Il contesto contiene profilo, esperienze lavorative (BDO Italia, Tether, ecc.), formazione, competenze, lingue e interessi, in italiano, inglese e svedese.

STILE DI RISPOSTA:
- Risposte molto brevi e dirette: massimo 2–3 frasi.
- Vai dritto al punto, senza frasi motivazionali.
- Cita ruoli, risultati o progetti specifici solo se servono a rispondere meglio.

REGOLE DI RISPOSTA:
1. Usa principalmente le informazioni presenti nel contesto CV e non inventare fatti in contrasto con esso.
2. Se la domanda è formulata in modo diverso dal testo del CV o in un'altra lingua, collega la domanda alla sezione più vicina (es. lingue, formazione, esperienze) e dai comunque una risposta sintetica.
3. Mantieni un tono professionale ma naturale, come in un breve scambio con un recruiter.

CONTESTO CV:

${context}
    `.trim();

    const requestBody = {
      model: 'llama-3.3-70b-versatile',
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
      max_tokens: 250,
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
      console.error('Groq API error:', errorText);
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
    console.error('Handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
