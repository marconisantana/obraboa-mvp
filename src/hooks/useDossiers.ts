import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Dossier {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  supplier_name: string | null;
  agreed_value: number;
  additive_value: number;
  observations: string | null;
  created_at: string;
  updated_at: string;
  total_paid?: number;
  computed_status?: 'in_progress' | 'settled' | 'exceeded';
}

export interface DossierPayment {
  id: string;
  dossier_id: string;
  due_date: string;
  amount: number;
  status: string;
  paid_date: string | null;
  receipt_path: string | null;
  created_at: string;
}

export interface DossierDetail extends Dossier {
  payments: DossierPayment[];
}

function computeStatus(agreed: number, additive: number, totalPaid: number): 'in_progress' | 'settled' | 'exceeded' {
  const total = Number(agreed) + Number(additive);
  if (totalPaid > total) return 'exceeded';
  if (total > 0 && totalPaid >= total) return 'settled';
  return 'in_progress';
}

export function useDossiers(projectId: string | undefined) {
  const queryClient = useQueryClient();

  const dossiersQuery = useQuery({
    queryKey: ['dossiers', projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dossiers')
        .select('*')
        .eq('project_id', projectId!)
        .order('updated_at', { ascending: false });
      if (error) throw error;

      const dossierIds = (data || []).map((d: any) => d.id);
      let paidMap: Record<string, number> = {};
      if (dossierIds.length > 0) {
        const { data: payments } = await supabase
          .from('dossier_payments')
          .select('dossier_id, amount, status')
          .in('dossier_id', dossierIds);
        (payments || []).forEach((p: any) => {
          if (p.status === 'paid') {
            paidMap[p.dossier_id] = (paidMap[p.dossier_id] || 0) + Number(p.amount);
          }
        });
      }

      return (data || []).map((d: any) => {
        const totalPaid = paidMap[d.id] || 0;
        return {
          ...d,
          agreed_value: Number(d.agreed_value),
          additive_value: Number(d.additive_value),
          total_paid: totalPaid,
          computed_status: computeStatus(d.agreed_value, d.additive_value, totalPaid),
        };
      }) as Dossier[];
    },
  });

  const detailQuery = (dossierId: string | undefined) =>
    useQuery({
      queryKey: ['dossier_detail', dossierId],
      enabled: !!dossierId,
      queryFn: async () => {
        const { data: dossier, error } = await supabase
          .from('dossiers')
          .select('*')
          .eq('id', dossierId!)
          .single();
        if (error) throw error;

        const { data: payments } = await supabase
          .from('dossier_payments')
          .select('*')
          .eq('dossier_id', dossierId!)
          .order('due_date');

        const totalPaid = (payments || [])
          .filter((p: any) => p.status === 'paid')
          .reduce((s: number, p: any) => s + Number(p.amount), 0);

        return {
          ...dossier,
          agreed_value: Number(dossier.agreed_value),
          additive_value: Number(dossier.additive_value),
          total_paid: totalPaid,
          computed_status: computeStatus(dossier.agreed_value, dossier.additive_value, totalPaid),
          payments: (payments || []).map((p: any) => ({ ...p, amount: Number(p.amount) })),
        } as DossierDetail;
      },
    });

  const createDossier = useMutation({
    mutationFn: async (data: {
      project_id: string;
      name: string;
      supplier_name?: string;
      agreed_value: number;
      observations?: string;
      payments?: { due_date: string; amount: number }[];
    }) => {
      const { payments, ...dossierData } = data;
      const { data: dossier, error } = await supabase
        .from('dossiers')
        .insert(dossierData)
        .select()
        .single();
      if (error) throw error;

      if (payments && payments.length > 0) {
        const rows = payments.map((p) => ({ dossier_id: dossier.id, due_date: p.due_date, amount: p.amount }));
        await supabase.from('dossier_payments').insert(rows);
      }
      return dossier;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dossiers', projectId] }),
  });

  const updateDossier = useMutation({
    mutationFn: async (data: { id: string; name?: string; supplier_name?: string; agreed_value?: number; additive_value?: number; observations?: string }) => {
      const { id, ...updates } = data;
      const { error } = await supabase.from('dossiers').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
      queryClient.invalidateQueries({ queryKey: ['dossier_detail'] });
    },
  });

  const deleteDossier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('dossiers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dossiers', projectId] }),
  });

  const addPayment = useMutation({
    mutationFn: async (data: { dossier_id: string; due_date: string; amount: number }) => {
      const { error } = await supabase.from('dossier_payments').insert(data);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dossier_detail'] }),
  });

  const markPaymentPaid = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from('dossier_payments')
        .update({ status: 'paid', paid_date: new Date().toISOString().split('T')[0] })
        .eq('id', paymentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dossier_detail'] });
      queryClient.invalidateQueries({ queryKey: ['dossiers'] });
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase.from('dossier_payments').delete().eq('id', paymentId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dossier_detail'] }),
  });

  const uploadReceipt = async (paymentId: string, dossierId: string, file: File) => {
    const ext = file.name.split('.').pop();
    const path = `${dossierId}/${paymentId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('dossier-receipts').upload(path, file);
    if (uploadError) throw uploadError;

    const { error } = await supabase
      .from('dossier_payments')
      .update({ receipt_path: path })
      .eq('id', paymentId);
    if (error) throw error;

    queryClient.invalidateQueries({ queryKey: ['dossier_detail'] });
    return path;
  };

  return { dossiersQuery, detailQuery, createDossier, updateDossier, deleteDossier, addPayment, markPaymentPaid, deletePayment, uploadReceipt };
}
