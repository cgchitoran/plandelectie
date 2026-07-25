/**
 * Generează toate iconițele aplicației din `branding/logo.svg` (sursa de adevăr).
 *
 * Rulare: `npm run icons`
 *   1. SVG → PNG 1024 (sharp, devDependency)
 *   2. `tauri icon` → src-tauri/icons/ (Linux/Windows/macOS/Android/iOS)
 *   3. PNG-uri PWA (192, 512) → public/icons/
 *
 * Pentru logo nou: înlocuiește branding/logo.svg și rulează din nou `npm run icons`.
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import sharp from 'sharp';

const SRC = 'branding/logo.svg';
const PNG_1024 = 'branding/logo-1024.png';

console.log('→ SVG → PNG 1024…');
await sharp(SRC).resize(1024, 1024).png().toFile(PNG_1024);

console.log('→ tauri icon (src-tauri/icons/)…');
execFileSync('npx', ['--yes', 'tauri', 'icon', PNG_1024], { stdio: 'inherit' });

console.log('→ iconițe PWA (public/icons/)…');
mkdirSync('public/icons', { recursive: true });
for (const size of [192, 512]) {
  await sharp(SRC).resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
}

console.log('✓ Gata: iconițele au fost generate din branding/logo.svg');
