"use client";

interface StreakTrackerProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakTracker({ currentStreak, longestStreak }: StreakTrackerProps) {
  // Show last 7 days as dots
  const days = Array.from({ length: 7 }, (_, i) => i < currentStreak);

  return (
    <div className="p-5 border border-border rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <span className="font-mono text-xs text-secondary tracking-widest">
          STREAK
        </span>
        <span className="font-mono text-xs text-muted tracking-widest">
          BEST: {longestStreak}
        </span>
      </div>

      {/* Current streak number */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="font-mono text-3xl text-foreground">{currentStreak}</span>
        <span className="font-mono text-xs text-secondary tracking-widest">DAYS</span>
      </div>

      {/* Day dots */}
      <div className="flex gap-2">
        {days.reverse().map((active, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
              active ? "bg-depth" : "bg-white/5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
