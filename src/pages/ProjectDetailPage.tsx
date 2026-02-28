import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore, type ProjectStatus } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CalendarDays, FileText, CheckSquare, ShoppingCart,
  FolderArchive, BookImage, Images, MapPin, UserPlus, ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useStages } from '@/hooks/useStages';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-accent/20 text-accent',
  paused: 'bg-orange-100 text-orange-700',
  completed: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/20 text-destructive',
};

interface MemberInfo {
  id: string;
  role: string;
  full_name: string;
  avatar_url: string | null;
  initials: string;
}

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

  const [members, setMembers] = useState<MemberInfo[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data } = await supabase
        .from('project_members' as any)
        .select('id, role, profile_id')
        .eq('project_id', id);

      if (!data || data.length === 0) {
        setMembers([]);
        return;
      }

      const profileIds = (data as any[]).map((m: any) => m.profile_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', profileIds);

      const profileMap = Object.fromEntries(
        (profiles ?? []).map((p) => [p.id, p])
      );

      setMembers(
        (data as any[]).map((m: any) => {
          const prof = profileMap[m.profile_id] || { full_name: '', avatar_url: null };
          const initials = prof.full_name
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return {
            id: m.id,
            role: m.role,
            full_name: prof.full_name,
            avatar_url: prof.avatar_url,
            initials,
          };
        })
      );
    })();
  }, [id]);

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
    { key: 'documents', icon: BookImage },
    { key: 'references', icon: Images },
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

          <div>
            <p className="text-sm text-muted-foreground mb-2">{t('projectView.members')}</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {members.map((m) => (
                  <Avatar key={m.id} className="h-9 w-9 border-2 border-card">
                    <AvatarImage src={m.avatar_url ?? undefined} alt={m.full_name} />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {m.initials}
                    </AvatarFallback>
                  </Avatar>
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

      <div className="grid grid-cols-3 gap-3">
        {modules.map(({ key, icon: Icon }) => (
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
