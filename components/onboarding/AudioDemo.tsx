"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/Button";
import type { DemoControls } from "@/lib/audio/onboarding-demo";

interface AudioDemoProps {
  onComplete: () => void;
}

export function AudioDemo({ onComplete }: AudioDemoProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [demoComplete, setDemoComplete] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const controlsRef = useRef<DemoControls | null>(null);

  const DEMO_DURATION = 30; // 30 second demo

  const startDemo = useCallback(async () => {
    // Dynamically import the onboarding demo module (which imports Tone.js)
    const { startBinauralDemo } = await import("@/lib/audio/onboarding-demo");
    const controls = await startBinauralDemo();
    controlsRef.current = controls;

    setIsPlaying(true);

    // Timer
    const interval = setInterval(() => {
      setElapsed((prev) => {
        if (prev >= DEMO_DURATION - 1) {
          clearInterval(interval);
          controls.stop();
          controls.dispose();
          controlsRef.current = null;
          setIsPlaying(false);
          setDemoComplete(true);
          return DEMO_DURATION;
        }
        return prev + 1;
      });
    }, 1000);
  }, []);

  return (
    <div className="text-center space-y-6">
      <h2 className="font-mono text-lg text-foreground">First Experience</h2>
      <p className="text-sm text-secondary leading-relaxed max-w-sm mx-auto">
        Put on headphones. You&apos;ll hear a steady tone. The slight difference
        between your left and right ear creates a binaural beat — your brain
        syncs to it naturally.
      </p>

      {!isPlaying && !demoComplete && (
        <div className="space-y-4">
          <p className="font-mono text-xs text-warning tracking-widest">
            HEADPHONES REQUIRED
          </p>
          <Button size="lg" onClick={startDemo}>
            BEGIN DEMO
          </Button>
        </div>
      )}

      {isPlaying && (
        <div className="space-y-4">
          {/* Pulsing ring */}
          <div className="mx-auto w-24 h-24 rounded-full border border-pulse/30 flex items-center justify-center animate-pulse"
            style={{ animationDuration: "3s" }}
          >
            <div className="w-2 h-2 rounded-full bg-pulse" />
          </div>
          <p className="guidance-text text-foreground">Close your eyes. Listen.</p>
          <p className="font-mono text-xs text-muted tracking-widest">
            {DEMO_DURATION - elapsed}s
          </p>
        </div>
      )}

      {demoComplete && (
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            That&apos;s the foundation. Everything builds on this.
          </p>
          <Button size="lg" onClick={onComplete}>
            CONTINUE
          </Button>
        </div>
      )}
    </div>
  );
}
