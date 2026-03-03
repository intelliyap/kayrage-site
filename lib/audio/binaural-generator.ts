/**
 * In-browser binaural beat generator for KAY-OS.
 *
 * Pure Web Audio API (no Tone.js). Three layers:
 *   1. Binaural beat — two sine oscillators, stereo-panned L/R, offset by binauralFreq Hz
 *   2. Harmonic drone — sine at carrier/2 + triangle at carrier*3, very quiet
 *   3. Brown noise — 4-second looping AudioBuffer through lowpass filter
 *
 * Interface duck-typed to match BedPlayer for use as a BedSource in SessionMixer.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BinauralGeneratorConfig {
  binauralFreq: number; // Hz offset between L/R oscillators
  carrier: number;      // Base frequency in Hz
  noiseLevel: number;   // dB (negative), e.g. -26
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NOISE_DURATION = 4; // seconds
const NOISE_CUTOFF = 600; // Hz lowpass

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

export class BinauralGenerator {
  private ctx: AudioContext;
  private gainNode: GainNode;
  private config: BinauralGeneratorConfig;

  // Binaural pair
  private oscL: OscillatorNode | null = null;
  private oscR: OscillatorNode | null = null;
  private panL: StereoPannerNode | null = null;
  private panR: StereoPannerNode | null = null;

  // Harmonic drone
  private droneLow: OscillatorNode | null = null;
  private droneHigh: OscillatorNode | null = null;
  private droneGain: GainNode | null = null;

  // Brown noise
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private noiseFilter: BiquadFilterNode | null = null;

  private _playing = false;
  private _disposed = false;

  constructor(ctx: AudioContext, config: BinauralGeneratorConfig) {
    this.ctx = ctx;
    this.config = config;
    this.gainNode = ctx.createGain();
    this.gainNode.gain.value = 1;
    this.gainNode.connect(ctx.destination);
  }

  /** Whether the generator is ready (always true — no loading needed). */
  get loaded(): boolean {
    return true;
  }

  /** Connect output to an external destination instead of ctx.destination. */
  connectTo(destination: AudioNode): void {
    this.gainNode.disconnect();
    this.gainNode.connect(destination);
  }

  /** Start all three audio layers. */
  play(): void {
    if (this._disposed || this._playing) return;
    this._playing = true;

    const { binauralFreq, carrier, noiseLevel } = this.config;

    // --- Layer 1: Binaural beat (L/R panned sine pair) ---
    this.oscL = this.ctx.createOscillator();
    this.oscR = this.ctx.createOscillator();
    this.oscL.type = 'sine';
    this.oscR.type = 'sine';
    this.oscL.frequency.value = carrier;
    this.oscR.frequency.value = carrier + binauralFreq;

    this.panL = this.ctx.createStereoPanner();
    this.panR = this.ctx.createStereoPanner();
    this.panL.pan.value = -1;
    this.panR.pan.value = 1;

    this.oscL.connect(this.panL).connect(this.gainNode);
    this.oscR.connect(this.panR).connect(this.gainNode);

    this.oscL.start();
    this.oscR.start();

    // --- Layer 2: Harmonic drone (sub + 3rd partial) ---
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.08; // very quiet

    this.droneLow = this.ctx.createOscillator();
    this.droneLow.type = 'sine';
    this.droneLow.frequency.value = carrier / 2;

    this.droneHigh = this.ctx.createOscillator();
    this.droneHigh.type = 'triangle';
    this.droneHigh.frequency.value = carrier * 3;

    this.droneLow.connect(this.droneGain);
    this.droneHigh.connect(this.droneGain);
    this.droneGain.connect(this.gainNode);

    this.droneLow.start();
    this.droneHigh.start();

    // --- Layer 3: Brown noise (filtered looping buffer) ---
    const noiseLevelLinear = Math.pow(10, noiseLevel / 20); // dB to linear
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = noiseLevelLinear;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'lowpass';
    this.noiseFilter.frequency.value = NOISE_CUTOFF;

    const buffer = this._generateBrownNoise();
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = buffer;
    this.noiseSource.loop = true;

    this.noiseSource.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.gainNode);

    this.noiseSource.start();
  }

  /** Pause all oscillators by suspending context. */
  pause(): void {
    // Oscillators can't be paused; we duck to silence instead
    if (!this._playing) return;
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
  }

  /** Resume from pause. */
  resume(): void {
    if (!this._playing) return;
    this.gainNode.gain.setValueAtTime(1, this.ctx.currentTime);
  }

  /** Stop and tear down all nodes. */
  stop(): void {
    this._stopAll();
    this._playing = false;
  }

  /** Smoothly reduce volume for voice ducking. */
  duck(targetGain: number, rampMs: number): void {
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(targetGain, now + rampMs / 1000);
  }

  /** Restore volume after voice ducking. */
  unduck(targetGain: number, rampMs: number): void {
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(targetGain, now + rampMs / 1000);
  }

  /** Set gain immediately (0-1 linear). */
  setGain(value: number): void {
    this.gainNode.gain.setValueAtTime(value, this.ctx.currentTime);
  }

  /** Fade gain from current to target over duration. */
  fadeTo(targetGain: number, durationMs: number): void {
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.linearRampToValueAtTime(targetGain, now + durationMs / 1000);
  }

  /** Clean up all resources. */
  dispose(): void {
    this._disposed = true;
    this._stopAll();
    this.gainNode.disconnect();
  }

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  private _stopAll(): void {
    const stop = (osc: OscillatorNode | AudioBufferSourceNode | null) => {
      if (!osc) return;
      try { osc.stop(); } catch { /* already stopped */ }
      osc.disconnect();
    };

    stop(this.oscL);
    stop(this.oscR);
    stop(this.droneLow);
    stop(this.droneHigh);
    stop(this.noiseSource);

    this.panL?.disconnect();
    this.panR?.disconnect();
    this.droneGain?.disconnect();
    this.noiseGain?.disconnect();
    this.noiseFilter?.disconnect();

    this.oscL = null;
    this.oscR = null;
    this.panL = null;
    this.panR = null;
    this.droneLow = null;
    this.droneHigh = null;
    this.droneGain = null;
    this.noiseSource = null;
    this.noiseGain = null;
    this.noiseFilter = null;
  }

  /** Generate a brown noise AudioBuffer (integrated white noise). */
  private _generateBrownNoise(): AudioBuffer {
    const sampleRate = this.ctx.sampleRate;
    const length = sampleRate * NOISE_DURATION;
    const buffer = this.ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5; // Scale up to usable amplitude
    }

    return buffer;
  }
}
