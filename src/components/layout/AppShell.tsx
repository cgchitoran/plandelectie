import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, PanelLeftClose, PanelLeftOpen, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSettingsStore } from '@/stores/settings';
import { usePlansStore } from '@/stores/plans';
import { cn } from '@/lib/utils';
import type { Language } from '@/types';

/** Sub 768px sidebar-ul rămâne forțat restrâns (doar iconițe) */
function useForcedCollapsed() {
  const [narrow, setNarrow] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { settings, patch } = useSettingsStore();
  const create = usePlansStore((s) => s.create);
  const add = usePlansStore((s) => s.add);

  const forcedCollapsed = useForcedCollapsed();
  const collapsed = forcedCollapsed || settings.sidebarCollapsed;

  const handleNewPlan = async () => {
    const plan = create(settings);
    await add(plan);
    navigate(`/plan/${plan.id}/edit`);
  };

  const handleLanguageChange = (lang: Language) => {
    patch({ language: lang });
    void i18n.changeLanguage(lang);
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      collapsed && 'justify-center px-0',
      isActive ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    );

  /** Înfășoară în tooltip doar când sidebar-ul e restrâns */
  const withTip = (label: string, node: React.ReactNode) =>
    collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>{node}</TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    ) : (
      <>{node}</>
    );

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex min-h-screen">
        <aside
          className={cn(
            'sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r bg-card transition-[width] duration-200 ease-in-out',
            collapsed ? 'w-16' : 'w-60',
          )}
          aria-label={t('nav.menu')}
        >
          {/* Logo */}
          <div className={cn('flex h-16 items-center border-b px-4', collapsed && 'justify-center px-0')}>
            <NavLink
              to="/"
              className="flex items-center gap-2.5 rounded-md font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t('app.name')}
            >
              <Logo className="h-9 w-9 shrink-0 rounded-xl" />
              {!collapsed && <span className="whitespace-nowrap">{t('app.name')}</span>}
            </NavLink>
          </div>

          {/* Navigație principală */}
          <nav className="flex flex-1 flex-col gap-1.5 p-3" aria-label={t('nav.menu')}>
            {withTip(
              t('nav.newPlan'),
              <Button
                onClick={handleNewPlan}
                className={cn('gap-3', collapsed ? 'h-11 w-11 justify-center self-center p-0' : 'justify-start px-3')}
                aria-label={t('nav.newPlan')}
              >
                <Plus className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{t('nav.newPlan')}</span>}
              </Button>,
            )}

            <div className="my-2 border-t" aria-hidden />

            {withTip(
              t('nav.dashboard'),
              <NavLink to="/" end className={navLinkClass} aria-label={t('nav.dashboard')}>
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{t('nav.dashboard')}</span>}
              </NavLink>,
            )}
            {withTip(
              t('nav.settings'),
              <NavLink to="/settings" className={navLinkClass} aria-label={t('nav.settings')}>
                <Settings className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{t('nav.settings')}</span>}
              </NavLink>,
            )}
          </nav>

          {/* Zona de jos: limbă + comutare lățime */}
          <div className={cn('flex flex-col gap-2 border-t p-3', collapsed && 'items-center')}>
            {!collapsed && (
              <span className="px-1 text-[11px] text-muted-foreground">PlanDeLectie · local-first</span>
            )}
            {collapsed ? (
              withTip(
                t('settings.language'),
                <button
                  type="button"
                  onClick={() => handleLanguageChange(settings.language === 'ro' ? 'en' : 'ro')}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t('settings.language')}
                >
                  {settings.language.toUpperCase()}
                </button>,
              )
            ) : (
              <Select value={settings.language} onValueChange={(v) => handleLanguageChange(v as Language)}>
                <SelectTrigger aria-label={t('settings.language')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ro">Română</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            )}
            {!forcedCollapsed &&
              withTip(
                collapsed ? t('nav.expand') : t('nav.collapse'),
                <button
                  type="button"
                  onClick={() => patch({ sidebarCollapsed: !settings.sidebarCollapsed })}
                  aria-expanded={!collapsed}
                  aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
                  className={cn(
                    'flex h-9 items-center gap-3 rounded-lg px-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    collapsed && 'w-9 justify-center px-0',
                  )}
                >
                  {collapsed ? <PanelLeftOpen className="h-4 w-4 shrink-0" /> : <PanelLeftClose className="h-4 w-4 shrink-0" />}
                  {!collapsed && <span className="text-sm">{t('nav.collapse')}</span>}
                </button>,
              )}
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </TooltipProvider>
  );
}
