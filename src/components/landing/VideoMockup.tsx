import { useState, useEffect } from 'react';

// Slideshow using campaign images as phone screen content
const SLIDES = [
    {
        image: '/images/campanha/reforma_01_planejamento.jpeg',
        label: 'Planejamento',
    },
    {
        image: '/images/campanha/reforma_04_escolha_materiais.jpeg',
        label: 'Materiais',
    },
    {
        image: '/images/campanha/reforma_06_cozinha.jpeg',
        label: 'Diário de Obra',
    },
    {
        image: '/images/campanha/reforma_07_sala_familia.jpeg',
        label: 'Resultado',
    },
];

export default function VideoMockup() {
    const [current, setCurrent] = useState(0);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setFading(true);
            setTimeout(() => {
                setCurrent((prev) => (prev + 1) % SLIDES.length);
                setFading(false);
            }, 600);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                width: '280px',
                flexShrink: 0,
                position: 'relative',
            }}
        >
            {/* iPhone frame */}
            <div
                style={{
                    width: '280px',
                    height: '560px',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '44px',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.18), 0 0 0 2px rgba(0,0,0,0.06), inset 0 0 0 1.5px rgba(255,255,255,0.8)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Notch */}
                <div
                    style={{
                        position: 'absolute',
                        top: '12px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '100px',
                        height: '28px',
                        backgroundColor: '#F3F4F6',
                        borderRadius: '20px',
                        zIndex: 10,
                    }}
                />

                {/* Screen */}
                <div
                    style={{
                        position: 'absolute',
                        inset: '6px',
                        borderRadius: '38px',
                        overflow: 'hidden',
                        backgroundColor: '#1e293b',
                    }}
                >
                    {/* Status bar */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '36px',
                            background: 'rgba(13,50,89,0.95)',
                            zIndex: 5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 20px',
                        }}
                    >
                        <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>9:41</span>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <svg width="14" height="10" viewBox="0 0 14 10" fill="white" opacity={0.9}>
                                <rect x="0" y="4" width="3" height="6" rx="0.5" />
                                <rect x="4" y="2" width="3" height="8" rx="0.5" />
                                <rect x="8" y="0" width="3" height="10" rx="0.5" />
                            </svg>
                            <svg width="16" height="10" viewBox="0 0 16 10" fill="white" opacity={0.9}>
                                <rect x="1" y="2" width="12" height="7" rx="1" stroke="white" strokeWidth="1" fill="none" />
                                <rect x="13" y="4" width="2" height="3" rx="0.5" fill="white" />
                                <rect x="2" y="3" width="8" height="5" rx="0.5" fill="white" />
                            </svg>
                        </div>
                    </div>

                    {/* App header */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '36px',
                            left: 0,
                            right: 0,
                            height: '48px',
                            background: '#0D3259',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 16px',
                            gap: '8px',
                            zIndex: 4,
                        }}
                    >
                        <img src="/logo-obraboa-white.svg" alt="ObraBoa" style={{ height: '18px', opacity: 0.9 }} />
                    </div>

                    {/* Slide content */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '84px',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            transition: 'opacity 0.6s ease',
                            opacity: fading ? 0 : 1,
                        }}
                    >
                        <img
                            src={SLIDES[current].image}
                            alt={SLIDES[current].label}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />

                        {/* Label overlay */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'linear-gradient(to top, rgba(13,50,89,0.85) 0%, transparent 100%)',
                                padding: '24px 16px 16px',
                            }}
                        >
                            <p style={{ color: '#F59E0B', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', margin: '0 0 2px', textTransform: 'uppercase' }}>
                                ObraBoa
                            </p>
                            <p style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700, margin: 0 }}>
                                {SLIDES[current].label}
                            </p>
                        </div>
                    </div>

                    {/* Bottom nav bar */}
                    <div
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '52px',
                            background: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-around',
                            borderTop: '1px solid #E5E7EB',
                            zIndex: 5,
                        }}
                    >
                        {['🏠', '📅', '🛒', '📄'].map((icon, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '2px',
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>{icon}</span>
                                <span
                                    style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        backgroundColor: i === 0 ? '#F59E0B' : 'transparent',
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
                {SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        style={{
                            width: i === current ? '20px' : '6px',
                            height: '6px',
                            borderRadius: '3px',
                            backgroundColor: i === current ? '#F59E0B' : '#D1D5DB',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            padding: 0,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
