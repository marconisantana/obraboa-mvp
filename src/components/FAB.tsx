import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, CalendarDays, CheckSquare, ShoppingCart, FolderKanban, MapPin, ChevronLeft } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useAppStore, type Project } from '@/stores/useAppStore';
import CreateProjectModal from '@/components/profile/CreateProjectModal';
import { usePlanGate } from '@/hooks/usePlanGate';

type FabStep = 'actions' | 'select-project';

export default function FAB() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const projects = useAppStore((s) => s.projects);
  const setActiveProject = useAppStore((s) => s.setActiveProject);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<FabStep>('actions');
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const { checkAndGate, GateDrawer } = usePlanGate();

  const actions = [
    { icon: FolderKanban, label: t('projects.new'), key: 'project' },
    { icon: FileText, label: t('fab.newRdo'), key: 'rdo' },
    { icon: CalendarDays, label: t('fab.newStage'), key: 'stage' },
    { icon: CheckSquare, label: t('fab.newChecklist'), key: 'checklist' },
    { icon: ShoppingCart, label: t('fab.newOc'), key: 'oc' },
  ];

  const routeMap: Record<string, string> = {
    rdo: '/rdo',
    stage: '/schedule',
    checklist: '/checklists',
    oc: '/purchases',
  };

  const activeProjects = projects.filter((p) => p.status !== 'cancelled');

  const handleAction = (key: string) => {
    if (key === 'project') {
      setOpen(false);
      if (checkAndGate('project')) {
        setCreateProjectOpen(true);
      }
    } else {
      // If only one project, select it directly
      if (activeProjects.length === 1) {
        setActiveProject(activeProjects[0]);
        setOpen(false);
        navigate(`${routeMap[key]}?new=1`);
      } else {
        setPendingAction(key);
        setStep('select-project');
      }
    }
  };

  const handleSelectProject = (project: Project) => {
    setActiveProject(project);
    setOpen(false);
    if (pendingAction && routeMap[pendingAction]) {
      navigate(`${routeMap[pendingAction]}?new=1`);
    }
    setPendingAction(null);
    setStep('actions');
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setStep('actions');
      setPendingAction(null);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom,0px)+0.75rem)] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg active:scale-95 transition-transform lg:hidden"
        aria-label={t('fab.quickActions')}
      >
        <Plus size={24} />
      </button>

      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          {step === 'actions' ? (
            <>
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
            </>
          ) : (
            <>
              <DrawerHeader>
                <div className="flex items-center gap-2">
                  <button onClick={() => setStep('actions')} className="p-1 rounded-md hover:bg-secondary">
                    <ChevronLeft size={20} />
                  </button>
                  <DrawerTitle>{t('fab.selectProject')}</DrawerTitle>
                </div>
              </DrawerHeader>
              <div className="space-y-2 px-4 pb-6 max-h-[50vh] overflow-y-auto">
                {activeProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">{t('projects.noProjects')}</p>
                ) : (
                  activeProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleSelectProject(project)}
                      className="flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-secondary active:scale-[0.98]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FolderKanban size={20} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{project.name}</p>
                        {project.address && (
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin size={12} /> {project.address}
                          </p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>

      <CreateProjectModal open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
      {GateDrawer}
    </>
  );
}
