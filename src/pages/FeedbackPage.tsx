import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Copy, MessageSquareHeart, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/stores/toast';

const FEEDBACK_EMAIL = 'feedback@plandelectie.ro';

type FeedbackType = 'bug' | 'idea' | 'other';

export function FeedbackPage() {
  const { t } = useTranslation();
  const [type, setType] = useState<FeedbackType>('idea');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');

  const isDesktop = '__TAURI_INTERNALS__' in window;

  const buildMailto = (): string => {
    const subject = `[Feedback PlanDeLectie] ${t(`feedback.types.${type}`)}`;
    // footer tehnic invizibil în formular — ajută la depanare
    const stage = __APP_VERSION__.startsWith('0.') ? ' (Beta)' : '';
    const body = [
      message.trim(),
      contact.trim() ? `\n${t('feedback.contactLabel')}: ${contact.trim()}` : '',
      '',
      '—',
      `PlanDeLectie v${__APP_VERSION__}${stage} · ${isDesktop ? 'desktop' : 'web'}`,
    ].join('\n');
    return `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSend = async () => {
    const url = buildMailto();
    if (isDesktop) {
      try {
        // în webview-ul Tauri, mailto: se deschide doar prin handler-ul sistemului
        const { openUrl } = await import('@tauri-apps/plugin-opener');
        await openUrl(url);
      } catch {
        toast.error(t('feedback.openError'));
      }
    } else {
      window.location.href = url;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(FEEDBACK_EMAIL);
      toast.success(t('feedback.copied'));
    } catch {
      toast.error(t('feedback.copyError'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mx-auto max-w-2xl space-y-6"
    >
      <div className="space-y-3 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <MessageSquareHeart className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold">{t('feedback.title')}</h1>
        <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>{t('feedback.intro1')}</p>
          <p>{t('feedback.intro2')}</p>
          <p className="font-medium text-foreground">{t('feedback.intro3')}</p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>{t('feedback.typeLabel')}</Label>
            <Select value={type} onValueChange={(v) => setType(v as FeedbackType)}>
              <SelectTrigger aria-label={t('feedback.typeLabel')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bug">{t('feedback.types.bug')}</SelectItem>
                <SelectItem value="idea">{t('feedback.types.idea')}</SelectItem>
                <SelectItem value="other">{t('feedback.types.other')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-message">{t('feedback.messageLabel')}</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('feedback.messagePlaceholder')}
              rows={5}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-contact">{t('feedback.contactLabel')}</Label>
            <Input
              id="feedback-contact"
              type="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={t('feedback.contactPlaceholder')}
            />
            <p className="text-xs text-muted-foreground">{t('feedback.contactHint')}</p>
          </div>

          <Button onClick={() => void handleSend()} disabled={!message.trim()} size="lg" className="w-full gap-2">
            <Send className="h-4 w-4" />
            {t('feedback.send')}
          </Button>
          <p className="text-center text-xs text-muted-foreground">{t('feedback.sendHint')}</p>
        </CardContent>
      </Card>

      <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
        {t('feedback.fallback')}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">{FEEDBACK_EMAIL}</code>
        <Button variant="ghost" size="sm" onClick={() => void handleCopy()} className="gap-1.5">
          <Copy className="h-3.5 w-3.5" />
          {t('feedback.copy')}
        </Button>
      </p>
    </motion.div>
  );
}
