import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import type { Stage } from '@/hooks/useStages';

const stageSchema = z.object({
  title: z.string().min(1),
  start_date: z.string().min(1),
  end_date: z.string().min(1),
  responsible_name: z.string().optional(),
  service_type: z.string().optional(),
  environment: z.string().optional(),
  description: z.string().optional(),
  status: z.string().default('pending'),
  progress: z.coerce.number().min(0).max(100).default(0),
  predecessor_id: z.string().nullable().optional(),
});

type StageFormValues = z.infer<typeof stageSchema>;

interface StageFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: StageFormValues) => void;
  stages: Stage[];
  editingStage?: Stage | null;
  isSubmitting?: boolean;
}

export default function StageForm({ open, onOpenChange, onSubmit, stages, editingStage, isSubmitting }: StageFormProps) {
  const { t } = useTranslation();

  const form = useForm<StageFormValues>({
    resolver: zodResolver(stageSchema),
    defaultValues: {
      title: '',
      start_date: '',
      end_date: '',
      responsible_name: '',
      service_type: 'general',
      environment: '',
      description: '',
      status: 'pending',
      progress: 0,
      predecessor_id: null,
    },
  });

  useEffect(() => {
    if (editingStage) {
      form.reset({
        title: editingStage.title,
        start_date: editingStage.start_date,
        end_date: editingStage.end_date,
        responsible_name: editingStage.responsible_name ?? '',
        service_type: editingStage.service_type,
        environment: editingStage.environment ?? '',
        description: editingStage.description ?? '',
        status: editingStage.status,
        progress: editingStage.progress,
        predecessor_id: editingStage.predecessor_id ?? null,
      });
    } else {
      form.reset({
        title: '',
        start_date: '',
        end_date: '',
        responsible_name: '',
        service_type: 'general',
        environment: '',
        description: '',
        status: 'pending',
        progress: 0,
        predecessor_id: null,
      });
    }
  }, [editingStage, open, form]);

  const otherStages = stages.filter((s) => s.id !== editingStage?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingStage ? t('schedule.editStage') : t('schedule.addStage')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('schedule.stageTitle')}</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('schedule.startDate')}</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('schedule.endDate')}</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="responsible_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('schedule.responsible')}</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="service_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('schedule.serviceType')}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="environment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('schedule.environment')}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('schedule.description')}</FormLabel>
                  <FormControl><Textarea rows={2} {...field} /></FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('schedule.status')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="pending">{t('schedule.pending')}</SelectItem>
                        <SelectItem value="in_progress">{t('schedule.in_progress')}</SelectItem>
                        <SelectItem value="completed">{t('schedule.completed')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="progress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('schedule.progress')} (%)</FormLabel>
                    <FormControl><Input type="number" min={0} max={100} {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Predecessor */}
            <FormField
              control={form.control}
              name="predecessor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('schedule.predecessor')}</FormLabel>
                  <Select onValueChange={(v) => field.onChange(v === '__none__' ? null : v)} value={field.value ?? '__none__'}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">{t('schedule.noPredecessor')}</SelectItem>
                      {otherStages.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
