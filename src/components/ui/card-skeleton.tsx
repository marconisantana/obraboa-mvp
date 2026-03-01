import React from 'react';
import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('animate-pulse rounded-md bg-muted/70', className)}
            {...props}
        />
    );
}

/** Skeleton para card de projeto (Home e ProjectsPage) */
export function ProjectCardSkeleton() {
    return (
        <div className="rounded-3xl bg-white p-5 card-shadow">
            <div className="flex items-start gap-3">
                {/* Ícone */}
                <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-7 w-7 rounded-full shrink-0" />
            </div>
            <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-3 w-14" />
            </div>
        </div>
    );
}

/** Skeleton para card de etapa (SchedulePage) */
export function StageCardSkeleton() {
    return (
        <div className="rounded-3xl bg-white p-5 card-shadow space-y-3">
            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex gap-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    );
}

/** Skeleton para item de lista genérico (RDO, Checklists, etc.) */
export function ListItemSkeleton() {
    return (
        <div className="rounded-3xl bg-white p-4 card-shadow flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-2xl shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
        </div>
    );
}

