import { describe, it, expect } from "vitest";
import {
  processSessionCompletion,
  type CompletedSession,
  type UserStats,
} from "@/lib/progression/tracking";
import { checkUnlockEligibility, checkNextLevelEligibility } from "@/lib/progression/criteria";

const emptyStats: UserStats = {
  currentLevel: "sync",
  totalSessions: 0,
  totalMinutes: 0,
  levelStats: {},
};

function makeSession(overrides?: Partial<CompletedSession>): CompletedSession {
  return {
    focusLevel: "sync",
    durationActual: 900,
    depthRating: 7,
    techniques: ["B-01"],
    completed: true,
    ...overrides,
  };
}

describe("processSessionCompletion", () => {
  it("increments global and level-specific counts", () => {
    const result = processSessionCompletion(makeSession(), emptyStats);
    expect(result.updatedStats.totalSessions).toBe(1);
    expect(result.updatedStats.totalMinutes).toBe(15);
    expect(result.updatedStats.levelStats.sync.sessionsCompleted).toBe(1);
    expect(result.updatedStats.levelStats.sync.avgDepthRating).toBe(7);
  });

  it("does not count incomplete sessions", () => {
    const result = processSessionCompletion(
      makeSession({ completed: false }),
      emptyStats,
    );
    expect(result.updatedStats.totalSessions).toBe(0);
  });

  it("advances to edge after 5 sync sessions", () => {
    let stats = { ...emptyStats };
    for (let i = 0; i < 5; i++) {
      const result = processSessionCompletion(makeSession(), stats);
      stats = result.updatedStats;
    }
    expect(stats.currentLevel).toBe("edge");
  });

  it("merges technique exposure", () => {
    const first = processSessionCompletion(
      makeSession({ techniques: ["B-01", "B-02"] }),
      emptyStats,
    );
    const second = processSessionCompletion(
      makeSession({ techniques: ["B-02", "S-01"] }),
      first.updatedStats,
    );
    expect(second.updatedStats.levelStats.sync.techniquesExplored).toEqual(
      ["B-01", "B-02", "S-01"],
    );
  });
});

describe("checkUnlockEligibility", () => {
  it("sync is always eligible", () => {
    const result = checkUnlockEligibility("sync", {
      sessionsCompleted: 0,
      avgDepthRating: 0,
    });
    expect(result.eligible).toBe(true);
  });

  it("edge requires 5 sessions", () => {
    const not = checkUnlockEligibility("edge", {
      sessionsCompleted: 3,
      avgDepthRating: 0,
    });
    expect(not.eligible).toBe(false);

    const yes = checkUnlockEligibility("edge", {
      sessionsCompleted: 5,
      avgDepthRating: 0,
    });
    expect(yes.eligible).toBe(true);
  });

  it("expand requires 15 sessions and depth >= 6", () => {
    const result = checkUnlockEligibility("expand", {
      sessionsCompleted: 15,
      avgDepthRating: 6,
    });
    expect(result.eligible).toBe(true);

    const low = checkUnlockEligibility("expand", {
      sessionsCompleted: 15,
      avgDepthRating: 5,
    });
    expect(low.eligible).toBe(false);
  });
});

describe("checkNextLevelEligibility", () => {
  it("returns null at max level", () => {
    expect(checkNextLevelEligibility("bridge", { sessionsCompleted: 0, avgDepthRating: 0 }))
      .toBeNull();
  });

  it("returns next level info for sync", () => {
    const result = checkNextLevelEligibility("sync", {
      sessionsCompleted: 3,
      avgDepthRating: 5,
    });
    expect(result?.nextLevel.id).toBe("edge");
    expect(result?.eligibility.eligible).toBe(false);
  });
});
