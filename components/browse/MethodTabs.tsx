"use client";

import type { Method } from "@/lib/techniques/types";

interface MethodTabsProps {
  methods: Method[];
  active: Method | "All";
  onSelect: (method: Method | "All") => void;
  counts: Record<Method, number>;
}

export function MethodTabs({ methods, active, onSelect, counts }: MethodTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
      <button
        onClick={() => onSelect("All")}
        className={`shrink-0 px-4 py-2 font-mono text-xs tracking-widest rounded-md transition-colors duration-300 cursor-pointer ${
          active === "All"
            ? "bg-white/10 text-foreground"
            : "text-secondary hover:text-foreground hover:bg-white/5"
        }`}
      >
        ALL
      </button>
      {methods.map((method) => (
        <button
          key={method}
          onClick={() => onSelect(method)}
          className={`shrink-0 px-4 py-2 font-mono text-xs tracking-widest rounded-md transition-colors duration-300 cursor-pointer ${
            active === method
              ? "bg-white/10 text-foreground"
              : "text-secondary hover:text-foreground hover:bg-white/5"
          }`}
        >
          {method.toUpperCase()}
          <span className="ml-1.5 text-muted">{counts[method]}</span>
        </button>
      ))}
    </div>
  );
}
