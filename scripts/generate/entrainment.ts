/**
 * Non-binaural entrainment generators for KAY-OS.
 *
 * Three entrainment types:
 *   1. Isochronic — a tone whose amplitude is switched on/off at the target Hz.
 *   2. Monaural  — two tones mixed in a single channel producing a physical
 *                  amplitude-modulated beat.
 *   3. AM (amplitude modulation) — a sub-bass oscillator shaped by a Tremolo
 *                  at the target frequency.
 *
 * Gamma burst generator (40 Hz) for Expand and Void levels is also provided.
 *
 * SSR-safe: all Tone.js access is behind dynamic imports.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToneModule = typeof import('tone');

export interface EntrainmentConfig {
  /** Target entrainment frequency in Hz. */
  targetHz: number;
  /** Carrier / base tone frequency in Hz. */
  carrierHz: number;
  /** Output volume in dB. */
  volume: number;
}

export interface GammaBurstConfig {
  /** Burst carrier frequency in Hz (default 200). */
  carrierHz?: number;
  /** Burst duration in seconds (default 2). */
  burstDuration?: number;
  /** Volume in dB. */
  volume?: number;
}

// ---------------------------------------------------------------------------
// Isochronic Tone
// ---------------------------------------------------------------------------

export class IsochronicTone {
  private Tone: ToneModule | null = null;
  private osc: InstanceType<ToneModule['Oscillator']> | null = null;
  private amp: InstanceType<ToneModule['Gain']> | null = null;
  private lfo: InstanceType<ToneModule['LFO']> | null = null;
  private output: InstanceType<ToneModule['Gain']> | null = null;
  private _running = false;

  private config: EntrainmentConfig;

  constructor(config: EntrainmentConfig) {
    this.config = config;
  }

  async init(masterOutput: AudioNode | null): Promise<void> {
    if (typeof window === 'undefined') return;
    const Tone = await import('tone');
    this.Tone = Tone;

    this.output = new Tone.Gain(Tone.dbToGain(this.config.volume));

    // Amplitude gate controlled by an LFO (square wave → on/off pulsing).
    this.amp = new Tone.Gain(0).connect(this.output);

    this.lfo = new Tone.LFO({
      frequency: this.config.targetHz,
      type: 'square',
      min: 0,
      max: 1,
    }).connect(this.amp.gain as never);

    this.osc = new Tone.Oscillator({
      type: 'sine',
      frequency: this.config.carrierHz,
    }).connect(this.amp);

    if (masterOutput) {
      this.output.connect(masterOutput as never);
    }
  }

  connectTo(destination: AudioNode): void {
    this.output?.connect(destination as never);
  }

  start(): void {
    if (this._running) return;
    this.lfo?.start();
    this.osc?.start();
    this._running = true;
  }

  stop(): void {
    if (!this._running) return;
    this.osc?.stop();
    this.lfo?.stop();
    this._running = false;
  }

  setTargetHz(hz: number, rampTime = 2): void {
    if (!this.Tone || !this.lfo) return;
    this.lfo.frequency.rampTo(hz, rampTime);
  }

  setVolume(db: number, rampTime = 0.5): void {
    if (!this.Tone || !this.output) return;
    this.output.gain.rampTo(this.Tone.dbToGain(db), rampTime);
  }

  dispose(): void {
    this.stop();
    this.osc?.dispose();
    this.lfo?.dispose();
    this.amp?.dispose();
    this.output?.dispose();
    this.osc = null;
    this.lfo = null;
    this.amp = null;
    this.output = null;
    this.Tone = null;
  }

  get running(): boolean {
    return this._running;
  }
}

// ---------------------------------------------------------------------------
// Monaural Beat
// ---------------------------------------------------------------------------

export class MonauralBeat {
  private Tone: ToneModule | null = null;
  private oscA: InstanceType<ToneModule['Oscillator']> | null = null;
  private oscB: InstanceType<ToneModule['Oscillator']> | null = null;
  private mixer: InstanceType<ToneModule['Gain']> | null = null;
  private output: InstanceType<ToneModule['Gain']> | null = null;
  private _running = false;

  private config: EntrainmentConfig;

  constructor(config: EntrainmentConfig) {
    this.config = config;
  }

  async init(masterOutput: AudioNode | null): Promise<void> {
    if (typeof window === 'undefined') return;
    const Tone = await import('tone');
    this.Tone = Tone;

    this.output = new Tone.Gain(Tone.dbToGain(this.config.volume));

    // Both tones are summed into the same mono channel — the physical
    // interference creates the amplitude-modulated beat.
    this.mixer = new Tone.Gain(0.5).connect(this.output);

    this.oscA = new Tone.Oscillator({
      type: 'sine',
      frequency: this.config.carrierHz + this.config.targetHz / 2,
    }).connect(this.mixer);

    this.oscB = new Tone.Oscillator({
      type: 'sine',
      frequency: this.config.carrierHz - this.config.targetHz / 2,
    }).connect(this.mixer);

    if (masterOutput) {
      this.output.connect(masterOutput as never);
    }
  }

  connectTo(destination: AudioNode): void {
    this.output?.connect(destination as never);
  }

  start(): void {
    if (this._running) return;
    this.oscA?.start();
    this.oscB?.start();
    this._running = true;
  }

  stop(): void {
    if (!this._running) return;
    this.oscA?.stop();
    this.oscB?.stop();
    this._running = false;
  }

  setTargetHz(hz: number, rampTime = 2): void {
    if (!this.Tone || !this.oscA || !this.oscB) return;
    const now = this.Tone.now();
    this.oscA.frequency.rampTo(this.config.carrierHz + hz / 2, rampTime, now);
    this.oscB.frequency.rampTo(this.config.carrierHz - hz / 2, rampTime, now);
    this.config.targetHz = hz;
  }

  setVolume(db: number, rampTime = 0.5): void {
    if (!this.Tone || !this.output) return;
    this.output.gain.rampTo(this.Tone.dbToGain(db), rampTime);
  }

  dispose(): void {
    this.stop();
    this.oscA?.dispose();
    this.oscB?.dispose();
    this.mixer?.dispose();
    this.output?.dispose();
    this.oscA = null;
    this.oscB = null;
    this.mixer = null;
    this.output = null;
    this.Tone = null;
  }

  get running(): boolean {
    return this._running;
  }
}

// ---------------------------------------------------------------------------
// Amplitude-Modulated Sub-Bass
// ---------------------------------------------------------------------------

export class AMEntrainment {
  private Tone: ToneModule | null = null;
  private osc: InstanceType<ToneModule['Oscillator']> | null = null;
  private tremolo: InstanceType<ToneModule['Tremolo']> | null = null;
  private output: InstanceType<ToneModule['Gain']> | null = null;
  private _running = false;

  private config: EntrainmentConfig;

  constructor(config: EntrainmentConfig) {
    this.config = config;
  }

  async init(masterOutput: AudioNode | null): Promise<void> {
    if (typeof window === 'undefined') return;
    const Tone = await import('tone');
    this.Tone = Tone;

    this.output = new Tone.Gain(Tone.dbToGain(this.config.volume));

    this.tremolo = new Tone.Tremolo({
      frequency: this.config.targetHz,
      depth: 1,
      type: 'sine',
      spread: 0,
    }).connect(this.output).start();

    this.osc = new Tone.Oscillator({
      type: 'sine',
      frequency: this.config.carrierHz,
    }).connect(this.tremolo);

    if (masterOutput) {
      this.output.connect(masterOutput as never);
    }
  }

  connectTo(destination: AudioNode): void {
    this.output?.connect(destination as never);
  }

  start(): void {
    if (this._running) return;
    this.osc?.start();
    this._running = true;
  }

  stop(): void {
    if (!this._running) return;
    this.osc?.stop();
    this._running = false;
  }

  setTargetHz(hz: number, rampTime = 2): void {
    if (!this.tremolo) return;
    this.tremolo.frequency.rampTo(hz, rampTime);
  }

  setVolume(db: number, rampTime = 0.5): void {
    if (!this.Tone || !this.output) return;
    this.output.gain.rampTo(this.Tone.dbToGain(db), rampTime);
  }

  dispose(): void {
    this.stop();
    this.osc?.dispose();
    this.tremolo?.dispose();
    this.output?.dispose();
    this.osc = null;
    this.tremolo = null;
    this.output = null;
    this.Tone = null;
  }

  get running(): boolean {
    return this._running;
  }
}

// ---------------------------------------------------------------------------
// Gamma Burst Generator (40 Hz)
// ---------------------------------------------------------------------------

/**
 * Produces short 40 Hz gamma bursts used at the Expand and Void focus levels.
 *
 * At Expand: trigger a burst every ~30 s.
 * At Void:   sustained 40 Hz (long burst or continuous).
 */
export class GammaBurstGenerator {
  private Tone: ToneModule | null = null;
  private osc: InstanceType<ToneModule['Oscillator']> | null = null;
  private tremolo: InstanceType<ToneModule['Tremolo']> | null = null;
  private envelope: InstanceType<ToneModule['Gain']> | null = null;
  private output: InstanceType<ToneModule['Gain']> | null = null;
  private _intervalId: ReturnType<typeof setInterval> | null = null;
  private _running = false;

  private carrierHz: number;
  private burstDuration: number;
  private volume: number;

  constructor(config: GammaBurstConfig = {}) {
    this.carrierHz = config.carrierHz ?? 200;
    this.burstDuration = config.burstDuration ?? 2;
    this.volume = config.volume ?? -20;
  }

  async init(masterOutput: AudioNode | null): Promise<void> {
    if (typeof window === 'undefined') return;
    const Tone = await import('tone');
    this.Tone = Tone;

    this.output = new Tone.Gain(Tone.dbToGain(this.volume));

    // The envelope gain starts at 0; we ramp it up/down for each burst.
    this.envelope = new Tone.Gain(0).connect(this.output);

    this.tremolo = new Tone.Tremolo({
      frequency: 40,
      depth: 1,
      type: 'sine',
      spread: 0,
    }).connect(this.envelope).start();

    this.osc = new Tone.Oscillator({
      type: 'sine',
      frequency: this.carrierHz,
    }).connect(this.tremolo);

    if (masterOutput) {
      this.output.connect(masterOutput as never);
    }
  }

  connectTo(destination: AudioNode): void {
    this.output?.connect(destination as never);
  }

  /** Start the oscillator (stays running; bursts are envelope-gated). */
  start(): void {
    if (this._running) return;
    this.osc?.start();
    this._running = true;
  }

  stop(): void {
    if (!this._running) return;
    this.stopBurstLoop();
    this.setSustained(false);
    this.osc?.stop();
    this._running = false;
  }

  /** Fire a single burst: fade in, sustain for `burstDuration`, fade out. */
  triggerBurst(duration?: number): void {
    if (!this.Tone || !this.envelope) return;
    const dur = duration ?? this.burstDuration;
    const now = this.Tone.now();
    this.envelope.gain.cancelScheduledValues(now);
    this.envelope.gain.setValueAtTime(0, now);
    this.envelope.gain.rampTo(1, 0.3, now);
    this.envelope.gain.rampTo(0, 0.5, now + dur);
  }

  /** Start automatic bursts every `intervalSeconds` seconds (Expand level). */
  startBurstLoop(intervalSeconds = 30): void {
    this.stopBurstLoop();
    this.triggerBurst();
    this._intervalId = setInterval(() => {
      this.triggerBurst();
    }, intervalSeconds * 1000);
  }

  stopBurstLoop(): void {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  /** For Void level: hold the 40 Hz modulation continuously. */
  setSustained(on: boolean): void {
    if (!this.Tone || !this.envelope) return;
    const now = this.Tone.now();
    this.envelope.gain.cancelScheduledValues(now);
    this.envelope.gain.rampTo(on ? 1 : 0, 1, now);
  }

  setVolume(db: number, rampTime = 0.5): void {
    if (!this.Tone || !this.output) return;
    this.output.gain.rampTo(this.Tone.dbToGain(db), rampTime);
  }

  dispose(): void {
    this.stop();
    this.osc?.dispose();
    this.tremolo?.dispose();
    this.envelope?.dispose();
    this.output?.dispose();
    this.osc = null;
    this.tremolo = null;
    this.envelope = null;
    this.output = null;
    this.Tone = null;
  }

  get running(): boolean {
    return this._running;
  }
}
