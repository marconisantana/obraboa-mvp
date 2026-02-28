import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore, type Project, type ProjectStatus } from '@/stores/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ImagePlus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const PROJECT_TYPES = ['residencial', 'comercial', 'reforma', 'flip'] as const;

interface CreateProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const setProjects = useAppStore((s) => s.setProjects);
  const projects = useAppStore((s) => s.projects);
  const setActiveProject = useAppStore((s) => s.setActiveProject);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState('');
  const [type, setType] = useState<string>('residencial');
  const [address, setAddress] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const typeKeys = ['residencial', 'comercial', 'reforma', 'flip'] as const;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    const { compressImage } = await import('@/lib/compressImage');
    const file = await compressImage(rawFile);
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setName('');
    setNameError('');
    setType('residencial');
    setAddress('');
    setStartDate(undefined);
    setEndDate(undefined);
    setCoverFile(null);
    setCoverPreview(null);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!name.trim()) {
      setNameError(t('auth.nameRequired'));
      return;
    }
    setNameError('');
    setSaving(true);

    try {
      let coverUrl: string | null = null;

      // Upload cover image if provided
      if (coverFile && user) {
        const ext = coverFile.name.split('.').pop();
        const path = `covers/${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('project-documents')
          .upload(path, coverFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from('project-documents')
          .getPublicUrl(path);
        coverUrl = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: name.trim(),
          type,
          address: address.trim() || null,
          start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null,
          cover_image_url: coverUrl,
          owner_id: user!.id,
          status: 'planning' as ProjectStatus,
        })
        .select()
        .single();

      if (error) throw error;

      const newProject = data as Project;
      setProjects([newProject, ...projects]);
      setActiveProject(newProject);
      resetForm();
      onOpenChange(false);
      toast({ title: t('common.success') });
      navigate(`/projects/${newProject.id}`);
    } catch (err: any) {
      toast({ title: t('common.error'), description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    resetForm();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t('projects.new')}</DrawerTitle>
        </DrawerHeader>
        <div className="space-y-4 px-4 max-h-[60vh] overflow-y-auto">
          {/* Name */}
          <div className="space-y-2">
            <Label>{t('projects.name')} *</Label>
            <Input
              value={name}
              onChange={(e) => { setName(e.target.value); if (e.target.value.trim()) setNameError(''); }}
              className={nameError ? 'border-destructive' : ''}
            />
            {nameError && <p className="text-sm text-destructive">{nameError}</p>}
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>{t('projects.type')}</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {typeKeys.map((tk) => (
                  <SelectItem key={tk} value={tk}>{t(`projects.${tk}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label>{t('projects.address')}</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('projects.startDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : '—'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>{t('projects.endDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !endDate && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : '—'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>{t('projects.coverImage') || 'Foto de capa'}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {coverPreview ? (
              <div className="relative rounded-lg overflow-hidden">
                <img src={coverPreview} alt="Cover" className="w-full h-32 object-cover rounded-lg" />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute bottom-2 right-2"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                >
                  {t('common.edit')}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-24 border-dashed flex flex-col gap-1"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              >
                <ImagePlus size={20} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{t('projects.coverImage') || 'Foto de capa'}</span>
              </Button>
            )}
          </div>
        </div>

        <DrawerFooter>
          <Button
            onClick={handleSave}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            disabled={saving}
          >
            {saving && <Loader2 size={16} className="mr-2 animate-spin" />}
            {saving ? t('common.loading') : (t('projects.createProject') || 'Criar Obra')}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
