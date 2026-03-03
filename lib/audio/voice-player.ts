/**
 * Voice cue player for KAY-OS.
 *
 * Preloads voice cues as AudioBuffers and plays them at scheduled times
 * using setTimeout. Provides callbacks for cue start/end events so the
 * session mixer can coordinate ducking and the UI can display guidance text.
 */

import type { VoiceCue } from './voice-catalog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VoicePlayerCallbacks {
  onCueStart?: (cue: VoiceCue) => void;
  onCueEnd?: (cue: VoiceCue) => void;
}

interface ScheduledCue {
  cue: VoiceCue;
  timerId: ReturnType<typeof setTimeout>;
}

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

export class VoicePlayer {
  private ctx: AudioContext;
  private gainNode: GainNode;
  private buffers = new Map<string, AudioBuffer>();
  private callbacks: VoicePlayerCallbacks;
  private scheduledCues: ScheduledCue[] = [];
  private activeSource: AudioBufferSourceNode | null = null;
  private _paused = false;
  private _pauseTime = 0;
  private _startTime = 0;
  private _disposed = false;

  constructor(ctx: AudioContext, callbacks: VoicePlayerCallbacks = {}) {
    this.ctx = ctx;
    this.callbacks = callbacks;
    this.gainNode = ctx.createGain();
    this.gainNode.connect(ctx.destination);
  }

  /** Get the output gain node for routing. */
  getOutput(): GainNode {
    return this.gainNode;
  }

  /** Connect output to an external destination. */
  connectTo(destination: AudioNode): void {
    this.gainNode.disconnect();
    this.gainNode.connect(destination);
  }

  /**
   * Preload voice cue audio files as AudioBuffers.
   * @param urls - Map of R2 paths to full URLs
   */
  async preload(urls: Map<string, string>): Promise<void> {
    const entries = Array.from(urls.entries());
    const results = await Promise.allSettled(
      entries.map(async ([r2Path, url]) => {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}`);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        this.buffers.set(r2Path, audioBuffer);
      }),
    );

    // Log failures but don't throw — missing voice cues degrade gracefully
    for (let i = 0; i < results.length; i++) {
      if (results[i].status === 'rejected') {
        console.warn(`Voice cue preload failed: ${entries[i][0]}`);
      }
    }
  }

  /**
   * Schedule voice cues to play at their specified times.
   * Call this when the session starts (time=0).
   */
  schedule(cues: VoiceCue[]): void {
    this.clearSchedule();
    this._startTime = Date.now();
    this._paused = false;

    for (const cue of cues) {
      const delayMs = cue.time * 1000;
      const timerId = setTimeout(() => this._playCue(cue), delayMs);
      this.scheduledCues.push({ cue, timerId });
    }
  }

  /** Clear all scheduled cues. */
  clearSchedule(): void {
    for (const sc of this.scheduledCues) {
      clearTimeout(sc.timerId);
    }
    this.scheduledCues = [];
    this._stopActive();
  }

  /** Pause playback — clears pending timeouts and stops active cue. */
  pause(): void {
    if (this._paused) return;
    this._paused = true;
    this._pauseTime = Date.now();

    // Clear pending timeouts
    for (const sc of this.scheduledCues) {
      clearTimeout(sc.timerId);
    }

    this._stopActive();
  }

  /** Resume playback — reschedules remaining cues from where we left off. */
  resume(): void {
    if (!this._paused) return;
    this._paused = false;

    const pausedDuration = Date.now() - this._pauseTime;
    this._startTime += pausedDuration;

    // Reschedule remaining cues
    const elapsed = (Date.now() - this._startTime) / 1000;
    const remaining = this.scheduledCues.filter((sc) => sc.cue.time > elapsed);

    this.scheduledCues = [];
    for (const sc of remaining) {
      const delayMs = (sc.cue.time - elapsed) * 1000;
      if (delayMs > 0) {
        const timerId = setTimeout(() => this._playCue(sc.cue), delayMs);
        this.scheduledCues.push({ cue: sc.cue, timerId });
      }
    }
  }

  /** Stop everything and release resources. */
  dispose(): void {
    this._disposed = true;
    this.clearSchedule();
    this.buffers.clear();
    this.gainNode.disconnect();
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private _playCue(cue: VoiceCue): void {
    if (this._disposed || this._paused) return;

    const buffer = this.buffers.get(cue.r2Path);
    if (!buffer) {
      // No pre-rendered audio — just fire callbacks for text display
      this.callbacks.onCueStart?.(cue);
      setTimeout(() => {
        this.callbacks.onCueEnd?.(cue);
      }, cue.displayDuration * 1000);
      return;
    }

    // Play the AudioBuffer
    this._stopActive();

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);
    this.activeSource = source;

    this.callbacks.onCueStart?.(cue);

    source.onended = () => {
      this.activeSource = null;
      this.callbacks.onCueEnd?.(cue);
    };

    source.start();
  }

  private _stopActive(): void {
    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch {
        // May already be stopped
      }
      this.activeSource.disconnect();
      this.activeSource = null;
    }
  }
}
