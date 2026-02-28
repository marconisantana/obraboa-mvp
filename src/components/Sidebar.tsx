import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, FolderKanban, CalendarDays, FileText, UserCircle, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const navItems = [
  { key: 'home', path: '/', icon: Home },
  { key: 'projects', path: '/projects', icon: FolderKanban },
  { key: 'schedule', path: '/schedule', icon: CalendarDays },
  { key: 'documents', path: '/documents', icon: FileText },
  { key: 'profile', path: '/profile', icon: UserCircle },
];

export default function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:bg-card lg:fixed lg:inset-y-0 lg:left-0 lg:z-40">
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <img src="/logo-obraboa-navy.svg" alt="ObraBoa" className="h-10" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map(({ key, path, icon: Icon }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={20} />
              <span>{t(`nav.${key}`)}</span>
            </button>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut size={20} />
          <span>{t('auth.logout')}</span>
        </button>
      </div>
    </aside>
  );
}
