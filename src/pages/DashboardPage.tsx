import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, Plus, Search, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlanCard } from '@/components/dashboard/PlanCard';
import { usePlansStore } from '@/stores/plans';
import { useSettingsStore } from '@/stores/settings';
import { useCurriculumStore } from '@/stores/curriculum';
import { allSubjects } from '@/data/curriculum';
import { GRADES } from '@/data/defaults';
import { formatGrade, downloadBlob } from '@/lib/utils';

export function DashboardPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = (i18n.language === 'en' ? 'en' : 'ro') as 'ro' | 'en';

  const { plans, create, add, duplicate, remove, exportBackup, importBackup } = usePlansStore();
  const settings = useSettingsStore((s) => s.settings);
  const curriculum = useCurriculumStore((s) => s.curriculum);

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const subjects = useMemo(() => (curriculum ? allSubjects(curriculum) : []), [curriculum]);
  const subjectNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of subjects) map.set(s.id, lang === 'en' ? s.nameEn : s.nameRo);
    return map;
  }, [subjects, lang]);

  const filtered = useMemo(() => {
    let list = [...plans];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.metadata.title.toLowerCase().includes(q));
    if (gradeFilter !== 'all') list = list.filter((p) => p.metadata.grade === gradeFilter);
    if (subjectFilter !== 'all') list = list.filter((p) => p.metadata.subject === subjectFilter);
    switch (sort) {
      case 'oldest':
        list.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
        break;
      case 'title':
        list.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title, 'ro'));
        break;
      default:
        list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return list;
  }, [plans, search, gradeFilter, subjectFilter, sort]);

  const handleCreate = async () => {
    const plan = create(settings);
    await add(plan);
    navigate(`/plan/${plan.id}/edit`);
  };

  const handleExportBackup = async () => {
    const json = await exportBackup();
    await downloadBlob(new Blob([json], { type: 'application/json' }), `plandelectie-backup-${new Date().toISOString().slice(0, 10)}.json`);
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const text = await file.text();
      const count = await importBackup(text);
      setMessage(t('dashboard.importSuccess', { count }));
    } catch {
      setMessage(t('dashboard.importError'));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportBackup} className="gap-2">
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
            onChange={(e) => void handleImportFile(e.target.files?.[0])}
          />
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('nav.newPlan')}
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary" role="status">
          {message}
        </div>
      )}

      {plans.length === 0 ? null : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('dashboard.searchPlaceholder')}
                className="pl-9"
                aria-label={t('common.search')}
              />
            </div>
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
              <SelectTrigger aria-label={t('dashboard.filterGrade')}>
                <SelectValue placeholder={t('dashboard.filterGrade')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {GRADES.map((g) => (
                  <SelectItem key={g} value={String(g)}>
                    {formatGrade(String(g), lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger aria-label={t('dashboard.filterSubject')}>
                <SelectValue placeholder={t('dashboard.filterSubject')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {lang === 'en' ? s.nameEn : s.nameRo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger aria-label="Sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">{t('dashboard.sortRecent')}</SelectItem>
                <SelectItem value="oldest">{t('dashboard.sortOldest')}</SelectItem>
                <SelectItem value="title">{t('dashboard.sortTitle')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">{t('dashboard.noResults')}</p>
          ) : (
            <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    subjectName={subjectNameById.get(plan.metadata.subject) ?? ''}
                    onDuplicate={(id) => void duplicate(id)}
                    onDelete={(id) => void remove(id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
