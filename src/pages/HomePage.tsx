import { useTranslation } from 'react-i18next';
import { useAppStore, type ProjectStatus } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, FileText, CheckSquare, CalendarDays, ShoppingCart, RefreshCw, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-accent/20 text-accent',
  paused: 'bg-orange-100 text-orange-700',
  completed: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/20 text-destructive',
};

const typeIcons: Record<string, typeof FileText> = {
  rdo: FileText,
  checklist: CheckSquare,
  schedule: CalendarDays,
  purchase_order: ShoppingCart,
};

const typeColors: Record<string, string> = {
  rdo: 'bg-blue-100 text-blue-600',
  checklist: 'bg-emerald-100 text-emerald-600',
  schedule: 'bg-violet-100 text-violet-600',
  purchase_order: 'bg-amber-100 text-amber-600',
};

interface ActivityWithProfile {
  id: string;
  type: string;
  description: string;
  created_at: string;
  user_id: string;
  userName: string;
  userInitials: string;
}

interface ProjectSummary {
  projectId: string;
  stageCount: number;
  avgProgress: number;
}

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const user = useAppStore((s) => s.user);
  const activeProject = useAppStore((s) => s.activeProject);
  const projects = useAppStore((s) => s.projects);
  const setActiveProject = useAppStore((s) => s.setActiveProject);
  const navigate = useNavigate();

  const [activities, setActivities] = useState<ActivityWithProfile[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [projectSummaries, setProjectSummaries] = useState<Record<string, ProjectSummary>>({});

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeProjects = projects.filter((p) => p.status !== 'cancelled');

  const fetchProjectSummaries = useCallback(async () => {
    if (activeProjects.length === 0) return;
    const ids = activeProjects.map((p) => p.id);
    const { data } = await supabase
      .from('stages')
      .select('project_id, progress')
      .in('project_id', ids);
    if (!data) return;

    const map: Record<string, ProjectSummary> = {};
    for (const row of data) {
      if (!map[row.project_id]) {
        map[row.project_id] = { projectId: row.project_id, stageCount: 0, avgProgress: 0 };
      }
      map[row.project_id].stageCount++;
      map[row.project_id].avgProgress += row.progress;
    }
    for (const key of Object.keys(map)) {
      map[key].avgProgress = Math.round(map[key].avgProgress / map[key].stageCount);
    }
    setProjectSummaries(map);
  }, [activeProjects.length]);

  const fetchActivities = useCallback(async () => {
    if (!activeProject) {
      setActivities([]);
      return;
    }
    setLoadingActivities(true);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('project_id', activeProject.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const userIds = [...new Set((data ?? []).map((a) => a.user_id))];
      let profileMap: Record<string, { full_name: string }> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', userIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map((p) => [p.user_id, { full_name: p.full_name }]));
        }
      }

      setActivities(
        (data ?? []).map((a) => {
          const name = profileMap[a.user_id]?.full_name || '';
          const initials = name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return {
            id: a.id,
            type: a.type,
            description: a.description,
            created_at: a.created_at,
            user_id: a.user_id,
            userName: name,
            userInitials: initials,
          };
        })
      );
    } catch {
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  }, [activeProject]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  useEffect(() => {
    fetchProjectSummaries();
  }, [fetchProjectSummaries]);

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartY.current) return;
    const diff = e.touches[0].clientY - touchStartY.current;
    if (diff > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
      setPullDistance(Math.min(diff * 0.4, 80));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      setRefreshing(true);
      Promise.all([fetchActivities(), fetchProjectSummaries()]).finally(() => {
        setRefreshing(false);
        setPullDistance(0);
      });
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  }, [pullDistance, fetchActivities, fetchProjectSummaries]);

  const dateLocale = i18n.language === 'pt-BR' ? ptBR : undefined;

  const handleProjectClick = (project: typeof projects[0]) => {
    setActiveProject(project);
    navigate(`/projects/${project.id}`);
  };

  // No projects at all
  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">
          {t('home.welcome')}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
        </h1>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FolderKanban size={48} className="mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t('projects.noProjects')}</p>
            <button
              onClick={() => navigate('/projects')}
              className="mt-2 text-sm font-medium text-accent hover:underline"
            >
              {t('projects.createFirst')}
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasActivity = activeProject && activities.length > 0;

  return (
    <div
      ref={containerRef}
      className="space-y-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {pullDistance > 0 && (
        <div className="flex items-center justify-center transition-all" style={{ height: pullDistance }}>
          <RefreshCw
            size={20}
            className={`text-muted-foreground ${refreshing ? 'animate-spin' : ''}`}
            style={{ transform: `rotate(${pullDistance * 3}deg)` }}
          />
        </div>
      )}
      {refreshing && (
        <div className="flex items-center justify-center py-2">
          <RefreshCw size={18} className="animate-spin text-primary" />
        </div>
      )}

      <h1 className="text-2xl font-bold">
        {t('home.welcome')}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
      </h1>

      {/* Project cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t('home.myProjects')}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {activeProjects.map((project) => {
            const summary = projectSummaries[project.id];
            const progress = summary?.avgProgress ?? 0;
            const stageCount = summary?.stageCount ?? 0;

            return (
              <Card
                key={project.id}
                className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md active:scale-[0.98]"
                onClick={() => handleProjectClick(project)}
              >
                {/* Cover image */}
                <div className="relative h-28 w-full bg-muted">
                  {project.cover_image_url ? (
                    <img
                      src={project.cover_image_url}
                      alt={project.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/5">
                      <FolderKanban size={32} className="text-primary/30" />
                    </div>
                  )}
                  <Badge className={`absolute top-2 left-2 ${statusColors[project.status]} text-xs`}>
                    {t(`projects.${project.status}`)}
                  </Badge>
                </div>

                <CardContent className="p-3 space-y-2">
                  <p className="font-semibold truncate">{project.name}</p>

                  {project.address && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                      <MapPin size={12} className="shrink-0" /> {project.address}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {stageCount > 0
                          ? `${stageCount} ${t('home.stages')}`
                          : t('home.noStages')}
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent activity for active project */}
      {hasActivity && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t('home.recentActivity')}
          </h2>
          {activities.map((activity) => {
            const Icon = typeIcons[activity.type] || FileText;
            const colorClass = typeColors[activity.type] || 'bg-muted text-muted-foreground';
            return (
              <Card key={activity.id}>
                <CardContent className="flex items-start gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {activity.userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.userName}</span>{' '}
                      {activity.description}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: dateLocale })}
                    </p>
                  </div>
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                    <Icon size={16} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
