import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Reference {
  id: string;
  project_id: string;
  user_id: string;
  image_url: string;
  storage_path: string | null;
  category: string;
  observation: string | null;
  created_at: string;
}

export function useReferences() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchReferences = useCallback(async (projectId: string, category?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('project_references' as any)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (category && category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReferences((data as any[]) ?? []);
    } catch (e: any) {
      toast({ title: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createFromUpload = useCallback(async (
    projectId: string, file: File, category: string, observation: string
  ) => {
    const ext = file.name.split('.').pop();
    const path = `${projectId}/${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('reference-images')
      .upload(path, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('reference-images')
      .getPublicUrl(path);

    const { error } = await (supabase.from('project_references' as any) as any)
      .insert({
        project_id: projectId,
        image_url: urlData.publicUrl,
        storage_path: path,
        category,
        observation,
      });
    if (error) throw error;
  }, []);

  const createFromUrl = useCallback(async (
    projectId: string, imageUrl: string, category: string, observation: string
  ) => {
    const { error } = await (supabase.from('project_references' as any) as any)
      .insert({
        project_id: projectId,
        image_url: imageUrl,
        category,
        observation,
      });
    if (error) throw error;
  }, []);

  const updateObservation = useCallback(async (refId: string, observation: string) => {
    const { error } = await (supabase.from('project_references' as any) as any)
      .update({ observation })
      .eq('id', refId);
    if (error) throw error;
  }, []);

  const updateCategory = useCallback(async (refId: string, category: string) => {
    const { error } = await (supabase.from('project_references' as any) as any)
      .update({ category })
      .eq('id', refId);
    if (error) throw error;
  }, []);

  const deleteReference = useCallback(async (ref: Reference) => {
    if (ref.storage_path) {
      await supabase.storage.from('reference-images').remove([ref.storage_path]);
    }
    const { error } = await (supabase.from('project_references' as any) as any)
      .delete()
      .eq('id', ref.id);
    if (error) throw error;
  }, []);

  return {
    references,
    loading,
    fetchReferences,
    createFromUpload,
    createFromUrl,
    updateObservation,
    updateCategory,
    deleteReference,
  };
}
