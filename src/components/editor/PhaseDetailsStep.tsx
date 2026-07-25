import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { PhaseCard } from './PhaseCard';
import type { LessonPhase, LessonPlan } from '@/types';

interface PhaseDetailsStepProps {
  plan: LessonPlan;
  onChange: (phases: LessonPhase[]) => void;
}

export function PhaseDetailsStep({ plan, onChange }: PhaseDetailsStepProps) {
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState<string | null>(plan.phases[0]?.id ?? null);

  const sorted = [...plan.phases].sort((a, b) => a.order - b.order);

  const updatePhase = (updated: LessonPhase) => {
    onChange(plan.phases.map((p) => (p.id === updated.id ? updated : p)));
  };

  const removePhase = (id: string) => {
    onChange(plan.phases.filter((p) => p.id !== id).map((p, i) => ({ ...p, order: i })));
  };

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">
        {t('editor.phaseCard.empty')}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {sorted.map((phase, idx) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            index={idx}
            expanded={expandedId === phase.id}
            onToggleExpand={() => setExpandedId(expandedId === phase.id ? null : phase.id)}
            onChange={updatePhase}
            onRemove={() => removePhase(phase.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
