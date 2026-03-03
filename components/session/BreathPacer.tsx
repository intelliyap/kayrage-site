"use client";

import { useEffect, useState } from "react";

type Phase = "inhale" | "hold" | "exhale" | "rest";

const CYCLE = [
  { phase: "inhale" as Phase, duration: 4000, label: "breathe in" },
  { phase: "hold" as Phase, duration: 4000, label: "hold" },
  { phase: "exhale" as Phase, duration: 4000, label: "breathe out" },
  { phase: "rest" as Phase, duration: 4000, label: "hold" },
];

export function BreathPacer() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    const current = CYCLE[phaseIndex];
    const timer = setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % CYCLE.length);
    }, current.duration);

    return () => clearTimeout(timer);
  }, [phaseIndex]);

  const current = CYCLE[phaseIndex];
  const isExpanded = current.phase === "inhale" || current.phase === "hold";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Breath ring */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer ring */}
        <div
          className="absolute inset-0 rounded-full border border-white/10 transition-transform ease-in-out"
          style={{
            transform: isExpanded ? "scale(1)" : "scale(0.6)",
            transitionDuration: `${current.duration}ms`,
            opacity: isExpanded ? 0.6 : 0.2,
          }}
        />
        {/* Inner glow */}
        <div
          className="absolute inset-4 rounded-full bg-white/5 transition-all ease-in-out"
          style={{
            transform: isExpanded ? "scale(1)" : "scale(0.5)",
            transitionDuration: `${current.duration}ms`,
            opacity: isExpanded ? 0.15 : 0.05,
          }}
        />
        {/* Center dot */}
        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
      </div>

      {/* Phase label */}
      <span className="font-mono text-xs text-secondary tracking-[0.3em] uppercase">
        {current.label}
      </span>
    </div>
  );
}
