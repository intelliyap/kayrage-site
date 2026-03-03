"use client";

import { useState } from "react";
import type { Mood, EnergyLevel } from "@/lib/ai/state-assessor";
import { Button } from "@/components/ui/Button";

interface StateCheckInProps {
  onComplete: (state: { mood: Mood; energy: EnergyLevel; timeAvailable: number }) => void;
}

const MOODS: { id: Mood; label: string }[] = [
  { id: "calm", label: "Calm" },
  { id: "anxious", label: "Restless" },
  { id: "tired", label: "Tired" },
  { id: "energized", label: "Energized" },
  { id: "scattered", label: "Scattered" },
  { id: "neutral", label: "Neutral" },
];

const ENERGY: { id: EnergyLevel; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

const TIMES = [5, 10, 15, 20, 30];

export function StateCheckIn({ onComplete }: StateCheckInProps) {
  const [mood, setMood] = useState<Mood | null>(null);
  const [energy, setEnergy] = useState<EnergyLevel | null>(null);
  const [timeAvailable, setTimeAvailable] = useState<number | null>(null);

  const canSubmit = mood && energy && timeAvailable;

  return (
    <div className="space-y-8">
      {/* Mood */}
      <div>
        <label className="block font-mono text-xs text-secondary tracking-widest mb-3">
          HOW DO YOU FEEL?
        </label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={`px-4 py-2 rounded-md font-mono text-xs tracking-wide transition-all duration-300 border cursor-pointer ${
                mood === m.id
                  ? "border-white/15 bg-white/10 text-foreground"
                  : "border-border text-secondary hover:border-white/10 hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Energy */}
      <div>
        <label className="block font-mono text-xs text-secondary tracking-widest mb-3">
          ENERGY LEVEL
        </label>
        <div className="flex gap-2">
          {ENERGY.map((e) => (
            <button
              key={e.id}
              onClick={() => setEnergy(e.id)}
              className={`flex-1 px-4 py-3 rounded-md font-mono text-xs tracking-wide transition-all duration-300 border cursor-pointer ${
                energy === e.id
                  ? "border-white/15 bg-white/10 text-foreground"
                  : "border-border text-secondary hover:border-white/10 hover:text-foreground"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time */}
      <div>
        <label className="block font-mono text-xs text-secondary tracking-widest mb-3">
          TIME AVAILABLE
        </label>
        <div className="flex gap-2">
          {TIMES.map((t) => (
            <button
              key={t}
              onClick={() => setTimeAvailable(t)}
              className={`flex-1 px-3 py-3 rounded-md font-mono text-xs tracking-wide transition-all duration-300 border cursor-pointer ${
                timeAvailable === t
                  ? "border-white/15 bg-white/10 text-foreground"
                  : "border-border text-secondary hover:border-white/10 hover:text-foreground"
              }`}
            >
              {t}m
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <Button
        size="lg"
        className="w-full"
        disabled={!canSubmit}
        onClick={() => {
          if (mood && energy && timeAvailable) {
            onComplete({ mood, energy, timeAvailable });
          }
        }}
      >
        GENERATE SESSION
      </Button>
    </div>
  );
}
