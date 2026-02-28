import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { t } = useTranslation();
  const user = useAppStore((s) => s.user);
  const activeProject = useAppStore((s) => s.activeProject);
  const projects = useAppStore((s) => s.projects);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {t('home.welcome')}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! 👋
        </h1>
        {!activeProject && (
          <p className="mt-1 text-muted-foreground">{t('home.selectProject')}</p>
        )}
      </div>

      {activeProject ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{activeProject.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{t('home.recentActivity')}</p>
            <p className="mt-4 text-center text-sm text-muted-foreground">{t('home.noActivity')}</p>
          </CardContent>
        </Card>
      ) : projects.length > 0 ? (
        <div className="grid gap-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                useAppStore.getState().setActiveProject(project);
              }}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <FolderKanban size={20} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{t(`projects.${project.status}`)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <FolderKanban size={48} className="mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t('projects.noProjects')}</p>
            <button
              onClick={() => navigate('/projects')}
              className="mt-2 text-sm font-medium text-accent hover:underline"
            >
              {t('projects.createFirst')}
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
