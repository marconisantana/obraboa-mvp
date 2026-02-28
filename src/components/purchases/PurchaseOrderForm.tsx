import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus } from 'lucide-react';

interface ItemRow {
  description: string;
  quantity: number;
  unit: string;
}

interface PurchaseOrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  onSubmit: (data: {
    supplier_name: string;
    supplier_contact: string;
    observations: string;
    items: ItemRow[];
  }) => void;
  initialData?: {
    supplier_name: string;
    supplier_contact: string;
    observations: string;
    items: ItemRow[];
  };
  isLoading?: boolean;
}

export default function PurchaseOrderForm({ open, onOpenChange, orderNumber, onSubmit, initialData, isLoading }: PurchaseOrderFormProps) {
  const { t } = useTranslation();
  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [observations, setObservations] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ description: '', quantity: 1, unit: 'un' }]);

  useEffect(() => {
    if (open && initialData) {
      setSupplierName(initialData.supplier_name);
      setSupplierContact(initialData.supplier_contact);
      setObservations(initialData.observations);
      setItems(initialData.items.length > 0 ? initialData.items : [{ description: '', quantity: 1, unit: 'un' }]);
    } else if (open) {
      setSupplierName('');
      setSupplierContact('');
      setObservations('');
      setItems([{ description: '', quantity: 1, unit: 'un' }]);
    }
  }, [open, initialData]);

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit: 'un' }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof ItemRow, value: string | number) => {
    const updated = [...items];
    (updated[i] as any)[field] = value;
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) return;
    const validItems = items.filter((item) => item.description.trim());
    onSubmit({ supplier_name: supplierName, supplier_contact: supplierContact, observations, items: validItems });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? t('purchases.edit') : t('purchases.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('purchases.orderNumber')}</Label>
            <Input value={orderNumber} readOnly className="bg-muted" />
          </div>
          <div>
            <Label>{t('purchases.supplierName')}</Label>
            <Input value={supplierName} onChange={(e) => setSupplierName(e.target.value)} required />
          </div>
          <div>
            <Label>{t('purchases.supplierContact')}</Label>
            <Input value={supplierContact} onChange={(e) => setSupplierContact(e.target.value)} placeholder="(11) 99999-9999 / email" />
          </div>

          <div>
            <Label>{t('purchases.items')}</Label>
            <div className="space-y-2 mt-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <Input
                    placeholder={t('purchases.itemDescription')}
                    value={item.description}
                    onChange={(e) => updateItem(i, 'description', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                    className="w-16"
                    min={0.01}
                    step={0.01}
                  />
                  <Input
                    value={item.unit}
                    onChange={(e) => updateItem(i, 'unit', e.target.value)}
                    className="w-16"
                  />
                  {items.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus size={14} className="mr-1" /> {t('purchases.addItem')}
              </Button>
            </div>
          </div>

          <div>
            <Label>{t('purchases.observations')}</Label>
            <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={3} />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading}>{t('common.save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
