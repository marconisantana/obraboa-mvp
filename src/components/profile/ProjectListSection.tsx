import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore, type Project, type ProjectStatus } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Archive, FolderKanban } from 'lucide-react';
import CreateProjectModal from '@/components/profile/CreateProjectModal';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-accent/20 text-accent',
  paused: 'bg-orange-100 text-orange-700',
  completed: 'bg-success/20 text-success',
  cancelled: 'bg-destructive/20 text-destructive',
};

export default function ProjectListSection() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const projects = useAppStore((s) => s.projects);
  const setProjects = useAppStore((s) => s.setProjects);
  const [createOpen, setCreateOpen] = useState(false);

  const handleArchive = async (project: Project) => {
    const { error } = await supabase
      .from('projects')
      .update({ status: 'cancelled' })
      .eq('id', project.id);
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
      return;
    }
    setProjects(projects.map((p) => (p.id === project.id ? { ...p, status: 'cancelled' as ProjectStatus } : p)));
    toast({ title: t('common.success') });
  };

  const activeProjects = projects.filter((p) => p.status !== 'cancelled');

  return (
    <>
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-medium flex items-center gap-2">
            <FolderKanban size={18} className="text-primary" />
            {t('profile.myProjects')}
          </p>
          <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={16} /> {t('profile.createProject')}
          </Button>
        </div>

        {activeProjects.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">{t('projects.noProjects')}</p>
        ) : (
          <div className="space-y-2">
            {activeProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <Badge className={`${statusColors[project.status]} text-xs mt-1`}>
                    {t(`projects.${project.status}`)}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => handleArchive(project)}
                >
                  <Archive size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>

    <CreateProjectModal open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
