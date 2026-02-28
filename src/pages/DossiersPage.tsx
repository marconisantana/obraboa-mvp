import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { useDossiers } from '@/hooks/useDossiers';
import { Button } from '@/components/ui/button';
import { Plus, FolderArchive } from 'lucide-react';
import DossierCard from '@/components/dossiers/DossierCard';
import DossierForm from '@/components/dossiers/DossierForm';

export default function DossiersPage() {
  const { t } = useTranslation();
  const activeProject = useAppStore((s) => s.activeProject);
  const { dossiersQuery, createDossier } = useDossiers(activeProject?.id);
  const [formOpen, setFormOpen] = useState(false);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FolderArchive size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t('dossiers.selectProject')}</p>
      </div>
    );
  }

  const dossiers = dossiersQuery.data || [];

  const handleCreate = (data: any) => {
    createDossier.mutate(
      { project_id: activeProject.id, ...data },
      { onSuccess: () => setFormOpen(false) }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('dossiers.title')}</h1>
        <Button size="sm" onClick={() => setFormOpen(true)}>
          <Plus size={14} className="mr-1" /> {t('dossiers.new')}
        </Button>
      </div>

      {dossiers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FolderArchive size={48} className="text-muted-foreground mb-4" />
          <p className="font-medium">{t('dossiers.noDossiers')}</p>
          <p className="text-sm text-muted-foreground">{t('dossiers.noDossiersDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dossiers.map((d) => <DossierCard key={d.id} dossier={d} />)}
        </div>
      )}

      <DossierForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleCreate}
        isLoading={createDossier.isPending}
      />
    </div>
  );
}
