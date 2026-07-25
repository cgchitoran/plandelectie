import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ValidatableStep } from '@/lib/validation';

export const WIZARD_STEPS = ['metadata', 'competences', 'phases', 'details', 'preview'] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

const VALIDATABLE_STEPS: readonly WizardStep[] = ['metadata', 'competences', 'phases', 'details'];

interface WizardShellProps {
  currentStep: number;
  /** Etapele cu elemente esențiale lipsă — marcate discret, permanent */
  incompleteSteps: ReadonlySet<ValidatableStep>;
  onStepClick: (index: number) => void;
  children: React.ReactNode;
}

/** Cadru wizard: toate etapele accesibile oricând + progres = grad de completare */
export function WizardShell({ currentStep, incompleteSteps, onStepClick, children }: WizardShellProps) {
  const { t } = useTranslation();
  const progress = ((VALIDATABLE_STEPS.length - incompleteSteps.size) / VALIDATABLE_STEPS.length) * 100;

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <ol className="flex flex-wrap items-center gap-1 sm:gap-2">
          {WIZARD_STEPS.map((step, idx) => {
            const isActive = idx === currentStep;
            const isValidatable = (VALIDATABLE_STEPS as readonly string[]).includes(step);
            const isIncomplete = isValidatable && incompleteSteps.has(step as ValidatableStep);
            const isComplete = isValidatable && !isIncomplete;
            return (
              <li key={step} className="flex items-center">
                <button
                  type="button"
                  onClick={() => onStepClick(idx)}
                  aria-current={isActive ? 'step' : undefined}
                  title={isIncomplete ? t('editor.validation.stepIncomplete') : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all sm:text-sm',
                    isActive && 'bg-primary text-primary-foreground shadow',
                    !isActive && isComplete && 'bg-primary/15 text-primary hover:bg-primary/25',
                    !isActive && !isComplete && 'bg-muted text-muted-foreground hover:bg-muted/70',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                      isActive && 'bg-primary-foreground/20',
                      !isActive && isComplete && 'bg-primary text-primary-foreground',
                      !isActive && !isComplete && 'bg-foreground/10',
                    )}
                  >
                    {isComplete && !isActive ? <Check className="h-3 w-3" /> : idx + 1}
                  </span>
                  <span className="hidden md:inline">{t(`editor.steps.${step}`)}</span>
                  {isIncomplete && !isActive && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
                      role="img"
                      aria-label={t('editor.validation.stepIncomplete')}
                    />
                  )}
                </button>
                {idx < WIZARD_STEPS.length - 1 && <span className="mx-1 hidden h-px w-4 bg-border sm:block" aria-hidden />}
              </li>
            );
          })}
        </ol>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-violet-500"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          />
        </div>
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
