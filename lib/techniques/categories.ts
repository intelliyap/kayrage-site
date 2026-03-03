// ---------------------------------------------------------------------------
// KAY-OS Technique Library -- Need-based Categories
// ---------------------------------------------------------------------------

import type { NeedCategory, Technique } from '@/lib/techniques/types';
import { techniqueMap } from '@/lib/techniques/library';

/**
 * Maps each need category to the technique codes best suited to it.
 *
 * A technique may appear in multiple categories. The assignments are based on
 * the technique's method, mode, physiological effect, and tradition.
 */
export const needCategories: Record<NeedCategory, string[]> = {
  // ---------------------------------------------------------------------------
  // calm -- down-regulation, parasympathetic activation, settling
  // ---------------------------------------------------------------------------
  calm: [
    'B-01', // Breath Awareness
    'B-02', // Breath Turning Points
    'B-04', // Alternate Nostril
    'B-06', // Extended Exhale
    'B-08', // Humming Breath
    'S-01', // Body Scan
    'S-05', // Single Point Focus
    'S-06', // Sensation Without Reaction
    'A-01', // Riding the Sound
    'A-04', // Silence After Sound
    'A-05', // Humming Resonance
    'P-02', // Soft Gaze
    'P-05', // Spatial Awareness Field
    'I-06', // Sitting With Desire
  ],

  // ---------------------------------------------------------------------------
  // sleep -- deep relaxation, body dissolution, yoga nidra lineage
  // ---------------------------------------------------------------------------
  sleep: [
    'B-02', // Breath Turning Points
    'B-06', // Extended Exhale
    'B-08', // Humming Breath
    'S-01', // Body Scan
    'S-02', // Body Dissolution
    'S-03', // Hollow Body
    'S-07', // Paired Sensations
    'S-09', // Five Element Dissolution
    'V-01', // Point of Light
    'V-09', // Darkness Gazing
    'V-10', // Intention Seed
    'A-04', // Silence After Sound
    'A-05', // Humming Resonance
  ],

  // ---------------------------------------------------------------------------
  // focus -- concentration, single-pointed attention, executive function
  // ---------------------------------------------------------------------------
  focus: [
    'B-01', // Breath Awareness
    'B-03', // Counted Breath (Box)
    'B-07', // Breath at Forehead
    'S-04', // Whole Body Awareness
    'S-05', // Single Point Focus
    'V-01', // Point of Light
    'V-02', // Central Channel
    'A-01', // Riding the Sound
    'A-03', // Mantra Repetition
    'P-01', // Space Between Objects
    'P-04', // Non-Reactive Perception
    'P-07', // Decision Point Awareness
    'I-03', // Observing Thought
  ],

  // ---------------------------------------------------------------------------
  // energy -- activation, heat, mobilisation, alertness
  // ---------------------------------------------------------------------------
  energy: [
    'B-03', // Counted Breath (Box)
    'B-05', // Breath of Fire
    'S-04', // Whole Body Awareness
    'S-08', // Pre-Movement Awareness
    'S-10', // Inner Fire
    'V-04', // Rising Energy
    'V-05', // Body of Light
    'P-01', // Space Between Objects
    'P-03', // World as Art
    'P-07', // Decision Point Awareness
    'I-05', // Emotion as Energy
  ],

  // ---------------------------------------------------------------------------
  // awareness -- meta-cognition, open monitoring, insight
  // ---------------------------------------------------------------------------
  awareness: [
    'P-01', // Space Between Objects
    'P-02', // Soft Gaze
    'P-03', // World as Art
    'P-04', // Non-Reactive Perception
    'P-05', // Spatial Awareness Field
    'P-06', // Awareness of Awareness
    'P-07', // Decision Point Awareness
    'I-01', // Who Am I?
    'I-02', // I Am Without Attributes
    'I-03', // Observing Thought
    'I-04', // Source of Thought
    'I-05', // Emotion as Energy
    'I-07', // Awareness of Awareness (advanced)
    'V-07', // Dissolving Form
    'V-08', // Spatial Expansion
  ],

  // ---------------------------------------------------------------------------
  // recovery -- somatic settling, equanimity, post-exertion restoration
  // ---------------------------------------------------------------------------
  recovery: [
    'B-01', // Breath Awareness
    'B-02', // Breath Turning Points
    'B-04', // Alternate Nostril
    'B-06', // Extended Exhale
    'S-01', // Body Scan
    'S-06', // Sensation Without Reaction
    'S-07', // Paired Sensations
    'V-10', // Intention Seed
    'A-04', // Silence After Sound
    'A-05', // Humming Resonance
    'I-05', // Emotion as Energy
    'I-06', // Sitting With Desire
  ],
};

// ---------------------------------------------------------------------------
// Helper -- retrieve full Technique objects for a given need category
// ---------------------------------------------------------------------------

/**
 * Returns the full `Technique` objects for a given need category.
 *
 * Unknown codes are silently filtered out so the function never throws.
 */
export function getTechniquesByNeed(need: NeedCategory): Technique[] {
  const codes = needCategories[need] ?? [];
  return codes
    .map((code) => techniqueMap[code])
    .filter((t): t is Technique => t !== undefined);
}

// ---------------------------------------------------------------------------
// Convenience -- list all need categories
// ---------------------------------------------------------------------------

/** Returns every `NeedCategory` value. */
export function getAllNeedCategories(): NeedCategory[] {
  return Object.keys(needCategories) as NeedCategory[];
}
