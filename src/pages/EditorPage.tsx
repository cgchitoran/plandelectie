import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Check, CloudUpload, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WizardShell, WIZARD_STEPS } from '@/components/editor/WizardShell';
import { MetadataStep } from '@/components/editor/MetadataStep';
import { CompetencesStep } from '@/components/editor/CompetencesStep';
import { PhasesStep } from '@/components/editor/PhasesStep';
import { PhaseDetailsStep } from '@/components/editor/PhaseDetailsStep';
import { PlanPreview } from '@/components/editor/PlanPreview';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { VersionsPanel } from '@/components/editor/VersionsPanel';
import { usePlansStore } from '@/stores/plans';
import { useCurriculumStore } from '@/stores/curriculum';
import { getArea, getSubject, areaName, subjectName } from '@/data/curriculum';
import { getIncompleteSteps, getPlanIssues } from '@/lib/validation';
import { toast } from '@/stores/toast';
import type { Language } from '@/types';

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang: Language = i18n.language === 'en' ? 'en' : 'ro';

  const plan = usePlansStore((s) => s.plans.find((p) => p.id === id));
  const { update, save, saving, lastSavedAt } = usePlansStore();

  const [step, setStep] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState('');
  const [includeTeacherNotes, setIncludeTeacherNotes] = useState(true);
  const [includeMaterials, setIncludeMaterials] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const [previewEl, setPreviewEl] = useState<HTMLDivElement | null>(null);
  const curriculum = useCurriculumStore((s) => s.curriculum);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const area = useMemo(() => (curriculum && plan ? getArea(curriculum, plan.metadata.area) : undefined), [curriculum, plan]);
  const subject = useMemo(() => getSubject(area, plan?.metadata.subject ?? ''), [area, plan]);

  if (!plan) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        <Button variant="link" onClick={() => navigate('/')}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  const goTo = (next: number) => {
    const clamped = Math.max(0, Math.min(next, WIZARD_STEPS.length - 1));
    setStep(clamped);
  };

  const handleSave = async (label?: string) => {
    try {
      const v = await save(plan, label);
      setNotice(t('editor.versionSaved', { version: v }));
    } catch {
      toast.error(t('errors.saveFailed'));
    }
  };

  const planIssues = useMemo(() => getPlanIssues(plan), [plan]);
  const incompleteSteps = useMemo(() => getIncompleteSteps(plan), [plan]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} aria-label={t('common.back')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{plan.metadata.title || t('editor.newPlan')}</h1>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CloudUpload className="h-3.5 w-3.5" />
              {saving
                ? t('editor.saving')
                : lastSavedAt
                  ? `${t('editor.saved')} · v${plan.version}`
                  : `${t('editor.saved')} · auto`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <VersionsPanel plan={plan} />
          <Button size="sm" className="gap-2" onClick={() => setSaveDialogOpen(true)} disabled={saving}>
            <Save className="h-4 w-4" />
            {t('editor.saveVersion')}
          </Button>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-4 py-2 text-sm text-primary" role="status">
          <Check className="h-4 w-4" />
          {notice}
        </div>
      )}

      <WizardShell currentStep={step} incompleteSteps={incompleteSteps} onStepClick={goTo}>
        {step === 0 && (
          <MetadataStep
            plan={plan}
            curriculum={curriculum}
            onChange={(metadata) => update({ ...plan, metadata })}
          />
        )}
        {step === 1 && (
          <CompetencesStep plan={plan} curriculum={curriculum} onChange={(competences) => update({ ...plan, competences })} />
        )}
        {step === 2 && <PhasesStep plan={plan} onChange={(phases) => update({ ...plan, phases })} />}
        {step === 3 && <PhaseDetailsStep plan={plan} onChange={(phases) => update({ ...plan, phases })} />}
        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="teacherNotes">{t('editor.preview.teacherNotes')}</Label>
              <Textarea
                id="teacherNotes"
                value={plan.teacherNotes ?? ''}
                onChange={(e) => update({ ...plan, teacherNotes: e.target.value })}
                placeholder={t('editor.preview.teacherNotesPlaceholder')}
                rows={3}
              />
            </div>
            <ExportPanel
              plan={plan}
              subjectName={subjectName(subject, lang)}
              areaName={areaName(area, lang)}
              previewElement={previewEl}
              includeTeacherNotes={includeTeacherNotes}
              includeMaterials={includeMaterials}
              issues={planIssues}
              onGoToStep={goTo}
              onOptionsChange={(opts) => {
                setIncludeTeacherNotes(opts.includeTeacherNotes);
                setIncludeMaterials(opts.includeMaterials);
              }}
            />
            <PlanPreview
              ref={setPreviewEl}
              plan={plan}
              subjectName={subjectName(subject, lang)}
              areaName={areaName(area, lang)}
              includeTeacherNotes={includeTeacherNotes}
              includeMaterials={includeMaterials}
            />
          </div>
        )}
      </WizardShell>

      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline" onClick={() => goTo(step - 1)} disabled={step === 0} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>
        {step < WIZARD_STEPS.length - 1 && (
          <Button onClick={() => goTo(step + 1)} className="gap-2">
            {t('common.next')}
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('editor.saveVersion')}</DialogTitle>
            <DialogDescription>v{plan.version + 1}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="versionLabel">{t('editor.versionLabel')}</Label>
            <Input
              id="versionLabel"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder={t('editor.versionLabelPlaceholder')}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={() => {
                void handleSave(versionLabel);
                setVersionLabel('');
                setSaveDialogOpen(false);
              }}
            >
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
