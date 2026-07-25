import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileDown, FileText, Loader2, TriangleAlert } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { LessonPlan, Language } from '@/types';
import { exportPlanDocx } from '@/lib/export-docx';
import { exportPlanPdf } from '@/lib/export-pdf';
import { hasAnyIssues, type MetadataField, type PlanIssues } from '@/lib/validation';
import { useSettingsStore } from '@/stores/settings';

interface ExportPanelProps {
  plan: LessonPlan;
  subjectName: string;
  areaName: string;
  previewElement: HTMLElement | null;
  includeTeacherNotes: boolean;
  includeMaterials: boolean;
  /** Elementele esențiale lipsă — afișate în dialogul de avertisment */
  issues: PlanIssues;
  /** Sare la etapa wizard (folosit de „Revino și completează”) */
  onGoToStep: (index: number) => void;
  onOptionsChange: (opts: { includeTeacherNotes: boolean; includeMaterials: boolean }) => void;
}

const METADATA_LABEL_KEYS: Record<MetadataField, string> = {
  title: 'editor.metadata.title',
  grade: 'editor.metadata.grade',
  area: 'editor.metadata.area',
  subject: 'editor.metadata.subject',
  date: 'editor.metadata.date',
  durationMinutes: 'editor.metadata.duration',
};

export function ExportPanel({
  plan,
  subjectName,
  areaName,
  previewElement,
  includeTeacherNotes,
  includeMaterials,
  issues,
  onGoToStep,
  onOptionsChange,
}: ExportPanelProps) {
  const { t, i18n } = useTranslation();
  const lang: Language = i18n.language === 'en' ? 'en' : 'ro';
  const defaultFormat = useSettingsStore((s) => s.settings.exportFormat);
  const [busy, setBusy] = useState<'docx' | 'pdf' | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** Formatul ales care așteaptă confirmarea din dialogul de avertisment */
  const [pending, setPending] = useState<'docx' | 'pdf' | null>(null);

  const runDocx = async () => {
    setBusy('docx');
    setError(null);
    try {
      await exportPlanDocx(plan, {
        includeTeacherNotes,
        includeMaterials,
        language: lang,
        subjectName,
        areaName,
      });
    } catch (e) {
      console.error(e);
      setError(t('editor.export.errorDocx'));
    } finally {
      setBusy(null);
    }
  };

  const runPdf = async () => {
    if (!previewElement) return;
    setBusy('pdf');
    setError(null);
    try {
      await exportPlanPdf(previewElement, plan);
    } catch (e) {
      console.error(e);
      setError(t('editor.export.errorPdf'));
    } finally {
      setBusy(null);
    }
  };

  /** La click: dacă lipsesc elemente esențiale, mai întâi avertismentul. */
  const requestExport = (fmt: 'docx' | 'pdf') => {
    if (hasAnyIssues(issues)) {
      setPending(fmt);
    } else if (fmt === 'docx') {
      void runDocx();
    } else {
      void runPdf();
    }
  };

  const confirmExport = () => {
    const fmt = pending;
    setPending(null);
    if (fmt === 'docx') void runDocx();
    else if (fmt === 'pdf') void runPdf();
  };

  /** Prima etapă cu elemente lipsă — ținta butonului „Revino și completează”. */
  const firstIncompleteStep = (): number => {
    if (issues.metadata.length > 0) return 0;
    if (issues.missingSpecificCompetence) return 1;
    if (issues.noPhases) return 2;
    return 3;
  };

  const sortedPhases = [...plan.phases].sort((a, b) => a.order - b.order);
  const phaseLabel = (phaseId: string): string => {
    const idx = sortedPhases.findIndex((p) => p.id === phaseId);
    const phase = sortedPhases[idx];
    const title = phase ? (lang === 'en' ? phase.titleEn : phase.titleRo) : '';
    return `${t('editor.validation.phaseLabel', { index: idx + 1 })} — ${title}`;
  };

  const formatOrder = defaultFormat === 'pdf' ? (['pdf', 'docx'] as const) : (['docx', 'pdf'] as const);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('editor.export.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={includeTeacherNotes}
              onCheckedChange={(v) => onOptionsChange({ includeTeacherNotes: v === true, includeMaterials })}
            />
            {t('editor.export.includeNotes')}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={includeMaterials}
              onCheckedChange={(v) => onOptionsChange({ includeTeacherNotes, includeMaterials: v === true })}
            />
            {t('editor.export.includeMaterials')}
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {formatOrder.map((fmt) =>
            fmt === 'docx' ? (
              <Button key="docx" onClick={() => requestExport('docx')} disabled={busy !== null} className="gap-2">
                {busy === 'docx' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {busy === 'docx' ? t('editor.export.generating') : t('editor.export.docx')}
              </Button>
            ) : (
              <Button key="pdf" variant="accent" onClick={() => requestExport('pdf')} disabled={busy !== null || !previewElement} className="gap-2">
                {busy === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                {busy === 'pdf' ? t('editor.export.generating') : t('editor.export.pdf')}
              </Button>
            ),
          )}
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      </CardContent>

      <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <TriangleAlert className="h-5 w-5 text-amber-500" />
              {t('editor.validation.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>{t('editor.validation.description')}</AlertDialogDescription>
          </AlertDialogHeader>

          <ul className="max-h-60 space-y-3 overflow-y-auto rounded-md border bg-muted/40 p-3 text-sm">
            {issues.metadata.length > 0 && (
              <li>
                <p className="font-semibold">{t('editor.steps.metadata')}</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
                  {issues.metadata.map((field) => (
                    <li key={field}>{t(METADATA_LABEL_KEYS[field])}</li>
                  ))}
                </ul>
              </li>
            )}
            {issues.missingSpecificCompetence && (
              <li>
                <p className="font-semibold">{t('editor.steps.competences')}</p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  <li>{t('editor.validation.noSpecificCompetence')}</li>
                </ul>
              </li>
            )}
            {issues.noPhases && (
              <li>
                <p className="font-semibold">{t('editor.steps.phases')}</p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  <li>{t('editor.validation.noPhases')}</li>
                </ul>
              </li>
            )}
            {issues.phases.length > 0 && (
              <li>
                <p className="font-semibold">{t('editor.steps.details')}</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-muted-foreground">
                  {issues.phases.map((p) => (
                    <li key={p.phaseId}>
                      {phaseLabel(p.phaseId)}: {p.missing.map((k) => t(`editor.phaseCard.${k}`)).join(', ')}
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onGoToStep(firstIncompleteStep())}>
              {t('editor.validation.review')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmExport}>{t('editor.validation.exportAnyway')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
