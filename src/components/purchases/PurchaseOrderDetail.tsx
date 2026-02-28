import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { usePurchaseOrders } from '@/hooks/usePurchaseOrders';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Edit, Share2, FileDown, Send } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PurchaseOrderForm from './PurchaseOrderForm';
import PurchaseOrderPrintView from './PurchaseOrderPrintView';
import { format, parseISO } from 'date-fns';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  received: 'bg-orange-100 text-orange-700',
};

export default function PurchaseOrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const activeProject = useAppStore((s) => s.activeProject);
  const { detailQuery, updateOrder, deleteOrder } = usePurchaseOrders(activeProject?.id);
  const { data: order, isLoading } = detailQuery(id);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (isLoading) return <p className="text-center py-10 text-muted-foreground">{t('common.loading')}</p>;
  if (!order) return <p className="text-center py-10 text-muted-foreground">{t('common.noResults')}</p>;

  const handlePrint = () => window.print();

  const buildSummary = () => {
    const lines = [`📋 ${order.order_number} - ${order.supplier_name}\n`];
    if (order.items.length > 0) {
      lines.push(`📦 Itens:`);
      order.items.forEach((item, i) => lines.push(`  ${i + 1}. ${item.description} - ${item.quantity} ${item.unit}`));
    }
    if (order.observations) lines.push(`\n📌 Obs: ${order.observations}`);
    return lines.join('\n');
  };

  const handleShare = (method: 'whatsapp' | 'email') => {
    const text = buildSummary();
    const encoded = encodeURIComponent(text);
    if (method === 'whatsapp') {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    } else {
      window.open(`mailto:?subject=${encodeURIComponent(order.order_number)}&body=${encoded}`, '_blank');
    }
  };

  const handleMarkSent = () => {
    updateOrder.mutate({ id: order.id, status: 'sent' });
  };

  const handleEdit = (data: any) => {
    updateOrder.mutate({ id: order.id, ...data }, { onSuccess: () => setEditOpen(false) });
  };

  const handleDelete = () => {
    deleteOrder.mutate(order.id, { onSuccess: () => navigate('/purchases') });
  };

  return (
    <>
      <div className="space-y-4 print:hidden">
        <button onClick={() => navigate('/purchases')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">{order.order_number}</h1>
              <Badge variant="secondary" className={statusColors[order.status] || ''}>{t(`purchases.${order.status}`)}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted-foreground">{t('purchases.supplierName')}:</span> {order.supplier_name}</div>
              {order.supplier_contact && <div><span className="text-muted-foreground">{t('purchases.supplierContact')}:</span> {order.supplier_contact}</div>}
              <div><span className="text-muted-foreground">{t('rdo.date')}:</span> {format(parseISO(order.created_at), 'dd/MM/yyyy')}</div>
            </div>

            {order.items.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>{t('purchases.itemDescription')}</TableHead>
                    <TableHead className="text-right">{t('purchases.quantity')}</TableHead>
                    <TableHead>{t('purchases.unit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, i) => (
                    <TableRow key={item.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {order.observations && (
              <div className="text-sm">
                <span className="text-muted-foreground">{t('purchases.observations')}:</span>
                <p className="mt-1 whitespace-pre-wrap">{order.observations}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                <Edit size={14} className="mr-1" /> {t('common.edit')}
              </Button>
              {order.status === 'draft' && (
                <Button variant="outline" size="sm" onClick={handleMarkSent}>
                  <Send size={14} className="mr-1" /> {t('purchases.markSent')}
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm"><Share2 size={14} className="mr-1" /> {t('rdo.export')}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePrint}><FileDown size={14} className="mr-2" /> {t('purchases.exportPdf')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('whatsapp')}>{t('purchases.shareWhatsapp')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare('email')}>{t('purchases.shareEmail')}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>{t('common.delete')}</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <PurchaseOrderPrintView order={order} projectName={activeProject?.name || ''} />

      <PurchaseOrderForm
        open={editOpen}
        onOpenChange={setEditOpen}
        orderNumber={order.order_number}
        onSubmit={handleEdit}
        initialData={{
          supplier_name: order.supplier_name,
          supplier_contact: order.supplier_contact || '',
          observations: order.observations || '',
          items: order.items.map((i) => ({ description: i.description, quantity: i.quantity, unit: i.unit })),
        }}
        isLoading={updateOrder.isPending}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('purchases.deleteConfirm')}</AlertDialogDescription>
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
