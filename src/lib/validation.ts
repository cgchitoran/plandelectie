import type { LessonPlan, LessonPhase } from '@/types';

/** Ce poate lipsi la o fază a lecției */
export type PhaseMissing = 'objectives' | 'teacherActivity' | 'studentActivity';

/** Câmpurile de metadate obligatorii */
export type MetadataField = 'title' | 'grade' | 'area' | 'subject' | 'date' | 'durationMinutes';

export interface PlanIssues {
  /** Câmpuri de metadate necompletate/invalide */
  metadata: MetadataField[];
  /** true dacă lipsește cel puțin o competență specifică */
  missingSpecificCompetence: boolean;
  /** true dacă nu există nicio fază selectată */
  noPhases: boolean;
  /** Per fază: ce elemente lipsesc */
  phases: { phaseId: string; missing: PhaseMissing[] }[];
}

/** Etapele wizard-ului care pot fi incomplete (preview-ul nu are date proprii) */
export type ValidatableStep = 'metadata' | 'competences' | 'phases' | 'details';

export function getPhaseMissing(phase: LessonPhase): PhaseMissing[] {
  const missing: PhaseMissing[] = [];
  if (phase.objectives.length === 0) missing.push('objectives');
  if (!phase.teacherActivity.trim()) missing.push('teacherActivity');
  if (!phase.studentActivity.trim()) missing.push('studentActivity');
  return missing;
}

/** Calculează toate elementele esențiale lipsă dintr-un proiect. Funcție pură. */
export function getPlanIssues(plan: LessonPlan): PlanIssues {
  const m = plan.metadata;
  const metadata: MetadataField[] = [];
  if (!m.title.trim()) metadata.push('title');
  if (!m.grade) metadata.push('grade');
  if (!m.area) metadata.push('area');
  if (!m.subject) metadata.push('subject');
  if (!m.date) metadata.push('date');
  if (!Number.isFinite(m.durationMinutes) || m.durationMinutes < 1 || m.durationMinutes > 600) {
    metadata.push('durationMinutes');
  }

  const missingSpecificCompetence = !plan.competences.some((c) => c.category === 'specific');
  const noPhases = plan.phases.length === 0;
  const phases = plan.phases
    .map((p) => ({ phaseId: p.id, missing: getPhaseMissing(p) }))
    .filter((p) => p.missing.length > 0);

  return { metadata, missingSpecificCompetence, noPhases, phases };
}

export function hasAnyIssues(issues: PlanIssues): boolean {
  return (
    issues.metadata.length > 0 ||
    issues.missingSpecificCompetence ||
    issues.noPhases ||
    issues.phases.length > 0
  );
}

/** Etapele cu elemente lipsă — pentru marcajele discrete permanente din wizard. */
export function getIncompleteSteps(plan: LessonPlan): Set<ValidatableStep> {
  const issues = getPlanIssues(plan);
  const steps = new Set<ValidatableStep>();
  if (issues.metadata.length > 0) steps.add('metadata');
  if (issues.missingSpecificCompetence) steps.add('competences');
  if (issues.noPhases) steps.add('phases');
  if (issues.phases.length > 0) steps.add('details');
  return steps;
}
