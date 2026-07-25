import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Layers, MoreVertical, Pencil, Copy, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { LessonPlan } from '@/types';
import { formatDate, formatGrade } from '@/lib/utils';

interface PlanCardProps {
  plan: LessonPlan;
  subjectName: string;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PlanCard({ plan, subjectName, onDuplicate, onDelete }: PlanCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = (i18n.language === 'en' ? 'en' : 'ro') as 'ro' | 'en';
  const title = plan.metadata.title || t('editor.newPlan');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group h-full transition-shadow hover:shadow-md">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => navigate(`/plan/${plan.id}/edit`)}
              className="line-clamp-2 text-left font-semibold leading-snug hover:text-primary transition-colors"
            >
              {title}
            </button>
            <AlertDialog>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label="Actions">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/plan/${plan.id}/edit`)}>
                    <Pencil /> {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDuplicate(plan.id)}>
                    <Copy /> {t('common.duplicate')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 /> {t('common.delete')}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuContent>
              </DropdownMenu>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('dashboard.deleteTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('dashboard.deleteDesc', { title })}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => onDelete(plan.id)}
                  >
                    {t('common.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {subjectName && <Badge variant="default">{subjectName}</Badge>}
            {plan.metadata.grade !== '' && <Badge variant="secondary">{formatGrade(plan.metadata.grade, lang)}</Badge>}
            <Badge variant="outline" className="gap-1">
              <Layers className="h-3 w-3" />
              {plan.phases.length} {t('dashboard.phases')}
            </Badge>
          </div>

          <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(plan.metadata.date, lang)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {plan.metadata.durationMinutes} {t('common.minutes')}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
