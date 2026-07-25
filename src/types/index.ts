export type Language = 'ro' | 'en';

export interface LessonPlanMetadata {
  title: string;
  grade: string; // "0".."12" (0 = clasa pregătitoare)
  area: string; // id arie curriculară
  subject: string; // id disciplină
  date: string; // ISO date (yyyy-mm-dd)
  durationMinutes: number;
  /** Tipul lecției (ex: comunicare de noi cunoștințe, evaluare) */
  lessonType: string;
  /** Forme de organizare: Frontal, Individual, Pe grupe… */
  organizationalForms: string[];
  /** Referințe bibliografice */
  bibliography: string[];
  teacherName?: string;
  schoolName?: string;
}

export interface LessonPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  version: number; // pentru versionare internă
  /** Versiunea schemei la care a fost normalizat proiectul (vezi lib/migrations) */
  schemaVersion?: number;
  metadata: LessonPlanMetadata;
  competences: Competence[];
  phases: LessonPhase[];
  teacherNotes?: string;
}

export interface Competence {
  id: string;
  code?: string; // cod oficial, dacă există
  description: string;
  category: 'general' | 'specific';
}

export interface LessonPhase {
  id: string;
  order: number;
  phaseKey: string; // ex: "captare-atentie" sau id custom
  titleRo: string;
  titleEn: string;
  durationMinutes: number;
  objectives: string[];
  methods: string[];
  materials: string[];
  observationTechniques: string[];
  teacherActivity: string;
  studentActivity: string;
}

export interface PlanVersion {
  id: string;
  planId: string;
  versionNumber: number;
  createdAt: string;
  label?: string; // ex: "Variantă pentru inspecție"
  snapshot: LessonPlan;
}

/** Definiție de fază (default sau personalizată), gestionată în Setări */
export interface CustomPhaseDef {
  id: string;
  titleRo: string;
  titleEn: string;
  isDefault: boolean;
  order: number;
}

/** Cele 6 controale majore de culoare ale temei (hex, ex: "#22c55e") */
export interface ThemeColors {
  primary: string;
  accent: string;
  secondary: string;
  background: string;
  card: string;
  foreground: string;
}

export interface Settings {
  language: Language;
  teacherName: string;
  schoolName: string;
  exportFormat: 'docx' | 'pdf';
  reducedMotion: boolean;
  highContrast: boolean;
  /** Sidebar restrâns (doar iconițe) vs extins */
  sidebarCollapsed: boolean;
  /** Culorile personalizate ale temei; restul nuanțelor se derivează automat */
  themeColors: ThemeColors;
  phases: CustomPhaseDef[];
}

/* ---------- Curriculum ---------- */

export interface CurriculumCompetence {
  code: string;
  descriptionRo: string;
  descriptionEn: string;
  category: 'general' | 'specific';
}

export interface CurriculumSubject {
  id: string;
  nameRo: string;
  nameEn: string;
  grades: number[]; // 0..12
  competences: CurriculumCompetence[];
}

export interface CurricularArea {
  id: string;
  nameRo: string;
  nameEn: string;
  subjects: CurriculumSubject[];
}

export interface CurriculumData {
  areas: CurricularArea[];
}

/* ---------- Backup ---------- */

export interface BackupData {
  exportedAt: string;
  app: string;
  plans: LessonPlan[];
  versions: PlanVersion[];
  settings: Settings | null;
}
