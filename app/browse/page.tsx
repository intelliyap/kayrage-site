"use client";

import { useState, useMemo } from "react";
import { techniques } from "@/lib/techniques/library";
import { getTechniquesByNeed } from "@/lib/techniques/categories";
import { getMethodTechniques, getAllMethods, getMethodCount } from "@/lib/techniques/methods";
import { NeedGrid } from "@/components/browse/NeedGrid";
import { MethodTabs } from "@/components/browse/MethodTabs";
import { TechniqueCard } from "@/components/browse/TechniqueCard";
import type { Method, NeedCategory } from "@/lib/techniques/types";
import Image from "next/image";
import Link from "next/link";

export default function BrowsePage() {
  const [activeNeed, setActiveNeed] = useState<NeedCategory | null>(null);
  const [activeMethod, setActiveMethod] = useState<Method | "All">("All");

  const methods = getAllMethods();
  const counts = getMethodCount();

  const filtered = useMemo(() => {
    let result = techniques;

    if (activeNeed) {
      result = getTechniquesByNeed(activeNeed);
    }

    if (activeMethod !== "All") {
      const methodTechniques = getMethodTechniques(activeMethod);
      const methodCodes = new Set(methodTechniques.map((t) => t.code));
      result = result.filter((t) => methodCodes.has(t.code));
    }

    return result;
  }, [activeNeed, activeMethod]);

  return (
    <main className="min-h-dvh px-6 py-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-mono text-lg text-foreground tracking-wide">
          Techniques
        </h1>
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity duration-300"
        >
          <Image src="/logos/claw.png" alt="Home" width={24} height={24} />
        </Link>
      </div>

      {/* Need categories */}
      <div className="mb-6">
        <span className="block font-mono text-[10px] text-muted tracking-widest mb-3">
          WHAT DO YOU NEED?
        </span>
        <NeedGrid activeNeed={activeNeed} onSelect={setActiveNeed} />
      </div>

      {/* Method filter */}
      <div className="mb-6">
        <span className="block font-mono text-[10px] text-muted tracking-widest mb-3">
          METHOD
        </span>
        <MethodTabs
          methods={methods}
          active={activeMethod}
          onSelect={setActiveMethod}
          counts={counts}
        />
      </div>

      {/* Results count */}
      <div className="mb-4">
        <span className="font-mono text-[10px] text-muted tracking-widest">
          {filtered.length} TECHNIQUES
        </span>
      </div>

      {/* Technique grid */}
      <div className="grid gap-2">
        {filtered.map((technique) => (
          <TechniqueCard key={technique.code} technique={technique} />
        ))}
      </div>
    </main>
  );
}
