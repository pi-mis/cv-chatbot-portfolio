// Audio di BTC Frontline: una battaglia spaziale con colonna sonora, sintetizzata con la Web Audio API.
// Nessun file audio: musica synthwave, sottofondo (ronzio dell'astronave e rombo lontano), laser dei soldati,
// cannoni dei carri, lanci d'artiglieria ed esplosioni, generati al momento.
// La scena 3D (nell'iframe) segnala gli eventi; qui diventano suoni, con il panning sullo schermo.
(function () {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master = null, bus = null, noise = null, bedNodes = [], on = false, suspendT = null;
  let musicBus = null, duck = null, echo = null, arpLp = null;

  // ---------- Musica: synthwave spaziale in La minore, 118 BPM ----------
  const BPM = 118, STEP = 60 / BPM / 4;          // durata di una semicroma
  const MUSIC_VOL = 0.5;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // giro di accordi i–VI–III–VII: Lam, Fa, Do, Sol
  const CHORDS = [
    { bass: 33, arp: [57, 60, 64, 69], pad: [57, 60, 64] },
    { bass: 29, arp: [53, 57, 60, 65], pad: [53, 57, 60] },
    { bass: 36, arp: [55, 60, 64, 67], pad: [55, 60, 64] },
    { bass: 31, arp: [55, 59, 62, 67], pad: [55, 59, 62] }
  ];
  const ARP = [0, 1, 2, 3, 1, 2, 3, 2, 0, 1, 2, 3, 2, 3, 1, 2];
  // melodia: [semicroma, nota MIDI, durata in semicrome], una battuta per accordo
  const LEAD_A = [
    [[0, 76, 3], [3, 74, 1], [4, 72, 2], [6, 69, 2], [8, 72, 4], [12, 74, 4]],
    [[0, 72, 3], [3, 74, 1], [4, 76, 4], [8, 77, 2], [10, 76, 2], [12, 72, 4]],
    [[0, 76, 3], [3, 79, 1], [4, 76, 2], [6, 74, 2], [8, 72, 6], [14, 74, 2]],
    [[0, 74, 4], [4, 71, 2], [6, 74, 2], [8, 79, 4], [12, 76, 4]]
  ];
  const LEAD_B = [LEAD_A[0], LEAD_A[1], LEAD_A[2], [[0, 74, 3], [3, 76, 1], [4, 79, 6], [10, 81, 2], [12, 79, 4]]];
  // 16 battute: 4 di intro (pad, arpeggio, charleston), 4 con cassa e basso, 8 con la melodia; poi riparte dalla 5ª
  let step = 0, bar = 0, nextT = 0, timer = null, events = [];
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
    [[55, 'sawtooth', 0], [82.4, 'sawtooth', 7], [27.5, 'sine', 0]].forEach(([f, type, det]) => {
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
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
    env(g.gain, t, 0.9, 0.003, 0.32);
    o.connect(g); g.connect(musicBus); o.start(t); o.stop(t + 0.4);
  }
  function snare(t, v = 1) {
    const n = ctx.createBufferSource(); n.buffer = noise;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1600;
    const g = ctx.createGain(); env(g.gain, t, 0.32 * v, 0.002, 0.17);
    n.connect(hp); hp.connect(g); g.connect(musicBus); n.start(t, Math.random()); n.stop(t + 0.22);
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.setValueAtTime(190, t); o.frequency.exponentialRampToValueAtTime(120, t + 0.1);
    const og = ctx.createGain(); env(og.gain, t, 0.25 * v, 0.002, 0.1);
    o.connect(og); og.connect(musicBus); o.start(t); o.stop(t + 0.15);
  }
  function hat(t, open, v) {
    const n = ctx.createBufferSource(); n.buffer = noise;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7500;
    const g = ctx.createGain(); env(g.gain, t, v, 0.001, open ? 0.2 : 0.045);
    n.connect(hp); hp.connect(g); g.connect(musicBus); n.start(t, Math.random()); n.stop(t + (open ? 0.25 : 0.08));
  }
  function bassNote(t, m, len) {
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 6;
    lp.frequency.setValueAtTime(900, t); lp.frequency.exponentialRampToValueAtTime(180, t + len);
    const g = ctx.createGain(); env(g.gain, t, 0.26, 0.004, len);
    o.connect(lp); lp.connect(g); g.connect(musicBus); o.start(t); o.stop(t + len + 0.05);
  }
  function arpNote(t, m) {
    const o = ctx.createOscillator(); o.type = 'square'; o.frequency.value = mtof(m);
    const g = ctx.createGain(); env(g.gain, t, 0.07, 0.003, STEP * 0.9);
    o.connect(g); g.connect(arpLp); o.start(t); o.stop(t + STEP + 0.05);
  }
  function padChord(t, notes, len) {
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.05, t + 0.6);
    g.gain.setValueAtTime(0.05, t + len - 0.4); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.3);
    lp.connect(g); g.connect(musicBus);
    notes.forEach((m) => [-8, 8].forEach((det) => {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mtof(m); o.detune.value = det;
      o.connect(lp); o.start(t); o.stop(t + len + 0.4);
    }));
  }
  function leadNote(t, m, len) {
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = mtof(m);
    const o2 = ctx.createOscillator(); o2.type = 'square'; o2.frequency.value = mtof(m); o2.detune.value = 6;
    const vib = ctx.createOscillator(); vib.frequency.value = 5.5; const vg = ctx.createGain(); vg.gain.value = 5;
    vib.connect(vg); vg.connect(o.detune); vg.connect(o2.detune);
    const mix = ctx.createGain(); mix.gain.value = 0.35; o2.connect(mix);
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.02);
    g.gain.setValueAtTime(0.09, t + Math.max(0.03, len - 0.06)); g.gain.exponentialRampToValueAtTime(0.0001, t + len + 0.12);
    o.connect(lp); mix.connect(lp); lp.connect(g); g.connect(musicBus); g.connect(echo);
    [o, o2, vib].forEach((x) => { x.start(t); x.stop(t + len + 0.2); });
  }

  // ---------- Sequencer: programma le note con un po' di anticipo, senza scatti ----------
  function scheduleStep(t) {
    const c = CHORDS[bar % 4], s16 = step, beat = s16 % 4 === 0;
    const drums = bar >= 4, lead = bar >= 8, fill = bar % 8 === 7 && s16 >= 12;
    if (s16 === 0) padChord(t, c.pad, STEP * 16);
    arpNote(t, c.arp[ARP[s16]] + (lead && s16 % 8 === 7 ? 12 : 0));
    hat(t, s16 % 8 === 6 && drums, s16 % 2 ? 0.05 : 0.09);
    if (drums) {
      if (beat) kick(t);
      if (s16 === 4 || s16 === 12) snare(t);
      if (fill && s16 % 1 === 0 && s16 !== 12) snare(t, 0.35 + (s16 - 12) * 0.15);
      if (s16 % 2 === 0) bassNote(t, c.bass + (s16 % 4 === 2 ? 12 : 0), STEP * 1.8);
    }
    if (lead) {
      const phrase = (bar % 8 < 4 ? LEAD_A : LEAD_B)[bar % 4];
      phrase.forEach(([at, m, len]) => { if (at === s16) leadNote(t, m, len * STEP); });
    }
  }
  function tick() {
    // l'arpeggio si apre quando la battaglia è intensa, si chiude quando è calma
    const now = performance.now();
    events = events.filter((x) => now - x < 3000);
    const heat = Math.min(1, events.length / 40);
    arpLp.frequency.setTargetAtTime(1300 + heat * 3200, ctx.currentTime, 0.8);
    while (nextT < ctx.currentTime + 0.12) {
      scheduleStep(nextT);
      nextT += STEP;
      step = (step + 1) % 16;
      if (step === 0) { bar++; if (bar >= 16) bar = 4; }
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

  window.FLSound = { set, play, supported: !!AC, _tap: () => ({ ctx, master, bar, step }) };
})();
