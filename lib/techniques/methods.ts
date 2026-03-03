// ---------------------------------------------------------------------------
// KAY-OS Technique Library -- Method Groupings
// ---------------------------------------------------------------------------

import type { Method, Technique } from '@/lib/techniques/types';
import { techniques } from '@/lib/techniques/library';

// ---------------------------------------------------------------------------
// Pre-computed index (built once at module load)
// ---------------------------------------------------------------------------

const methodIndex: Record<Method, Technique[]> = {
  Breath: [],
  Body: [],
  Visual: [],
  Sound: [],
  Perception: [],
  Inquiry: [],
};

for (const t of techniques) {
  methodIndex[t.method].push(t);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns all techniques that belong to the given method.
 *
 * The returned array is the internal reference -- callers should treat it as
 * read-only.
 */
export function getMethodTechniques(method: Method): Technique[] {
  return methodIndex[method];
}

/**
 * Returns every `Method` value in canonical display order.
 */
export function getAllMethods(): Method[] {
  return ['Breath', 'Body', 'Visual', 'Sound', 'Perception', 'Inquiry'];
}

/**
 * Returns a record mapping each method to the number of techniques it contains.
 */
export function getMethodCount(): Record<Method, number> {
  return {
    Breath: methodIndex.Breath.length,
    Body: methodIndex.Body.length,
    Visual: methodIndex.Visual.length,
    Sound: methodIndex.Sound.length,
    Perception: methodIndex.Perception.length,
    Inquiry: methodIndex.Inquiry.length,
  };
}
