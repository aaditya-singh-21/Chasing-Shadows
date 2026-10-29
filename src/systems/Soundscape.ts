import type { SoundId } from '../core/types.ts';

/** Local synthesis only. The context is created after an explicit sound-button gesture. */
export class Soundscape {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  enabled = false;

  async toggle(): Promise<boolean> {
    this.enabled = !this.enabled;
    if (this.enabled) {
      try {
        if (!this.context) this.init();
        await this.context?.resume();
        this.master?.gain.setTargetAtTime(0.32, this.context?.currentTime ?? 0, 0.4);
      } catch {
        this.enabled = false;
      }
    } else if (this.master && this.context)
      this.master.gain.setTargetAtTime(0, this.context.currentTime, 0.1);
    return this.enabled;
  }

  private init(): void {
    const ctx = new AudioContext();
    this.context = ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;
    const ambience = ctx.createGain();
    ambience.gain.value = 0.12;
    filter.connect(ambience);
    ambience.connect(master);
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate),
      data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) {
      brown = (brown + (Math.random() * 2 - 1) * 0.02) / 1.02;
      data[i] = brown * 3.5;
    }
    this.noise = buffer;
    const wind = ctx.createBufferSource();
    wind.buffer = buffer;
    wind.loop = true;
    wind.connect(filter);
    wind.start();
    for (const [frequency, volume] of [
      [55, 0.035],
      [82.41, 0.025],
      [110.2, 0.012],
    ] as const) {
      const osc = ctx.createOscillator(),
        level = ctx.createGain();
      osc.frequency.value = frequency;
      level.gain.value = volume;
      osc.connect(level);
      level.connect(master);
      osc.start();
    }
  }

  suspend(paused: boolean): void {
    if (this.master && this.context && this.enabled)
      this.master.gain.setTargetAtTime(paused ? 0.1 : 0.32, this.context.currentTime, 0.2);
  }

  private tone(
    frequency: number,
    duration: number,
    volume = 0.2,
    type: OscillatorType = 'sine',
    end?: number,
  ): void {
    if (!this.enabled || !this.context || !this.master) return;
    const ctx = this.context,
      now = ctx.currentTime,
      osc = ctx.createOscillator(),
      gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (end) osc.frequency.exponentialRampToValueAtTime(end, now + duration);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private burst(duration: number, volume: number, frequency: number): void {
    if (!this.enabled || !this.context || !this.master || !this.noise) return;
    const ctx = this.context,
      now = ctx.currentTime,
      source = ctx.createBufferSource(),
      filter = ctx.createBiquadFilter(),
      gain = ctx.createGain();
    source.buffer = this.noise;
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(now, Math.random());
    source.stop(now + duration);
  }

  play(kind: SoundId): void {
    switch (kind) {
      case 'step':
        this.burst(0.13, 0.19, 500);
        break;
      case 'jump':
        this.burst(0.2, 0.1, 700);
        break;
      case 'land':
        this.burst(0.14, 0.23, 290);
        break;
      case 'knock':
        this.tone(150, 0.16, 0.35, 'triangle', 65);
        this.burst(0.06, 0.18, 750);
        break;
      case 'symbol':
        this.tone(490, 0.22, 0.12, 'sine', 460);
        break;
      case 'unlock':
        this.tone(330, 0.9, 0.15);
        this.tone(440, 1.4, 0.1);
        break;
      case 'unease':
        this.tone(110, 2.5, 0.12, 'sine', 82);
        this.tone(113, 2, 0.08);
        break;
      case 'gate':
      case 'door':
        this.burst(kind === 'gate' ? 1.7 : 0.8, 0.4, 240);
        this.tone(80, 0.8, 0.1, 'triangle', 38);
        break;
      case 'switch':
        this.burst(0.05, 0.14, 1100);
        break;
    }
  }
}
