import cvContent from '../cv-content.json';

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  // CORS
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
      const chunkText = `${chunk.title} ${chunk.text}`.toLowerCase();
      let score = 0;
      keywords.forEach((keyword) => {
        const count = (chunkText.match(new RegExp(keyword, 'g')) || []).length;
        score += count;
      });
      return { ...chunk, score };
    });

    scoredChunks.sort((a, b) => b.score - a.score);

    let relevantChunks = scoredChunks.filter((c) => c.score > 0).slice(0, 5);

    if (relevantChunks.length === 0) {
      relevantChunks = scoredChunks.slice(0, 5);
    }

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

    if (relevantChunks.length > 8) {
      relevantChunks = relevantChunks.slice(0, 8);
    }

    const context = relevantChunks
      .map((c) => `### ${c.title}\n${c.text}`)
      .join('\n\n');

    const langLabel = langNames[detectedLang];
    const groqApiKey = process.env.GROQ_API_KEY;

    if (!groqApiKey) {
      console.error('GROQ_API_KEY not found in environment');
      return res.status(500).json({ error: 'Missing API configuration' });
    }

    const systemPrompt = `Sei un assistente AI che risponde a domande su Pietro Mischi, usando esclusivamente il suo CV esteso e le informazioni aggiuntive.

LINGUA:
- Rispondi SEMPRE in ${langLabel}. Ignora la lingua della domanda e usa SOLO ${langLabel} per le risposte.

CONTESTO CV:
- Il contesto qui sotto contiene il profilo, le ESPERIENZE LAVORATIVE (incluso BDO Italia e Tether Holdings), la formazione accademica (Stockholm University e Università Cattolica), le competenze tecniche e finanziarie, i progetti avanzati (differential equations supply-demand models, analisi sulle Bitcoin transaction fees, energy transition equities), le lingue, le attività di volontariato, gli interessi personali (sport, letture, musica classica) e i dettagli personali di Pietro.

STILE DI RISPOSTA:
- Rispondi in modo breve e diretto: massimo 3–4 frasi per risposta.
- Vai dritto al punto, citando ruoli, risultati, progetti o competenze specifiche dal contesto.
- Usa un tono umano, colloquiale e professionale.
- Quando appropriato, aggiungi un tocco leggero di umorismo, ma solo se non rende la risposta meno chiara.
- Evita frasi troppo generiche, motivazionali o ripetitive.

REGOLE DI RISPOSTA:
1. Usa SOLO le informazioni presenti nel contesto CV qui sotto. Non inventare fatti nuovi.
2. Se una domanda riguarda un dettaglio NON esplicitamente menzionato, collega comunque la risposta a ciò che è presente nel contesto.
3. Metti in evidenza, quando rilevante: i progetti quantitativi, l'esperienza con Tether e DeFi, il volontariato, il profilo linguistico, la capacità di adattamento.
4. Non usare formulazioni del tipo "il contesto non menziona..." se nel contesto ci sono informazioni collegabili.

CONTESTO CV (in italiano):

${context}`;

    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.slice(-8).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.35,
      max_tokens: 600,
      top_p: 0.9,
      stream: false,
    };

    console.log('Calling Groq API...');
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
      console.error('Groq API error:', response.status, errorText);
      return res.status(500).json({
        error: 'AI service error',
        details: response.statusText,
      });
    }

    const data = await response.json();
    console.log('Groq response:', data);

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