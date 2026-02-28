import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { compressImage } from '@/lib/compressImage';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus, Trash2, ImagePlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose,
} from '@/components/ui/drawer';
import { useToast } from '@/hooks/use-toast';
import { useRdos } from '@/hooks/useRdos';
import { useAppStore } from '@/stores/useAppStore';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TeamMemberInput {
  name: string;
  role: string;
  hours_worked: number;
}

interface PhotoInput {
  file: File;
  caption: string;
  preview: string;
}

interface RdoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
  editData?: {
    date: string;
    activities: string;
    observations: string;
    team_members: TeamMemberInput[];
  };
}

export default function RdoForm({ open, onOpenChange, editId, editData }: RdoFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const activeProject = useAppStore((s) => s.activeProject);
  const { createRdo, updateRdo, checkDuplicateDate } = useRdos();

  const [date, setDate] = useState<Date>(editData ? new Date(editData.date + 'T12:00:00') : new Date());
  const [activities, setActivities] = useState(editData?.activities || '');
  const [observations, setObservations] = useState(editData?.observations || '');
  const [teamMembers, setTeamMembers] = useState<TeamMemberInput[]>(
    editData?.team_members || [{ name: '', role: '', hours_worked: 8 }]
  );
  const [photos, setPhotos] = useState<PhotoInput[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMember = () => setTeamMembers([...teamMembers, { name: '', role: '', hours_worked: 8 }]);

  const removeMember = (idx: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== idx));
  };

  const updateMember = (idx: number, field: keyof TeamMemberInput, value: string | number) => {
    const updated = [...teamMembers];
    (updated[idx] as any)[field] = value;
    setTeamMembers(updated);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const compressed = await Promise.all(files.map((f) => compressImage(f)));
    const newPhotos = compressed.map((file) => ({
      file,
      caption: '',
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(photos[idx].preview);
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!activeProject) return;
    const dateStr = format(date, 'yyyy-MM-dd');

    // Validate no future date
    if (date > new Date()) {
      toast({ title: t('rdo.noFutureDate'), variant: 'destructive' });
      return;
    }

    // Check duplicate (only for create)
    if (!editId) {
      const existing = await checkDuplicateDate(activeProject.id, dateStr);
      if (existing) {
        toast({
          title: t('rdo.duplicateDate'),
          action: (
            <button
              className="text-xs font-semibold underline"
              onClick={() => { onOpenChange(false); navigate(`/rdo/${existing.id}`); }}
            >
              {t('rdo.editExisting')}
            </button>
          ),
        });
        return;
      }
    }

    const validMembers = teamMembers.filter((m) => m.name.trim());

    setIsSubmitting(true);
    try {
      if (editId) {
        await updateRdo.mutateAsync({
          id: editId,
          activities,
          observations,
          team_members: validMembers,
          newPhotos: photos.map((p) => ({ file: p.file, caption: p.caption })),
        });
      } else {
        await createRdo.mutateAsync({
          project_id: activeProject.id,
          date: dateStr,
          activities,
          observations,
          team_members: validMembers,
          photos: photos.map((p) => ({ file: p.file, caption: p.caption })),
        });
      }
      toast({ title: t('common.success') });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: t('common.error'), description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{editId ? t('rdo.editRdo') : t('rdo.newRdo')}</DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="px-4 pb-4 overflow-y-auto max-h-[65vh]">
          <div className="space-y-4">
            {/* Date */}
            <div className="space-y-2">
              <Label>{t('rdo.date')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn('w-full justify-start text-left', !date && 'text-muted-foreground')}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, 'dd/MM/yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    disabled={(d) => d > new Date()}
                    locale={ptBR}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Activities */}
            <div className="space-y-2">
              <Label>{t('rdo.activities')}</Label>
              <Textarea value={activities} onChange={(e) => setActivities(e.target.value)} rows={3} />
            </div>

            {/* Team members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{t('rdo.team')}</Label>
                <Button variant="ghost" size="sm" onClick={addMember}>
                  <Plus size={14} className="mr-1" /> {t('rdo.addMember')}
                </Button>
              </div>
              {teamMembers.map((m, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Input
                      placeholder={t('rdo.memberName')}
                      value={m.name}
                      onChange={(e) => updateMember(i, 'name', e.target.value)}
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      placeholder={t('rdo.memberRole')}
                      value={m.role}
                      onChange={(e) => updateMember(i, 'role', e.target.value)}
                    />
                  </div>
                  <div className="w-16">
                    <Input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="h"
                      value={m.hours_worked}
                      onChange={(e) => updateMember(i, 'hours_worked', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeMember(i)} className="text-destructive h-9 w-9">
                    <Trash2 size={14} />
                  </Button>
                </div>
              ))}
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <Label>{t('rdo.photos')}</Label>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
              <div className="grid grid-cols-3 gap-2">
                {photos.map((p, i) => (
                  <div key={i} className="relative group">
                    <img src={p.preview} alt="" className="w-full h-20 object-cover rounded-lg" />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    <Input
                      placeholder={t('rdo.caption')}
                      value={p.caption}
                      onChange={(e) => {
                        const updated = [...photos];
                        updated[i].caption = e.target.value;
                        setPhotos(updated);
                      }}
                      className="mt-1 text-xs h-7"
                    />
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors"
                >
                  <ImagePlus size={20} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">{t('rdo.addPhotos')}</span>
                </button>
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <Label>{t('rdo.observations')}</Label>
              <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} />
            </div>
          </div>
        </ScrollArea>

        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('common.loading') : t('common.save')}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
