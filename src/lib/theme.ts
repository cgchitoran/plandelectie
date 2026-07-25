import type { ThemeColors } from '@/types';

type Hsl = [number, number, number];

export function hexToHsl(hex: string): Hsl {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return [0, 0, 0];
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(l * 100)];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [Math.round(h * 60), Math.round(s * 100), Math.round(l * 100)];
}

const hsl = ([h, s, l]: Hsl): string => `${h} ${s}% ${l}%`;
const clampL = (l: number): number => Math.max(0, Math.min(100, Math.round(l)));

/** Toate variabilele pe care le poate suprascrie tema personalizată */
const MANAGED_VARS = [
  '--background', '--foreground', '--card', '--card-foreground', '--popover', '--popover-foreground',
  '--primary', '--primary-foreground', '--secondary', '--secondary-foreground',
  '--muted', '--muted-foreground', '--accent', '--accent-foreground',
  '--border', '--input', '--ring',
] as const;

/**
 * Aplică cele 6 culori majore pe :root (override peste paleta din index.css).
 * Restul tokenilor (ring, popover, muted, border, input) se derivează automat.
 * `null` → elimină toate override-urile (revine la paleta implicită / high-contrast).
 */
export function applyThemeColors(colors: ThemeColors | null): void {
  const root = document.documentElement;
  if (!colors) {
    for (const v of MANAGED_VARS) root.style.removeProperty(v);
    return;
  }

  const bg = hexToHsl(colors.background);
  const card = hexToHsl(colors.card);
  const fg = hexToHsl(colors.foreground);
  const primary = hexToHsl(colors.primary);
  const secondary = hexToHsl(colors.secondary);
  const accent = hexToHsl(colors.accent);

  const dir = card[2] > 50 ? -1 : 1; // derivații spre întunecat pe teme luminoase, spre lumină pe teme întunecate
  const fgOn = (c: Hsl): string => (c[2] > 62 ? '0 0% 5%' : '0 0% 98%');

  const set = (k: string, v: string) => root.style.setProperty(k, v);
  set('--background', hsl(bg));
  set('--foreground', hsl(fg));
  set('--card', hsl(card));
  set('--card-foreground', hsl(fg));
  set('--popover', hsl(card));
  set('--popover-foreground', hsl(fg));
  set('--primary', hsl(primary));
  set('--primary-foreground', fgOn(primary));
  set('--secondary', hsl(secondary));
  set('--secondary-foreground', fgOn(secondary));
  set('--accent', hsl(accent));
  set('--accent-foreground', fgOn(accent));
  set('--muted', hsl([card[0], Math.min(card[1], 20), clampL(card[2] + 5 * dir)]));
  set('--muted-foreground', `${fg[0]} ${Math.min(fg[1], 25)}% ${clampL(fg[2] > 50 ? fg[2] - 33 : fg[2] + 35)}%`);
  set('--border', hsl([card[0], card[1], clampL(card[2] + 10 * dir)]));
  set('--input', hsl([card[0], card[1], clampL(card[2] + 16 * dir)]));
  set('--ring', hsl(primary));
}
