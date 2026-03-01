import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, type ProjectStatus } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CalendarDays, FileText, CheckSquare, ShoppingCart,
  FolderArchive, BookImage, Images, MapPin, ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useStages } from '@/hooks/useStages';
import MembersSection from '@/components/members/MembersSection';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-accent/20 text-accent',
  paused: 'bg-orange-100 text-orange-700',
  completed: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/20 text-destructive',
};

export default function ProjectDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const projects = useAppStore((s) => s.projects);
  const project = projects.find((p) => p.id === id);

  const { stages } = useStages(id);
  const progress = stages.length > 0
    ? Math.round(stages.reduce((sum, s) => sum + s.progress, 0) / stages.length)
    : 0;


  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-muted-foreground">{t('common.noResults')}</p>
        <Button variant="link" onClick={() => navigate('/projects')}>
          {t('common.back')}
        </Button>
      </div>
    );
  }

  const modules = [
    { key: 'schedule', icon: CalendarDays, color: '#6366F1', bg: 'rgba(99,102,241,0.12)' },
    { key: 'rdo', icon: FileText, color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
    { key: 'checklists', icon: CheckSquare, color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
    { key: 'purchases', icon: ShoppingCart, color: '#EF4444', bg: 'rgba(239,68,68,0.12)' },
    { key: 'dossiers', icon: FolderArchive, color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
    { key: 'documents', icon: BookImage, color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
    { key: 'references', icon: Images, color: '#EC4899', bg: 'rgba(236,72,153,0.12)' },
  ];

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>

      <Card className="overflow-hidden">
        <div className="h-24 bg-primary/10" />
        <CardContent className="space-y-4 p-4 -mt-6">
          <div>
            <h1 className="text-xl font-bold">{project.name}</h1>
            {project.address && (
              <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin size={14} /> {project.address}
              </p>
            )}
          </div>

          <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${statusColors[project.status]}`}>
            {t(`projects.${project.status}`)}
          </span>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('projectView.progress')}</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t('projectView.startDate')}</p>
              <p className="font-medium">
                {project.start_date ? format(new Date(project.start_date), 'dd/MM/yyyy') : '—'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">{t('projectView.endDate')}</p>
              <p className="font-medium">
                {project.end_date ? format(new Date(project.end_date), 'dd/MM/yyyy') : '—'}
              </p>
            </div>
          </div>

          {id && <MembersSection projectId={id} />}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {modules.map(({ key, icon: Icon, color, bg }) => (
          <button
            key={key}
            onClick={() => {
              const routes: Record<string, string> = {
                schedule: '/schedule', rdo: '/rdo', checklists: '/checklists',
                purchases: '/purchases', dossiers: '/dossiers', documents: '/documents',
                references: '/references',
              };
              if (routes[key]) navigate(routes[key]);
              else toast({ title: t('common.comingSoon') });
            }}
            className="flex flex-col items-center gap-2 rounded-2xl bg-white active:scale-95 transition-transform"
            style={{ padding: '20px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: bg }}>
              <Icon size={28} style={{ color }} />
            </div>
            <span
              className="text-center font-semibold leading-tight"
              style={{ fontSize: '13px', color: '#374151' }}
            >
              {t(`projectView.modules.${key}`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
