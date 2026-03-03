/**
 * Audio bed catalog for KAY-OS.
 *
 * Maps session configurations to pre-rendered audio beds stored in R2.
 * Each bed entry contains metadata used by the prepare-audio endpoint
 * to select the right bed for a session.
 */

import type { ProfileName } from './profiles';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FocusLevel = 'sync' | 'edge' | 'expand' | 'void';
export type SessionMode = 'still' | 'active';

export interface AudioBed {
  id: string;
  mode: SessionMode;
  profile: ProfileName | null;
  focusLevel: FocusLevel;
  duration: number; // seconds
  binauralHz: number;
  bpm: number | null;
  key: string | null;
  r2Path: string;
}

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

export const BEDS_CATALOG: AudioBed[] = [
  // --- Still mode beds ---
  {
    id: 'still-sync',
    mode: 'still',
    profile: null,
    focusLevel: 'sync',
    duration: 30 * 60,
    binauralHz: 10,
    bpm: null,
    key: null,
    r2Path: 'audio/beds/still-sync-30m.mp3',
  },
  {
    id: 'still-edge',
    mode: 'still',
    profile: null,
    focusLevel: 'edge',
    duration: 30 * 60,
    binauralHz: 6,
    bpm: null,
    key: null,
    r2Path: 'audio/beds/still-edge-30m.mp3',
  },
  {
    id: 'still-expand',
    mode: 'still',
    profile: null,
    focusLevel: 'expand',
    duration: 30 * 60,
    binauralHz: 4,
    bpm: null,
    key: null,
    r2Path: 'audio/beds/still-expand-30m.mp3',
  },
  {
    id: 'still-void',
    mode: 'still',
    profile: null,
    focusLevel: 'void',
    duration: 30 * 60,
    binauralHz: 3,
    bpm: null,
    key: null,
    r2Path: 'audio/beds/still-void-30m.mp3',
  },

  // --- Active mode: Drift ---
  {
    id: 'active-drift-sync',
    mode: 'active',
    profile: 'drift',
    focusLevel: 'sync',
    duration: 30 * 60,
    binauralHz: 10,
    bpm: 112,
    key: 'C2',
    r2Path: 'audio/beds/active-drift-sync-30m.mp3',
  },
  {
    id: 'active-drift-edge',
    mode: 'active',
    profile: 'drift',
    focusLevel: 'edge',
    duration: 30 * 60,
    binauralHz: 6,
    bpm: 112,
    key: 'C2',
    r2Path: 'audio/beds/active-drift-edge-30m.mp3',
  },
  {
    id: 'active-drift-expand',
    mode: 'active',
    profile: 'drift',
    focusLevel: 'expand',
    duration: 30 * 60,
    binauralHz: 4,
    bpm: 112,
    key: 'C2',
    r2Path: 'audio/beds/active-drift-expand-30m.mp3',
  },
  {
    id: 'active-drift-void',
    mode: 'active',
    profile: 'drift',
    focusLevel: 'void',
    duration: 30 * 60,
    binauralHz: 3,
    bpm: 112,
    key: 'C2',
    r2Path: 'audio/beds/active-drift-void-30m.mp3',
  },

  // --- Active mode: Pulse ---
  {
    id: 'active-pulse-sync',
    mode: 'active',
    profile: 'pulse',
    focusLevel: 'sync',
    duration: 30 * 60,
    binauralHz: 10,
    bpm: 122,
    key: 'D2',
    r2Path: 'audio/beds/active-pulse-sync-30m.mp3',
  },
  {
    id: 'active-pulse-edge',
    mode: 'active',
    profile: 'pulse',
    focusLevel: 'edge',
    duration: 30 * 60,
    binauralHz: 6,
    bpm: 122,
    key: 'D2',
    r2Path: 'audio/beds/active-pulse-edge-30m.mp3',
  },
  {
    id: 'active-pulse-expand',
    mode: 'active',
    profile: 'pulse',
    focusLevel: 'expand',
    duration: 30 * 60,
    binauralHz: 4,
    bpm: 122,
    key: 'D2',
    r2Path: 'audio/beds/active-pulse-expand-30m.mp3',
  },
  {
    id: 'active-pulse-void',
    mode: 'active',
    profile: 'pulse',
    focusLevel: 'void',
    duration: 30 * 60,
    binauralHz: 3,
    bpm: 122,
    key: 'D2',
    r2Path: 'audio/beds/active-pulse-void-30m.mp3',
  },

  // --- Active mode: Depth ---
  {
    id: 'active-depth-sync',
    mode: 'active',
    profile: 'depth',
    focusLevel: 'sync',
    duration: 30 * 60,
    binauralHz: 10,
    bpm: 98,
    key: 'A1',
    r2Path: 'audio/beds/active-depth-sync-30m.mp3',
  },
  {
    id: 'active-depth-edge',
    mode: 'active',
    profile: 'depth',
    focusLevel: 'edge',
    duration: 30 * 60,
    binauralHz: 6,
    bpm: 98,
    key: 'A1',
    r2Path: 'audio/beds/active-depth-edge-30m.mp3',
  },
  {
    id: 'active-depth-expand',
    mode: 'active',
    profile: 'depth',
    focusLevel: 'expand',
    duration: 30 * 60,
    binauralHz: 4,
    bpm: 98,
    key: 'A1',
    r2Path: 'audio/beds/active-depth-expand-30m.mp3',
  },
  {
    id: 'active-depth-void',
    mode: 'active',
    profile: 'depth',
    focusLevel: 'void',
    duration: 30 * 60,
    binauralHz: 3,
    bpm: 98,
    key: 'A1',
    r2Path: 'audio/beds/active-depth-void-30m.mp3',
  },
];

// ---------------------------------------------------------------------------
// Selection helpers
// ---------------------------------------------------------------------------

/**
 * Find the best matching bed for a session configuration.
 */
export function selectBed(
  mode: SessionMode,
  focusLevel: FocusLevel,
  profile?: ProfileName | null,
): AudioBed | undefined {
  return BEDS_CATALOG.find(
    (bed) =>
      bed.mode === mode &&
      bed.focusLevel === focusLevel &&
      (mode === 'still' || bed.profile === (profile ?? 'pulse')),
  );
}

/**
 * Get a bed by its ID.
 */
export function getBedById(id: string): AudioBed | undefined {
  return BEDS_CATALOG.find((bed) => bed.id === id);
}
