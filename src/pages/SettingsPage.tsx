import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Download, History, Plus, RotateCcw, Trash2, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSettingsStore } from '@/stores/settings';
import { usePlansStore } from '@/stores/plans';
import { CurriculumEditor } from '@/components/settings/CurriculumEditor';
import { ThemeColorsEditor } from '@/components/settings/ThemeColorsEditor';
import { dbClearAll, dbGetAutoBackups, type AutoBackup } from '@/lib/storage';
import { downloadBlob, formatDateTime } from '@/lib/utils';
import { phaseColorForIndex } from '@/data/phases';
import type { Language } from '@/types';

const COLOR_DOT: Record<string, string> = {
  teal: 'bg-teal-500',
  coral: 'bg-coral-500',
  violet: 'bg-violet-500',
  yellow: 'bg-softyellow-400',
};

export function SettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { settings, patch, addPhase, updatePhase, movePhase, removePhase, resetPhases } = useSettingsStore();
  const { exportBackup, importBackup } = usePlansStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [autoBackups, setAutoBackups] = useState<AutoBackup[]>([]);

  useEffect(() => {
    void dbGetAutoBackups().then(setAutoBackups).catch(() => null);
  }, []);

  const lang: Language = i18n.language === 'en' ? 'en' : 'ro';

  const handleDownloadAutoBackup = (backup: AutoBackup) => {
    void downloadBlob(
      new Blob([JSON.stringify(backup.data, null, 2)], { type: 'application/json' }),
      `plandelectie-autobackup-${backup.createdAt.slice(0, 10)}.json`,
    );
  };

  const flash = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 4000);
  };

  const handleExport = async () => {
    const json = await exportBackup();
    await downloadBlob(new Blob([json], { type: 'application/json' }), `plandelectie-backup-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const count = await importBackup(await file.text());
      flash(t('dashboard.importSuccess', { count }));
    } catch {
      flash(t('dashboard.importError'));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = async () => {
    await dbClearAll();
    window.location.hash = '#/';
    window.location.reload();
  };

  const sortedPhases = [...settings.phases].sort((a, b) => a.order - b.order);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{t('settings.title')}</h1>

      {message && (
        <div className="rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary" role="status">
          {message}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.defaults')}</CardTitle>
          <CardDescription>{t('settings.defaultsDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>{t('settings.language')}</Label>
            <Select
              value={settings.language}
              onValueChange={(v) => {
                patch({ language: v as Language });
                void i18n.changeLanguage(v);
              }}
            >
              <SelectTrigger aria-label={t('settings.language')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ro">Română</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('settings.exportFormat')}</Label>
            <Select value={settings.exportFormat} onValueChange={(v) => patch({ exportFormat: v as 'docx' | 'pdf' })}>
              <SelectTrigger aria-label={t('settings.exportFormat')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="docx">DOCX</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultTeacher">{t('settings.teacherName')}</Label>
            <Input
              id="defaultTeacher"
              value={settings.teacherName}
              onChange={(e) => patch({ teacherName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultSchool">{t('settings.schoolName')}</Label>
            <Input
              id="defaultSchool"
              value={settings.schoolName}
              onChange={(e) => patch({ schoolName: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.accessibility')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="reducedMotion">{t('settings.reducedMotion')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.reducedMotionDesc')}</p>
            </div>
            <Switch
              id="reducedMotion"
              checked={settings.reducedMotion}
              onCheckedChange={(v) => patch({ reducedMotion: v })}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label htmlFor="highContrast">{t('settings.highContrast')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.highContrastDesc')}</p>
            </div>
            <Switch
              id="highContrast"
              checked={settings.highContrast}
              onCheckedChange={(v) => patch({ highContrast: v })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.phasesTitle')}</CardTitle>
          <CardDescription>{t('settings.phasesDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {sortedPhases.map((phase, idx) => {
                const color = phaseColorForIndex(idx);
                return (
                  <motion.li
                    key={phase.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 rounded-lg border p-2"
                  >
                    <span className={`h-3 w-3 rounded-full ${COLOR_DOT[color]}`} aria-hidden />
                    <Input
                      value={phase.titleRo}
                      onChange={(e) => updatePhase(phase.id, { titleRo: e.target.value })}
                      aria-label={t('settings.phaseNameRo')}
                      className="h-8 text-sm"
                    />
                    <Input
                      value={phase.titleEn}
                      onChange={(e) => updatePhase(phase.id, { titleEn: e.target.value })}
                      aria-label={t('settings.phaseNameEn')}
                      className="h-8 text-sm"
                    />
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => movePhase(phase.id, 'up')}
                        disabled={idx === 0}
                        aria-label={t('settings.moveUp')}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => movePhase(phase.id, 'down')}
                        disabled={idx === sortedPhases.length - 1}
                        aria-label={t('settings.moveDown')}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removePhase(phase.id)}
                        aria-label={t('settings.deletePhase')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={addPhase} className="gap-2">
              <Plus className="h-4 w-4" />
              {t('settings.addPhase')}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  {t('settings.resetPhases')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('settings.resetPhases')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('settings.resetPhasesConfirm')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={resetPhases}>{t('common.confirm')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <ThemeColorsEditor />

      <CurriculumEditor />

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.backupTitle')}</CardTitle>
          <CardDescription>{t('settings.backupDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" />
              {t('dashboard.exportData')}
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              {t('dashboard.importData')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => void handleImport(e.target.files?.[0])}
            />
          </div>
          {autoBackups.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <History className="h-3.5 w-3.5" />
                {t('settings.autoBackupsDesc')}
              </p>
              <ul className="space-y-1.5">
                {autoBackups.map((b) => (
                  <li key={b.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <span>
                      {formatDateTime(b.createdAt, lang)} · {b.data.plans.length} {t('nav.dashboard').toLowerCase()}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadAutoBackup(b)} className="gap-1.5">
                      <Download className="h-3.5 w-3.5" />
                      {t('settings.download')}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t('settings.dangerZone')}</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <Trash2 className="h-4 w-4" />
                {t('settings.clearAll')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('settings.clearAllTitle')}</AlertDialogTitle>
                <AlertDialogDescription>{t('settings.clearAllDesc')}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => void handleClearAll()}
                >
                  {t('common.delete')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <div className="pb-4">
        <Button variant="link" onClick={() => navigate('/')}>
          ← {t('nav.dashboard')}
        </Button>
      </div>
    </div>
  );
}
