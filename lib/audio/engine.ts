/**
 * Core audio engine for KAY-OS.
 *
 * Thin wrapper around SessionMixer providing the public API that the
 * audio store and session components interact with.
 *
 * No Tone.js imports — uses Web Audio API directly via SessionMixer.
 * Tone.js is only used in the onboarding demo (dynamically imported).
 *
 * SSR-safe: all AudioContext usage gated behind typeof window check.
 */

import { SessionMixer, type PreparedSession, type SessionMixerCallbacks } from './session-mixer';
import type { BinauralGeneratorConfig } from './binaural-generator';
import type { VoiceCue } from './voice-catalog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FocusLevel = 'sync' | 'edge' | 'expand' | 'void';
export type SessionMode = 'still' | 'active';

export interface AudioEngineCallbacks {
  onVoiceCueStart?: (cue: VoiceCue) => void;
  onVoiceCueEnd?: (cue: VoiceCue) => void;
  onSessionEnd?: () => void;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private mixer: SessionMixer | null = null;
  private callbacks: AudioEngineCallbacks = {};
  private _initialised = false;
  private _playing = false;

  // -----------------------------------------------------------------------
  // Initialisation
  // -----------------------------------------------------------------------

  /**
   * Initialise the Web Audio context. Must be called after a user gesture
   * to satisfy browser autoplay policies.
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined') return;
    if (this._initialised) return;

    this.ctx = new AudioContext();

    // Resume if suspended (browser autoplay policy)
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this._initialised = true;
  }

  get initialised(): boolean {
    return this._initialised;
  }

  get playing(): boolean {
    return this._playing;
  }

  // -----------------------------------------------------------------------
  // Callbacks
  // -----------------------------------------------------------------------

  /**
   * Register callbacks for voice cue events and session end.
   */
  setCallbacks(callbacks: AudioEngineCallbacks): void {
    this.callbacks = callbacks;
  }

  // -----------------------------------------------------------------------
  // Session lifecycle
  // -----------------------------------------------------------------------

  /**
   * Preload the prepared session's audio assets (bed MP3 + voice cue buffers).
   */
  async preload(prepared: PreparedSession): Promise<void> {
    if (!this.ctx || !this._initialised) {
      throw new Error('AudioEngine.init() must be called before preload()');
    }

    // Create a fresh mixer for this session
    this.mixer?.dispose();

    const mixerCallbacks: SessionMixerCallbacks = {
      onVoiceCueStart: (cue) => this.callbacks.onVoiceCueStart?.(cue),
      onVoiceCueEnd: (cue) => this.callbacks.onVoiceCueEnd?.(cue),
      onSessionEnd: () => {
        this._playing = false;
        this.callbacks.onSessionEnd?.();
      },
    };

    this.mixer = new SessionMixer(this.ctx, mixerCallbacks);
    await this.mixer.preload(prepared);
  }

  /**
   * Preload using a local BinauralGenerator (no network required).
   */
  preloadLocal(config: BinauralGeneratorConfig): void {
    if (!this.ctx || !this._initialised) {
      throw new Error('AudioEngine.init() must be called before preloadLocal()');
    }

    // Create a fresh mixer for this session
    this.mixer?.dispose();

    const mixerCallbacks: SessionMixerCallbacks = {
      onVoiceCueStart: (cue) => this.callbacks.onVoiceCueStart?.(cue),
      onVoiceCueEnd: (cue) => this.callbacks.onVoiceCueEnd?.(cue),
      onSessionEnd: () => {
        this._playing = false;
        this.callbacks.onSessionEnd?.();
      },
    };

    this.mixer = new SessionMixer(this.ctx, mixerCallbacks);
    this.mixer.preloadLocal(config);
  }

  /**
   * Start playback. Must call preload() or preloadLocal() first.
   */
  start(voiceCues: VoiceCue[]): void {
    if (!this.mixer) {
      throw new Error('AudioEngine.preload() must be called before start()');
    }

    this.mixer.start(voiceCues);
    this._playing = true;
  }

  /**
   * Pause audio playback.
   */
  pause(): void {
    this.mixer?.pause();
    this._playing = false;
  }

  /**
   * Resume paused audio.
   */
  resume(): void {
    this.mixer?.resume();
    this._playing = true;
  }

  /**
   * Stop the session with a fade-out.
   */
  async stop(): Promise<void> {
    if (!this.mixer) return;
    await this.mixer.stop();
    this._playing = false;
  }

  // -----------------------------------------------------------------------
  // Volume
  // -----------------------------------------------------------------------

  /**
   * Set master volume (0-1 linear).
   */
  setMasterVolume(volume: number): void {
    this.mixer?.setMasterVolume(volume);
  }

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------

  /**
   * Full teardown. Call when unmounting.
   */
  async destroy(): Promise<void> {
    this.mixer?.dispose();
    this.mixer = null;
    await this.ctx?.close();
    this.ctx = null;
    this._initialised = false;
    this._playing = false;
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let _instance: AudioEngine | null = null;

/** Get the global AudioEngine singleton. */
export function getAudioEngine(): AudioEngine {
  if (!_instance) {
    _instance = new AudioEngine();
  }
  return _instance;
}
