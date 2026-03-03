import type { Technique } from "@/lib/techniques/types";
import type { StateAssessment } from "./state-assessor";
import type { GuidanceCue } from "./script-writer";

export interface SessionPlan {
  mode: "still" | "active";
  activeProfile: "drift" | "pulse" | "depth" | null;
  focusLevel: "sync" | "edge" | "expand" | "void";
  duration: number; // seconds
  techniques: string[]; // technique codes
  guidanceScript: GuidanceCue[];
  audioConfig: {
    binauralFreq: number;
    carrier: number;
    bpm: number | null;
    key: string | null;
    reverbDecay: number;
    noiseLevel: number;
  };
  reasoning: string;
}

const SYSTEM_PROMPT = `You are the KAY-OS session engine. Given a user's current state, preferences, progression level, and session history, generate a personalized session plan.

Return ONLY valid JSON with this structure:
{
  "mode": "still" | "active",
  "activeProfile": "drift" | "pulse" | "depth" | null,
  "focusLevel": "sync" | "edge" | "expand" | "void",
  "duration": number (seconds),
  "techniques": ["B-01", "S-03", ...],
  "guidanceScript": [
    { "time": 0, "text": "Close your eyes.", "duration": 5 },
    { "time": 30, "text": "Feel your breath.", "duration": 5 }
  ],
  "audioConfig": {
    "binauralFreq": number,
    "carrier": number,
    "bpm": number | null,
    "key": string | null,
    "reverbDecay": number,
    "noiseLevel": number
  },
  "reasoning": "Brief explanation of why these choices"
}

Rules:
- Never reference "Hemi-Sync", "Gateway Experience", "Monroe Institute", "iRest", or "Gateway Voyage"
- Use KAY-OS level names: Sync, The Edge, Expand, Void, Bridge
- Make no medical or health claims
- Match technique difficulty to user level
- For still mode, activeProfile should be null
- Guidance density decreases with higher levels`;

export async function generateSessionWithAI(
  stateAssessment: StateAssessment,
  userLevel: string,
  recentSessions: Array<{ techniques: string[]; mode: string; depthRating?: number }>,
  preferences: { tone: string; sessionLength: string; activeProfile: string },
  availableTechniques: Technique[],
  timeAvailable: number
): Promise<SessionPlan> {
  const userMessage = `
User state: ${JSON.stringify(stateAssessment)}
Current level: ${userLevel}
Session history (last 5): ${JSON.stringify(recentSessions)}
Preferences: ${JSON.stringify(preferences)}
Available techniques at this level: ${JSON.stringify(availableTechniques.map((t) => ({ code: t.code, name: t.name, method: t.method, mode: t.mode, cue: t.cue })))}
Time available: ${timeAvailable} minutes
`;

  const response = await fetch("/api/session/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemPrompt: SYSTEM_PROMPT,
      userMessage,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate session plan");
  }

  const data = await response.json();
  return data.plan as SessionPlan;
}
