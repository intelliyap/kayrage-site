"use client";

interface KayrageLogoProps {
  size?: number;
  className?: string;
}

/**
 * KAYRAGE claw-mark logo — four diagonal slash marks fanning outward.
 * Traced from the reference brand asset: thick, ragged, tapered slashes.
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
      {/* Slash 1 — leftmost, leans left */}
      <path
        d="M28 8 C30 7, 31 9, 30.5 11
           L18 52 C17 55, 16.5 58, 15 62
           L13 68 C12 71, 11 74, 10.5 76
           C10 78, 11 79, 12 77
           L14 72 L16 64 L19 55
           L31 14 C32 10, 30 7, 28 8Z"
        fill="#C22528"
      />
      {/* Slash 2 — second from left */}
      <path
        d="M40 6 C42 5, 44 7, 43 10
           L33 42 C32 45, 30.5 50, 29 55
           L26 66 C25 70, 24 74, 23 78
           L22 82 C21 85, 22 86, 23.5 83
           L25 77 L28 68 L31 58
           L35 46 L45 13
           C46 9, 43 5, 40 6Z"
        fill="#C22528"
      />
      {/* Slash 3 — second from right, slightly steeper */}
      <path
        d="M54 5 C56 4, 58 6, 57.5 9
           L50 34 C49 38, 47.5 43, 46 48
           L42 62 C41 66, 39.5 71, 38 76
           L36 83 C35 87, 36 88, 37.5 85
           L40 78 L43 68 L46 58
           L49 46 L52 36
           L59 12 C60 8, 57 4, 54 5Z"
        fill="#C22528"
      />
      {/* Slash 4 — rightmost, steepest, sharp tapered point */}
      <path
        d="M68 3 C70 2, 73 4, 72 8
           L66 28 C65 32, 63.5 37, 62 42
           L58 58 C57 62, 55 68, 53 74
           L50 86 C49 90, 48 93, 47.5 95
           C47 97, 48 97, 49 95
           L51 88 L54 78 L57 68
           L61 55 L64 44 L67 33
           L74 11 C75 7, 72 2, 68 3Z"
        fill="#C22528"
      />
      {/* Splatter accents at tips */}
      <circle cx="11" cy="78" r="1.2" fill="#C22528" />
      <circle cx="21" cy="84" r="1.4" fill="#C22528" />
      <circle cx="35" cy="86" r="1.0" fill="#C22528" />
      <circle cx="48" cy="96" r="1.5" fill="#C22528" />
      <circle cx="30" cy="9" r="0.8" fill="#C22528" />
      <circle cx="72" cy="5" r="1.0" fill="#C22528" />
    </svg>
  );
}
