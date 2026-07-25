import type { Settings, CustomPhaseDef, ThemeColors } from '@/types';
import { DEFAULT_PHASES } from './phases';

export const GRADES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export function romanForGrade(grade: number): string {
  return ROMAN[grade - 1] ?? String(grade);
}

/** Sugestii de metode de predare (limba documentului oficial = româna) */
export const METHOD_SUGGESTIONS = [
  'Conversația',
  'Explicația',
  'Demonstrația',
  'Problematizarea',
  'Lucrul în grup',
  'Lucrul individual',
  'Jocul didactic',
  'Învățarea prin descoperire',
  'Brainstorming',
  'Metoda ciorchinelui',
  'Studiul de caz',
  'Modelarea',
  'Exercițiul',
  'Observația dirijată',
  'Metoda cubului',
  'Turul galeriei',
];

/** Sugestii de materiale / resurse */
export const MATERIAL_SUGGESTIONS = [
  'Manual',
  'Fișă de lucru',
  'Proiector',
  'Prezentare PowerPoint',
  'Tablă',
  'Planșe',
  'Experiment',
  'Material video',
  'Hartă',
  'Atlas',
  'Instrumente muzicale',
  'Tablete / calculatoare',
  'Material concret-manipulativ',
  'Caietul elevului',
];

/** Sugestii de tehnici de observare / evaluare */
export const OBSERVATION_SUGGESTIONS = [
  'Observare sistematică',
  'Întrebări orale',
  'Fișă de evaluare',
  'Portofoliu',
  'Autoevaluare',
  'Evaluare inter pares',
  'Proba practică',
  'Test sumativ',
  'Aprecieri verbale',
  'Rubrics / grile de observare',
];

/** Sugestii pentru tipul lecției */
export const LESSON_TYPE_SUGGESTIONS = [
  'Comunicare de noi cunoștințe',
  'Formare de priceperi și deprinderi',
  'Consolidare și sistematizare',
  'Recapitulare',
  'Verificare și evaluare',
  'Lecție mixtă',
];

/** Sugestii pentru formele de organizare a activității */
export const ORG_FORM_SUGGESTIONS = ['Frontal', 'Individual', 'Pe grupe', 'În perechi'];

export function defaultPhaseDefs(): CustomPhaseDef[] {
  return DEFAULT_PHASES.map((p, i) => ({
    id: p.key,
    titleRo: p.titleRo,
    titleEn: p.titleEn,
    isDefault: true,
    order: i,
  }));
}

/** Paleta implicită — echivalentul hex al variabilelor din index.css */
export const DEFAULT_THEME_COLORS: ThemeColors = {
  primary: '#22c55e',
  accent: '#f05f42',
  secondary: '#fbd437',
  background: '#000000',
  card: '#0d0d0d',
  foreground: '#f2f2f2',
};

export const DEFAULT_SETTINGS: Settings = {
  language: 'ro',
  teacherName: '',
  schoolName: '',
  exportFormat: 'docx',
  reducedMotion: false,
  highContrast: false,
  sidebarCollapsed: false,
  themeColors: DEFAULT_THEME_COLORS,
  phases: defaultPhaseDefs(),
};
