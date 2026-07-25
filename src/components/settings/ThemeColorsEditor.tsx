import { useTranslation } from 'react-i18next';
import { RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/stores/settings';
import { DEFAULT_THEME_COLORS } from '@/data/defaults';
import type { ThemeColors } from '@/types';

const COLOR_FIELDS: { key: keyof ThemeColors; labelKey: string }[] = [
  { key: 'primary', labelKey: 'settings.colorPrimary' },
  { key: 'accent', labelKey: 'settings.colorAccent' },
  { key: 'secondary', labelKey: 'settings.colorSecondary' },
  { key: 'background', labelKey: 'settings.colorBackground' },
  { key: 'card', labelKey: 'settings.colorCard' },
  { key: 'foreground', labelKey: 'settings.colorForeground' },
];

/** Cele 6 controale majore de culoare — restul nuanțelor se derivează automat */
export function ThemeColorsEditor() {
  const { t } = useTranslation();
  const { settings, patch } = useSettingsStore();
  const colors = settings.themeColors;

  const setColor = (key: keyof ThemeColors, value: string) => {
    patch({ themeColors: { ...colors, [key]: value } });
  };

  const isDefault = COLOR_FIELDS.every((f) => colors[f.key].toLowerCase() === DEFAULT_THEME_COLORS[f.key].toLowerCase());

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.themeColorsTitle')}</CardTitle>
        <CardDescription>{t('settings.themeColorsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="grid gap-3 sm:grid-cols-2">
          {COLOR_FIELDS.map(({ key, labelKey }) => (
            <li key={key} className="flex items-center gap-3 rounded-lg border p-2.5">
              <input
                type="color"
                value={colors[key]}
                onChange={(e) => setColor(key, e.target.value)}
                aria-label={t(labelKey)}
                className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-transparent p-0.5"
              />
              <span className="flex-1 text-sm font-medium">{t(labelKey)}</span>
              <span className="font-mono text-xs uppercase text-muted-foreground">{colors[key]}</span>
            </li>
          ))}
        </ul>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          disabled={isDefault}
          onClick={() => patch({ themeColors: DEFAULT_THEME_COLORS })}
        >
          <RotateCcw className="h-4 w-4" />
          {t('settings.resetThemeColors')}
        </Button>
      </CardContent>
    </Card>
  );
}
