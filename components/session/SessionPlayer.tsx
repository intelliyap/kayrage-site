"use client";

import { useEffect, useCallback } from "react";
import { useSessionStore } from "@/lib/stores/session-store";
import { useAudioStore } from "@/lib/stores/audio-store";
import { SessionTimer } from "./SessionTimer";
import { GuidanceText } from "./GuidanceText";
import { BreathPacer } from "./BreathPacer";
import { AudioVisualizer } from "./AudioVisualizer";
import { FocusLevelIndicator } from "./FocusLevelIndicator";
import { Button } from "@/components/ui/Button";

export function SessionPlayer() {
  const {
    currentSession,
    isPlaying,
    isPaused,
    elapsed,
    currentTechniqueIndex,
    activeGuidance,
    pauseSession,
    resumeSession,
    endSession,
    tick,
  } = useSessionStore();

  const { stopAudio, pauseAudio, resumeAudio } = useAudioStore();

  // Session timer
  useEffect(() => {
    if (!isPlaying || isPaused) return;

    const interval = setInterval(() => {
      tick(1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, isPaused, tick]);

  // Auto-end session when duration reached
  useEffect(() => {
    if (!currentSession || !isPlaying) return;
    if (elapsed >= currentSession.duration) {
      handleEnd();
    }
  }, [elapsed, currentSession, isPlaying]);

  const handlePause = useCallback(() => {
    pauseSession();
    pauseAudio();
  }, [pauseSession, pauseAudio]);

  const handleResume = useCallback(() => {
    resumeSession();
    resumeAudio();
  }, [resumeSession, resumeAudio]);

  const handleEnd = useCallback(() => {
    // stopAudio is now async (fade-out), fire and forget
    stopAudio();
    endSession();
  }, [stopAudio, endSession]);

  if (!currentSession) return null;

  const progress = currentSession.duration > 0
    ? elapsed / currentSession.duration
    : 0;

  const currentTechnique =
    currentSession.techniques[currentTechniqueIndex] || null;

  return (
    <div className="session-fullscreen flex flex-col items-center justify-center">
      {/* Visualizer background */}
      <AudioVisualizer
        profile={currentSession.activeProfile || "drift"}
        isPlaying={isPlaying && !isPaused}
      />

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-8">
        {/* Focus level */}
        <div className="absolute top-8 left-8">
          <FocusLevelIndicator level={currentSession.focusLevel} />
        </div>

        {/* Timer */}
        <div className="absolute top-8 right-8">
          <SessionTimer elapsed={elapsed} total={currentSession.duration} />
        </div>

        {/* Center content */}
        <div className="flex flex-col items-center gap-12">
          {/* Breath pacer (if breath technique active) */}
          {currentTechnique &&
            ["B-01", "B-02", "B-03", "B-04", "B-05", "B-06", "B-07", "B-08", "B-09"].includes(
              currentTechnique
            ) && <BreathPacer />}

          {/* Guidance text — now driven by engine voice cue callbacks via store */}
          <GuidanceText
            text={activeGuidance?.text || null}
            duration={activeGuidance?.duration || 5}
          />
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-24 left-8 right-8">
          <div className="w-full h-px bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-white/20 transition-all duration-1000 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 flex gap-4">
          {isPaused ? (
            <Button variant="secondary" size="lg" onClick={handleResume}>
              RESUME
            </Button>
          ) : (
            <Button variant="ghost" size="lg" onClick={handlePause}>
              PAUSE
            </Button>
          )}
          <Button variant="ghost" size="lg" onClick={handleEnd}>
            END
          </Button>
        </div>
      </div>
    </div>
  );
}
