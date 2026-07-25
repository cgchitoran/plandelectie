import { openDB, type IDBPDatabase } from 'idb';
import type { BackupData, CurriculumData, LessonPlan, PlanVersion, Settings } from '@/types';
import { migratePlan } from '@/lib/migrations';

const DB_NAME = 'plandelectie-db';
const DB_VERSION = 2;
const SETTINGS_KEY = 'app-settings';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('plans')) {
          db.createObjectStore('plans', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('versions')) {
          const versions = db.createObjectStore('versions', { keyPath: 'id' });
          versions.createIndex('byPlanId', 'planId');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('autobackups')) {
          db.createObjectStore('autobackups', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

/* ---------- Plans ---------- */

export async function dbGetAllPlans(): Promise<LessonPlan[]> {
  const db = await getDB();
  const plans: LessonPlan[] = await db.getAll('plans');
  // normalizează datele vechi la schema curentă (câmpuri adăugate ulterior)
  return plans.map(migratePlan);
}

export async function dbPutPlan(plan: LessonPlan): Promise<void> {
  const db = await getDB();
  await db.put('plans', plan);
}

export async function dbDeletePlan(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('plans', id);
}

/* ---------- Versions ---------- */

export async function dbAddVersion(version: PlanVersion): Promise<void> {
  const db = await getDB();
  await db.put('versions', version);
}

export async function dbGetVersions(planId: string): Promise<PlanVersion[]> {
  const db = await getDB();
  const all: PlanVersion[] = await db.getAllFromIndex('versions', 'byPlanId', planId);
  return all.sort((a, b) => b.versionNumber - a.versionNumber);
}

export async function dbDeleteVersionsForPlan(planId: string): Promise<void> {
  const db = await getDB();
  const keys = await db.getAllKeysFromIndex('versions', 'byPlanId', planId);
  const tx = db.transaction('versions', 'readwrite');
  for (const key of keys) await tx.store.delete(key);
  await tx.done;
}

export async function dbPruneVersions(planId: string, keep: number): Promise<void> {
  const versions = await dbGetVersions(planId);
  if (versions.length <= keep) return;
  const db = await getDB();
  const tx = db.transaction('versions', 'readwrite');
  for (const v of versions.slice(keep)) await tx.store.delete(v.id);
  await tx.done;
}

/* ---------- Settings ---------- */

export async function dbGetSettings(): Promise<Settings | null> {
  const db = await getDB();
  return (await db.get('settings', SETTINGS_KEY)) ?? null;
}

export async function dbSaveSettings(settings: Settings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, SETTINGS_KEY);
}

/* ---------- Curriculum personalizat (override editabil) ---------- */

const CURRICULUM_KEY = 'curriculum-override';

export async function dbGetCurriculum(): Promise<CurriculumData | null> {
  const db = await getDB();
  return (await db.get('settings', CURRICULUM_KEY)) ?? null;
}

export async function dbSaveCurriculum(data: CurriculumData): Promise<void> {
  const db = await getDB();
  await db.put('settings', data, CURRICULUM_KEY);
}

export async function dbClearCurriculum(): Promise<void> {
  const db = await getDB();
  await db.delete('settings', CURRICULUM_KEY);
}

/* ---------- Backup / restore ---------- */

export async function dbExportAll(): Promise<BackupData> {
  const db = await getDB();
  const [plans, versions, settings] = await Promise.all([
    db.getAll('plans'),
    db.getAll('versions'),
    db.get('settings', SETTINGS_KEY),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    app: 'plandelectie',
    plans,
    versions,
    settings: settings ?? null,
  };
}

export async function dbImportAll(data: BackupData): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['plans', 'versions', 'settings'], 'readwrite');
  await tx.objectStore('plans').clear();
  await tx.objectStore('versions').clear();
  for (const plan of data.plans) await tx.objectStore('plans').put(plan);
  for (const version of data.versions) await tx.objectStore('versions').put(version);
  if (data.settings) await tx.objectStore('settings').put(data.settings, SETTINGS_KEY);
  await tx.done;
}

export async function dbClearAll(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(['plans', 'versions', 'settings'], 'readwrite');
  await tx.objectStore('plans').clear();
  await tx.objectStore('versions').clear();
  await tx.objectStore('settings').clear();
  await tx.done;
}

/* ---------- Auto-backup periodic ---------- */

export interface AutoBackup {
  id: string;
  createdAt: string;
  data: BackupData;
}

export async function dbAddAutoBackup(backup: AutoBackup): Promise<void> {
  const db = await getDB();
  await db.put('autobackups', backup);
}

export async function dbGetAutoBackups(): Promise<AutoBackup[]> {
  const db = await getDB();
  const all: AutoBackup[] = await db.getAll('autobackups');
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function dbPruneAutoBackups(keep: number): Promise<void> {
  const all = await dbGetAutoBackups();
  if (all.length <= keep) return;
  const db = await getDB();
  const tx = db.transaction('autobackups', 'readwrite');
  for (const b of all.slice(keep)) await tx.store.delete(b.id);
  await tx.done;
}
