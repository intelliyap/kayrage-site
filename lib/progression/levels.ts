// ---------------------------------------------------------------------------
// Focus Level Definitions
// ---------------------------------------------------------------------------
// Each level maps to Monroe-style Focus numbers (user-facing names only).
// Binaural frequency targets and guidance density are used by the audio
// engine and AI session generator respectively.
// ---------------------------------------------------------------------------

export interface GuidanceDensity {
  /** Minimum interval between guidance prompts (seconds) */
  minInterval: number;
  /** Maximum interval between guidance prompts (seconds) */
  maxInterval: number;
  /** Max total prompts per session (null = unlimited / interval-based) */
  maxPrompts: number | null;
}

export interface BinauralTarget {
  /** Primary beat frequency in Hz */
  primary: number;
  /** Optional secondary frequency layer (e.g. gamma bursts) */
  secondary: number | null;
  /** Description of the brainwave band being targeted */
  band: string;
  /** Additional notes on layering behaviour */
  notes: string;
}

export interface FocusLevel {
  /** Internal identifier used in DB and logic */
  id: string;
  /** User-facing display name */
  name: string;
  /** Internal / dev reference name */
  internalName: string;
  /** Monroe-style Focus number */
  focusNumber: number;
  /** One-line description shown to the user */
  description: string;
  /** Binaural beat target configuration */
  binauralTarget: BinauralTarget;
  /** How often AI voice guidance is delivered */
  guidanceDensity: GuidanceDensity;
  /** Ordinal for sorting / progression order */
  order: number;
}

// ---------------------------------------------------------------------------
// Level Data
// ---------------------------------------------------------------------------

export const levels: readonly FocusLevel[] = [
  {
    id: "sync",
    name: "Sync",
    internalName: "focus_3",
    focusNumber: 3,
    description:
      "Foundation level. Synchronise body and mind through breath and basic awareness.",
    binauralTarget: {
      primary: 10,
      secondary: null,
      band: "alpha",
      notes: "10 Hz alpha for relaxed, alert awareness.",
    },
    guidanceDensity: {
      minInterval: 20,
      maxInterval: 30,
      maxPrompts: null,
    },
    order: 0,
  },
  {
    id: "edge",
    name: "The Edge",
    internalName: "focus_10",
    focusNumber: 10,
    description:
      "The borderland between waking and sleep. Deeper awareness begins here.",
    binauralTarget: {
      primary: 5.5, // mid-theta
      secondary: 8, // alpha floor
      band: "theta + alpha floor",
      notes: "4-7 Hz theta primary with 8 Hz alpha floor.",
    },
    guidanceDensity: {
      minInterval: 60,
      maxInterval: 120,
      maxPrompts: null,
    },
    order: 1,
  },
  {
    id: "expand",
    name: "Expand",
    internalName: "focus_12",
    focusNumber: 12,
    description:
      "Expanded awareness. Perception stretches beyond normal boundaries.",
    binauralTarget: {
      primary: 4, // deep theta
      secondary: 40, // gamma bursts every 30s
      band: "deep theta + gamma bursts",
      notes: "3-5 Hz deep theta with 40 Hz gamma bursts every 30 seconds.",
    },
    guidanceDensity: {
      minInterval: 120, // 2 minutes
      maxInterval: 300, // 5 minutes
      maxPrompts: null,
    },
    order: 2,
  },
  {
    id: "void",
    name: "Void",
    internalName: "focus_15",
    focusNumber: 15,
    description:
      "No-thought awareness. The space between everything.",
    binauralTarget: {
      primary: 3, // theta-delta border
      secondary: 40, // sustained gamma
      band: "theta-delta + sustained gamma",
      notes: "2-4 Hz theta-delta with 40 Hz sustained gamma overlay.",
    },
    guidanceDensity: {
      minInterval: 0, // not interval-based
      maxInterval: 0,
      maxPrompts: 3, // 2-3 prompts then silence
    },
    order: 3,
  },
  {
    id: "bridge",
    name: "Bridge",
    internalName: "focus_21",
    focusNumber: 21,
    description:
      "Invite-only. Bridging states of consciousness. Uncharted territory.",
    binauralTarget: {
      primary: 1.5, // deep delta
      secondary: 40,
      band: "delta + gamma",
      notes: "Sub-2 Hz delta foundation with 40 Hz sustained gamma.",
    },
    guidanceDensity: {
      minInterval: 0,
      maxInterval: 0,
      maxPrompts: 1, // single opening prompt, then complete silence
    },
    order: 4,
  },
] as const;

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/**
 * Retrieve a level by its id string.
 * Throws if the id is not found (indicates a programming error).
 */
export function getLevel(id: string): FocusLevel {
  const level = levels.find((l) => l.id === id);
  if (!level) {
    throw new Error(`Unknown focus level id: "${id}"`);
  }
  return level;
}

/**
 * Get the next level in the progression chain, or `null` if the user is
 * already at the highest level.
 */
export function getNextLevel(currentId: string): FocusLevel | null {
  const current = getLevel(currentId);
  const next = levels.find((l) => l.order === current.order + 1);
  return next ?? null;
}

/**
 * Retrieve a level by its Focus number (3, 10, 12, 15, 21).
 */
export function getLevelByFocusNumber(num: number): FocusLevel {
  const level = levels.find((l) => l.focusNumber === num);
  if (!level) {
    throw new Error(`No focus level with number: ${num}`);
  }
  return level;
}
