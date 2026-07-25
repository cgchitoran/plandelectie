export type PhaseColor = 'teal' | 'coral' | 'violet' | 'yellow';

export interface DefaultPhaseDef {
  key: string;
  titleRo: string;
  titleEn: string;
  color: PhaseColor;
  defaultDuration: number;
}

/**
 * Cele 11 faze ale modelului Gagne adaptat (lista implicită).
 * Lista poate fi personalizată de utilizator în Setări.
 */
export const DEFAULT_PHASES: DefaultPhaseDef[] = [
  { key: 'captare-atentie', titleRo: 'Captarea și orientarea atenției', titleEn: 'Gaining attention and focus', color: 'teal', defaultDuration: 5 },
  { key: 'informare-obiective', titleRo: 'Informarea despre obiective', titleEn: 'Stating objectives', color: 'coral', defaultDuration: 3 },
  { key: 'stimulare-amintire', titleRo: 'Stimularea amintirii învățării anterioare', titleEn: 'Stimulating recall of prior learning', color: 'violet', defaultDuration: 5 },
  { key: 'prezentare-continut', titleRo: 'Prezentarea conținutului', titleEn: 'Presenting new content', color: 'yellow', defaultDuration: 10 },
  { key: 'dirijare-invatare', titleRo: 'Dirijarea învățării', titleEn: 'Guiding learning', color: 'teal', defaultDuration: 10 },
  { key: 'obtinere-performanta', titleRo: 'Obținerea performanței / exersarea', titleEn: 'Eliciting performance and practice', color: 'coral', defaultDuration: 10 },
  { key: 'asigurare-feedback', titleRo: 'Asigurarea feedbackului', titleEn: 'Providing feedback', color: 'violet', defaultDuration: 5 },
  { key: 'evaluare-performanta', titleRo: 'Evaluarea performanței', titleEn: 'Assessing performance', color: 'yellow', defaultDuration: 7 },
  { key: 'retentie-transfer', titleRo: 'Asigurarea retenției și transferului', titleEn: 'Enhancing retention and transfer', color: 'teal', defaultDuration: 5 },
  { key: 'tema-acasa', titleRo: 'Temă pentru acasă / activitate extinsă', titleEn: 'Homework / extended activity', color: 'coral', defaultDuration: 3 },
  { key: 'concluzii-reflectie', titleRo: 'Concluzii și reflecție', titleEn: 'Closure and reflection', color: 'violet', defaultDuration: 2 },
];

const PHASE_COLOR_CYCLE: PhaseColor[] = ['teal', 'coral', 'violet', 'yellow'];

export function phaseColorForIndex(index: number): PhaseColor {
  return PHASE_COLOR_CYCLE[index % PHASE_COLOR_CYCLE.length];
}
