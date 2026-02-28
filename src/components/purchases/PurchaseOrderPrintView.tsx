import { format, parseISO } from 'date-fns';
import type { PurchaseOrderDetail } from '@/hooks/usePurchaseOrders';

interface Props {
  order: PurchaseOrderDetail;
  projectName: string;
}

export default function PurchaseOrderPrintView({ order, projectName }: Props) {
  return (
    <div className="hidden print:block p-8 text-sm">
      <div className="flex items-center justify-between mb-6">
        <img src="/logo-obraboa-navy.svg" alt="ObraBoa" className="h-8" />
        <span className="text-muted-foreground text-xs">{format(parseISO(order.created_at), 'dd/MM/yyyy')}</span>
      </div>

      <h1 className="text-lg font-bold mb-1">{order.order_number}</h1>
      <p className="text-muted-foreground mb-4">{projectName}</p>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div><strong>Fornecedor:</strong> {order.supplier_name}</div>
        {order.supplier_contact && <div><strong>Contato:</strong> {order.supplier_contact}</div>}
      </div>

      {order.items.length > 0 && (
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1 pr-2">#</th>
              <th className="text-left py-1">Descrição</th>
              <th className="text-right py-1 px-2">Qtd</th>
              <th className="text-left py-1">Unid.</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={item.id} className="border-b">
                <td className="py-1 pr-2">{i + 1}</td>
                <td className="py-1">{item.description}</td>
                <td className="text-right py-1 px-2">{item.quantity}</td>
                <td className="py-1">{item.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {order.observations && (
        <div>
          <strong>Observações:</strong>
          <p className="whitespace-pre-wrap mt-1">{order.observations}</p>
        </div>
      )}
    </div>
  );
}
