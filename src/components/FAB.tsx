import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, FileText, CalendarDays, CheckSquare, ShoppingCart, FolderKanban } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useToast } from '@/hooks/use-toast';
import CreateProjectModal from '@/components/profile/CreateProjectModal';

export default function FAB() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const actions = [
    { icon: FolderKanban, label: t('projects.new'), key: 'project' },
    { icon: FileText, label: t('fab.newRdo'), key: 'rdo' },
    { icon: CalendarDays, label: t('fab.newStage'), key: 'stage' },
    { icon: CheckSquare, label: t('fab.newChecklist'), key: 'checklist' },
    { icon: ShoppingCart, label: t('fab.newOc'), key: 'oc' },
  ];

  const handleAction = (key: string) => {
    setOpen(false);
    if (key === 'project') {
      setCreateProjectOpen(true);
    } else {
      toast({ title: t('common.comingSoon') });
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg active:scale-95 transition-transform lg:hidden"
        aria-label={t('fab.quickActions')}
      >
        <Plus size={24} />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{t('fab.quickActions')}</DrawerTitle>
          </DrawerHeader>
          <div className="grid grid-cols-2 gap-3 px-4 pb-6">
            {actions.map(({ icon: Icon, label, key }) => (
              <button
                key={key}
                onClick={() => handleAction(key)}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-secondary active:scale-95"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Icon size={22} className="text-primary" />
                </div>
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>

      <CreateProjectModal open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
    </>
  );
}
