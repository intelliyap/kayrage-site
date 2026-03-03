"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StateCheckIn } from "@/components/onboarding/StateCheckIn";
import { useUserStore } from "@/lib/stores/user-store";
import type { Mood, EnergyLevel } from "@/lib/ai/state-assessor";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { user, isHydrated } = useUserStore();
  const [showCheckIn, setShowCheckIn] = useState(false);

  const handleCheckInComplete = (state: {
    mood: Mood;
    energy: EnergyLevel;
    timeAvailable: number;
  }) => {
    const params = new URLSearchParams({
      mood: state.mood,
      energy: state.energy,
      time: state.timeAvailable.toString(),
    });
    router.push(`/session?${params.toString()}`);
  };

  // Wait for localStorage rehydration before rendering
  if (!isHydrated || !user) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <span className="font-mono text-xs text-secondary tracking-widest animate-pulse">
          LOADING...
        </span>
      </main>
    );
  }

  // Show onboarding for first-time users
  if (!user.onboardingCompleted) {
    return (
      <main className="min-h-dvh flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-8">
          <div>
            <h1 className="font-mono text-2xl text-foreground tracking-wide mb-2">
              KAY-OS
            </h1>
            <p className="text-xs text-secondary tracking-[0.3em] uppercase">
              Internal Training
            </p>
          </div>

          <p className="text-sm text-secondary leading-relaxed">
            The US military studied consciousness technology for 20 years. We
            turned it into a training system.
          </p>

          <Button size="lg" className="w-full" onClick={() => router.push("/onboarding")}>
            BEGIN
          </Button>
        </div>
      </main>
    );
  }

  const levelNames: Record<string, string> = {
    sync: "Sync",
    edge: "The Edge",
    expand: "Expand",
    void: "Void",
    bridge: "Bridge",
  };

  return (
    <main className="min-h-dvh flex flex-col px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="font-mono text-lg text-foreground tracking-wide">KAY-OS</h1>
          <p className="font-mono text-[10px] text-secondary tracking-widest">
            {levelNames[user.currentLevel] || "SYNC"}
          </p>
        </div>
        <Link
          href="/dashboard"
          className="font-mono text-xs text-secondary hover:text-foreground tracking-widest transition-colors duration-300"
        >
          PROFILE
        </Link>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        {!showCheckIn ? (
          <div className="space-y-6 text-center">
            {/* Stats */}
            <div className="flex justify-center gap-8 mb-8">
              <Stat label="SESSIONS" value={user.totalSessions.toString()} />
              <Stat label="MINUTES" value={user.totalMinutes.toString()} />
              <Stat label="STREAK" value={user.currentStreak.toString()} />
            </div>

            {/* Primary CTA */}
            <Button
              size="lg"
              className="w-full"
              onClick={() => setShowCheckIn(true)}
            >
              START SESSION
            </Button>

            {/* Browse */}
            <Link
              href="/browse"
              className="block font-mono text-xs text-secondary hover:text-foreground tracking-widest transition-colors duration-300 mt-4"
            >
              BROWSE TECHNIQUES
            </Link>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setShowCheckIn(false)}
              className="font-mono text-xs text-secondary hover:text-foreground tracking-widest mb-6 transition-colors duration-300 cursor-pointer"
            >
              BACK
            </button>
            <StateCheckIn onComplete={handleCheckInComplete} />
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <span className="block font-mono text-xl text-foreground">{value}</span>
      <span className="block font-mono text-[10px] text-muted tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}
