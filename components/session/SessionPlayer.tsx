"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { useSessionStore } from "@/lib/stores/session-store";
import { useAudioStore } from "@/lib/stores/audio-store";
import { SessionTimer } from "./SessionTimer";
import { GuidanceText } from "./GuidanceText";
import { BreathPacer } from "./BreathPacer";
import { AudioVisualizer } from "./AudioVisualizer";
import { Button } from "@/components/ui/Button";

interface SessionPlayerProps {
  onEnd: () => void;
}

export function SessionPlayer({ onEnd }: SessionPlayerProps) {
  const {
    currentSession,
    isPlaying,
    isPaused,
    elapsed,
    currentTechniqueIndex,
    activeGuidance,
    pauseSession,
    resumeSession,
    tick,
  } = useSessionStore();

  const { pauseAudio, resumeAudio } = useAudioStore();

  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    if (!currentSession || isPlaying) return;
    // When tick() auto-stops playback (isPlaying becomes false, elapsed >= duration),
    // trigger the end flow
    if (elapsed >= currentSession.duration) {
      onEnd();
    }
  }, [elapsed, currentSession, isPlaying, onEnd]);

  // Cleanup confirm timer on unmount
  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
    };
  }, []);

  const handlePause = useCallback(() => {
    pauseSession();
    pauseAudio();
  }, [pauseSession, pauseAudio]);

  const handleResume = useCallback(() => {
    resumeSession();
    resumeAudio();
  }, [resumeSession, resumeAudio]);

  const handleEndTap = useCallback(() => {
    if (confirmingEnd) {
      // Second tap — confirm end
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      setConfirmingEnd(false);
      onEnd();
    } else {
      // First tap — show confirmation
      setConfirmingEnd(true);
      confirmTimer.current = setTimeout(() => {
        setConfirmingEnd(false);
      }, 3000);
    }
  }, [confirmingEnd, onEnd]);

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
          <Button variant="ghost" size="lg" onClick={handleEndTap}>
            {confirmingEnd ? "END?" : "END"}
          </Button>
        </div>
      </div>
    </div>
  );
}
