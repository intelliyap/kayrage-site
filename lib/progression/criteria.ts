// ---------------------------------------------------------------------------
// Unlock Criteria — defines what a user must achieve to advance to each level
// ---------------------------------------------------------------------------

import type { FocusLevel } from "./levels";
import { getLevel, getNextLevel } from "./levels";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnlockCriteria {
  /** The level these criteria unlock */
  levelId: string;
  /** Minimum completed sessions at the *previous* level */
  requiredSessions: number;
  /** Minimum average depth rating at the previous level (null = no minimum) */
  requiredAvgDepth: number | null;
  /** Whether this level requires a manual invitation */
  inviteOnly: boolean;
  /** Human-readable summary of the criteria */
  description: string;
}

export interface UnlockEligibility {
  /** Whether the user meets all requirements */
  eligible: boolean;
  /** 0-1 progress toward eligibility (1 = all criteria met) */
  progress: number;
  /** Human-readable status message */
  reason: string;
}

export interface UserLevelStats {
  /** How many sessions completed at the previous level */
  sessionsCompleted: number;
  /** Average depth rating across sessions at the previous level */
  avgDepthRating: number;
  /** Whether the user has been issued an invitation for invite-only levels */
  hasInvite?: boolean;
}

// ---------------------------------------------------------------------------
// Criteria definitions (keyed by the level they UNLOCK)
// ---------------------------------------------------------------------------

const criteriaMap: Record<string, UnlockCriteria> = {
  // Sync is the default starting level — no criteria
  edge: {
    levelId: "edge",
    requiredSessions: 5,
    requiredAvgDepth: null,
    inviteOnly: false,
    description: "Complete 5 Sync sessions.",
  },
  expand: {
    levelId: "expand",
    requiredSessions: 15,
    requiredAvgDepth: 6,
    inviteOnly: false,
    description:
      "Complete 15 Edge sessions with an average depth rating of 6 or higher.",
  },
  void: {
    levelId: "void",
    requiredSessions: 30,
    requiredAvgDepth: 7,
    inviteOnly: false,
    description:
      "Complete 30 Expand sessions with an average depth rating of 7 or higher.",
  },
  bridge: {
    levelId: "bridge",
    requiredSessions: 50,
    requiredAvgDepth: null,
    inviteOnly: true,
    description:
      "Invite only. Complete 50+ Void sessions to become eligible.",
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the unlock criteria for a given level id.
 * Returns `null` for the starting level ("sync") since it has no criteria.
 */
export function getUnlockCriteria(levelId: string): UnlockCriteria | null {
  // Validate that the level actually exists
  getLevel(levelId);
  return criteriaMap[levelId] ?? null;
}

/**
 * Check whether a user is eligible to unlock a specific level, given their
 * stats at the *previous* level.
 *
 * @param levelId - The level the user is trying to unlock.
 * @param stats   - The user's stats at the level immediately below `levelId`.
 */
export function checkUnlockEligibility(
  levelId: string,
  stats: UserLevelStats,
): UnlockEligibility {
  const criteria = getUnlockCriteria(levelId);

  // Starting level — always eligible
  if (!criteria) {
    return { eligible: true, progress: 1, reason: "Starting level." };
  }

  const checks: { met: boolean; weight: number; message: string }[] = [];

  // --- Session count ---
  const sessionsMet = stats.sessionsCompleted >= criteria.requiredSessions;
  const sessionProgress = Math.min(
    stats.sessionsCompleted / criteria.requiredSessions,
    1,
  );
  checks.push({
    met: sessionsMet,
    weight: criteria.requiredAvgDepth != null ? 0.6 : 0.9,
    message: sessionsMet
      ? `Sessions complete (${stats.sessionsCompleted}/${criteria.requiredSessions}).`
      : `${stats.sessionsCompleted}/${criteria.requiredSessions} sessions completed.`,
  });

  // --- Average depth ---
  if (criteria.requiredAvgDepth != null) {
    const depthMet = stats.avgDepthRating >= criteria.requiredAvgDepth;
    const depthProgress = Math.min(
      stats.avgDepthRating / criteria.requiredAvgDepth,
      1,
    );
    checks.push({
      met: depthMet,
      weight: 0.3,
      message: depthMet
        ? `Average depth met (${stats.avgDepthRating.toFixed(1)}/${criteria.requiredAvgDepth}).`
        : `Average depth ${stats.avgDepthRating.toFixed(1)}/${criteria.requiredAvgDepth}.`,
    });
    // Factor depth progress into session-weighted progress
    checks[0].weight = 0.6;
    checks[1].weight = 0.3;
  }

  // --- Invite check ---
  if (criteria.inviteOnly) {
    const inviteMet = stats.hasInvite === true;
    checks.push({
      met: inviteMet,
      weight: 0.1,
      message: inviteMet ? "Invitation received." : "Invitation required.",
    });
  }

  // Aggregate
  const totalWeight = checks.reduce((s, c) => s + c.weight, 0);
  const weightedProgress = checks.reduce((s, c) => {
    const itemProgress = c.met
      ? c.weight
      : c.message.includes("sessions")
        ? sessionProgress * c.weight
        : c.message.includes("depth")
          ? Math.min(stats.avgDepthRating / (criteria.requiredAvgDepth ?? 1), 1) *
            c.weight
          : 0;
    return s + itemProgress;
  }, 0);
  const progress = Math.min(weightedProgress / totalWeight, 1);

  const allMet = checks.every((c) => c.met);
  const reasons = checks.map((c) => c.message).join(" ");

  return {
    eligible: allMet,
    progress: Math.round(progress * 100) / 100,
    reason: allMet
      ? `All criteria met. Ready to advance to ${getLevel(levelId).name}.`
      : reasons,
  };
}

/**
 * Convenience: given a user's *current* level, check eligibility for the next
 * level in the chain.
 *
 * Returns `null` if the user is already at the highest level.
 */
export function checkNextLevelEligibility(
  currentLevelId: string,
  stats: UserLevelStats,
): { nextLevel: FocusLevel; eligibility: UnlockEligibility } | null {
  const next = getNextLevel(currentLevelId);
  if (!next) return null;
  return {
    nextLevel: next,
    eligibility: checkUnlockEligibility(next.id, stats),
  };
}
