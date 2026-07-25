interface LogoProps {
  className?: string;
}

/**
 * Logo-ul aplicației — SVG inline, sincronizat cu `branding/logo.svg` (sursa de adevăr).
 * La schimbarea logo-ului: înlocuiește branding/logo.svg, actualizează și acest component,
 * apoi rulează `npm run icons`.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-hidden focusable="false">
      <defs>
        <linearGradient id="pldl-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill="url(#pldl-gradient)" />
      <path
        d="M32 21 C27.5 18 21 17 15.5 19 V45 C21 43 27.5 44 32 47 C36.5 44 43 43 48.5 45 V19 C43 17 36.5 18 32 21 Z"
        fill="#ffffff"
      />
      <path d="M32 21 V47" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M21 33 l7.5 7.5 L43 26"
        fill="none"
        stroke="#111827"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
