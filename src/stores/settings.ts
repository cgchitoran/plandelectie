import { create } from 'zustand';
import type { CustomPhaseDef, Settings } from '@/types';
import { DEFAULT_SETTINGS, defaultPhaseDefs } from '@/data/defaults';
import { dbGetSettings, dbSaveSettings } from '@/lib/storage';
import { toast } from '@/stores/toast';
import { uid } from '@/lib/utils';
import i18n from '@/data/i18n/config';

interface SettingsState {
  settings: Settings;
  loaded: boolean;
  load: () => Promise<void>;
  patch: (partial: Partial<Settings>) => void;
  addPhase: () => void;
  updatePhase: (id: string, partial: Partial<CustomPhaseDef>) => void;
  movePhase: (id: string, direction: 'up' | 'down') => void;
  removePhase: (id: string) => void;
  resetPhases: () => void;
}

function persist(settings: Settings) {
  dbSaveSettings(settings).catch(() => toast.error(i18n.t('errors.saveFailed')));
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    try {
      const saved = await dbGetSettings();
      if (saved) {
        // merge pentru compatibilitate cu versiuni viitoare
        const merged: Settings = {
          ...DEFAULT_SETTINGS,
          ...saved,
          phases: Array.isArray(saved.phases) && saved.phases.length > 0 ? saved.phases : defaultPhaseDefs(),
        };
        set({ settings: merged, loaded: true });
        if (merged.language && i18n.language !== merged.language) void i18n.changeLanguage(merged.language);
      } else {
        // fără setări salvate: sincronizăm limba cu cea detectată din browser
        const detected: Settings['language'] = i18n.language?.startsWith('en') ? 'en' : 'ro';
        set({ settings: { ...DEFAULT_SETTINGS, language: detected }, loaded: true });
      }
    } catch {
      set({ loaded: true });
    }
  },

  patch: (partial) => {
    const settings = { ...get().settings, ...partial };
    set({ settings });
    persist(settings);
  },

  addPhase: () => {
    const { settings } = get();
    const phases = [
      ...settings.phases,
      { id: uid(), titleRo: 'Fază nouă', titleEn: 'New phase', isDefault: false, order: settings.phases.length },
    ];
    get().patch({ phases });
  },

  updatePhase: (id, partial) => {
    const phases = get().settings.phases.map((p) => (p.id === id ? { ...p, ...partial } : p));
    get().patch({ phases });
  },

  movePhase: (id, direction) => {
    const phases = [...get().settings.phases].sort((a, b) => a.order - b.order);
    const idx = phases.findIndex((p) => p.id === id);
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || target < 0 || target >= phases.length) return;
    [phases[idx], phases[target]] = [phases[target], phases[idx]];
    get().patch({ phases: phases.map((p, i) => ({ ...p, order: i })) });
  },

  removePhase: (id) => {
    const phases = get()
      .settings.phases.filter((p) => p.id !== id)
      .map((p, i) => ({ ...p, order: i }));
    get().patch({ phases });
  },

  resetPhases: () => {
    get().patch({ phases: defaultPhaseDefs() });
  },
}));
