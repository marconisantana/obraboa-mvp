import { useEffect, useRef } from 'react';

export default function CTASection() {
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
            { threshold: 0.15 }
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            style={{
                position: 'relative',
                padding: '120px 48px',
                overflow: 'hidden',
                backgroundImage: 'url(/images/campanha/reforma_03_novo_lar.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                textAlign: 'center',
            }}
        >
            {/* Overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(13,50,89,0.72)',
                }}
            />

            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '560px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                }}
            >
                <h2
                    className="fade-in-up"
                    style={{
                        color: '#ffffff',
                        fontSize: 'clamp(28px, 4vw, 44px)',
                        fontWeight: 800,
                        lineHeight: 1.15,
                        margin: 0,
                    }}
                >
                    Comece a organizar
                    <br />
                    sua obra hoje
                </h2>

                <p
                    className="fade-in-up"
                    style={{
                        color: 'rgba(255,255,255,0.82)',
                        fontSize: '17px',
                        lineHeight: 1.65,
                        margin: 0,
                    }}
                >
                    Gratuito para sempre no plano básico.
                    <br />
                    Sem cartão de crédito.
                </p>

                <a
                    className="fade-in-up"
                    href="/signup"
                    style={{
                        marginTop: '8px',
                        backgroundColor: '#F59E0B',
                        color: '#0D3259',
                        padding: '18px 52px',
                        borderRadius: '32px',
                        fontSize: '17px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        boxShadow: '0 10px 40px rgba(245,158,11,0.45)',
                        transition: 'all 0.2s ease',
                        display: 'inline-block',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)';
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 16px 50px rgba(245,158,11,0.55)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 10px 40px rgba(245,158,11,0.45)';
                    }}
                >
                    Criar conta grátis
                </a>

                <a
                    className="fade-in-up"
                    href="/login"
                    style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '14px',
                        textDecoration: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.4)',
                        paddingBottom: '2px',
                        transition: 'color 0.2s',
                    }}
                >
                    Já tenho conta → Entrar
                </a>
            </div>
        </section>
    );
}
