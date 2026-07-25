import { create } from 'zustand';
import type { CurricularArea, CurriculumData, CurriculumSubject } from '@/types';
import { loadCurriculum } from '@/data/curriculum';
import { dbClearCurriculum, dbGetCurriculum, dbSaveCurriculum } from '@/lib/storage';
import { toast } from '@/stores/toast';
import { uid } from '@/lib/utils';
import { GRADES } from '@/data/defaults';
import i18n from '@/data/i18n/config';

/**
 * Curriculum editabil: profesorul își personalizează ariile și disciplinele.
 * Copia editată se persistă în IndexedDB (override); JSON-ul default rămâne intact
 * și poate fi restaurat oricând cu resetToDefault().
 */
interface CurriculumState {
  curriculum: CurriculumData | null;
  loaded: boolean;
  /** true dacă există o copie personalizată (nu se mai folosește JSON-ul default) */
  customized: boolean;
  load: () => Promise<void>;
  resetToDefault: () => Promise<void>;
  renameArea: (areaId: string, partial: Partial<Pick<CurricularArea, 'nameRo' | 'nameEn'>>) => void;
  addArea: () => void;
  removeArea: (areaId: string) => void;
  addSubject: (areaId: string) => void;
  updateSubject: (
    areaId: string,
    subjectId: string,
    partial: Partial<Pick<CurriculumSubject, 'nameRo' | 'nameEn' | 'grades'>>,
  ) => void;
  removeSubject: (areaId: string, subjectId: string) => void;
}

async function loadDefault(): Promise<CurriculumData> {
  return loadCurriculum();
}

export const useCurriculumStore = create<CurriculumState>((set, get) => {
  /** Aplică o nouă stare și o persistă ca override */
  const commit = (next: CurriculumData) => {
    set({ curriculum: next, customized: true });
    dbSaveCurriculum(next).catch(() => toast.error(i18n.t('errors.saveFailed')));
  };

  const patchArea = (areaId: string, fn: (area: CurricularArea) => CurricularArea) => {
    const c = get().curriculum;
    if (!c) return;
    commit({ areas: c.areas.map((a) => (a.id === areaId ? fn(a) : a)) });
  };

  return {
    curriculum: null,
    loaded: false,
    customized: false,

    load: async () => {
      try {
        const override = await dbGetCurriculum();
        if (override && Array.isArray(override.areas) && override.areas.length > 0) {
          set({ curriculum: override, loaded: true, customized: true });
          return;
        }
      } catch {
        /* continuăm cu default-ul */
      }
      try {
        const def = await loadDefault();
        set({ curriculum: def, loaded: true, customized: false });
      } catch {
        set({ loaded: true });
      }
    },

    resetToDefault: async () => {
      const def = await loadDefault();
      try {
        await dbClearCurriculum();
      } catch {
        /* ignorăm — starea locală e oricum resetată */
      }
      set({ curriculum: def, customized: false });
    },

    renameArea: (areaId, partial) => {
      patchArea(areaId, (a) => ({ ...a, ...partial }));
    },

    addArea: () => {
      const c = get().curriculum;
      if (!c) return;
      const area: CurricularArea = { id: uid(), nameRo: 'Arie nouă', nameEn: 'New area', subjects: [] };
      commit({ areas: [...c.areas, area] });
    },

    removeArea: (areaId) => {
      const c = get().curriculum;
      if (!c) return;
      commit({ areas: c.areas.filter((a) => a.id !== areaId) });
    },

    addSubject: (areaId) => {
      patchArea(areaId, (a) => ({
        ...a,
        subjects: [
          ...a.subjects,
          { id: uid(), nameRo: 'Disciplină nouă', nameEn: 'New subject', grades: [...GRADES], competences: [] },
        ],
      }));
    },

    updateSubject: (areaId, subjectId, partial) => {
      patchArea(areaId, (a) => ({
        ...a,
        subjects: a.subjects.map((s) => (s.id === subjectId ? { ...s, ...partial } : s)),
      }));
    },

    removeSubject: (areaId, subjectId) => {
      patchArea(areaId, (a) => ({ ...a, subjects: a.subjects.filter((s) => s.id !== subjectId) }));
    },
  };
});

/** Parsează „5, 6, 7” → [5, 6, 7] (valori unice, 0–12, sortate) */
export function parseGradesInput(text: string): number[] {
  const nums = text
    .split(/[,\s;]+/)
    .map((x) => parseInt(x, 10))
    .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 12);
  return [...new Set(nums)].sort((a, b) => a - b);
}
