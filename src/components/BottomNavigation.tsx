import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, HardHat, Wrench, CircleAlert, User } from 'lucide-react';

const navItems = [
  { key: 'home', path: '/', icon: Home },
  { key: 'projects', path: '/projects', icon: HardHat },
  { key: 'tools', path: '/tools', icon: Wrench },
  { key: 'pending', path: '/pending', icon: CircleAlert },
  { key: 'profile', path: '/profile', icon: User },
];

export default function BottomNavigation() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#F3F4F6] shadow-[0_-2px_12px_rgba(0,0,0,0.06)] safe-bottom">
      <div className="flex h-[60px] items-center justify-around">
        {navItems.map(({ key, path, icon: Icon }) => {
          const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 transition-colors"
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 2}
                color={isActive ? '#0D3259' : '#9CA3AF'}
                fill={isActive ? '#0D3259' : 'none'}
              />
              <span
                className="font-nunito"
                style={{
                  fontSize: '11px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#0D3259' : '#9CA3AF',
                }}
              >
                {t(`nav.${key}`)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
