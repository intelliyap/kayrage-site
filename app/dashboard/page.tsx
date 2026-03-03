"use client";

import { useUserStore } from "@/lib/stores/user-store";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { StreakTracker } from "@/components/dashboard/StreakTracker";
import { SessionHistory } from "@/components/dashboard/SessionHistory";
import { techniques as techLib } from "@/lib/techniques/library";
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
  const { user, isHydrated } = useUserStore();

  if (!isHydrated || !user) {
    return (
      <main className="min-h-dvh flex items-center justify-center">
        <span className="font-mono text-xs text-secondary tracking-widest animate-pulse">
          LOADING...
        </span>
      </main>
    );
  }

  const levelConfig = LEVEL_CONFIG[user.currentLevel] || LEVEL_CONFIG.sync;

  // Use per-level session count for progress (not global totalSessions)
  const currentLevelStats = user.levelStats?.[user.currentLevel];
  const levelSessions = currentLevelStats?.sessionsCompleted ?? 0;

  const progress =
    levelConfig.sessionsToUnlock > 0
      ? Math.min(1, levelSessions / levelConfig.sessionsToUnlock)
      : 1;

  // Map session history to the format SessionHistory expects
  const sessions = (user.sessionHistory ?? []).map((s) => ({
    id: s.id,
    mode: s.mode,
    focusLevel: s.focusLevel,
    techniques: s.techniques,
    durationActual: s.durationActual,
    depthRating: s.depthRating,
    createdAt: s.completedAt,
  }));

  // Technique exposure: count unique methods explored
  const allTechniquesUsed = new Set(
    (user.sessionHistory ?? []).flatMap((s) => s.techniques),
  );
  const methodCounts: Record<string, { used: number; total: number }> = {};
  for (const t of techLib) {
    if (!methodCounts[t.method]) methodCounts[t.method] = { used: 0, total: 0 };
    methodCounts[t.method].total++;
    if (allTechniquesUsed.has(t.code)) methodCounts[t.method].used++;
  }

  // Depth trend: last 10 sessions
  const depthTrend = (user.sessionHistory ?? [])
    .slice(0, 10)
    .reverse()
    .map((s) => s.depthRating);

  return (
    <main className="min-h-dvh px-6 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-mono text-lg text-foreground tracking-wide">Dashboard</h1>
        <Link
          href="/"
          className="font-mono text-xs text-secondary hover:text-foreground tracking-widest transition-colors duration-300"
        >
          HOME
        </Link>
      </div>

      {/* Level progress */}
      <div className="flex flex-col items-center mb-8">
        <ProgressRing
          progress={progress}
          color={levelConfig.color}
          label={levelConfig.label}
          sublabel={
            levelConfig.next
              ? `${levelSessions}/${levelConfig.sessionsToUnlock} → ${levelConfig.next}`
              : "Maximum level"
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

      {/* Technique exposure */}
      {Object.keys(methodCounts).length > 0 && (
        <div className="mb-6">
          <span className="block font-mono text-xs text-secondary tracking-widest mb-3">
            TECHNIQUE EXPOSURE
          </span>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(methodCounts).map(([method, counts]) => (
              <div
                key={method}
                className="p-3 border border-border rounded-lg"
              >
                <span className="block font-mono text-[10px] text-muted tracking-widest mb-1">
                  {method.toUpperCase()}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white/20 transition-all duration-500"
                      style={{ width: `${(counts.used / counts.total) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-secondary">
                    {counts.used}/{counts.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Depth trend */}
      {depthTrend.length > 1 && (
        <div className="mb-6">
          <span className="block font-mono text-xs text-secondary tracking-widest mb-3">
            DEPTH TREND
          </span>
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-end gap-1 h-16">
              {depthTrend.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 bg-white/10 rounded-t transition-all duration-300"
                  style={{ height: `${(d / 10) * 100}%` }}
                  title={`${d}/10`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="font-mono text-[9px] text-muted">OLDEST</span>
              <span className="font-mono text-[9px] text-muted">LATEST</span>
            </div>
          </div>
        </div>
      )}

      {/* Session history */}
      <SessionHistory sessions={sessions} />
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
