import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { MoreVertical, Pencil, Trash2, CheckCircle2, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Stage } from '@/hooks/useStages';

interface StageCardProps {
  stage: Stage;
  onEdit: (stage: Stage) => void;
  onDelete: (stage: Stage) => void;
  onComplete: (stage: Stage) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'schedule.pending', className: 'bg-muted text-muted-foreground' },
  in_progress: { label: 'schedule.in_progress', className: 'bg-blue-100 text-blue-700' },
  completed: { label: 'schedule.completed', className: 'bg-green-100 text-green-700' },
  delayed: { label: 'schedule.delayed', className: 'bg-red-100 text-red-700' },
};

function getDisplayStatus(stage: Stage): string {
  if (stage.status === 'completed') return 'completed';
  const today = new Date().toISOString().split('T')[0];
  if (stage.end_date < today) return 'delayed';
  return stage.status;
}

export default function StageCard({ stage, onEdit, onDelete, onComplete }: StageCardProps) {
  const { t } = useTranslation();
  const displayStatus = getDisplayStatus(stage);
  const config = statusConfig[displayStatus] ?? statusConfig.pending;

  // Swipe state
  const [swipeX, setSwipeX] = useState(0);
  const touchStart = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.touches[0].clientX;
    setSwipeX(Math.max(0, Math.min(diff, 160)));
  };
  const onTouchEnd = () => {
    setSwipeX(swipeX > 80 ? 160 : 0);
    touchStart.current = null;
  };

  const initials = stage.responsible_name
    ? stage.responsible_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : null;

  return (
    <div className="relative overflow-hidden rounded-lg border bg-card">
      {/* Swipe action buttons */}
      <div className="absolute right-0 top-0 bottom-0 flex">
        <button
          onClick={() => onEdit(stage)}
          className="flex w-20 items-center justify-center bg-blue-500 text-white"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete(stage)}
          className="flex w-20 items-center justify-center bg-destructive text-destructive-foreground"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Card content */}
      <div
        className="relative z-10 bg-card p-4 transition-transform"
        style={{ transform: `translateX(-${swipeX}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-sm truncate">{stage.title}</h3>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${config.className}`}>
                {t(config.label)}
              </span>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2 mb-2">
              <Progress value={stage.progress} className="h-1.5 flex-1" />
              <span className="text-[10px] text-muted-foreground font-medium w-8 text-right">{stage.progress}%</span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {format(new Date(stage.start_date), 'dd/MM')} – {format(new Date(stage.end_date), 'dd/MM')}
              </span>
              {stage.service_type && stage.service_type !== 'general' && (
                <span className="truncate max-w-24">{stage.service_type}</span>
              )}
              {initials && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                  {initials}
                </span>
              )}
            </div>
          </div>

          {/* Desktop menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                <MoreVertical size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(stage)}>
                <Pencil size={14} className="mr-2" /> {t('common.edit')}
              </DropdownMenuItem>
              {stage.status !== 'completed' && (
                <DropdownMenuItem onClick={() => onComplete(stage)}>
                  <CheckCircle2 size={14} className="mr-2" /> {t('schedule.markComplete')}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={() => onDelete(stage)}>
                <Trash2 size={14} className="mr-2" /> {t('common.delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
