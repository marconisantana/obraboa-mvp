import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown, FolderKanban } from 'lucide-react';
import { useState } from 'react';

export default function ProjectSelector() {
  const { t } = useTranslation();
  const { projects, activeProject, setActiveProject } = useAppStore();
  const [open, setOpen] = useState(false);

  if (projects.length === 0) {
    return (
      <span className="text-sm text-muted-foreground truncate">
        {t('projectSelector.select')}
      </span>
    );
  }

  if (projects.length === 1) {
    return (
      <div className="flex items-center gap-2 truncate">
        <FolderKanban size={16} className="shrink-0 text-primary" />
        <span className="text-sm font-medium truncate">{projects[0].name}</span>
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-colors truncate max-w-[200px]">
          <FolderKanban size={16} className="shrink-0 text-primary" />
          <span className="truncate">
            {activeProject ? activeProject.name : t('projectSelector.select')}
          </span>
          <ChevronDown size={14} className="shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-1" align="center">
        <div className="space-y-0.5">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => {
                setActiveProject(project);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-secondary ${
                activeProject?.id === project.id ? 'bg-secondary font-medium' : ''
              }`}
            >
              <FolderKanban size={14} className="shrink-0 text-primary" />
              <span className="truncate">{project.name}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
