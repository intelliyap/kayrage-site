"use client";

interface KayrageLogoProps {
  size?: number;
  className?: string;
}

/**
 * KAYRAGE claw-mark logo — four diagonal slash marks.
 * Based on the reference brand asset.
 */
export function KayrageLogo({ size = 48, className }: KayrageLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="KAYRAGE"
    >
      {/* Four diagonal claw slashes — left to right */}
      <path
        d="M22 15 C23 14, 25 16, 24 18 L14 72 C13 76, 15 78, 16 75 L26 22 C27 18, 25 14, 22 15Z"
        fill="#DC2626"
      />
      <path
        d="M38 10 C39 9, 42 11, 41 14 L28 78 C27 82, 29 84, 30 80 L43 18 C44 13, 41 9, 38 10Z"
        fill="#DC2626"
      />
      <path
        d="M54 12 C55 11, 58 13, 57 16 L46 76 C45 80, 47 82, 48 78 L59 20 C60 15, 57 11, 54 12Z"
        fill="#DC2626"
      />
      <path
        d="M70 8 C71 7, 74 9, 73 12 L60 82 C59 87, 61 89, 62 85 L75 16 C76 11, 73 7, 70 8Z"
        fill="#DC2626"
      />
      {/* Claw tips — small splatter accents at the ends */}
      <circle cx="15" cy="74" r="1.5" fill="#DC2626" />
      <circle cx="29" cy="80" r="1.5" fill="#DC2626" />
      <circle cx="47" cy="78" r="1.2" fill="#DC2626" />
      <circle cx="61" cy="84" r="1.8" fill="#DC2626" />
      <circle cx="24" cy="16" r="1" fill="#DC2626" />
      <circle cx="73" cy="10" r="1.2" fill="#DC2626" />
    </svg>
  );
}
