import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, type ProjectStatus } from '@/stores/useAppStore';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, FileText, CheckSquare, CalendarDays, ShoppingCart, RefreshCw, MapPin, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  paused: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
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

/* ─── Banner Carrossel ─────────────────────────────────────── */
interface Slide {
  image: string;
  position: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
}

function buildSlides(activeProject?: { name: string } | null, progress?: number): Slide[] {
  const baseSlides: Slide[] = [
    {
      image: '/images/campanha/reforma_06_cozinha.jpeg',
      position: 'center center',
      eyebrow: 'DICA',
      title: 'Adicione fotos\nao diário de obra',
    },
    {
      image: '/images/campanha/reforma_07_sala_familia.jpeg',
      position: 'left center',
      eyebrow: 'ORGANIZE',
      title: 'Gerencie compras\ncom dossiês',
    },
  ];

  if (activeProject) {
    return [
      {
        image: '/images/campanha/reforma_07_sala_familia.jpeg',
        position: 'right center',
        eyebrow: 'EM ANDAMENTO',
        title: activeProject.name,
        subtitle: `${progress ?? 0}% concluído`,
      },
      ...baseSlides,
    ];
  }

  return [
    {
      image: '/images/campanha/reforma_03_novo_lar.jpeg',
      position: 'right center',
      eyebrow: 'BEM-VINDO',
      title: 'Organize sua\npróxima obra',
    },
    ...baseSlides,
  ];
}

function BannerCarousel({ activeProject, progress }: { activeProject?: { name: string } | null; progress?: number }) {
  const navigate = useNavigate();
  const slides = buildSlides(activeProject, progress);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 4000);
  }, [slides.length]);

  useEffect(() => {
    resetInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [resetInterval]);

  const slide = slides[current];
  const overlayGradient = 'linear-gradient(to right, rgba(13,50,89,0.88) 0%, rgba(13,50,89,0.42) 60%, rgba(13,50,89,0.12) 100%)';

  return (
    <div className="relative overflow-hidden" style={{ borderRadius: '20px', height: '180px' }}>
      {/* Imagem de fundo */}
      <div
        className="absolute inset-0 bg-cover transition-all duration-700"
        style={{
          backgroundImage: `url(${slide.image})`,
          backgroundPosition: slide.position,
        }}
      />
      {/* Overlay gradiente */}
      <div className="absolute inset-0" style={{ background: overlayGradient }} />

      {/* Texto */}
      <div className="absolute inset-0 flex flex-col justify-center p-5">
        <p
          className="font-bold tracking-widest mb-1"
          style={{ color: '#F59E0B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em' }}
        >
          {slide.eyebrow}
        </p>
        <p className="font-bold text-white leading-snug whitespace-pre-line" style={{ fontSize: '20px' }}>
          {slide.title}
        </p>
        {slide.subtitle && (
          <div className="mt-2">
            <p className="text-white/80 text-sm mb-1">{slide.subtitle}</p>
            {progress !== undefined && (
              <div className="w-32 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: '#F59E0B' }} />
              </div>
            )}
          </div>
        )}
        {!activeProject && current === 0 && (
          <button
            onClick={() => navigate('/projects')}
            className="mt-3 self-start rounded-full font-semibold text-sm px-4 py-1.5"
            style={{ backgroundColor: '#F59E0B', color: '#0D3259' }}
          >
            + Nova obra
          </button>
        )}
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); resetInterval(); }}
            style={{
              height: '6px',
              borderRadius: '3px',
              width: i === current ? '20px' : '6px',
              backgroundColor: i === current ? '#F59E0B' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── HOME PAGE ─────────────────────────────────────────────── */
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
  const activeProjectProgress = activeProject
    ? projectSummaries[activeProject.id]?.avgProgress ?? 0
    : 0;

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
    if (!activeProject) { setActivities([]); return; }
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
          const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
          return { id: a.id, type: a.type, description: a.description, created_at: a.created_at, user_id: a.user_id, userName: name, userInitials: initials };
        })
      );
    } catch {
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  }, [activeProject]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);
  useEffect(() => { fetchProjectSummaries(); }, [fetchProjectSummaries]);

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

  return (
    <div
      ref={containerRef}
      className="space-y-5"
      style={{ backgroundColor: '#F0F4F8' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div className="flex items-center justify-center transition-all" style={{ height: pullDistance }}>
          <RefreshCw size={20} className={`text-primary ${refreshing ? 'animate-spin' : ''}`} style={{ transform: `rotate(${pullDistance * 3}deg)` }} />
        </div>
      )}
      {refreshing && (
        <div className="flex items-center justify-center py-2">
          <RefreshCw size={18} className="animate-spin text-primary" />
        </div>
      )}

      {/* Saudação  */}
      <p className="text-base font-semibold" style={{ color: '#0D3259' }}>
        {t('home.welcome')}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
      </p>

      {/* Banner Carrossel */}
      <BannerCarousel activeProject={activeProject} progress={activeProjectProgress} />

      {/* Cards de obras */}
      {activeProjects.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B7280' }}>
            {t('home.myProjects')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeProjects.map((project) => {
              const summary = projectSummaries[project.id];
              const progress = summary?.avgProgress ?? 0;
              const stageCount = summary?.stageCount ?? 0;

              return (
                <div
                  key={project.id}
                  className="cursor-pointer overflow-hidden bg-white active:scale-[0.98] transition-transform"
                  style={{ borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
                  onClick={() => handleProjectClick(project)}
                >
                  {/* Foto de capa — 160px */}
                  <div className="relative w-full bg-muted" style={{ height: '160px' }}>
                    {project.cover_image_url ? (
                      <img
                        src={project.cover_image_url}
                        alt={project.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: 'rgba(13,50,89,0.05)' }}>
                        <FolderKanban size={36} style={{ color: 'rgba(13,50,89,0.25)' }} />
                      </div>
                    )}
                    {/* Badge de status sobre a foto */}
                    <span
                      className={`absolute top-2 left-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[project.status]}`}
                    >
                      {t(`projects.${project.status}`)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <p className="font-bold truncate" style={{ fontSize: '17px', color: '#111827' }}>
                      {project.name}
                    </p>
                    {project.address && (
                      <p className="flex items-center gap-1 truncate" style={{ fontSize: '13px', color: '#6B7280' }}>
                        <MapPin size={12} className="shrink-0" /> {project.address}
                      </p>
                    )}

                    {/* Barra de progresso amber */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between" style={{ fontSize: '12px', color: '#6B7280' }}>
                        <span>{stageCount > 0 ? `${stageCount} ${t('home.stages')}` : t('home.noStages')}</span>
                        <span className="font-semibold" style={{ color: '#0D3259' }}>{progress}%</span>
                      </div>
                      {/* Barra amber */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: '#F3F4F6' }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%`, backgroundColor: '#F59E0B' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state — sem projetos */}
      {activeProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-4 px-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(13,50,89,0.08)' }}>
            <FolderKanban size={40} style={{ color: '#0D3259' }} />
          </div>
          <div className="space-y-1.5">
            <p className="text-xl font-extrabold" style={{ color: '#0D3259' }}>{t('projects.noProjects')}</p>
            <p className="text-sm max-w-xs" style={{ color: '#6B7280' }}>{t('projects.createFirst')}</p>
          </div>
          <Button onClick={() => navigate('/projects')} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
            <Plus size={18} /> {t('projects.new')}
          </Button>
        </div>
      )}

      {/* Atividade recente */}
      {activeProject && activities.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#6B7280' }}>
            {t('home.recentActivity')}
          </h2>
          {activities.map((activity) => {
            const Icon = typeIcons[activity.type] || FileText;
            const colorClass = typeColors[activity.type] || 'bg-muted text-muted-foreground';
            return (
              <div
                key={activity.id}
                className="bg-white flex items-start gap-3 p-4"
                style={{ borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ backgroundColor: 'rgba(13,50,89,0.1)', color: '#0D3259' }}>
                  {activity.userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{activity.userName}</span>{' '}{activity.description}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: '#9CA3AF' }}>
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: dateLocale })}
                  </p>
                </div>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                  <Icon size={16} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
