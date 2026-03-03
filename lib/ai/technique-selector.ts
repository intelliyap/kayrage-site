import type { Technique } from "@/lib/techniques/types";
import type { StateAssessment } from "./state-assessor";

export interface TechniqueSelection {
  techniques: Technique[];
  reasoning: string;
}

export function getAvailableTechniques(
  allTechniques: Technique[],
  userLevel: string,
  mode: "still" | "active"
): Technique[] {
  const levelOrder = ["sync", "edge", "expand", "void", "bridge"];
  const userLevelIndex = levelOrder.indexOf(userLevel);

  return allTechniques.filter((t) => {
    const modeMatch = t.mode === "Both" || t.mode.toLowerCase() === mode;
    const levelMatch = t.focusLevels.some(
      (fl) => levelOrder.indexOf(fl) <= userLevelIndex
    );
    return modeMatch && levelMatch;
  });
}

export function selectTechniques(
  available: Technique[],
  assessment: StateAssessment,
  sessionDuration: number,
  recentTechniques: string[] = []
): TechniqueSelection {
  const durationMinutes = sessionDuration / 60;
  let selected: Technique[] = [];
  const reasons: string[] = [];

  // Prioritize techniques not recently used
  const fresh = available.filter((t) => !recentTechniques.includes(t.code));
  const pool = fresh.length >= 3 ? fresh : available;

  // Start with a breath technique for grounding
  const breathTechniques = pool.filter((t) => t.method === "Breath");
  if (breathTechniques.length > 0) {
    const opener = breathTechniques[Math.floor(Math.random() * breathTechniques.length)];
    selected.push(opener);
    reasons.push(`Opening with ${opener.name} for grounding`);
  }

  // Select based on mood/need
  const moodTechniques = getMoodTechniques(pool, assessment);
  const remaining = moodTechniques.filter(
    (t) => !selected.some((s) => s.code === t.code)
  );

  // Fill based on duration (roughly 1 technique per 5-7 minutes)
  const targetCount = Math.max(2, Math.min(5, Math.ceil(durationMinutes / 6)));
  while (selected.length < targetCount && remaining.length > 0) {
    const idx = Math.floor(Math.random() * remaining.length);
    selected.push(remaining[idx]);
    remaining.splice(idx, 1);
  }

  // Ensure total min duration doesn't exceed session
  let totalMin = selected.reduce((sum, t) => sum + t.minDuration, 0);
  while (totalMin > durationMinutes && selected.length > 2) {
    selected.pop();
    totalMin = selected.reduce((sum, t) => sum + t.minDuration, 0);
  }

  return {
    techniques: selected,
    reasoning: reasons.join(". ") || "Selected balanced technique mix for session",
  };
}

function getMoodTechniques(
  pool: Technique[],
  assessment: StateAssessment
): Technique[] {
  const scored = pool.map((t) => ({
    technique: t,
    score: scoreTechniqueForState(t, assessment),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.technique);
}

function scoreTechniqueForState(
  technique: Technique,
  assessment: StateAssessment
): number {
  let score = 0;

  switch (assessment.mood) {
    case "anxious":
      if (technique.method === "Breath") score += 3;
      if (technique.method === "Body") score += 2;
      if (technique.code === "B-06") score += 2; // Extended Exhale
      break;
    case "scattered":
      if (technique.method === "Breath" || technique.method === "Sound") score += 3;
      if (technique.code === "B-03") score += 2; // Box Breathing
      if (technique.code === "S-05") score += 2; // Single Point Focus
      break;
    case "tired":
      if (technique.method === "Body") score += 2;
      if (technique.code === "S-01") score += 2; // Body Scan
      if (technique.difficulty === "Entry") score += 1;
      break;
    case "energized":
      if (technique.method === "Perception" || technique.method === "Inquiry")
        score += 2;
      break;
    case "calm":
      if (technique.method === "Visual" || technique.method === "Inquiry")
        score += 2;
      break;
  }

  switch (assessment.energy) {
    case "low":
      if (technique.difficulty === "Entry") score += 2;
      break;
    case "high":
      if (technique.difficulty !== "Entry") score += 1;
      break;
  }

  if (assessment.timeOfDay === "night") {
    if (technique.method === "Body" || technique.method === "Breath") score += 1;
  }

  return score;
}
