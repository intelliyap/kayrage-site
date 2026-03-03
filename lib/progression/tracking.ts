// ---------------------------------------------------------------------------
// Session Tracking & Level Advancement
// ---------------------------------------------------------------------------
// Called after every completed session. Produces a result describing whether
// the user has advanced, their updated stats, and optional messaging.
// ---------------------------------------------------------------------------

import { getLevel, getNextLevel, type FocusLevel } from "./levels";
import {
  checkUnlockEligibility,
  type UserLevelStats,
  type UnlockEligibility,
} from "./criteria";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Represents a completed session — the minimum data we need for tracking. */
export interface CompletedSession {
  /** Focus level the session was played at */
  focusLevel: string;
  /** Duration actually completed (seconds) */
  durationActual: number;
  /** User's self-reported depth rating 1-10 */
  depthRating: number;
  /** Technique codes used during the session */
  techniques: string[];
  /** Whether the session was fully completed (not abandoned) */
  completed: boolean;
}

/** Cumulative stats for a user, typically loaded from the database. */
export interface UserStats {
  /** Current focus level id */
  currentLevel: string;
  /** Total number of completed sessions (all levels) */
  totalSessions: number;
  /** Total minutes practiced (all levels) */
  totalMinutes: number;
  /** Per-level breakdown */
  levelStats: Record<
    string,
    {
      sessionsCompleted: number;
      totalDepthRating: number;
      avgDepthRating: number;
      techniquesExplored: string[];
    }
  >;
}

/** The result of processing a session completion. */
export interface SessionCompletionResult {
  /** Updated aggregate user stats */
  updatedStats: UserStats;
  /** Whether the user advanced to a new level */
  advanced: boolean;
  /** The new level (only set if `advanced` is true) */
  newLevel: FocusLevel | null;
  /** Eligibility status for the *next* level after this session */
  nextLevelEligibility: UnlockEligibility | null;
  /** Next level metadata (null if at max) */
  nextLevel: FocusLevel | null;
  /** Minutes completed this session */
  sessionMinutes: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureLevelStats(stats: UserStats, levelId: string): void {
  if (!stats.levelStats[levelId]) {
    stats.levelStats[levelId] = {
      sessionsCompleted: 0,
      totalDepthRating: 0,
      avgDepthRating: 0,
      techniquesExplored: [],
    };
  }
}

function recalculateAvgDepth(
  totalDepthRating: number,
  sessionsCompleted: number,
): number {
  if (sessionsCompleted === 0) return 0;
  return Math.round((totalDepthRating / sessionsCompleted) * 10) / 10;
}

function mergeTechniques(
  existing: string[],
  incoming: string[],
): string[] {
  const set = new Set(existing);
  for (const t of incoming) set.add(t);
  return Array.from(set).sort();
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Process a completed session and return updated stats + advancement info.
 *
 * This is a pure function — it does NOT write to the database. The caller
 * is responsible for persisting the returned `updatedStats` and handling
 * the `advanced` flag (e.g. showing a level-up modal).
 */
export function processSessionCompletion(
  session: CompletedSession,
  userStats: UserStats,
): SessionCompletionResult {
  // Validate the focus level
  getLevel(session.focusLevel);

  // Deep-clone stats so we don't mutate the input
  const updated: UserStats = {
    currentLevel: userStats.currentLevel,
    totalSessions: userStats.totalSessions,
    totalMinutes: userStats.totalMinutes,
    levelStats: Object.fromEntries(
      Object.entries(userStats.levelStats).map(([k, v]) => [
        k,
        {
          ...v,
          techniquesExplored: [...v.techniquesExplored],
        },
      ]),
    ),
  };

  const sessionMinutes = Math.round(session.durationActual / 60);

  // Only count completed sessions toward progression
  if (session.completed) {
    // Global counters
    updated.totalSessions += 1;
    updated.totalMinutes += sessionMinutes;

    // Level-specific counters
    ensureLevelStats(updated, session.focusLevel);
    const lvl = updated.levelStats[session.focusLevel];
    lvl.sessionsCompleted += 1;
    lvl.totalDepthRating += session.depthRating;
    lvl.avgDepthRating = recalculateAvgDepth(
      lvl.totalDepthRating,
      lvl.sessionsCompleted,
    );
    lvl.techniquesExplored = mergeTechniques(
      lvl.techniquesExplored,
      session.techniques,
    );
  }

  // --- Check for level advancement ---
  let advanced = false;
  let newLevel: FocusLevel | null = null;

  const nextLevelDef = getNextLevel(updated.currentLevel);

  if (nextLevelDef && session.completed) {
    // Build stats object for the current level (which is the "previous" level
    // relative to the next one).
    const currentLevelStats = updated.levelStats[updated.currentLevel];
    if (currentLevelStats) {
      const statsForCheck: UserLevelStats = {
        sessionsCompleted: currentLevelStats.sessionsCompleted,
        avgDepthRating: currentLevelStats.avgDepthRating,
      };

      const eligibility = checkUnlockEligibility(nextLevelDef.id, statsForCheck);

      if (eligibility.eligible) {
        advanced = true;
        newLevel = nextLevelDef;
        updated.currentLevel = nextLevelDef.id;

        // Ensure the new level has a stats entry
        ensureLevelStats(updated, nextLevelDef.id);
      }
    }
  }

  // --- Next level eligibility (after potential advancement) ---
  const postAdvanceNext = getNextLevel(updated.currentLevel);
  let nextLevelEligibility: UnlockEligibility | null = null;

  if (postAdvanceNext) {
    const currentStats = updated.levelStats[updated.currentLevel];
    if (currentStats) {
      nextLevelEligibility = checkUnlockEligibility(postAdvanceNext.id, {
        sessionsCompleted: currentStats.sessionsCompleted,
        avgDepthRating: currentStats.avgDepthRating,
      });
    } else {
      nextLevelEligibility = checkUnlockEligibility(postAdvanceNext.id, {
        sessionsCompleted: 0,
        avgDepthRating: 0,
      });
    }
  }

  return {
    updatedStats: updated,
    advanced,
    newLevel,
    nextLevelEligibility,
    nextLevel: postAdvanceNext,
    sessionMinutes,
  };
}

/**
 * Calculate average depth rating from a set of depth values.
 * Useful for dashboards and charts.
 */
export function calculateAverageDepth(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

/**
 * Build a UserLevelStats object from raw session data — a convenience for
 * callers that don't already have aggregated stats.
 */
export function buildLevelStatsFromSessions(
  sessions: CompletedSession[],
  levelId: string,
): UserLevelStats {
  const filtered = sessions.filter(
    (s) => s.focusLevel === levelId && s.completed,
  );
  const sessionsCompleted = filtered.length;
  const avgDepthRating =
    sessionsCompleted > 0
      ? calculateAverageDepth(filtered.map((s) => s.depthRating))
      : 0;

  return { sessionsCompleted, avgDepthRating };
}
