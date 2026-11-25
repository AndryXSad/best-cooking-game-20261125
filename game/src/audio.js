// audio.js — Dapur Kilat: all sound is synthesized with WebAudio.
// No audio files, no network. One clear job: bleeps, sizzles and a tune.

const AudioSys = {
  ctx: null,
  muted: false,
  musicOn: false,
  musicTimer: 0,
  musicStep: 0,
  sizzleNodes: null,

  ensure() {
    if (!this.ctx) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AC();
      } catch (e) { this.ctx = null; }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },

  tone(freq, dur, type, vol, when) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + (when || 0);
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  },

  noise(dur, vol, filterFreq) {
    if (this.muted) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = filterFreq || 1800;
    const g = ctx.createGain();
    g.gain.value = vol || 0.15;
    src.connect(f).connect(g).connect(ctx.destination);
    src.start();
  },

  pickup()  { this.tone(520, 0.07, 'triangle', 0.10); },
  putdown() { this.tone(300, 0.08, 'triangle', 0.10); },
  chop()    { this.noise(0.09, 0.22, 900); this.tone(140, 0.06, 'square', 0.05); },
  chopDone(){ this.tone(660, 0.09, 'triangle', 0.12); this.tone(880, 0.12, 'triangle', 0.12, 0.08); },
  sizzle()  { this.noise(0.25, 0.10, 3200); },
  ding()    { this.tone(1046, 0.18, 'sine', 0.14); this.tone(1568, 0.28, 'sine', 0.10, 0.09); },
  coin()    { this.tone(988, 0.08, 'square', 0.07); this.tone(1319, 0.16, 'square', 0.07, 0.07); },
  reject()  { this.tone(180, 0.18, 'sawtooth', 0.10); this.tone(140, 0.22, 'sawtooth', 0.10, 0.1); },
  burnt()   { this.tone(220, 0.3, 'sawtooth', 0.09); this.noise(0.2, 0.12, 500); },
  orderIn() { this.tone(784, 0.1, 'triangle', 0.10); this.tone(1046, 0.14, 'triangle', 0.10, 0.09); },
  tick()    { this.tone(1200, 0.04, 'square', 0.05); },
  win()     { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.12, i * 0.11)); },

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  },

  // A tiny 16-step bass + sparkle loop, driven from the game loop so it
  // stays in sync with play and costs no extra timer.
  updateMusic(dt, playing) {
    if (this.muted || !playing) return;
    this.musicTimer += dt;
    const stepDur = 0.22;
    while (this.musicTimer >= stepDur) {
      this.musicTimer -= stepDur;
      const bass = [130.8, 0, 164.8, 0, 196.0, 0, 164.8, 146.8, 130.8, 0, 164.8, 0, 196.0, 220.0, 246.9, 0];
      const note = bass[this.musicStep % 16];
      if (note) this.tone(note, 0.2, 'triangle', 0.045);
      if (this.musicStep % 4 === 2) this.tone(1046 + (this.musicStep % 8) * 40, 0.08, 'sine', 0.02);
      this.musicStep++;
    }
  },
};
