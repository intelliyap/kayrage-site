// ---------------------------------------------------------------------------
// Audio Store — Zustand v5
// ---------------------------------------------------------------------------
// Manages the state of the audio engine: initialisation, playback,
// preloading, and volume. The actual Web Audio instances live in the
// audio engine module — this store holds the reactive state that UI
// components subscribe to.
// ---------------------------------------------------------------------------

import { create } from "zustand";
import { getAudioEngine } from "@/lib/audio/engine";
import type { PreparedSession } from "@/lib/audio/session-mixer";
import type { VoiceCue } from "@/lib/audio/voice-catalog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AudioMode = "still" | "active";
export type AudioProfile = "drift" | "pulse" | "depth";

export interface AudioState {
  /** Whether the AudioContext has been created (requires user gesture) */
  isInitialized: boolean;
  /** Whether audio is currently playing */
  isPlaying: boolean;
  /** Whether audio is paused (distinct from stopped) */
  isPaused: boolean;
  /** Whether audio assets are being preloaded */
  isPreloading: boolean;
  /** Current audio mode */
  mode: AudioMode;
  /** Active mode profile (only relevant when mode === "active") */
  profile: AudioProfile;
  /** Master volume (0-1 linear scale) */
  volume: number;
}

export interface AudioActions {
  /** Initialise the AudioContext (after first user gesture). Async. */
  initAudio: () => Promise<void>;
  /** Set audio mode (still or active) */
  setMode: (mode: AudioMode) => void;
  /** Set active mode profile */
  setProfile: (profile: AudioProfile) => void;
  /** Set master volume (0-1) */
  setVolume: (volume: number) => void;
  /** Preload + start audio for a prepared session */
  startAudio: (prepared: PreparedSession, voiceCues: VoiceCue[]) => Promise<void>;
  /** Stop audio playback (full stop with fade-out) */
  stopAudio: () => Promise<void>;
  /** Pause audio playback */
  pauseAudio: () => void;
  /** Resume paused audio */
  resumeAudio: () => void;
  /** Full reset to initial state */
  reset: () => void;
}

export type AudioStore = AudioState & AudioActions;

// ---------------------------------------------------------------------------
// Default values
// ---------------------------------------------------------------------------

const DEFAULT_VOLUME = 0.45;

const initialState: AudioState = {
  isInitialized: false,
  isPlaying: false,
  isPaused: false,
  isPreloading: false,
  mode: "still",
  profile: "pulse",
  volume: DEFAULT_VOLUME,
};

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAudioStore = create<AudioStore>()((set, get) => ({
  ...initialState,

  initAudio: async () => {
    if (get().isInitialized) return;

    const engine = getAudioEngine();
    await engine.init();

    // Register voice cue callbacks that update the session store
    engine.setCallbacks({
      onVoiceCueStart: (cue) => {
        // Update session store's activeGuidance via dynamic import
        // to avoid circular dependency
        import("@/lib/stores/session-store").then(({ useSessionStore }) => {
          useSessionStore.getState().setActiveGuidance({
            time: cue.time,
            text: cue.text,
            duration: cue.displayDuration,
          });
        });
      },
      onVoiceCueEnd: () => {
        import("@/lib/stores/session-store").then(({ useSessionStore }) => {
          useSessionStore.getState().setActiveGuidance(null);
        });
      },
      onSessionEnd: () => {
        set({ isPlaying: false, isPaused: false });
      },
    });

    set({ isInitialized: true });
  },

  setMode: (mode) => {
    set({ mode });
  },

  setProfile: (profile) => {
    set({ profile });
  },

  setVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ volume: clamped });
    const engine = getAudioEngine();
    engine.setMasterVolume(clamped);
  },

  startAudio: async (prepared, voiceCues) => {
    if (!get().isInitialized) return;

    set({ isPreloading: true });

    try {
      const engine = getAudioEngine();
      await engine.preload(prepared);
      engine.start(voiceCues);
      set({ isPlaying: true, isPaused: false, isPreloading: false });
    } catch (err) {
      console.error("Failed to start audio:", err);
      set({ isPreloading: false });
    }
  },

  stopAudio: async () => {
    const engine = getAudioEngine();
    await engine.stop();
    set({ isPlaying: false, isPaused: false });
  },

  pauseAudio: () => {
    if (get().isPlaying) {
      const engine = getAudioEngine();
      engine.pause();
      set({ isPlaying: false, isPaused: true });
    }
  },

  resumeAudio: () => {
    if (get().isPaused && get().isInitialized) {
      const engine = getAudioEngine();
      engine.resume();
      set({ isPlaying: true, isPaused: false });
    }
  },

  reset: () => {
    set(initialState);
  },
}));
