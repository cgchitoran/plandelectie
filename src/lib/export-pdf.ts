import type { LessonPlan } from '@/types';
import { downloadBlob, sanitizeFilename } from './utils';

/**
 * Generează PDF din preview-ul DOM (100% client-side).
 * Elementul sursă trebuie să aibă lățime fixă (tip A4) pentru un layout predictibil.
 */
export async function exportPlanPdf(element: HTMLElement, plan: LessonPlan): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default;
  const blob: Blob = await html2pdf()
    .set({
      margin: [10, 10, 10, 10],
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'] },
    })
    .from(element)
    .outputPdf('blob');
  await downloadBlob(blob, `${sanitizeFilename(plan.metadata.title)}.pdf`);
}
