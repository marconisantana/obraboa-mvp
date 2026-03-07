export default function HeroSection() {
    const heroStyle: React.CSSProperties = {
        position: 'relative',
        height: '100vh',
        minHeight: '600px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundImage: 'url(/images/campanha/reforma_08_hero.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    const overlayStyle: React.CSSProperties = {
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(13,50,89,0.45) 0%, rgba(13,50,89,0.30) 50%, rgba(13,50,89,0.65) 100%)',
    };

    const contentStyle: React.CSSProperties = {
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        padding: '0 24px',
        maxWidth: '720px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
    };

    return (
        <section style={heroStyle} id="hero">
            <div style={overlayStyle} />

            <div style={contentStyle}>
                {/* Eyebrow */}
                <p
                    style={{
                        color: '#F59E0B',
                        fontSize: '13px',
                        fontWeight: 700,
                        letterSpacing: '3px',
                        textTransform: 'uppercase',
                        margin: 0,
                    }}
                >
                    O ASSISTENTE DA SUA OBRA
                </p>

                {/* H1 */}
                <h1
                    style={{
                        color: '#ffffff',
                        fontSize: 'clamp(36px, 5vw, 56px)',
                        fontWeight: 800,
                        lineHeight: 1.1,
                        margin: 0,
                        textShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    }}
                >
                    Sua obra organizada,
                    <br />
                    sua família feliz.
                </h1>

                {/* Subtitle */}
                <p
                    style={{
                        color: 'rgba(255,255,255,0.88)',
                        fontSize: '18px',
                        lineHeight: 1.65,
                        maxWidth: '560px',
                        margin: 0,
                    }}
                >
                    Do planejamento à entrega das chaves, tudo em um só lugar.
                    Simples, intuitivo e feito para quem realiza o sonho da casa própria.
                </p>

                {/* CTA buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                    <a
                        href="/signup"
                        style={{
                            backgroundColor: '#F59E0B',
                            color: '#0D3259',
                            padding: '18px 48px',
                            borderRadius: '32px',
                            fontSize: '17px',
                            fontWeight: 700,
                            textDecoration: 'none',
                            boxShadow: '0 8px 32px rgba(245,158,11,0.4)',
                            transition: 'all 0.2s ease',
                            display: 'inline-block',
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)';
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 12px 40px rgba(245,158,11,0.5)';
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(245,158,11,0.4)';
                        }}
                    >
                        Começar grátis
                    </a>

                    <a
                        href="#funcionalidades"
                        style={{
                            color: '#ffffff',
                            fontSize: '15px',
                            fontWeight: 500,
                            textDecoration: 'underline',
                            textUnderlineOffset: '3px',
                            opacity: 0.9,
                        }}
                    >
                        Ver como funciona ↓
                    </a>
                </div>

                {/* App store badges */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center', opacity: 0.9 }}>
                    <AppStoreBadge />
                    <GooglePlayBadge />
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="hero-scroll-arrow" style={{ position: 'absolute', bottom: '36px', left: '50%', transform: 'translateX(-50%)', zIndex: 1 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }}>
                    <path d="M12 5v14M5 12l7 7 7-7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </section>
    );
}

function AppStoreBadge() {
    return (
        <a
            href="#"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: '12px',
                padding: '8px 16px',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
            }}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div style={{ textAlign: 'left' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '9px', lineHeight: 1 }}>Download on the</div>
                <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>App Store</div>
            </div>
        </a>
    );
}

function GooglePlayBadge() {
    return (
        <a
            href="#"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                borderRadius: '12px',
                padding: '8px 16px',
                textDecoration: 'none',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
            }}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M3 20.5v-17c0-.83.94-1.3 1.6-.8l14 8.5c.6.37.6 1.23 0 1.6l-14 8.5c-.66.5-1.6.03-1.6-.8z" />
            </svg>
            <div style={{ textAlign: 'left' }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '9px', lineHeight: 1 }}>GET IT ON</div>
                <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: 600, lineHeight: 1.4 }}>Google Play</div>
            </div>
        </a>
    );
}
