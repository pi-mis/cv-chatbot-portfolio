// Testi per: rete 3D dei progetti, sezione Ricerche, Journey interattivo, intermezzi narrativi.
// Vengono uniti a window.SITE_TEXT (come i18n-extra.js), senza toccare i file precedenti.
(function () {
  const EXTRA = {
    en: {
      chat: { disclaimer: 'AI-generated answers. They may contain inaccuracies. Conversations are saved.' },
      privacy: 'To see how the site is used, I record visits (IP address, approximate location, device, where the link came from, time on the page) and conversations with the AI twin. Email me to have your data deleted.',
      nav: { research: 'Research' },
      projects: {
        intro: 'Research that became code, and code that became tools. Each node is a project; the lines show what they have in common.',
        view3d: '3D network', viewList: 'List',
        hint: 'Drag to rotate. Hover a project to bring it forward.',
        hintTouch: 'Swipe sideways to rotate. Tap a project.',
        overviewTitle: 'A network, not a list',
        overviewBody: 'Each node is a project. Lines connect projects that share a theme or a skill, so you can follow how one idea led to the next.',
        legendQuant: 'Quant research', legendProduct: 'AI & product', legendLine: 'Shared theme',
        connected: 'Connected to', website: 'Open website', github: 'Code on GitHub', open3d: 'Open on this site',
        count: '{n} projects', synced: '{g} synced live from GitHub', syncing: 'Syncing with GitHub…', offline: 'GitHub not reachable right now: showing the last known projects.',
        updated: 'updated {d}', newBadge: 'New', fromGithub: 'From GitHub',
        autoLine: 'A project on my GitHub.', noDesc: 'Details and code are on GitHub.',
        traits: { bitcoin: 'Bitcoin', volatility: 'Volatility', ai: 'AI & LLMs', web: 'Web apps', lovable: 'Lovable', markets: 'Market structure', research: 'Econometrics', energy: 'Energy', viz: '3D & data viz', python: 'Python', startup: 'Go-to-market' },
        items: {
          sinapsi: { name: 'Sinapsi', line: 'A 3D digital brain: ideas and memories as neurons that AI links together.', body: 'Notes, ideas, projects and documents float in 3D as neurons. AI sorts them by topic and draws the synapses between related ones, and a chatbot answers only from your own memory. This section of my site borrows the same idea.', q: 'What is Sinapsi and why are you building it?' },
          dvol: { name: 'BTC DVOL strategy', line: 'A Bitcoin strategy driven by implied volatility.', body: 'A strategy on Bitcoin built around DVOL, the implied-volatility index of Bitcoin options. Code and results are on GitHub.', q: 'Tell me about your Bitcoin DVOL strategy.' },
          websites: { name: 'Startup websites', line: 'Go-to-market, e-commerce and smoke-test landing pages.', body: 'Websites I built to launch and test startup ideas: go-to-market pages, e-commerce and smoke-test landing pages that measure real demand before building the product.', q: 'Tell me about the startup websites you built.' }
        }
      },
      research: {
        title: 'Research & presentations',
        intro: 'Essays, papers and slides from my studies. Open them right here, or download the original files.',
        read: 'Read', slides: 'Slides', download: 'Download', openNew: 'Open in a new tab', close: 'Close',
        pages: '{n} pages', slidesN: '{n} slides', ask: 'Ask the twin about it', keyIdea: 'Key idea',
        types: { pdf: 'PDF', pptx: 'PowerPoint', xlsx: 'Excel', docx: 'Word' },
        viewerNote: 'If the preview does not load on your device, use “Open in a new tab”.'
      },
      journey: {
        title: 'Journey',
        intro: 'My path as a price chart. Hover the line, a dot or a date to read each step.',
        ticker: 'PIETRO MISCHI', exchange: 'Milan → Stockholm', index: 'Career index', ytd: 'YTD',
        consensus: 'Analyst consensus', rating: 'BUY', ratingQ: 'Why should we hire you?',
        target: 'Target', targetLabel: 'Graduation', projection: 'Projection',
        stats: [
          { v: '2016', k: 'Listed since' },
          { v: '2', k: 'Cities' },
          { v: '4', k: 'Languages' },
          { v: '20+', k: 'Institutions audited' }
        ],
        cats: { edu: 'Education', work: 'Work', proj: 'Projects', cert: 'Certifications', life: 'Life' },
        legendHint: 'Click a series to show or hide it.',
        ask: 'Ask the twin about this', prev: 'Previous', next: 'Next', more: 'Read it',
        items: {
          hs: { date: '2016 – 2021', title: 'Liceo Scientifico G. Cardano', org: 'Milan', bullets: ['Scientific high school.', 'The years where I met most of my closest friends.'], q: 'What was your high school experience like?' },
          unicredit: { date: '2019', title: 'UniCredit StartUp Your Life', org: 'UniCredit', bullets: ['Training course on financial literacy and entrepreneurship.'], q: 'When did your interest in finance start?' },
          lifeguard: { date: '2020', title: 'Lifeguard licence', org: 'International Life Saving Federation (FIN)', bullets: ['Certified lifeguard: years of swimming turned into a licence.'], q: 'What sports have you done?' },
          bsc: { date: 'Sep 2021 – Apr 2025', title: 'BSc Economics, Organizations and Markets', org: 'Università Cattolica del Sacro Cuore, Milan', bullets: ['Main track in Quantitative Methods for Economic Sciences.', 'Final grade 99/110.', 'Thesis: “Fintech Revolution: The Use of Digital Technology in Finance”.', 'Econometrics, Mathematics for Financial Applications.'], q: 'Tell me about your bachelor and your thesis.' },
          bloomberg: { date: '2022', title: 'Bloomberg Market Concepts', org: 'Bloomberg', bullets: ['BMC certification, then Bloomberg in research and audit work.'], q: 'Which financial tools do you use?' },
          ielts: { date: '2024', title: 'IELTS 7.5 (C1)', org: 'British Council', bullets: ['Overall band score 7.5, CEFR level C1.'], q: 'What languages do you speak?' },
          bdo: { date: 'Sep 2024 – Aug 2025', title: 'BDO Italia, Audit', org: 'Financial Services & Digital Assets, Milan', bullets: ['Junior Assistant Auditor → Assistant Auditor → Expert Assistant Auditor in 11 months.', 'Financial audits and regulatory reviews for 20+ banks, funds and insurers.', 'NPL analysis and asset monitoring.'], q: 'Tell me about your experience at BDO.' },
          tether: { date: 'Q1 – Q2 2025', title: 'Tether Holdings: a $143bn portfolio', org: 'BDO Italia', bullets: ['Core team on the assurance of the world’s largest digital reserve structure.', 'Responsible for client and subsidiary-related activities.', 'Sample-tested on-chain transactions with blockchain analytics tools.'], q: 'What did you do on the Tether Holdings audit?' },
          legambiente: { date: 'Jul 2025', title: 'Volunteering with Legambiente', org: 'Italy', bullets: ['Renovated a school for students from challenging backgrounds.'], q: 'Tell me about your volunteering.' },
          msc: { date: '2025 – 2027', title: 'MSc Banking and Finance', org: 'Stockholm University', bullets: ['Moved to Sweden to build a career in Scandinavian finance.', 'Asset pricing, derivatives, fixed income, credit and market risk, financial econometrics.'], q: 'Why did you choose the Master in Stockholm?' },
          tandem: { date: 'Since Feb 2026', title: 'Språkstudion Tandem Program', org: 'Stockholm University', bullets: ['Language exchange: I teach Italian and practise Swedish.', 'Swedish courses kurs 1 and 2 (12 ECTS).'], q: 'How is your Swedish going?' },
          vol: { date: 'Spring 2026', title: 'S&P 500 volatility strategy', org: 'GitHub', bullets: ['Multi-factor Implied Spread-Carry Harvesting Index.', 'Nelson-Siegel factors on the VIX term structure, forecast with ARIMA.'], q: 'Explain your volatility strategy in simple terms.' },
          marathon: { date: 'May 2026', title: 'Stockholm Marathon', org: 'Stockholm', bullets: ['42.2 km. The best long position I have held.'], q: 'Tell me about running the Stockholm Marathon.' },
          kth: { date: '2026 – 2027', title: 'KTH Royal Institute of Technology', org: 'Freestanding courses, Stockholm', bullets: ['Energy and Geopolitics (7.5 ECTS).', 'Brand Portfolio Management (6 ECTS).', 'Decision Theory for Professionals (2.5 ECTS).'], q: 'Why are you taking courses at KTH?' },
          builds: { date: 'Sep 2026', title: 'Building in public', org: 'GitHub & Vercel', bullets: ['BTC Frontline: Bitcoin’s order book as a live 3D battle.', 'This AI twin, and startup websites for go-to-market tests.', 'Lovable & Drivhuset Impact Buildathon.'], q: 'What have you built recently?' },
          essay: { date: 'Oct 2026', title: '“The price is the weapon”', org: 'KTH, Energy and Geopolitics', bullets: ['How Europe’s gas market reform turned price into a channel of leverage.'], q: 'What is your essay "The price is the weapon" about?' },
          next: { date: 'Summer 2027', title: 'Graduation and next role', org: 'Stockholm or across Europe', bullets: ['Open to internships now and graduate roles from summer 2027.'], q: 'What kind of role are you looking for?' }
        }
      },
      interludes: {
        twin: { t: '09:00', s: 'Opening bell. Before the numbers, a conversation: ask me anything.' },
        journey: { t: '09:30', s: 'Every position has a history. Here is how this one was built.' },
        projects: { t: '11:00', s: 'Theory compounds only when you ship it. These are the things I built.' },
        research: { t: '13:00', s: 'Some ideas needed an essay, not an app.' },
        game: { t: '15:00', s: 'Enough reading. Your turn to trade.' },
        'curve-lab': { t: '16:30', s: 'After the close: the model behind the games.' },
        life: { t: '17:30', s: 'Market closed. Off the desk.' },
        contact: { t: '18:00', s: 'After hours. Let’s talk.' }
      }
    },

    it: {
      chat: { disclaimer: 'Risposte generate con AI. Potrebbero contenere imprecisioni. Le conversazioni vengono salvate.' },
      privacy: 'Per capire come viene usato il sito registro le visite (indirizzo IP, posizione approssimativa, dispositivo, provenienza del link, tempo sulla pagina) e le conversazioni con il gemello AI. Scrivimi per far cancellare i tuoi dati.',
      nav: { research: 'Ricerche' },
      projects: {
        intro: 'Ricerca diventata codice, e codice diventato strumenti. Ogni nodo è un progetto; le linee mostrano cosa hanno in comune.',
        view3d: 'Rete 3D', viewList: 'Lista',
        hint: 'Trascina per ruotare. Passa sopra un progetto per portarlo in primo piano.',
        hintTouch: 'Scorri di lato per ruotare. Tocca un progetto.',
        overviewTitle: 'Una rete, non una lista',
        overviewBody: 'Ogni nodo è un progetto. Le linee collegano i progetti che condividono un tema o una competenza, così si vede come un’idea ha portato alla successiva.',
        legendQuant: 'Ricerca quant', legendProduct: 'AI e prodotto', legendLine: 'Tema in comune',
        connected: 'Collegato a', website: 'Apri il sito', github: 'Codice su GitHub', open3d: 'Apri su questo sito',
        count: '{n} progetti', synced: '{g} sincronizzati da GitHub', syncing: 'Sincronizzazione con GitHub…', offline: 'GitHub non è raggiungibile ora: mostro gli ultimi progetti noti.',
        updated: 'aggiornato {d}', newBadge: 'Nuovo', fromGithub: 'Da GitHub',
        autoLine: 'Un progetto sul mio GitHub.', noDesc: 'Dettagli e codice sono su GitHub.',
        traits: { bitcoin: 'Bitcoin', volatility: 'Volatilità', ai: 'AI e LLM', web: 'Web app', lovable: 'Lovable', markets: 'Struttura di mercato', research: 'Econometria', energy: 'Energia', viz: '3D e data viz', python: 'Python', startup: 'Go-to-market' },
        items: {
          sinapsi: { name: 'Sinapsi', line: 'Un cervello digitale in 3D: idee e ricordi come neuroni collegati dall’AI.', body: 'Note, idee, progetti e documenti fluttuano in 3D come neuroni. L’AI li ordina per tema e disegna le sinapsi tra quelli collegati, e un chatbot risponde solo a partire dalla tua memoria. Questa sezione del mio sito riprende la stessa idea.', q: 'Che cos’è Sinapsi e perché lo stai costruendo?' },
          dvol: { name: 'Strategia BTC DVOL', line: 'Una strategia su Bitcoin guidata dalla volatilità implicita.', body: 'Una strategia su Bitcoin costruita intorno al DVOL, l’indice di volatilità implicita delle opzioni su Bitcoin. Codice e risultati sono su GitHub.', q: 'Raccontami della tua strategia BTC DVOL.' },
          websites: { name: 'Siti per startup', line: 'Pagine go-to-market, e-commerce e smoke test.', body: 'Siti che ho costruito per lanciare e testare idee di startup: pagine go-to-market, e-commerce e landing page di smoke test che misurano la domanda reale prima di costruire il prodotto.', q: 'Raccontami dei siti per startup che hai costruito.' }
        }
      },
      research: {
        title: 'Ricerche e presentazioni',
        intro: 'Saggi, paper e slide dai miei studi. Aprili qui oppure scarica i file originali.',
        read: 'Leggi', slides: 'Slide', download: 'Scarica', openNew: 'Apri in una nuova scheda', close: 'Chiudi',
        pages: '{n} pagine', slidesN: '{n} slide', ask: 'Chiedi al gemello', keyIdea: 'Idea chiave',
        types: { pdf: 'PDF', pptx: 'PowerPoint', xlsx: 'Excel', docx: 'Word' },
        viewerNote: 'Se l’anteprima non si carica sul tuo dispositivo, usa “Apri in una nuova scheda”.'
      },
      journey: {
        title: 'Percorso',
        intro: 'Il mio percorso come un grafico di prezzo. Passa sulla linea, su un punto o su una data per leggere ogni tappa.',
        ticker: 'PIETRO MISCHI', exchange: 'Milano → Stoccolma', index: 'Indice di carriera', ytd: 'da inizio anno',
        consensus: 'Consenso degli analisti', rating: 'BUY', ratingQ: 'Perché dovremmo assumerti?',
        target: 'Target', targetLabel: 'Laurea', projection: 'Proiezione',
        stats: [
          { v: '2016', k: 'Quotato dal' },
          { v: '2', k: 'Città' },
          { v: '4', k: 'Lingue' },
          { v: '20+', k: 'Istituzioni revisionate' }
        ],
        cats: { edu: 'Formazione', work: 'Lavoro', proj: 'Progetti', cert: 'Certificazioni', life: 'Vita' },
        legendHint: 'Clicca una serie per mostrarla o nasconderla.',
        ask: 'Chiedi al gemello', prev: 'Precedente', next: 'Successiva', more: 'Leggilo',
        items: {
          hs: { date: '2016 – 2021', title: 'Liceo Scientifico G. Cardano', org: 'Milano', bullets: ['Liceo scientifico.', 'Gli anni in cui ho conosciuto gran parte dei miei amici più stretti.'], q: 'Com’è stata la tua esperienza al liceo?' },
          unicredit: { date: '2019', title: 'UniCredit StartUp Your Life', org: 'UniCredit', bullets: ['Corso di formazione su educazione finanziaria e imprenditorialità.'], q: 'Quando è nato il tuo interesse per la finanza?' },
          lifeguard: { date: '2020', title: 'Brevetto di bagnino', org: 'International Life Saving Federation (FIN)', bullets: ['Bagnino certificato: anni di nuoto diventati un brevetto.'], q: 'Che sport hai praticato?' },
          bsc: { date: 'set 2021 – apr 2025', title: 'Laurea in Economia, Organizzazioni e Mercati', org: 'Università Cattolica del Sacro Cuore, Milano', bullets: ['Indirizzo in Metodi quantitativi per le scienze economiche.', 'Voto finale 99/110.', 'Tesi: “Fintech Revolution: The Use of Digital Technology in Finance”.', 'Econometria, Matematica per le applicazioni finanziarie.'], q: 'Raccontami della tua laurea triennale e della tesi.' },
          bloomberg: { date: '2022', title: 'Bloomberg Market Concepts', org: 'Bloomberg', bullets: ['Certificazione BMC, poi Bloomberg nella ricerca e nel lavoro di revisione.'], q: 'Quali strumenti finanziari usi?' },
          ielts: { date: '2024', title: 'IELTS 7.5 (C1)', org: 'British Council', bullets: ['Punteggio complessivo 7.5, livello CEFR C1.'], q: 'Che lingue parli?' },
          bdo: { date: 'set 2024 – ago 2025', title: 'BDO Italia, revisione', org: 'Financial Services & Digital Assets, Milano', bullets: ['Junior Assistant Auditor → Assistant Auditor → Expert Assistant Auditor in 11 mesi.', 'Revisioni contabili e regolamentari per oltre 20 tra banche, fondi e assicurazioni.', 'Analisi degli NPL e monitoraggio degli attivi.'], q: 'Raccontami della tua esperienza in BDO.' },
          tether: { date: 'Q1 – Q2 2025', title: 'Tether Holdings: un portafoglio da 143 mld $', org: 'BDO Italia', bullets: ['Nel team core dell’assurance della più grande struttura di riserve digitali al mondo.', 'Responsabile delle attività relative a clienti e controllate.', 'Test a campione delle transazioni on-chain con strumenti di analisi blockchain.'], q: 'Cosa hai fatto nella revisione di Tether Holdings?' },
          legambiente: { date: 'lug 2025', title: 'Volontariato con Legambiente', org: 'Italia', bullets: ['Ristrutturazione di una scuola per studenti con situazioni difficili.'], q: 'Raccontami del tuo volontariato.' },
          msc: { date: '2025 – 2027', title: 'MSc Banking and Finance', org: 'Stockholm University', bullets: ['Trasferimento in Svezia per costruire una carriera nella finanza scandinava.', 'Asset pricing, derivati, fixed income, rischio di credito e di mercato, econometria finanziaria.'], q: 'Perché hai scelto il Master a Stoccolma?' },
          tandem: { date: 'da feb 2026', title: 'Språkstudion Tandem Program', org: 'Stockholm University', bullets: ['Scambio linguistico: insegno italiano e pratico lo svedese.', 'Corsi di svedese kurs 1 e 2 (12 ECTS).'], q: 'Come va con lo svedese?' },
          vol: { date: 'primavera 2026', title: 'Strategia sulla volatilità dell’S&P 500', org: 'GitHub', bullets: ['Multi-factor Implied Spread-Carry Harvesting Index.', 'Fattori Nelson-Siegel sulla struttura a termine del VIX, previsti con ARIMA.'], q: 'Spiegami la tua strategia sulla volatilità in parole semplici.' },
          marathon: { date: 'mag 2026', title: 'Maratona di Stoccolma', org: 'Stoccolma', bullets: ['42,2 km. La posizione long più lunga che abbia mai tenuto.'], q: 'Raccontami della Maratona di Stoccolma.' },
          kth: { date: '2026 – 2027', title: 'KTH Royal Institute of Technology', org: 'Corsi singoli, Stoccolma', bullets: ['Energy and Geopolitics (7,5 ECTS).', 'Brand Portfolio Management (6 ECTS).', 'Decision Theory for Professionals (2,5 ECTS).'], q: 'Perché segui corsi al KTH?' },
          builds: { date: 'set 2026', title: 'Costruire in pubblico', org: 'GitHub e Vercel', bullets: ['BTC Frontline: il book di Bitcoin come una battaglia 3D dal vivo.', 'Questo gemello AI e siti per testare idee di startup.', 'Lovable & Drivhuset Impact Buildathon.'], q: 'Cosa hai costruito di recente?' },
          essay: { date: 'ott 2026', title: '“The price is the weapon”', org: 'KTH, Energy and Geopolitics', bullets: ['Come la riforma del mercato europeo del gas ha trasformato il prezzo in uno strumento di pressione.'], q: 'Di cosa parla il tuo saggio "The price is the weapon"?' },
          next: { date: 'estate 2027', title: 'Laurea e prossimo ruolo', org: 'Stoccolma o in Europa', bullets: ['Disponibile per stage da subito e per ruoli graduate dall’estate 2027.'], q: 'Che tipo di ruolo stai cercando?' }
        }
      },
      interludes: {
        twin: { t: '09:00', s: 'Campanella d’apertura. Prima dei numeri, una conversazione: chiedimi quello che vuoi.' },
        journey: { t: '09:30', s: 'Ogni posizione ha una storia. Ecco come è stata costruita questa.' },
        projects: { t: '11:00', s: 'La teoria rende solo quando la metti in pratica. Ecco le cose che ho costruito.' },
        research: { t: '13:00', s: 'Alcune idee avevano bisogno di un saggio, non di un’app.' },
        game: { t: '15:00', s: 'Basta leggere. Tocca a te fare trading.' },
        'curve-lab': { t: '16:30', s: 'Dopo la chiusura: il modello dietro ai giochi.' },
        life: { t: '17:30', s: 'Mercati chiusi. Fuori ufficio.' },
        contact: { t: '18:00', s: 'After hours. Parliamone.' }
      }
    },

    sv: {
      chat: { disclaimer: 'Svar genereras av AI och kan innehålla fel. Samtalen sparas.' },
      privacy: 'För att se hur webbplatsen används registrerar jag besök (IP-adress, ungefärlig plats, enhet, var länken kom ifrån, tid på sidan) och samtal med AI-tvillingen. Mejla mig om du vill att dina uppgifter raderas.',
      nav: { research: 'Forskning' },
      projects: {
        intro: 'Forskning som blev kod, och kod som blev verktyg. Varje nod är ett projekt; linjerna visar vad de har gemensamt.',
        view3d: '3D-nätverk', viewList: 'Lista',
        hint: 'Dra för att rotera. Håll över ett projekt för att ta fram det.',
        hintTouch: 'Svep i sidled för att rotera. Tryck på ett projekt.',
        overviewTitle: 'Ett nätverk, inte en lista',
        overviewBody: 'Varje nod är ett projekt. Linjerna kopplar ihop projekt som delar ett tema eller en färdighet, så att man ser hur en idé ledde till nästa.',
        legendQuant: 'Kvantforskning', legendProduct: 'AI och produkt', legendLine: 'Gemensamt tema',
        connected: 'Kopplat till', website: 'Öppna webbplatsen', github: 'Koden på GitHub', open3d: 'Öppna på den här sidan',
        count: '{n} projekt', synced: '{g} synkade från GitHub', syncing: 'Synkar med GitHub…', offline: 'GitHub går inte att nå just nu: visar de senast kända projekten.',
        updated: 'uppdaterad {d}', newBadge: 'Ny', fromGithub: 'Från GitHub',
        autoLine: 'Ett projekt på min GitHub.', noDesc: 'Detaljer och kod finns på GitHub.',
        traits: { bitcoin: 'Bitcoin', volatility: 'Volatilitet', ai: 'AI och LLM', web: 'Webbappar', lovable: 'Lovable', markets: 'Marknadsstruktur', research: 'Ekonometri', energy: 'Energi', viz: '3D och datavisualisering', python: 'Python', startup: 'Go-to-market' },
        items: {
          sinapsi: { name: 'Sinapsi', line: 'En digital hjärna i 3D: idéer och minnen som neuroner som AI kopplar ihop.', body: 'Anteckningar, idéer, projekt och dokument svävar i 3D som neuroner. AI sorterar dem efter ämne och drar synapserna mellan dem som hör ihop, och en chattbot svarar bara utifrån ditt eget minne. Den här delen av min webbplats bygger på samma idé.', q: 'Vad är Sinapsi och varför bygger du det?' },
          dvol: { name: 'BTC DVOL-strategi', line: 'En Bitcoin-strategi driven av implicit volatilitet.', body: 'En strategi på Bitcoin byggd kring DVOL, indexet för implicit volatilitet i Bitcoin-optioner. Kod och resultat finns på GitHub.', q: 'Berätta om din BTC DVOL-strategi.' },
          websites: { name: 'Webbplatser för startups', line: 'Go-to-market, e-handel och smoke test-sidor.', body: 'Webbplatser jag byggt för att lansera och testa startupidéer: go-to-market-sidor, e-handel och landningssidor för smoke tests som mäter verklig efterfrågan innan produkten byggs.', q: 'Berätta om webbplatserna du byggt för startups.' }
        }
      },
      research: {
        title: 'Forskning och presentationer',
        intro: 'Essäer, uppsatser och presentationer från mina studier. Öppna dem här eller ladda ner originalfilerna.',
        read: 'Läs', slides: 'Bilder', download: 'Ladda ner', openNew: 'Öppna i ny flik', close: 'Stäng',
        pages: '{n} sidor', slidesN: '{n} bilder', ask: 'Fråga tvillingen', keyIdea: 'Huvudidé',
        types: { pdf: 'PDF', pptx: 'PowerPoint', xlsx: 'Excel', docx: 'Word' },
        viewerNote: 'Om förhandsvisningen inte laddas på din enhet, använd ”Öppna i ny flik”.'
      },
      journey: {
        title: 'Resa',
        intro: 'Min väg som ett kursdiagram. Håll över linjen, en punkt eller ett datum för att läsa varje steg.',
        ticker: 'PIETRO MISCHI', exchange: 'Milano → Stockholm', index: 'Karriärindex', ytd: 'i år',
        consensus: 'Analytikernas konsensus', rating: 'KÖP', ratingQ: 'Varför ska vi anställa dig?',
        target: 'Riktkurs', targetLabel: 'Examen', projection: 'Prognos',
        stats: [
          { v: '2016', k: 'Noterad sedan' },
          { v: '2', k: 'Städer' },
          { v: '4', k: 'Språk' },
          { v: '20+', k: 'Granskade institut' }
        ],
        cats: { edu: 'Utbildning', work: 'Arbete', proj: 'Projekt', cert: 'Certifikat', life: 'Livet' },
        legendHint: 'Klicka på en serie för att visa eller dölja den.',
        ask: 'Fråga tvillingen', prev: 'Föregående', next: 'Nästa', more: 'Läs den',
        items: {
          hs: { date: '2016 – 2021', title: 'Liceo Scientifico G. Cardano', org: 'Milano', bullets: ['Naturvetenskapligt gymnasium.', 'Åren då jag träffade de flesta av mina närmaste vänner.'], q: 'Hur var din gymnasietid?' },
          unicredit: { date: '2019', title: 'UniCredit StartUp Your Life', org: 'UniCredit', bullets: ['Kurs i privatekonomi och entreprenörskap.'], q: 'När började ditt intresse för finans?' },
          lifeguard: { date: '2020', title: 'Livräddarcertifikat', org: 'International Life Saving Federation (FIN)', bullets: ['Certifierad livräddare: år av simning som blev ett certifikat.'], q: 'Vilka sporter har du utövat?' },
          bsc: { date: 'sep 2021 – apr 2025', title: 'Kandidat i ekonomi, organisationer och marknader', org: 'Università Cattolica del Sacro Cuore, Milano', bullets: ['Inriktning mot kvantitativa metoder för ekonomisk vetenskap.', 'Slutbetyg 99/110.', 'Uppsats: ”Fintech Revolution: The Use of Digital Technology in Finance”.', 'Ekonometri, matematik för finansiella tillämpningar.'], q: 'Berätta om din kandidatexamen och uppsats.' },
          bloomberg: { date: '2022', title: 'Bloomberg Market Concepts', org: 'Bloomberg', bullets: ['BMC-certifiering, sedan Bloomberg i analys och revision.'], q: 'Vilka finansiella verktyg använder du?' },
          ielts: { date: '2024', title: 'IELTS 7.5 (C1)', org: 'British Council', bullets: ['Totalpoäng 7.5, CEFR-nivå C1.'], q: 'Vilka språk talar du?' },
          bdo: { date: 'sep 2024 – aug 2025', title: 'BDO Italia, revision', org: 'Financial Services & Digital Assets, Milano', bullets: ['Junior Assistant Auditor → Assistant Auditor → Expert Assistant Auditor på 11 månader.', 'Finansiella revisioner och regulatoriska granskningar för över 20 banker, fonder och försäkringsbolag.', 'NPL-analys och tillgångsövervakning.'], q: 'Berätta om din tid på BDO.' },
          tether: { date: 'Q1 – Q2 2025', title: 'Tether Holdings: en portfölj på 143 mdr $', org: 'BDO Italia', bullets: ['I kärnteamet för granskningen av världens största digitala reservstruktur.', 'Ansvarig för aktiviteter kring kunder och dotterbolag.', 'Stickprovstestade on-chain-transaktioner med verktyg för blockkedjeanalys.'], q: 'Vad gjorde du i revisionen av Tether Holdings?' },
          legambiente: { date: 'jul 2025', title: 'Volontärarbete med Legambiente', org: 'Italien', bullets: ['Renoverade en skola för elever från svåra förhållanden.'], q: 'Berätta om ditt volontärarbete.' },
          msc: { date: '2025 – 2027', title: 'MSc Banking and Finance', org: 'Stockholms universitet', bullets: ['Flyttade till Sverige för att bygga en karriär inom skandinavisk finans.', 'Tillgångsprissättning, derivat, räntebärande, kredit- och marknadsrisk, finansiell ekonometri.'], q: 'Varför valde du din master i Stockholm?' },
          tandem: { date: 'sedan feb 2026', title: 'Språkstudion Tandem Program', org: 'Stockholms universitet', bullets: ['Språkutbyte: jag lär ut italienska och övar svenska.', 'Svenskkurser kurs 1 och 2 (12 hp).'], q: 'Hur går det med svenskan?' },
          vol: { date: 'våren 2026', title: 'Volatilitetsstrategi på S&P 500', org: 'GitHub', bullets: ['Multi-factor Implied Spread-Carry Harvesting Index.', 'Nelson-Siegel-faktorer på VIX-terminsstrukturen, prognostiserade med ARIMA.'], q: 'Förklara din volatilitetsstrategi enkelt.' },
          marathon: { date: 'maj 2026', title: 'Stockholm Marathon', org: 'Stockholm', bullets: ['42,2 km. Den längsta långa positionen jag haft.'], q: 'Berätta om Stockholm Marathon.' },
          kth: { date: '2026 – 2027', title: 'KTH', org: 'Fristående kurser, Stockholm', bullets: ['Energy and Geopolitics (7,5 hp).', 'Brand Portfolio Management (6 hp).', 'Decision Theory for Professionals (2,5 hp).'], q: 'Varför läser du kurser på KTH?' },
          builds: { date: 'sep 2026', title: 'Bygga öppet', org: 'GitHub och Vercel', bullets: ['BTC Frontline: Bitcoins orderbok som en 3D-strid i realtid.', 'Den här AI-tvillingen och webbplatser för att testa startupidéer.', 'Lovable & Drivhuset Impact Buildathon.'], q: 'Vad har du byggt på sistone?' },
          essay: { date: 'okt 2026', title: '”The price is the weapon”', org: 'KTH, Energy and Geopolitics', bullets: ['Hur Europas gasmarknadsreform gjorde priset till ett påtryckningsmedel.'], q: 'Vad handlar din essä "The price is the weapon" om?' },
          next: { date: 'sommaren 2027', title: 'Examen och nästa roll', org: 'Stockholm eller i Europa', bullets: ['Öppen för praktik redan nu och traineeroller från sommaren 2027.'], q: 'Vilken typ av roll söker du?' }
        }
      },
      interludes: {
        twin: { t: '09:00', s: 'Öppningsklockan. Före siffrorna, ett samtal: fråga mig vad som helst.' },
        journey: { t: '09:30', s: 'Varje position har en historia. Så här byggdes den här.' },
        projects: { t: '11:00', s: 'Teori ger avkastning först när man bygger något. Här är det jag har byggt.' },
        research: { t: '13:00', s: 'Vissa idéer behövde en essä, inte en app.' },
        game: { t: '15:00', s: 'Nog med läsning. Din tur att handla.' },
        'curve-lab': { t: '16:30', s: 'Efter stängning: modellen bakom spelen.' },
        life: { t: '17:30', s: 'Marknaden är stängd. Utanför jobbet.' },
        contact: { t: '18:00', s: 'Efter stängning. Hör av dig.' }
      }
    }
  };

  const merge = (dst, src) => {
    Object.keys(src).forEach((k) => {
      if (src[k] && typeof src[k] === 'object' && !Array.isArray(src[k])) {
        dst[k] = dst[k] || {};
        merge(dst[k], src[k]);
      } else dst[k] = src[k];
    });
  };
  Object.keys(EXTRA).forEach((l) => { window.SITE_TEXT[l] = window.SITE_TEXT[l] || {}; merge(window.SITE_TEXT[l], EXTRA[l]); });
})();
