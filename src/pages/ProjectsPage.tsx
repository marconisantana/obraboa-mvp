import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore, type Project, type ProjectStatus } from '@/stores/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FolderKanban, MapPin, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-accent/20 text-accent',
  paused: 'bg-orange-100 text-orange-700',
  completed: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/20 text-destructive',
};

export default function ProjectsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const { projects, setProjects, activeProject, setActiveProject } = useAppStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('planning');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data as Project[]);
    if (error) toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    setLoading(false);
  };

  const openNew = () => {
    setEditingProject(null);
    setName('');
    setAddress('');
    setStatus('planning');
    setStartDate('');
    setEndDate('');
    setDrawerOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditingProject(project);
    setName(project.name);
    setAddress(project.address || '');
    setStatus(project.status);
    setStartDate(project.start_date || '');
    setEndDate(project.end_date || '');
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update({ name, address: address || null, status, start_date: startDate || null, end_date: endDate || null })
        .eq('id', editingProject.id);
      if (error) {
        toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
        return;
      }
    } else {
      const { error } = await supabase
        .from('projects')
        .insert({ name, address: address || null, status, start_date: startDate || null, end_date: endDate || null, owner_id: user!.id });
      if (error) {
        toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
        return;
      }
    }
    setDrawerOpen(false);
    fetchProjects();
  };

  const handleDelete = async () => {
    if (!editingProject) return;
    const { error } = await supabase.from('projects').delete().eq('id', editingProject.id);
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
      return;
    }
    if (activeProject?.id === editingProject.id) setActiveProject(null);
    setDrawerOpen(false);
    fetchProjects();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('projects.title')}</h1>
        <Button onClick={openNew} className="bg-accent text-accent-foreground hover:bg-accent/90 hidden lg:inline-flex">
          <Plus size={18} /> {t('projects.new')}
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FolderKanban size={48} className="mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t('projects.noProjects')}</p>
            <p className="text-sm text-muted-foreground">{t('projects.createFirst')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className={`cursor-pointer transition-shadow hover:shadow-md ${
                activeProject?.id === project.id ? 'ring-2 ring-accent' : ''
              }`}
              onClick={() => {
                setActiveProject(project);
                navigate(`/projects/${project.id}`);
              }}
              onDoubleClick={() => openEdit(project)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FolderKanban size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">{project.name}</p>
                      {project.address && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin size={12} /> {project.address}
                        </p>
                      )}
                    </div>
                  </div>
                  {activeProject?.id === project.id && (
                    <Check size={18} className="text-accent shrink-0" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[project.status]}`}>
                    {t(`projects.${project.status}`)}
                  </span>
                  {project.start_date && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(project.start_date), 'dd/MM/yyyy')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Drawer / Bottom Sheet */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{editingProject ? t('projects.edit') : t('projects.new')}</DrawerTitle>
          </DrawerHeader>
          <div className="space-y-4 px-4">
            <div className="space-y-2">
              <Label>{t('projects.name')}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('projects.address')}</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('projects.status')}</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['planning', 'in_progress', 'paused', 'completed', 'cancelled'] as const).map((s) => (
                    <SelectItem key={s} value={s}>{t(`projects.${s}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>{t('projects.startDate')}</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>{t('projects.endDate')}</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
              {t('projects.save')}
            </Button>
            {editingProject && (
              <Button variant="destructive" onClick={handleDelete}>{t('projects.delete')}</Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline">{t('projects.cancel')}</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
