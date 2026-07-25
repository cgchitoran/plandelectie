import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { LessonPlan, Language } from '@/types';
import { formatDate, formatGrade } from '@/lib/utils';
import { colorForPhaseKey } from './PhaseCard';

const DOT: Record<string, string> = {
  teal: '#14b8a6',
  coral: '#f2574a',
  violet: '#8b5cf6',
  yellow: '#eac423',
};

interface PlanPreviewProps {
  plan: LessonPlan;
  subjectName: string;
  areaName: string;
  includeTeacherNotes: boolean;
  includeMaterials: boolean;
}

/**
 * Previzualizare tip A4 a proiectului — este și sursa pentru exportul PDF.
 * Culorile sunt păstrate în gamă simplă (compatibil html2canvas).
 */
export const PlanPreview = forwardRef<HTMLDivElement, PlanPreviewProps>(function PlanPreview(
  { plan, subjectName, areaName, includeTeacherNotes, includeMaterials },
  ref,
) {
  const { t, i18n } = useTranslation();
  const lang: Language = i18n.language === 'en' ? 'en' : 'ro';
  const meta = plan.metadata;

  const general = plan.competences.filter((c) => c.category === 'general');
  const specific = plan.competences.filter((c) => c.category === 'specific');
  const sortedPhases = [...plan.phases].sort((a, b) => a.order - b.order);

  const infoRow = (label: string, value: string) => (
    <div key={label} className="flex gap-2 border-b border-gray-200 py-1.5 text-[13px]">
      <span className="w-44 shrink-0 font-semibold text-gray-700">{label}</span>
      <span className="text-gray-900">{value || '—'}</span>
    </div>
  );

  const chipList = (items: string[]) => (
    <div className="space-y-0.5 text-[12px] text-gray-800">
      {items.length === 0 ? (
        <span className="text-gray-400">—</span>
      ) : (
        items.map((item, i) => (
          <div key={i} className="flex gap-1.5">
            <span className="shrink-0 text-gray-400">•</span>
            <span>{item}</span>
          </div>
        ))
      )}
    </div>
  );

  const compList = (items: typeof general) => (
    <div className="space-y-0.5 text-[13px] text-gray-800">
      {items.map((c) => (
        <div key={c.id} className="flex gap-1.5">
          <span className="shrink-0 text-gray-400">•</span>
          <span>
            {c.code && <strong>{c.code}. </strong>}
            {c.description}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div ref={ref} className="pdf-root mx-auto w-full max-w-[800px] rounded-lg border bg-white p-8 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold tracking-wide text-gray-900">
        {t('editor.preview.docTitle')}
      </h1>

      <div className="mb-6 avoid-break">
        {infoRow(t('editor.preview.school'), meta.schoolName || '')}
        {infoRow(t('editor.preview.teacher'), meta.teacherName || '')}
        {infoRow(t('editor.preview.subject'), subjectName)}
        {infoRow(t('editor.metadata.area'), areaName)}
        {infoRow(t('editor.preview.grade'), meta.grade !== '' ? formatGrade(meta.grade, lang) : '')}
        {infoRow(t('editor.preview.date'), formatDate(meta.date, lang))}
        {infoRow(t('editor.preview.duration'), `${meta.durationMinutes} ${lang === 'en' ? 'minutes' : 'minute'}`)}
        {infoRow(t('editor.preview.planTitle'), meta.title)}
        {infoRow(t('editor.preview.lessonType'), meta.lessonType)}
        {infoRow(t('editor.preview.orgForms'), meta.organizationalForms.join(', '))}
      </div>

      {(general.length > 0 || specific.length > 0) && (
        <div className="mb-6 avoid-break">
          {general.length > 0 && (
            <div className="mb-3">
              <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-teal-700">
                {t('editor.preview.generalCompetences')}
              </h2>
              {compList(general)}
            </div>
          )}
          {specific.length > 0 && (
            <div>
              <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-violet-700">
                {t('editor.preview.specificCompetences')}
              </h2>
              {compList(specific)}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {sortedPhases.map((phase, idx) => {
          const color = colorForPhaseKey(phase.phaseKey, idx);
          return (
            <section key={phase.id} className="avoid-break rounded-lg border border-gray-200">
              <header
                className="flex items-center gap-2 rounded-t-lg border-l-4 bg-gray-50 px-4 py-2"
                style={{ borderLeftColor: DOT[color] }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white"
                  style={{ backgroundColor: DOT[color] }}
                >
                  {idx + 1}
                </span>
                <h3 className="flex-1 text-sm font-bold text-gray-900">
                  {lang === 'en' ? phase.titleEn : phase.titleRo}
                </h3>
                <span className="text-[12px] font-medium text-gray-500">
                  {phase.durationMinutes} {t('common.minutes')}
                </span>
              </header>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {phase.objectives.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      {t('editor.preview.objectives')}
                    </h4>
                    {chipList(phase.objectives)}
                  </div>
                )}
                {phase.methods.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      {t('editor.preview.methods')}
                    </h4>
                    {chipList(phase.methods)}
                  </div>
                )}
                {includeMaterials && phase.materials.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      {t('editor.preview.materials')}
                    </h4>
                    {chipList(phase.materials)}
                  </div>
                )}
                {phase.observationTechniques.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">
                      {t('editor.preview.observation')}
                    </h4>
                    {chipList(phase.observationTechniques)}
                  </div>
                )}
                {phase.teacherActivity.trim() && (
                  <div className="sm:col-span-2">
                    <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-teal-700">
                      {t('editor.preview.teacherActivity')}
                    </h4>
                    <p className="whitespace-pre-line text-[12px] leading-relaxed text-gray-800">{phase.teacherActivity}</p>
                  </div>
                )}
                {phase.studentActivity.trim() && (
                  <div className="sm:col-span-2">
                    <h4 className="mb-1 text-[11px] font-bold uppercase tracking-wide text-coral-600">
                      {t('editor.preview.studentActivity')}
                    </h4>
                    <p className="whitespace-pre-line text-[12px] leading-relaxed text-gray-800">{phase.studentActivity}</p>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {includeTeacherNotes && plan.teacherNotes?.trim() && (
        <div className="mt-6 avoid-break rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-gray-600">
            {t('editor.preview.notes')}
          </h2>
          <p className="whitespace-pre-line text-[12px] text-gray-800">{plan.teacherNotes}</p>
        </div>
      )}

      {meta.bibliography.length > 0 && (
        <div className="mt-6 avoid-break">
          <h2 className="mb-1 text-sm font-bold uppercase tracking-wide text-gray-600">
            {t('editor.preview.bibliography')}
          </h2>
          {chipList(meta.bibliography)}
        </div>
      )}
    </div>
  );
});
