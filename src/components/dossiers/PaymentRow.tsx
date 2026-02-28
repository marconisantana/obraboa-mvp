import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Upload, Trash2, FileText } from 'lucide-react';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { DossierPayment } from '@/hooks/useDossiers';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function getPaymentStatus(payment: DossierPayment): 'paid' | 'overdue' | 'pending' {
  if (payment.status === 'paid') return 'paid';
  if (isBefore(parseISO(payment.due_date), startOfDay(new Date()))) return 'overdue';
  return 'pending';
}

const statusBadge: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
};

interface PaymentRowProps {
  payment: DossierPayment;
  dossierId: string;
  onMarkPaid: (id: string) => void;
  onUploadReceipt: (id: string, file: File) => void;
  onDelete: (id: string) => void;
}

export default function PaymentRowComponent({ payment, dossierId, onMarkPaid, onUploadReceipt, onDelete }: PaymentRowProps) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const displayStatus = getPaymentStatus(payment);

  const receiptUrl = payment.receipt_path
    ? supabase.storage.from('dossier-receipts').getPublicUrl(payment.receipt_path).data.publicUrl
    : null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium">{fmt.format(payment.amount)}</p>
          <p className="text-xs text-muted-foreground">{t('dossiers.dueDate')}: {format(parseISO(payment.due_date), 'dd/MM/yyyy')}</p>
          {payment.paid_date && <p className="text-xs text-muted-foreground">{t('dossiers.paidDate')}: {format(parseISO(payment.paid_date), 'dd/MM/yyyy')}</p>}
        </div>
        <Badge variant="secondary" className={statusBadge[displayStatus]}>{t(`dossiers.${displayStatus}`)}</Badge>
      </div>

      <div className="flex gap-2 flex-wrap">
        {displayStatus !== 'paid' && (
          <Button variant="outline" size="sm" onClick={() => onMarkPaid(payment.id)}>
            <Check size={12} className="mr-1" /> {t('dossiers.markPaid')}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload size={12} className="mr-1" /> {t('dossiers.uploadReceipt')}
        </Button>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUploadReceipt(payment.id, file);
          e.target.value = '';
        }} />
        {receiptUrl && (
          <Button variant="ghost" size="sm" onClick={() => window.open(receiptUrl, '_blank')}>
            <FileText size={12} className="mr-1" /> Ver
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onDelete(payment.id)}>
          <Trash2 size={12} className="text-destructive" />
        </Button>
      </div>
    </div>
  );
}
