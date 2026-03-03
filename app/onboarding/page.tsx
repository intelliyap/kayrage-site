"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuizFlow } from "@/components/onboarding/QuizFlow";
import { AudioDemo } from "@/components/onboarding/AudioDemo";
import { useUserStore } from "@/lib/stores/user-store";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

type Step = "welcome" | "how" | "quiz" | "demo" | "ready";

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, updatePreferences } = useUserStore();
  const [step, setStep] = useState<Step>("welcome");

  const handleQuizComplete = (answers: Record<string, string>) => {
    // Map quiz answers to preferences
    const profileMap: Record<string, "drift" | "pulse" | "depth"> = {
      silence: "depth",
      ambient: "drift",
      rhythmic: "pulse",
    };
    updatePreferences({
      activeProfile: profileMap[answers.preference] || "drift",
    });
    setStep("demo");
  };

  const handleComplete = () => {
    completeOnboarding();
    router.push("/");
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6">
      <div className="max-w-sm w-full">
        {step === "welcome" && (
          <div className="text-center space-y-6">
            <Image
              src="/logos/wordmark.png"
              alt="KAYRAGE"
              width={240}
              height={120}
              className="mx-auto"
              priority
            />
            <p className="text-sm text-secondary leading-relaxed">
              The US military studied consciousness technology for 20 years. We
              turned it into a training system.
            </p>
            <p className="text-sm text-secondary leading-relaxed">
              Audio entrainment. Ancient techniques. AI guidance. Combined into a
              daily practice that actually works.
            </p>
            <Button size="lg" className="w-full" onClick={() => setStep("how")}>
              HOW IT WORKS
            </Button>
          </div>
        )}

        {step === "how" && (
          <div className="space-y-8">
            <div className="space-y-6">
              <HowStep
                number="01"
                title="Binaural Entrainment"
                description="Two slightly different frequencies in each ear. Your brain synchronizes to the difference — shifting your brainwave state."
              />
              <HowStep
                number="02"
                title="48 Techniques"
                description="From the oldest consciousness traditions on Earth. Breath work, body awareness, visualization, sound, perception, and inquiry."
              />
              <HowStep
                number="03"
                title="AI Personalization"
                description="Sessions adapt to your state, your level, and your history. No two sessions are the same."
              />
            </div>
            <Button size="lg" className="w-full" onClick={() => setStep("quiz")}>
              CONTINUE
            </Button>
          </div>
        )}

        {step === "quiz" && <QuizFlow onComplete={handleQuizComplete} />}

        {step === "demo" && <AudioDemo onComplete={() => setStep("ready")} />}

        {step === "ready" && (
          <div className="text-center space-y-6">
            <h2 className="font-mono text-xl text-foreground">Ready</h2>
            <p className="text-sm text-secondary leading-relaxed">
              Your training begins at Sync — Focus Level 3. Master the basics.
              Build consistency. The deeper levels unlock with practice.
            </p>
            <Button size="lg" className="w-full" onClick={handleComplete}>
              START TRAINING
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

function HowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <span className="font-mono text-xs text-muted tracking-widest shrink-0 pt-0.5">
        {number}
      </span>
      <div>
        <h3 className="font-mono text-sm text-foreground mb-1">{title}</h3>
        <p className="text-xs text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
