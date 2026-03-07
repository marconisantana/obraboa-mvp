import { Link } from 'react-router-dom';

const LINKS = ['Funcionalidades', 'Planos', 'Para Empresas', 'Ajuda', 'Contato'];

export default function Footer() {
    return (
        <footer
            style={{
                backgroundColor: '#0D3259',
                padding: '60px 48px 40px',
                color: '#ffffff',
            }}
        >
            <div
                style={{
                    maxWidth: '1120px',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '40px',
                }}
            >
                {/* Top row */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '32px',
                    }}
                >
                    {/* Logo + tagline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <img src="/logo-obraboa-white.svg" alt="ObraBoa" style={{ height: '28px' }} />
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: 0, maxWidth: '240px', lineHeight: 1.6 }}>
                            Do planejamento à entrega das chaves, tudo em um só lugar.
                        </p>
                    </div>

                    {/* Nav links */}
                    <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                        {LINKS.map((link) => (
                            <a
                                key={link}
                                href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                                style={{
                                    color: 'rgba(255,255,255,0.65)',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#ffffff')}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)')}
                            >
                                {link}
                            </a>
                        ))}
                    </div>

                    {/* Social icons */}
                    <div style={{ display: 'flex', gap: '16px' }}>
                        {/* Instagram */}
                        <SocialIcon href="#" label="Instagram">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                <circle cx="12" cy="12" r="4" />
                                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                            </svg>
                        </SocialIcon>
                        {/* Facebook */}
                        <SocialIcon href="#" label="Facebook">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                            </svg>
                        </SocialIcon>
                        {/* LinkedIn */}
                        <SocialIcon href="#" label="LinkedIn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect x="2" y="9" width="4" height="12" />
                                <circle cx="4" cy="4" r="2" />
                            </svg>
                        </SocialIcon>
                    </div>
                </div>

                {/* Divider */}
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.10)', margin: 0 }} />

                {/* Bottom row */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                    }}
                >
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>
                        © 2026 ObraBoa. Todos os direitos reservados.
                    </p>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <Link
                            to="/terms"
                            style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '13px' }}
                        >
                            Termos de uso
                        </Link>
                        <Link
                            to="/privacy"
                            style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: '13px' }}
                        >
                            Política de privacidade
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
    return (
        <a
            href={href}
            aria-label={label}
            style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255,255,255,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                transition: 'background-color 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = 'rgba(255,255,255,0.20)';
                el.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.backgroundColor = 'rgba(255,255,255,0.10)';
                el.style.color = 'rgba(255,255,255,0.7)';
            }}
        >
            {children}
        </a>
    );
}
