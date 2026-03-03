"use client";

import { useRouter } from "next/navigation";
import type { Technique } from "@/lib/techniques/types";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface TechniqueDetailProps {
  technique: Technique;
}

const difficultyColor: Record<string, string> = {
  Entry: "text-depth",
  Intermediate: "text-drift",
  Advanced: "text-warning",
};

const levelNames: Record<string, string> = {
  sync: "Sync",
  edge: "The Edge",
  expand: "Expand",
  void: "Void",
  bridge: "Bridge",
};

export function TechniqueDetail({ technique }: TechniqueDetailProps) {
  const router = useRouter();

  const handleStart = () => {
    router.push(
      `/session?mood=neutral&energy=medium&time=${technique.minDuration}&technique=${technique.code}`,
    );
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      {/* Back */}
      <Link
        href="/browse"
        className="font-mono text-xs text-secondary hover:text-foreground tracking-widest transition-colors duration-300"
      >
        BACK
      </Link>

      {/* Header */}
      <div className="mt-8 mb-6">
        <span className="font-mono text-xs text-muted tracking-widest block mb-2">
          {technique.code}
        </span>
        <h1 className="font-mono text-xl text-foreground mb-2">
          {technique.name}
        </h1>
        <p className="text-sm text-secondary leading-relaxed">
          {technique.description}
        </p>
      </div>

      {/* Meta */}
      <div className="space-y-3 mb-8 py-6 border-y border-border">
        <MetaRow label="METHOD" value={technique.method} />
        <MetaRow label="MODE" value={technique.mode} />
        <MetaRow
          label="DIFFICULTY"
          value={technique.difficulty}
          valueClass={difficultyColor[technique.difficulty]}
        />
        <MetaRow
          label="LEVELS"
          value={technique.focusLevels.map((l) => levelNames[l] || l).join(", ")}
        />
        <MetaRow label="MIN DURATION" value={`${technique.minDuration} min`} />
        <MetaRow label="SOURCE" value={technique.source} />
      </div>

      {/* Cue preview */}
      <div className="mb-8">
        <span className="font-mono text-xs text-muted tracking-widest block mb-3">
          GUIDANCE CUE
        </span>
        <p className="guidance-text text-foreground text-lg">
          &ldquo;{technique.cue}&rdquo;
        </p>
      </div>

      {/* Action */}
      <Button size="lg" className="w-full" onClick={handleStart}>
        START SESSION WITH {technique.code}
      </Button>
    </div>
  );
}

function MetaRow({
  label,
  value,
  valueClass = "text-foreground",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="font-mono text-[10px] text-secondary tracking-widest">
        {label}
      </span>
      <span className={`font-mono text-xs tracking-wide ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}
