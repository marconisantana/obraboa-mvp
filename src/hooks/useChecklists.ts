import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';

export interface Checklist {
  id: string;
  project_id: string;
  user_id: string;
  name: string;
  status: string;
  responsible_name: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  total_items?: number;
  checked_items?: number;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  checked: boolean;
  responsible_name: string | null;
  due_date: string | null;
  sort_order: number;
  created_at: string;
  photos?: ChecklistItemPhoto[];
}

export interface ChecklistItemPhoto {
  id: string;
  item_id: string;
  storage_path: string;
  created_at: string;
}

export interface ChecklistDetail extends Checklist {
  items: ChecklistItem[];
}

export const CHECKLIST_TEMPLATES: Record<string, string[]> = {
  inspection: [
    'Verificar paredes e revestimentos',
    'Verificar piso',
    'Verificar esquadrias',
    'Verificar instalações elétricas',
    'Verificar instalações hidráulicas',
    'Verificar pintura',
    'Verificar louças e metais',
    'Verificar portas e fechaduras',
  ],
  cleaning: [
    'Remover entulhos',
    'Limpeza grossa de pisos',
    'Limpeza de vidros',
    'Limpeza de bancadas',
    'Limpeza de louças sanitárias',
    'Aspirar todos os ambientes',
    'Limpeza final de pisos',
  ],
  handover: [
    'Testar todas as chaves',
    'Verificar funcionamento de fechaduras',
    'Testar interfone',
    'Verificar medidores (água, luz, gás)',
    'Assinar termo de entrega',
    'Entregar manual do proprietário',
  ],
  blank: [],
};

export function useChecklists() {
  const queryClient = useQueryClient();
  const activeProject = useAppStore((s) => s.activeProject);
  const { toast } = useToast();
  const projectId = activeProject?.id;

  const checklistsQuery = useQuery({
    queryKey: ['checklists', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data: checklists, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });
      if (error) throw error;

      // Get item counts
      const ids = checklists.map((c: any) => c.id);
      if (ids.length === 0) return [];

      const { data: items, error: itemsError } = await supabase
        .from('checklist_items')
        .select('id, checklist_id, checked')
        .in('checklist_id', ids);
      if (itemsError) throw itemsError;

      return checklists.map((c: any) => {
        const cItems = (items || []).filter((i: any) => i.checklist_id === c.id);
        return {
          ...c,
          total_items: cItems.length,
          checked_items: cItems.filter((i: any) => i.checked).length,
        };
      }) as Checklist[];
    },
    enabled: !!projectId,
  });

  const checklistDetailQuery = (checklistId: string | undefined) =>
    useQuery({
      queryKey: ['checklist-detail', checklistId],
      queryFn: async () => {
        if (!checklistId) return null;
        const { data: checklist, error } = await supabase
          .from('checklists')
          .select('*')
          .eq('id', checklistId)
          .single();
        if (error) throw error;

        const { data: items, error: itemsError } = await supabase
          .from('checklist_items')
          .select('*')
          .eq('checklist_id', checklistId)
          .order('sort_order', { ascending: true });
        if (itemsError) throw itemsError;

        // Get photos for all items
        const itemIds = (items || []).map((i: any) => i.id);
        let photos: any[] = [];
        if (itemIds.length > 0) {
          const { data: p } = await supabase
            .from('checklist_item_photos')
            .select('*')
            .in('item_id', itemIds);
          photos = p || [];
        }

        const itemsWithPhotos = (items || []).map((item: any) => ({
          ...item,
          photos: photos.filter((p: any) => p.item_id === item.id),
        }));

        return { ...checklist, items: itemsWithPhotos } as ChecklistDetail;
      },
      enabled: !!checklistId,
    });

  const createChecklist = useMutation({
    mutationFn: async ({
      name,
      responsible_name,
      due_date,
      templateKey,
    }: {
      name: string;
      responsible_name?: string;
      due_date?: string;
      templateKey?: string;
    }) => {
      if (!projectId) throw new Error('No project selected');
      const { data: checklist, error } = await supabase
        .from('checklists')
        .insert({ project_id: projectId, name, responsible_name: responsible_name || '', due_date: due_date || null })
        .select()
        .single();
      if (error) throw error;

      // Create template items
      const templateItems = templateKey ? CHECKLIST_TEMPLATES[templateKey] || [] : [];
      if (templateItems.length > 0) {
        const rows = templateItems.map((text, i) => ({
          checklist_id: checklist.id,
          text,
          sort_order: i,
        }));
        const { error: itemsError } = await supabase.from('checklist_items').insert(rows);
        if (itemsError) throw itemsError;
      }
      return checklist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', projectId] });
    },
  });

  const updateChecklist = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; responsible_name?: string; due_date?: string | null; status?: string }) => {
      const { error } = await supabase.from('checklists').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', projectId] });
    },
  });

  const deleteChecklist = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('checklists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists', projectId] });
    },
  });

  const toggleItem = useMutation({
    mutationFn: async ({ itemId, checked, checklistId }: { itemId: string; checked: boolean; checklistId: string }) => {
      const { error } = await supabase.from('checklist_items').update({ checked }).eq('id', itemId);
      if (error) throw error;
    },
    onMutate: async ({ itemId, checked, checklistId }) => {
      await queryClient.cancelQueries({ queryKey: ['checklist-detail', checklistId] });
      const prev = queryClient.getQueryData<ChecklistDetail>(['checklist-detail', checklistId]);
      if (prev) {
        queryClient.setQueryData<ChecklistDetail>(['checklist-detail', checklistId], {
          ...prev,
          items: prev.items.map((item) => (item.id === itemId ? { ...item, checked } : item)),
        });
      }
      return { prev };
    },
    onError: (_err, { checklistId }, context) => {
      if (context?.prev) {
        queryClient.setQueryData(['checklist-detail', checklistId], context.prev);
      }
      toast({ title: 'Erro ao atualizar item', variant: 'destructive' });
    },
    onSettled: (_data, _err, { checklistId }) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-detail', checklistId] });
      queryClient.invalidateQueries({ queryKey: ['checklists', projectId] });
    },
  });

  const addItem = useMutation({
    mutationFn: async ({ checklistId, text, sort_order }: { checklistId: string; text: string; sort_order: number }) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert({ checklist_id: checklistId, text, sort_order })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { checklistId }) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-detail', checklistId] });
      queryClient.invalidateQueries({ queryKey: ['checklists', projectId] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async ({ itemId, checklistId }: { itemId: string; checklistId: string }) => {
      const { error } = await supabase.from('checklist_items').delete().eq('id', itemId);
      if (error) throw error;
    },
    onSuccess: (_data, { checklistId }) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-detail', checklistId] });
      queryClient.invalidateQueries({ queryKey: ['checklists', projectId] });
    },
  });

  const reorderItems = useMutation({
    mutationFn: async ({ items }: { items: { id: string; sort_order: number }[] }) => {
      for (const item of items) {
        await supabase.from('checklist_items').update({ sort_order: item.sort_order }).eq('id', item.id);
      }
    },
  });

  const uploadItemPhoto = useMutation({
    mutationFn: async ({ itemId, checklistId, file }: { itemId: string; checklistId: string; file: File }) => {
      const ext = file.name.split('.').pop();
      const path = `${checklistId}/${itemId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('checklist-photos').upload(path, file);
      if (uploadError) throw uploadError;
      const { error } = await supabase.from('checklist_item_photos').insert({ item_id: itemId, storage_path: path });
      if (error) throw error;
    },
    onSuccess: (_data, { checklistId }) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-detail', checklistId] });
    },
  });

  const deleteItemPhoto = useMutation({
    mutationFn: async ({ photoId, storagePath, checklistId }: { photoId: string; storagePath: string; checklistId: string }) => {
      await supabase.storage.from('checklist-photos').remove([storagePath]);
      const { error } = await supabase.from('checklist_item_photos').delete().eq('id', photoId);
      if (error) throw error;
    },
    onSuccess: (_data, { checklistId }) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-detail', checklistId] });
    },
  });

  return {
    checklistsQuery,
    checklistDetailQuery,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    toggleItem,
    addItem,
    deleteItem,
    reorderItems,
    uploadItemPhoto,
    deleteItemPhoto,
  };
}
