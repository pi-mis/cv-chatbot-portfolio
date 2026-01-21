import cvContent from '../cv-content.json';
import { detect } from 'efficient-language-detector-js';

export const maxDuration = 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body || {};
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Missing messages' });
    }

    // Ultimo messaggio dell'utente (per RAG)
    const userMsg = messages[messages.length - 1].content.toLowerCase();

    // Termini chiave (parole > 3 caratteri)
    const terms = userMsg
      .split(/\W+/)
      .filter(w => w.length > 3);

    // RAG keyword-based con scoring semplice
    const scored = cvContent.map(c => {
      const text = (c.title + ' ' + c.text).toLowerCase();
      let score = 0;
      for (const t of terms) {
        if (text.includes(t)) score += 1;
      }
      return { ...c, score };
    });

    scored.sort((a, b) => b.score - a.score);

    let chunks = scored.filter(c => c.score > 0).slice(0, 4);
    if (!chunks.length) {
      // Se nessun match, usa comunque i primi blocchi del CV
      chunks = scored.slice(0, 6);
    }

    const context = chunks
      .map(c => `${c.title}: ${c.text}`)
      .join('\n\n');

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY' });
    }

    // Prima chiamata: risponde usando il contesto del CV
    const body = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'Rispondi SEMPRE nella stessa lingua dell’ULTIMO messaggio dell’utente. ' +
            'Se il messaggio è in inglese, rispondi in inglese; se è in italiano, rispondi in italiano; ' +
            'se è in svedese, rispondi in svedese. ' +
            'Sei un assistente che risponde a domande sul CV di Pietro Mischi usando SOLO il contesto fornito (in italiano).'
        },
        {
          role: 'system',
          content:
            `Contesto CV (in italiano):\n${context}\n\n` +
            'Se qualcosa non è menzionato nel contesto, puoi dirlo esplicitamente, ' +
            'ma cerca sempre di riassumere e collegare le informazioni disponibili.'
        },
        ...messages.slice(-10)
      ],
      stream: false,
      temperature: 0.3
    };

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const text = await response.text();
      return res.status(500).json({ error: 'Groq API error', details: text });
    }

    const json = await response.json();
    let answer = json.choices?.[0]?.message?.content || '';

    // Rilevamento lingua utente vs risposta
    const userText = messages[messages.length - 1].content;
    const userDetection = detect(userText);
    const answerDetection = detect(answer);

    const userLang = userDetection && userDetection.language;
    const ansLang = answerDetection && answerDetection.language;

    // Se le lingue non coincidono, chiedi una riscrittura nella lingua dell’utente
    if (userLang && ansLang && userLang !== ansLang) {
      const fixBody = {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              `Riscrivi il seguente testo nella lingua con codice ISO 639-1 "${userLang}" ` +
              '(mantieni il significato invariato).'
          },
          { role: 'user', content: answer }
        ],
        stream: false,
        temperature: 0
      };

      const fixResp = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqApiKey}`
          },
          body: JSON.stringify(fixBody)
        }
      );

      if (fixResp.ok) {
        const fixJson = await fixResp.json();
        const fixed = fixJson.choices?.[0]?.message?.content;
        if (fixed) {
          answer = fixed;
        }
      }
    }

    return res.status(200).json({ answer });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
