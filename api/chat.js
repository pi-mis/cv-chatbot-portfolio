import cvContent from '../cv-content.json';

export const config = {
  maxDuration: 30,
};

export default async function handler(req, res) {
  // CORS headers per compatibilità
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

    // Ottieni l'ultimo messaggio utente
    const userMessage = messages[messages.length - 1]?.content || '';
    const userMessageLower = userMessage.toLowerCase();

    // Rilevamento automatico della lingua con pattern migliorati
    let detectedLang = 'en';
    
    // Pattern italiani più robusti
    const italianPatterns = [
      /\b(ciao|salve|buongiorno|buonasera|grazie|prego|come|cosa|dove|quando|perché|chi|quale|esperienza|competenze|progetti|università|laurea|master|bancaria|finanziaria|raccontami|dimmi|parlami|spiegami|descrivimi)\b/i,
      /\b(che|delle|degli|nella|sulla|dalla|alla|agli|negli)\b/i
    ];
    
    // Pattern svedesi
    const swedishPatterns = [
      /\b(hej|tack|vad|hur|var|när|varför|vem|berätta|erfarenhet|kompetens|projekt|universitet|banking|finans)\b/i,
      /\b(om|för|från|till|med|på|av)\b/i
    ];

    // Check per italiano
    if (italianPatterns.some(pattern => pattern.test(userMessage))) {
      detectedLang = 'it';
    }
    // Check per svedese
    else if (swedishPatterns.some(pattern => pattern.test(userMessage))) {
      detectedLang = 'sv';
    }
    // Default inglese

    // RAG: estrai keyword significative (> 3 caratteri)
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

    // Seleziona i chunk più rilevanti
    let relevantChunks = scoredChunks.filter(c => c.score > 0).slice(0, 5);
    
    // Se nessun match, usa i primi chunk generali
    if (relevantChunks.length === 0) {
      relevantChunks = scoredChunks.slice(0, 6);
    }

    const context = relevantChunks
      .map(c => `### ${c.title}\n${c.text}`)
      .join('\n\n');

    // Mappa lingue per system prompt
    const langNames = {
      it: 'italiano',
      en: 'inglese',
      sv: 'svedese'
    };

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      return res.status(500).json({ error: 'Missing GROQ_API_KEY configuration' });
    }

    // System prompt migliorato con rilevamento lingua automatico
    const systemPrompt = `Sei un assistente AI professionale che risponde a domande sul CV di Pietro Mischi.

LINGUA: Rispondi SEMPRE in ${langNames[detectedLang]} perché l'utente sta comunicando in ${langNames[detectedLang]}.

CONTESTO CV (le informazioni sono in italiano, ma tu devi rispondere in ${langNames[detectedLang]}):
${context}

ISTRUZIONI:
1. Rispondi in modo professionale, conciso ma completo
2. Usa SOLO le informazioni presenti nel contesto CV fornito
3. Se qualcosa non è menzionato nel CV, dillo onestamente
4. Enfatizza competenze quantitative, esperienza pratica e risultati concreti
5. Usa un tono professionale ma friendly, come in un colloquio informativo
6. Se appropriato, suggerisci aree di approfondimento correlate
7. RICORDA: rispondi in ${langNames[detectedLang]}, NON in italiano

ESEMPI DI BUONE RISPOSTE:
- Concise ma informative
- Focalizzate su competenze verificabili
- Con esempi concreti quando disponibili
- Professional tone ma accessibile`;

    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages.slice(-8)
      ],
      temperature: 0.4,
      max_tokens: 800,
      top_p: 0.9,
      stream: false
    };

    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${groqApiKey}`
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return res.status(500).json({ 
        error: 'AI service error', 
        details: response.statusText 
      });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    return res.status(200).json({ 
      answer,
      detectedLang
    });

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}