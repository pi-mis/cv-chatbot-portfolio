// Testi del sito in italiano, inglese e svedese.
// Per modificare un testo basta cambiarlo qui: la struttura è la stessa per tutte e tre le lingue.

window.SITE_TEXT = {
  en: {
    nav: { chat: 'AI twin', journey: 'Journey', projects: 'Projects', game: 'Game', life: 'Off the desk', contact: 'Contact' },
    hero: {
      lead: 'I study finance in Stockholm and build the models I study.',
      sub: 'MSc Banking & Finance at Stockholm University. Former auditor of financial institutions at BDO Italia. Now working on volatility, trading strategies and AI tools.',
      ctaChat: 'Ask my AI twin',
      ctaGame: 'Play Carry & Crash',
      curveTitle: 'Shape a volatility curve',
      curveNote: 'The Nelson-Siegel model is usually fitted to interest rates. In my research I fit it to implied volatility. Move the three factors and see which market you create.',
      level: 'Level', slope: 'Slope', curvature: 'Curvature', decay: 'Decay',
      presetCalm: 'Calm market', presetStress: 'Stress', presetHump: 'Humped',
      contango: 'Contango: short-dated vol sits below long-dated vol. Markets are calm and short volatility earns carry.',
      backwardation: 'Backwardation: short-dated vol is above long-dated vol. Something just happened.',
      flat: 'Flat: the market is undecided. This is where signals get interesting.',
      axisX: 'Maturity (months)', axisY: 'Implied vol (%)',
      askCurve: 'Ask how I use this',
      askCurveQ: 'How do you use the Nelson-Siegel model on implied volatility?'
    },
    chat: {
      title: 'Ask my AI twin',
      intro: 'It answers from my CV in Italian, English and Swedish. Short answers, grounded in my real background.',
      placeholder: 'Ask something about my profile...',
      send: 'Send', hint: 'Enter ↵', reset: 'Reset chat',
      resetConfirm: 'Do you really want to reset the conversation?',
      metaTips: 'Tips: ask about my BDO experience, my Master in Stockholm, or the things I have built.',
      disclaimer: 'AI-generated answers. They may contain inaccuracies.',
      thinking: 'Thinking',
      suggestions: [
        'Tell me about your experience at BDO.',
        'What have you built recently?',
        'Explain your volatility strategy in simple terms.',
        'Why did you choose the Master in Stockholm?'
      ]
    },
    journey: {
      title: 'Journey',
      intro: 'Pick a year.',
      ask: 'Ask the twin about this',
      items: [
        { year: '2016', title: 'Liceo Scientifico G. Cardano, Milan', body: 'Scientific high school. The years where I met most of my closest friends.', q: 'What was your high school experience like?' },
        { year: '2021', title: 'BSc Economics, Organizations and Markets', body: 'Università Cattolica, Milan. Quantitative methods track. Thesis: Fintech Revolution, on digital technology in finance.', q: 'Tell me about your bachelor and your thesis.' },
        { year: '2024', title: 'BDO Italia, Audit & Assurance Financial Services', body: 'Audits of 20+ banks, funds, SGRs, SIMs and insurers. Core audit team on Tether Holdings, a $143bn portfolio, for Q1 and Q2 2025.', q: 'Tell me about your experience at BDO and the Tether audit.' },
        { year: '2025', title: 'Stockholm University, MSc Banking and Finance', body: 'Moved to Sweden. Asset pricing, derivatives, fixed income, risk. That summer: a Bitcoin fee study and volunteering with Legambiente.', q: 'Why did you choose the Master in Stockholm?' },
        { year: '2026', title: 'Building while studying', body: 'KTH courses on top of the master\u2019s at a 150% pace, Nelson-Siegel volatility research, the Stockholm Marathon in May and the Lovable & Drivhuset Buildathon in September.', q: 'What are you working on in 2026?' },
        { year: '2027', title: 'Next', body: 'Graduating in 2027. Open to internships now and graduate roles from summer 2027, in Stockholm or across Europe.', q: 'What kind of role are you looking for?' }
      ]
    },
    projects: {
      title: 'Things I have built',
      intro: 'Research that became code, and code that became tools. Open one to see how it works.',
      filters: { all: 'All', quant: 'Quant research', product: 'AI & product' },
      ask: 'Ask the twin', stack: 'Built with',
      items: {
        ns: { name: 'Nelson-Siegel on implied volatility', line: 'A yield-curve model applied to the VIX term structure, turned into an S&P 500 backtest.', body: 'Level, slope and curvature are estimated on VIX term-structure indices, forecast with ARIMA in a walk-forward setup, and used to allocate between SVXY, VXX and SPY. Written up as a paper; code in its own GitHub repo.', q: 'Explain your Nelson-Siegel volatility strategy.' },
        twin: { name: 'This AI twin', line: 'A CV you can talk to, in three languages.', body: 'Vercel serverless functions match each question to the closest sections of my CV and send them to an open-weight model via Groq, so answers stay grounded.', q: 'How did you build this AI twin?' },
        brightwood: { name: 'Brightwood go-to-market tool', line: 'Bringing an Italian LED-wood startup to Scandinavia.', body: 'Brightwood, co-founded by my father, sells LED-illuminated wood panels to furniture, architecture and design companies. I built a Lovable tool to find and onboard partners and clients in the Nordics.', q: 'What are you doing for Brightwood in Scandinavia?' },
        vintage: { name: 'Vintage shop app', line: 'Helping a family-run vintage clothing shop sell more.', body: 'Built with Lovable to help the shop sell more and stay organised.', q: 'Tell me about the app you built for the vintage shop.' },
        btc: { name: 'Bitcoin transaction fees', line: 'Volatility clustering in 70 days of on-chain data.', body: 'GARCH, regime-switching and long-memory models. 74.6% directional accuracy and 23\u201343% cost savings from timing transactions.', q: 'Tell me about your Bitcoin transaction fees project.' },
        energy: { name: 'Energy transition equities', line: 'IEA scenarios meet bottom-up equity research.', body: 'Company-level metrics (growth, EBITDA margins, ROE, leverage, capex intensity) screened against the IEA World Energy Outlook 2025 scenarios, with a portfolio allocation framework on top.', q: 'Tell me about your energy transition equities project.' },
        micro: { name: 'Market microstructure lab', line: 'Spreads and depth from a week of tick data.', body: 'Cleaning Korean exchange trade and quote data in R, excluding auctions, and measuring quoted, effective and tick spreads and order-book depth.', q: 'What did you learn from your market microstructure work?' }
      }
    },
    game: {
      title: 'Carry & Crash',
      intro: 'You run a small volatility book. Calm markets pay you for being short volatility. Spikes take it back fast. Read the term structure and switch before the crash.',
      rules: '120 trading days, about a minute. Keys: 1 short vol, 2 cash, 3 long vol, space to pause.',
      short: 'Short vol', cash: 'Cash', long: 'Long vol',
      start: 'Start trading', pause: 'Pause', resume: 'Resume', again: 'Play again',
      day: 'Day', book: 'Your book', bench: 'Holding short vol',
      signal: 'Term structure today',
      sigCalm: 'Contango', sigWarn: 'Flattening', sigStress: 'Backwardation',
      spike: 'Volatility spike', calmBack: 'Markets calm down',
      finalBook: 'Final book', ret: 'Return', dd: 'Max drawdown', best: 'Best',
      beat: 'You beat holding short vol by', lag: 'You trailed holding short vol by',
      pts: 'pts',
      lesson: 'In my real strategy the signal is the Nelson-Siegel slope factor, forecast with ARIMA.',
      askReal: 'Ask the twin about the real strategy',
      askRealQ: 'How does your real volatility strategy decide between SVXY, VXX and SPY?'
    },
    life: {
      title: 'Off the desk',
      ask: 'Ask the twin',
      items: [
        { k: 'run', title: 'Stockholm Marathon', body: 'Finished in May 2026. I run regularly.', q: 'Tell me about your running and the Stockholm Marathon.' },
        { k: 'alps', title: 'The Alps', body: 'Skiing in Italy, France and Switzerland, and years of downhill and enduro in summer.', q: 'What sports have you done?' },
        { k: 'vinyl', title: 'Vinyl and valves', body: 'All genres. The dream: a proper vinyl setup with valve amplification.', q: 'What music do you listen to?' },
        { k: 'books', title: 'On the shelf', body: 'Arcadia, The (Mis)Behaviour of Markets, Gödel, Escher, Bach.', q: 'What books have you read recently and why?' },
        { k: 'lang', title: 'Languages', body: 'Italian native, English C1 (IELTS 7.5), French B1, Swedish in progress.', q: 'What languages do you speak?' }
      ]
    },
    contact: {
      title: 'Let\u2019s talk',
      body: 'Email or LinkedIn is the fastest way to reach me.',
      copy: 'Copy email', copied: 'Email copied'
    },
    footer: 'Built by Pietro with plain JavaScript, Vercel serverless functions and Groq.'
  },

  it: {
    nav: { chat: 'Gemello AI', journey: 'Percorso', projects: 'Progetti', game: 'Gioco', life: 'Fuori ufficio', contact: 'Contatti' },
    hero: {
      lead: 'Studio finanza a Stoccolma e costruisco i modelli che studio.',
      sub: 'MSc Banking & Finance alla Stockholm University. Ex revisore di istituzioni finanziarie in BDO Italia. Ora lavoro su volatilità, strategie di trading e strumenti AI.',
      ctaChat: 'Chiedi al mio gemello AI',
      ctaGame: 'Gioca a Carry & Crash',
      curveTitle: 'Disegna una curva di volatilità',
      curveNote: 'Il modello Nelson-Siegel di solito si usa sui tassi. Nella mia ricerca lo applico alla volatilità implicita. Muovi i tre fattori e guarda che mercato ottieni.',
      level: 'Livello', slope: 'Pendenza', curvature: 'Curvatura', decay: 'Decadimento',
      presetCalm: 'Mercato calmo', presetStress: 'Stress', presetHump: 'Gobba',
      contango: 'Contango: la volatilità a breve è sotto quella a lungo. Il mercato è calmo e chi è short volatility incassa il carry.',
      backwardation: 'Backwardation: la volatilità a breve supera quella a lungo. È appena successo qualcosa.',
      flat: 'Piatta: il mercato è indeciso. È qui che i segnali diventano interessanti.',
      axisX: 'Scadenza (mesi)', axisY: 'Vol implicita (%)',
      askCurve: 'Chiedi come la uso',
      askCurveQ: 'Come usi il modello Nelson-Siegel sulla volatilità implicita?'
    },
    chat: {
      title: 'Chiedi al mio gemello AI',
      intro: 'Risponde partendo dal mio CV, in italiano, inglese e svedese. Risposte brevi e ancorate al mio vero percorso.',
      placeholder: 'Chiedi qualcosa sul mio profilo...',
      send: 'Invia', hint: 'Invio ↵', reset: 'Resetta chat',
      resetConfirm: 'Vuoi davvero resettare la conversazione?',
      metaTips: 'Suggerimenti: chiedi delle esperienze in BDO, del Master a Stoccolma o delle cose che ho costruito.',
      disclaimer: 'Risposte generate con AI. Potrebbero contenere imprecisioni.',
      thinking: 'Sto pensando',
      suggestions: [
        'Raccontami qualcosa sulla tua esperienza in BDO.',
        'Cosa hai costruito di recente?',
        'Spiegami la tua strategia sulla volatilità in parole semplici.',
        'Perché hai scelto il Master a Stoccolma?'
      ]
    },
    journey: {
      title: 'Percorso',
      intro: 'Scegli un anno.',
      ask: 'Chiedi al gemello',
      items: [
        { year: '2016', title: 'Liceo Scientifico G. Cardano, Milano', body: 'Liceo scientifico. Gli anni in cui ho conosciuto gran parte dei miei amici più stretti.', q: 'Com\u2019è stata la tua esperienza al liceo?' },
        { year: '2021', title: 'Laurea in Economia, Organizzazioni e Mercati', body: 'Università Cattolica, Milano. Indirizzo in metodi quantitativi. Tesi: Fintech Revolution, sull\u2019uso della tecnologia digitale in finanza.', q: 'Raccontami della tua laurea triennale e della tesi.' },
        { year: '2024', title: 'BDO Italia, Audit & Assurance Financial Services', body: 'Revisione di oltre 20 tra banche, fondi, SGR, SIM e assicurazioni. Nel team core di revisione di Tether Holdings, un portafoglio da 143 miliardi di dollari, per Q1 e Q2 2025.', q: 'Raccontami della tua esperienza in BDO e della revisione di Tether.' },
        { year: '2025', title: 'Stockholm University, MSc Banking and Finance', body: 'Trasferimento in Svezia. Asset pricing, derivati, fixed income, rischio. In estate: uno studio sulle fee di Bitcoin e volontariato con Legambiente.', q: 'Perché hai scelto il Master a Stoccolma?' },
        { year: '2026', title: 'Costruire mentre studio', body: 'Corsi al KTH oltre al master, a un ritmo del 150%, ricerca Nelson-Siegel sulla volatilità, la Maratona di Stoccolma a maggio e il Lovable & Drivhuset Buildathon a settembre.', q: 'Su cosa stai lavorando nel 2026?' },
        { year: '2027', title: 'Prossimo passo', body: 'Laurea nel 2027. Disponibile per stage da subito e per ruoli graduate dall\u2019estate 2027, a Stoccolma o in Europa.', q: 'Che tipo di ruolo stai cercando?' }
      ]
    },
    projects: {
      title: 'Cose che ho costruito',
      intro: 'Ricerca diventata codice, e codice diventato strumenti. Aprine uno per vedere come funziona.',
      filters: { all: 'Tutti', quant: 'Ricerca quant', product: 'AI e prodotto' },
      ask: 'Chiedi al gemello', stack: 'Costruito con',
      items: {
        ns: { name: 'Nelson-Siegel sulla volatilità implicita', line: 'Un modello per le curve dei tassi applicato alla struttura a termine del VIX, trasformato in un backtest sull\u2019S&P 500.', body: 'Livello, pendenza e curvatura sono stimati sugli indici della struttura a termine del VIX, previsti con ARIMA in walk-forward e usati per allocare tra SVXY, VXX e SPY. Descritto in un paper; il codice è in un repo GitHub dedicato.', q: 'Spiegami la tua strategia di volatilità con Nelson-Siegel.' },
        twin: { name: 'Questo gemello AI', line: 'Un CV con cui parlare, in tre lingue.', body: 'Le funzioni serverless di Vercel abbinano ogni domanda alle sezioni più vicine del mio CV e le inviano a un modello open-weight tramite Groq, così le risposte restano ancorate ai fatti.', q: 'Come hai costruito questo gemello AI?' },
        brightwood: { name: 'Strumento go-to-market per Brightwood', line: 'Portare una startup italiana di legno e LED in Scandinavia.', body: 'Brightwood, co-fondata da mio padre, vende pannelli in legno illuminati a LED ad aziende di arredamento, architettura e design. Ho costruito con Lovable uno strumento per trovare e coinvolgere partner e clienti nei paesi nordici.', q: 'Cosa stai facendo per Brightwood in Scandinavia?' },
        vintage: { name: 'App per un negozio vintage', line: 'Aiutare un negozio vintage di famiglia a vendere di più.', body: 'Costruita con Lovable per aiutare il negozio a vendere di più e a organizzarsi meglio.', q: 'Raccontami dell\u2019app che hai costruito per il negozio vintage.' },
        btc: { name: 'Fee delle transazioni Bitcoin', line: 'Volatility clustering in 70 giorni di dati on-chain.', body: 'Modelli GARCH, regime-switching e long memory. 74,6% di accuratezza direzionale e risparmi del 23\u201343% scegliendo il momento giusto per le transazioni.', q: 'Raccontami del tuo progetto sulle fee delle transazioni Bitcoin.' },
        energy: { name: 'Azioni della transizione energetica', line: 'Gli scenari IEA incontrano l\u2019analisi azionaria bottom-up.', body: 'Metriche aziendali (crescita, margini EBITDA, ROE, leva, intensità di capex) confrontate con gli scenari del World Energy Outlook 2025 dell\u2019IEA, con un framework di allocazione di portafoglio.', q: 'Raccontami del tuo progetto sulle azioni della transizione energetica.' },
        micro: { name: 'Laboratorio di microstruttura', line: 'Spread e profondità da una settimana di dati tick.', body: 'Pulizia in R dei dati di trade e quote della borsa coreana, esclusione delle aste e misura di quoted, effective e tick spread e della profondità del book.', q: 'Cosa hai imparato dal lavoro sulla microstruttura di mercato?' }
      }
    },
    game: {
      title: 'Carry & Crash',
      intro: 'Gestisci un piccolo book di volatilità. I mercati calmi ti pagano per essere short volatility. I picchi si riprendono tutto in fretta. Leggi la struttura a termine e cambia posizione prima del crollo.',
      rules: '120 giorni di trading, circa un minuto. Tasti: 1 short vol, 2 liquidità, 3 long vol, spazio per mettere in pausa.',
      short: 'Short vol', cash: 'Liquidità', long: 'Long vol',
      start: 'Inizia a fare trading', pause: 'Pausa', resume: 'Riprendi', again: 'Gioca ancora',
      day: 'Giorno', book: 'Il tuo book', bench: 'Short vol sempre',
      signal: 'Struttura a termine oggi',
      sigCalm: 'Contango', sigWarn: 'Si appiattisce', sigStress: 'Backwardation',
      spike: 'Picco di volatilità', calmBack: 'I mercati si calmano',
      finalBook: 'Book finale', ret: 'Rendimento', dd: 'Max drawdown', best: 'Record',
      beat: 'Hai battuto lo short vol sempre di', lag: 'Sei rimasto indietro rispetto allo short vol sempre di',
      pts: 'punti',
      lesson: 'Nella mia strategia reale il segnale è il fattore di pendenza Nelson-Siegel, previsto con ARIMA.',
      askReal: 'Chiedi al gemello della strategia reale',
      askRealQ: 'Come decide la tua strategia reale tra SVXY, VXX e SPY?'
    },
    life: {
      title: 'Fuori ufficio',
      ask: 'Chiedi al gemello',
      items: [
        { k: 'run', title: 'Maratona di Stoccolma', body: 'Completata a maggio 2026. Corro regolarmente.', q: 'Raccontami della corsa e della Maratona di Stoccolma.' },
        { k: 'alps', title: 'Le Alpi', body: 'Sci in Italia, Francia e Svizzera, e anni di downhill ed enduro d\u2019estate.', q: 'Che sport hai praticato?' },
        { k: 'vinyl', title: 'Vinili e valvole', body: 'Tutti i generi. Il sogno: un vero impianto per vinili con amplificazione a valvole.', q: 'Che musica ascolti?' },
        { k: 'books', title: 'Sullo scaffale', body: 'Arcadia, The (Mis)Behaviour of Markets, Gödel, Escher, Bach.', q: 'Quali libri hai letto di recente e perché?' },
        { k: 'lang', title: 'Lingue', body: 'Italiano madrelingua, inglese C1 (IELTS 7.5), francese B1, svedese in corso.', q: 'Che lingue parli?' }
      ]
    },
    contact: {
      title: 'Parliamone',
      body: 'Email o LinkedIn sono il modo più rapido per raggiungermi.',
      copy: 'Copia email', copied: 'Email copiata'
    },
    footer: 'Costruito da Pietro con JavaScript puro, funzioni serverless Vercel e Groq.'
  },

  sv: {
    nav: { chat: 'AI-tvilling', journey: 'Resa', projects: 'Projekt', game: 'Spel', life: 'Utanför jobbet', contact: 'Kontakt' },
    hero: {
      lead: 'Jag studerar finans i Stockholm och bygger modellerna jag studerar.',
      sub: 'MSc Banking & Finance vid Stockholms universitet. Tidigare revisor av finansiella institut på BDO Italia. Arbetar nu med volatilitet, handelsstrategier och AI-verktyg.',
      ctaChat: 'Fråga min AI-tvilling',
      ctaGame: 'Spela Carry & Crash',
      curveTitle: 'Forma en volatilitetskurva',
      curveNote: 'Nelson-Siegel-modellen används oftast på räntor. I min forskning använder jag den på implicit volatilitet. Flytta de tre faktorerna och se vilken marknad du skapar.',
      level: 'Nivå', slope: 'Lutning', curvature: 'Krökning', decay: 'Avtagande',
      presetCalm: 'Lugn marknad', presetStress: 'Stress', presetHump: 'Puckel',
      contango: 'Contango: kort volatilitet ligger under lång. Marknaden är lugn och den som är kort volatilitet tjänar carry.',
      backwardation: 'Backwardation: kort volatilitet ligger över lång. Något har just hänt.',
      flat: 'Platt: marknaden är osäker. Det är här signalerna blir intressanta.',
      axisX: 'Löptid (månader)', axisY: 'Implicit vol (%)',
      askCurve: 'Fråga hur jag använder den',
      askCurveQ: 'Hur använder du Nelson-Siegel-modellen på implicit volatilitet?'
    },
    chat: {
      title: 'Fråga min AI-tvilling',
      intro: 'Den svarar utifrån mitt CV på italienska, engelska och svenska. Korta svar som bygger på min verkliga bakgrund.',
      placeholder: 'Fråga något om min profil...',
      send: 'Skicka', hint: 'Enter ↵', reset: 'Återställ chatten',
      resetConfirm: 'Vill du verkligen återställa konversationen?',
      metaTips: 'Tips: fråga om min erfarenhet på BDO, min master i Stockholm eller sakerna jag har byggt.',
      disclaimer: 'Svar genereras av AI och kan innehålla fel.',
      thinking: 'Tänker',
      suggestions: [
        'Berätta om din erfarenhet på BDO.',
        'Vad har du byggt på sistone?',
        'Förklara din volatilitetsstrategi enkelt.',
        'Varför valde du din master i Stockholm?'
      ]
    },
    journey: {
      title: 'Resa',
      intro: 'Välj ett år.',
      ask: 'Fråga tvillingen',
      items: [
        { year: '2016', title: 'Liceo Scientifico G. Cardano, Milano', body: 'Naturvetenskapligt gymnasium. Åren då jag träffade de flesta av mina närmaste vänner.', q: 'Hur var din gymnasietid?' },
        { year: '2021', title: 'Kandidat i ekonomi, organisationer och marknader', body: 'Università Cattolica, Milano. Inriktning mot kvantitativa metoder. Uppsats: Fintech Revolution, om digital teknik inom finans.', q: 'Berätta om din kandidatexamen och uppsats.' },
        { year: '2024', title: 'BDO Italia, Audit & Assurance Financial Services', body: 'Revision av över 20 banker, fonder, SGR, SIM och försäkringsbolag. I kärnteamet för revisionen av Tether Holdings, en portfölj på 143 miljarder dollar, för Q1 och Q2 2025.', q: 'Berätta om din tid på BDO och Tether-revisionen.' },
        { year: '2025', title: 'Stockholms universitet, MSc Banking and Finance', body: 'Flytt till Sverige. Tillgångsprissättning, derivat, räntebärande, risk. Den sommaren: en studie om Bitcoin-avgifter och volontärarbete med Legambiente.', q: 'Varför valde du din master i Stockholm?' },
        { year: '2026', title: 'Bygga medan jag pluggar', body: 'KTH-kurser utöver mastern i 150 % studietakt, Nelson-Siegel-forskning om volatilitet, Stockholm Marathon i maj och Lovable & Drivhuset Buildathon i september.', q: 'Vad arbetar du med under 2026?' },
        { year: '2027', title: 'Nästa steg', body: 'Examen 2027. Öppen för praktik redan nu och för traineeroller från sommaren 2027, i Stockholm eller i Europa.', q: 'Vilken typ av roll söker du?' }
      ]
    },
    projects: {
      title: 'Saker jag har byggt',
      intro: 'Forskning som blev kod, och kod som blev verktyg. Öppna ett för att se hur det fungerar.',
      filters: { all: 'Alla', quant: 'Kvantforskning', product: 'AI och produkt' },
      ask: 'Fråga tvillingen', stack: 'Byggt med',
      items: {
        ns: { name: 'Nelson-Siegel på implicit volatilitet', line: 'En räntekurvsmodell på VIX-terminsstrukturen, omgjord till en backtest på S&P 500.', body: 'Nivå, lutning och krökning skattas på VIX-terminsstrukturens index, prognostiseras med ARIMA i walk-forward och används för att fördela mellan SVXY, VXX och SPY. Beskrivet i en uppsats; koden finns i ett eget GitHub-repo.', q: 'Förklara din Nelson-Siegel-strategi för volatilitet.' },
        twin: { name: 'Den här AI-tvillingen', line: 'Ett CV du kan prata med, på tre språk.', body: 'Vercels serverlösa funktioner matchar varje fråga mot de närmaste delarna av mitt CV och skickar dem till en open-weight-modell via Groq, så att svaren håller sig till fakta.', q: 'Hur byggde du den här AI-tvillingen?' },
        brightwood: { name: 'Go-to-market-verktyg för Brightwood', line: 'Ett italienskt startup i trä och LED på väg till Skandinavien.', body: 'Brightwood, grundat av bland andra min pappa, säljer LED-belysta träpaneler till möbel-, arkitekt- och designföretag. Jag byggde ett verktyg i Lovable för att hitta partner och kunder i Norden.', q: 'Vad gör du för Brightwood i Skandinavien?' },
        vintage: { name: 'App för en vintagebutik', line: 'Hjälper en familjeägd vintageklädbutik att sälja mer.', body: 'Byggd med Lovable för att hjälpa butiken att sälja mer och hålla ordning.', q: 'Berätta om appen du byggde för vintagebutiken.' },
        btc: { name: 'Bitcoin-transaktionsavgifter', line: 'Volatilitetskluster i 70 dagars on-chain-data.', body: 'GARCH-, regimskiftes- och long memory-modeller. 74,6 % träffsäkerhet i riktning och 23\u201343 % lägre kostnader genom att välja rätt tidpunkt.', q: 'Berätta om ditt projekt om Bitcoin-avgifter.' },
        energy: { name: 'Aktier i energiomställningen', line: 'IEA:s scenarier möter aktieanalys nerifrån och upp.', body: 'Bolagsnyckeltal (tillväxt, EBITDA-marginal, ROE, belåning, capex-intensitet) mot scenarierna i IEA:s World Energy Outlook 2025, med ett ramverk för portföljallokering.', q: 'Berätta om ditt projekt om aktier i energiomställningen.' },
        micro: { name: 'Labb i marknadsmikrostruktur', line: 'Spreadar och djup från en veckas tickdata.', body: 'Rensning av avslut och noteringar från den koreanska börsen i R, exkludering av auktioner och mätning av noterade, effektiva och tick-spreadar samt orderbokens djup.', q: 'Vad lärde du dig av arbetet med marknadsmikrostruktur?' }
      }
    },
    game: {
      title: 'Carry & Crash',
      intro: 'Du förvaltar en liten volatilitetsbok. Lugna marknader betalar dig för att vara kort volatilitet. Toppar tar tillbaka allt snabbt. Läs terminsstrukturen och byt position före kraschen.',
      rules: '120 handelsdagar, ungefär en minut. Tangenter: 1 kort vol, 2 kontanter, 3 lång vol, mellanslag för paus.',
      short: 'Kort vol', cash: 'Kontanter', long: 'Lång vol',
      start: 'Börja handla', pause: 'Paus', resume: 'Fortsätt', again: 'Spela igen',
      day: 'Dag', book: 'Din bok', bench: 'Alltid kort vol',
      signal: 'Terminsstrukturen i dag',
      sigCalm: 'Contango', sigWarn: 'Planar ut', sigStress: 'Backwardation',
      spike: 'Volatilitetstopp', calmBack: 'Marknaden lugnar sig',
      finalBook: 'Slutlig bok', ret: 'Avkastning', dd: 'Max drawdown', best: 'Rekord',
      beat: 'Du slog alltid kort vol med', lag: 'Du låg efter alltid kort vol med',
      pts: 'procentenheter',
      lesson: 'I min riktiga strategi är signalen Nelson-Siegels lutningsfaktor, prognostiserad med ARIMA.',
      askReal: 'Fråga tvillingen om den riktiga strategin',
      askRealQ: 'Hur väljer din riktiga strategi mellan SVXY, VXX och SPY?'
    },
    life: {
      title: 'Utanför jobbet',
      ask: 'Fråga tvillingen',
      items: [
        { k: 'run', title: 'Stockholm Marathon', body: 'Genomfört i maj 2026. Jag springer regelbundet.', q: 'Berätta om din löpning och Stockholm Marathon.' },
        { k: 'alps', title: 'Alperna', body: 'Skidåkning i Italien, Frankrike och Schweiz, och många år av downhill och enduro på sommaren.', q: 'Vilka sporter har du utövat?' },
        { k: 'vinyl', title: 'Vinyl och rör', body: 'Alla genrer. Drömmen: en riktig vinylanläggning med rörförstärkare.', q: 'Vilken musik lyssnar du på?' },
        { k: 'books', title: 'I bokhyllan', body: 'Arcadia, The (Mis)Behaviour of Markets, Gödel, Escher, Bach.', q: 'Vilka böcker har du läst nyligen och varför?' },
        { k: 'lang', title: 'Språk', body: 'Italienska som modersmål, engelska C1 (IELTS 7.5), franska B1, svenska på gång.', q: 'Vilka språk talar du?' }
      ]
    },
    contact: {
      title: 'Hör av dig',
      body: 'E-post eller LinkedIn är snabbast.',
      copy: 'Kopiera e-post', copied: 'E-post kopierad'
    },
    footer: 'Byggd av Pietro med ren JavaScript, Vercels serverlösa funktioner och Groq.'
  }
};

// Dati dei progetti indipendenti dalla lingua: tag per i filtri e stack tecnologico.
window.PROJECTS = [
  { id: 'ns', tags: ['quant'], stack: ['Python', 'ARIMA', 'VIX term structure', 'SVXY / VXX / SPY'] },
  { id: 'twin', tags: ['product'], stack: ['Vercel', 'Serverless', 'Groq', 'JavaScript'] },
  { id: 'brightwood', tags: ['product'], stack: ['Lovable'] },
  { id: 'vintage', tags: ['product'], stack: ['Lovable'] },
  { id: 'btc', tags: ['quant'], stack: ['GARCH', 'Regime switching', 'Long memory'] },
  { id: 'energy', tags: ['quant'], stack: ['IEA WEO 2025', 'Equity research', 'Portfolio construction'] },
  { id: 'micro', tags: ['quant'], stack: ['R', 'data.table', 'Tick data'] }
];
