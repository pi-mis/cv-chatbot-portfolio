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
- Il contesto contiene profilo, esperienze lavorative (BDO Italia, Tether, ecc.), formazione, competenze, lingue, progetti, volontariato e interessi, in italiano, inglese e svedese.

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

    // Modello: GPT-OSS 120B (pesi aperti, licenza Apache 2.0, disponibile sul free tier Groq).
    // I vecchi modelli Llama sono stati rimossi: Groq li ha spenti il 16/08/2026.
    // Override senza toccare il codice: env var GROQ_MODEL su Vercel.
    const models = [
      process.env.GROQ_MODEL,
      'openai/gpt-oss-120b', // principale
      'openai/gpt-oss-20b', // fallback più leggero
    ].filter(Boolean);

    let lastError = null;

    for (const model of models) {
      const requestBody = {
        model,
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
        // max_completion_tokens include anche i token di reasoning dei modelli gpt-oss,
        // quindi serve un budget più alto dei vecchi 250 di max_tokens.
        max_completion_tokens: 800,
        top_p: 0.9,
        stream: false,
      };

      // Riduco al minimo il reasoning: qui serve una risposta breve, non una catena di pensiero.
      if (model.startsWith('openai/gpt-oss')) {
        requestBody.reasoning_effort = 'low';
        requestBody.include_reasoning = false;
      } else if (model.startsWith('qwen/')) {
        requestBody.reasoning_effort = 'none';
      }

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
        console.error(`Groq API error (v1, ${model}):`, errorText);
        lastError = {
          status: response.status,
          model,
          body: errorText.slice(0, 300),
        };
        // 400/404 = modello dismesso o non abilitato sull'account: provo il successivo.
        if (response.status === 400 || response.status === 404) continue;
        break;
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content?.trim();

      if (!answer) {
        lastError = { status: 200, model, body: 'empty content' };
        continue;
      }

      return res.status(200).json({
        answer,
        language: detectedLang,
        model,
      });
    }

    return res.status(502).json({
      error: 'AI service error',
      details: lastError,
    });
  } catch (error) {
    console.error('Handler error (v1):', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
