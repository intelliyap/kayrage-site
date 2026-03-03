"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  accent?: "drift" | "pulse" | "depth" | "level";
}

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-white/10 text-foreground hover:bg-white/15 active:bg-white/20 border border-border",
  secondary:
    "bg-transparent text-secondary hover:text-foreground border border-border hover:border-white/10",
  ghost: "bg-transparent text-secondary hover:text-foreground hover:bg-white/5",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-4 text-base",
};

const accentStyles: Record<string, string> = {
  drift: "bg-drift/15 text-drift hover:bg-drift/25 border-drift/20",
  pulse: "bg-pulse/15 text-pulse hover:bg-pulse/25 border-pulse/20",
  depth: "bg-depth/15 text-depth hover:bg-depth/25 border-depth/20",
  level: "bg-level/15 text-level hover:bg-level/25 border-level/20",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", accent, className = "", ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center font-mono tracking-wide rounded-lg transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none cursor-pointer";

    const style = accent
      ? accentStyles[accent]
      : variantStyles[variant];

    return (
      <button
        ref={ref}
        className={`${base} ${style} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
