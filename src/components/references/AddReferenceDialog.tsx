import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CATEGORY_LIST } from './CategoryFilter';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFromUpload: (file: File, category: string, observation: string) => Promise<void>;
  onCreateFromUrl: (url: string, category: string, observation: string) => Promise<void>;
}

export default function AddReferenceDialog({ open, onOpenChange, onCreateFromUpload, onCreateFromUrl }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [tab, setTab] = useState('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [urlValid, setUrlValid] = useState<boolean | null>(null);
  const [category, setCategory] = useState('outros');
  const [observation, setObservation] = useState('');
  const [saving, setSaving] = useState(false);

  const categories = CATEGORY_LIST.filter(c => c.value);

  const reset = () => {
    setFile(null); setPreview(null); setUrl(''); setUrlValid(null);
    setCategory('outros'); setObservation(''); setTab('upload');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    const { compressImage } = await import('@/lib/compressImage');
    const f = await compressImage(raw);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUrlPreview = () => {
    if (!url) return;
    const img = new Image();
    img.onload = () => setUrlValid(true);
    img.onerror = () => { setUrlValid(false); toast({ title: t('references.invalidUrl'), variant: 'destructive' }); };
    img.src = url;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (tab === 'upload' && file) {
        await onCreateFromUpload(file, category, observation);
      } else if (tab === 'url' && url && urlValid) {
        await onCreateFromUrl(url, category, observation);
      } else {
        setSaving(false);
        return;
      }
      toast({ title: t('common.success') });
      reset();
      onOpenChange(false);
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('references.new')}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1 gap-1"><Upload size={14} />{t('references.uploadImage')}</TabsTrigger>
            <TabsTrigger value="url" className="flex-1 gap-1"><Link size={14} />{t('references.addFromUrl')}</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-3 mt-3">
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && <img src={preview} alt="" className="w-full rounded-lg max-h-48 object-cover" />}
          </TabsContent>

          <TabsContent value="url" className="space-y-3 mt-3">
            <div className="flex gap-2">
              <Input placeholder="https://..." value={url} onChange={e => { setUrl(e.target.value); setUrlValid(null); }} className="flex-1" />
              <Button variant="outline" onClick={handleUrlPreview} type="button">{t('references.preview')}</Button>
            </div>
            {urlValid === true && <img src={url} alt="" className="w-full rounded-lg max-h-48 object-cover" />}
            {urlValid === false && <p className="text-xs text-destructive">{t('references.invalidUrl')}</p>}
          </TabsContent>
        </Tabs>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t('references.category')}</label>
            <Select value={category} onValueChange={setCategory}>
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
            <Textarea value={observation} onChange={e => setObservation(e.target.value)} rows={2} />
          </div>

          <Button onClick={handleSave} disabled={saving || (tab === 'upload' ? !file : !urlValid)} className="w-full">
            {t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
