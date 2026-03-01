import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { CalendarDays, Plus, ArrowUpDown } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useProjectRole } from '@/hooks/useProjectRole';
import { useStages, type Stage } from '@/hooks/useStages';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import StageCard from '@/components/schedule/StageCard';
import StageForm from '@/components/schedule/StageForm';
import GanttTimeline from '@/components/schedule/GanttTimeline';
import DependencyDialog from '@/components/schedule/DependencyDialog';
import { StageCardSkeleton } from '@/components/ui/card-skeleton';
import { differenceInDays } from 'date-fns';
import NoProjectBanner from '@/components/NoProjectBanner';

type SortMode = 'date' | 'status';

export default function SchedulePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeProject = useAppStore((s) => s.activeProject);
  const { stages, isLoading, createStage, updateStage, deleteStage, getDependents, applyDateDeltaToDependents } = useStages(activeProject?.id);
  const { canEdit } = useProjectRole();

  const [formOpen, setFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [deleteTarget, setDeleteTarget] = useState<Stage | null>(null);

  useEffect(() => {
    if (searchParams.get('new') === '1' && activeProject && canEdit) {
      setEditingStage(null);
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, activeProject, canEdit]);

  // Dependency dialog state
  const [depDialog, setDepDialog] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{ stage: Stage; values: any; daysDelta: number } | null>(null);

  const sortedStages = [...stages].sort((a, b) => {
    if (sortMode === 'status') {
      const order = { delayed: 0, in_progress: 1, pending: 2, completed: 3 };
      const getOrder = (s: Stage) => {
        if (s.status === 'completed') return 3;
        if (s.end_date < new Date().toISOString().split('T')[0] && s.status !== 'completed') return 0;
        return order[s.status as keyof typeof order] ?? 2;
      };
      return getOrder(a) - getOrder(b);
    }
    return a.start_date.localeCompare(b.start_date);
  });

  const handleSubmit = useCallback(async (values: any) => {
    try {
      if (editingStage) {
        // Check if dates changed and has dependents
        const datesChanged = values.start_date !== editingStage.start_date || values.end_date !== editingStage.end_date;
        const dependents = getDependents(editingStage.id);

        if (datesChanged && dependents.length > 0) {
          const daysDelta = differenceInDays(new Date(values.start_date), new Date(editingStage.start_date));
          setPendingUpdate({ stage: editingStage, values, daysDelta });
          setDepDialog(true);
          return;
        }

        await updateStage.mutateAsync({ id: editingStage.id, ...values });
      } else {
        await createStage.mutateAsync(values);
      }
      setFormOpen(false);
      setEditingStage(null);
      toast({ title: t('common.success') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  }, [editingStage, createStage, updateStage, getDependents, toast, t]);

  const handleDepApply = useCallback(async () => {
    if (!pendingUpdate) return;
    try {
      await updateStage.mutateAsync({ id: pendingUpdate.stage.id, ...pendingUpdate.values });
      await applyDateDeltaToDependents(pendingUpdate.stage.id, pendingUpdate.daysDelta);
      toast({ title: t('common.success') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
    setDepDialog(false);
    setPendingUpdate(null);
    setFormOpen(false);
    setEditingStage(null);
  }, [pendingUpdate, updateStage, applyDateDeltaToDependents, toast, t]);

  const handleDepSkip = useCallback(async () => {
    if (!pendingUpdate) return;
    try {
      await updateStage.mutateAsync({ id: pendingUpdate.stage.id, ...pendingUpdate.values });
      toast({ title: t('common.success') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
    setDepDialog(false);
    setPendingUpdate(null);
    setFormOpen(false);
    setEditingStage(null);
  }, [pendingUpdate, updateStage, toast, t]);

  const handleComplete = useCallback(async (stage: Stage) => {
    try {
      await updateStage.mutateAsync({ id: stage.id, status: 'completed', progress: 100 });
      toast({ title: t('common.success') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  }, [updateStage, toast, t]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteStage.mutateAsync(deleteTarget.id);
      toast({ title: t('common.success') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
    setDeleteTarget(null);
  }, [deleteTarget, deleteStage, toast, t]);

  if (!activeProject) {
    return <NoProjectBanner icon={CalendarDays} title={t('schedule.title')} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('schedule.title')}</h1>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowUpDown size={14} className="mr-1" />
                {sortMode === 'date' ? t('schedule.sortByDate') : t('schedule.sortByStatus')}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortMode('date')}>{t('schedule.sortByDate')}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortMode('status')}>{t('schedule.sortByStatus')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {canEdit && (
            <Button size="sm" onClick={() => { setEditingStage(null); setFormOpen(true); }}>
              <Plus size={14} className="mr-1" />
              {t('schedule.addStage')}
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <StageCardSkeleton key={i} />)}
        </div>
      ) : stages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarDays size={48} className="mb-3 text-muted-foreground/50" />
          <p className="font-semibold">{t('schedule.noStages')}</p>
          <p className="text-sm text-muted-foreground mb-4">{t('schedule.noStagesDesc')}</p>
          <Button onClick={() => { setEditingStage(null); setFormOpen(true); }} disabled={!canEdit}>
            <Plus size={14} className="mr-1" />
            {t('schedule.addStage')}
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="list">
          <TabsList>
            <TabsTrigger value="list">{t('schedule.viewList')}</TabsTrigger>
            <TabsTrigger value="timeline">{t('schedule.viewTimeline')}</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-3">
            {sortedStages.map((stage) => (
              <StageCard
                key={stage.id}
                stage={stage}
                onEdit={(s) => { setEditingStage(s); setFormOpen(true); }}
                onDelete={(s) => setDeleteTarget(s)}
                onComplete={handleComplete}
              />
            ))}
          </TabsContent>

          <TabsContent value="timeline">
            <GanttTimeline
              stages={sortedStages}
              onStageClick={(s) => { setEditingStage(s); setFormOpen(true); }}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Form dialog */}
      <StageForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        stages={stages}
        editingStage={editingStage}
        isSubmitting={createStage.isPending || updateStage.isPending}
      />

      {/* Dependency dialog */}
      <DependencyDialog
        open={depDialog}
        onOpenChange={setDepDialog}
        onApplyToDependents={handleDepApply}
        onSkipDependents={handleDepSkip}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.delete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('schedule.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
