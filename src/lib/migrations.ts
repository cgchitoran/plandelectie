import type { Competence, LessonPhase, LessonPlan, LessonPlanMetadata } from '@/types';
import { uid } from '@/lib/utils';

/**
 * Versiunea curentă a schemei LessonPlan.
 * Crește când structura se schimbă incompatibil; migratePlan aduce datele vechi la zi.
 */
export const SCHEMA_VERSION = 1;

/** Id-uri de discipline redenumite între versiuni de curriculum (vechi → nou). */
export const SUBJECT_ID_RENAMES: Record<string, string> = {
  'tic-informatica': 'informatica',
};

function asString(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function asNumber(v: unknown, fallback: number): number {
  const n = typeof v === 'string' ? Number(v) : v;
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

function migrateMetadata(raw: unknown): LessonPlanMetadata {
  const m = (raw ?? {}) as Record<string, unknown>;
  const subject = asString(m.subject);
  return {
    // păstrează câmpuri necunoscute (future-proof)
    ...(m as Partial<LessonPlanMetadata>),
    title: asString(m.title),
    grade: asString(m.grade),
    area: asString(m.area),
    subject: SUBJECT_ID_RENAMES[subject] ?? subject,
    date: asString(m.date),
    durationMinutes: asNumber(m.durationMinutes, 50),
    lessonType: asString(m.lessonType),
    organizationalForms: asStringArray(m.organizationalForms),
    bibliography: asStringArray(m.bibliography),
    teacherName: asString(m.teacherName),
    schoolName: asString(m.schoolName),
  };
}

function migrateCompetence(raw: unknown): Competence {
  const c = (raw ?? {}) as Record<string, unknown>;
  return {
    ...(c as Partial<Competence>),
    id: asString(c.id) || uid(),
    code: c.code ? asString(c.code) : undefined,
    description: asString(c.description),
    category: c.category === 'general' ? 'general' : 'specific',
  } as Competence;
}

function migratePhase(raw: unknown, index: number): LessonPhase {
  const p = (raw ?? {}) as Record<string, unknown>;
  return {
    ...(p as Partial<LessonPhase>),
    id: asString(p.id) || uid(),
    order: asNumber(p.order, index),
    phaseKey: asString(p.phaseKey),
    titleRo: asString(p.titleRo),
    titleEn: asString(p.titleEn),
    durationMinutes: asNumber(p.durationMinutes, 5),
    objectives: asStringArray(p.objectives),
    methods: asStringArray(p.methods),
    materials: asStringArray(p.materials),
    observationTechniques: asStringArray(p.observationTechniques),
    teacherActivity: asString(p.teacherActivity),
    studentActivity: asString(p.studentActivity),
  } as LessonPhase;
}

/**
 * Normalizează un proiect citit din stocare/import la schema curentă:
 * completează câmpurile lipsă cu default-uri, corectează tipurile,
 * păstrează câmpurile necunoscute pentru compatibilitate viitoare.
 */
export function migratePlan(raw: unknown): LessonPlan {
  const p = (raw ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();
  return {
    ...(p as Partial<LessonPlan>),
    id: asString(p.id) || uid(),
    createdAt: asString(p.createdAt) || now,
    updatedAt: asString(p.updatedAt) || now,
    version: asNumber(p.version, 0),
    metadata: migrateMetadata(p.metadata),
    competences: Array.isArray(p.competences) ? p.competences.map(migrateCompetence) : [],
    phases: Array.isArray(p.phases) ? p.phases.map(migratePhase) : [],
    teacherNotes: asString(p.teacherNotes),
    schemaVersion: SCHEMA_VERSION,
  } as LessonPlan;
}
