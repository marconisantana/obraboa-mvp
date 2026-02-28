import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { FolderKanban, FileText, CheckSquare, CalendarDays, ShoppingCart, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockActivities, type MockActivity } from '@/data/mockActivities';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useRef, useCallback } from 'react';

const typeIcons: Record<MockActivity['type'], typeof FileText> = {
  rdo: FileText,
  checklist: CheckSquare,
  schedule: CalendarDays,
  purchase_order: ShoppingCart,
};

const typeColors: Record<MockActivity['type'], string> = {
  rdo: 'bg-blue-100 text-blue-600',
  checklist: 'bg-emerald-100 text-emerald-600',
  schedule: 'bg-violet-100 text-violet-600',
  purchase_order: 'bg-amber-100 text-amber-600',
};

export default function HomePage() {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const activeProject = useAppStore((s) => s.activeProject);
  const projects = useAppStore((s) => s.projects);
  const navigate = useNavigate();

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
      setTimeout(() => {
        setRefreshing(false);
        setPullDistance(0);
      }, 1000);
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  }, [pullDistance]);

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

  // Has projects but none selected or empty feed
  const hasActivity = activeProject && mockActivities.length > 0;

  return (
    <div
      ref={containerRef}
      className="space-y-6"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="flex items-center justify-center transition-all"
          style={{ height: pullDistance }}
        >
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

      {!activeProject && (
        <p className="text-muted-foreground">{t('home.selectProject')}</p>
      )}

      {activeProject && !hasActivity && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <CalendarDays size={48} className="mb-3 text-muted-foreground/50" />
            <p className="font-medium">{t('home.emptyTitle')}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t('home.emptyCta')}</p>
          </CardContent>
        </Card>
      )}

      {hasActivity && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {t('home.recentActivity')}
          </h2>
          {mockActivities.map((activity) => {
            const Icon = typeIcons[activity.type];
            const colorClass = typeColors[activity.type];
            return (
              <Card key={activity.id}>
                <CardContent className="flex items-start gap-3 p-4">
                  {/* Avatar */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {activity.userInitials}
                  </div>
                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.userName}</span>{' '}
                      {activity.description}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.createdAt, { addSuffix: true, locale: ptBR })}
                    </p>
                  </div>
                  {/* Category icon */}
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
