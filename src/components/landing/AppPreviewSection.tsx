import { useEffect, useRef } from 'react';
import VideoMockup from './VideoMockup';

export default function AppPreviewSection() {
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
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="funcionalidades"
            style={{
                backgroundColor: '#ffffff',
                padding: '120px 48px',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    maxWidth: '1120px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '64px',
                    alignItems: 'center',
                }}
                className="landing-feature-grid"
            >
                {/* Left: Phone mockup */}
                <div className="fade-in-up" style={{ display: 'flex', justifyContent: 'center' }}>
                    <VideoMockup />
                </div>

                {/* Right: Text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p
                        className="fade-in-up"
                        style={{
                            color: '#F59E0B',
                            fontSize: '13px',
                            fontWeight: 700,
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            margin: 0,
                        }}
                    >
                        VISÃO GERAL DA OBRA
                    </p>

                    <h2
                        className="fade-in-up"
                        style={{
                            color: '#0D3259',
                            fontSize: 'clamp(28px, 3.5vw, 40px)',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            margin: 0,
                        }}
                    >
                        Tudo da sua obra
                        <br />
                        em um só painel
                    </h2>

                    <p
                        className="fade-in-up"
                        style={{
                            color: '#4B5563',
                            fontSize: '17px',
                            lineHeight: 1.75,
                            margin: 0,
                            maxWidth: '480px',
                        }}
                    >
                        O ObraBoa centraliza cronograma, compras, documentos e relatórios diários
                        em uma interface simples. Você e seu arquiteto sempre na mesma página.
                    </p>

                    {/* Feature chips */}
                    <div className="fade-in-up" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {['Cronograma', 'Compras', 'Diário de Obra', 'Dossiês', 'Documentos'].map((f) => (
                            <span
                                key={f}
                                style={{
                                    backgroundColor: '#F0F9FF',
                                    color: '#0D3259',
                                    borderRadius: '20px',
                                    padding: '6px 16px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    border: '1px solid #BAE6FD',
                                }}
                            >
                                {f}
                            </span>
                        ))}
                    </div>

                    {/* Rating card */}
                    <div
                        className="fade-in-up"
                        style={{
                            backgroundColor: '#F9FAFB',
                            borderRadius: '16px',
                            padding: '20px 24px',
                            border: '1px solid #E5E7EB',
                            marginTop: '8px',
                            maxWidth: '420px',
                        }}
                    >
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
                            {[...Array(5)].map((_, i) => (
                                <span key={i} style={{ color: '#F59E0B', fontSize: '18px' }}>★</span>
                            ))}
                            <span style={{ color: '#6B7280', fontSize: '13px', marginLeft: '8px', alignSelf: 'center' }}>4.9 / 5</span>
                        </div>
                        <p
                            style={{
                                color: '#374151',
                                fontSize: '14px',
                                lineHeight: 1.6,
                                margin: '0 0 12px',
                                fontStyle: 'italic',
                            }}
                        >
                            "Finalmente consegui acompanhar minha obra sem precisar ligar toda hora pro engenheiro. Recomendo demais!"
                        </p>
                        <p style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 600, margin: 0 }}>
                            — Camila R., São Paulo
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
