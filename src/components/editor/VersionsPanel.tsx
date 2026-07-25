import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { History, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription as AlertDesc, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { LessonPlan, PlanVersion, Language } from '@/types';
import { usePlansStore } from '@/stores/plans';
import { formatDateTime } from '@/lib/utils';

interface VersionsPanelProps {
  plan: LessonPlan;
}

export function VersionsPanel({ plan }: VersionsPanelProps) {
  const { t, i18n } = useTranslation();
  const lang: Language = i18n.language === 'en' ? 'en' : 'ro';
  const { getVersions, restoreVersion } = usePlansStore();
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<PlanVersion[]>([]);

  useEffect(() => {
    if (open) {
      void getVersions(plan.id).then(setVersions);
    }
  }, [open, plan.id, plan.version, getVersions]);

  const handleRestore = async (version: PlanVersion) => {
    await restoreVersion(plan.id, version);
    setVersions(await getVersions(plan.id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <History className="h-4 w-4" />
          {t('editor.history')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editor.versions.title')}</DialogTitle>
          <DialogDescription>
            v{plan.version} · {plan.metadata.title || t('editor.newPlan')}
          </DialogDescription>
        </DialogHeader>
        {versions.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t('editor.versions.empty')}</p>
        ) : (
          <ul className="space-y-2">
            {versions.map((v) => {
              const isCurrent = v.versionNumber === plan.version;
              return (
                <li key={v.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      v{v.versionNumber}
                      {isCurrent && <Badge variant="default">{t('editor.versions.current')}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateTime(v.createdAt, lang)}
                      {v.label && ` · ${v.label}`}
                    </div>
                  </div>
                  {!isCurrent && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1.5">
                          <RotateCcw className="h-3.5 w-3.5" />
                          {t('editor.versions.restore')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t('editor.versions.restoreTitle', { version: v.versionNumber })}</AlertDialogTitle>
                          <AlertDesc>{t('editor.versions.restoreDesc', { version: v.versionNumber })}</AlertDesc>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => void handleRestore(v)}>
                            {t('editor.versions.restore')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
