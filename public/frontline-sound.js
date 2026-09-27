// Audio di BTC Frontline: una battaglia spaziale sintetizzata con la Web Audio API.
// Nessun file audio: sottofondo (ronzio dell'astronave e rombo lontano), laser dei soldati,
// cannoni dei carri, lanci d'artiglieria ed esplosioni, generati al momento.
// La scena 3D (nell'iframe) segnala gli eventi; qui diventano suoni, con il panning sullo schermo.
(function () {
  const AC = window.AudioContext || window.webkitAudioContext;
  let ctx = null, master = null, bus = null, noise = null, bedNodes = [], on = false, suspendT = null;
  const active = { shot: 0, boom: 0 };
  const LIMIT = { shot: 7, boom: 5 };

  function init() {
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -20; comp.knee.value = 12; comp.ratio.value = 5; comp.attack.value = 0.003; comp.release.value = 0.25;
    master = ctx.createGain(); master.gain.value = 0;
    bus = ctx.createGain(); bus.gain.value = 0.9;
    bus.connect(master); master.connect(comp); comp.connect(ctx.destination);
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

  function play(e) {
    if (!on || !ctx || ctx.state !== 'running') return;
    const pan = typeof e.pan === 'number' ? e.pan : 0, near = typeof e.near === 'number' ? e.near : 0.6;
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
    } else if (ctx) {
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
      suspendT = setTimeout(() => { if (!on) ctx.suspend(); }, 700); // a volume spento non consuma CPU
    }
    return true;
  }

  window.FLSound = { set, play, supported: !!AC };
})();
