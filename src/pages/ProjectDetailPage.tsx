import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, type ProjectStatus } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CalendarDays, FileText, CheckSquare, ShoppingCart,
  FolderArchive, BookImage, MapPin, UserPlus, ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-accent/20 text-accent',
  paused: 'bg-orange-100 text-orange-700',
  completed: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/20 text-destructive',
};

const mockMembers = [
  { initials: 'MS', name: 'Maria Silva' },
  { initials: 'JP', name: 'João Pereira' },
  { initials: 'AC', name: 'Ana Costa' },
];

const MOCK_PROGRESS = 35;

export default function ProjectDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const projects = useAppStore((s) => s.projects);
  const project = projects.find((p) => p.id === id);

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
    { key: 'schedule', icon: CalendarDays },
    { key: 'rdo', icon: FileText },
    { key: 'checklists', icon: CheckSquare },
    { key: 'purchases', icon: ShoppingCart },
    { key: 'dossiers', icon: FolderArchive },
    { key: 'references', icon: BookImage },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} />
        {t('common.back')}
      </button>

      {/* Cover / Header card */}
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

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('projectView.progress')}</span>
              <span className="font-semibold">{MOCK_PROGRESS}%</span>
            </div>
            <Progress value={MOCK_PROGRESS} className="h-2" />
          </div>

          {/* Dates */}
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

          {/* Members */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">{t('projectView.members')}</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {mockMembers.map((m) => (
                  <div
                    key={m.initials}
                    title={m.name}
                    className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-primary/10 text-xs font-semibold text-primary"
                  >
                    {m.initials}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast({ title: t('common.comingSoon') })}
                className="ml-2"
              >
                <UserPlus size={14} />
                {t('projectView.invite')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module shortcuts */}
      <div className="grid grid-cols-3 gap-3">
        {modules.map(({ key, icon: Icon }) => (
          <button
            key={key}
            onClick={() => toast({ title: t('common.comingSoon') })}
            className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary active:scale-95"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <Icon size={20} className="text-primary" />
            </div>
            <span className="text-xs font-medium text-center">{t(`projectView.modules.${key}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
