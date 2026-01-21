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

    // Scoring dei chunk del CV
    const scoredChunks = cvContent.map((chunk) => {
      const chunkText = `${chunk.title} ${chunk.text}`.toLowerCase();
      let score = 0;
      keywords.forEach((keyword) => {
        const count = (chunkText.match(new RegExp(keyword, 'g')) || []).length;
        score += count;
      });
      return { ...chunk, score };
    });

    scoredChunks.sort((a, b) => b.score - a.score);

    // 1) chunk rilevanti per keyword
    let relevantChunks = scoredChunks.filter((c) => c.score > 0).slice(0, 5);

    // 2) fallback se nessun match
    if (relevantChunks.length === 0) {
      relevantChunks = scoredChunks.slice(0, 5);
    }

    // 3) aggiungi SEMPRE profilo (1) + formazione (2,3)
    const alwaysIncludeIds = [1, 2, 3];
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

    const context = relevantChunks
      .map((c) => `### ${c.title}\n${c.text}`)
      .join('\n\n');

    const langLabel = langNames[detectedLang];
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      return res
        .status(500)
        .json({ error: 'Missing GROQ_API_KEY configuration' });
    }

    const systemPrompt = `
Sei un assistente AI che risponde a domande sul CV esteso di Pietro Mischi.

LINGUA:
- Rispondi SEMPRE in ${langLabel}. Ignora la lingua della domanda e usa SOLO ${langLabel} per le risposte.

CONTESTO CV:
- Il contesto qui sotto contiene: profilo, esperienze in BDO Italia e Tether, lavori part-time, formazione (Stockholm University e Università Cattolica), competenze tecniche e finanziarie, progetti avanzati (modelli con equazioni differenziali, analisi sulle Bitcoin transaction fees, Global Energy Transition Equities), attività di volontariato (Legambiente), lingue, sport, interessi personali e dettagli biografici.

STILE DI RISPOSTA:
- Rispondi in modo breve e diretto: massimo 2–3 frasi per risposta.
- Vai dritto al punto, citando ruoli, risultati, progetti o competenze specifiche.
- Mantieni un tono umano, chiaro e professionale, evitando giri di parole e frasi motivazionali generiche.

REGOLE DI RISPOSTA:
1. Usa SOLO le informazioni presenti nel contesto CV qui sotto. Non inventare fatti nuovi.
2. Se una domanda riguarda un dettaglio NON esplicitamente menzionato, dillo chiaramente ma collega comunque la risposta a ciò che è presente nel contesto (ruoli, competenze, corsi, progetti, lingue, volontariato, interessi).
3. Metti in evidenza, quando rilevante:
   - i progetti quantitativi (equazioni differenziali, Bitcoin fees, energy transition equities),
   - l'esperienza con Tether e i mercati DeFi/digital assets,
   - il volontariato con Legambiente,
   - il profilo linguistico (italiano madrelingua, inglese C1, svedese in apprendimento, francese B1),
   - la capacità di adattarsi a nuovi paesi e sistemi educativi, e il lato sportivo.
4. Non usare formulazioni del tipo "il contesto non menziona..." se nel contesto ci sono informazioni collegabili alla domanda.

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
        ...messages.slice(-8).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.3,
      max_tokens: 600,
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
