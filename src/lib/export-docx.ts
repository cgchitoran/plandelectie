import type { LessonPlan, Language } from '@/types';
import { downloadBlob, formatDate, formatGrade, sanitizeFilename } from './utils';

export interface ExportOptions {
  includeTeacherNotes: boolean;
  includeMaterials: boolean;
  language: Language;
  subjectName: string;
  areaName: string;
}

const FONT = 'Calibri';
const BORDER = { style: 'single' as const, size: 4, color: '7f7f7f' };
const TABLE_BORDERS = {
  top: BORDER,
  bottom: BORDER,
  left: BORDER,
  right: BORDER,
  insideHorizontal: BORDER,
  insideVertical: BORDER,
};

export async function exportPlanDocx(plan: LessonPlan, options: ExportOptions): Promise<void> {
  const docx = await import('docx');
  const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    WidthType, AlignmentType, PageOrientation, HeadingLevel, VerticalAlign,
  } = docx;

  const lang = options.language;
  const ro = lang === 'ro';

  const p = (text: string, opts: { bold?: boolean; size?: number; align?: typeof AlignmentType[keyof typeof AlignmentType]; spacingAfter?: number } = {}) =>
    new Paragraph({
      children: [new TextRun({ text, bold: opts.bold, size: opts.size ?? 22, font: FONT })],
      alignment: opts.align,
      spacing: { after: opts.spacingAfter ?? 120 },
    });

  const cellParagraphs = (items: string[]): InstanceType<typeof Paragraph>[] => {
    if (items.length === 0) return [new Paragraph({ children: [new TextRun({ text: '—', size: 20, font: FONT })] })];
    return items.map(
      (item) =>
        new Paragraph({
          children: [new TextRun({ text: `• ${item}`, size: 20, font: FONT })],
          spacing: { after: 60 },
        }),
    );
  };

  const textCell = (text: string): InstanceType<typeof Paragraph>[] => {
    const lines = (text || '').split('\n').filter((l) => l.trim().length > 0);
    if (lines.length === 0) return [new Paragraph({ children: [new TextRun({ text: '—', size: 20, font: FONT })] })];
    return lines.map(
      (line) =>
        new Paragraph({
          children: [new TextRun({ text: line, size: 20, font: FONT })],
          spacing: { after: 60 },
        }),
    );
  };

  /* ---------- Antet: tabel cu date generale ---------- */
  const meta = plan.metadata;
  const infoRows: [string, string][] = [
    [ro ? 'Unitatea de învățământ' : 'School', meta.schoolName || '—'],
    [ro ? 'Profesor' : 'Teacher', meta.teacherName || '—'],
    [ro ? 'Disciplina' : 'Subject', options.subjectName || '—'],
    [ro ? 'Arie curriculară' : 'Curricular area', options.areaName || '—'],
    [ro ? 'Clasa' : 'Grade', formatGrade(meta.grade, lang)],
    [ro ? 'Data' : 'Date', formatDate(meta.date, lang)],
    [ro ? 'Durata' : 'Duration', `${meta.durationMinutes} ${ro ? 'minute' : 'minutes'}`],
    [ro ? 'Titlul' : 'Title', meta.title],
    [ro ? 'Tipul lecției' : 'Lesson type', meta.lessonType || '—'],
    [ro ? 'Forme de organizare' : 'Organizational forms', meta.organizationalForms.join(', ') || '—'],
  ];

  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [4000, 6000],
    borders: TABLE_BORDERS,
    rows: infoRows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 22, font: FONT })] })],
              shading: { fill: 'e6f4f2' },
              verticalAlign: VerticalAlign.CENTER,
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: value, size: 22, font: FONT })] })],
              verticalAlign: VerticalAlign.CENTER,
            }),
          ],
        }),
    ),
  });

  /* ---------- Competențe ---------- */
  const generalComp = plan.competences.filter((c) => c.category === 'general');
  const specificComp = plan.competences.filter((c) => c.category === 'specific');
  const compBlock = (title: string, items: typeof generalComp) => [
    p(title, { bold: true, size: 24, spacingAfter: 60 }),
    ...(items.length === 0
      ? [p('—', { spacingAfter: 60 })]
      : items.map(
          (c) =>
            new Paragraph({
              children: [
                new TextRun({ text: `${c.code ? `${c.code}. ` : ''}${c.description}`, size: 22, font: FONT }),
              ],
              bullet: { level: 0 },
              spacing: { after: 60 },
            }),
        )),
  ];

  /* ---------- Tabelul fazelor (landscape) ---------- */
  const headers = ro
    ? ['Nr.', 'Etapa lecției', 'Durata', 'Obiective', 'Activitatea profesorului', 'Activitatea elevilor', 'Metode', 'Materiale', 'Evaluare']
    : ['No.', 'Lesson phase', 'Duration', 'Objectives', 'Teacher activity', 'Student activity', 'Methods', 'Materials', 'Assessment'];

  const columnWidths = [500, 1500, 800, 2600, 3500, 3500, 1700, 1500, 1700];

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h) =>
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun({ text: h, bold: true, size: 20, color: 'ffffff', font: FONT })],
              alignment: AlignmentType.CENTER,
            }),
          ],
          shading: { fill: '0d9488' },
          verticalAlign: VerticalAlign.CENTER,
        }),
    ),
  });

  const phaseRows = [...plan.phases]
    .sort((a, b) => a.order - b.order)
    .map((phase, idx) => {
      const cells = [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: String(idx + 1), size: 20, font: FONT })], alignment: AlignmentType.CENTER })],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: ro ? phase.titleRo : phase.titleEn, bold: true, size: 20, font: FONT })] })],
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: `${phase.durationMinutes} ${ro ? 'min' : 'min'}`, size: 20, font: FONT })], alignment: AlignmentType.CENTER })],
          verticalAlign: VerticalAlign.CENTER,
        }),
        new TableCell({ children: cellParagraphs(phase.objectives) }),
        new TableCell({ children: textCell(phase.teacherActivity) }),
        new TableCell({ children: textCell(phase.studentActivity) }),
        new TableCell({ children: cellParagraphs(phase.methods) }),
        new TableCell({ children: options.includeMaterials ? cellParagraphs(phase.materials) : [new Paragraph({ children: [new TextRun({ text: '—', size: 20, font: FONT })] })] }),
        new TableCell({ children: cellParagraphs(phase.observationTechniques) }),
      ];
      return new TableRow({ children: cells });
    });

  const phasesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths,
    borders: TABLE_BORDERS,
    rows: [headerRow, ...phaseRows],
  });

  const doc = new Document({
    creator: meta.teacherName || 'PlanDeLectie',
    title: meta.title,
    styles: {
      default: {
        document: { run: { font: FONT, size: 22 } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
            margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
          },
        },
        children: [
          new Paragraph({
            children: [new TextRun({ text: ro ? 'PROIECT DIDACTIC' : 'LESSON PLAN', bold: true, size: 32, font: FONT })],
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.TITLE,
            spacing: { after: 240 },
          }),
          infoTable,
          new Paragraph({ children: [new TextRun({ text: '', size: 22 })], spacing: { after: 120 } }),
          ...compBlock(ro ? 'Competențe generale' : 'General competences', generalComp),
          ...compBlock(ro ? 'Competențe specifice' : 'Specific competences', specificComp),
          ...(options.includeTeacherNotes && plan.teacherNotes?.trim()
            ? [p(ro ? 'Note profesor' : 'Teacher notes', { bold: true, size: 24, spacingAfter: 60 }), p(plan.teacherNotes, {})]
            : []),
          ...(meta.bibliography.length > 0
            ? [
                p(ro ? 'Bibliografie' : 'Bibliography', { bold: true, size: 24, spacingAfter: 60 }),
                ...meta.bibliography.map(
                  (item) =>
                    new Paragraph({
                      children: [new TextRun({ text: item, size: 22, font: FONT })],
                      bullet: { level: 0 },
                      spacing: { after: 60 },
                    }),
                ),
              ]
            : []),
        ],
      },
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.LANDSCAPE },
            margin: { top: 850, bottom: 850, left: 850, right: 850 },
          },
        },
        children: [phasesTable],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  await downloadBlob(blob, `${sanitizeFilename(meta.title)}.docx`);
}
