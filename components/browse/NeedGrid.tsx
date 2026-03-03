"use client";

import type { NeedCategory } from "@/lib/techniques/types";

interface NeedGridProps {
  activeNeed: NeedCategory | null;
  onSelect: (need: NeedCategory | null) => void;
}

const NEEDS: { id: NeedCategory; label: string; description: string }[] = [
  { id: "calm", label: "CALM", description: "Settle the mind" },
  { id: "sleep", label: "SLEEP", description: "Deep rest" },
  { id: "focus", label: "FOCUS", description: "Sharpen attention" },
  { id: "energy", label: "ENERGY", description: "Wake up" },
  { id: "awareness", label: "AWARENESS", description: "Expand perception" },
  { id: "recovery", label: "RECOVERY", description: "Restore balance" },
];

export function NeedGrid({ activeNeed, onSelect }: NeedGridProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {NEEDS.map((need) => (
        <button
          key={need.id}
          onClick={() => onSelect(activeNeed === need.id ? null : need.id)}
          className={`p-4 rounded-lg border transition-all duration-300 text-left cursor-pointer ${
            activeNeed === need.id
              ? "border-white/10 bg-white/[0.06]"
              : "border-border hover:border-white/[0.06] hover:bg-white/[0.02]"
          }`}
        >
          <span className="block font-mono text-xs tracking-[0.2em] text-foreground mb-1">
            {need.label}
          </span>
          <span className="block text-[10px] text-secondary">
            {need.description}
          </span>
        </button>
      ))}
    </div>
  );
}
