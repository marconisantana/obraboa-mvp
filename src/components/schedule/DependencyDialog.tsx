import { useTranslation } from 'react-i18next';
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

interface DependencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyToDependents: () => void;
  onSkipDependents: () => void;
}

export default function DependencyDialog({
  open,
  onOpenChange,
  onApplyToDependents,
  onSkipDependents,
}: DependencyDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('schedule.predecessor')}</AlertDialogTitle>
          <AlertDialogDescription>{t('schedule.predecessorWarning')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onSkipDependents}>
            {t('schedule.skipDependents')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onApplyToDependents}>
            {t('schedule.applyToDependents')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
