import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, CalendarDays, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/stores/useAppStore';
import { useProjectRole } from '@/hooks/useProjectRole';
import { useRdos } from '@/hooks/useRdos';
import RdoCard from '@/components/rdo/RdoCard';
import RdoForm from '@/components/rdo/RdoForm';
import WeeklySummary from '@/components/rdo/WeeklySummary';

export default function RdoPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeProject = useAppStore((s) => s.activeProject);
  const { canEdit } = useProjectRole();
  const { rdos, isLoading } = useRdos();
  const [formOpen, setFormOpen] = useState(false);
  const [showWeekly, setShowWeekly] = useState(false);

  useEffect(() => {
    if (searchParams.get('new') === '1' && activeProject && canEdit) {
      setFormOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, activeProject, canEdit]);

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t('schedule.selectProject')}</p>
      </div>
    );
  }

  if (showWeekly) {
    return <WeeklySummary onClose={() => setShowWeekly(false)} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold font-nunito">{t('rdo.title')}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowWeekly(true)}>
            <CalendarDays size={14} className="mr-1" /> {t('rdo.weeklySummary')}
          </Button>
          {canEdit && (
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus size={14} className="mr-1" /> {t('rdo.newRdo')}
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : rdos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <FileText size={48} className="text-muted-foreground/50 mb-4" />
          <h3 className="font-semibold text-lg">{t('rdo.noRdos')}</h3>
          <p className="text-sm text-muted-foreground mt-1">{t('rdo.noRdosDesc')}</p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}>
            <Plus size={14} className="mr-1" /> {t('rdo.newRdo')}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rdos.map((rdo) => (
            <RdoCard key={rdo.id} rdo={rdo} onClick={() => navigate(`/rdo/${rdo.id}`)} />
          ))}
        </div>
      )}

      {/* Form */}
      <RdoForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
