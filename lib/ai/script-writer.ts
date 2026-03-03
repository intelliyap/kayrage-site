import type { Technique } from "@/lib/techniques/types";

export interface GuidanceCue {
  time: number; // seconds from session start
  text: string;
  duration: number; // seconds to display
}

export function generateLocalScript(
  techniques: Technique[],
  sessionDuration: number,
  guidanceDensity: { minGap: number; maxGap: number }
): GuidanceCue[] {
  const cues: GuidanceCue[] = [];
  const totalSeconds = sessionDuration;

  // Opening cue
  cues.push({
    time: 0,
    text: "Close your eyes. Settle in.",
    duration: 5,
  });

  cues.push({
    time: 8,
    text: "Let your body get heavy.",
    duration: 5,
  });

  // Distribute techniques across session
  const techniqueTime = totalSeconds - 30; // Reserve 30s for opening/closing
  const slotDuration = techniqueTime / techniques.length;
  let currentTime = 20;

  for (let i = 0; i < techniques.length; i++) {
    const technique = techniques[i];
    const slotStart = currentTime;
    const slotEnd = slotStart + slotDuration;

    // Technique introduction
    cues.push({
      time: Math.round(slotStart),
      text: technique.cue,
      duration: 6,
    });

    // Fill with guidance at the configured density
    let nextCueTime = slotStart + guidanceDensity.minGap;
    const followUps = getFollowUpCues(technique);
    let followUpIndex = 0;

    while (nextCueTime < slotEnd - 10 && followUpIndex < followUps.length) {
      const gap =
        guidanceDensity.minGap +
        Math.random() * (guidanceDensity.maxGap - guidanceDensity.minGap);
      nextCueTime += gap;

      if (nextCueTime < slotEnd - 10) {
        cues.push({
          time: Math.round(nextCueTime),
          text: followUps[followUpIndex],
          duration: 5,
        });
        followUpIndex++;
      }
    }

    currentTime = slotEnd;
  }

  // Closing
  cues.push({
    time: Math.round(totalSeconds - 20),
    text: "Begin to return. No rush.",
    duration: 5,
  });

  cues.push({
    time: Math.round(totalSeconds - 10),
    text: "When you're ready, open your eyes.",
    duration: 5,
  });

  return cues.sort((a, b) => a.time - b.time);
}

function getFollowUpCues(technique: Technique): string[] {
  const genericFollowUps: Record<string, string[]> = {
    Breath: [
      "Stay with it.",
      "Just the breath. Nothing else.",
      "Notice the rhythm finding itself.",
      "Let the breath breathe you.",
    ],
    Body: [
      "Keep scanning. Slowly.",
      "No need to change anything. Just notice.",
      "Feel what's actually there.",
      "Let awareness move on its own.",
    ],
    Visual: [
      "Hold the image. Let it sharpen.",
      "Don't force it. Let it appear.",
      "Stay with what you see.",
      "Let the light expand.",
    ],
    Sound: [
      "Listen deeper.",
      "Let the sound fill you.",
      "Beyond the sound... what's there?",
      "Don't chase it. Let it come to you.",
    ],
    Perception: [
      "Widen your field.",
      "Notice without naming.",
      "Everything at once.",
      "Stay open. Stay aware.",
    ],
    Inquiry: [
      "Don't answer. Just sit with it.",
      "Let the question dissolve.",
      "Who is asking?",
      "Stay in not-knowing.",
    ],
  };

  return genericFollowUps[technique.method] || [
    "Stay with it.",
    "Keep going.",
    "Notice what's here.",
  ];
}
