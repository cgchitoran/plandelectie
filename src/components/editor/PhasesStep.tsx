import { useTranslation } from 'react-i18next';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { GripVertical, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { LessonPhase, LessonPlan, Language } from '@/types';
import { useSettingsStore } from '@/stores/settings';
import { DEFAULT_PHASES, phaseColorForIndex, type PhaseColor } from '@/data/phases';
import { uid, cn } from '@/lib/utils';

const COLOR_CLASSES: Record<PhaseColor, string> = {
  teal: 'bg-teal-500',
  coral: 'bg-coral-500',
  violet: 'bg-violet-500',
  yellow: 'bg-softyellow-400',
};

function colorForPhase(phaseKey: string, order: number): PhaseColor {
  const def = DEFAULT_PHASES.find((p) => p.key === phaseKey);
  return def?.color ?? phaseColorForIndex(order);
}

interface SortablePhaseRowProps {
  phase: LessonPhase;
  lang: Language;
  onRemove: (id: string) => void;
}

function SortablePhaseRow({ phase, lang, onRemove }: SortablePhaseRowProps) {
  const { t } = useTranslation();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: phase.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-card p-3',
        isDragging && 'z-10 shadow-lg ring-2 ring-primary',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
        aria-label="Reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className={cn('h-3 w-3 rounded-full', COLOR_CLASSES[colorForPhase(phase.phaseKey, phase.order)])} aria-hidden />
      <span className="flex-1 text-sm font-medium">{lang === 'en' ? phase.titleEn : phase.titleRo}</span>
      <Badge variant="outline">{phase.durationMinutes} {t('common.minutes')}</Badge>
      <Checkbox
        checked
        onCheckedChange={() => onRemove(phase.id)}
        aria-label={t('editor.phaseCard.removePhase')}
      />
    </li>
  );
}

interface PhasesStepProps {
  plan: LessonPlan;
  onChange: (phases: LessonPhase[]) => void;
}

export function PhasesStep({ plan, onChange }: PhasesStepProps) {
  const { t, i18n } = useTranslation();
  const lang: Language = i18n.language === 'en' ? 'en' : 'ro';
  const phaseDefs = useSettingsStore((s) => s.settings.phases);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const sortedPhases = [...plan.phases].sort((a, b) => a.order - b.order);
  const selectedKeys = new Set(plan.phases.map((p) => p.phaseKey));

  const togglePhase = (defId: string, titleRo: string, titleEn: string) => {
    if (selectedKeys.has(defId)) {
      onChange(plan.phases.filter((p) => p.phaseKey !== defId).map((p, i) => ({ ...p, order: i })));
    } else {
      const def = DEFAULT_PHASES.find((p) => p.key === defId);
      const newPhase: LessonPhase = {
        id: uid(),
        order: plan.phases.length,
        phaseKey: defId,
        titleRo,
        titleEn,
        durationMinutes: def?.defaultDuration ?? 5,
        objectives: [],
        methods: [],
        materials: [],
        observationTechniques: [],
        teacherActivity: '',
        studentActivity: '',
      };
      onChange([...plan.phases, newPhase]);
    }
  };

  const removePhase = (id: string) => {
    onChange(plan.phases.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sortedPhases.findIndex((p) => p.id === active.id);
    const newIndex = sortedPhases.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(sortedPhases, oldIndex, newIndex).map((p, i) => ({ ...p, order: i }));
    onChange(reordered);
  };

  const availableDefs = [...phaseDefs].sort((a, b) => a.order - b.order);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>{t('editor.phases.title')}</CardTitle>
          <CardDescription>{t('editor.phases.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {availableDefs.map((def) => {
              const checked = selectedKeys.has(def.id);
              const idx = availableDefs.indexOf(def);
              const color = DEFAULT_PHASES.find((p) => p.key === def.id)?.color ?? phaseColorForIndex(idx);
              return (
                <li key={def.id}>
                  <label
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                      checked ? 'border-primary bg-primary/5' : 'hover:bg-muted',
                    )}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => togglePhase(def.id, def.titleRo, def.titleEn)} />
                    <span className={cn('h-3 w-3 rounded-full', COLOR_CLASSES[color])} aria-hidden />
                    <span className="text-sm">{lang === 'en' ? def.titleEn : def.titleRo}</span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Settings2 className="h-3.5 w-3.5" />
            {t('editor.phases.manageInSettings')} → <Link to="/settings" className="text-primary underline">Setări</Link>
          </p>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {t('editor.phases.selected', { count: plan.phases.length })}
          </CardTitle>
          {plan.phases.length === 0 && <CardDescription>{t('editor.phases.none')}</CardDescription>}
        </CardHeader>
        <CardContent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
            <SortableContext items={sortedPhases.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <ul className="space-y-2">
                {sortedPhases.map((phase) => (
                  <SortablePhaseRow key={phase.id} phase={phase} lang={lang} onRemove={removePhase} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </CardContent>
      </Card>
    </div>
  );
}
