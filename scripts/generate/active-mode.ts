/**
 * Active-mode audio engine for KAY-OS.
 *
 * Generates real-time electronic music across three profiles (Drift, Pulse,
 * Depth) with embedded entrainment.  Uses Tone.Transport for sequencing.
 *
 * Signal routing (from spec):
 *   kick:  MembraneSynth  → Compressor → master
 *   hat:   NoiseSynth     → Filter(bp 7 kHz) → delay → master
 *   perc:  MetalSynth     → delay → master
 *   bass:  MonoSynth      → master
 *   pad:   PolySynth      → Chorus → Filter → reverb → master
 *   ambientNoise: Noise(brown) → Filter(lp) → master
 *   grainTexture: Noise(brown) → Filter(hp) → Tremolo → reverb
 *   binauralL/R: Oscillator → Panner(±1) → master
 *   subBass: Oscillator → Tremolo(targetHz) → master
 *   reverb: Reverb → master
 *   delay:  FeedbackDelay → reverb
 *   master: Gain(0.45) → destination   (managed by engine.ts)
 *
 * SSR-safe: all Tone.js access behind dynamic import.
 */

import {
  type AudioProfile,
  type ProfileName,
  getProfile,
} from '../../lib/audio/profiles';
import { BinauralGenerator } from './binaural';
import { AMEntrainment } from './entrainment';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToneModule = typeof import('tone');

export interface ActiveModeConfig {
  /** Which profile to use. */
  profile: ProfileName;
  /** Override BPM (otherwise randomly chosen within profile range). */
  bpm?: number;
  /** Override root note / key. */
  key?: string;
  /** Override reverb decay. */
  reverbDecay?: number;
  /** Override noise level (dB). */
  noiseLevel?: number;
  /** Override binaural beat frequency (Hz). */
  binauralHz?: number;
  /** Carrier frequency for binaural (Hz). */
  carrierHz?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function randRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number): number {
  return Math.floor(randRange(min, max + 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Convert a root note string (e.g. "C2") + semitone offset to a frequency. */
function noteFreq(Tone: ToneModule, rootNote: string, semitones: number): number {
  const rootMidi = Tone.Frequency(rootNote).toMidi();
  return Tone.Frequency(rootMidi + semitones, 'midi').toFrequency();
}

/** Convert a root note string + semitone offset to a note name. */
function noteName(Tone: ToneModule, rootNote: string, semitones: number): string {
  const rootMidi = Tone.Frequency(rootNote).toMidi();
  return Tone.Frequency(rootMidi + semitones, 'midi').toNote();
}

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

export class ActiveModeEngine {
  private Tone: ToneModule | null = null;
  private profile: AudioProfile;
  private _config: ActiveModeConfig;

  // --- Rhythm ---
  private kick: InstanceType<ToneModule['MembraneSynth']> | null = null;
  private kickCompressor: InstanceType<ToneModule['Compressor']> | null = null;
  private hat: InstanceType<ToneModule['NoiseSynth']> | null = null;
  private hatFilter: InstanceType<ToneModule['Filter']> | null = null;
  private perc: InstanceType<ToneModule['MetalSynth']> | null = null;

  // --- Harmonic ---
  private bass: InstanceType<ToneModule['MonoSynth']> | null = null;
  private pad: InstanceType<ToneModule['PolySynth']> | null = null;
  private padChorus: InstanceType<ToneModule['Chorus']> | null = null;
  private padFilter: InstanceType<ToneModule['Filter']> | null = null;

  // --- Texture ---
  private ambientNoise: InstanceType<ToneModule['Noise']> | null = null;
  private ambientNoiseFilter: InstanceType<ToneModule['Filter']> | null = null;
  private ambientNoiseFilterLFO: InstanceType<ToneModule['LFO']> | null = null;
  private ambientNoiseGain: InstanceType<ToneModule['Gain']> | null = null;
  private grainNoise: InstanceType<ToneModule['Noise']> | null = null;
  private grainFilter: InstanceType<ToneModule['Filter']> | null = null;
  private grainTremolo: InstanceType<ToneModule['Tremolo']> | null = null;
  private grainGain: InstanceType<ToneModule['Gain']> | null = null;

  // --- Entrainment ---
  private binaural: BinauralGenerator;
  private subBassAM: AMEntrainment;

  // --- Effects ---
  private reverb: InstanceType<ToneModule['Reverb']> | null = null;
  private delay: InstanceType<ToneModule['FeedbackDelay']> | null = null;

  // --- Master ---
  private output: InstanceType<ToneModule['Gain']> | null = null;
  private musicBus: InstanceType<ToneModule['Gain']> | null = null;

  // --- Sequencer ids ---
  private kickLoop: InstanceType<ToneModule['Loop']> | null = null;
  private hatLoop: InstanceType<ToneModule['Loop']> | null = null;
  private percLoop: InstanceType<ToneModule['Loop']> | null = null;
  private bassLoop: InstanceType<ToneModule['Loop']> | null = null;
  private padEvent: InstanceType<ToneModule['Loop']> | null = null;

  // State
  private _running = false;
  private _bpm: number;
  private _voiceActive = false;

  constructor(config: ActiveModeConfig) {
    this._config = config;
    this.profile = getProfile(config.profile);

    this._bpm =
      config.bpm ??
      randInt(this.profile.bpmRange[0], this.profile.bpmRange[1]);

    const binauralHz = config.binauralHz ?? this.profile.binauralTargetHz;
    const carrierHz = config.carrierHz ?? 150;

    this.binaural = new BinauralGenerator({
      carrierHz,
      beatHz: binauralHz,
      volume: -18,
    });

    this.subBassAM = new AMEntrainment({
      targetHz: binauralHz,
      carrierHz: 55, // sub-bass A1
      volume: -22,
    });
  }

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  async init(masterOutput: AudioNode | null): Promise<void> {
    if (typeof window === 'undefined') return;

    const Tone = await import('tone');
    this.Tone = Tone;
    const p = this.profile;

    // --- Output chain ---
    this.output = new Tone.Gain(1);
    if (masterOutput) {
      this.output.connect(masterOutput as never);
    }

    this.musicBus = new Tone.Gain(1).connect(this.output);

    // --- Shared effects ---
    this.reverb = new Tone.Reverb({
      decay: this._config.reverbDecay ?? p.reverbDecay,
      wet: p.reverbWet,
    });
    await this.reverb.generate();
    this.reverb.connect(this.musicBus);

    this.delay = new Tone.FeedbackDelay({
      delayTime: p.delayTime,
      feedback: p.delayFeedback,
      wet: 0.35,
    }).connect(this.reverb);

    // --- Rhythm: Kick ---
    this.kickCompressor = new Tone.Compressor({
      threshold: -20,
      ratio: 4,
      attack: 0.003,
      release: 0.15,
    }).connect(this.musicBus);

    this.kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
        release: 0.8,
      },
    }).connect(this.kickCompressor);

    // --- Rhythm: Hat ---
    this.hatFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: 7000,
      Q: 1.2,
    }).connect(this.delay);

    this.hat = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.08,
        sustain: 0,
        release: 0.04,
      },
    }).connect(this.hatFilter);

    // --- Rhythm: Perc ---
    this.perc = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.15,
        release: 0.1,
      },
      harmonicity: 5.1,
      modulationIndex: 16,
      resonance: 4000,
      octaves: 1.5,
    }).connect(this.delay);
    this.perc.frequency.value = 300;

    // --- Harmonic: Bass ---
    this.bass = new Tone.MonoSynth({
      oscillator: { type: 'sine' },
      filter: {
        type: 'lowpass',
        frequency: this._config.key
          ? p.harmony.bassFilterCutoff
          : p.harmony.bassFilterCutoff,
        Q: 1,
      },
      envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.6,
        release: 1.5,
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.4,
        sustain: 0.3,
        release: 1,
        baseFrequency: 80,
        octaves: 2,
      },
    }).connect(this.musicBus);

    // --- Harmonic: Pad ---
    this.padFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: p.harmony.padFilterCutoff,
      Q: 0.5,
    }).connect(this.reverb);

    this.padChorus = new Tone.Chorus({
      frequency: 0.5,
      delayTime: 3.5,
      depth: p.harmony.padChorusDepth,
      wet: 0.6,
    }).connect(this.padFilter);
    this.padChorus.start();

    this.pad = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: {
        attack: 2,
        decay: 4,
        sustain: 0.7,
        release: 6,
      },
    }).connect(this.padChorus);
    this.pad.maxPolyphony = p.harmony.padVoices;

    // --- Texture: Ambient Noise ---
    const noiseVol = this._config.noiseLevel ?? p.texture.noiseVolume;
    this.ambientNoiseGain = new Tone.Gain(
      Tone.dbToGain(noiseVol),
    ).connect(this.musicBus);

    this.ambientNoiseFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: p.texture.noiseCutoff,
      Q: 0.5,
    }).connect(this.ambientNoiseGain);

    this.ambientNoiseFilterLFO = new Tone.LFO({
      frequency: 1 / 40,
      min: p.texture.noiseCutoff * 0.4,
      max: p.texture.noiseCutoff,
      type: 'sine',
    }).connect(this.ambientNoiseFilter.frequency as never);

    this.ambientNoise = new Tone.Noise(p.texture.noiseType).connect(
      this.ambientNoiseFilter,
    );

    // --- Texture: Grain ---
    if (p.texture.grainEnabled) {
      this.grainGain = new Tone.Gain(
        Tone.dbToGain(p.texture.grainVolume),
      ).connect(this.reverb);

      this.grainTremolo = new Tone.Tremolo({
        frequency: p.texture.grainTremoloRate,
        depth: 0.8,
        type: 'sine',
        spread: 0,
      })
        .connect(this.grainGain)
        .start();

      this.grainFilter = new Tone.Filter({
        type: 'highpass',
        frequency: p.texture.grainHighpass,
        Q: 0.3,
      }).connect(this.grainTremolo);

      this.grainNoise = new Tone.Noise('brown').connect(this.grainFilter);
    }

    // --- Entrainment: Binaural in sub-bass ---
    await this.binaural.init(null);
    this.binaural.connectTo(this.musicBus as never);

    // --- Entrainment: AM sub-bass ---
    await this.subBassAM.init(null);
    this.subBassAM.connectTo(this.musicBus as never);

    // --- Set Transport BPM ---
    Tone.getTransport().bpm.value = this._bpm;
  }

  start(): void {
    if (this._running || !this.Tone) return;
    const Tone = this.Tone;
    const p = this.profile;
    const rootNote = this._config.key ?? p.harmony.rootNote;

    // --- Start continuous sources ---
    this.ambientNoise?.start();
    this.ambientNoiseFilterLFO?.start();
    if (p.texture.grainEnabled) {
      this.grainNoise?.start();
    }
    this.binaural.start();
    this.subBassAM.start();

    // --- Schedule rhythm ---
    this._scheduleKick(Tone, p, rootNote);
    this._scheduleHat(Tone, p);
    this._schedulePerc(Tone, p);
    this._scheduleBass(Tone, p, rootNote);
    this._schedulePad(Tone, p, rootNote);

    // --- Start transport ---
    Tone.getTransport().start();
    this._running = true;
  }

  stop(): void {
    if (!this._running || !this.Tone) return;
    const Tone = this.Tone;

    Tone.getTransport().stop();
    Tone.getTransport().cancel();

    this.kickLoop?.dispose();
    this.hatLoop?.dispose();
    this.percLoop?.dispose();
    this.bassLoop?.dispose();
    this.padEvent?.dispose();
    this.kickLoop = null;
    this.hatLoop = null;
    this.percLoop = null;
    this.bassLoop = null;
    this.padEvent = null;

    this.ambientNoise?.stop();
    this.ambientNoiseFilterLFO?.stop();
    this.grainNoise?.stop();
    this.binaural.stop();
    this.subBassAM.stop();

    this._running = false;
  }

  dispose(): void {
    this.stop();

    // Rhythm
    this.kick?.dispose();
    this.kickCompressor?.dispose();
    this.hat?.dispose();
    this.hatFilter?.dispose();
    this.perc?.dispose();

    // Harmonic
    this.bass?.dispose();
    this.pad?.dispose();
    this.padChorus?.dispose();
    this.padFilter?.dispose();

    // Texture
    this.ambientNoise?.dispose();
    this.ambientNoiseFilter?.dispose();
    this.ambientNoiseFilterLFO?.dispose();
    this.ambientNoiseGain?.dispose();
    this.grainNoise?.dispose();
    this.grainFilter?.dispose();
    this.grainTremolo?.dispose();
    this.grainGain?.dispose();

    // Entrainment
    this.binaural.dispose();
    this.subBassAM.dispose();

    // Effects
    this.reverb?.dispose();
    this.delay?.dispose();

    // Master
    this.musicBus?.dispose();
    this.output?.dispose();

    this.Tone = null;
  }

  // -----------------------------------------------------------------------
  // Voice ducking
  // -----------------------------------------------------------------------

  voiceStart(): void {
    if (!this.Tone || !this.musicBus || this._voiceActive) return;
    this._voiceActive = true;
    this.musicBus.gain.rampTo(this.Tone.dbToGain(-4), 0.6);
  }

  voiceEnd(): void {
    if (!this.Tone || !this.musicBus || !this._voiceActive) return;
    this._voiceActive = false;
    this.musicBus.gain.rampTo(1, 0.6);
  }

  // -----------------------------------------------------------------------
  // Profile switching
  // -----------------------------------------------------------------------

  /** Switch to a new profile with a brief crossfade (stops and restarts). */
  async switchProfile(name: ProfileName): Promise<void> {
    if (!this.Tone) return;
    const wasRunning = this._running;
    if (wasRunning) this.stop();

    this.profile = getProfile(name);
    this._config.profile = name;
    this._bpm = randInt(this.profile.bpmRange[0], this.profile.bpmRange[1]);

    // Update reverb
    if (this.reverb) {
      this.reverb.decay = this.profile.reverbDecay;
    }

    // Update transport BPM
    this.Tone.getTransport().bpm.value = this._bpm;

    // Update binaural
    this.binaural.setFrequency(this.profile.binauralTargetHz, 2);
    this.subBassAM.setTargetHz(this.profile.binauralTargetHz, 2);

    if (wasRunning) this.start();
  }

  // -----------------------------------------------------------------------
  // Getters
  // -----------------------------------------------------------------------

  get running(): boolean {
    return this._running;
  }
  get bpm(): number {
    return this._bpm;
  }
  get profileName(): ProfileName {
    return this.profile.name;
  }

  getOutput(): AudioNode | null {
    return this.output as unknown as AudioNode | null;
  }

  getReverbBus(): AudioNode | null {
    return this.reverb as unknown as AudioNode | null;
  }

  // -----------------------------------------------------------------------
  // Sequencer scheduling (private)
  // -----------------------------------------------------------------------

  private _scheduleKick(
    Tone: ToneModule,
    p: AudioProfile,
    rootNote: string,
  ): void {
    if (!p.rhythm.kickEnabled || !this.kick) return;

    if (p.name === 'pulse') {
      // Four-on-floor: one kick per beat
      this.kickLoop = new Tone.Loop((time) => {
        const vel = randRange(p.rhythm.kickVelocity[0], p.rhythm.kickVelocity[1]);
        this.kick!.triggerAttackRelease(rootNote, '8n', time, vel);
      }, '4n');
    } else {
      // Drift: one kick every 2 bars; Depth: one per bar (very quiet)
      const interval = p.rhythm.kickEveryBars === 1 ? '1m' : `${p.rhythm.kickEveryBars}m`;
      this.kickLoop = new Tone.Loop((time) => {
        const vel = randRange(p.rhythm.kickVelocity[0], p.rhythm.kickVelocity[1]);
        this.kick!.triggerAttackRelease(rootNote, '8n', time, vel);
      }, interval);
    }

    this.kickLoop.start(0);
  }

  private _scheduleHat(Tone: ToneModule, p: AudioProfile): void {
    if (!p.rhythm.hatEnabled || !this.hat || p.rhythm.hatDensity <= 0) return;

    // Sparse offbeat hats at density probability
    this.hatLoop = new Tone.Loop((time) => {
      if (Math.random() > p.rhythm.hatDensity) return;
      let vel = randRange(p.rhythm.hatVelocity[0], p.rhythm.hatVelocity[1]);

      // Pulse profile: modulate hat velocity with binaural target Hz
      if (p.name === 'pulse') {
        const phase = (Tone.now() * p.binauralTargetHz) % 1;
        vel *= 0.6 + 0.4 * Math.sin(phase * Math.PI * 2);
      }

      this.hat!.triggerAttackRelease('16n', time, vel);
    }, '8n');

    this.hatLoop.start('8n'); // offset by an 8th for offbeat feel
  }

  private _schedulePerc(Tone: ToneModule, p: AudioProfile): void {
    if (!p.rhythm.percEnabled || !this.perc) return;

    this.percLoop = new Tone.Loop((time) => {
      if (Math.random() > p.rhythm.percProbability) return;
      const vel = randRange(0.05, 0.2);
      this.perc!.triggerAttackRelease(
        Tone.Frequency(randRange(200, 800)).toFrequency(),
        '32n',
        time,
        vel,
      );
    }, '8n');

    this.percLoop.start(0);
  }

  private _scheduleBass(
    Tone: ToneModule,
    p: AudioProfile,
    rootNote: string,
  ): void {
    if (!this.bass) return;

    const interval =
      p.harmony.bassEveryBars === 1 ? '1m' : `${p.harmony.bassEveryBars}m`;

    this.bassLoop = new Tone.Loop((time) => {
      // Pick a random scale degree for generative variation.
      const semitone = pickRandom(
        p.harmony.scaleIntervals.filter((s) => s <= 12),
      );
      const note = noteName(Tone, rootNote, semitone);
      const vel = randRange(0.4, 0.7);
      this.bass!.triggerAttackRelease(note, '2n', time, vel);
    }, interval);

    this.bassLoop.start(0);
  }

  private _schedulePad(
    Tone: ToneModule,
    p: AudioProfile,
    rootNote: string,
  ): void {
    if (!this.pad) return;

    const interval = `${p.harmony.chordChangeEveryBars}m`;

    // Trigger an initial chord immediately and then repeat.
    const triggerPad = (time: number) => {
      // Build a generative voicing from the profile's scale intervals.
      const numVoices = randInt(2, p.harmony.padVoices);
      const intervals = [...p.harmony.scaleIntervals].sort(
        () => Math.random() - 0.5,
      );
      const chosen = intervals.slice(0, numVoices);
      const notes = chosen.map((s) => noteName(Tone, rootNote, s));
      const vel = randRange(0.25, 0.5);

      // Release previous voices before triggering new ones.
      this.pad!.releaseAll(time);
      this.pad!.triggerAttack(notes, time, vel);
    };

    this.padEvent = new Tone.Loop((time) => {
      triggerPad(time);
    }, interval);

    this.padEvent.start(0);
  }
}
