import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, FolderKanban, CalendarDays, FileText, UserCircle } from 'lucide-react';

const navItems = [
  { key: 'home', path: '/', icon: Home },
  { key: 'projects', path: '/projects', icon: FolderKanban },
  { key: 'schedule', path: '/schedule', icon: CalendarDays },
  { key: 'documents', path: '/documents', icon: FileText },
  { key: 'profile', path: '/profile', icon: UserCircle },
];

export default function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card safe-bottom lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map(({ key, path, icon: Icon }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
                isActive ? 'text-accent' : 'text-muted-foreground'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={isActive ? 'font-semibold' : 'font-medium'}>{t(`nav.${key}`)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
