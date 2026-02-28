import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';

interface PaymentRow {
  due_date: string;
  amount: number;
}

interface DossierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    supplier_name: string;
    agreed_value: number;
    observations: string;
    payments: PaymentRow[];
  }) => void;
  initialData?: {
    name: string;
    supplier_name: string;
    agreed_value: number;
    observations: string;
  };
  isLoading?: boolean;
}

export default function DossierForm({ open, onOpenChange, onSubmit, initialData, isLoading }: DossierFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [supplier, setSupplier] = useState('');
  const [agreedValue, setAgreedValue] = useState(0);
  const [observations, setObservations] = useState('');
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  useEffect(() => {
    if (open && initialData) {
      setName(initialData.name);
      setSupplier(initialData.supplier_name);
      setAgreedValue(initialData.agreed_value);
      setObservations(initialData.observations);
      setPayments([]);
    } else if (open) {
      setName('');
      setSupplier('');
      setAgreedValue(0);
      setObservations('');
      setPayments([]);
    }
  }, [open, initialData]);

  const addPayment = () => setPayments([...payments, { due_date: '', amount: 0 }]);
  const removePayment = (i: number) => setPayments(payments.filter((_, idx) => idx !== i));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name,
      supplier_name: supplier,
      agreed_value: agreedValue,
      observations,
      payments: payments.filter((p) => p.due_date && p.amount > 0),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? t('dossiers.edit') : t('dossiers.new')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>{t('dossiers.name')}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>{t('dossiers.supplier')}</Label>
            <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} />
          </div>
          <div>
            <Label>{t('dossiers.agreedValue')}</Label>
            <Input type="number" value={agreedValue} onChange={(e) => setAgreedValue(Number(e.target.value))} min={0} step={0.01} />
          </div>
          <div>
            <Label>{t('dossiers.observations')}</Label>
            <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={3} />
          </div>

          {!initialData && (
            <div>
              <Label>{t('dossiers.payments')}</Label>
              <div className="space-y-2 mt-2">
                {payments.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input type="date" value={p.due_date} onChange={(e) => {
                      const updated = [...payments];
                      updated[i].due_date = e.target.value;
                      setPayments(updated);
                    }} className="flex-1" />
                    <Input type="number" value={p.amount || ''} onChange={(e) => {
                      const updated = [...payments];
                      updated[i].amount = Number(e.target.value);
                      setPayments(updated);
                    }} className="w-28" placeholder={t('dossiers.amount')} min={0.01} step={0.01} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePayment(i)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addPayment}>
                  <Plus size={14} className="mr-1" /> {t('dossiers.addPayment')}
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
            <Button type="submit" disabled={isLoading}>{t('common.save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
