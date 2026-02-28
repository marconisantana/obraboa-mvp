import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Stage {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  service_type: string;
  environment: string | null;
  responsible_name: string | null;
  start_date: string;
  end_date: string;
  status: string;
  progress: number;
  predecessor_id: string | null;
  created_at: string;
  updated_at: string;
}

export type StageInsert = Omit<Stage, 'id' | 'created_at' | 'updated_at'>;
export type StageUpdate = Partial<StageInsert> & { id: string };

export function useStages(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = ['stages', projectId];

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!projectId) return [];
      const { data, error } = await supabase
        .from('stages' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Stage[];
    },
    enabled: !!projectId,
  });

  const createStage = useMutation({
    mutationFn: async (stage: Omit<StageInsert, 'project_id'>) => {
      if (!projectId) throw new Error('No project');
      const { data, error } = await supabase
        .from('stages' as any)
        .insert({ ...stage, project_id: projectId } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Stage;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, ...updates }: StageUpdate) => {
      const { data, error } = await supabase
        .from('stages' as any)
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Stage;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteStage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('stages' as any)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const getDependents = (stageId: string): Stage[] => {
    return (query.data ?? []).filter((s) => s.predecessor_id === stageId);
  };

  const applyDateDeltaToDependents = async (stageId: string, daysDelta: number) => {
    const dependents = getDependents(stageId);
    for (const dep of dependents) {
      const newStart = addDays(dep.start_date, daysDelta);
      const newEnd = addDays(dep.end_date, daysDelta);
      await updateStage.mutateAsync({ id: dep.id, start_date: newStart, end_date: newEnd });
      // Recursively apply to their dependents
      await applyDateDeltaToDependents(dep.id, daysDelta);
    }
  };

  return {
    stages: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createStage,
    updateStage,
    deleteStage,
    getDependents,
    applyDateDeltaToDependents,
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}
