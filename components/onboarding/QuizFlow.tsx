"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

interface QuizFlowProps {
  onComplete: (answers: Record<string, string>) => void;
}

interface QuizStep {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

const STEPS: QuizStep[] = [
  {
    id: "experience",
    question: "Have you meditated before?",
    options: [
      { value: "never", label: "Never" },
      { value: "tried", label: "Tried a few times" },
      { value: "occasional", label: "Occasionally" },
      { value: "regular", label: "Regular practice" },
    ],
  },
  {
    id: "goal",
    question: "What are you training for?",
    options: [
      { value: "calm", label: "Stillness under pressure" },
      { value: "focus", label: "Sharper focus" },
      { value: "sleep", label: "Better rest and recovery" },
      { value: "awareness", label: "Expanded awareness" },
    ],
  },
  {
    id: "preference",
    question: "Sound preference?",
    options: [
      { value: "silence", label: "Pure tones and silence" },
      { value: "ambient", label: "Ambient and atmospheric" },
      { value: "rhythmic", label: "Subtle rhythm and pulse" },
    ],
  },
];

export function QuizFlow({ onComplete }: QuizFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [step.id]: value };
    setAnswers(newAnswers);

    if (isLast) {
      onComplete(newAnswers);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div>
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-px flex-1 transition-colors duration-500 ${
              i <= currentStep ? "bg-white/20" : "bg-border"
            }`}
          />
        ))}
      </div>

      {/* Question */}
      <h2 className="font-mono text-lg text-foreground mb-8">{step.question}</h2>

      {/* Options */}
      <div className="space-y-2">
        {step.options.map((option) => (
          <Button
            key={option.value}
            variant="secondary"
            size="lg"
            className="w-full justify-start text-left"
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Step indicator */}
      <p className="mt-8 font-mono text-xs text-muted tracking-widest text-center">
        {currentStep + 1} / {STEPS.length}
      </p>
    </div>
  );
}
