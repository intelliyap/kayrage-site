import { describe, it, expect } from "vitest";
import {
  suggestMode,
  suggestProfile,
  suggestDuration,
  type StateAssessment,
} from "@/lib/ai/state-assessor";

const base: StateAssessment = {
  mood: "neutral",
  energy: "medium",
  timeOfDay: "afternoon",
  timeAvailable: 15,
};

describe("suggestMode", () => {
  it("returns still for night sessions", () => {
    expect(suggestMode({ ...base, timeOfDay: "night" })).toBe("still");
  });

  it("returns still for tired mood", () => {
    expect(suggestMode({ ...base, mood: "tired" })).toBe("still");
  });

  it("returns active for energized + high energy", () => {
    expect(suggestMode({ ...base, mood: "energized", energy: "high" })).toBe("active");
  });

  it("returns still for anxious mood", () => {
    expect(suggestMode({ ...base, mood: "anxious" })).toBe("still");
  });

  it("returns still for low energy", () => {
    expect(suggestMode({ ...base, energy: "low" })).toBe("still");
  });
});

describe("suggestProfile", () => {
  it("returns null for still mode", () => {
    expect(suggestProfile({ ...base, mood: "tired" })).toBeNull();
  });

  it("returns pulse for energized + high", () => {
    expect(suggestProfile({ ...base, mood: "energized", energy: "high" })).toBe("pulse");
  });

  it("returns drift for neutral medium", () => {
    expect(suggestProfile({ ...base, mood: "neutral", energy: "medium" })).toBe("drift");
  });
});

describe("suggestDuration", () => {
  it("returns 5 min for <= 5 min available", () => {
    expect(suggestDuration({ ...base, timeAvailable: 5 })).toBe(300);
  });

  it("returns 10 min for 10 min available", () => {
    expect(suggestDuration({ ...base, timeAvailable: 10 })).toBe(600);
  });

  it("returns 15 min for 15 min available", () => {
    expect(suggestDuration({ ...base, timeAvailable: 15 })).toBe(900);
  });

  it("returns 30 min for 45+ min available", () => {
    expect(suggestDuration({ ...base, timeAvailable: 45 })).toBe(1800);
  });
});
