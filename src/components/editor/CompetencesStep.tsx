import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Competence, CurriculumData, LessonPlan, Language } from '@/types';
import { getArea, getSubject } from '@/data/curriculum';
import { uid } from '@/lib/utils';

interface CompetencesStepProps {
  plan: LessonPlan;
  curriculum: CurriculumData | null;
  onChange: (competences: Competence[]) => void;
}

export function CompetencesStep({ plan, curriculum, onChange }: CompetencesStepProps) {
  const { t, i18n } = useTranslation();
  const lang: Language = i18n.language === 'en' ? 'en' : 'ro';

  const [manualCode, setManualCode] = useState('');
  const [manualDesc, setManualDesc] = useState('');
  const [manualCategory, setManualCategory] = useState<'general' | 'specific'>('specific');

  const area = curriculum ? getArea(curriculum, plan.metadata.area) : undefined;
  const subject = getSubject(area, plan.metadata.subject);

  const toggleCurriculumCompetence = (code: string, description: string, category: 'general' | 'specific') => {
    const exists = plan.competences.some((c) => c.description === description);
    if (exists) {
      onChange(plan.competences.filter((c) => c.description !== description));
    } else {
      onChange([...plan.competences, { id: uid(), code, description, category }]);
    }
  };

  const addManual = () => {
    if (!manualDesc.trim()) return;
    onChange([
      ...plan.competences,
      { id: uid(), code: manualCode.trim() || undefined, description: manualDesc.trim(), category: manualCategory },
    ]);
    setManualCode('');
    setManualDesc('');
  };

  const generalAvailable = useMemo(
    () => subject?.competences.filter((c) => c.category === 'general') ?? [],
    [subject],
  );
  const specificAvailable = useMemo(
    () => subject?.competences.filter((c) => c.category === 'specific') ?? [],
    [subject],
  );

  const isSelected = (description: string) => plan.competences.some((c) => c.description === description);

  if (!subject) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-muted-foreground">
          {t('editor.competences.selectSubjectFirst')}
        </CardContent>
      </Card>
    );
  }

  const renderGroup = (title: string, items: typeof generalAvailable) => (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{t('editor.competences.noCompetences')}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((c) => {
            const selected = isSelected(c.descriptionRo);
            return (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => toggleCurriculumCompetence(c.code, c.descriptionRo, c.category)}
                  className={`flex w-full items-start gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                    selected ? 'border-primary bg-primary/10' : 'hover:bg-muted'
                  }`}
                  aria-pressed={selected}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                      selected ? 'border-primary bg-primary text-primary-foreground' : 'border-input'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3" />}
                  </span>
                  <span>
                    <span className="font-medium">{c.code}. </span>
                    {lang === 'en' ? c.descriptionEn : c.descriptionRo}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.competences.title')}</CardTitle>
          <CardDescription>{t('editor.competences.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderGroup(t('editor.competences.general'), generalAvailable)}
          <Separator />
          {renderGroup(t('editor.competences.specific'), specificAvailable)}
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">{t('editor.competences.addManual')}</h3>
            <div className="grid gap-2 sm:grid-cols-[120px_1fr_140px]">
              <Input
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder={t('editor.competences.manualCode')}
                aria-label={t('editor.competences.manualCode')}
              />
              <Input
                value={manualDesc}
                onChange={(e) => setManualDesc(e.target.value)}
                placeholder={t('editor.competences.manualDescription')}
                aria-label={t('editor.competences.manualDescription')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addManual();
                  }
                }}
              />
              <div className="flex gap-2">
                <Select value={manualCategory} onValueChange={(v) => setManualCategory(v as 'general' | 'specific')}>
                  <SelectTrigger aria-label={t('editor.competences.manualCategory')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t('editor.competences.general')}</SelectItem>
                    <SelectItem value="specific">{t('editor.competences.specific')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" size="icon" onClick={addManual} disabled={!manualDesc.trim()} aria-label={t('common.add')}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('editor.competences.selected')}
            <Badge variant="default">{plan.competences.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plan.competences.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('editor.competences.none')}</p>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {plan.competences.map((c) => (
                  <motion.li
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm"
                  >
                    <Badge variant={c.category === 'general' ? 'secondary' : 'violet'} className="mt-0.5 shrink-0">
                      {c.category === 'general' ? 'G' : 'S'}
                    </Badge>
                    <span className="flex-1">
                      {c.code && <span className="font-medium">{c.code}. </span>}
                      {c.description}
                    </span>
                    <button
                      type="button"
                      onClick={() => onChange(plan.competences.filter((x) => x.id !== c.id))}
                      className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      aria-label={t('common.remove')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
