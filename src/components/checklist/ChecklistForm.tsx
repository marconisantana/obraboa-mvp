import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, ClipboardCheck, Sparkles, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CHECKLIST_TEMPLATES } from '@/hooks/useChecklists';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; responsible_name?: string; due_date?: string; templateKey?: string }) => void;
  defaultValues?: { name: string; responsible_name?: string; due_date?: string };
  isEdit?: boolean;
}

const templateOptions = [
  { key: 'inspection', icon: ClipboardCheck },
  { key: 'cleaning', icon: Sparkles },
  { key: 'handover', icon: Trash2 },
  { key: 'blank', icon: FileText },
] as const;

export default function ChecklistForm({ open, onOpenChange, onSubmit, defaultValues, isEdit }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState(defaultValues?.name || '');
  const [responsible, setResponsible] = useState(defaultValues?.responsible_name || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    defaultValues?.due_date ? new Date(defaultValues.due_date) : undefined
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      responsible_name: responsible.trim() || undefined,
      due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
      templateKey: isEdit ? undefined : selectedTemplate,
    });
    setName('');
    setResponsible('');
    setDueDate(undefined);
    setSelectedTemplate('blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('checklist.edit') : t('checklist.new')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('checklist.name')}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('checklist.name')} />
          </div>

          <div className="space-y-2">
            <Label>{t('checklist.responsible')}</Label>
            <Input value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder={t('checklist.responsible')} />
          </div>

          <div className="space-y-2">
            <Label>{t('checklist.dueDate')}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'dd/MM/yyyy') : t('checklist.dueDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} />
              </PopoverContent>
            </Popover>
          </div>

          {!isEdit && (
            <div className="space-y-2">
              <Label>{t('checklist.templates')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {templateOptions.map(({ key, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedTemplate(key)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-medium transition-colors',
                      selectedTemplate === key
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-secondary'
                    )}
                  >
                    <Icon size={18} />
                    {t(`checklist.template${key.charAt(0).toUpperCase() + key.slice(1)}`)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={handleSubmit} disabled={!name.trim()}>{t('common.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
