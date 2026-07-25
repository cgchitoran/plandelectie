import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Language } from '@/types';
import { romanForGrade } from '@/data/defaults';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatGrade(grade: string, lang: Language): string {
  const g = parseInt(grade, 10);
  if (Number.isNaN(g)) return grade;
  if (g === 0) return lang === 'en' ? 'Preparatory class' : 'Clasa pregătitoare';
  return lang === 'en' ? `Grade ${romanForGrade(g)}` : `Clasa a ${romanForGrade(g)}-a`;
}

export function formatDate(iso: string, lang: Language): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string, lang: Language): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-GB' : 'ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

/**
 * Salvează un blob pe disc.
 * În aplicația desktop Tauri: deschide dialogul nativ „Salvează ca...".
 * În browser: download clasic prin element <a>.
 */
export async function downloadBlob(blob: Blob, filename: string): Promise<void> {
  if ('__TAURI_INTERNALS__' in window) {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const { writeFile } = await import('@tauri-apps/plugin-fs');
    const path = await save({ defaultPath: filename });
    if (!path) return; // utilizatorul a anulat dialogul
    const data = new Uint8Array(await blob.arrayBuffer());
    await writeFile(path, data);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9\- ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80) || 'proiect-didactic';
}
