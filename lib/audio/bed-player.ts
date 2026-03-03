/**
 * Audio bed player for KAY-OS.
 *
 * Plays pre-rendered audio beds via HTMLAudioElement, routed through
 * a Web Audio API GainNode for smooth volume control and ducking.
 *
 * Signal chain:
 *   HTMLAudioElement → MediaElementSourceNode → GainNode → AudioContext.destination
 */

// ---------------------------------------------------------------------------
// Class
// ---------------------------------------------------------------------------

export class BedPlayer {
  private ctx: AudioContext;
  private audio: HTMLAudioElement | null = null;
  private source: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode;
  private _loaded = false;
  private _disposed = false;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.gainNode = ctx.createGain();
    this.gainNode.connect(ctx.destination);
  }

  /** Get the gain node (for connecting to a master bus). */
  getOutput(): GainNode {
    return this.gainNode;
  }

  /** Connect the gain node to an external destination instead of ctx.destination. */
  connectTo(destination: AudioNode): void {
    this.gainNode.disconnect();
    this.gainNode.connect(destination);
  }

  /**
   * Load an audio bed from a URL.
   * Returns a promise that resolves when enough data is buffered to play.
   */
  async load(url: string): Promise<void> {
    if (this._disposed) return;

    // Clean up previous audio element
    this._cleanup();

    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'auto';
    this.audio.loop = true; // Beds loop for sessions longer than the bed

    // Create source node and connect to gain
    this.source = this.ctx.createMediaElementSource(this.audio);
    this.source.connect(this.gainNode);

    // Wait for enough data to start playing
    return new Promise<void>((resolve, reject) => {
      if (!this.audio) return reject(new Error('Audio element disposed'));

      const onCanPlay = () => {
        this._loaded = true;
        this.audio?.removeEventListener('canplaythrough', onCanPlay);
        this.audio?.removeEventListener('error', onError);
        resolve();
      };

      const onError = () => {
        this.audio?.removeEventListener('canplaythrough', onCanPlay);
        this.audio?.removeEventListener('error', onError);
        reject(new Error(`Failed to load audio: ${url}`));
      };

      this.audio.addEventListener('canplaythrough', onCanPlay);
      this.audio.addEventListener('error', onError);
      this.audio.src = url;
    });
  }

  /** Start playback from the beginning. */
  play(): void {
    if (!this.audio || !this._loaded) return;
    this.audio.currentTime = 0;
    this.audio.play().catch(() => {
      // Autoplay may be blocked; user gesture required
    });
  }

  /** Pause playback. */
  pause(): void {
    this.audio?.pause();
  }

  /** Resume paused playback. */
  resume(): void {
    this.audio?.play().catch(() => {});
  }

  /** Stop playback and reset position. */
  stop(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
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
    this.gainNode.gain.linearRampToValueAtTime(
      targetGain,
      now + durationMs / 1000,
    );
  }

  /** Get the current playback position in seconds. */
  getCurrentTime(): number {
    return this.audio?.currentTime ?? 0;
  }

  get loaded(): boolean {
    return this._loaded;
  }

  /** Clean up all resources. */
  dispose(): void {
    this._disposed = true;
    this._cleanup();
    this.gainNode.disconnect();
  }

  private _cleanup(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load(); // release network resources
    }
    this.source?.disconnect();
    this.source = null;
    this.audio = null;
    this._loaded = false;
  }
}
