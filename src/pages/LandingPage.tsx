import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlansStore } from '@/stores/plans';
import { useSettingsStore } from '@/stores/settings';

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Pagina de pornire — afișată doar utilizatorilor fără niciun proiect */
export function LandingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const settings = useSettingsStore((s) => s.settings);
  const create = usePlansStore((s) => s.create);
  const add = usePlansStore((s) => s.add);

  const handleNewPlan = async () => {
    const plan = create(settings);
    await add(plan);
    navigate(`/plan/${plan.id}/edit`);
  };

  const subtitleWords = t('home.subtitle').split(' ');

  return (
    <div className="relative flex min-h-[calc(100vh-3rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Accente decorative de fundal */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-96 w-96 -translate-x-[70%] animate-float rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-[28rem] w-[28rem] translate-x-[10%] rounded-full bg-violet-500/15 blur-3xl" />
        <div className="absolute right-[8%] top-[15%] h-48 w-48 animate-float rounded-full bg-accent/10 blur-3xl" style={{ animationDelay: '-1.5s' }} />
      </div>

      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
        className="mb-6 rounded-full border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur"
      >
        {t('app.tagline')}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.1 }}
        className="hero-title max-w-5xl text-6xl font-extrabold tracking-tight sm:text-7xl lg:text-8xl"
      >
        PlanDeLectie.ro
      </motion.h1>

      <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl" aria-label={t('home.subtitle')}>
        {subtitleWords.map((word, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.55 + i * 0.08 }}
          >
            {word}
            {i < subtitleWords.length - 1 ? ' ' : ''}
          </motion.span>
        ))}
      </p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT, delay: 1.15 }}
      >
        <Button size="lg" onClick={handleNewPlan} className="mt-10 gap-2 px-8 py-6 text-base shadow-lg shadow-primary/25">
          <Plus className="h-5 w-5" />
          {t('nav.newPlan')}
        </Button>
      </motion.div>
    </div>
  );
}
