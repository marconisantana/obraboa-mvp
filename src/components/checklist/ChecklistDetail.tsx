import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useChecklists } from '@/hooks/useChecklists';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import ChecklistItemRow from './ChecklistItemRow';
import ChecklistForm from './ChecklistForm';

export default function ChecklistDetail() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    checklistDetailQuery, toggleItem, addItem, deleteItem, reorderItems,
    uploadItemPhoto, deleteItemPhoto, updateChecklist, deleteChecklist,
  } = useChecklists();
  const { data: checklist, isLoading } = checklistDetailQuery(id);

  const [newItemText, setNewItemText] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const items = checklist?.items || [];
  const total = items.length;
  const checked = items.filter((i) => i.checked).length;
  const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

  const handleAddItem = () => {
    if (!newItemText.trim() || !id) return;
    addItem.mutate({ checklistId: id, text: newItemText.trim(), sort_order: items.length });
    setNewItemText('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleDragStart = useCallback((idx: number) => (e: React.DragEvent) => {
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback((targetIdx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === targetIdx) return;
    const newItems = [...items];
    const [moved] = newItems.splice(dragIdx, 1);
    newItems.splice(targetIdx, 0, moved);
    const updates = newItems.map((item, i) => ({ id: item.id, sort_order: i }));
    reorderItems.mutate({ items: updates });
    setDragIdx(null);
  }, [dragIdx, items, reorderItems]);

  const handleDeleteChecklist = () => {
    if (!id) return;
    deleteChecklist.mutate(id, { onSuccess: () => navigate('/checklists') });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">{t('common.loading')}</div>;
  }

  if (!checklist) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">{t('common.noResults')}</p>
        <Button variant="link" onClick={() => navigate('/checklists')}>{t('common.back')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/checklists')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><MoreVertical size={18} /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <Pencil size={14} className="mr-2" /> {t('checklist.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={14} className="mr-2" /> {t('common.delete')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title + progress */}
      <div className="space-y-2">
        <h1 className="text-lg font-bold">{checklist.name}</h1>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{checked} de {total} itens concluídos ({percent}%)</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-2">
        {items.map((item, idx) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            onToggle={(itemId, val) => toggleItem.mutate({ itemId, checked: val, checklistId: checklist.id })}
            onDelete={(itemId) => deleteItem.mutate({ itemId, checklistId: checklist.id })}
            onUploadPhoto={(itemId, file) => uploadItemPhoto.mutate({ itemId, checklistId: checklist.id, file })}
            onDeletePhoto={(photoId, storagePath) => deleteItemPhoto.mutate({ photoId, storagePath, checklistId: checklist.id })}
            dragHandleProps={{
              draggable: true,
              onDragStart: handleDragStart(idx),
              onDragOver: (e) => e.preventDefault(),
              onDrop: handleDrop(idx),
              onDragEnd: () => setDragIdx(null),
            }}
          />
        ))}

        {/* Inline add item */}
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder={t('checklist.itemPlaceholder')}
            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={handleAddItem} disabled={!newItemText.trim()}>
            {t('checklist.addItem')}
          </Button>
        </div>
      </div>

      {/* Edit dialog */}
      <ChecklistForm
        open={editOpen}
        onOpenChange={setEditOpen}
        isEdit
        defaultValues={{
          name: checklist.name,
          responsible_name: checklist.responsible_name || '',
          due_date: checklist.due_date || undefined,
        }}
        onSubmit={(data) => {
          updateChecklist.mutate({
            id: checklist.id,
            name: data.name,
            responsible_name: data.responsible_name,
            due_date: data.due_date || null,
          });
        }}
      />

      {/* Delete confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('checklist.deleteConfirm')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChecklist}>{t('common.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
