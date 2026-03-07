import { useEffect, useRef } from 'react';

interface Plan {
    id: string;
    name: string;
    price: string;
    priceNote: string;
    badge?: string;
    featured?: boolean;
    features: string[];
    cta: string;
}

const PLANS: Plan[] = [
    {
        id: 'gratuito',
        name: 'Gratuito',
        price: 'R$ 0',
        priceNote: 'Para sempre',
        features: [
            '1 projeto ativo',
            'Cronograma básico',
            'Diário de obra (30 dias)',
            'Até 3 colaboradores',
            'Suporte por email',
        ],
        cta: 'Começar grátis',
    },
    {
        id: 'basic',
        name: 'Basic',
        price: 'R$ 39',
        priceNote: 'por mês',
        features: [
            '3 projetos ativos',
            'Cronograma completo',
            'Diário de obra ilimitado',
            'Módulo de compras',
            'Até 5 colaboradores',
            'Suporte prioritário',
        ],
        cta: 'Assinar Basic',
    },
    {
        id: 'flipper',
        name: 'Flipper',
        price: 'R$ 89',
        priceNote: 'por mês',
        badge: 'Mais popular',
        featured: true,
        features: [
            '10 projetos ativos',
            'Todos os módulos',
            'Dossiês e documentos',
            'Relatórios em PDF',
            'Colaboradores ilimitados',
            'Suporte dedicado',
            'App mobile premium',
        ],
        cta: 'Assinar Flipper',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 'R$ 189',
        priceNote: 'por mês',
        features: [
            'Projetos ilimitados',
            'API de integração',
            'Dashboard executivo',
            'Assinatura digital',
            'White-label disponível',
            'SLA garantido',
            'Gerente de conta dedicado',
        ],
        cta: 'Assinar Pro',
    },
];

export default function PlansSection() {
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.querySelectorAll('.fade-in-up').forEach((el, i) => {
                            setTimeout(() => {
                                (el as HTMLElement).classList.add('visible');
                            }, i * 120);
                        });
                    }
                });
            },
            { threshold: 0.1 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="planos"
            style={{
                backgroundColor: '#ffffff',
                padding: '100px 48px',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: '64px' }}>
                <h2
                    style={{
                        color: '#0D3259',
                        fontSize: 'clamp(28px, 3.5vw, 42px)',
                        fontWeight: 700,
                        margin: '0 0 12px',
                    }}
                >
                    Escolha seu plano
                </h2>
                <p style={{ color: '#6B7280', fontSize: '17px', margin: 0 }}>
                    Comece grátis. Evolua conforme sua obra crescer.
                </p>
            </div>

            {/* Cards */}
            <div
                style={{
                    maxWidth: '1120px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                    gap: '20px',
                    alignItems: 'start',
                }}
            >
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className="fade-in-up"
                        style={{
                            borderRadius: '20px',
                            padding: plan.featured ? '32px 28px' : '28px 24px',
                            border: plan.featured ? '2px solid #F59E0B' : '1.5px solid #E5E7EB',
                            backgroundColor: plan.featured ? '#FFFBEB' : '#ffffff',
                            position: 'relative',
                            boxShadow: plan.featured ? '0 12px 48px rgba(245,158,11,0.15)' : '0 2px 12px rgba(0,0,0,0.04)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                            (e.currentTarget as HTMLDivElement).style.boxShadow = plan.featured
                                ? '0 20px 64px rgba(245,158,11,0.22)'
                                : '0 12px 40px rgba(0,0,0,0.10)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                            (e.currentTarget as HTMLDivElement).style.boxShadow = plan.featured
                                ? '0 12px 48px rgba(245,158,11,0.15)'
                                : '0 2px 12px rgba(0,0,0,0.04)';
                        }}
                    >
                        {/* Badge */}
                        {plan.badge && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-13px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    backgroundColor: '#F59E0B',
                                    color: '#0D3259',
                                    fontSize: '11px',
                                    fontWeight: 800,
                                    letterSpacing: '1px',
                                    textTransform: 'uppercase',
                                    padding: '4px 16px',
                                    borderRadius: '20px',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {plan.badge}
                            </div>
                        )}

                        {/* Plan name */}
                        <p style={{ color: '#6B7280', fontSize: '13px', fontWeight: 600, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {plan.name}
                        </p>

                        {/* Price */}
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ color: '#0D3259', fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>
                                {plan.price}
                            </span>
                            <span style={{ color: '#9CA3AF', fontSize: '14px', marginLeft: '4px' }}>{plan.priceNote}</span>
                        </div>

                        {/* Divider */}
                        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '0 0 20px' }} />

                        {/* Features */}
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {plan.features.map((f) => (
                                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#374151' }}>
                                    <span style={{ color: '#F59E0B', fontSize: '16px', lineHeight: 1.2, flexShrink: 0 }}>✓</span>
                                    {f}
                                </li>
                            ))}
                        </ul>

                        {/* CTA */}
                        <a
                            href="/signup"
                            style={{
                                display: 'block',
                                textAlign: 'center',
                                padding: '13px 20px',
                                borderRadius: '14px',
                                fontSize: '14px',
                                fontWeight: 700,
                                textDecoration: 'none',
                                backgroundColor: plan.featured ? '#F59E0B' : 'transparent',
                                color: plan.featured ? '#0D3259' : '#0D3259',
                                border: plan.featured ? 'none' : '1.5px solid #0D3259',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {plan.cta}
                        </a>
                    </div>
                ))}
            </div>
        </section>
    );
}
