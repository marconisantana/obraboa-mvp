import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { GripVertical, Camera, X, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { ChecklistItem } from '@/hooks/useChecklists';

interface Props {
  item: ChecklistItem;
  onToggle: (itemId: string, checked: boolean) => void;
  onDelete: (itemId: string) => void;
  onUploadPhoto: (itemId: string, file: File) => void;
  onDeletePhoto: (photoId: string, storagePath: string) => void;
  dragHandleProps?: {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: () => void;
  };
}

export default function ChecklistItemRow({ item, onToggle, onDelete, onUploadPhoto, onDeletePhoto, dragHandleProps }: Props) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadPhoto(item.id, file);
      e.target.value = '';
    }
  };

  return (
    <div
      className="flex items-start gap-2 rounded-lg border bg-card p-3 group"
      {...dragHandleProps}
    >
      <span className="cursor-grab text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity touch-none">
        <GripVertical size={16} />
      </span>

      <Checkbox
        checked={item.checked}
        onCheckedChange={(checked) => onToggle(item.id, !!checked)}
        className="mt-0.5"
      />

      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-sm ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
          {item.text}
        </p>

        {/* Photos */}
        {item.photos && item.photos.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {item.photos.map((photo) => {
              const { data: urlData } = supabase.storage.from('checklist-photos').getPublicUrl(photo.storage_path);
              return (
                <div key={photo.id} className="relative group/photo w-12 h-12 rounded overflow-hidden border">
                  <img src={urlData.publicUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeletePhoto(photo.id, photo.storage_path); }}
                    className="absolute top-0 right-0 bg-destructive text-destructive-foreground rounded-bl p-0.5 opacity-0 group-hover/photo:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {item.checked && (
          <>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => fileRef.current?.click()}
              title={t('checklist.uploadProof')}
            >
              <Camera size={14} />
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => onDelete(item.id)}
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}
