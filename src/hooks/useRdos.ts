import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/useAppStore';
import { subDays, format } from 'date-fns';

export interface Rdo {
  id: string;
  project_id: string;
  user_id: string;
  date: string;
  activities: string | null;
  observations: string | null;
  created_at: string;
  updated_at: string;
  photo_count?: number;
  member_count?: number;
  first_photo_url?: string | null;
}

export interface RdoTeamMember {
  id: string;
  rdo_id: string;
  name: string;
  role: string | null;
  hours_worked: number;
}

export interface RdoPhoto {
  id: string;
  rdo_id: string;
  storage_path: string;
  caption: string | null;
  annotations_json: any;
  sort_order: number;
  url?: string;
}

export interface RdoDetail extends Rdo {
  team_members: RdoTeamMember[];
  photos: RdoPhoto[];
}

export interface CreateRdoData {
  project_id: string;
  date: string;
  activities: string;
  observations: string;
  team_members: Omit<RdoTeamMember, 'id' | 'rdo_id'>[];
  photos: { file: File; caption: string }[];
}

function getPhotoPublicUrl(path: string) {
  const { data } = supabase.storage.from('rdo-photos').getPublicUrl(path);
  return data.publicUrl;
}

export function useRdos() {
  const queryClient = useQueryClient();
  const activeProject = useAppStore((s) => s.activeProject);
  const projectId = activeProject?.id;

  const rdosQuery = useQuery({
    queryKey: ['rdos', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const { data: rdos, error } = await supabase
        .from('rdos')
        .select('*')
        .eq('project_id', projectId)
        .order('date', { ascending: false });
      if (error) throw error;

      // Get counts and first photo for each rdo
      const enriched: Rdo[] = await Promise.all(
        (rdos || []).map(async (rdo) => {
          const [{ count: photoCount }, { count: memberCount }, { data: firstPhoto }] = await Promise.all([
            supabase.from('rdo_photos').select('*', { count: 'exact', head: true }).eq('rdo_id', rdo.id),
            supabase.from('rdo_team_members').select('*', { count: 'exact', head: true }).eq('rdo_id', rdo.id),
            supabase.from('rdo_photos').select('storage_path').eq('rdo_id', rdo.id).order('sort_order').limit(1),
          ]);
          return {
            ...rdo,
            photo_count: photoCount || 0,
            member_count: memberCount || 0,
            first_photo_url: firstPhoto?.[0] ? getPhotoPublicUrl(firstPhoto[0].storage_path) : null,
          };
        })
      );
      return enriched;
    },
    enabled: !!projectId,
  });

  const fetchRdoDetail = async (rdoId: string): Promise<RdoDetail> => {
    const [{ data: rdo, error: rdoErr }, { data: members, error: memErr }, { data: photos, error: photoErr }] =
      await Promise.all([
        supabase.from('rdos').select('*').eq('id', rdoId).single(),
        supabase.from('rdo_team_members').select('*').eq('rdo_id', rdoId),
        supabase.from('rdo_photos').select('*').eq('rdo_id', rdoId).order('sort_order'),
      ]);
    if (rdoErr) throw rdoErr;
    if (memErr) throw memErr;
    if (photoErr) throw photoErr;

    const enrichedPhotos = (photos || []).map((p) => ({
      ...p,
      url: getPhotoPublicUrl(p.storage_path),
    }));

    return {
      ...rdo!,
      team_members: members || [],
      photos: enrichedPhotos,
    };
  };

  const rdoDetailQuery = (rdoId: string | undefined) =>
    useQuery({
      queryKey: ['rdo-detail', rdoId],
      queryFn: () => fetchRdoDetail(rdoId!),
      enabled: !!rdoId,
    });

  const checkDuplicateDate = async (pId: string, date: string) => {
    const { data } = await supabase
      .from('rdos')
      .select('id')
      .eq('project_id', pId)
      .eq('date', date)
      .maybeSingle();
    return data;
  };

  const createRdo = useMutation({
    mutationFn: async (input: CreateRdoData) => {
      // Create RDO
      const { data: rdo, error } = await supabase
        .from('rdos')
        .insert({
          project_id: input.project_id,
          date: input.date,
          activities: input.activities,
          observations: input.observations,
        })
        .select()
        .single();
      if (error) throw error;

      // Create team members
      if (input.team_members.length > 0) {
        const { error: tmErr } = await supabase.from('rdo_team_members').insert(
          input.team_members.map((m) => ({ ...m, rdo_id: rdo.id }))
        );
        if (tmErr) throw tmErr;
      }

      // Upload photos
      for (let i = 0; i < input.photos.length; i++) {
        const { file, caption } = input.photos[i];
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${input.project_id}/${rdo.id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('rdo-photos').upload(path, file);
        if (upErr) throw upErr;
        const { error: phErr } = await supabase.from('rdo_photos').insert({
          rdo_id: rdo.id,
          storage_path: path,
          caption,
          sort_order: i,
        });
        if (phErr) throw phErr;
      }

      return rdo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rdos', projectId] });
    },
  });

  const updateRdo = useMutation({
    mutationFn: async (input: { id: string; activities: string; observations: string; team_members: Omit<RdoTeamMember, 'id' | 'rdo_id'>[]; newPhotos: { file: File; caption: string }[] }) => {
      const { error } = await supabase
        .from('rdos')
        .update({ activities: input.activities, observations: input.observations })
        .eq('id', input.id);
      if (error) throw error;

      // Replace team members
      await supabase.from('rdo_team_members').delete().eq('rdo_id', input.id);
      if (input.team_members.length > 0) {
        const { error: tmErr } = await supabase.from('rdo_team_members').insert(
          input.team_members.map((m) => ({ ...m, rdo_id: input.id }))
        );
        if (tmErr) throw tmErr;
      }

      // Upload new photos
      if (input.newPhotos.length > 0) {
        const { count } = await supabase.from('rdo_photos').select('*', { count: 'exact', head: true }).eq('rdo_id', input.id);
        const startOrder = count || 0;
        const rdo = await supabase.from('rdos').select('project_id').eq('id', input.id).single();
        for (let i = 0; i < input.newPhotos.length; i++) {
          const { file, caption } = input.newPhotos[i];
          const ext = file.name.split('.').pop() || 'jpg';
          const path = `${rdo.data!.project_id}/${input.id}/${crypto.randomUUID()}.${ext}`;
          await supabase.storage.from('rdo-photos').upload(path, file);
          await supabase.from('rdo_photos').insert({
            rdo_id: input.id,
            storage_path: path,
            caption,
            sort_order: startOrder + i,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rdos'] });
      queryClient.invalidateQueries({ queryKey: ['rdo-detail'] });
    },
  });

  const deleteRdo = useMutation({
    mutationFn: async (rdoId: string) => {
      // Delete photos from storage first
      const { data: photos } = await supabase.from('rdo_photos').select('storage_path').eq('rdo_id', rdoId);
      if (photos && photos.length > 0) {
        await supabase.storage.from('rdo-photos').remove(photos.map((p) => p.storage_path));
      }
      const { error } = await supabase.from('rdos').delete().eq('id', rdoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rdos', projectId] });
    },
  });

  const deletePhoto = useMutation({
    mutationFn: async (photo: RdoPhoto) => {
      await supabase.storage.from('rdo-photos').remove([photo.storage_path]);
      const { error } = await supabase.from('rdo_photos').delete().eq('id', photo.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rdo-detail'] });
      queryClient.invalidateQueries({ queryKey: ['rdos'] });
    },
  });

  const updatePhotoAnnotations = useMutation({
    mutationFn: async ({ photoId, annotations }: { photoId: string; annotations: any }) => {
      const { error } = await supabase.from('rdo_photos').update({ annotations_json: annotations }).eq('id', photoId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rdo-detail'] });
    },
  });

  const weeklySummaryQuery = useQuery({
    queryKey: ['rdo-weekly', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const { data: rdos, error } = await supabase
        .from('rdos')
        .select('*')
        .eq('project_id', projectId)
        .gte('date', weekAgo)
        .order('date', { ascending: true });
      if (error) throw error;
      if (!rdos || rdos.length === 0) return { rdos: [], totalHours: 0, allPhotos: [] };

      let totalHours = 0;
      const allPhotos: RdoPhoto[] = [];
      for (const rdo of rdos) {
        const [{ data: members }, { data: photos }] = await Promise.all([
          supabase.from('rdo_team_members').select('*').eq('rdo_id', rdo.id),
          supabase.from('rdo_photos').select('*').eq('rdo_id', rdo.id).order('sort_order'),
        ]);
        totalHours += (members || []).reduce((sum, m) => sum + Number(m.hours_worked), 0);
        allPhotos.push(...(photos || []).map((p) => ({ ...p, url: getPhotoPublicUrl(p.storage_path) })));
      }

      return { rdos, totalHours, allPhotos };
    },
    enabled: !!projectId,
  });

  return {
    rdos: rdosQuery.data || [],
    isLoading: rdosQuery.isLoading,
    rdoDetailQuery,
    checkDuplicateDate,
    createRdo,
    updateRdo,
    deleteRdo,
    deletePhoto,
    updatePhotoAnnotations,
    weeklySummary: weeklySummaryQuery.data,
    isLoadingWeekly: weeklySummaryQuery.isLoading,
  };
}
