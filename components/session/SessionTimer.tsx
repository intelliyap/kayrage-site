"use client";

interface SessionTimerProps {
  elapsed: number;
  total: number;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function SessionTimer({ elapsed, total }: SessionTimerProps) {
  const remaining = Math.max(0, total - elapsed);

  return (
    <div className="font-mono text-sm text-secondary tracking-widest">
      <span className="text-foreground">{formatTime(elapsed)}</span>
      <span className="text-muted mx-2">/</span>
      <span>{formatTime(remaining)}</span>
    </div>
  );
}
