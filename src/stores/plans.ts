import { create } from 'zustand';
import type { LessonPlan, PlanVersion } from '@/types';
import {
  dbDeletePlan,
  dbDeleteVersionsForPlan,
  dbExportAll,
  dbGetAllPlans,
  dbGetVersions,
  dbImportAll,
  dbPutPlan,
} from '@/lib/storage';
import { snapshotPlan, buildRestoredPlan } from '@/lib/versioning';
import { migratePlan } from '@/lib/migrations';
import { toast } from '@/stores/toast';
import { uid } from '@/lib/utils';
import { DEFAULT_SETTINGS } from '@/data/defaults';
import type { BackupData, Settings } from '@/types';
import i18n from '@/data/i18n/config';

interface PlansState {
  plans: LessonPlan[];
  loaded: boolean;
  saving: boolean;
  lastSavedAt: string | null;

  load: () => Promise<void>;
  create: (settings: Settings) => LessonPlan;
  add: (plan: LessonPlan) => Promise<void>;
  /** Auto-save: actualizează starea și persistă cu debounce */
  update: (plan: LessonPlan) => void;
  /** Salvare explicită: incrementează versiunea și creează snapshot automat */
  save: (plan: LessonPlan, label?: string) => Promise<number>;
  remove: (id: string) => Promise<void>;
  duplicate: (id: string) => Promise<LessonPlan | null>;
  getVersions: (planId: string) => Promise<PlanVersion[]>;
  restoreVersion: (planId: string, version: PlanVersion) => Promise<void>;
  exportBackup: () => Promise<string>;
  importBackup: (json: string) => Promise<number>;
}

const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

function debouncedPersist(plan: LessonPlan) {
  const existing = saveTimers.get(plan.id);
  if (existing) clearTimeout(existing);
  saveTimers.set(
    plan.id,
    setTimeout(() => {
      saveTimers.delete(plan.id);
      dbPutPlan(plan).catch(() => toast.error(i18n.t('errors.saveFailed')));
    }, 500),
  );
}

function sortPlans(plans: LessonPlan[]): LessonPlan[] {
  return [...plans].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export const usePlansStore = create<PlansState>((set, get) => ({
  plans: [],
  loaded: false,
  saving: false,
  lastSavedAt: null,

  load: async () => {
    try {
      const plans = await dbGetAllPlans();
      set({ plans: sortPlans(plans), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  create: (settings) => {
    const now = new Date().toISOString();
    return {
      id: uid(),
      createdAt: now,
      updatedAt: now,
      version: 0,
      metadata: {
        title: '',
        grade: '',
        area: '',
        subject: '',
        date: now.slice(0, 10),
        durationMinutes: 50,
        lessonType: '',
        organizationalForms: [],
        bibliography: [],
        teacherName: settings.teacherName || DEFAULT_SETTINGS.teacherName,
        schoolName: settings.schoolName || DEFAULT_SETTINGS.schoolName,
      },
      competences: [],
      phases: [],
      teacherNotes: '',
    };
  },

  add: async (plan) => {
    try {
      await dbPutPlan(plan);
    } catch {
      toast.error(i18n.t('errors.saveFailed'));
    }
    set((state) => ({ plans: sortPlans([plan, ...state.plans]) }));
  },

  update: (plan) => {
    const updated = { ...plan, updatedAt: new Date().toISOString() };
    set((state) => ({
      plans: sortPlans(state.plans.map((p) => (p.id === updated.id ? updated : p))),
    }));
    debouncedPersist(updated);
  },

  save: async (plan, label) => {
    set({ saving: true });
    try {
      // anulează debounce-ul în curs — salvăm direct
      const existing = saveTimers.get(plan.id);
      if (existing) {
        clearTimeout(existing);
        saveTimers.delete(plan.id);
      }
      const current = get().plans.find((p) => p.id === plan.id) ?? plan;
      const toSave: LessonPlan = {
        ...current,
        version: current.version + 1,
        updatedAt: new Date().toISOString(),
      };
      await dbPutPlan(toSave);
      await snapshotPlan(toSave, label);
      set((state) => ({
        plans: sortPlans(state.plans.map((p) => (p.id === toSave.id ? toSave : p))),
        saving: false,
        lastSavedAt: new Date().toISOString(),
      }));
      return toSave.version;
    } catch (e) {
      set({ saving: false });
      throw e;
    }
  },

  remove: async (id) => {
    try {
      await dbDeletePlan(id);
      await dbDeleteVersionsForPlan(id);
    } catch {
      toast.error(i18n.t('errors.deleteFailed'));
    }
    set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }));
  },

  duplicate: async (id) => {
    const original = get().plans.find((p) => p.id === id);
    if (!original) return null;
    const now = new Date().toISOString();
    const copy: LessonPlan = {
      ...structuredClone(original),
      id: uid(),
      createdAt: now,
      updatedAt: now,
      version: 0,
      metadata: { ...original.metadata, title: `${original.metadata.title} (copie)` },
      phases: original.phases.map((ph) => ({ ...ph, id: uid() })),
      competences: original.competences.map((c) => ({ ...c, id: uid() })),
    };
    await dbPutPlan(copy).catch(() => toast.error(i18n.t('errors.duplicateFailed')));
    set((state) => ({ plans: sortPlans([copy, ...state.plans]) }));
    return copy;
  },

  getVersions: async (planId) => dbGetVersions(planId),

  restoreVersion: async (planId, version) => {
    const current = get().plans.find((p) => p.id === planId);
    if (!current) return;
    try {
      // snapshot de siguranță al stării curente înainte de restaurare
      await snapshotPlan(current, 'Înainte de restaurare');
      const restored = buildRestoredPlan(current, version);
      await dbPutPlan(restored);
      set((state) => ({
        plans: sortPlans(state.plans.map((p) => (p.id === planId ? restored : p))),
      }));
    } catch {
      toast.error(i18n.t('errors.restoreFailed'));
    }
  },

  exportBackup: async () => {
    const data = await dbExportAll();
    return JSON.stringify(data, null, 2);
  },

  importBackup: async (json) => {
    const data = JSON.parse(json) as BackupData;
    if (!data || data.app !== 'plandelectie' || !Array.isArray(data.plans)) {
      throw new Error('invalid-backup');
    }
    // normalizează datele importate (pot proveni din versiuni mai vechi ale schemei)
    const plans = data.plans.map(migratePlan);
    const versions = (Array.isArray(data.versions) ? data.versions : []).map((v) => ({
      ...v,
      snapshot: migratePlan(v.snapshot),
    }));
    await dbImportAll({ ...data, plans, versions });
    const allPlans = await dbGetAllPlans();
    set({ plans: sortPlans(allPlans) });
    return allPlans.length;
  },
}));
