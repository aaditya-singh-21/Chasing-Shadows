// All sound is synthesized locally. No samples, downloads, or microphone access.
export class Soundscape {
  constructor() { this.context = null; this.enabled = false; this.master = null; }
  async toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      try {
        if (!this.context) this.init();
        await this.context.resume();
        this.master.gain.setTargetAtTime(.32, this.context.currentTime, .4);
      } catch { this.enabled = false; }
    } else if (this.master) this.master.gain.setTargetAtTime(0, this.context.currentTime, .1);
    return this.enabled;
  }
  init() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    this.context = new Audio();
    const ctx = this.context;
    this.master = ctx.createGain(); this.master.gain.value = 0; this.master.connect(ctx.destination);
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 350;
    const ambience = ctx.createGain(); ambience.gain.value = .12; filter.connect(ambience); ambience.connect(this.master);
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) { brown = (brown + (Math.random() * 2 - 1) * .02) / 1.02; data[i] = brown * 3.5; }
    this.noise = buffer;
    const wind = ctx.createBufferSource(); wind.buffer = buffer; wind.loop = true; wind.connect(filter); wind.start();
    for (const [frequency, gain] of [[55, .035], [82.41, .025], [110.2, .012]]) {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = frequency;
      const level = ctx.createGain(); level.gain.value = gain; osc.connect(level); level.connect(this.master); osc.start();
    }
  }
  suspend(paused) { if (this.master && this.enabled) this.master.gain.setTargetAtTime(paused ? .1 : .32, this.context.currentTime, .2); }
  tone(frequency, duration, volume = .2, type = 'sine', end = null) {
    if (!this.enabled || !this.context) return;
    const ctx = this.context, now = ctx.currentTime;
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.type = type; osc.frequency.setValueAtTime(frequency, now);
    if (end) osc.frequency.exponentialRampToValueAtTime(end, now + duration);
    gain.gain.setValueAtTime(.001, now); gain.gain.exponentialRampToValueAtTime(volume, now + .012);
    gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    osc.connect(gain); gain.connect(this.master); osc.start(now); osc.stop(now + duration + .02);
  }
  noiseBurst(duration, volume, frequency) {
    if (!this.enabled || !this.context) return;
    const ctx = this.context, now = ctx.currentTime;
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = this.noise; filter.type = 'bandpass'; filter.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(.001, now + duration);
    source.connect(filter); filter.connect(gain); gain.connect(this.master); source.start(now, Math.random()); source.stop(now + duration);
  }
  play(kind) {
    if (kind === 'step') this.noiseBurst(.13, .23, 500);
    else if (kind === 'jump') this.noiseBurst(.2, .12, 700);
    else if (kind === 'knock') { this.tone(150, .16, .35, 'triangle', 65); this.noiseBurst(.06, .18, 750); }
    else if (kind === 'symbol') this.tone(490, .22, .12, 'sine', 460);
    else if (kind === 'unlock') { this.tone(330, .9, .15); this.tone(440, 1.4, .1); }
    else if (kind === 'unease') { this.tone(110, 2.5, .12, 'sine', 82); this.tone(113, 2, .08); }
    else if (kind === 'gate' || kind === 'door') { this.noiseBurst(kind === 'gate' ? 1.7 : .8, .4, 240); this.tone(80, .8, .1, 'triangle', 38); }
  }
}
