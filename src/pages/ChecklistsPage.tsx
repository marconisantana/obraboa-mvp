import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { useProjectRole } from '@/hooks/useProjectRole';
import { useChecklists } from '@/hooks/useChecklists';
import { Button } from '@/components/ui/button';
import { Plus, ClipboardCheck } from 'lucide-react';
import ChecklistCard from '@/components/checklist/ChecklistCard';
import ChecklistForm from '@/components/checklist/ChecklistForm';

export default function ChecklistsPage() {
  const { t } = useTranslation();
  const activeProject = useAppStore((s) => s.activeProject);
  const { canEdit } = useProjectRole();
  const { checklistsQuery, createChecklist } = useChecklists();
  const [formOpen, setFormOpen] = useState(false);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ClipboardCheck size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t('schedule.selectProject')}</p>
      </div>
    );
  }

  const checklists = checklistsQuery.data || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{t('checklist.title')}</h1>
        {canEdit && (
          <Button size="sm" onClick={() => setFormOpen(true)}>
            <Plus size={16} className="mr-1" /> {t('checklist.new')}
          </Button>
        )}
      </div>

      {checklists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardCheck size={48} className="text-muted-foreground mb-4" />
          <p className="font-medium text-muted-foreground">{t('checklist.noChecklists')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('checklist.noChecklistsDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {checklists.map((c) => (
            <ChecklistCard key={c.id} checklist={c} />
          ))}
        </div>
      )}

      <ChecklistForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(data) => createChecklist.mutate(data)}
      />
    </div>
  );
}
