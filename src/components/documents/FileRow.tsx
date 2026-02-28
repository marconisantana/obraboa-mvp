import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  FileText, Image, Table2, Ruler, File,
  MoreVertical, Eye, Download, Link2, Pencil, Trash2,
} from 'lucide-react';
import type { DocumentFile } from '@/hooks/useDocuments';
import { formatFileSize } from '@/hooks/useDocuments';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const fileIconMap: Record<string, { icon: typeof File; className: string }> = {
  pdf: { icon: FileText, className: 'text-red-500' },
  jpg: { icon: Image, className: 'text-blue-500' },
  jpeg: { icon: Image, className: 'text-blue-500' },
  png: { icon: Image, className: 'text-blue-500' },
  xlsx: { icon: Table2, className: 'text-green-600' },
  xls: { icon: Table2, className: 'text-green-600' },
  dwg: { icon: Ruler, className: 'text-orange-500' },
};

interface Props {
  file: DocumentFile;
  onPreview: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function FileRow({ file, onPreview, onDownload, onCopyLink, onRename, onDelete }: Props) {
  const { t } = useTranslation();
  const ext = file.file_type.toLowerCase();
  const { icon: Icon, className: iconClass } = fileIconMap[ext] || { icon: File, className: 'text-muted-foreground' };

  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-secondary/50">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-muted">
        <Icon size={18} className={iconClass} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.file_size)} · {format(new Date(file.created_at), 'dd/MM/yyyy')}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onPreview}>
            <Eye size={14} className="mr-2" /> {t('documents.preview')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDownload}>
            <Download size={14} className="mr-2" /> {t('documents.download')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopyLink}>
            <Link2 size={14} className="mr-2" /> {t('documents.copyLink')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onRename}>
            <Pencil size={14} className="mr-2" /> {t('documents.rename')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 size={14} className="mr-2" /> {t('documents.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
