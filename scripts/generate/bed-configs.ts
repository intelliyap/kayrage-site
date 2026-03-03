/**
 * Bed render configurations for KAY-OS offline audio generation.
 *
 * Each config defines the parameters for rendering an audio bed
 * using Tone.js OfflineContext. These are used by render-beds.ts.
 */

import type { ProfileName } from '../../lib/audio/profiles';

export type FocusLevel = 'sync' | 'edge' | 'expand' | 'void';

export interface BedRenderConfig {
  id: string;
  mode: 'still' | 'active';
  profile?: ProfileName;
  focusLevel: FocusLevel;
  duration: number; // seconds
  binauralHz: number;
  carrierHz: number;
  bpm?: number;
  key?: string;
  reverbDecay: number;
  noiseLevel: number;
  outputFilename: string;
}

// ---------------------------------------------------------------------------
// Still mode beds — one per focus level, 30 min each
// ---------------------------------------------------------------------------

const stillBeds: BedRenderConfig[] = [
  {
    id: 'still-sync',
    mode: 'still',
    focusLevel: 'sync',
    duration: 30 * 60,
    binauralHz: 10,
    carrierHz: 150,
    reverbDecay: 8,
    noiseLevel: -26,
    outputFilename: 'still-sync-30m.mp3',
  },
  {
    id: 'still-edge',
    mode: 'still',
    focusLevel: 'edge',
    duration: 30 * 60,
    binauralHz: 6,
    carrierHz: 150,
    reverbDecay: 8,
    noiseLevel: -26,
    outputFilename: 'still-edge-30m.mp3',
  },
  {
    id: 'still-expand',
    mode: 'still',
    focusLevel: 'expand',
    duration: 30 * 60,
    binauralHz: 4,
    carrierHz: 150,
    reverbDecay: 8,
    noiseLevel: -26,
    outputFilename: 'still-expand-30m.mp3',
  },
  {
    id: 'still-void',
    mode: 'still',
    focusLevel: 'void',
    duration: 30 * 60,
    binauralHz: 3,
    carrierHz: 150,
    reverbDecay: 8,
    noiseLevel: -26,
    outputFilename: 'still-void-30m.mp3',
  },
];

// ---------------------------------------------------------------------------
// Active mode beds — one per profile × focus level, 30 min each
// ---------------------------------------------------------------------------

const activeProfiles: ProfileName[] = ['drift', 'pulse', 'depth'];
const focusLevels: FocusLevel[] = ['sync', 'edge', 'expand', 'void'];

const profileDefaults: Record<ProfileName, { bpm: number; binauralHz: number; reverbDecay: number; noiseLevel: number; key: string }> = {
  drift: { bpm: 112, binauralHz: 7, reverbDecay: 12, noiseLevel: -24, key: 'C2' },
  pulse: { bpm: 122, binauralHz: 10, reverbDecay: 3, noiseLevel: -30, key: 'D2' },
  depth: { bpm: 98, binauralHz: 5, reverbDecay: 16, noiseLevel: -20, key: 'A1' },
};

const focusLevelBinauralHz: Record<FocusLevel, number> = {
  sync: 10,
  edge: 6,
  expand: 4,
  void: 3,
};

const activeBeds: BedRenderConfig[] = activeProfiles.flatMap((profile) =>
  focusLevels.map((level): BedRenderConfig => {
    const defaults = profileDefaults[profile];
    return {
      id: `active-${profile}-${level}`,
      mode: 'active',
      profile,
      focusLevel: level,
      duration: 30 * 60,
      binauralHz: focusLevelBinauralHz[level],
      carrierHz: 150,
      bpm: defaults.bpm,
      key: defaults.key,
      reverbDecay: defaults.reverbDecay,
      noiseLevel: defaults.noiseLevel,
      outputFilename: `active-${profile}-${level}-30m.mp3`,
    };
  }),
);

// ---------------------------------------------------------------------------
// Export all configs
// ---------------------------------------------------------------------------

export const ALL_BED_CONFIGS: BedRenderConfig[] = [...stillBeds, ...activeBeds];

export function getBedConfig(id: string): BedRenderConfig | undefined {
  return ALL_BED_CONFIGS.find((c) => c.id === id);
}
