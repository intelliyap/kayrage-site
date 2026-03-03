"use client";

import { useUserStore } from "@/lib/stores/user-store";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { StreakTracker } from "@/components/dashboard/StreakTracker";
import { SessionHistory } from "@/components/dashboard/SessionHistory";
import Image from "next/image";
import Link from "next/link";

const LEVEL_CONFIG: Record<
  string,
  { label: string; next: string | null; sessionsToUnlock: number; color: string }
> = {
  sync: { label: "Sync", next: "The Edge", sessionsToUnlock: 5, color: "rgba(96, 165, 250, 0.4)" },
  edge: { label: "The Edge", next: "Expand", sessionsToUnlock: 15, color: "rgba(167, 139, 250, 0.4)" },
  expand: { label: "Expand", next: "Void", sessionsToUnlock: 30, color: "rgba(52, 211, 153, 0.4)" },
  void: { label: "Void", next: "Bridge", sessionsToUnlock: 50, color: "rgba(251, 191, 36, 0.4)" },
  bridge: { label: "Bridge", next: null, sessionsToUnlock: 0, color: "rgba(255, 255, 255, 0.3)" },
};

export default function DashboardPage() {
  const { user } = useUserStore();

  if (!user) return null;

  const levelConfig = LEVEL_CONFIG[user.currentLevel] || LEVEL_CONFIG.sync;

  const progress =
    levelConfig.sessionsToUnlock > 0
      ? Math.min(1, user.totalSessions / levelConfig.sessionsToUnlock)
      : 1;

  return (
    <main className="min-h-dvh px-6 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-mono text-lg text-foreground tracking-wide">Dashboard</h1>
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity duration-300"
        >
          <Image src="/logos/claw.png" alt="Home" width={24} height={24} />
        </Link>
      </div>

      {/* Level progress */}
      <div className="flex flex-col items-center mb-8">
        <ProgressRing
          progress={progress}
          color={levelConfig.color}
          label={levelConfig.label}
          sublabel={
            levelConfig.next ? `Next: ${levelConfig.next}` : "Maximum level"
          }
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <StatCard label="SESSIONS" value={user.totalSessions.toString()} />
        <StatCard label="MINUTES" value={user.totalMinutes.toString()} />
        <StatCard
          label="LEVEL"
          value={levelConfig.label}
        />
      </div>

      {/* Streak */}
      <div className="mb-6">
        <StreakTracker
          currentStreak={user.currentStreak}
          longestStreak={user.longestStreak}
        />
      </div>

      {/* Session history (placeholder - would come from Supabase) */}
      <SessionHistory sessions={[]} />
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 border border-border rounded-lg text-center">
      <span className="block font-mono text-lg text-foreground">{value}</span>
      <span className="block font-mono text-[10px] text-muted tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}
