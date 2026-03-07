import { useEffect, useRef } from 'react';

interface FeatureBlock {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    reverse?: boolean;
    id?: string;
}

const FEATURES: FeatureBlock[] = [
    {
        eyebrow: 'CRONOGRAMA',
        title: 'Planeje cada etapa\ncom clareza',
        description:
            'Crie e acompanhe o cronograma completo da sua obra. Defina marcos, prazo de cada etapa e receba alertas quando uma fase estiver atrasada. Visão clara para você e para toda a equipe.',
        image: '/images/campanha/reforma_01_planejamento.jpeg',
        imageAlt: 'Planejamento de obra',
        id: 'cronograma',
    },
    {
        eyebrow: 'COMPRAS & DOSSIÊS',
        title: 'Controle total\ndas compras da obra',
        description:
            'Organize orçamentos, compare fornecedores e mantenha um dossiê completo de tudo que foi comprado. Nunca mais perca uma nota fiscal ou esqueça de pagar um fornecedor.',
        image: '/images/campanha/reforma_04_escolha_materiais.jpeg',
        imageAlt: 'Escolha de materiais',
        reverse: true,
        id: 'compras',
    },
    {
        eyebrow: 'DIÁRIO DE OBRA',
        title: 'Registre o progresso\ndia a dia',
        description:
            'Seu arquiteto ou mestre de obras registra fotos, ocorrências e resumo diário diretamente pelo app. Você acompanha tudo em tempo real, de onde estiver.',
        image: '/images/campanha/reforma_02_obra.jpeg',
        imageAlt: 'Obra em andamento',
        id: 'diario',
    },
    {
        eyebrow: 'RESULTADO',
        title: 'Do caos ao lar\ndos sonhos',
        description:
            'Com o ObraBoa, o que era estresse vira conquista. Acompanhe cada etapa e chegue no dia da entrega das chaves com a certeza de que tudo foi feito do jeito certo.',
        image: '/images/campanha/reforma_07_sala_familia.jpeg',
        imageAlt: 'Resultado final — sala de família',
        reverse: true,
        id: 'resultado',
    },
];

export default function FeaturesSection() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.querySelectorAll('.fade-in-up').forEach((el, i) => {
                            setTimeout(() => {
                                (el as HTMLElement).classList.add('visible');
                            }, i * 100);
                        });
                    }
                });
            },
            { threshold: 0.1 }
        );

        const blocks = sectionRef.current?.querySelectorAll('.feature-block');
        blocks?.forEach((block) => observer.observe(block));
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                backgroundColor: '#F8FAFC',
                padding: '80px 48px',
                overflow: 'hidden',
            }}
        >
            <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '100px' }}>
                {FEATURES.map((feature) => (
                    <div
                        key={feature.eyebrow}
                        id={feature.id}
                        className="feature-block"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '56px',
                            alignItems: 'center',
                        }}
                    >
                        {/* Image */}
                        <div
                            className={`fade-in-up ${feature.reverse ? 'feature-order-2' : ''}`}
                            style={{
                                order: feature.reverse ? 1 : 0,
                            }}
                        >
                            <img
                                src={feature.image}
                                alt={feature.imageAlt}
                                loading="lazy"
                                style={{
                                    width: '100%',
                                    height: '360px',
                                    objectFit: 'cover',
                                    borderRadius: '20px',
                                    boxShadow: '0 20px 60px rgba(0,0,0,0.10)',
                                    display: 'block',
                                }}
                            />
                        </div>

                        {/* Text */}
                        <div
                            className="fade-in-up"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                order: feature.reverse ? 0 : 1,
                            }}
                        >
                            <p
                                style={{
                                    color: '#F59E0B',
                                    fontSize: '12px',
                                    fontWeight: 700,
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase',
                                    margin: 0,
                                }}
                            >
                                {feature.eyebrow}
                            </p>

                            <h3
                                style={{
                                    color: '#0D3259',
                                    fontSize: 'clamp(24px, 2.8vw, 36px)',
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                    margin: 0,
                                    whiteSpace: 'pre-line',
                                }}
                            >
                                {feature.title}
                            </h3>

                            <p
                                style={{
                                    color: '#4B5563',
                                    fontSize: '16px',
                                    lineHeight: 1.75,
                                    margin: 0,
                                    maxWidth: '440px',
                                }}
                            >
                                {feature.description}
                            </p>

                            <a
                                href="/signup"
                                style={{
                                    color: '#0D3259',
                                    fontSize: '14px',
                                    fontWeight: 700,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    marginTop: '8px',
                                    width: 'fit-content',
                                }}
                            >
                                Saiba mais →
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
