"use client";

import { useEffect, useState } from "react";

interface GuidanceTextProps {
  text: string | null;
  duration: number;
}

export function GuidanceText({ text, duration }: GuidanceTextProps) {
  const [visible, setVisible] = useState(false);
  const [displayText, setDisplayText] = useState<string | null>(null);

  useEffect(() => {
    if (text) {
      setDisplayText(text);
      // Small delay before fade in
      const showTimer = setTimeout(() => setVisible(true), 100);
      const hideTimer = setTimeout(
        () => setVisible(false),
        (duration - 0.5) * 1000
      );
      const clearTimer = setTimeout(
        () => setDisplayText(null),
        duration * 1000
      );

      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
        clearTimeout(clearTimer);
      };
    } else {
      setVisible(false);
    }
  }, [text, duration]);

  if (!displayText) return <div className="h-16" />;

  return (
    <div
      className={`guidance-text text-center text-lg max-w-md transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      {displayText}
    </div>
  );
}
