// Testi per le parti interattive nuove: sala giochi, Beat the Tape, nastro dei ticker, palette comandi.
// Vengono uniti a window.SITE_TEXT (i18n.js) senza toccarlo.
(function () {
  const EXTRA = {
    en: {
      frontline: {
        sub: 'Bitcoin\u2019s live order book as a 3D battle on the Moon: bulls against bears.',
        loading: 'Connecting to the exchanges…', live: 'Live', demo: 'Simulated data', connecting: 'Connecting',
        simulated: 'simulated market', pressure: 'Market pressure', bulls: 'Bulls', bears: 'Bears',
        press: { wait: 'Waiting for trades', bull: 'Bulls are advancing', bear: 'Bears are advancing', contested: 'Contested front' },
        support: 'Biggest buy wall', resistance: 'Biggest sell wall', bn: 'bn',
        soundOn: 'Turn sound on', soundOff: 'Turn sound off', open: 'Explore in 3D', close: 'Close', expandedTitle: 'BTC Frontline',
        vOverview: 'Overview', vFront: 'Front', vCinema: 'Cinema', vHistory: 'History',
        note: 'Soldiers are market orders, tanks guard the biggest walls in the book and artillery fires on every liquidation. Data from Binance, Kraken and Coinbase.',
        tour: {
          step: 'Step {n} of 2', help: 'How to move',
          t1: 'Move around the battlefield',
          pointer: ['Drag to rotate the view', 'Scroll with two fingers or pinch on the touchpad to zoom', 'Click with two fingers and drag to move sideways, or use W A S D'],
          touch: ['Drag with one finger to rotate', 'Pinch to zoom', 'Drag with two fingers to move sideways'],
          t2: 'Or jump to a ready-made view',
          views: ['the whole battlefield from above', 'follows the front line as the price moves', 'close up, slowly circling the fight', 'Bitcoin\u2019s monthly chart since 2010'],
          next: 'Next', skip: 'Skip', done: 'Start exploring'
        },
        ask: 'Ask how I built it', askQ: 'How did you build BTC Frontline?'
      },
      nav: { game: 'Arcade' },
      hero: { ctaGame: 'Play Beat the Tape' },
      arcade: {
        title: 'Trading floor arcade',
        intro: 'Two small games built on ideas from my studies. Start with Beat the Tape, then try running a volatility book.',
        tabTape: 'Beat the Tape', tabTapeSub: '60 seconds, trade the headlines',
        tabCarry: 'Carry & Crash', tabCarrySub: 'Harder: run a volatility book'
      },
      tape: {
        intro: 'One stock, sixty seconds, a stream of headlines. Buy on good news, sell on bad, and be careful with rumours.',
        rules: 'You start flat with 100 000 kr. Each trade pays the spread. Lose 20% and the desk closes your book.',
        keys: 'Keys: ↑ or B buy, ↓ or S sell, → or C close, space to pause.',
        start: 'Start the clock', again: 'Play again', pause: 'Pause', resume: 'Resume',
        buy: 'Buy', sell: 'Sell', close: 'Close',
        time: 'Time left', pnl: 'P&L', pos: 'Position', best: 'Best',
        posLong: 'Long', posShort: 'Short', posFlat: 'Flat',
        waiting: 'Waiting for news…', rumour: 'Rumour', paused: 'Paused',
        goodRead: 'Good read', wrongWay: 'Wrong way', streak: 'in a row',
        marginCall: 'Margin call. The desk closed your book.',
        endTitle: 'Closing bell',
        trades: 'Trades', hit: 'Headlines read right', dd: 'Max drawdown',
        share: 'Copy result', copied: 'Result copied',
        shareText: 'I made {pnl} in 60 seconds on Beat the Tape and ranked {rank}. Try it:',
        ranks: ['Coffee runner', 'Intern', 'Analyst', 'Associate', 'Portfolio manager', 'Head of trading'],
        rankLabel: 'Your rank',
        lesson: 'Real markets price headlines in milliseconds, so I look for slower signals, like the shape of the volatility curve.',
        ask: 'Ask the twin how I trade',
        askQ: 'How do you think about trading on news compared with systematic signals?',
        news: {
          up: [
            'Riksbank cuts rates by 50bp', 'Earnings beat: revenue +18%', 'Nordic jobs data comes in strong',
            'Inflation cools faster than expected', 'Buyback of 5 billion kr announced', 'Big pension fund raises its stake',
            'US tech rally spills into Europe', 'New contract with a major carmaker'
          ],
          down: [
            'Profit warning: margins under pressure', 'Inflation surprise: CPI jumps', 'ECB hikes unexpectedly',
            'CFO resigns with immediate effect', 'Energy prices spike overnight', 'Regulator opens an investigation',
            'Guidance cut for the full year', 'Credit spreads widen across Europe'
          ],
          rumour: [
            'Takeover talk in the chat rooms', 'Anonymous post claims a big order', 'Blog says the CEO is leaving',
            'Traders whisper about a short seller report', 'Unconfirmed: merger with a rival'
          ]
        }
      },
      ticker: {
        label: 'Pietro in numbers. Click a line to ask the twin about it.',
        items: [
          { s: 'SU', v: 'MSc 2027', d: 'up', q: 'Tell me about your master\u2019s at Stockholm University.' },
          { s: 'BDO', v: '20+ institutions', d: 'up', q: 'Tell me about your experience at BDO.' },
          { s: 'TETHER', v: '$143bn audited', d: 'up', q: 'What did you do on the Tether Holdings audit?' },
          { s: 'PACE', v: '150%', d: 'up', q: 'How do you manage studying at a 150% pace?' },
          { s: 'NS-VOL', v: 'level, slope, curvature', d: 'up', q: 'How do you use the Nelson-Siegel model on implied volatility?' },
          { s: 'BTC-FEES', v: '74.6% hit rate', d: 'up', q: 'Tell me about your Bitcoin transaction fees study.' },
          { s: 'IELTS', v: '7.5', d: 'up', q: 'What languages do you speak?' },
          { s: 'SVENSKA', v: 'improving', d: 'up', q: 'How is your Swedish going?' },
          { s: 'MARATHON', v: '42.2 km', d: 'up', q: 'Tell me about running the Stockholm Marathon.' },
          { s: 'BUILDS', v: '8 projects', d: 'up', q: 'What have you built recently?' },
          { s: 'BRIGHTWOOD', v: 'Nordic launch', d: 'up', q: 'What are you doing for Brightwood in Scandinavia?' },
          { s: 'COFFEE', v: 'fika mastered', d: 'up', q: 'What do you like about life in Stockholm?' }
        ]
      },
      palette: {
        open: 'Search', placeholder: 'Jump to a section, start a game or ask the twin',
        go: 'Go to', act: 'Do', ask: 'Ask the twin', askFree: 'Ask the twin:',
        empty: 'Type a question and press Enter to ask the twin.',
        fab: 'Ask me anything',
        actions: { tape: 'Play Beat the Tape', carry: 'Play Carry & Crash', email: 'Copy my email', cv: 'Open LinkedIn', it: 'Italiano', en: 'English', sv: 'Svenska' },
        hint: 'Enter to open, esc to close'
      }
    },

    it: {
      frontline: {
        sub: 'Il book di Bitcoin dal vivo come una battaglia 3D sulla Luna: tori contro orsi.',
        loading: 'Collegamento agli exchange…', live: 'Live', demo: 'Dati simulati', connecting: 'Collegamento',
        simulated: 'mercato simulato', pressure: 'Pressione di mercato', bulls: 'Tori', bears: 'Orsi',
        press: { wait: 'In attesa degli scambi', bull: 'I tori avanzano', bear: 'Gli orsi avanzano', contested: 'Fronte conteso' },
        support: 'Muro acquisti', resistance: 'Muro vendite', bn: ' mld',
        soundOn: 'Attiva l\u2019audio', soundOff: 'Disattiva l\u2019audio', open: 'Esplora in 3D', close: 'Chiudi', expandedTitle: 'BTC Frontline',
        vOverview: 'Panoramica', vFront: 'Fronte', vCinema: 'Cinema', vHistory: 'Storia',
        note: 'I soldati sono gli ordini a mercato, i carri armati difendono i muri più grossi del book e l\u2019artiglieria spara a ogni liquidazione. Dati da Binance, Kraken e Coinbase.',
        tour: {
          step: 'Passo {n} di 2', help: 'Come muoversi',
          t1: 'Muoviti nel campo di battaglia',
          pointer: ['Trascina per ruotare la visuale', 'Scorri con due dita o pizzica il touchpad per lo zoom', 'Clic con due dita e trascina per spostarti di lato, oppure usa W A S D'],
          touch: ['Trascina con un dito per ruotare', 'Pizzica per lo zoom', 'Trascina con due dita per spostarti di lato'],
          t2: 'Oppure salta a una vista pronta',
          views: ['tutto il campo dall\u2019alto', 'segue la linea del fronte mentre il prezzo si muove', 'da vicino, girando lentamente intorno alla battaglia', 'il grafico mensile di Bitcoin dal 2010'],
          next: 'Avanti', skip: 'Salta', done: 'Inizia a esplorare'
        },
        ask: 'Chiedi come l\u2019ho costruito', askQ: 'Come hai costruito BTC Frontline?'
      },
      nav: { game: 'Giochi' },
      hero: { ctaGame: 'Gioca a Beat the Tape' },
      arcade: {
        title: 'La sala giochi del trading floor',
        intro: 'Due piccoli giochi nati da idee dei miei studi. Inizia con Beat the Tape, poi prova a gestire un book di volatilità.',
        tabTape: 'Beat the Tape', tabTapeSub: '60 secondi, fai trading sulle notizie',
        tabCarry: 'Carry & Crash', tabCarrySub: 'Più difficile: un book di volatilità'
      },
      tape: {
        intro: 'Un titolo, sessanta secondi, un flusso di notizie. Compra sulle buone notizie, vendi sulle cattive e attento ai rumor.',
        rules: 'Parti flat con 100 000 kr. Ogni operazione paga lo spread. Se perdi il 20% il desk ti chiude il book.',
        keys: 'Tasti: ↑ o B compra, ↓ o S vendi, → o C chiudi, spazio per la pausa.',
        start: 'Fai partire il tempo', again: 'Gioca ancora', pause: 'Pausa', resume: 'Riprendi',
        buy: 'Compra', sell: 'Vendi', close: 'Chiudi',
        time: 'Tempo', pnl: 'P&L', pos: 'Posizione', best: 'Record',
        posLong: 'Long', posShort: 'Short', posFlat: 'Flat',
        waiting: 'In attesa di notizie…', rumour: 'Rumor', paused: 'In pausa',
        goodRead: 'Lettura giusta', wrongWay: 'Direzione sbagliata', streak: 'di fila',
        marginCall: 'Margin call. Il desk ha chiuso il tuo book.',
        endTitle: 'Campanella di chiusura',
        trades: 'Operazioni', hit: 'Notizie lette bene', dd: 'Max drawdown',
        share: 'Copia il risultato', copied: 'Risultato copiato',
        shareText: 'Ho fatto {pnl} in 60 secondi su Beat the Tape, livello {rank}. Provaci:',
        ranks: ['Porta-caffè', 'Stagista', 'Analyst', 'Associate', 'Portfolio manager', 'Capo del trading'],
        rankLabel: 'Il tuo livello',
        lesson: 'I mercati veri prezzano le notizie in millisecondi, per questo io cerco segnali più lenti, come la forma della curva di volatilità.',
        ask: 'Chiedi al gemello come faccio trading',
        askQ: 'Come la pensi sul fare trading sulle notizie rispetto ai segnali sistematici?',
        news: {
          up: [
            'La Riksbank taglia i tassi di 50bp', 'Utili sopra le attese: ricavi +18%', 'Dati sul lavoro nordici molto forti',
            'L\u2019inflazione rallenta più del previsto', 'Annunciato un buyback da 5 miliardi di kr', 'Un grande fondo pensione sale nel capitale',
            'Il rally tech USA contagia l\u2019Europa', 'Nuovo contratto con una grande casa automobilistica'
          ],
          down: [
            'Profit warning: margini sotto pressione', 'Sorpresa sull\u2019inflazione: il CPI sale', 'La BCE alza i tassi a sorpresa',
            'Il CFO si dimette con effetto immediato', 'Prezzi dell\u2019energia alle stelle nella notte', 'L\u2019autorità di vigilanza apre un\u2019indagine',
            'Guidance annuale tagliata', 'Gli spread di credito si allargano in Europa'
          ],
          rumour: [
            'Voci di OPA nelle chat', 'Un post anonimo parla di un grosso ordine', 'Un blog dice che il CEO se ne va',
            'Si parla di un report di un short seller', 'Non confermato: fusione con un concorrente'
          ]
        }
      },
      ticker: {
        label: 'Pietro in numeri. Clicca una voce per chiedere al gemello.',
        items: [
          { s: 'SU', v: 'MSc 2027', d: 'up', q: 'Raccontami del tuo master alla Stockholm University.' },
          { s: 'BDO', v: '20+ istituzioni', d: 'up', q: 'Raccontami della tua esperienza in BDO.' },
          { s: 'TETHER', v: '$143 mld revisionati', d: 'up', q: 'Cosa hai fatto nella revisione di Tether Holdings?' },
          { s: 'RITMO', v: '150%', d: 'up', q: 'Come gestisci lo studio a un ritmo del 150%?' },
          { s: 'NS-VOL', v: 'livello, pendenza, curvatura', d: 'up', q: 'Come usi il modello Nelson-Siegel sulla volatilità implicita?' },
          { s: 'BTC-FEES', v: '74,6% di accuratezza', d: 'up', q: 'Raccontami dello studio sulle fee delle transazioni Bitcoin.' },
          { s: 'IELTS', v: '7,5', d: 'up', q: 'Che lingue parli?' },
          { s: 'SVENSKA', v: 'in crescita', d: 'up', q: 'Come va con lo svedese?' },
          { s: 'MARATONA', v: '42,2 km', d: 'up', q: 'Raccontami della Maratona di Stoccolma.' },
          { s: 'BUILDS', v: '8 progetti', d: 'up', q: 'Cosa hai costruito di recente?' },
          { s: 'BRIGHTWOOD', v: 'lancio nordico', d: 'up', q: 'Cosa stai facendo per Brightwood in Scandinavia?' },
          { s: 'CAFFÈ', v: 'fika imparata', d: 'up', q: 'Cosa ti piace della vita a Stoccolma?' }
        ]
      },
      palette: {
        open: 'Cerca', placeholder: 'Vai a una sezione, avvia un gioco o chiedi al gemello',
        go: 'Vai a', act: 'Azioni', ask: 'Chiedi al gemello', askFree: 'Chiedi al gemello:',
        empty: 'Scrivi una domanda e premi Invio per chiederla al gemello.',
        fab: 'Chiedimi qualcosa',
        actions: { tape: 'Gioca a Beat the Tape', carry: 'Gioca a Carry & Crash', email: 'Copia la mia email', cv: 'Apri LinkedIn', it: 'Italiano', en: 'English', sv: 'Svenska' },
        hint: 'Invio per aprire, esc per chiudere'
      }
    },

    sv: {
      frontline: {
        sub: 'Bitcoins orderbok i realtid som en 3D-strid på månen: tjurar mot björnar.',
        loading: 'Ansluter till börserna…', live: 'Live', demo: 'Simulerad data', connecting: 'Ansluter',
        simulated: 'simulerad marknad', pressure: 'Marknadstryck', bulls: 'Tjurar', bears: 'Björnar',
        press: { wait: 'Väntar på affärer', bull: 'Tjurarna avancerar', bear: 'Björnarna avancerar', contested: 'Omstridd front' },
        support: 'Största köpmuren', resistance: 'Största säljmuren', bn: ' mdr',
        soundOn: 'Slå på ljudet', soundOff: 'Stäng av ljudet', open: 'Utforska i 3D', close: 'Stäng', expandedTitle: 'BTC Frontline',
        vOverview: 'Översikt', vFront: 'Front', vCinema: 'Film', vHistory: 'Historia',
        note: 'Soldaterna är marknadsorder, stridsvagnarna vaktar de största murarna i orderboken och artilleriet skjuter vid varje likvidation. Data från Binance, Kraken och Coinbase.',
        tour: {
          step: 'Steg {n} av 2', help: 'Så rör du dig',
          t1: 'Rör dig över slagfältet',
          pointer: ['Dra för att rotera vyn', 'Scrolla med två fingrar eller nyp på styrplattan för att zooma', 'Klicka med två fingrar och dra för att flytta i sidled, eller använd W A S D'],
          touch: ['Dra med ett finger för att rotera', 'Nyp för att zooma', 'Dra med två fingrar för att flytta i sidled'],
          t2: 'Eller hoppa till en färdig vy',
          views: ['hela slagfältet ovanifrån', 'följer frontlinjen när priset rör sig', 'nära, cirklar långsamt runt striden', 'Bitcoins månadsgraf sedan 2010'],
          next: 'Nästa', skip: 'Hoppa över', done: 'Börja utforska'
        },
        ask: 'Fråga hur jag byggde den', askQ: 'Hur byggde du BTC Frontline?'
      },
      nav: { game: 'Spel' },
      hero: { ctaGame: 'Spela Beat the Tape' },
      arcade: {
        title: 'Tradinggolvets spelhall',
        intro: 'Två små spel byggda på idéer från mina studier. Börja med Beat the Tape och prova sedan att driva en volatilitetsbok.',
        tabTape: 'Beat the Tape', tabTapeSub: '60 sekunder, handla på nyheterna',
        tabCarry: 'Carry & Crash', tabCarrySub: 'Svårare: driv en volatilitetsbok'
      },
      tape: {
        intro: 'En aktie, sextio sekunder, ett flöde av rubriker. Köp på goda nyheter, sälj på dåliga och se upp med rykten.',
        rules: 'Du börjar utan position med 100 000 kr. Varje affär kostar spreaden. Förlorar du 20 % stänger desken din bok.',
        keys: 'Tangenter: ↑ eller B köp, ↓ eller S sälj, → eller C stäng, mellanslag för paus.',
        start: 'Starta klockan', again: 'Spela igen', pause: 'Paus', resume: 'Fortsätt',
        buy: 'Köp', sell: 'Sälj', close: 'Stäng',
        time: 'Tid kvar', pnl: 'Resultat', pos: 'Position', best: 'Rekord',
        posLong: 'Lång', posShort: 'Kort', posFlat: 'Ingen',
        waiting: 'Väntar på nyheter…', rumour: 'Rykte', paused: 'Pausat',
        goodRead: 'Rätt läsning', wrongWay: 'Fel håll', streak: 'i rad',
        marginCall: 'Marginalsamtal. Desken stängde din bok.',
        endTitle: 'Stängningsklockan',
        trades: 'Affärer', hit: 'Rätt lästa rubriker', dd: 'Max drawdown',
        share: 'Kopiera resultat', copied: 'Resultat kopierat',
        shareText: 'Jag tjänade {pnl} på 60 sekunder i Beat the Tape och blev {rank}. Testa:',
        ranks: ['Kaffehämtare', 'Praktikant', 'Analytiker', 'Associate', 'Portföljförvaltare', 'Tradingchef'],
        rankLabel: 'Din nivå',
        lesson: 'Riktiga marknader prisar rubriker på millisekunder, så jag letar efter långsammare signaler, som volatilitetskurvans form.',
        ask: 'Fråga tvillingen hur jag handlar',
        askQ: 'Hur ser du på att handla på nyheter jämfört med systematiska signaler?',
        news: {
          up: [
            'Riksbanken sänker räntan med 50 punkter', 'Rapporten slår förväntningarna: intäkter +18 %', 'Starka nordiska jobbsiffror',
            'Inflationen faller snabbare än väntat', 'Återköp på 5 miljarder kr', 'Stor pensionsfond ökar sitt innehav',
            'Techrallyt i USA sprider sig till Europa', 'Nytt kontrakt med en stor biltillverkare'
          ],
          down: [
            'Vinstvarning: pressade marginaler', 'Inflationschock: KPI stiger', 'ECB höjer räntan oväntat',
            'Finanschefen avgår med omedelbar verkan', 'Energipriserna rusar under natten', 'Tillsynsmyndigheten inleder en utredning',
            'Helårsprognosen sänks', 'Kreditspreadarna vidgas i Europa'
          ],
          rumour: [
            'Uppköpsprat i chattforumen', 'Anonymt inlägg om en stor order', 'Blogg påstår att vd:n slutar',
            'Det viskas om en blankarrapport', 'Obekräftat: fusion med en konkurrent'
          ]
        }
      },
      ticker: {
        label: 'Pietro i siffror. Klicka på en rad för att fråga tvillingen.',
        items: [
          { s: 'SU', v: 'MSc 2027', d: 'up', q: 'Berätta om din master vid Stockholms universitet.' },
          { s: 'BDO', v: '20+ institut', d: 'up', q: 'Berätta om din erfarenhet på BDO.' },
          { s: 'TETHER', v: '$143 mdr granskat', d: 'up', q: 'Vad gjorde du i revisionen av Tether Holdings?' },
          { s: 'TAKT', v: '150 %', d: 'up', q: 'Hur klarar du att studera i 150 % takt?' },
          { s: 'NS-VOL', v: 'nivå, lutning, krökning', d: 'up', q: 'Hur använder du Nelson-Siegel-modellen på implicit volatilitet?' },
          { s: 'BTC-FEES', v: '74,6 % träffsäkerhet', d: 'up', q: 'Berätta om din studie av Bitcoins transaktionsavgifter.' },
          { s: 'IELTS', v: '7,5', d: 'up', q: 'Vilka språk talar du?' },
          { s: 'SVENSKA', v: 'på väg upp', d: 'up', q: 'Hur går det med svenskan?' },
          { s: 'MARATON', v: '42,2 km', d: 'up', q: 'Berätta om Stockholm Marathon.' },
          { s: 'BUILDS', v: '8 projekt', d: 'up', q: 'Vad har du byggt på sistone?' },
          { s: 'BRIGHTWOOD', v: 'nordisk lansering', d: 'up', q: 'Vad gör du för Brightwood i Skandinavien?' },
          { s: 'FIKA', v: 'bemästrad', d: 'up', q: 'Vad gillar du med livet i Stockholm?' }
        ]
      },
      palette: {
        open: 'Sök', placeholder: 'Gå till en sektion, starta ett spel eller fråga tvillingen',
        go: 'Gå till', act: 'Gör', ask: 'Fråga tvillingen', askFree: 'Fråga tvillingen:',
        empty: 'Skriv en fråga och tryck Enter för att fråga tvillingen.',
        fab: 'Fråga mig vad som helst',
        actions: { tape: 'Spela Beat the Tape', carry: 'Spela Carry & Crash', email: 'Kopiera min e-post', cv: 'Öppna LinkedIn', it: 'Italiano', en: 'English', sv: 'Svenska' },
        hint: 'Enter för att öppna, esc för att stänga'
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
