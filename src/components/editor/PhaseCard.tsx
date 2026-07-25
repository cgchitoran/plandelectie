import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ChevronDown, Sparkles, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/tag-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { LessonPhase, Language } from '@/types';
import { MATERIAL_SUGGESTIONS, METHOD_SUGGESTIONS, OBSERVATION_SUGGESTIONS } from '@/data/defaults';
import { DEFAULT_PHASES, phaseColorForIndex, type PhaseColor } from '@/data/phases';
import { getPhaseMissing } from '@/lib/validation';
import { cn } from '@/lib/utils';

const HEADER_CLASSES: Record<PhaseColor, string> = {
  teal: 'bg-teal-500/15 border-teal-500 text-teal-200',
  coral: 'bg-coral-500/15 border-coral-500 text-coral-200',
  violet: 'bg-violet-500/15 border-violet-500 text-violet-200',
  yellow: 'bg-softyellow-400/15 border-softyellow-400 text-softyellow-200',
};

const DOT_CLASSES: Record<PhaseColor, string> = {
  teal: 'bg-teal-500',
  coral: 'bg-coral-500',
  violet: 'bg-violet-500',
  yellow: 'bg-softyellow-400',
};

export function colorForPhaseKey(phaseKey: string, order: number): PhaseColor {
  const def = DEFAULT_PHASES.find((p) => p.key === phaseKey);
  return def?.color ?? phaseColorForIndex(order);
}

interface PhaseCardProps {
  phase: LessonPhase;
  index: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onChange: (phase: LessonPhase) => void;
  onRemove: () => void;
}

export function PhaseCard({ phase, index, expanded, onToggleExpand, onChange, onRemove }: PhaseCardProps) {
  const { t, i18n } = useTranslation();
  const lang: Language = i18n.language === 'en' ? 'en' : 'ro';
  const color = colorForPhaseKey(phase.phaseKey, index);
  const missing = getPhaseMissing(phase);
  const missingLabels = missing.map((k) => t(`editor.phaseCard.${k}`)).join(', ');

  const patch = (partial: Partial<LessonPhase>) => onChange({ ...phase, ...partial });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div
        className={cn('flex cursor-pointer items-center gap-3 border-l-4 p-4', HEADER_CLASSES[color])}
        onClick={onToggleExpand}
        role="button"
        aria-expanded={expanded}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
      >
        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white', DOT_CLASSES[color])}>
          {index + 1}
        </span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold">{lang === 'en' ? phase.titleEn : phase.titleRo}</h3>
        </div>
        {missing.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex shrink-0 cursor-help items-center text-amber-500"
                  role="img"
                  aria-label={t('editor.validation.phaseIncomplete', { items: missingLabels })}
                >
                  <AlertCircle className="h-4 w-4" />
                </span>
              </TooltipTrigger>
              <TooltipContent>{t('editor.validation.phaseIncomplete', { items: missingLabels })}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Label htmlFor={`dur-${phase.id}`} className="sr-only">
            {t('editor.phaseCard.duration')}
          </Label>
          <Input
            id={`dur-${phase.id}`}
            type="number"
            min={0}
            max={600}
            value={phase.durationMinutes}
            onChange={(e) => patch({ durationMinutes: Math.max(0, Number(e.target.value) || 0) })}
            className="h-8 w-20 bg-background/80 text-xs"
            aria-label={t('editor.phaseCard.duration')}
          />
          <span className="text-xs">{t('common.minutes')}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={onRemove}
                  className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label={t('editor.phaseCard.removePhase')}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t('editor.phaseCard.removePhase')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', expanded && 'rotate-180')} aria-hidden />
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="grid gap-4 p-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('editor.phaseCard.objectives')}</Label>
                <TagInput
                  value={phase.objectives}
                  onChange={(objectives) => patch({ objectives })}
                  placeholder={t('editor.phaseCard.addItem')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('editor.phaseCard.methods')}</Label>
                <TagInput
                  value={phase.methods}
                  onChange={(methods) => patch({ methods })}
                  suggestions={METHOD_SUGGESTIONS}
                  suggestionsLabel={t('editor.phaseCard.suggestions')}
                  placeholder={t('editor.phaseCard.addItem')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('editor.phaseCard.materials')}</Label>
                <TagInput
                  value={phase.materials}
                  onChange={(materials) => patch({ materials })}
                  suggestions={MATERIAL_SUGGESTIONS}
                  suggestionsLabel={t('editor.phaseCard.suggestions')}
                  placeholder={t('editor.phaseCard.addItem')}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('editor.phaseCard.observation')}</Label>
                <TagInput
                  value={phase.observationTechniques}
                  onChange={(observationTechniques) => patch({ observationTechniques })}
                  suggestions={OBSERVATION_SUGGESTIONS}
                  suggestionsLabel={t('editor.phaseCard.suggestions')}
                  placeholder={t('editor.phaseCard.addItem')}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`ta-${phase.id}`}>{t('editor.phaseCard.teacherActivity')}</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex cursor-not-allowed items-center gap-1 text-xs text-muted-foreground">
                          <Sparkles className="h-3.5 w-3.5" />
                          AI
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>{t('ai.comingSoon')}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Textarea
                  id={`ta-${phase.id}`}
                  value={phase.teacherActivity}
                  onChange={(e) => patch({ teacherActivity: e.target.value })}
                  placeholder={t('editor.phaseCard.teacherActivityPlaceholder')}
                  rows={4}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={`sa-${phase.id}`}>{t('editor.phaseCard.studentActivity')}</Label>
                <Textarea
                  id={`sa-${phase.id}`}
                  value={phase.studentActivity}
                  onChange={(e) => patch({ studentActivity: e.target.value })}
                  placeholder={t('editor.phaseCard.studentActivityPlaceholder')}
                  rows={4}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
