import { useState } from 'react';

interface Feature {
    id: string;
    icon: string;
    iconBg: string;
    title: string;
    subtitle: string;
    description: string;
    bullets: string[];
}

const FEATURES: Feature[] = [
    {
        id: 'financeiro',
        icon: '💰',
        iconBg: '#DCFCE7',
        title: 'Gestão Financeira',
        subtitle: 'CADA CENTAVO CONTA',
        description: 'Centralize todas as despesas da obra em um único lugar. Esqueça as notas fiscais perdidas e as planilhas confusas.',
        bullets: ['Categorização de despesas', 'Controle de pagamentos', 'Relatório financeiro completo'],
    },
    {
        id: 'orcamento',
        icon: '📊',
        iconBg: '#DBEAFE',
        title: 'Controle Orçamentário',
        subtitle: 'METAS E LIMITES',
        description: 'Defina o orçamento por etapa e acompanhe em tempo real se está dentro do planejado. Alertas automáticos antes de estourar o limite.',
        bullets: ['Orçamento por etapa da obra', 'Alertas de desvio', 'Comparativo previsto x realizado'],
    },
    {
        id: 'diario',
        icon: '📷',
        iconBg: '#FEF3C7',
        title: 'Diário de Obra',
        subtitle: 'HISTÓRICO COMPLETO',
        description: 'Registre o avanço diário com fotos, textos e checklists. Um histórico visual completo da evolução da sua obra.',
        bullets: ['Fotos e anotações diárias', 'Linha do tempo visual', 'Relatório de progresso'],
    },
    {
        id: 'relatorios',
        icon: '📈',
        iconBg: '#F3E8FF',
        title: 'Relatórios e Análises',
        subtitle: 'DADOS PARA DECISÃO',
        description: 'Relatórios automáticos de andamento, gastos e prazos. Compartilhe com seu arquiteto ou engenheiro com um clique.',
        bullets: ['RDO automático', 'Exportação em PDF', 'Compartilhamento com equipe'],
    },
    {
        id: 'cronograma',
        icon: '📅',
        iconBg: '#E0E7FF',
        title: 'Cronograma de Serviços',
        subtitle: 'PRAZO SOB CONTROLE',
        description: 'Visualize todas as etapas da obra em um cronograma intuitivo. Saiba exatamente o que está atrasado e o que vem a seguir.',
        bullets: ['Gráfico de Gantt simplificado', 'Alertas de atraso', 'Etapas com responsáveis'],
    },
    {
        id: 'checklists',
        icon: '✅',
        iconBg: '#FEF9C3',
        title: 'Check-Lists',
        subtitle: 'NADA FICA ESQUECIDO',
        description: 'Crie listas de verificação para cada etapa. Garanta que nenhum detalhe importante seja deixado de lado durante a obra.',
        bullets: ['Templates prontos por etapa', 'Atribuição por responsável', 'Histórico de conclusão'],
    },
    {
        id: 'documentos',
        icon: '📁',
        iconBg: '#FFE4E6',
        title: 'Organizador de Docs',
        subtitle: 'TUDO NO LUGAR CERTO',
        description: 'Plantas, contratos, notas fiscais e projetos organizados por obra. Acesse qualquer documento na hora que precisar, de qualquer lugar.',
        bullets: ['Pastas por categoria', 'Upload de fotos e PDFs', 'Compartilhamento seguro'],
    },
    {
        id: 'referencias',
        icon: '🎨',
        iconBg: '#F0FDF4',
        title: 'Caderno de Referências',
        subtitle: 'SUA INSPIRAÇÃO ORGANIZADA',
        description: 'Salve inspirações de acabamentos, móveis e decoração diretamente na obra. Compartilhe suas referências com o arquiteto sem perder nada.',
        bullets: ['Salvar imagens e links', 'Organizar por ambiente', 'Compartilhar com profissionais'],
    },
];

function FeatureCard({ feature }: { feature: Feature }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="scroll-animate"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={() => setHovered((v) => !v)} // Mobile tap toggle
            style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: '28px 24px',
                border: hovered ? '1.5px solid #F59E0B' : '1.5px solid transparent',
                boxShadow: hovered
                    ? '0 12px 40px rgba(245,158,11,0.15)'
                    : '0 2px 12px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                transition: 'all 0.35s ease',
                transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '180px',
            }}
        >
            {/* Default content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Icon */}
                <div
                    style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '14px',
                        backgroundColor: feature.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        flexShrink: 0,
                    }}
                >
                    {feature.icon}
                </div>
                {/* Subtitle */}
                <p style={{ color: '#F59E0B', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0 }}>
                    {feature.subtitle}
                </p>
                {/* Title */}
                <h3 style={{ color: '#0D3259', fontSize: '16px', fontWeight: 700, margin: 0, lineHeight: 1.3 }}>
                    {feature.title}
                </h3>

                {/* Expandable content */}
                <div
                    style={{
                        maxHeight: hovered ? '200px' : '0',
                        opacity: hovered ? 1 : 0,
                        overflow: 'hidden',
                        transition: 'max-height 0.35s ease, opacity 0.3s ease',
                    }}
                >
                    <p style={{ color: '#4B5563', fontSize: '13px', lineHeight: 1.65, margin: '0 0 12px' }}>
                        {feature.description}
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {feature.bullets.map((bullet) => (
                            <li
                                key={bullet}
                                style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#374151' }}
                            >
                                <span style={{ color: '#F59E0B', fontSize: '8px', lineHeight: '1.8', flexShrink: 0 }}>●</span>
                                {bullet}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default function FeaturesGrid() {
    return (
        <section
            id="funcionalidades"
            style={{
                backgroundColor: '#F0F4F8',
                padding: '100px 48px',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h2
                    className="scroll-animate"
                    style={{
                        color: '#0D3259',
                        fontSize: 'clamp(28px, 3.5vw, 44px)',
                        fontWeight: 800,
                        margin: '0 0 12px',
                    }}
                >
                    Tudo que você precisa
                </h2>
                <p
                    className="scroll-animate"
                    style={{ color: '#6B7280', fontSize: '17px', margin: 0, maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto' }}
                >
                    Passe o cursor sobre cada ferramenta para descobrir como ela transforma sua obra.
                </p>
            </div>

            {/* Grid */}
            <div
                style={{
                    maxWidth: '1120px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '20px',
                }}
            >
                {FEATURES.map((feature) => (
                    <FeatureCard key={feature.id} feature={feature} />
                ))}
            </div>
        </section>
    );
}
