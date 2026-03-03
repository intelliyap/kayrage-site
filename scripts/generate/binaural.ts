/**
 * Binaural beat generator for KAY-OS.
 *
 * Produces a binaural beat by driving two sine oscillators at slightly
 * different frequencies — one hard-panned left, the other hard-panned right.
 * The perceptual "beat" frequency equals the difference between the two.
 *
 * Requires stereo headphones for the effect to be perceived.
 *
 * SSR-safe: all Tone.js usage is gated behind a dynamic import and a
 * `typeof window` check.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FocusLevel = 'sync' | 'edge' | 'expand' | 'void';

export interface BinauralConfig {
  /** Carrier (base) frequency in Hz. Both oscillators center around this. */
  carrierHz: number;
  /** Target beat frequency in Hz. Left = carrier + beat/2, Right = carrier - beat/2. */
  beatHz: number;
  /** Output volume in dB. */
  volume: number;
}

/** Default binaural beat frequencies per focus level. */
export const LEVEL_BEAT_HZ: Record<FocusLevel, number> = {
  sync: 10,      // alpha
  edge: 6,       // theta (4-7 Hz range, centre)
  expand: 4,     // deep theta (3-5 Hz range, centre)
  void: 3,       // theta-delta (2-4 Hz range, centre)
};

/** Carrier frequency bounds (Hz). */
const CARRIER_MIN = 100;
const CARRIER_MAX = 200;

// ---------------------------------------------------------------------------
// Tone.js type aliases (resolved at runtime via dynamic import)
// ---------------------------------------------------------------------------
type ToneModule = typeof import('tone');
type ToneOscillator = InstanceType<ToneModule['Oscillator']>;
type TonePanner = InstanceType<ToneModule['Panner']>;
type ToneGain = InstanceType<ToneModule['Gain']>;

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

export class BinauralGenerator {
  private Tone: ToneModule | null = null;

  private oscL: ToneOscillator | null = null;
  private oscR: ToneOscillator | null = null;
  private panL: TonePanner | null = null;
  private panR: TonePanner | null = null;
  private output: ToneGain | null = null;

  private _carrierHz: number;
  private _beatHz: number;
  private _volume: number;
  private _running = false;

  constructor(config: BinauralConfig) {
    this._carrierHz = clampCarrier(config.carrierHz);
    this._beatHz = config.beatHz;
    this._volume = config.volume;
  }

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  /** Initialise Tone.js nodes. Must be called before start(). */
  async init(masterOutput: AudioNode | null): Promise<void> {
    if (typeof window === 'undefined') return;

    const Tone = await import('tone');
    this.Tone = Tone;

    this.output = new Tone.Gain(Tone.dbToGain(this._volume));

    this.panL = new Tone.Panner(-1).connect(this.output);
    this.panR = new Tone.Panner(1).connect(this.output);

    this.oscL = new Tone.Oscillator({
      type: 'sine',
      frequency: this._carrierHz + this._beatHz / 2,
    }).connect(this.panL);

    this.oscR = new Tone.Oscillator({
      type: 'sine',
      frequency: this._carrierHz - this._beatHz / 2,
    }).connect(this.panR);

    if (masterOutput) {
      this.output.connect(masterOutput as never);
    }
  }

  /** Connect the output node to an arbitrary Tone destination. */
  connectTo(destination: AudioNode): void {
    if (this.output) {
      this.output.connect(destination as never);
    }
  }

  start(): void {
    if (this._running || !this.oscL || !this.oscR) return;
    this.oscL.start();
    this.oscR.start();
    this._running = true;
  }

  stop(): void {
    if (!this._running) return;
    this.oscL?.stop();
    this.oscR?.stop();
    this._running = false;
  }

  /** Tear down all nodes and release memory. */
  dispose(): void {
    this.stop();
    this.oscL?.dispose();
    this.oscR?.dispose();
    this.panL?.dispose();
    this.panR?.dispose();
    this.output?.dispose();
    this.oscL = null;
    this.oscR = null;
    this.panL = null;
    this.panR = null;
    this.output = null;
    this.Tone = null;
  }

  // -----------------------------------------------------------------------
  // Parameter control
  // -----------------------------------------------------------------------

  /** Set the beat frequency (Hz). Smoothly ramps both oscillators. */
  setFrequency(beatHz: number, rampTime = 2): void {
    if (!this.Tone || !this.oscL || !this.oscR) return;
    this._beatHz = beatHz;
    const now = this.Tone.now();
    this.oscL.frequency.rampTo(this._carrierHz + beatHz / 2, rampTime, now);
    this.oscR.frequency.rampTo(this._carrierHz - beatHz / 2, rampTime, now);
  }

  /** Set the carrier frequency (Hz, clamped 100-200). Smoothly ramps. */
  setCarrier(carrierHz: number, rampTime = 2): void {
    if (!this.Tone || !this.oscL || !this.oscR) return;
    this._carrierHz = clampCarrier(carrierHz);
    const now = this.Tone.now();
    this.oscL.frequency.rampTo(this._carrierHz + this._beatHz / 2, rampTime, now);
    this.oscR.frequency.rampTo(this._carrierHz - this._beatHz / 2, rampTime, now);
  }

  /** Set output volume in dB. */
  setVolume(db: number, rampTime = 0.5): void {
    if (!this.Tone || !this.output) return;
    this._volume = db;
    this.output.gain.rampTo(this.Tone.dbToGain(db), rampTime);
  }

  /**
   * Crossfade: smoothly transition from the current beat frequency to a new
   * one over `duration` seconds. Useful for level transitions.
   */
  crossfade(targetBeatHz: number, duration = 8): void {
    this.setFrequency(targetBeatHz, duration);
  }

  /**
   * Convenience: set beat frequency from a focus level.
   */
  setLevel(level: FocusLevel, rampTime = 4): void {
    this.setFrequency(LEVEL_BEAT_HZ[level], rampTime);
  }

  // -----------------------------------------------------------------------
  // Getters
  // -----------------------------------------------------------------------

  get carrierHz(): number {
    return this._carrierHz;
  }
  get beatHz(): number {
    return this._beatHz;
  }
  get running(): boolean {
    return this._running;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clampCarrier(hz: number): number {
  return Math.max(CARRIER_MIN, Math.min(CARRIER_MAX, hz));
}
