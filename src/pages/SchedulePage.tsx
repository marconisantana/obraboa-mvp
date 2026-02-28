import { useTranslation } from 'react-i18next';
import { CalendarDays } from 'lucide-react';

export default function SchedulePage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <CalendarDays size={48} className="mb-3 text-muted-foreground/50" />
      <h1 className="text-xl font-bold">{t('schedule.title')}</h1>
      <p className="text-muted-foreground">{t('schedule.comingSoon')}</p>
    </div>
  );
}
