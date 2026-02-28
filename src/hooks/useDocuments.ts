import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DocumentFolder {
  id: string;
  project_id: string;
  parent_id: string | null;
  name: string;
  created_at: string;
  user_id: string;
}

export interface DocumentFile {
  id: string;
  project_id: string;
  folder_id: string | null;
  name: string;
  storage_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export { formatFileSize };

export function useDocuments(projectId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const foldersQuery = (parentId: string | null) =>
    useQuery({
      queryKey: ['document-folders', projectId, parentId],
      queryFn: async () => {
        let query = supabase
          .from('document_folders')
          .select('*')
          .eq('project_id', projectId!)
          .order('name');

        if (parentId === null) {
          query = query.is('parent_id', null);
        } else {
          query = query.eq('parent_id', parentId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as DocumentFolder[];
      },
      enabled: !!projectId,
    });

  const filesQuery = (folderId: string | null) =>
    useQuery({
      queryKey: ['document-files', projectId, folderId],
      queryFn: async () => {
        let query = supabase
          .from('document_files')
          .select('*')
          .eq('project_id', projectId!)
          .order('created_at', { ascending: false });

        if (folderId === null) {
          query = query.is('folder_id', null);
        } else {
          query = query.eq('folder_id', folderId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as DocumentFile[];
      },
      enabled: !!projectId,
    });

  const ensureDefaultFolders = useMutation({
    mutationFn: async (pid: string) => {
      const { data: existing } = await supabase
        .from('document_folders')
        .select('id')
        .eq('project_id', pid)
        .is('parent_id', null)
        .limit(1);

      if (existing && existing.length > 0) return;

      const defaults = ['Projetos', 'Contratos', 'Fotos', 'Outros'];
      const { error } = await supabase.from('document_folders').insert(
        defaults.map((name) => ({ project_id: pid, parent_id: null, name }))
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-folders', projectId] });
    },
  });

  const createFolder = useMutation({
    mutationFn: async ({ parentId, name }: { parentId: string | null; name: string }) => {
      const { error } = await supabase.from('document_folders').insert({
        project_id: projectId!,
        parent_id: parentId,
        name,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-folders', projectId] });
    },
  });

  const renameFolder = useMutation({
    mutationFn: async ({ folderId, newName }: { folderId: string; newName: string }) => {
      const { error } = await supabase
        .from('document_folders')
        .update({ name: newName })
        .eq('id', folderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-folders', projectId] });
    },
  });

  const deleteFolder = useMutation({
    mutationFn: async (folderId: string) => {
      // Recursively collect all files in this folder and subfolders
      const collectFiles = async (fid: string): Promise<string[]> => {
        const { data: files } = await supabase
          .from('document_files')
          .select('storage_path')
          .eq('folder_id', fid);
        const paths = (files || []).map((f: any) => f.storage_path);

        const { data: subFolders } = await supabase
          .from('document_folders')
          .select('id')
          .eq('parent_id', fid);

        for (const sf of subFolders || []) {
          const subPaths = await collectFiles(sf.id);
          paths.push(...subPaths);
        }
        return paths;
      };

      const storagePaths = await collectFiles(folderId);
      if (storagePaths.length > 0) {
        await supabase.storage.from('project-documents').remove(storagePaths);
      }

      // CASCADE will handle subfolders and SET NULL for files
      const { error } = await supabase.from('document_folders').delete().eq('id', folderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-folders', projectId] });
      queryClient.invalidateQueries({ queryKey: ['document-files', projectId] });
    },
  });

  const uploadFiles = useMutation({
    mutationFn: async ({ folderId, files }: { folderId: string | null; files: File[] }) => {
      for (const file of files) {
        const ext = file.name.split('.').pop();
        const path = `${projectId}/${folderId || 'root'}/${crypto.randomUUID()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from('project-documents')
          .upload(path, file);
        if (uploadErr) throw uploadErr;

        const { error: insertErr } = await supabase.from('document_files').insert({
          project_id: projectId!,
          folder_id: folderId,
          name: file.name,
          storage_path: path,
          file_type: ext?.toLowerCase() || 'unknown',
          file_size: file.size,
        });
        if (insertErr) throw insertErr;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-files', projectId] });
    },
  });

  const renameFile = useMutation({
    mutationFn: async ({ fileId, newName }: { fileId: string; newName: string }) => {
      const { error } = await supabase
        .from('document_files')
        .update({ name: newName })
        .eq('id', fileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-files', projectId] });
    },
  });

  const deleteFile = useMutation({
    mutationFn: async ({ fileId, storagePath }: { fileId: string; storagePath: string }) => {
      await supabase.storage.from('project-documents').remove([storagePath]);
      const { error } = await supabase.from('document_files').delete().eq('id', fileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-files', projectId] });
    },
  });

  const getPublicUrl = (storagePath: string) => {
    const { data } = supabase.storage.from('project-documents').getPublicUrl(storagePath);
    return data.publicUrl;
  };

  const getSignedUrl = async (storagePath: string) => {
    const { data, error } = await supabase.storage
      .from('project-documents')
      .createSignedUrl(storagePath, 3600);
    if (error) throw error;
    return data.signedUrl;
  };

  const fetchBreadcrumb = async (folderId: string | null): Promise<DocumentFolder[]> => {
    if (!folderId) return [];
    const trail: DocumentFolder[] = [];
    let currentId: string | null = folderId;

    while (currentId) {
      const { data, error } = await supabase
        .from('document_folders')
        .select('*')
        .eq('id', currentId)
        .single();
      if (error || !data) break;
      trail.unshift(data as DocumentFolder);
      currentId = data.parent_id;
    }
    return trail;
  };

  return {
    foldersQuery,
    filesQuery,
    ensureDefaultFolders,
    createFolder,
    renameFolder,
    deleteFolder,
    uploadFiles,
    renameFile,
    deleteFile,
    getPublicUrl,
    getSignedUrl,
    fetchBreadcrumb,
  };
}
