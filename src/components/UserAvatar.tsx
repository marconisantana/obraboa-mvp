import React from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
    fullName?: string | null;
    avatarUrl?: string | null;
    /** sm=32px  md=40px  lg=64px */
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeMap = {
    sm: { outer: 'h-8 w-8', text: 'text-[11px]' },
    md: { outer: 'h-10 w-10', text: 'text-[13px]' },
    lg: { outer: 'h-16 w-16', text: 'text-[20px]' },
};

/** Retorna as 2 primeiras iniciais do nome completo */
function getInitials(name?: string | null): string {
    if (!name) return '?';
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('');
}

export default function UserAvatar({ fullName, avatarUrl, size = 'md', className }: UserAvatarProps) {
    const { outer, text } = sizeMap[size];

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl}
                alt={fullName ?? 'Avatar'}
                className={cn(`${outer} rounded-full object-cover`, className)}
            />
        );
    }

    return (
        <div
            className={cn(
                `${outer} rounded-full flex items-center justify-center font-bold select-none`,
                className,
            )}
            style={{ backgroundColor: '#F59E0B', color: '#0D3259' }}
            aria-label={fullName ?? 'Avatar'}
        >
            <span className={text}>{getInitials(fullName)}</span>
        </div>
    );
}
