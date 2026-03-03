"use client";

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  sync: { label: "SYNC", color: "text-pulse" },
  edge: { label: "THE EDGE", color: "text-drift" },
  expand: { label: "EXPAND", color: "text-depth" },
  void: { label: "VOID", color: "text-level" },
  bridge: { label: "BRIDGE", color: "text-foreground" },
};

interface FocusLevelIndicatorProps {
  level: string;
}

export function FocusLevelIndicator({ level }: FocusLevelIndicatorProps) {
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.sync;

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
        style={{ animationDuration: "3s" }}
      />
      <span
        className={`font-mono text-xs tracking-[0.3em] uppercase ${config.color}`}
      >
        {config.label}
      </span>
    </div>
  );
}
