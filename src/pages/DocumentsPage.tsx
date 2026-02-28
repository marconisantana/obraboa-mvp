import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FolderPlus, Upload, FileText, Loader2 } from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useProjectRole } from '@/hooks/useProjectRole';
import { useDocuments, type DocumentFolder, type DocumentFile } from '@/hooks/useDocuments';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import DocumentBreadcrumb from '@/components/documents/DocumentBreadcrumb';
import FolderCard from '@/components/documents/FolderCard';
import FileRow from '@/components/documents/FileRow';
import FilePreviewDialog from '@/components/documents/FilePreviewDialog';
import CreateFolderDialog from '@/components/documents/CreateFolderDialog';
import RenameDialog from '@/components/documents/RenameDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function DocumentsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const activeProject = useAppStore((s) => s.activeProject);
  const { canEdit } = useProjectRole();
  const projectId = activeProject?.id;

  const {
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
  } = useDocuments(projectId);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<DocumentFolder[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ type: 'folder' | 'file'; id: string; name: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'folder' | 'file'; id: string; storagePath?: string } | null>(null);
  const [previewFile, setPreviewFile] = useState<DocumentFile | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: folders = [], isLoading: loadingFolders } = foldersQuery(currentFolderId);
  const { data: files = [], isLoading: loadingFiles } = filesQuery(currentFolderId);

  const docs = useDocuments(projectId);

  // Ensure default folders on first load
  useEffect(() => {
    if (projectId) {
      ensureDefaultFolders.mutate(projectId);
    }
  }, [projectId]);

  // Build breadcrumb when folder changes
  const updateBreadcrumb = useCallback(async () => {
    if (!currentFolderId) {
      setBreadcrumb([]);
      return;
    }
    const trail = await docs.fetchBreadcrumb(currentFolderId);
    setBreadcrumb(trail);
  }, [currentFolderId, projectId]);

  useEffect(() => {
    updateBreadcrumb();
  }, [updateBreadcrumb]);

  const handleNavigate = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  const handleCreateFolder = (name: string) => {
    createFolder.mutate(
      { parentId: currentFolderId, name },
      {
        onSuccess: () => {
          setShowCreateFolder(false);
          toast({ title: t('common.success') });
        },
      }
    );
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      await uploadFiles.mutateAsync({ folderId: currentFolderId, files: Array.from(fileList) });
      toast({ title: t('common.success') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRenameConfirm = (newName: string) => {
    if (!renameTarget) return;
    if (renameTarget.type === 'folder') {
      renameFolder.mutate({ folderId: renameTarget.id, newName }, { onSuccess: () => setRenameTarget(null) });
    } else {
      renameFile.mutate({ fileId: renameTarget.id, newName }, { onSuccess: () => setRenameTarget(null) });
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === 'folder') {
      deleteFolder.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
    } else {
      deleteFile.mutate(
        { fileId: deleteTarget.id, storagePath: deleteTarget.storagePath! },
        { onSuccess: () => setDeleteTarget(null) }
      );
    }
  };

  const handleCopyLink = async (file: DocumentFile) => {
    try {
      const url = await getSignedUrl(file.storage_path);
      await navigator.clipboard.writeText(url);
      toast({ title: t('documents.linkCopied') });
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    }
  };

  const handleDownload = (file: DocumentFile) => {
    const url = getPublicUrl(file.storage_path);
    window.open(url, '_blank');
  };

  if (!projectId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FileText size={48} className="mb-3 text-muted-foreground/50" />
        <p className="text-muted-foreground">{t('documents.selectProject')}</p>
      </div>
    );
  }

  const isLoading = loadingFolders || loadingFiles;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('documents.title')}</h1>
        <div className="flex gap-2">
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowCreateFolder(true)}>
                <FolderPlus size={16} className="mr-1" />
                {t('documents.newFolder')}
              </Button>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 size={16} className="mr-1 animate-spin" /> : <Upload size={16} className="mr-1" />}
                {uploading ? t('documents.uploading') : t('documents.uploadFiles')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpeg,.jpg,.png,.xlsx,.xls,.dwg"
                className="hidden"
                onChange={handleUpload}
              />
            </>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <DocumentBreadcrumb trail={breadcrumb} onNavigate={handleNavigate} />

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      ) : (
        <>
          {/* Folders */}
          {folders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  onClick={() => handleNavigate(folder.id)}
                  onRename={() => setRenameTarget({ type: 'folder', id: folder.id, name: folder.name })}
                  onDelete={() => setDeleteTarget({ type: 'folder', id: folder.id })}
                />
              ))}
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file) => (
                <FileRow
                  key={file.id}
                  file={file}
                  onPreview={() => setPreviewFile(file)}
                  onDownload={() => handleDownload(file)}
                  onCopyLink={() => handleCopyLink(file)}
                  onRename={() => setRenameTarget({ type: 'file', id: file.id, name: file.name })}
                  onDelete={() => setDeleteTarget({ type: 'file', id: file.id, storagePath: file.storage_path })}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {folders.length === 0 && files.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText size={48} className="mb-3 text-muted-foreground/50" />
              <h2 className="text-lg font-semibold">{t('documents.noFiles')}</h2>
              <p className="text-sm text-muted-foreground">{t('documents.noFilesDesc')}</p>
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <CreateFolderDialog
        open={showCreateFolder}
        onOpenChange={setShowCreateFolder}
        onConfirm={handleCreateFolder}
        loading={createFolder.isPending}
      />

      <RenameDialog
        open={!!renameTarget}
        onOpenChange={(v) => { if (!v) setRenameTarget(null); }}
        currentName={renameTarget?.name || ''}
        onConfirm={handleRenameConfirm}
        loading={renameFolder.isPending || renameFile.isPending}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('documents.deleteConfirm')}</AlertDialogTitle>
            {deleteTarget?.type === 'folder' && (
              <AlertDialogDescription>{t('documents.deleteFolderWarning')}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FilePreviewDialog
        file={previewFile}
        publicUrl={previewFile ? getPublicUrl(previewFile.storage_path) : ''}
        open={!!previewFile}
        onOpenChange={(v) => { if (!v) setPreviewFile(null); }}
      />
    </div>
  );
}
