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
    const lang = langNames[language] ? language : 'en';
    const langLabel = langNames[lang];

    // Ultimo messaggio utente
    const userMessage = messages[messages.length - 1]?.content || '';
    const userMessageLower = userMessage.toLowerCase();

    // Keyword dal messaggio
    const keywords = userMessageLower
      .split(/\W+/)
      .filter(w => w.length > 3);

    // Scoring dei chunk del CV
    const scoredChunks = cvContent.map(chunk => {
      const chunkText = `${chunk.title} ${chunk.text}`.toLowerCase();
      let score = 0;
      keywords.forEach(keyword => {
        const count = (chunkText.match(new RegExp(keyword, 'g')) || []).length;
        score += count;
      });
      return { ...chunk, score };
    });

    scoredChunks.sort((a, b) => b.score - a.score);

    // 1) chunk rilevanti per keyword
    let relevantChunks = scoredChunks.filter(c => c.score > 0).slice(0, 5);

    // 2) fallback se nessun match
    if (relevantChunks.length === 0) {
      relevantChunks = scoredChunks.slice(0, 5);
    }

    // 3) aggiungi SEMPRE profilo (1) + formazione (2,3)
    const alwaysIncludeIds = [1, 2, 3];
    const existingIds = new Set(relevantChunks.map(c => c.id));
    alwaysIncludeIds.forEach(id => {
      if (!existingIds.has(id)) {
        const found = cvContent.find(c => c.id === id);
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

    const context = relevantChunks
      .map(c => `### ${c.title}\n${c.text}`)
      .join('\n\n');

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY configuration' });
    }

    const systemPrompt = `
Sei un assistente AI che risponde a domande sul CV di Pietro Mischi.

LINGUA:
- Rispondi SEMPRE in ${langLabel}. Ignora la lingua della domanda e usa SOLO ${langLabel} per le risposte.

CONTESTO CV:
- Il contesto qui sotto contiene il profilo, le ESPERIENZE LAVORATIVE (incluso BDO Italia e Tether Holdings), la formazione accademica (Master e Laurea), le competenze tecniche e finanziarie, i progetti accademici, le lingue, gli interessi e i dettagli personali di Pietro.
- Tutte le informazioni necessarie sulle sue ESPERIENZE, COMPETENZE e PERCORSO DI STUDI sono presenti qui sotto. Non dire mai che il CV non menziona esperienze, ruoli o livello di istruzione: leggi attentamente i blocchi e usa ciò che trovi.

ISTRUZIONI SULLO STILE:
1. Rispondi in modo diretto e specifico alla domanda, evitando descrizioni generiche del CV.
2. Usa 2–5 frasi focalizzate sui dettagli più rilevanti (ruoli, responsabilità, risultati, strumenti, corsi chiave).
3. Non copiare interi paragrafi del CV: sintetizza e collega le informazioni alla domanda.
4. Metti in evidenza esperienze e risultati misurabili quando possibile (es. numero di clienti, grandezza del portafoglio, durata, livello di studi).

DOMANDE SUGGERITE:
Dopo la risposta principale, genera anche 2–3 domande successive che l'utente potrebbe voler fare, in ${langLabel}, nello stesso contesto del CV.
- Le domande devono essere brevi e mirate (es. chiedere approfondimenti su skill, ruoli, progetti).
- Restituisci le domande ESCLUSIVAMENTE in un array JSON sulla riga finale, nel formato:

SUGGESTED_QUESTIONS_JSON: ["Domanda 1", "Domanda 2", "Domanda 3"]

Non aggiungere testo dopo questa riga e non mettere commenti: solo l'array JSON dopo i due punti.

CONTESTO CV (in italiano):
${context}
`.trim();

    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages.slice(-8).map(m => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.3,
      max_tokens: 900,
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
    const full = data.choices?.[0]?.message?.content || '';

    // Separazione risposta / JSON domande suggerite
    let answer = full;
    let suggestedQuestions = [];

    const marker = 'SUGGESTED_QUESTIONS_JSON:';
    const idx = full.lastIndexOf(marker);
    if (idx !== -1) {
      answer = full.slice(0, idx).trim();
      const jsonPart = full.slice(idx + marker.length).trim();
      try {
        const parsed = JSON.parse(jsonPart);
        if (Array.isArray(parsed)) {
          suggestedQuestions = parsed.filter(
            q => typeof q === 'string' && q.trim().length > 0
          );
        }
      } catch (e) {
        console.error('Failed to parse suggested questions JSON:', e);
      }
    }

    return res.status(200).json({
      answer,
      language: lang,
      suggestedQuestions,
    });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
