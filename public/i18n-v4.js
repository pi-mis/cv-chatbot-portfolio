// Testi della versione v4 (rifatta con le regole di tasteskill): titoli che nominano la cosa,
// pulsanti con un verbo, solo fatti presi dal CV. Uniti a window.SITE_TEXT come i file precedenti.
(function () {
  const V4 = {
    en: {
      nav: { twin: 'Twin', projects: 'Projects', journey: 'Career', research: 'Research', arcade: 'Arcade' },
      v4: {
        title: 'Pietro Mischi: finance student in Stockholm who builds trading tools',
        h1: 'Finance student who builds trading tools',
        lead: 'MSc Banking and Finance at Stockholm University, finishing in 2027. A year auditing financial institutions at BDO Italia, now writing volatility models and AI tools.',
        ctaMain: 'Ask my AI twin',
        ctaProjects: 'See my projects',
        ctaResearch: 'See my research',
        proof: 'Based in Stockholm. Works in Italian and English, learning Swedish.',
        winTitle: 'BTC Frontline · live order book',
        cardLive: 'Live',
        card1: 'Biggest buy wall',
        card2: 'Biggest sell wall',
        card3: 'Buy vs sell pressure',
        cardFoot: 'Each soldier is a real order on Binance, Kraken or Coinbase, drawn as it trades.',
        twinH: 'An AI twin that answers from my CV.',
        twinM: 'Ask in Italian, English or Swedish.',
        twinList: 'Questions to start with',
        projectsH: 'Projects in quant research and AI',
        projectsM: 'Lines join shared methods.',
        journeyH: 'Career as a price chart.',
        journeyM: 'Each point is a step from my CV. Point at one to read it.',
        statement: 'I build what I study',
        statementSub: 'Volatility models, Bitcoin market data and this AI twin, each written from scratch.',
        researchH: 'Research and presentations.',
        researchM: 'Open them here or download the files.',
        arcadeH: 'Two trading games in the browser.',
        arcadeM: 'One reads the tape, one runs a volatility book.',
        curveH: 'Nelson-Siegel volatility curve.',
        curveM: 'Move its three factors.',
        curveAsk: 'Ask how I use the model',
        faqH: 'Studies, languages and life in Stockholm',
        faq: [
          ['Where are you based?', 'In Stockholm. I study at Stockholm University and take courses at KTH Royal Institute of Technology.'],
          ['Which languages do you work in?', 'Italian is my first language and I work in English (IELTS 7.5). I am learning Swedish: several courses, a language exchange, and I use it every day, though I am not fluent yet.'],
          ['What did you do at BDO Italia?', 'From September 2024 to August 2025 I audited financial institutions, from assistant to expert assistant auditor. On the Tether assurance I worked on two workstreams: checking its subsidiaries and testing on-chain transactions.'],
          ['What do you do outside finance?', 'I ran the Stockholm Marathon in May 2026. I hold a lifeguard licence and volunteered with Legambiente on a school renovation in 2025.']
        ],
        closeH: 'Ask my AI twin',
        closeLine: 'Or write to me by email or on LinkedIn.',
        footLede: 'Finance student in Stockholm who builds trading tools.',
        footSections: 'Sections',
        footContact: 'Contact',
        email: 'Email',
        built: 'Built with plain JavaScript, Vercel functions and Groq.'
      }
    },
    it: {
      nav: { twin: 'Gemello', projects: 'Progetti', journey: 'Percorso', research: 'Ricerche', arcade: 'Giochi' },
      v4: {
        title: 'Pietro Mischi: studente di finanza a Stoccolma che costruisce strumenti di trading',
        h1: 'Studente di finanza che costruisce strumenti di trading',
        lead: 'MSc Banking and Finance alla Stockholm University, fino al 2027. Un anno di revisione di istituzioni finanziarie in BDO Italia, ora scrivo modelli di volatilità e strumenti AI.',
        ctaMain: 'Chiedi al mio gemello AI',
        ctaProjects: 'Guarda i progetti',
        ctaResearch: 'Guarda le ricerche',
        proof: 'Vivo a Stoccolma. Lavoro in italiano e inglese, sto imparando lo svedese.',
        winTitle: 'BTC Frontline · book ordini dal vivo',
        cardLive: 'Live',
        card1: 'Muro in acquisto più grande',
        card2: 'Muro in vendita più grande',
        card3: 'Pressione acquisti vs vendite',
        cardFoot: 'Ogni soldato è un ordine vero su Binance, Kraken o Coinbase, disegnato mentre viene eseguito.',
        twinH: 'Un gemello AI che risponde dal mio CV.',
        twinM: 'Chiedi in italiano, inglese o svedese.',
        twinList: 'Domande per iniziare',
        projectsH: 'Progetti di ricerca quantitativa e AI',
        projectsM: 'Le linee uniscono metodi comuni.',
        journeyH: 'Il percorso come un grafico di prezzo.',
        journeyM: 'Ogni punto è una tappa del CV. Passaci sopra per leggerla.',
        statement: 'Costruisco ciò che studio',
        statementSub: 'Modelli di volatilità, dati di mercato su Bitcoin e questo gemello AI, scritti da zero.',
        researchH: 'Ricerche e presentazioni.',
        researchM: 'Aprili qui o scarica i file.',
        arcadeH: 'Due giochi di trading nel browser.',
        arcadeM: 'Uno legge il nastro, l’altro gestisce un book di volatilità.',
        curveH: 'Curva di volatilità Nelson-Siegel.',
        curveM: 'Muovi i suoi tre fattori.',
        curveAsk: 'Chiedi come uso il modello',
        faqH: 'Studi, lingue e vita a Stoccolma',
        faq: [
          ['Dove vivi?', 'A Stoccolma. Studio alla Stockholm University e seguo corsi al KTH Royal Institute of Technology.'],
          ['In che lingue lavori?', 'L’italiano è la mia lingua madre e lavoro in inglese (IELTS 7.5). Sto imparando lo svedese: diversi corsi, uno scambio linguistico, e lo uso ogni giorno, anche se non sono ancora fluente.'],
          ['Cosa facevi in BDO Italia?', 'Da settembre 2024 ad agosto 2025 ho fatto revisione di istituzioni finanziarie, da assistant a expert assistant auditor. Sull’incarico Tether mi sono occupato di due filoni: la verifica delle controllate e il test delle transazioni on-chain.'],
          ['Cosa fai fuori dalla finanza?', 'A maggio 2026 ho corso la Maratona di Stoccolma. Ho il brevetto da bagnino e nel 2025 ho fatto volontariato con Legambiente nella ristrutturazione di una scuola.']
        ],
        closeH: 'Chiedi al mio gemello AI',
        closeLine: 'Oppure scrivimi per email o su LinkedIn.',
        footLede: 'Studente di finanza a Stoccolma che costruisce strumenti di trading.',
        footSections: 'Sezioni',
        footContact: 'Contatti',
        email: 'Email',
        built: 'Fatto con JavaScript semplice, funzioni Vercel e Groq.'
      }
    },
    sv: {
      nav: { twin: 'Tvilling', projects: 'Projekt', journey: 'Karriär', research: 'Forskning', arcade: 'Spel' },
      v4: {
        title: 'Pietro Mischi: finansstudent i Stockholm som bygger tradingverktyg',
        h1: 'Finansstudent som bygger tradingverktyg',
        lead: 'MSc Banking and Finance vid Stockholms universitet, klar 2027. Ett år som revisor av finansiella institut på BDO Italia, nu skriver jag volatilitetsmodeller och AI-verktyg.',
        ctaMain: 'Fråga min AI-tvilling',
        ctaProjects: 'Se mina projekt',
        ctaResearch: 'Se min forskning',
        proof: 'Bor i Stockholm. Arbetar på italienska och engelska, lär mig svenska.',
        winTitle: 'BTC Frontline · orderbok i realtid',
        cardLive: 'Live',
        card1: 'Största köpvägg',
        card2: 'Största säljvägg',
        card3: 'Köp- mot säljtryck',
        cardFoot: 'Varje soldat är en riktig order på Binance, Kraken eller Coinbase, ritad när den handlas.',
        twinH: 'En AI-tvilling som svarar utifrån mitt CV.',
        twinM: 'Fråga på italienska, engelska eller svenska.',
        twinList: 'Frågor att börja med',
        projectsH: 'Projekt inom kvantitativ forskning och AI',
        projectsM: 'Linjerna förbinder gemensamma metoder.',
        journeyH: 'Karriären som ett kursdiagram.',
        journeyM: 'Varje punkt är ett steg i mitt CV. Peka på en för att läsa den.',
        statement: 'Jag bygger det jag studerar',
        statementSub: 'Volatilitetsmodeller, marknadsdata för Bitcoin och den här AI-tvillingen, skrivna från grunden.',
        researchH: 'Forskning och presentationer.',
        researchM: 'Öppna dem här eller ladda ner filerna.',
        arcadeH: 'Två tradingspel i webbläsaren.',
        arcadeM: 'Ett läser tejpen, ett styr en volatilitetsbok.',
        curveH: 'Nelson-Siegel-kurva för volatilitet.',
        curveM: 'Flytta dess tre faktorer.',
        curveAsk: 'Fråga hur jag använder modellen',
        faqH: 'Studier, språk och livet i Stockholm',
        faq: [
          ['Var bor du?', 'I Stockholm. Jag studerar vid Stockholms universitet och läser kurser på KTH.'],
          ['Vilka språk arbetar du på?', 'Italienska är mitt modersmål och jag arbetar på engelska (IELTS 7.5). Jag lär mig svenska: flera kurser, ett språkutbyte, och jag använder det varje dag, men jag är inte flytande än.'],
          ['Vad gjorde du på BDO Italia?', 'Från september 2024 till augusti 2025 reviderade jag finansiella institut, från assistent till expert assistant auditor. I Tether-uppdraget arbetade jag med två arbetsströmmar: kontroll av dotterbolagen och test av transaktioner on-chain.'],
          ['Vad gör du utanför finansen?', 'Jag sprang Stockholm Marathon i maj 2026. Jag har livräddarcertifikat och var volontär hos Legambiente vid en skolrenovering 2025.']
        ],
        closeH: 'Fråga min AI-tvilling',
        closeLine: 'Eller skriv till mig via e-post eller LinkedIn.',
        footLede: 'Finansstudent i Stockholm som bygger tradingverktyg.',
        footSections: 'Sektioner',
        footContact: 'Kontakt',
        email: 'E-post',
        built: 'Byggd med vanlig JavaScript, Vercel-funktioner och Groq.'
      }
    }
  };
  V4.en.projects = { overviewTitle: 'Project network' };
  V4.it.projects = { overviewTitle: 'Rete dei progetti' };
  V4.sv.projects = { overviewTitle: 'Projektnätverk' };
  const merge = (a, b) => { Object.keys(b).forEach((k) => { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) { a[k] = a[k] || {}; merge(a[k], b[k]); } else a[k] = b[k]; }); };
  Object.keys(V4).forEach((l) => { window.SITE_TEXT[l] = window.SITE_TEXT[l] || {}; merge(window.SITE_TEXT[l], V4[l]); });

  // FAQ e titolo della pagina seguono la lingua
  function renderFaq() {
    const t = window.SITE_TEXT[window.currentLang || 'en'].v4;
    const box = document.getElementById('faqList');
    if (box) {
      box.innerHTML = '';
      t.faq.forEach(([q, a]) => {
        const d = document.createElement('div'); d.className = 'faq__item';
        const h = document.createElement('h3'); h.textContent = q;
        const p = document.createElement('p'); p.textContent = a;
        d.append(h, p); box.appendChild(d);
      });
    }
    document.title = t.title;
  }
  window.addEventListener('langchange', renderFaq);

  // telefono: un solo pulsante che passa alla lingua successiva (IT, EN, SV)
  const cyc = document.getElementById('langCycle');
  if (cyc) {
    const order = ['it', 'en', 'sv'];
    const show = () => { cyc.textContent = (window.currentLang || 'en').toUpperCase(); };
    cyc.addEventListener('click', () => {
      const next = order[(order.indexOf(window.currentLang) + 1) % order.length];
      const b = document.querySelector('.lang [data-lang="' + next + '"]');
      if (b) b.click();
    });
    window.addEventListener('langchange', show); show();
  }
})();
