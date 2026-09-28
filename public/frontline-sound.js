// Audio di BTC Frontline: battaglia spaziale e "La cavalcata delle valchirie", sintetizzate con la Web Audio API.
// Nessun file audio: la musica è suonata nota per nota da sintetizzatori, più sottofondo (ronzio dell'astronave e rombo lontano), laser dei soldati,
// cannoni dei carri, lanci d'artiglieria ed esplosioni, generati al momento.
// La scena 3D (nell'iframe) segnala gli eventi; qui diventano suoni, con il panning sullo schermo.
(function () {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master = null, bus = null, noise = null, bedNodes = [], on = false, suspendT = null;
  let musicBus = null, duck = null, echo = null, arpLp = null;

  // ---------- Musica: "La cavalcata delle valchirie" (Wagner, 1856; opera di pubblico dominio) ----------
  // Arrangiamento sintetizzato: ottoni sul tema, archi che turbinano, basso al galoppo, timpani e piatti.
  // 9/8 con la semiminima puntata a 100: la griglia è la semicroma, 18 per battuta.
  const BEAT = 60 / 100, STEP = BEAT / 6;
  const MUSIC_VOL = 0.5;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const CH = {
    Bm:  { bass: 35, tones: [59, 62, 66] },   // Si minore
    D:   { bass: 38, tones: [62, 66, 69] },   // Re maggiore
    Fsm: { bass: 42, tones: [61, 66, 69] },   // Fa# minore
    Fs:  { bass: 42, tones: [58, 61, 66] },   // Fa# maggiore (dominante)
    B:   { bass: 35, tones: [59, 63, 66] }    // Si maggiore
  };
  // Il tema procede per "cellule" di 2 movimenti (12 semicrome) che scavalcano le stanghette:
  // levare di una semicroma (X), poi Y puntata, X semicroma, Y croma, e la nota lunga Z.
  // [X, Y, Z, accordo] — Si minore che sale, poi Re, Fa# minore, Fa# e l'arrivo in Si maggiore.
  const CELLS = [
    [66, 71, 74, 'Bm'], [71, 74, 78, 'Bm'], [74, 78, 81, 'Bm'],
    [69, 74, 78, 'D'],  [69, 74, 78, 'D'],  [74, 78, 81, 'D'],
    [66, 69, 73, 'Fsm'], [73, 78, 82, 'Fs'], [66, 71, 75, 'B']
  ];
  const INTRO = 36, S = 36;                    // 2 battute di introduzione, poi il tema sul battere
  const END = S + CELLS.length * 12 + 12;      // l'ultima nota lunga, poi il ritorno sulla dominante
  const LOOP_END = END + 36;                   // 2 battute di trillo e rullo di timpani, poi si riparte da S
  const mel = new Map();                       // posizione (semicroma) -> [nota, durata, cellula]
  const put = (pos, m, len, k) => { if (!mel.has(pos)) mel.set(pos, []); mel.get(pos).push([m, len, k]); };
  CELLS.forEach(([x, y, z], k) => {
    const at = S + k * 12, last = k === CELLS.length - 1;
    put(at - 1, x, 1, k);
    if (k === 0) put(LOOP_END - 1, x, 1, k);   // il levare del tema, anche quando il giro ricomincia
    put(at, y, 3, k); put(at + 3, x, 1, k); put(at + 4, y, 2, k);
    put(at + 6, z, last ? 12 : 5, k);
  });
  const cellAt = (pos) => Math.floor((pos - S + 1) / 12);
  function chordAt(pos) {
    if (pos < S - 1) return 'Bm';
    if (pos >= END) return 'Fs';
    const k = cellAt(pos);
    return k < CELLS.length ? CELLS[k][3] : 'B';
  }
  let pos = 0, nextT = 0, timer = null, events = [];
  const active = { shot: 0, boom: 0 };
  const LIMIT = { shot: 7, boom: 5 };

  function init() {
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.25;
    master = ctx.createGain(); master.gain.value = 0;
    bus = ctx.createGain(); bus.gain.value = 0.9;
    bus.connect(master); master.connect(comp); comp.connect(ctx.destination);
    // la musica ha un suo canale, un po' più basso degli effetti, con un'eco per l'arpeggio
    musicBus = ctx.createGain(); musicBus.gain.value = MUSIC_VOL;
    duck = ctx.createGain(); duck.gain.value = 1;
    musicBus.connect(duck); duck.connect(master);
    echo = ctx.createDelay(1.5); echo.delayTime.value = STEP * 3;          // eco a croma puntata
    const fb = ctx.createGain(); fb.gain.value = 0.32;
    const echoLp = ctx.createBiquadFilter(); echoLp.type = 'lowpass'; echoLp.frequency.value = 2400;
    const wet = ctx.createGain(); wet.gain.value = 0.35;
    echo.connect(echoLp); echoLp.connect(fb); fb.connect(echo); echoLp.connect(wet); wet.connect(musicBus);
    arpLp = ctx.createBiquadFilter(); arpLp.type = 'lowpass'; arpLp.frequency.value = 1800; arpLp.Q.value = 4;
    arpLp.connect(musicBus); arpLp.connect(echo);
    // due secondi di rumore, riusati da esplosioni e sottofondo
    noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    startBed();
  }

  // ---------- Sottofondo: ronzio profondo che respira + rombo lontano ----------
  function startBed() {
    const t = ctx.currentTime;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 240; lp.Q.value = 3;
    const g = ctx.createGain(); g.gain.value = 0.13;
    [[61.74, 'sawtooth', 0], [92.5, 'sawtooth', 7], [30.87, 'sine', 0]].forEach(([f, type, det]) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.detune.value = det;
      o.connect(lp); o.start(t); bedNodes.push(o);
    });
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.06;
    const lfoG = ctx.createGain(); lfoG.gain.value = 130;
    lfo.connect(lfoG); lfoG.connect(lp.frequency); lfo.start(t); bedNodes.push(lfo);
    lp.connect(g); g.connect(bus);

    const rumble = ctx.createBufferSource(); rumble.buffer = noise; rumble.loop = true;
    const rlp = ctx.createBiquadFilter(); rlp.type = 'lowpass'; rlp.frequency.value = 110;
    const rg = ctx.createGain(); rg.gain.value = 0.22;
    rumble.connect(rlp); rlp.connect(rg); rg.connect(bus); rumble.start(t); bedNodes.push(rumble);
  }

  function out(pan, gain) {
    const g = ctx.createGain(); g.gain.value = gain;
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan * 0.8; g.connect(p); p.connect(bus); }
    else g.connect(bus);
    return g;
  }
  const env = (param, t, peak, attack, decay) => {
    param.setValueAtTime(0.0001, t);
    param.exponentialRampToValueAtTime(peak, t + attack);
    param.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  };

  // ---------- Laser: "pew" in discesa, un po' diverso per tori e orsi ----------
  function laser(side, pan, near) {
    if (active.shot >= LIMIT.shot) return;
    active.shot++;
    const t = ctx.currentTime, dur = 0.17 + Math.random() * 0.06;
    const o = ctx.createOscillator(); o.type = side ? 'sawtooth' : 'square';
    const f0 = (side ? 1250 : 1750) * (0.9 + Math.random() * 0.2);
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.12, t + dur);
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = side ? 1500 : 2100; bp.Q.value = 0.9;
    const g = ctx.createGain();
    env(g.gain, t, 0.09 * near, 0.004, dur);
    o.connect(bp); bp.connect(g); g.connect(out(pan, 1));
    o.start(t); o.stop(t + dur + 0.05);
    o.onended = () => active.shot--;
  }

  // ---------- Cannone e artiglieria: colpo sordo con coda di rumore ----------
  function thump(pan, near, big) {
    const t = ctx.currentTime, dur = big ? 0.55 : 0.35;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(big ? 150 : 190, t);
    o.frequency.exponentialRampToValueAtTime(38, t + dur);
    const g = ctx.createGain(); env(g.gain, t, (big ? 0.55 : 0.4) * near, 0.005, dur);
    o.connect(g); g.connect(out(pan, 1)); o.start(t); o.stop(t + dur + 0.05);
    const n = ctx.createBufferSource(); n.buffer = noise; n.playbackRate.value = 0.8;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(big ? 1400 : 2200, t);
    lp.frequency.exponentialRampToValueAtTime(120, t + dur);
    const ng = ctx.createGain(); env(ng.gain, t, 0.28 * near, 0.003, dur * 0.8);
    n.connect(lp); lp.connect(ng); ng.connect(out(pan, 1));
    n.start(t, Math.random()); n.stop(t + dur);
  }

  // ---------- Esplosione: boato filtrato + colpo basso, più lunga per le liquidazioni ----------
  function boom(size, pan, near) {
    if (active.boom >= LIMIT.boom) return;
    active.boom++;
    const s = Math.max(0.3, Math.min(1.2, size || 0.5));
    const t = ctx.currentTime, dur = 0.7 + s * 1.3;
    const n = ctx.createBufferSource(); n.buffer = noise; n.playbackRate.value = 0.55 + Math.random() * 0.2;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 0.7;
    lp.frequency.setValueAtTime(2600, t);
    lp.frequency.exponentialRampToValueAtTime(70, t + dur);
    const g = ctx.createGain(); env(g.gain, t, (0.35 + 0.35 * s) * near, 0.01, dur);
    n.connect(lp); lp.connect(g); g.connect(out(pan, 1));
    n.start(t, Math.random()); n.stop(t + dur + 0.1);
    n.onended = () => active.boom--;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(26, t + dur * 0.8);
    const og = ctx.createGain(); env(og.gain, t, (0.45 + 0.4 * s) * near, 0.01, dur * 0.8);
    o.connect(og); og.connect(out(pan, 1)); o.start(t); o.stop(t + dur);
  }

  // ---------- Strumenti della musica ----------
  function brass(t, m, len, full) {
    [[m, 0.085], ...(full ? [[m - 12, 0.06]] : [])].forEach(([n, vol]) => {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2;
      lp.frequency.setValueAtTime(500, t); lp.frequency.exponentialRampToValueAtTime(3400, t + 0.05);
      lp.frequency.exponentialRampToValueAtTime(1700, t + 0.05 + Math.min(len, 0.5));
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.setValueAtTime(vol * 0.85, t + Math.max(0.03, len - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.15);
      lp.connect(g); g.connect(musicBus); if (len > STEP * 4) g.connect(echo);
      [-7, 7].forEach((det) => {
        const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(n); o.detune.value = det;
        o.connect(lp); o.start(t); o.stop(t + len + 0.2);
      });
    });
  }
  function strings(t, m, len, vol) {               // archi: note rapide, morbide, con l'eco
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m);
    const g = ctx.createGain(); env(g.gain, t, vol, 0.006, len);
    o.connect(g); g.connect(arpLp); o.start(t); o.stop(t + len + 0.05);
  }
  function bassNote(t, m, len) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 5;
    lp.frequency.setValueAtTime(700, t); lp.frequency.exponentialRampToValueAtTime(160, t + len);
    const g = ctx.createGain(); env(g.gain, t, 0.24, 0.005, len);
    o.connect(lp); lp.connect(g); g.connect(musicBus); o.start(t); o.stop(t + len + 0.05);
  }
  function timpani(t, m, v) {
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(mtof(m) * 1.5, t); o.frequency.exponentialRampToValueAtTime(mtof(m), t + 0.08);
    const g = ctx.createGain(); env(g.gain, t, 0.6 * v, 0.004, 0.6);
    o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.7);
    const n = ctx.createBufferSource(); n.buffer = noise;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 1;
    const ng = ctx.createGain(); env(ng.gain, t, 0.12 * v, 0.002, 0.08);
    n.connect(bp); bp.connect(ng); ng.connect(musicBus); n.start(t, Math.random()); n.stop(t + 0.12);
  }
  function crash(t) {
    const n = ctx.createBufferSource(); n.buffer = noise;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000;
    const g = ctx.createGain(); env(g.gain, t, 0.22, 0.003, 1.6);
    n.connect(hp); hp.connect(g); g.connect(musicBus); n.start(t, Math.random() * 0.3); n.stop(t + 1.7);
  }

  // ---------- Sequencer: programma le note con un po' di anticipo, senza scatti ----------
  function scheduleStep(t) {
    const c = CH[chordAt(pos)], s18 = pos % 18, beatStart = s18 % 6 === 0;
    const intro = pos < INTRO, trill = pos >= END || pos < 18, k = cellAt(pos);
    if (trill) {
      // trillo dei legni sulla dominante (Fa#-Sol), due note per semicroma
      strings(t, 78, STEP * 0.45, 0.05); strings(t + STEP / 2, 79, STEP * 0.45, 0.05);
      // e, nell'ultima metà di ogni battuta, gli archi che salgono in scala
      if (s18 >= 12) strings(t, [59, 61, 62, 64, 66, 67][s18 - 12] + 12, STEP * 0.9, 0.05);
    } else {
      // archi che turbinano: a ogni battito una scala che sale sulle note dell'accordo
      const [x, y, z] = c.tones, run = [x, y, z, x + 12, y + 12, z + 12];
      strings(t, run[s18 % 6] + 12, STEP * 0.9, intro ? 0.02 + s18 * 0.0015 : 0.035);
    }
    // basso al galoppo sul ritmo del tema: lunga, corta, lunga
    if (pos >= 18) {
      if (beatStart) bassNote(t, c.bass, STEP * 2.8);
      if (s18 % 6 === 3) bassNote(t, c.bass + 12, STEP * 0.9);
      if (s18 % 6 === 4) bassNote(t, c.bass, STEP * 1.8);
    }
    // timpani sul primo battito; rullo crescente prima di ripartire
    if (pos >= LOOP_END - 18) timpani(t, 42, 0.25 + (pos - (LOOP_END - 18)) / 24);
    else if (s18 === 0 && pos >= 18) timpani(t, c.bass + 12, 0.8);
    // piatti all'ingresso del tema, del Re maggiore e del Si maggiore
    if (pos === S || pos === S + 36 || pos === S + 96) crash(t);
    const notes = mel.get(pos);
    if (notes) notes.forEach(([m, len, cell]) => brass(t, m, len * STEP, cell >= 3));
  }
  function tick() {
    // gli archi si fanno più brillanti quando la battaglia è intensa, più morbidi quando è calma
    const now = performance.now();
    events = events.filter((x) => now - x < 3000);
    const heat = Math.min(1, events.length / 40);
    arpLp.frequency.setTargetAtTime(1600 + heat * 3000, ctx.currentTime, 0.8);
    while (nextT < ctx.currentTime + 0.12) {
      scheduleStep(nextT);
      nextT += STEP;
      pos++;
      if (pos >= LOOP_END) pos = S;               // l'introduzione si sente solo la prima volta
    }
  }
  function startMusic() {
    if (timer) return;
    nextT = ctx.currentTime + 0.08;
    timer = setInterval(tick, 25);
  }
  function stopMusic() { clearInterval(timer); timer = null; }

  function play(e) {
    if (!on || !ctx || ctx.state !== 'running') return;
    const pan = typeof e.pan === 'number' ? e.pan : 0, near = typeof e.near === 'number' ? e.near : 0.6;
    events.push(performance.now());
    if (e.k === 'boom' || e.k === 'launch') {
      const t = ctx.currentTime;
      duck.gain.cancelScheduledValues(t);
      duck.gain.setTargetAtTime(0.55, t, 0.02);
      duck.gain.setTargetAtTime(1, t + 0.25, 0.3);
    }
    if (e.k === 'shot') laser(e.side, pan, near);
    else if (e.k === 'cannon') thump(pan, near, false);
    else if (e.k === 'launch') thump(pan, near * 0.8, true);
    else if (e.k === 'boom') boom(e.s, pan, near);
  }

  function set(v) {
    on = !!v;
    if (!AC) return false;
    if (on) {
      if (!ctx) init();
      clearTimeout(suspendT);
      ctx.resume();
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0.75, ctx.currentTime, 0.4);   // entra in dissolvenza
      startMusic();
    } else if (ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
      suspendT = setTimeout(() => { if (!on) { stopMusic(); ctx.suspend(); } }, 700); // a volume spento non consuma CPU
    }
    return true;
  }

  window.FLSound = { set, play, supported: !!AC, _tap: () => ({ ctx, master, pos }) };
})();
