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
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Ultimo messaggio utente
    const userMessage = messages[messages.length - 1]?.content || '';
    const userMessageLower = userMessage.toLowerCase();

    // Rilevamento lingua molto semplice (per output)
    let detectedLang = 'en';
    const italianPatterns = [
      /\b(ciao|salve|buongiorno|buonasera|grazie|prego|come|cosa|dove|quando|perché|chi|quale|esperienza|competenze|progetti|università|laurea|master|bancaria|finanziaria)\b/i,
    ];
    const swedishPatterns = [
      /\b(hej|tack|vad|hur|var|när|varför|vem|erfarenhet|kompetens|projekt|universitet|banking|finans)\b/i,
    ];
    if (italianPatterns.some(p => p.test(userMessage))) {
      detectedLang = 'it';
    } else if (swedishPatterns.some(p => p.test(userMessage))) {
      detectedLang = 'sv';
    }

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

    // Chunk rilevanti o fallback
    let relevantChunks = scoredChunks.filter(c => c.score > 0).slice(0, 6);
    if (relevantChunks.length === 0) {
      relevantChunks = scoredChunks.slice(0, 8);
    }

    const context = relevantChunks
      .map(c => `### ${c.title}\n${c.text}`)
      .join('\n\n');

    const langNames = {
      it: 'italiano',
      en: 'inglese',
      sv: 'svedese',
    };

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY configuration' });
    }

    const systemPrompt = `
Sei un assistente AI che risponde a domande sul CV di Pietro Mischi.

LINGUA:
- Rispondi SEMPRE in ${langNames[detectedLang]} perché l'utente sta scrivendo in ${langNames[detectedLang]}.

CONTESTO CV:
- Il contesto qui sotto contiene il profilo, le ESPERIENZE LAVORATIVE (incluso BDO Italia e Tether Holdings), le competenze tecniche e finanziarie, i progetti accademici, le lingue, gli interessi e i dettagli personali di Pietro.
- Tutte le informazioni necessarie sulle sue ESPERIENZE e COMPETENZE sono presenti qui sotto. Non dire mai che il CV non menziona esperienze o ruoli: leggi attentamente i blocchi e usa ciò che trovi.

REGOLE DI RISPOSTA:
1. Usa SOLO le informazioni presenti nel contesto CV che ti viene fornito qui sotto. Non inventare fatti nuovi.
2. Se una domanda riguarda un dettaglio NON esplicitamente menzionato, dillo chiaramente ma collega comunque la risposta a ciò che è presente nel contesto (es. tipo di ruoli, competenze, corsi).
3. Dai risposte professionali, chiare e sintetiche, come in un colloquio o mail di presentazione.
4. Metti in evidenza esperienze rilevanti (BDO Italia, audit di istituzioni finanziarie, Tether Holdings, competenze quantitative, ecc.) quando rispondi a domande su esperienza e skill.
5. Non ripetere frasi come "il contesto non menziona..." se nel contesto ci sono informazioni collegabili alla domanda.

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
      max_tokens: 800,
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
      detectedLang,
    });
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
