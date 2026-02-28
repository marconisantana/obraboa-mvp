import { useTranslation } from 'react-i18next';
import { Download, File } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { DocumentFile } from '@/hooks/useDocuments';
import { formatFileSize } from '@/hooks/useDocuments';

interface Props {
  file: DocumentFile | null;
  publicUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FilePreviewDialog({ file, publicUrl, open, onOpenChange }: Props) {
  const { t } = useTranslation();
  if (!file) return null;

  const ext = file.file_type.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png'].includes(ext);
  const isPdf = ext === 'pdf';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="truncate">{file.name}</DialogTitle>
        </DialogHeader>

        {isImage && (
          <img src={publicUrl} alt={file.name} className="w-full rounded-lg object-contain max-h-[70vh]" />
        )}

        {isPdf && (
          <iframe src={publicUrl} title={file.name} className="w-full h-[70vh] rounded-lg border" />
        )}

        {!isImage && !isPdf && (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <File size={64} className="text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">{formatFileSize(file.file_size)}</p>
            <Button onClick={() => window.open(publicUrl, '_blank')}>
              <Download size={16} className="mr-2" />
              {t('documents.download')}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
