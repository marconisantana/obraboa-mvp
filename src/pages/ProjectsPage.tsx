import React, { useEffect, useState } from 'react';
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
import { Plus, FolderKanban, MapPin, Check, Pencil, HardHat, Home, Building2, Hammer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ProjectCardSkeleton } from '@/components/ui/card-skeleton';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  paused: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

/* Cor do ícone por tipo de projeto (FamilyWall-style colorful icons) */
const typeConfig: Record<string, { bg: string; color: string; Icon: React.ElementType }> = {
  residencial: { bg: 'bg-blue-100', color: 'text-blue-600', Icon: Home },
  comercial: { bg: 'bg-purple-100', color: 'text-purple-600', Icon: Building2 },
  reforma: { bg: 'bg-amber-100', color: 'text-amber-600', Icon: Hammer },
  flip: { bg: 'bg-rose-100', color: 'text-rose-600', Icon: HardHat },
};
const defaultTypeConf = { bg: 'bg-primary/10', color: 'text-primary', Icon: FolderKanban };

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
          <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(4)].map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading da página — extrabold, navy, estilo FamilyWall */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-primary tracking-tight">{t('projects.title')}</h1>
        <Button onClick={openNew} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-1.5">
          <Plus size={18} /> {t('projects.new')}
        </Button>
      </div>

      {projects.length === 0 ? (
        /* Empty state — ícone em círculo colorido (FamilyWall) */
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 px-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
            <FolderKanban size={42} className="text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold text-primary">{t('projects.noProjects')}</p>
            <p className="text-sm text-muted-foreground max-w-xs">{t('projects.createFirst')}</p>
          </div>
          <Button onClick={openNew} className="bg-accent text-accent-foreground hover:bg-accent/90 mt-2">
            <Plus size={18} /> {t('projects.new')}
          </Button>
        </div>
      ) : (
        /* Grid de cards estilo FamilyWall: rounded-3xl, sombra suave, sem borda */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const typeCfg = typeConfig[project.type as string] ?? defaultTypeConf;
            const TypeIcon = typeCfg.Icon;
            const isActive = activeProject?.id === project.id;
            return (
              <div
                key={project.id}
                className={`relative cursor-pointer rounded-3xl bg-white p-5 card-shadow card-shadow-hover transition-all ${isActive ? 'ring-2 ring-accent ring-offset-2' : ''
                  }`}
                onClick={() => {
                  setActiveProject(project);
                  navigate(`/projects/${project.id}`);
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Ícone colorido por tipo */}
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${typeCfg.bg}`}>
                    <TypeIcon size={22} className={typeCfg.color} />
                  </div>

                  {/* Título + endereço */}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base text-primary leading-snug truncate">{project.name}</p>
                    {project.address && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <MapPin size={11} /> {project.address}
                      </p>
                    )}
                  </div>

                  {/* Ações: check ativo + editar */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {isActive && <Check size={18} className="text-accent" />}
                    <button
                      onClick={(e) => { e.stopPropagation(); openEdit(project); }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/8 hover:text-primary transition-colors"
                      aria-label={t('projects.edit')}
                    >
                      <Pencil size={14} />
                    </button>
                  </div>
                </div>

                {/* Status + data */}
                <div className="mt-4 flex items-center justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[project.status]}`}>
                    {t(`projects.${project.status}`)}
                  </span>
                  {project.start_date && (
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(project.start_date), 'dd/MM/yy')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
