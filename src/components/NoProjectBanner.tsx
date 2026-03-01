import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FolderKanban, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NoProjectBannerProps {
    /** Ícone da seção (ex: CalendarDays, FileText) */
    icon: React.ElementType;
    /** Título da seção (ex: "Cronograma") */
    title: string;
}

/**
 * Exibido nas telas que dependem de um projeto ativo.
 * Orienta o usuário a navegar para Projetos e selecionar um.
 */
export default function NoProjectBanner({ icon: Icon, title }: NoProjectBannerProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-5 px-6">
            {/* Ícone em círculo colorido — estilo FamilyWall */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Icon size={40} className="text-primary" />
            </div>

            <div className="space-y-1.5">
                <h2 className="text-2xl font-extrabold text-primary tracking-tight">{title}</h2>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                    {t('common.selectProjectFirst')}
                </p>
            </div>

            {/* CTA pill em amber — destaque visual */}
            <div className="flex flex-col items-center gap-2 mt-1">
                <Button
                    onClick={() => navigate('/projects')}
                    className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
                    size="lg"
                >
                    <FolderKanban size={18} />
                    {t('common.goToProjects')}
                    <ArrowRight size={18} />
                </Button>
                <p className="text-xs text-muted-foreground">
                    {t('common.selectProjectHint')}
                </p>
            </div>
        </div>
    );
}

