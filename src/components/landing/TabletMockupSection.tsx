export default function TabletMockupSection() {
    return (
        <section
            style={{
                backgroundColor: '#F8FAFC',
                padding: '100px 48px',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    maxWidth: '1120px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '64px',
                    alignItems: 'center',
                }}
                className="landing-feature-grid"
            >
                {/* Left: Text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <p
                        className="scroll-animate"
                        style={{
                            color: '#F59E0B',
                            fontSize: '12px',
                            fontWeight: 700,
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            margin: 0,
                        }}
                    >
                        PARA TODOS OS DISPOSITIVOS
                    </p>

                    <h2
                        className="scroll-animate"
                        style={{
                            color: '#0D3259',
                            fontSize: 'clamp(26px, 3vw, 38px)',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            margin: 0,
                        }}
                    >
                        Acompanhe sua obra
                        <br />
                        de qualquer lugar
                    </h2>

                    <p
                        className="scroll-animate"
                        style={{
                            color: '#4B5563',
                            fontSize: '16px',
                            lineHeight: 1.75,
                            margin: 0,
                            maxWidth: '440px',
                        }}
                    >
                        No celular na obra, no tablet em casa, no computador no escritório.
                        O ObraBoa se adapta ao seu momento e ao seu dispositivo.
                    </p>

                    {/* Device icons */}
                    <div
                        className="scroll-animate"
                        style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '8px' }}
                    >
                        {[
                            { icon: '📱', label: 'Mobile' },
                            { icon: '💻', label: 'Desktop' },
                            { icon: '📟', label: 'Tablet' },
                        ].map((d) => (
                            <div
                                key={d.label}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <span
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        backgroundColor: '#EDF2F7',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                    }}
                                >
                                    {d.icon}
                                </span>
                                <span style={{ color: '#0D3259', fontSize: '14px', fontWeight: 600 }}>
                                    {d.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Tablet mockup */}
                <div
                    className="scroll-animate"
                    style={{ display: 'flex', justifyContent: 'center' }}
                >
                    {/* Tablet frame — landscape */}
                    <div
                        style={{
                            position: 'relative',
                            width: '480px',
                            maxWidth: '100%',
                        }}
                    >
                        {/* Frame */}
                        <div
                            style={{
                                width: '100%',
                                paddingTop: '75%', // 4:3 ratio
                                position: 'relative',
                                backgroundColor: '#E5E7EB',
                                borderRadius: '20px',
                                border: '10px solid #D1D5DB',
                                boxShadow: '0 30px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.06)',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Home button left side */}
                            <div
                                style={{
                                    position: 'absolute',
                                    left: '-14px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '6px',
                                    height: '40px',
                                    backgroundColor: '#9CA3AF',
                                    borderRadius: '3px 0 0 3px',
                                }}
                            />
                            {/* Screen */}
                            <img
                                src="/images/campanha/reforma_17_tablet_projeto.jpg"
                                alt="ObraBoa no tablet"
                                loading="lazy"
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover',
                                    borderRadius: '10px',
                                }}
                            />
                            {/* Overlay with UI bar */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: '32px',
                                    backgroundColor: 'rgba(13, 50, 89, 0.88)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '0 16px',
                                    justifyContent: 'space-between',
                                }}
                            >
                                <img src="/logo-obraboa-white.svg" alt="ObraBoa" style={{ height: '14px' }} />
                                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px' }}>AP501 Gaudi</span>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div
                            style={{
                                position: 'absolute',
                                bottom: '-16px',
                                right: '24px',
                                backgroundColor: '#F59E0B',
                                color: '#0D3259',
                                fontSize: '11px',
                                fontWeight: 700,
                                padding: '6px 14px',
                                borderRadius: '20px',
                                boxShadow: '0 4px 16px rgba(245,158,11,0.35)',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            62% concluído
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
