import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { parseGradesInput, useCurriculumStore } from '@/stores/curriculum';
import { usePlansStore } from '@/stores/plans';
import { cn } from '@/lib/utils';

/** Input text pentru lista de clase — comite la blur (permite tastare liberă) */
function GradesInput({ grades, onCommit }: { grades: number[]; onCommit: (g: number[]) => void }) {
  const { t } = useTranslation();
  const [text, setText] = useState(grades.join(', '));
  useEffect(() => setText(grades.join(', ')), [grades]);
  return (
    <Input
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onCommit(parseGradesInput(text))}
      aria-label={t('settings.gradesLabel')}
      placeholder={t('settings.gradesPlaceholder')}
      className="h-8 w-32 text-xs"
    />
  );
}

type PendingDelete = { kind: 'area'; areaId: string } | { kind: 'subject'; areaId: string; subjectId: string } | null;

/** Editor curriculum: arii + discipline editabile, cu reset la lista implicită */
export function CurriculumEditor() {
  const { t } = useTranslation();
  const { curriculum, customized, renameArea, addArea, removeArea, addSubject, updateSubject, removeSubject, resetToDefault } =
    useCurriculumStore();
  const plans = usePlansStore((s) => s.plans);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [resetOpen, setResetOpen] = useState(false);

  if (!curriculum) return null;

  const areaUsage = (areaId: string) => plans.filter((p) => p.metadata.area === areaId).length;
  const subjectUsage = (subjectId: string) => plans.filter((p) => p.metadata.subject === subjectId).length;

  const deleteDescription = (): string => {
    if (!pendingDelete) return '';
    const count = pendingDelete.kind === 'area' ? areaUsage(pendingDelete.areaId) : subjectUsage(pendingDelete.subjectId);
    const base = pendingDelete.kind === 'area' ? t('settings.deleteAreaConfirm') : t('settings.deleteSubjectConfirm');
    return count > 0 ? `${base} ${t('settings.deleteReferenced', { count })}` : base;
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.kind === 'area') removeArea(pendingDelete.areaId);
    else removeSubject(pendingDelete.areaId, pendingDelete.subjectId);
    setPendingDelete(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.curriculumTitle')}</CardTitle>
        <CardDescription>{t('settings.curriculumDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Antet coloane pentru matricea de arii */}
        <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 px-2" aria-hidden>
          <span className="w-6" />
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('settings.areaNameRo')}
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t('settings.areaNameEn')}
          </span>
          <span className="w-16" />
        </div>
        <ul className="space-y-2">
          {curriculum.areas.map((area) => {
            const expanded = expandedAreaId === area.id;
            return (
              <li key={area.id} className="rounded-lg border">
                <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => setExpandedAreaId(expanded ? null : area.id)}
                    aria-expanded={expanded}
                    aria-label={t('settings.toggleSubjects')}
                    className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <ChevronDown className={cn('h-4 w-4 transition-transform', !expanded && '-rotate-90')} />
                  </button>
                  <Input
                    value={area.nameRo}
                    onChange={(e) => renameArea(area.id, { nameRo: e.target.value })}
                    aria-label={t('settings.areaNameRo')}
                    className="h-8 text-sm"
                  />
                  <Input
                    value={area.nameEn}
                    onChange={(e) => renameArea(area.id, { nameEn: e.target.value })}
                    aria-label={t('settings.areaNameEn')}
                    className="h-8 text-sm"
                  />
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        addSubject(area.id);
                        setExpandedAreaId(area.id);
                      }}
                      aria-label={t('settings.addSubject')}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete({ kind: 'area', areaId: area.id })}
                      aria-label={t('settings.deleteArea')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expanded && (
                  <ul className="space-y-2 border-t p-2">
                    {/* Antet coloane pentru matricea de discipline */}
                    <li className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2 px-2" aria-hidden>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('settings.subjectNameRo')}
                      </span>
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('settings.subjectNameEn')}
                      </span>
                      <span className="w-32 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {t('settings.gradesLabel')}
                      </span>
                      <span className="w-8" />
                    </li>
                    {area.subjects.length === 0 && (
                      <li className="px-1 py-2 text-xs text-muted-foreground">{t('settings.noSubjects')}</li>
                    )}
                    {area.subjects.map((subject) => (
                      <li
                        key={subject.id}
                        className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2 rounded-md border bg-muted/30 p-2"
                      >
                        <Input
                          value={subject.nameRo}
                          onChange={(e) => updateSubject(area.id, subject.id, { nameRo: e.target.value })}
                          aria-label={t('settings.subjectNameRo')}
                          className="h-8 text-sm"
                        />
                        <Input
                          value={subject.nameEn}
                          onChange={(e) => updateSubject(area.id, subject.id, { nameEn: e.target.value })}
                          aria-label={t('settings.subjectNameEn')}
                          className="h-8 text-sm"
                        />
                        <GradesInput
                          grades={subject.grades}
                          onCommit={(grades) => updateSubject(area.id, subject.id, { grades })}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setPendingDelete({ kind: 'subject', areaId: area.id, subjectId: subject.id })}
                          aria-label={t('settings.deleteSubject')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={addArea} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('settings.addArea')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setResetOpen(true)} disabled={!customized} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {t('settings.resetCurriculum')}
          </Button>
        </div>

        {/* Confirmare ștergere arie/disciplină */}
        <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {pendingDelete?.kind === 'subject' ? t('settings.deleteSubjectTitle') : t('settings.deleteAreaTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription>{deleteDescription()}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>{t('common.delete')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmare reset la curriculum-ul implicit */}
        <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('settings.resetCurriculum')}</AlertDialogTitle>
              <AlertDialogDescription>{t('settings.resetCurriculumConfirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  void resetToDefault();
                  setResetOpen(false);
                }}
              >
                {t('common.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
