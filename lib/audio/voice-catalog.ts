/**
 * Voice cue catalog for KAY-OS.
 *
 * Maps guidance text phrases to pre-rendered voice audio files in R2.
 * Voice cues are pre-rendered via ElevenLabs and stored as MP3 files.
 *
 * The prepare-audio endpoint uses this catalog to resolve guidance script
 * text into downloadable voice cue URLs for the client.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VoiceCue {
  /** Seconds from session start when this cue plays */
  time: number;
  /** Display text (shown in guidance UI) */
  text: string;
  /** Duration in seconds the text remains visible */
  displayDuration: number;
  /** R2 path to the pre-rendered voice audio file */
  r2Path: string;
  /** Estimated audio duration in seconds */
  audioDuration: number;
}

// ---------------------------------------------------------------------------
// Common phrases → R2 paths
// ---------------------------------------------------------------------------

/**
 * Pre-rendered common voice phrases.
 * Keys are normalized lowercase text, values are R2 paths.
 */
const COMMON_PHRASES: Record<string, { r2Path: string; audioDuration: number }> = {
  // Opening
  'close your eyes. settle in.': {
    r2Path: 'audio/voice/common/close-eyes-settle.mp3',
    audioDuration: 3,
  },
  'let your body get heavy.': {
    r2Path: 'audio/voice/common/body-heavy.mp3',
    audioDuration: 2.5,
  },

  // Breath
  'stay with it.': {
    r2Path: 'audio/voice/common/stay-with-it.mp3',
    audioDuration: 1.5,
  },
  'just the breath. nothing else.': {
    r2Path: 'audio/voice/common/just-breath.mp3',
    audioDuration: 2.5,
  },
  'notice the rhythm finding itself.': {
    r2Path: 'audio/voice/common/rhythm-finding.mp3',
    audioDuration: 2.5,
  },
  'let the breath breathe you.': {
    r2Path: 'audio/voice/common/breath-breathe-you.mp3',
    audioDuration: 2.5,
  },

  // Body
  'keep scanning. slowly.': {
    r2Path: 'audio/voice/common/keep-scanning.mp3',
    audioDuration: 2,
  },
  'no need to change anything. just notice.': {
    r2Path: 'audio/voice/common/just-notice.mp3',
    audioDuration: 3,
  },
  "feel what's actually there.": {
    r2Path: 'audio/voice/common/feel-whats-there.mp3',
    audioDuration: 2,
  },
  'let awareness move on its own.': {
    r2Path: 'audio/voice/common/awareness-move.mp3',
    audioDuration: 2.5,
  },

  // Visual
  'hold the image. let it sharpen.': {
    r2Path: 'audio/voice/common/hold-image.mp3',
    audioDuration: 3,
  },
  "don't force it. let it appear.": {
    r2Path: 'audio/voice/common/let-it-appear.mp3',
    audioDuration: 2.5,
  },
  'stay with what you see.': {
    r2Path: 'audio/voice/common/stay-with-see.mp3',
    audioDuration: 2,
  },
  'let the light expand.': {
    r2Path: 'audio/voice/common/light-expand.mp3',
    audioDuration: 2,
  },

  // Sound
  'listen deeper.': {
    r2Path: 'audio/voice/common/listen-deeper.mp3',
    audioDuration: 1.5,
  },
  'let the sound fill you.': {
    r2Path: 'audio/voice/common/sound-fill-you.mp3',
    audioDuration: 2,
  },
  "beyond the sound... what's there?": {
    r2Path: 'audio/voice/common/beyond-sound.mp3',
    audioDuration: 3,
  },
  "don't chase it. let it come to you.": {
    r2Path: 'audio/voice/common/let-it-come.mp3',
    audioDuration: 2.5,
  },

  // Perception
  'widen your field.': {
    r2Path: 'audio/voice/common/widen-field.mp3',
    audioDuration: 2,
  },
  'notice without naming.': {
    r2Path: 'audio/voice/common/notice-no-naming.mp3',
    audioDuration: 2,
  },
  'everything at once.': {
    r2Path: 'audio/voice/common/everything-at-once.mp3',
    audioDuration: 1.5,
  },
  'stay open. stay aware.': {
    r2Path: 'audio/voice/common/stay-open-aware.mp3',
    audioDuration: 2,
  },

  // Inquiry
  "don't answer. just sit with it.": {
    r2Path: 'audio/voice/common/just-sit-with-it.mp3',
    audioDuration: 2.5,
  },
  'let the question dissolve.': {
    r2Path: 'audio/voice/common/question-dissolve.mp3',
    audioDuration: 2.5,
  },
  'who is asking?': {
    r2Path: 'audio/voice/common/who-is-asking.mp3',
    audioDuration: 1.5,
  },
  'stay in not-knowing.': {
    r2Path: 'audio/voice/common/not-knowing.mp3',
    audioDuration: 2,
  },

  // Generic
  'keep going.': {
    r2Path: 'audio/voice/common/keep-going.mp3',
    audioDuration: 1.5,
  },
  "notice what's here.": {
    r2Path: 'audio/voice/common/notice-whats-here.mp3',
    audioDuration: 2,
  },

  // Closing
  'begin to return. no rush.': {
    r2Path: 'audio/voice/common/begin-return.mp3',
    audioDuration: 2.5,
  },
  "when you're ready, open your eyes.": {
    r2Path: 'audio/voice/common/open-eyes.mp3',
    audioDuration: 3,
  },
};

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

/**
 * Look up a pre-rendered voice cue by its text.
 * Returns the R2 path and estimated audio duration, or null if not found.
 */
export function lookupVoiceCue(
  text: string,
): { r2Path: string; audioDuration: number } | null {
  const normalized = text.toLowerCase().trim();
  return COMMON_PHRASES[normalized] ?? null;
}

/**
 * Resolve a full guidance script into voice cues with R2 paths.
 * Cues that don't have pre-rendered versions are excluded (will be text-only).
 */
export function resolveVoiceCues(
  script: Array<{ time: number; text: string; duration: number }>,
): VoiceCue[] {
  const cues: VoiceCue[] = [];

  for (const entry of script) {
    const match = lookupVoiceCue(entry.text);
    if (match) {
      cues.push({
        time: entry.time,
        text: entry.text,
        displayDuration: entry.duration,
        r2Path: match.r2Path,
        audioDuration: match.audioDuration,
      });
    }
  }

  return cues;
}
