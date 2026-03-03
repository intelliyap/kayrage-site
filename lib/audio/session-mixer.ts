/**
 * Session mixer for KAY-OS — coordinates BedPlayer + VoicePlayer.
 *
 * Handles:
 *   - Voice ducking: bed drops to 0.3 when voice plays (500ms ramp)
 *   - Fade-in at session start (3s)
 *   - Fade-out at session end (4s)
 *   - Master volume control
 *   - Routing both players through a shared AudioContext
 */

import { BedPlayer } from './bed-player';
import { VoicePlayer, type VoicePlayerCallbacks } from './voice-player';
import type { VoiceCue } from './voice-catalog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PreparedSession {
  bedUrl: string;
  voiceCues: VoiceCue[];
  voiceCueUrls: Map<string, string>; // r2Path → full URL
}

export interface SessionMixerCallbacks {
  onVoiceCueStart?: (cue: VoiceCue) => void;
  onVoiceCueEnd?: (cue: VoiceCue) => void;
  onSessionEnd?: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DUCK_GAIN = 0.3;
const DUCK_RAMP_MS = 500;
const UNDUCK_RAMP_MS = 500;
const FADE_IN_MS = 3000;
const FADE_OUT_MS = 4000;
const DEFAULT_MASTER_VOLUME = 0.45;

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

export class SessionMixer {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private bedPlayer: BedPlayer;
  private voicePlayer: VoicePlayer;
  private callbacks: SessionMixerCallbacks;
  private _masterVolume = DEFAULT_MASTER_VOLUME;
  private _disposed = false;

  constructor(ctx: AudioContext, callbacks: SessionMixerCallbacks = {}) {
    this.ctx = ctx;
    this.callbacks = callbacks;

    // Master gain → destination
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0; // Start silent, fade in on play
    this.masterGain.connect(ctx.destination);

    // Voice player callbacks handle ducking
    const voiceCallbacks: VoicePlayerCallbacks = {
      onCueStart: (cue) => {
        // Duck the bed
        this.bedPlayer.duck(DUCK_GAIN, DUCK_RAMP_MS);
        this.callbacks.onVoiceCueStart?.(cue);
      },
      onCueEnd: (cue) => {
        // Unduck the bed
        this.bedPlayer.unduck(1, UNDUCK_RAMP_MS);
        this.callbacks.onVoiceCueEnd?.(cue);
      },
    };

    // Create players and route through master
    this.bedPlayer = new BedPlayer(ctx);
    this.bedPlayer.connectTo(this.masterGain);

    this.voicePlayer = new VoicePlayer(ctx, voiceCallbacks);
    this.voicePlayer.connectTo(this.masterGain);
  }

  // -----------------------------------------------------------------------
  // Lifecycle
  // -----------------------------------------------------------------------

  /**
   * Preload the audio bed and voice cues.
   */
  async preload(prepared: PreparedSession): Promise<void> {
    if (this._disposed) return;

    await Promise.all([
      this.bedPlayer.load(prepared.bedUrl),
      this.voicePlayer.preload(prepared.voiceCueUrls),
    ]);
  }

  /**
   * Start playback with a fade-in.
   */
  start(voiceCues: VoiceCue[]): void {
    if (this._disposed) return;

    // Fade in master gain
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(
      this._masterVolume,
      this.ctx.currentTime + FADE_IN_MS / 1000,
    );

    // Start bed playback
    this.bedPlayer.play();

    // Schedule voice cues
    this.voicePlayer.schedule(voiceCues);
  }

  /**
   * Pause both bed and voice playback.
   */
  pause(): void {
    this.bedPlayer.pause();
    this.voicePlayer.pause();
  }

  /**
   * Resume both bed and voice playback.
   */
  resume(): void {
    this.bedPlayer.resume();
    this.voicePlayer.resume();
  }

  /**
   * Stop playback with a fade-out. Returns when fade is complete.
   */
  async stop(): Promise<void> {
    if (this._disposed) return;

    // Fade out master
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0, now + FADE_OUT_MS / 1000);

    // Wait for fade to complete
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        this.bedPlayer.stop();
        this.voicePlayer.clearSchedule();
        this.callbacks.onSessionEnd?.();
        resolve();
      }, FADE_OUT_MS);
    });
  }

  // -----------------------------------------------------------------------
  // Volume
  // -----------------------------------------------------------------------

  /**
   * Set master volume (0-1 linear).
   */
  setMasterVolume(volume: number): void {
    this._masterVolume = Math.max(0, Math.min(1, volume));
    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(this._masterVolume, now + 0.3);
  }

  get masterVolume(): number {
    return this._masterVolume;
  }

  // -----------------------------------------------------------------------
  // Cleanup
  // -----------------------------------------------------------------------

  /**
   * Dispose all resources.
   */
  dispose(): void {
    this._disposed = true;
    this.bedPlayer.dispose();
    this.voicePlayer.dispose();
    this.masterGain.disconnect();
  }
}
