import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, FileDown } from 'lucide-react';
import { useRdos } from '@/hooks/useRdos';

interface WeeklySummaryProps {
  onClose: () => void;
}

export default function WeeklySummary({ onClose }: WeeklySummaryProps) {
  const { t } = useTranslation();
  const { weeklySummary, isLoadingWeekly } = useRdos();

  const handlePrint = () => window.print();

  if (isLoadingWeekly) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!weeklySummary || weeklySummary.rdos.length === 0) {
    return (
      <div className="space-y-4">
        <button onClick={onClose} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <p className="text-center text-muted-foreground py-10">{t('rdo.noRdos')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <FileDown size={14} className="mr-1" /> {t('rdo.export')}
        </Button>
      </div>

      <h2 className="text-lg font-bold">{t('rdo.weeklySummary')}</h2>
      <p className="text-sm text-muted-foreground">
        Total: {weeklySummary.totalHours}h · {weeklySummary.rdos.length} RDOs
      </p>

      {/* Activities per day */}
      <div className="space-y-3 print-content">
        {weeklySummary.rdos.map((rdo) => (
          <Card key={rdo.id}>
            <CardContent className="p-3">
              <p className="text-sm font-semibold capitalize">
                {format(parseISO(rdo.date), "EEEE, dd/MM", { locale: ptBR })}
              </p>
              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{rdo.activities}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Photos grid */}
      {weeklySummary.allPhotos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-2">{t('rdo.photos')}</h3>
          <div className="grid grid-cols-3 gap-2">
            {weeklySummary.allPhotos.map((photo) => (
              <img
                key={photo.id}
                src={photo.url}
                alt={photo.caption || ''}
                className="w-full h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
