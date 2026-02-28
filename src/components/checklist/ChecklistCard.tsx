import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, User } from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import type { Checklist } from '@/hooks/useChecklists';

interface Props {
  checklist: Checklist;
}

function getDisplayStatus(checklist: Checklist): string {
  if (checklist.status === 'completed') return 'completed';
  if (
    checklist.due_date &&
    isBefore(new Date(checklist.due_date), startOfDay(new Date())) &&
    (checklist.checked_items ?? 0) < (checklist.total_items ?? 0)
  ) {
    return 'delayed';
  }
  return 'in_progress';
}

const statusStyles: Record<string, string> = {
  in_progress: 'bg-primary/10 text-primary',
  completed: 'bg-success/20 text-success',
  delayed: 'bg-destructive/20 text-destructive',
};

export default function ChecklistCard({ checklist }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const status = getDisplayStatus(checklist);
  const total = checklist.total_items ?? 0;
  const checked = checklist.checked_items ?? 0;
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
      onClick={() => navigate(`/checklists/${checklist.id}`)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">{checklist.name}</h3>
          <Badge variant="secondary" className={`shrink-0 text-[10px] ${statusStyles[status]}`}>
            {t(`checklist.${status}`)}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{checked}/{total} itens</span>
            <span>{percent}%</span>
          </div>
          <Progress value={percent} className="h-1.5" />
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {checklist.due_date && (
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {format(new Date(checklist.due_date), 'dd/MM/yyyy')}
            </span>
          )}
          {checklist.responsible_name && (
            <span className="flex items-center gap-1">
              <User size={12} />
              {checklist.responsible_name}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
