import type { LessonPhase, LessonPlan } from '@/types';

/**
 * Punct de extensie pentru integrarea AI viitoare.
 * Acum este un stub — UI-ul afișează "În curând".
 * Implementarea reală va putea fi injectată fără modificări în componente.
 */
export interface AIService {
  /** Sugestii de activități pentru o fază, pe baza metadatelor proiectului */
  suggestPhaseActivities(plan: LessonPlan, phase: LessonPhase): Promise<string[] | null>;
  /** Reformulare / îmbunătățire text liber (activitate profesor/elev) */
  improveText(text: string, context: string): Promise<string | null>;
  /** Sugestii de competențe relevante pe baza titlului lecției */
  suggestCompetences(plan: LessonPlan): Promise<string[] | null>;
  isAvailable(): boolean;
}

class StubAIService implements AIService {
  async suggestPhaseActivities(): Promise<string[] | null> {
    return null;
  }
  async improveText(): Promise<string | null> {
    return null;
  }
  async suggestCompetences(): Promise<string[] | null> {
    return null;
  }
  isAvailable(): boolean {
    return false;
  }
}

export const aiService: AIService = new StubAIService();
