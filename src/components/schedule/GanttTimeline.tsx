import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, differenceInDays } from 'date-fns';
import type { Stage } from '@/hooks/useStages';

interface GanttTimelineProps {
  stages: Stage[];
  onStageClick: (stage: Stage) => void;
}

const statusColors: Record<string, string> = {
  pending: 'bg-muted',
  in_progress: 'bg-blue-400',
  completed: 'bg-green-500',
  delayed: 'bg-red-500',
};

function getDisplayStatus(stage: Stage): string {
  if (stage.status === 'completed') return 'completed';
  const today = new Date().toISOString().split('T')[0];
  if (stage.end_date < today) return 'delayed';
  return stage.status;
}

export default function GanttTimeline({ stages, onStageClick }: GanttTimelineProps) {
  const { t } = useTranslation();

  const { timelineStart, totalDays, dayMarkers } = useMemo(() => {
    if (!stages.length) return { timelineStart: new Date(), totalDays: 1, dayMarkers: [] };

    const starts = stages.map((s) => new Date(s.start_date).getTime());
    const ends = stages.map((s) => new Date(s.end_date).getTime());
    const minDate = new Date(Math.min(...starts));
    const maxDate = new Date(Math.max(...ends));
    const total = Math.max(differenceInDays(maxDate, minDate) + 1, 1);

    // Generate markers (every 7 days or fewer if short)
    const step = total > 30 ? 7 : total > 14 ? 3 : 1;
    const markers: { day: number; label: string }[] = [];
    for (let i = 0; i <= total; i += step) {
      const d = new Date(minDate);
      d.setDate(d.getDate() + i);
      markers.push({ day: i, label: format(d, 'dd/MM') });
    }

    return { timelineStart: minDate, totalDays: total, dayMarkers: markers };
  }, [stages]);

  if (!stages.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground">{t('schedule.noStages')}</p>
      </div>
    );
  }

  const DAY_WIDTH = 40;
  const totalWidth = totalDays * DAY_WIDTH;
  const ROW_HEIGHT = 40;
  const HEADER_HEIGHT = 32;

  // Build predecessor connections
  const connections = stages
    .filter((s) => s.predecessor_id)
    .map((s) => {
      const pred = stages.find((p) => p.id === s.predecessor_id);
      if (!pred) return null;
      return { from: pred, to: s };
    })
    .filter(Boolean) as { from: Stage; to: Stage }[];

  return (
    <div className="overflow-x-auto rounded-lg border bg-card">
      <div style={{ minWidth: totalWidth + 200, position: 'relative' }}>
        {/* Header with day markers */}
        <div className="flex border-b" style={{ height: HEADER_HEIGHT, paddingLeft: 160 }}>
          {dayMarkers.map((m) => (
            <div
              key={m.day}
              className="text-[10px] text-muted-foreground border-l border-border/40 pl-1"
              style={{ position: 'absolute', left: 160 + m.day * DAY_WIDTH }}
            >
              {m.label}
            </div>
          ))}
        </div>

        {/* Rows */}
        {stages.map((stage, i) => {
          const stageStart = differenceInDays(new Date(stage.start_date), timelineStart);
          const stageDuration = Math.max(differenceInDays(new Date(stage.end_date), new Date(stage.start_date)) + 1, 1);
          const displayStatus = getDisplayStatus(stage);
          const color = statusColors[displayStatus] ?? statusColors.pending;

          return (
            <div
              key={stage.id}
              className="relative border-b border-border/30"
              style={{ height: ROW_HEIGHT }}
            >
              {/* Stage label */}
              <div
                className="absolute left-0 top-0 flex items-center h-full px-2 text-xs font-medium truncate"
                style={{ width: 160 }}
              >
                {stage.title}
              </div>

              {/* Bar */}
              <div
                onClick={() => onStageClick(stage)}
                className={`absolute top-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${color}`}
                style={{
                  left: 160 + stageStart * DAY_WIDTH,
                  width: stageDuration * DAY_WIDTH,
                  height: ROW_HEIGHT - 16,
                }}
                title={`${stage.title} (${stage.progress}%)`}
              >
                <span className="text-[10px] text-white font-medium px-1.5 truncate block leading-6">
                  {stage.title}
                </span>
              </div>
            </div>
          );
        })}

        {/* SVG connections */}
        <svg
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: totalWidth + 200, height: HEADER_HEIGHT + stages.length * ROW_HEIGHT }}
        >
          {connections.map(({ from, to }, i) => {
            const fromIdx = stages.findIndex((s) => s.id === from.id);
            const toIdx = stages.findIndex((s) => s.id === to.id);
            const fromEndDay = differenceInDays(new Date(from.end_date), timelineStart) + 1;
            const toStartDay = differenceInDays(new Date(to.start_date), timelineStart);

            const x1 = 160 + fromEndDay * DAY_WIDTH;
            const y1 = HEADER_HEIGHT + fromIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
            const x2 = 160 + toStartDay * DAY_WIDTH;
            const y2 = HEADER_HEIGHT + toIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--muted-foreground))" strokeWidth={1.5} strokeDasharray="4 2" />
                {/* Arrow */}
                <polygon
                  points={`${x2},${y2} ${x2 - 6},${y2 - 4} ${x2 - 6},${y2 + 4}`}
                  fill="hsl(var(--muted-foreground))"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
