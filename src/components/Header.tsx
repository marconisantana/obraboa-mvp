import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Bell } from 'lucide-react';
import ProjectSelector from './ProjectSelector';
import UserAvatar from './UserAvatar';
import { useAppStore } from '@/stores/useAppStore';

export default function Header() {
  const isMobile = useIsMobile();
  const user = useAppStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between px-4"
      style={{ backgroundColor: '#0D3259' }}
    >
      {/* Logo branca (CSS filter inverte a imagem navy para branca) */}
      {isMobile ? (
        <img
          src="/icon-obraboa-navy.svg"
          alt="ObraBoa"
          className="h-8"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
      ) : (
        <div />
      )}

      {/* Seletor de projeto — texto branco */}
      <div className="[&_button]:text-white [&_span]:text-white/80 [&_svg]:text-white/70">
        <ProjectSelector />
      </div>

      {/* Avatar do usuário com iniciais amber */}
      <UserAvatar
        fullName={user?.full_name}
        avatarUrl={user?.avatar_url}
        size="sm"
      />
    </header>
  );
}
