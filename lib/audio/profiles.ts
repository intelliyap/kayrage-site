/**
 * Audio profiles for KAY-OS Active Mode sessions.
 *
 * Three profiles — Drift, Pulse, Depth — each define the full set of
 * constraints the generative music engine uses to produce real-time audio.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProfileName = 'drift' | 'pulse' | 'depth';

export interface RhythmConfig {
  /** Whether the kick is enabled at all. */
  kickEnabled: boolean;
  /** Kick pattern: bars between kicks (e.g. 2 = one kick every 2 bars). */
  kickEveryBars: number;
  /** Kick velocity range [min, max] (0–1). */
  kickVelocity: [number, number];
  /** Whether hi-hats are enabled. */
  hatEnabled: boolean;
  /** Hat pattern density (0–1, 0 = none, 1 = every 8th). */
  hatDensity: number;
  /** Hat velocity range [min, max] (0–1). */
  hatVelocity: [number, number];
  /** Whether metallic/found-sound percussion is enabled. */
  percEnabled: boolean;
  /** Perc probability per step (0–1). */
  percProbability: number;
}

export interface TextureConfig {
  /** Ambient noise type fed into the texture chain. */
  noiseType: 'brown' | 'white' | 'pink';
  /** Lowpass filter cutoff for ambient noise (Hz). */
  noiseCutoff: number;
  /** Ambient noise volume (dB). */
  noiseVolume: number;
  /** Whether grain/crackle texture is enabled. */
  grainEnabled: boolean;
  /** Grain highpass cutoff (Hz). */
  grainHighpass: number;
  /** Grain tremolo rate (Hz). */
  grainTremoloRate: number;
  /** Grain volume (dB). */
  grainVolume: number;
}

export interface HarmonyConfig {
  /** Root note for the key centre (e.g. "C2"). */
  rootNote: string;
  /** Scale degrees available for pad voicings (intervals in semitones). */
  scaleIntervals: number[];
  /** Maximum number of simultaneous pad voices. */
  padVoices: number;
  /** How often (in bars) a new chord/voicing can be introduced. */
  chordChangeEveryBars: number;
  /** Pad filter cutoff (Hz). */
  padFilterCutoff: number;
  /** Pad chorus depth (0–1). */
  padChorusDepth: number;
  /** Bass note pattern: bars between bass notes. */
  bassEveryBars: number;
  /** Bass filter cutoff (Hz). */
  bassFilterCutoff: number;
}

export interface AudioProfile {
  name: ProfileName;
  displayName: string;
  /** BPM range [min, max]. Engine picks randomly within range. */
  bpmRange: [number, number];
  /** Reverb decay time in seconds. */
  reverbDecay: number;
  /** Reverb wet level (0–1). */
  reverbWet: number;
  /** Global noise level modifier (dB offset from texture config). */
  noiseLevel: number;
  /** Binaural target beat frequency (Hz). */
  binauralTargetHz: number;
  /** Delay time (seconds). */
  delayTime: number;
  /** Delay feedback (0–1). */
  delayFeedback: number;
  rhythm: RhythmConfig;
  texture: TextureConfig;
  harmony: HarmonyConfig;
  /** Accent colour for visualizer. */
  accentColor: string;
}

// ---------------------------------------------------------------------------
// Profile definitions
// ---------------------------------------------------------------------------

export const DRIFT: AudioProfile = {
  name: 'drift',
  displayName: 'Drift',
  bpmRange: [108, 118],
  reverbDecay: 12,
  reverbWet: 0.85,
  noiseLevel: -24,
  binauralTargetHz: 7,
  delayTime: 0.5,
  delayFeedback: 0.45,
  rhythm: {
    kickEnabled: true,
    kickEveryBars: 2,
    kickVelocity: [0.15, 0.3],
    hatEnabled: false,
    hatDensity: 0,
    hatVelocity: [0, 0],
    percEnabled: true,
    percProbability: 0.12,
  },
  texture: {
    noiseType: 'brown',
    noiseCutoff: 600,
    noiseVolume: -22,
    grainEnabled: true,
    grainHighpass: 3000,
    grainTremoloRate: 0.3,
    grainVolume: -26,
  },
  harmony: {
    rootNote: 'C2',
    scaleIntervals: [0, 3, 7, 10, 12, 15],  // C minor pentatonic + octave
    padVoices: 3,
    chordChangeEveryBars: 32,
    padFilterCutoff: 2200,
    padChorusDepth: 0.7,
    bassEveryBars: 4,
    bassFilterCutoff: 400,
  },
  accentColor: '#A78BFA',
};

export const PULSE: AudioProfile = {
  name: 'pulse',
  displayName: 'Pulse',
  bpmRange: [118, 126],
  reverbDecay: 3,
  reverbWet: 0.35,
  noiseLevel: -30,
  binauralTargetHz: 10,
  delayTime: 0.375,
  delayFeedback: 0.3,
  rhythm: {
    kickEnabled: true,
    kickEveryBars: 1,             // four-on-floor (1 kick per beat handled in sequencer)
    kickVelocity: [0.55, 0.75],
    hatEnabled: true,
    hatDensity: 0.5,              // sparse offbeat hats
    hatVelocity: [0.2, 0.5],
    percEnabled: false,
    percProbability: 0,
  },
  texture: {
    noiseType: 'brown',
    noiseCutoff: 400,
    noiseVolume: -30,
    grainEnabled: false,
    grainHighpass: 3000,
    grainTremoloRate: 0.3,
    grainVolume: -40,
  },
  harmony: {
    rootNote: 'D2',
    scaleIntervals: [0, 7, 12],           // root + fifth + octave — minimal
    padVoices: 2,
    chordChangeEveryBars: 64,
    padFilterCutoff: 1800,
    padChorusDepth: 0.4,
    bassEveryBars: 1,
    bassFilterCutoff: 300,
  },
  accentColor: '#60A5FA',
};

export const DEPTH: AudioProfile = {
  name: 'depth',
  displayName: 'Depth',
  bpmRange: [90, 106],
  reverbDecay: 16,
  reverbWet: 0.92,
  noiseLevel: -20,
  binauralTargetHz: 5,
  delayTime: 0.75,
  delayFeedback: 0.55,
  rhythm: {
    kickEnabled: true,
    kickEveryBars: 1,
    kickVelocity: [0.08, 0.15],   // barely audible
    hatEnabled: false,
    hatDensity: 0,
    hatVelocity: [0, 0],
    percEnabled: false,
    percProbability: 0,
  },
  texture: {
    noiseType: 'brown',
    noiseCutoff: 800,
    noiseVolume: -18,
    grainEnabled: true,
    grainHighpass: 2000,
    grainTremoloRate: 0.15,
    grainVolume: -22,
  },
  harmony: {
    rootNote: 'A1',
    scaleIntervals: [0, 12],              // root + octave — near-static
    padVoices: 4,
    chordChangeEveryBars: 64,
    padFilterCutoff: 1400,
    padChorusDepth: 0.9,
    bassEveryBars: 8,
    bassFilterCutoff: 250,
  },
  accentColor: '#34D399',
};

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

export const PROFILES: Record<ProfileName, AudioProfile> = {
  drift: DRIFT,
  pulse: PULSE,
  depth: DEPTH,
};

/** Helper to retrieve a profile by name with a safe fallback. */
export function getProfile(name: ProfileName): AudioProfile {
  return PROFILES[name];
}
