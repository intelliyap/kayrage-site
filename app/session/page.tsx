"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SessionPlayer } from "@/components/session/SessionPlayer";
import { useSessionStore } from "@/lib/stores/session-store";
import { useAudioStore } from "@/lib/stores/audio-store";
import { useUserStore } from "@/lib/stores/user-store";
import {
  detectTimeOfDay,
  suggestMode,
  suggestProfile,
  suggestDuration,
} from "@/lib/ai/state-assessor";
import { selectTechniques, getAvailableTechniques } from "@/lib/ai/technique-selector";
import { generateLocalScript } from "@/lib/ai/script-writer";
import { techniques } from "@/lib/techniques/library";
import { Button } from "@/components/ui/Button";
import type { Mood, EnergyLevel, StateAssessment } from "@/lib/ai/state-assessor";
import type { SessionPlan } from "@/lib/ai/session-generator";
import type { VoiceCue } from "@/lib/audio/voice-catalog";

function SessionContent() {
  const searchParams = useSearchParams();
  const { currentSession, startSession, endSession, setDepthRating } = useSessionStore();
  const { initAudio, startAudio, startLocalAudio, stopAudio, isInitialized, isPreloading } = useAudioStore();
  const { user } = useUserStore();
  const [plan, setPlan] = useState<SessionPlan | null>(null);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(5);
  const [isPreparing, setIsPreparing] = useState(false);

  const currentLevel = user?.currentLevel ?? "sync";

  // Generate session plan from URL params
  useEffect(() => {
    const mood = (searchParams.get("mood") as Mood) || "neutral";
    const energy = (searchParams.get("energy") as EnergyLevel) || "medium";
    const timeAvailable = parseInt(searchParams.get("time") || "15", 10);

    const assessment: StateAssessment = {
      mood,
      energy,
      timeOfDay: detectTimeOfDay(),
      timeAvailable,
    };

    const mode = suggestMode(assessment);
    const profile = suggestProfile(assessment);
    const duration = suggestDuration(assessment);

    const available = getAvailableTechniques(techniques, currentLevel, mode);
    const selection = selectTechniques(available, assessment, duration);

    // If a specific technique was requested via query param, prepend it
    const techniqueParam = searchParams.get("technique");
    if (techniqueParam) {
      const forced = techniques.find((t) => t.code === techniqueParam);
      if (forced && !selection.techniques.some((t) => t.code === forced.code)) {
        selection.techniques.unshift(forced);
      }
    }

    const guidanceDensity =
      currentLevel === "sync"
        ? { minGap: 20, maxGap: 30 }
        : currentLevel === "edge"
          ? { minGap: 60, maxGap: 120 }
          : { minGap: 120, maxGap: 300 };

    const script = generateLocalScript(selection.techniques, duration, guidanceDensity);

    const sessionPlan: SessionPlan = {
      mode,
      activeProfile: profile,
      focusLevel: currentLevel as SessionPlan["focusLevel"],
      duration,
      techniques: selection.techniques.map((t) => t.code),
      guidanceScript: script,
      audioConfig: {
        binauralFreq: mode === "still" ? 10 : profile === "drift" ? 7 : profile === "depth" ? 5 : 10,
        carrier: 150,
        bpm: profile === "drift" ? 112 : profile === "pulse" ? 122 : profile === "depth" ? 98 : null,
        key: null,
        reverbDecay: profile === "depth" ? 14 : profile === "drift" ? 10 : 3,
        noiseLevel: -26,
      },
      reasoning: selection.reasoning,
    };

    setPlan(sessionPlan);
  }, [searchParams, currentLevel]);

  const handleBegin = async () => {
    if (!plan) return;

    setIsPreparing(true);

    try {
      // 1. Init audio context (requires user gesture)
      if (!isInitialized) {
        await initAudio();
      }

      // 2. Try remote prepare-audio API (R2 path)
      let usedRemote = false;
      try {
        const response = await fetch("/api/session/prepare-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: plan.mode,
            profile: plan.activeProfile,
            focusLevel: plan.focusLevel,
            duration: plan.duration,
            techniques: plan.techniques,
            guidanceScript: plan.guidanceScript,
          }),
        });

        if (!response.ok) throw new Error("API returned " + response.status);

        const data = await response.json();
        const voiceCueUrls = new Map<string, string>(
          Object.entries(data.voiceCueUrls as Record<string, string>),
        );

        startSession(plan);
        await startAudio(
          { bedUrl: data.bedUrl, voiceCues: data.voiceCues as VoiceCue[], voiceCueUrls },
          data.voiceCues as VoiceCue[],
        );
        usedRemote = true;
      } catch {
        // Remote failed — fall back to local generation
        console.log("Remote audio unavailable, falling back to local generation");
      }

      // 3. Fallback: local binaural generator + text-only voice cues
      if (!usedRemote) {
        const localVoiceCues: VoiceCue[] = plan.guidanceScript.map((g) => ({
          time: g.time,
          text: g.text,
          displayDuration: g.duration,
          r2Path: "",
          audioDuration: 0,
        }));

        startSession(plan);
        startLocalAudio(
          {
            binauralFreq: plan.audioConfig.binauralFreq,
            carrier: plan.audioConfig.carrier,
            noiseLevel: plan.audioConfig.noiseLevel,
          },
          localVoiceCues,
        );
      }
    } catch (err) {
      console.error("Failed to begin session:", err);
    } finally {
      setIsPreparing(false);
    }
  };

  const handleEnd = () => {
    setShowRating(true);
  };

  const handleRatingSubmit = async () => {
    setDepthRating(rating);
    await stopAudio();
    endSession();
    setShowRating(false);
    window.location.href = "/";
  };

  // Show session player when playing
  if (currentSession && !showRating) {
    return <SessionPlayer />;
  }

  // Depth rating after session
  if (showRating) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-8">
          <h2 className="font-mono text-lg text-foreground">Session Complete</h2>
          <div>
            <label className="block font-mono text-xs text-secondary tracking-widest mb-4">
              DEPTH RATING
            </label>
            <div className="flex justify-center gap-1">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setRating(n)}
                  className={`w-8 h-8 rounded font-mono text-xs transition-all duration-300 cursor-pointer ${
                    n <= rating
                      ? "bg-white/10 text-foreground"
                      : "bg-white/[0.02] text-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <Button size="lg" className="w-full" onClick={handleRatingSubmit}>
            SAVE
          </Button>
        </div>
      </main>
    );
  }

  // Preparing state
  if (isPreparing || isPreloading) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <span className="font-mono text-xs text-secondary tracking-widest animate-pulse">
          PREPARING...
        </span>
      </main>
    );
  }

  // Session plan preview
  if (!plan) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <span className="font-mono text-xs text-secondary tracking-widest animate-pulse">
          GENERATING...
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full space-y-8">
        {/* Plan overview */}
        <div className="text-center">
          <h2 className="font-mono text-lg text-foreground mb-2">
            {plan.mode === "still" ? "Still Session" : `Active — ${plan.activeProfile}`}
          </h2>
          <p className="font-mono text-xs text-secondary tracking-widest">
            {Math.round(plan.duration / 60)} MINUTES
          </p>
        </div>

        {/* Techniques */}
        <div className="space-y-2">
          <span className="font-mono text-[10px] text-muted tracking-widest">
            TECHNIQUES
          </span>
          {plan.techniques.map((code, i) => (
            <div
              key={code}
              className="flex items-center gap-3 p-3 border border-border rounded-md"
            >
              <span className="font-mono text-[10px] text-muted">{i + 1}</span>
              <span className="font-mono text-xs text-foreground">{code}</span>
            </div>
          ))}
        </div>

        {/* Reasoning */}
        <p className="text-xs text-secondary leading-relaxed">{plan.reasoning}</p>

        {/* Begin */}
        <Button size="lg" className="w-full" onClick={handleBegin}>
          BEGIN
        </Button>
      </div>
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh flex items-center justify-center">
          <span className="font-mono text-xs text-secondary tracking-widest animate-pulse">
            LOADING...
          </span>
        </main>
      }
    >
      <SessionContent />
    </Suspense>
  );
}
