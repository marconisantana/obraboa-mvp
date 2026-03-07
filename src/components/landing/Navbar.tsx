import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 80);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '0 40px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
        backgroundColor: scrolled ? '#ffffff' : 'transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
    };

    const linkColor = scrolled ? '#0D3259' : '#ffffff';
    const logoSrc = scrolled ? '/logo-obraboa-navy.svg' : '/logo-obraboa-white.svg';

    const ctaStyle: React.CSSProperties = {
        padding: '10px 24px',
        borderRadius: '24px',
        fontWeight: 600,
        fontSize: '14px',
        cursor: 'pointer',
        border: scrolled ? 'none' : '1.5px solid rgba(255,255,255,0.9)',
        backgroundColor: scrolled ? '#F59E0B' : 'transparent',
        color: scrolled ? '#0D3259' : '#ffffff',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        whiteSpace: 'nowrap' as const,
    };

    const links = ['Funcionalidades', 'Planos', 'Para Empresas', 'Ajuda'];

    return (
        <nav style={navStyle}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                <img
                    src={logoSrc}
                    alt="ObraBoa"
                    style={{ height: '28px', transition: 'all 0.3s ease' }}
                />
            </Link>

            {/* Desktop nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="landing-desktop-nav">
                {links.map((link) => (
                    <a
                        key={link}
                        href={`#${link.toLowerCase().replace(/\s+/g, '-').replace('ó', 'o').replace('ê', 'e')}`}
                        style={{
                            color: linkColor,
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: 500,
                            transition: 'all 0.3s ease',
                            opacity: 0.9,
                        }}
                    >
                        {link}
                    </a>
                ))}
            </div>

            {/* CTA group */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="landing-desktop-nav">
                <Link
                    to="/login"
                    style={{
                        color: linkColor,
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'all 0.3s ease',
                    }}
                >
                    Entrar
                </Link>
                <Link to="/signup" style={ctaStyle}>
                    Começar grátis
                </Link>
            </div>

            {/* Mobile hamburger */}
            <button
                className="landing-mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Menu"
                style={{
                    display: 'none',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    flexDirection: 'column',
                    gap: '5px',
                }}
            >
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        style={{
                            display: 'block',
                            width: '22px',
                            height: '2px',
                            backgroundColor: scrolled ? '#0D3259' : '#ffffff',
                            borderRadius: '2px',
                            transition: 'all 0.3s ease',
                        }}
                    />
                ))}
            </button>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: '72px',
                        left: 0,
                        right: 0,
                        backgroundColor: '#ffffff',
                        padding: '24px 32px',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        zIndex: 999,
                    }}
                >
                    {links.map((link) => (
                        <a
                            key={link}
                            href={`#${link.toLowerCase()}`}
                            style={{ color: '#0D3259', textDecoration: 'none', fontSize: '16px', fontWeight: 500 }}
                            onClick={() => setMobileOpen(false)}
                        >
                            {link}
                        </a>
                    ))}
                    <hr style={{ borderColor: '#E5E7EB', margin: '4px 0' }} />
                    <Link to="/login" style={{ color: '#0D3259', textDecoration: 'none', fontSize: '16px', fontWeight: 500 }}>
                        Entrar
                    </Link>
                    <Link
                        to="/signup"
                        style={{
                            backgroundColor: '#F59E0B',
                            color: '#0D3259',
                            padding: '12px 24px',
                            borderRadius: '24px',
                            fontWeight: 700,
                            fontSize: '15px',
                            textDecoration: 'none',
                            textAlign: 'center',
                        }}
                    >
                        Começar grátis
                    </Link>
                </div>
            )}
        </nav>
    );
}
