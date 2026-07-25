import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToastStore, type ToastKind } from '@/stores/toast';
import { cn } from '@/lib/utils';

const ICONS: Record<ToastKind, typeof Info> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

const ACCENT: Record<ToastKind, string> = {
  error: 'border-destructive/60 text-destructive',
  success: 'border-primary/60 text-primary',
  info: 'border-border text-foreground',
};

/** Regiunea globală de notificări — montată o singură dată în App */
export function Toaster() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div
      aria-live="polite"
      role="status"
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const Icon = ICONS[t.kind];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className={cn('pointer-events-auto flex items-start gap-2.5 rounded-lg border bg-card p-3 shadow-lg', ACCENT[t.kind])}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p className="flex-1 text-sm text-card-foreground">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="×"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
