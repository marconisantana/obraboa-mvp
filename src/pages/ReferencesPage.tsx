import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { useProjectRole } from '@/hooks/useProjectRole';
import { useReferences } from '@/hooks/useReferences';
import { Button } from '@/components/ui/button';
import { ImagePlus, Images } from 'lucide-react';
import CategoryFilter from '@/components/references/CategoryFilter';
import ReferenceCard from '@/components/references/ReferenceCard';
import ReferenceDetailDialog from '@/components/references/ReferenceDetailDialog';
import AddReferenceDialog from '@/components/references/AddReferenceDialog';
import type { Reference } from '@/hooks/useReferences';

export default function ReferencesPage() {
  const { t } = useTranslation();
  const activeProject = useAppStore(s => s.activeProject);
  const { canEdit } = useProjectRole();
  const {
    references, loading, fetchReferences,
    createFromUpload, createFromUrl,
    updateObservation, updateCategory, deleteReference,
  } = useReferences();

  const [category, setCategory] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const [detailRef, setDetailRef] = useState<Reference | null>(null);

  const refresh = useCallback(() => {
    if (activeProject) fetchReferences(activeProject.id, category);
  }, [activeProject, category, fetchReferences]);

  useEffect(() => { refresh(); }, [refresh]);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Images size={48} className="text-muted-foreground mb-3" />
        <p className="text-muted-foreground">{t('references.selectProject')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('references.title')}</h1>
        {canEdit && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <ImagePlus size={16} />
            {t('references.new')}
          </Button>
        )}
      </div>

      {/* Category filter */}
      <CategoryFilter active={category} onChange={setCategory} />

      {/* Grid masonry */}
      {loading ? (
        <p className="text-center text-muted-foreground py-10">{t('common.loading')}</p>
      ) : references.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Images size={48} className="text-muted-foreground mb-3" />
          <p className="font-medium">{t('references.noReferences')}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('references.noReferencesDesc')}</p>
          <Button className="mt-4" onClick={() => setAddOpen(true)}>
            <ImagePlus size={16} />
            {t('references.new')}
          </Button>
        </div>
      ) : (
        <div className="columns-2 md:columns-3 gap-3">
          {references.map(ref => (
            <ReferenceCard key={ref.id} reference={ref} onClick={() => setDetailRef(ref)} />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <AddReferenceDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreateFromUpload={(file, cat, obs) => createFromUpload(activeProject.id, file, cat, obs).then(refresh)}
        onCreateFromUrl={(url, cat, obs) => createFromUrl(activeProject.id, url, cat, obs).then(refresh)}
      />

      <ReferenceDetailDialog
        reference={detailRef}
        open={!!detailRef}
        onOpenChange={open => { if (!open) setDetailRef(null); }}
        onUpdateObservation={updateObservation}
        onUpdateCategory={updateCategory}
        onDelete={deleteReference}
        onRefresh={refresh}
      />
    </div>
  );
}
