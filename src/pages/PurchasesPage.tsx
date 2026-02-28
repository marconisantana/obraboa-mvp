import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { Button } from '@/components/ui/button';
import { Plus, ShoppingCart } from 'lucide-react';
import PurchaseOrderCard from '@/components/purchases/PurchaseOrderCard';
import PurchaseOrderForm from '@/components/purchases/PurchaseOrderForm';

export default function PurchasesPage() {
  const { t } = useTranslation();
  const activeProject = useAppStore((s) => s.activeProject);
  const { ordersQuery, generateOrderNumber, createOrder } = usePurchaseOrders(activeProject?.id);
  const [formOpen, setFormOpen] = useState(false);
  const [nextNumber, setNextNumber] = useState('');

  if (!activeProject) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart size={48} className="text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{t('purchases.selectProject')}</p>
      </div>
    );
  }

  const orders = ordersQuery.data || [];

  const handleOpenNew = async () => {
    const num = await generateOrderNumber(activeProject.id);
    setNextNumber(num);
    setFormOpen(true);
  };

  const handleCreate = (data: any) => {
    createOrder.mutate(
      { project_id: activeProject.id, order_number: nextNumber, ...data },
      { onSuccess: () => setFormOpen(false) }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('purchases.title')}</h1>
        <Button size="sm" onClick={handleOpenNew}>
          <Plus size={14} className="mr-1" /> {t('purchases.new')}
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ShoppingCart size={48} className="text-muted-foreground mb-4" />
          <p className="font-medium">{t('purchases.noPurchases')}</p>
          <p className="text-sm text-muted-foreground">{t('purchases.noPurchasesDesc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <PurchaseOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      <PurchaseOrderForm
        open={formOpen}
        onOpenChange={setFormOpen}
        orderNumber={nextNumber}
        onSubmit={handleCreate}
        isLoading={createOrder.isPending}
      />
    </div>
  );
}
