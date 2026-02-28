import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowLeft, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useRdos } from '@/hooks/useRdos';
import RdoForm from './RdoForm';
import RdoExportMenu from './RdoExportMenu';
import PhotoAnnotator from './PhotoAnnotator';
import RdoPrintView from './RdoPrintView';

export default function RdoDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { rdoDetailQuery, deleteRdo, deletePhoto, updatePhotoAnnotations } = useRdos();
  const { data: rdo, isLoading } = rdoDetailQuery(id);
  const [editOpen, setEditOpen] = useState(false);
  const [fullscreenPhoto, setFullscreenPhoto] = useState<string | null>(null);
  const [annotatingPhoto, setAnnotatingPhoto] = useState<{ id: string; url: string; annotations: any } | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!rdo) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">{t('common.noResults')}</p>
        <Button variant="link" onClick={() => navigate('/rdo')}>{t('common.back')}</Button>
      </div>
    );
  }

  const dateFormatted = format(parseISO(rdo.date), "dd 'de' MMMM, yyyy", { locale: ptBR });

  const handleDelete = async () => {
    await deleteRdo.mutateAsync(rdo.id);
    navigate('/rdo');
  };

  const handleSaveAnnotations = async (photoId: string, annotations: any) => {
    await updatePhotoAnnotations.mutateAsync({ photoId, annotations });
    setAnnotatingPhoto(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/rdo')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> {t('common.back')}
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Edit size={14} className="mr-1" /> {t('common.edit')}
          </Button>
          <RdoExportMenu rdo={rdo} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive">
                <Trash2 size={14} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('common.confirm')}</AlertDialogTitle>
                <AlertDialogDescription>{t('common.delete')}?</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>{t('common.delete')}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Date */}
      <h1 className="text-xl font-bold capitalize">{dateFormatted}</h1>

      {/* Activities */}
      {rdo.activities && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2">{t('rdo.activities')}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rdo.activities}</p>
          </CardContent>
        </Card>
      )}

      {/* Team */}
      {rdo.team_members.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2">{t('rdo.team')}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('rdo.memberName')}</TableHead>
                  <TableHead>{t('rdo.memberRole')}</TableHead>
                  <TableHead className="text-right">{t('rdo.hoursWorked')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rdo.team_members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.role}</TableCell>
                    <TableCell className="text-right">{m.hours_worked}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Photos */}
      {rdo.photos.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2">{t('rdo.photos')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {rdo.photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt={photo.caption || ''}
                    className="w-full h-32 object-cover rounded-lg cursor-pointer"
                    onClick={() => setFullscreenPhoto(photo.url!)}
                  />
                  {photo.caption && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">{photo.caption}</p>
                  )}
                  <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setAnnotatingPhoto({ id: photo.id, url: photo.url!, annotations: photo.annotations_json })}
                      className="bg-primary text-primary-foreground rounded-full p-1 text-xs"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      onClick={async () => {
                        await deletePhoto.mutateAsync(photo);
                      }}
                      className="bg-destructive text-destructive-foreground rounded-full p-1"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Observations */}
      {rdo.observations && (
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold mb-2">{t('rdo.observations')}</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rdo.observations}</p>
          </CardContent>
        </Card>
      )}

      {/* Fullscreen photo */}
      {fullscreenPhoto && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setFullscreenPhoto(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setFullscreenPhoto(null)}>
            <X size={24} />
          </button>
          <img src={fullscreenPhoto} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}

      {/* Photo annotator */}
      {annotatingPhoto && (
        <PhotoAnnotator
          imageUrl={annotatingPhoto.url}
          existingAnnotations={annotatingPhoto.annotations}
          onSave={(annotations) => handleSaveAnnotations(annotatingPhoto.id, annotations)}
          onClose={() => setAnnotatingPhoto(null)}
        />
      )}

      {/* Edit form */}
      {editOpen && (
        <RdoForm
          open={editOpen}
          onOpenChange={setEditOpen}
          editId={rdo.id}
          editData={{
            date: rdo.date,
            activities: rdo.activities || '',
            observations: rdo.observations || '',
            team_members: rdo.team_members.map((m) => ({
              name: m.name,
              role: m.role || '',
              hours_worked: Number(m.hours_worked),
            })),
          }}
        />
      )}

      {/* Hidden print view */}
      <RdoPrintView rdo={rdo} />
    </div>
  );
}
