import type { CurricularArea, CurriculumData, CurriculumSubject, Language } from '@/types';

let cache: CurriculumData | null = null;

export async function loadCurriculum(): Promise<CurriculumData> {
  if (cache) return cache;
  const res = await fetch(`${import.meta.env.BASE_URL}curriculum/ro-curriculum.json`);
  if (!res.ok) throw new Error('Failed to load curriculum');
  cache = (await res.json()) as CurriculumData;
  return cache;
}

export function getArea(data: CurriculumData, areaId: string): CurricularArea | undefined {
  return data.areas.find((a) => a.id === areaId);
}

export function getSubject(area: CurricularArea | undefined, subjectId: string): CurriculumSubject | undefined {
  return area?.subjects.find((s) => s.id === subjectId);
}

export function findAreaBySubject(data: CurriculumData, subjectId: string): CurricularArea | undefined {
  return data.areas.find((a) => a.subjects.some((s) => s.id === subjectId));
}

export function subjectsForGrade(area: CurricularArea, grade: number): CurriculumSubject[] {
  return area.subjects.filter((s) => s.grades.includes(grade));
}

export function areaName(area: CurricularArea | undefined, lang: Language): string {
  if (!area) return '';
  return lang === 'en' ? area.nameEn : area.nameRo;
}

export function subjectName(subject: CurriculumSubject | undefined, lang: Language): string {
  if (!subject) return '';
  return lang === 'en' ? subject.nameEn : subject.nameRo;
}

/** Lista plată de discipline pentru filtrele din dashboard */
export function allSubjects(data: CurriculumData): { id: string; nameRo: string; nameEn: string }[] {
  const map = new Map<string, { id: string; nameRo: string; nameEn: string }>();
  for (const area of data.areas) {
    for (const s of area.subjects) {
      if (!map.has(s.id)) map.set(s.id, { id: s.id, nameRo: s.nameRo, nameEn: s.nameEn });
    }
  }
  return [...map.values()].sort((a, b) => a.nameRo.localeCompare(b.nameRo, 'ro'));
}
