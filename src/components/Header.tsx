import { useIsMobile } from '@/hooks/use-mobile';
import { Bell } from 'lucide-react';
import ProjectSelector from './ProjectSelector';

export default function Header() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-16 z-30 flex h-14 items-center justify-between border-b bg-card px-4">
      {isMobile ? (
        <img src="/icon-obraboa-navy.svg" alt="ObraBoa" className="h-8" />
      ) : (
        <div />
      )}

      <ProjectSelector />

      <button className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary transition-colors">
        <Bell size={20} />
      </button>
    </header>
  );
}
