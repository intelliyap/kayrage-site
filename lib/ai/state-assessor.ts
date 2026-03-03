export type Mood = "calm" | "anxious" | "tired" | "energized" | "scattered" | "neutral";
export type EnergyLevel = "low" | "medium" | "high";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface StateAssessment {
  mood: Mood;
  energy: EnergyLevel;
  timeOfDay: TimeOfDay;
  timeAvailable: number; // minutes
  notes?: string;
}

export function detectTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function suggestMode(assessment: StateAssessment): "still" | "active" {
  if (assessment.timeOfDay === "night" || assessment.mood === "tired") return "still";
  if (assessment.energy === "high" && assessment.mood === "energized") return "active";
  if (assessment.mood === "anxious" || assessment.mood === "scattered") return "still";
  return assessment.energy === "low" ? "still" : "active";
}

export function suggestProfile(
  assessment: StateAssessment
): "drift" | "pulse" | "depth" | null {
  const mode = suggestMode(assessment);
  if (mode === "still") return null;

  if (assessment.mood === "tired" || assessment.energy === "low") return "depth";
  if (assessment.mood === "energized" && assessment.energy === "high") return "pulse";
  return "drift";
}

export function suggestDuration(assessment: StateAssessment): number {
  const available = assessment.timeAvailable;
  if (available <= 5) return 5 * 60;
  if (available <= 10) return 10 * 60;
  if (available <= 20) return 15 * 60;
  if (available <= 30) return 20 * 60;
  return 30 * 60;
}
