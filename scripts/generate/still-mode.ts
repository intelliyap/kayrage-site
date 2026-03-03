/**
 * Still-mode audio engine for KAY-OS.
 *
 * Produces four layers for eyes-closed meditation sessions:
 *   Layer 1 — Binaural foundation (stereo-separated beat)
 *   Layer 2 — Harmonic drone (tanpura-inspired sine + triangle)
 *   Layer 3 — Ambient texture (brown noise → lowpass → reverb)
 *   Layer 4 — Voice ducking (sidechain-style gain reduction when voice plays)
 *
 * SSR-safe: all Tone.js usage gated behind dynamic import.
 */

import { BinauralGenerator, LEVEL_BEAT_HZ } from './binaural';
import { GammaBurstGenerator } from './entrainment';

type FocusLevel = 'sync' | 'edge' | 'expand' | 'void';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToneModule = typeof import('tone');

export interface StillModeConfig {
  /** Focus level determines binaural target and gamma behaviour. */
  focusLevel: FocusLevel;
  /** Carrier frequency for binaural oscillators (Hz, 100-200). */
  carrierHz?: number;
  /** Reverb decay time in seconds (default 8). */
  reverbDecay?: number;
  /** Ambient noise volume in dB (default -26). */
  noiseLevel?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DRONE_ROOT_HZ = 110;           // A2
const DRONE_VOLUME_DB = -18;
const DRONE_TRIANGLE_OFFSET_DB = -12; // triangle partial 12 dB below fundamental
const NOISE_FILTER_MIN_HZ = 200;
const NOISE_FILTER_MAX_HZ = 800;
const NOISE_FILTER_CYCLE_S = 45;      // one LFO cycle
const DUCK_DB = -4;                   // reduce music by ~4 dB when voice active
const DUCK_RAMP_S = 0.6;

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

export class StillModeEngine {
  private Tone: ToneModule | null = null;

  // Layer 1 — Binaural
  private binaural: BinauralGenerator;
  private gamma: GammaBurstGenerator;

  // Layer 2 — Harmonic Drone
  private droneFundamental: InstanceType<ToneModule['Oscillator']> | null = null;
  private droneHarmonic: InstanceType<ToneModule['Oscillator']> | null = null;
  private droneGain: InstanceType<ToneModule['Gain']> | null = null;

  // Layer 3 — Ambient Texture
  private noise: InstanceType<ToneModule['Noise']> | null = null;
  private noiseFilter: InstanceType<ToneModule['Filter']> | null = null;
  private noiseFilterLFO: InstanceType<ToneModule['LFO']> | null = null;
  private noiseGain: InstanceType<ToneModule['Gain']> | null = null;

  // Layer 4 — Voice Ducking
  private musicBus: InstanceType<ToneModule['Gain']> | null = null;

  // Shared effects
  private reverb: InstanceType<ToneModule['Reverb']> | null = null;
  private output: InstanceType<ToneModule['Gain']> | null = null;

  // State
  private _focusLevel: FocusLevel;
  private _running = false;
  private _voiceActive = false;
  private _config: StillModeConfig;

  constructor(config: StillModeConfig) {
    this._config = config;
    this._focusLevel = config.focusLevel;

    this.binaural = new BinauralGenerator({
      carrierHz: config.carrierHz ?? 150,
      beatHz: LEVEL_BEAT_HZ[config.focusLevel],
      volume: -12,
    });

    this.gamma = new GammaBurstGenerator({ volume: -22 });
  }

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  async init(masterOutput: AudioNode | null): Promise<void> {
    if (typeof window === 'undefined') return;

    const Tone = await import('tone');
    this.Tone = Tone;

    // --- Output chain ---
    this.output = new Tone.Gain(1);
    if (masterOutput) {
      this.output.connect(masterOutput as never);
    }

    // Music bus (everything except voice) — target for ducking.
    this.musicBus = new Tone.Gain(1).connect(this.output);

    // Shared reverb for drone + noise + voice return.
    this.reverb = new Tone.Reverb({
      decay: this._config.reverbDecay ?? 8,
      wet: 0.6,
    });
    await this.reverb.generate();
    this.reverb.connect(this.musicBus);

    // --- Layer 1: Binaural ---
    await this.binaural.init(null);
    this.binaural.connectTo(this.musicBus as never);

    // --- Gamma bursts ---
    await this.gamma.init(null);
    this.gamma.connectTo(this.musicBus as never);

    // --- Layer 2: Harmonic Drone ---
    this.droneGain = new Tone.Gain(Tone.dbToGain(DRONE_VOLUME_DB)).connect(this.reverb);

    this.droneFundamental = new Tone.Oscillator({
      type: 'sine',
      frequency: DRONE_ROOT_HZ,
    }).connect(this.droneGain);

    // 3rd partial (harmonic) at -12 dB below fundamental
    const harmonicGain = new Tone.Gain(Tone.dbToGain(DRONE_TRIANGLE_OFFSET_DB)).connect(this.droneGain);
    this.droneHarmonic = new Tone.Oscillator({
      type: 'triangle',
      frequency: DRONE_ROOT_HZ * 3,   // 3rd partial
    }).connect(harmonicGain);

    // Very slow filter sweep on the drone (60+ second cycles).
    // Implemented as a separate filter on the drone bus.
    const droneFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 600,
      Q: 0.7,
    });
    this.droneGain.disconnect();
    this.droneGain.connect(droneFilter);
    droneFilter.connect(this.reverb);

    const droneFilterLFO = new Tone.LFO({
      frequency: 1 / 65, // ~65 s cycle
      min: 300,
      max: 900,
      type: 'sine',
    }).connect(droneFilter.frequency as never);
    droneFilterLFO.start();

    // --- Layer 3: Ambient Texture ---
    const noiseVol = this._config.noiseLevel ?? -26;
    this.noiseGain = new Tone.Gain(Tone.dbToGain(noiseVol)).connect(this.musicBus);

    this.noiseFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 400,
      Q: 0.5,
    }).connect(this.noiseGain);

    // LFO sweeps the noise filter cutoff.
    this.noiseFilterLFO = new Tone.LFO({
      frequency: 1 / NOISE_FILTER_CYCLE_S,
      min: NOISE_FILTER_MIN_HZ,
      max: NOISE_FILTER_MAX_HZ,
      type: 'sine',
    }).connect(this.noiseFilter.frequency as never);

    this.noise = new Tone.Noise('brown').connect(this.noiseFilter);
  }

  /** Expose the reverb node so the mixer can route voice through it. */
  getReverbBus(): AudioNode | null {
    return this.reverb as unknown as AudioNode | null;
  }

  /** Expose the output so the mixer can patch things in. */
  getOutput(): AudioNode | null {
    return this.output as unknown as AudioNode | null;
  }

  start(): void {
    if (this._running) return;

    // Binaural
    this.binaural.start();

    // Drone
    this.droneFundamental?.start();
    this.droneHarmonic?.start();

    // Noise
    this.noise?.start();
    this.noiseFilterLFO?.start();

    // Gamma (level-dependent)
    this.gamma.start();
    this._applyGammaForLevel();

    this._running = true;
  }

  stop(): void {
    if (!this._running) return;
    this.binaural.stop();
    this.gamma.stop();
    this.droneFundamental?.stop();
    this.droneHarmonic?.stop();
    this.noise?.stop();
    this.noiseFilterLFO?.stop();
    this._running = false;
  }

  dispose(): void {
    this.stop();
    this.binaural.dispose();
    this.gamma.dispose();
    this.droneFundamental?.dispose();
    this.droneHarmonic?.dispose();
    this.droneGain?.dispose();
    this.noise?.dispose();
    this.noiseFilter?.dispose();
    this.noiseFilterLFO?.dispose();
    this.noiseGain?.dispose();
    this.reverb?.dispose();
    this.musicBus?.dispose();
    this.output?.dispose();
    this.Tone = null;
  }

  // -----------------------------------------------------------------------
  // Level control
  // -----------------------------------------------------------------------

  /** Transition to a new focus level. Smoothly crossfades binaural frequency
   *  and adjusts gamma behaviour. */
  setLevel(level: FocusLevel, rampTime = 6): void {
    this._focusLevel = level;
    this.binaural.setLevel(level, rampTime);
    this._applyGammaForLevel();
  }

  private _applyGammaForLevel(): void {
    switch (this._focusLevel) {
      case 'expand':
        this.gamma.setSustained(false);
        this.gamma.startBurstLoop(30);
        break;
      case 'void':
        this.gamma.stopBurstLoop();
        this.gamma.setSustained(true);
        break;
      default:
        this.gamma.stopBurstLoop();
        this.gamma.setSustained(false);
        break;
    }
  }

  // -----------------------------------------------------------------------
  // Voice ducking (Layer 4)
  // -----------------------------------------------------------------------

  /** Call when voice guidance begins playing. Reduces music bus by ~4 dB. */
  voiceStart(): void {
    if (!this.Tone || !this.musicBus || this._voiceActive) return;
    this._voiceActive = true;
    this.musicBus.gain.rampTo(
      this.Tone.dbToGain(DUCK_DB),
      DUCK_RAMP_S,
    );
  }

  /** Call when voice guidance ends. Restores music bus to 0 dB. */
  voiceEnd(): void {
    if (!this.Tone || !this.musicBus || !this._voiceActive) return;
    this._voiceActive = false;
    this.musicBus.gain.rampTo(1, DUCK_RAMP_S);
  }

  // -----------------------------------------------------------------------
  // Getters
  // -----------------------------------------------------------------------

  get running(): boolean {
    return this._running;
  }
  get focusLevel(): FocusLevel {
    return this._focusLevel;
  }
}
