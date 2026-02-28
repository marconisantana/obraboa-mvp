import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useDossiers } from '@/hooks/useDossiers';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, Plus, AlertTriangle } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import DossierForm from './DossierForm';
import PaymentRow from './PaymentRow';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const statusColors: Record<string, string> = {
  in_progress: 'bg-yellow-100 text-yellow-700',
  settled: 'bg-green-100 text-green-700',
  exceeded: 'bg-red-100 text-red-700',
};

export default function DossierDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const activeProject = useAppStore((s) => s.activeProject);
  const { detailQuery, updateDossier, deleteDossier, addPayment, markPaymentPaid, deletePayment, uploadReceipt } = useDossiers(activeProject?.id);
  const { data: dossier, isLoading } = detailQuery(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [additiveOpen, setAdditiveOpen] = useState(false);
  const [newAdditive, setNewAdditive] = useState(0);
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);

  if (isLoading) return <p className="text-center py-10 text-muted-foreground">{t('common.loading')}</p>;
  if (!dossier) return <p className="text-center py-10 text-muted-foreground">{t('common.noResults')}</p>;

  const total = dossier.agreed_value + dossier.additive_value;
  const paid = dossier.total_paid || 0;
  const pct = total > 0 ? Math.min((paid / total) * 100, 100) : 0;

  const handleEdit = (data: any) => {
    updateDossier.mutate({ id: dossier.id, ...data }, { onSuccess: () => setEditOpen(false) });
  };

  const handleDelete = () => {
    deleteDossier.mutate(dossier.id, { onSuccess: () => navigate('/dossiers') });
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentDate || paymentAmount <= 0) return;
    addPayment.mutate(
      { dossier_id: dossier.id, due_date: paymentDate, amount: paymentAmount },
      { onSuccess: () => { setAddPaymentOpen(false); setPaymentDate(''); setPaymentAmount(0); } }
    );
  };

  const handleAdditive = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdditive <= 0) return;
    updateDossier.mutate(
      { id: dossier.id, additive_value: dossier.additive_value + newAdditive },
      { onSuccess: () => { setAdditiveOpen(false); setNewAdditive(0); } }
    );
  };

  return (
    <>
      <div className="space-y-4">
        <button onClick={() => navigate('/dossiers')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        {/* Exceeded warning */}
        {dossier.computed_status === 'exceeded' && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle size={16} />
            {t('dossiers.exceededWarning', { paid: fmt.format(paid), agreed: fmt.format(total) })}
          </div>
        )}

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold">{dossier.name}</h1>
                {dossier.supplier_name && <p className="text-sm text-muted-foreground">{dossier.supplier_name}</p>}
              </div>
              <Badge variant="secondary" className={statusColors[dossier.computed_status || 'in_progress']}>
                {t(`dossiers.${dossier.computed_status || 'in_progress'}`)}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('dossiers.progressLabel', { paid: fmt.format(paid), total: fmt.format(total) })}</span>
                <span className="font-semibold">{Math.round(pct)}%</span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><span className="text-muted-foreground">{t('dossiers.agreedValue')}</span><p className="font-semibold">{fmt.format(dossier.agreed_value)}</p></div>
              {dossier.additive_value > 0 && <div><span className="text-muted-foreground">{t('dossiers.additiveValue')}</span><p className="font-semibold">{fmt.format(dossier.additive_value)}</p></div>}
              <div><span className="text-muted-foreground">{t('dossiers.remaining')}</span><p className="font-semibold">{fmt.format(Math.max(total - paid, 0))}</p></div>
            </div>

            {dossier.observations && <p className="text-sm whitespace-pre-wrap text-muted-foreground">{dossier.observations}</p>}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}><Edit size={14} className="mr-1" /> {t('common.edit')}</Button>
              <Button variant="outline" size="sm" onClick={() => setAdditiveOpen(true)}><Plus size={14} className="mr-1" /> {t('dossiers.addAdditive')}</Button>
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>{t('common.delete')}</Button>
            </div>
          </CardContent>
        </Card>

        {/* Payments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{t('dossiers.payments')}</h2>
            <Button size="sm" onClick={() => setAddPaymentOpen(true)}>
              <Plus size={14} className="mr-1" /> {t('dossiers.addPayment')}
            </Button>
          </div>

          {(dossier.payments || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">{t('dossiers.pending')}</p>
          ) : (
            dossier.payments.map((p) => (
              <PaymentRow
                key={p.id}
                payment={p}
                dossierId={dossier.id}
                onMarkPaid={(pid) => markPaymentPaid.mutate(pid)}
                onUploadReceipt={(pid, file) => uploadReceipt(pid, dossier.id, file)}
                onDelete={(pid) => deletePayment.mutate(pid)}
              />
            ))
          )}
        </div>
      </div>

      {/* Edit dialog */}
      <DossierForm
        open={editOpen}
        onOpenChange={setEditOpen}
        onSubmit={handleEdit}
        initialData={{ name: dossier.name, supplier_name: dossier.supplier_name || '', agreed_value: dossier.agreed_value, observations: dossier.observations || '' }}
        isLoading={updateDossier.isPending}
      />

      {/* Add payment dialog */}
      <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t('dossiers.addPayment')}</DialogTitle></DialogHeader>
          <form onSubmit={handleAddPayment} className="space-y-4">
            <div><Label>{t('dossiers.dueDate')}</Label><Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} required /></div>
            <div><Label>{t('dossiers.amount')}</Label><Input type="number" value={paymentAmount || ''} onChange={(e) => setPaymentAmount(Number(e.target.value))} min={0.01} step={0.01} required /></div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setAddPaymentOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.save')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Additive dialog */}
      <Dialog open={additiveOpen} onOpenChange={setAdditiveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{t('dossiers.addAdditive')}</DialogTitle></DialogHeader>
          <form onSubmit={handleAdditive} className="space-y-4">
            <div><Label>{t('dossiers.additiveValue')}</Label><Input type="number" value={newAdditive || ''} onChange={(e) => setNewAdditive(Number(e.target.value))} min={0.01} step={0.01} required /></div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setAdditiveOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit">{t('common.save')}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('dossiers.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
