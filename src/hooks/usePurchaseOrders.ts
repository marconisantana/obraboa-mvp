import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PurchaseOrder {
  id: string;
  project_id: string;
  user_id: string;
  order_number: string;
  supplier_name: string;
  supplier_contact: string | null;
  observations: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface PurchaseOrderItem {
  id: string;
  order_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  sort_order: number;
}

export interface PurchaseOrderDetail extends PurchaseOrder {
  items: PurchaseOrderItem[];
}

export function usePurchaseOrders(projectId: string | undefined) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['purchase_orders', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Get item counts
      const orderIds = (data || []).map((o: any) => o.id);
      let itemCounts: Record<string, number> = {};
      if (orderIds.length > 0) {
        const { data: items } = await supabase
          .from('purchase_order_items')
          .select('order_id')
          .in('order_id', orderIds);
        (items || []).forEach((item: any) => {
          itemCounts[item.order_id] = (itemCounts[item.order_id] || 0) + 1;
        });
      }

      return (data || []).map((o: any) => ({ ...o, item_count: itemCounts[o.id] || 0 })) as PurchaseOrder[];
    },
  });

  const detailQuery = (orderId: string | undefined) =>
    useQuery({
      queryKey: ['purchase_order_detail', orderId],
      enabled: !!orderId,
      queryFn: async () => {
        const { data: order, error } = await supabase
          .from('purchase_orders')
          .select('*')
          .eq('id', orderId!)
          .single();
        if (error) throw error;

        const { data: items } = await supabase
          .from('purchase_order_items')
          .select('*')
          .eq('order_id', orderId!)
          .order('sort_order');

        return { ...order, items: items || [] } as PurchaseOrderDetail;
      },
    });

  const generateOrderNumber = async (projId: string): Promise<string> => {
    const { count } = await supabase
      .from('purchase_orders')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', projId);
    return `OC-${String((count || 0) + 1).padStart(3, '0')}`;
  };

  const createOrder = useMutation({
    mutationFn: async (data: {
      project_id: string;
      order_number: string;
      supplier_name: string;
      supplier_contact?: string;
      observations?: string;
      items: { description: string; quantity: number; unit: string; unit_price?: number }[];
    }) => {
      const { items, ...orderData } = data;
      const { data: order, error } = await supabase
        .from('purchase_orders')
        .insert(orderData)
        .select()
        .single();
      if (error) throw error;

      if (items.length > 0) {
        const itemRows = items.map((item, i) => ({
          order_id: order.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price || 0,
          sort_order: i,
        }));
        const { error: itemError } = await supabase.from('purchase_order_items').insert(itemRows);
        if (itemError) throw itemError;
      }
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders', projectId] });
    },
  });

  const updateOrder = useMutation({
    mutationFn: async (data: {
      id: string;
      supplier_name?: string;
      supplier_contact?: string;
      observations?: string;
      status?: string;
      items?: { id?: string; description: string; quantity: number; unit: string; unit_price?: number }[];
    }) => {
      const { id, items, ...updates } = data;
      const { error } = await supabase.from('purchase_orders').update(updates).eq('id', id);
      if (error) throw error;

      if (items !== undefined) {
        await supabase.from('purchase_order_items').delete().eq('order_id', id);
        if (items.length > 0) {
          const itemRows = items.map((item, i) => ({
            order_id: id,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unit_price || 0,
            sort_order: i,
          }));
          const { error: ie } = await supabase.from('purchase_order_items').insert(itemRows);
          if (ie) throw ie;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase_order_detail'] });
    },
  });

  const deleteOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase_orders', projectId] });
    },
  });

  return { ordersQuery, detailQuery, generateOrderNumber, createOrder, updateOrder, deleteOrder };
}
