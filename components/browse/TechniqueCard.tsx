"use client";

import type { Technique } from "@/lib/techniques/types";
import Link from "next/link";

interface TechniqueCardProps {
  technique: Technique;
}

const difficultyColor: Record<string, string> = {
  Entry: "text-depth",
  Intermediate: "text-drift",
  Advanced: "text-warning",
};

const modeLabel: Record<string, string> = {
  Still: "STILL",
  Active: "ACTIVE",
  Both: "BOTH",
};

export function TechniqueCard({ technique }: TechniqueCardProps) {
  return (
    <Link
      href={`/browse/${technique.code}`}
      className="block p-5 border border-border rounded-lg hover:bg-white/[0.02] transition-colors duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-xs text-muted tracking-widest">
          {technique.code}
        </span>
        <span className="font-mono text-[10px] text-secondary tracking-widest">
          {modeLabel[technique.mode]}
        </span>
      </div>

      <h3 className="font-mono text-sm text-foreground mb-2 group-hover:text-white transition-colors duration-300">
        {technique.name}
      </h3>

      <p className="text-xs text-secondary leading-relaxed mb-3 line-clamp-2">
        {technique.description}
      </p>

      <div className="flex items-center gap-3">
        <span
          className={`font-mono text-[10px] tracking-widest ${difficultyColor[technique.difficulty]}`}
        >
          {technique.difficulty.toUpperCase()}
        </span>
        <span className="text-muted">|</span>
        <span className="font-mono text-[10px] text-secondary tracking-widest">
          {technique.method.toUpperCase()}
        </span>
        <span className="text-muted">|</span>
        <span className="font-mono text-[10px] text-secondary tracking-widest">
          {technique.minDuration}m
        </span>
      </div>
    </Link>
  );
}
