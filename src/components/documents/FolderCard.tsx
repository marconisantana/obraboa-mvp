import { useTranslation } from 'react-i18next';
import { Folder, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import type { DocumentFolder } from '@/hooks/useDocuments';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface Props {
  folder: DocumentFolder;
  onClick: () => void;
  onRename: () => void;
  onDelete: () => void;
}

export default function FolderCard({ folder, onClick, onRename, onDelete }: Props) {
  const { t } = useTranslation();

  return (
    <div
      className="flex items-center gap-3 rounded-lg border bg-card p-3 cursor-pointer transition-colors hover:bg-secondary active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Folder size={20} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{folder.name}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(folder.created_at), 'dd/MM/yyyy')}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={onRename}>
            <Pencil size={14} className="mr-2" />
            {t('documents.rename')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">
            <Trash2 size={14} className="mr-2" />
            {t('documents.delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
