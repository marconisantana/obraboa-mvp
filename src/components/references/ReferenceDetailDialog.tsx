import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Share2, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Reference } from '@/hooks/useReferences';
import { CATEGORY_LIST } from './CategoryFilter';

interface Props {
  reference: Reference | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateObservation: (id: string, obs: string) => Promise<void>;
  onUpdateCategory: (id: string, cat: string) => Promise<void>;
  onDelete: (ref: Reference) => Promise<void>;
  onRefresh: () => void;
}

export default function ReferenceDetailDialog({
  reference, open, onOpenChange, onUpdateObservation, onUpdateCategory, onDelete, onRefresh,
}: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [obs, setObs] = useState('');
  const [cat, setCat] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reference) {
      setObs(reference.observation ?? '');
      setCat(reference.category);
    }
  }, [reference]);

  if (!reference) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      if (obs !== (reference.observation ?? '')) await onUpdateObservation(reference.id, obs);
      if (cat !== reference.category) await onUpdateCategory(reference.id, cat);
      toast({ title: t('common.success') });
      onRefresh();
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const shareData = { url: reference.image_url, text: reference.observation || '' };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(reference.image_url);
      toast({ title: t('documents.linkCopied') });
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('references.deleteConfirm'))) return;
    try {
      await onDelete(reference);
      toast({ title: t('common.success') });
      onOpenChange(false);
      onRefresh();
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const categories = CATEGORY_LIST.filter(c => c.value);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('references.preview')}</DialogTitle>
        </DialogHeader>

        <img src={reference.image_url} alt="" className="w-full rounded-lg" />

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t('references.category')}</label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.value} value={c.value!}>{t(`references.${c.key}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">{t('references.observation')}</label>
            <Textarea value={obs} onChange={e => setObs(e.target.value)} rows={3} />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {t('common.save')}
            </Button>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 size={16} />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete}>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
