import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle } from 'lucide-react';
import type { Dossier } from '@/hooks/useDossiers';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const statusColors: Record<string, string> = {
  in_progress: 'bg-yellow-100 text-yellow-700',
  settled: 'bg-green-100 text-green-700',
  exceeded: 'bg-red-100 text-red-700',
};

export default function DossierCard({ dossier }: { dossier: Dossier }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const total = dossier.agreed_value + dossier.additive_value;
  const paid = dossier.total_paid || 0;
  const remaining = Math.max(total - paid, 0);
  const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/dossiers/${dossier.id}`)}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">{dossier.name}</p>
            {dossier.supplier_name && <p className="text-xs text-muted-foreground">{dossier.supplier_name}</p>}
          </div>
          <Badge variant="secondary" className={`${statusColors[dossier.computed_status || 'in_progress']} flex items-center gap-1`}>
            {(dossier.computed_status === 'exceeded') && <AlertTriangle size={12} />}
            {t(`dossiers.${dossier.computed_status || 'in_progress'}`)}
          </Badge>
        </div>

        <Progress value={pct} className="h-2" />

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">{t('dossiers.totalAgreed')}</p>
            <p className="font-semibold">{fmt.format(total)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('dossiers.totalPaid')}</p>
            <p className="font-semibold">{fmt.format(paid)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('dossiers.remaining')}</p>
            <p className="font-semibold">{fmt.format(remaining)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
