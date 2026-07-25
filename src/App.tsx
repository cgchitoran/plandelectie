import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AppShell } from '@/components/layout/AppShell';
import { Toaster } from '@/components/ui/toaster';
import { DashboardPage } from '@/pages/DashboardPage';
import { EditorPage } from '@/pages/EditorPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { LandingPage } from '@/pages/LandingPage';
import { useSettingsStore } from '@/stores/settings';
import { usePlansStore } from '@/stores/plans';
import { useCurriculumStore } from '@/stores/curriculum';
import { applyThemeColors } from '@/lib/theme';
import { maybeAutoBackup } from '@/lib/backup';

/** „/” arată landing-ul utilizatorilor noi, dashboard-ul celor cu proiecte */
function HomeRoute() {
  const hasPlans = usePlansStore((s) => s.plans.length > 0);
  return hasPlans ? <DashboardPage /> : <LandingPage />;
}

export default function App() {
  const { t } = useTranslation();
  const settingsLoaded = useSettingsStore((s) => s.loaded);
  const plansLoaded = usePlansStore((s) => s.loaded);
  const reducedMotion = useSettingsStore((s) => s.settings.reducedMotion);
  const highContrast = useSettingsStore((s) => s.settings.highContrast);
  const themeColors = useSettingsStore((s) => s.settings.themeColors);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      useSettingsStore.getState().load(),
      usePlansStore.getState().load(),
      useCurriculumStore.getState().load(),
    ]).finally(() => {
      if (!cancelled) setReady(true);
    });
    void maybeAutoBackup();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  // Culorile personalizate ale temei; high-contrast are prioritate și le suprascrie
  useEffect(() => {
    applyThemeColors(highContrast ? null : themeColors);
  }, [themeColors, highContrast]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
  }, [reducedMotion]);

  if (!ready || !settingsLoaded || !plansLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden />
          <span className="text-sm">{t('common.loading')}</span>
        </div>
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion={reducedMotion ? 'always' : 'user'}>
      <HashRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/plan/:id/edit" element={<EditorPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </AppShell>
        <Toaster />
      </HashRouter>
    </MotionConfig>
  );
}
