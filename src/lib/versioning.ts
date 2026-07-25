import type { LessonPlan, PlanVersion } from '@/types';
import { uid } from './utils';
import { migratePlan } from './migrations';
import { dbAddVersion, dbPruneVersions } from './storage';

const MAX_VERSIONS_PER_PLAN = 20;

/** Creează un snapshot al proiectului și îl persistă (auto-snapshot la salvare). */
export async function snapshotPlan(plan: LessonPlan, label?: string): Promise<PlanVersion> {
  const version: PlanVersion = {
    id: uid(),
    planId: plan.id,
    versionNumber: plan.version,
    createdAt: new Date().toISOString(),
    label: label?.trim() || undefined,
    snapshot: structuredClone(plan),
  };
  await dbAddVersion(version);
  await dbPruneVersions(plan.id, MAX_VERSIONS_PER_PLAN);
  return version;
}

/**
 * Pregătește conținutul unui proiect restaurat dintr-o versiune anterioară.
 * Nu șterge versiunile existente.
 */
export function buildRestoredPlan(current: LessonPlan, version: PlanVersion): LessonPlan {
  // snapshot-urile pot fi vechi — le normalizăm la schema curentă
  const restored = migratePlan(structuredClone(version.snapshot));
  return {
    ...restored,
    id: current.id,
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
  };
}
