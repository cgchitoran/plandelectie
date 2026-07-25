import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TagInput } from '@/components/ui/tag-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { CurriculumData, LessonPlan, Language } from '@/types';
import { GRADES, LESSON_TYPE_SUGGESTIONS, ORG_FORM_SUGGESTIONS } from '@/data/defaults';
import { getArea, subjectsForGrade, areaName } from '@/data/curriculum';
import { formatGrade } from '@/lib/utils';

const metadataSchema = z.object({
  title: z.string().min(1),
  grade: z.string().min(1),
  area: z.string().min(1),
  subject: z.string().min(1),
  date: z.string().min(1),
  durationMinutes: z.coerce.number().min(1).max(600),
  lessonType: z.string().optional(),
  organizationalForms: z.array(z.string()).optional(),
  bibliography: z.array(z.string()).optional(),
  teacherName: z.string().optional(),
  schoolName: z.string().optional(),
});

type MetadataFormValues = z.infer<typeof metadataSchema>;

interface MetadataStepProps {
  plan: LessonPlan;
  curriculum: CurriculumData | null;
  onChange: (metadata: LessonPlan['metadata']) => void;
}

export function MetadataStep({ plan, curriculum, onChange }: MetadataStepProps) {
  const { t, i18n } = useTranslation();
  const lang: Language = i18n.language === 'en' ? 'en' : 'ro';

  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataSchema),
    defaultValues: { ...plan.metadata },
    mode: 'onChange',
  });

  const { register, watch, setValue, formState } = form;

  // Sincronizare bidirecțională cu draft-ul din store (auto-save)
  useEffect(() => {
    const sub = watch((values) => {
      onChange({
        title: values.title ?? '',
        grade: values.grade ?? '',
        area: values.area ?? '',
        subject: values.subject ?? '',
        date: values.date ?? '',
        durationMinutes: Number(values.durationMinutes) || 0,
        lessonType: values.lessonType ?? '',
        organizationalForms: values.organizationalForms ?? [],
        bibliography: values.bibliography ?? [],
        teacherName: values.teacherName ?? '',
        schoolName: values.schoolName ?? '',
      });
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const grade = watch('grade');
  const area = watch('area');
  const subject = watch('subject');
  const organizationalForms = watch('organizationalForms');
  const bibliography = watch('bibliography');

  const selectedArea = curriculum ? getArea(curriculum, area) : undefined;
  const availableSubjects = useMemo(() => {
    if (!selectedArea) return [];
    const g = parseInt(grade, 10);
    if (Number.isNaN(g)) return selectedArea.subjects;
    return subjectsForGrade(selectedArea, g);
  }, [selectedArea, grade]);

  // Reset disciplină dacă nu mai este validă pentru arie/clasă
  useEffect(() => {
    if (subject && availableSubjects.length > 0 && !availableSubjects.some((s) => s.id === subject)) {
      setValue('subject', '');
    }
  }, [availableSubjects, subject, setValue]);

  const errorText = (key: keyof MetadataFormValues) => {
    const err = formState.errors[key];
    if (!err) return null;
    if (key === 'durationMinutes') return t('editor.metadata.durationInvalid');
    return t('common.required');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('editor.steps.metadata')}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">{t('editor.metadata.title')} *</Label>
          <Input id="title" placeholder={t('editor.metadata.titlePlaceholder')} {...register('title')} />
          {errorText('title') && <p className="text-xs text-destructive">{errorText('title')}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t('editor.metadata.grade')} *</Label>
          <Select value={grade} onValueChange={(v) => setValue('grade', v, { shouldValidate: true })}>
            <SelectTrigger aria-label={t('editor.metadata.grade')}>
              <SelectValue placeholder={t('grades.select')} />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((g) => (
                <SelectItem key={g} value={String(g)}>
                  {formatGrade(String(g), lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errorText('grade') && <p className="text-xs text-destructive">{errorText('grade')}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t('editor.metadata.area')} *</Label>
          <Select value={area} onValueChange={(v) => setValue('area', v, { shouldValidate: true })}>
            <SelectTrigger aria-label={t('editor.metadata.area')}>
              <SelectValue placeholder={t('editor.metadata.selectArea')} />
            </SelectTrigger>
            <SelectContent>
              {curriculum?.areas.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {areaName(a, lang)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errorText('area') && <p className="text-xs text-destructive">{errorText('area')}</p>}
        </div>

        <div className="space-y-2">
          <Label>{t('editor.metadata.subject')} *</Label>
          <Select
            value={subject}
            onValueChange={(v) => setValue('subject', v, { shouldValidate: true })}
            disabled={!area || availableSubjects.length === 0}
          >
            <SelectTrigger aria-label={t('editor.metadata.subject')}>
              <SelectValue placeholder={t('editor.metadata.selectSubject')} />
            </SelectTrigger>
            <SelectContent>
              {availableSubjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {lang === 'en' ? s.nameEn : s.nameRo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errorText('subject') && <p className="text-xs text-destructive">{errorText('subject')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">{t('editor.metadata.date')} *</Label>
          <Input id="date" type="date" {...register('date')} />
          {errorText('date') && <p className="text-xs text-destructive">{errorText('date')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="durationMinutes">{t('editor.metadata.duration')} *</Label>
          <Input id="durationMinutes" type="number" min={1} max={600} {...register('durationMinutes')} />
          {errorText('durationMinutes') && <p className="text-xs text-destructive">{errorText('durationMinutes')}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lessonType">{t('editor.metadata.lessonType')}</Label>
          <Input
            id="lessonType"
            list="lesson-type-suggestions"
            placeholder={t('editor.metadata.lessonTypePlaceholder')}
            {...register('lessonType')}
          />
          <datalist id="lesson-type-suggestions">
            {LESSON_TYPE_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>

        <div className="space-y-2">
          <Label>{t('editor.metadata.orgForms')}</Label>
          <TagInput
            value={organizationalForms ?? []}
            onChange={(v) => setValue('organizationalForms', v)}
            suggestions={ORG_FORM_SUGGESTIONS}
            suggestionsLabel={t('editor.phaseCard.suggestions')}
            placeholder={t('editor.phaseCard.addItem')}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label>{t('editor.metadata.bibliography')}</Label>
          <TagInput
            value={bibliography ?? []}
            onChange={(v) => setValue('bibliography', v)}
            placeholder={t('editor.metadata.bibliographyPlaceholder')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teacherName">{t('editor.metadata.teacherName')}</Label>
          <Input id="teacherName" {...register('teacherName')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="schoolName">{t('editor.metadata.schoolName')}</Label>
          <Input id="schoolName" {...register('schoolName')} />
        </div>
      </CardContent>
    </Card>
  );
}
