// ---------------------------------------------------------------------------
// KAY-OS Technique Library -- Type Definitions
// ---------------------------------------------------------------------------

/** Primary method / modality used by a technique. */
export type Method =
  | 'Breath'
  | 'Body'
  | 'Visual'
  | 'Sound'
  | 'Perception'
  | 'Inquiry';

/** Session delivery mode. */
export type Mode = 'Still' | 'Active' | 'Both';

/**
 * Internal focus-level identifiers.
 *
 * Mapping to the Focus numbering used in source traditions:
 *   sync   -> Focus 3
 *   edge   -> Focus 10
 *   expand -> Focus 12
 *   void   -> Focus 15
 *   bridge -> Focus 21
 */
export type FocusLevel = 'sync' | 'edge' | 'expand' | 'void' | 'bridge';

/** Technique difficulty tier. */
export type Difficulty = 'Entry' | 'Intermediate' | 'Advanced';

/** Need-based category for technique recommendations. */
export type NeedCategory =
  | 'calm'
  | 'sleep'
  | 'focus'
  | 'energy'
  | 'awareness'
  | 'recovery';

/** A single meditation / consciousness-training technique. */
export interface Technique {
  /** Unique code, e.g. "B-01", "S-03". */
  code: string;

  /** Human-readable technique name. */
  name: string;

  /** Primary method / modality. */
  method: Method;

  /** Delivery mode. */
  mode: Mode;

  /** Focus levels at which this technique is available. */
  focusLevels: FocusLevel[];

  /** Difficulty tier. */
  difficulty: Difficulty;

  /** Minimum recommended session length in minutes. */
  minDuration: number;

  /** Short AI-voice guidance cue. */
  cue: string;

  /** Tradition / lineage attribution. */
  source: string;

  /** 1-2 sentence plain-language description. */
  description: string;
}
