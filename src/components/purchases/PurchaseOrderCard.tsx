import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Package } from 'lucide-react';
import type { PurchaseOrder } from '@/hooks/usePurchaseOrders';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  received: 'bg-orange-100 text-orange-700',
};

export default function PurchaseOrderCard({ order }: { order: PurchaseOrder }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/purchases/${order.id}`)}>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{order.order_number}</span>
          <Badge variant="secondary" className={statusColors[order.status] || ''}>
            {t(`purchases.${order.status}`)}
          </Badge>
        </div>
        <p className="text-sm font-medium">{order.supplier_name}</p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{format(parseISO(order.created_at), 'dd/MM/yyyy')}</span>
          <span className="flex items-center gap-1"><Package size={12} /> {order.item_count || 0} {t('purchases.items')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
