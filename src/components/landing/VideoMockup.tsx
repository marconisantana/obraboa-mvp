import { useState, useEffect } from 'react';

// Simulated app screens — rendered as mini React UI components
const APP_SCREENS = [
    { id: 'dashboard', label: 'Minha Obra' },
    { id: 'modules', label: 'Módulos' },
    { id: 'schedule', label: 'Cronograma' },
    { id: 'purchases', label: 'Compras' },
];

function DashboardScreen() {
    return (
        <div style={{ padding: '12px 10px', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'hidden' }}>
            {/* Project header */}
            <div style={{ backgroundColor: '#E8F1FB', borderRadius: '10px', padding: '10px 12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#0D3259' }}>AP501 Gaudi</span>
                    <span style={{ backgroundColor: '#F59E0B', color: '#0D3259', fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>Em andamento</span>
                </div>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <div style={{ flex: 1, height: '4px', backgroundColor: '#D1D5DB', borderRadius: '2px' }}>
                        <div style={{ width: '62%', height: '100%', backgroundColor: '#F59E0B', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '9px', color: '#6B7280', fontWeight: 600 }}>62%</span>
                </div>
                <span style={{ fontSize: '8px', color: '#6B7280' }}>Etapa atual: Instalações elétricas</span>
            </div>
            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                {[
                    { label: 'Gastos', value: 'R$ 87k', color: '#EF4444' },
                    { label: 'Previsto', value: 'R$ 142k', color: '#0D3259' },
                    { label: 'Etapas', value: '12/20', color: '#10B981' },
                ].map((s) => (
                    <div key={s.label} style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '6px 4px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '8px', color: '#9CA3AF' }}>{s.label}</div>
                    </div>
                ))}
            </div>
            {/* Recent entries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: '#374151', marginBottom: '2px' }}>Últimas entradas</span>
                {[
                    { icon: '📷', text: 'Foto adicionada ao diário', time: '14min' },
                    { icon: '💳', text: 'Pagamento registrado', time: '2h' },
                    { icon: '✅', text: 'Checklist concluído', time: '1d' },
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '5px 8px' }}>
                        <span style={{ fontSize: '11px' }}>{item.icon}</span>
                        <span style={{ fontSize: '9px', color: '#374151', flex: 1 }}>{item.text}</span>
                        <span style={{ fontSize: '8px', color: '#9CA3AF' }}>{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ModulesScreen() {
    const modules = [
        { icon: '📅', label: 'Cronograma', color: '#E0E7FF' },
        { icon: '💰', label: 'Financeiro', color: '#DCFCE7' },
        { icon: '📷', label: 'Diário', color: '#FEF3C7' },
        { icon: '🛒', label: 'Compras', color: '#DBEAFE' },
        { icon: '📁', label: 'Documentos', color: '#FFE4E6' },
        { icon: '✅', label: 'Checklists', color: '#FEF9C3' },
        { icon: '📊', label: 'Relatórios', color: '#F3E8FF' },
        { icon: '🎨', label: 'Referências', color: '#F0FDF4' },
    ];
    return (
        <div style={{ padding: '12px 10px' }}>
            <p style={{ fontSize: '9px', color: '#6B7280', margin: '0 0 10px', fontWeight: 500 }}>AP501 Gaudi</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
                {modules.map((m) => (
                    <div key={m.label} style={{ backgroundColor: m.color, borderRadius: '10px', padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '20px' }}>{m.icon}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#0D3259', textAlign: 'center' }}>{m.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ScheduleScreen() {
    const stages = [
        { name: 'Demolição', pct: 100, done: true },
        { name: 'Estrutura', pct: 100, done: true },
        { name: 'Hidráulica', pct: 85, done: false },
        { name: 'Elétrica', pct: 62, done: false },
        { name: 'Reboco', pct: 20, done: false },
        { name: 'Acabamento', pct: 0, done: false },
    ];
    return (
        <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#0D3259' }}>Cronograma</span>
                <span style={{ fontSize: '8px', backgroundColor: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: '6px', fontWeight: 600 }}>62% concluído</span>
            </div>
            {stages.map((s) => (
                <div key={s.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontSize: '9px', color: s.done ? '#10B981' : '#374151', fontWeight: s.done ? 700 : 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {s.done && <span style={{ fontSize: '8px' }}>✓</span>}{s.name}
                        </span>
                        <span style={{ fontSize: '8px', color: '#9CA3AF' }}>{s.pct}%</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: '#E5E7EB', borderRadius: '2px' }}>
                        <div style={{ width: `${s.pct}%`, height: '100%', backgroundColor: s.done ? '#10B981' : '#F59E0B', borderRadius: '2px', transition: 'width 0.3s' }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function PurchasesScreen() {
    const items = [
        { name: 'Cimento CP-II', qty: '40 sacos', status: 'Pago', color: '#DCFCE7', tc: '#166534' },
        { name: 'Tinta Branco Neve', qty: '12L', status: 'Pendente', color: '#FEF3C7', tc: '#92400E' },
        { name: 'Porcelanato Bege', qty: '48 m²', status: 'Entregue', color: '#DBEAFE', tc: '#1E40AF' },
        { name: 'Fiação 10mm', qty: '100m', status: 'Pedido', color: '#F3E8FF', tc: '#6B21A8' },
    ];
    return (
        <div style={{ padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#0D3259' }}>Compras</span>
                <span style={{ fontSize: '9px', backgroundColor: '#F59E0B', color: '#0D3259', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>+ Novo</span>
            </div>
            {items.map((item) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '8px 10px' }}>
                    <div>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: '#374151' }}>{item.name}</div>
                        <div style={{ fontSize: '8px', color: '#9CA3AF' }}>{item.qty}</div>
                    </div>
                    <span style={{ backgroundColor: item.color, color: item.tc, fontSize: '8px', fontWeight: 700, padding: '2px 6px', borderRadius: '6px' }}>{item.status}</span>
                </div>
            ))}
        </div>
    );
}

const SCREEN_COMPONENTS = [DashboardScreen, ModulesScreen, ScheduleScreen, PurchasesScreen];

export default function VideoMockup() {
    const [current, setCurrent] = useState(0);
    const [animating, setAnimating] = useState(false);
    const [direction, setDirection] = useState<'left' | 'right'>('left');

    useEffect(() => {
        const interval = setInterval(() => {
            setDirection('left');
            setAnimating(true);
            setTimeout(() => {
                setCurrent((prev) => (prev + 1) % APP_SCREENS.length);
                setAnimating(false);
            }, 350);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const CurrentScreen = SCREEN_COMPONENTS[current];

    return (
        <div style={{ width: '280px', flexShrink: 0, position: 'relative' }}>
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
                }}
            >
                {/* Notch */}
                <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '28px', backgroundColor: '#F3F4F6', borderRadius: '20px', zIndex: 10 }} />

                {/* Screen area */}
                <div style={{ position: 'absolute', inset: '6px', borderRadius: '38px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                    {/* Status bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '36px', background: '#0D3259', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                        <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600 }}>9:41</span>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                            <svg width="14" height="10" viewBox="0 0 14 10" fill="white" opacity={0.9}>
                                <rect x="0" y="4" width="3" height="6" rx="0.5" /><rect x="4" y="2" width="3" height="8" rx="0.5" /><rect x="8" y="0" width="3" height="10" rx="0.5" />
                            </svg>
                            <svg width="16" height="10" viewBox="0 0 16 10" fill="white" opacity={0.9}>
                                <rect x="1" y="2" width="12" height="7" rx="1" stroke="white" strokeWidth="1" fill="none" />
                                <rect x="13" y="4" width="2" height="3" rx="0.5" fill="white" />
                                <rect x="2" y="3" width="8" height="5" rx="0.5" fill="white" />
                            </svg>
                        </div>
                    </div>

                    {/* App header */}
                    <div style={{ position: 'absolute', top: '36px', left: 0, right: 0, height: '44px', background: '#0D3259', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', zIndex: 4 }}>
                        <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: 700 }}>{APP_SCREENS[current].label}</span>
                        <img src="/logo-obraboa-white.svg" alt="ObraBoa" style={{ height: '16px', opacity: 0.8 }} />
                    </div>

                    {/* Screen content with slide animation */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '80px',
                            left: 0,
                            right: 0,
                            bottom: '52px',
                            overflow: 'hidden',
                        }}
                    >
                        <div
                            style={{
                                height: '100%',
                                transition: 'opacity 0.35s ease, transform 0.35s ease',
                                opacity: animating ? 0 : 1,
                                transform: animating
                                    ? `translateX(${direction === 'left' ? '-20px' : '20px'})`
                                    : 'translateX(0)',
                            }}
                        >
                            <CurrentScreen />
                        </div>
                    </div>

                    {/* Bottom nav */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '52px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-around', borderTop: '1px solid #E5E7EB', zIndex: 5 }}>
                        {[
                            { icon: '🏠', label: 'Início', active: current === 0 },
                            { icon: '📅', label: 'Agenda', active: current === 2 },
                            { icon: '🛒', label: 'Compras', active: current === 3 },
                            { icon: '📁', label: 'Docs', active: false },
                        ].map((item) => (
                            <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                                <span style={{ fontSize: '7px', color: item.active ? '#F59E0B' : '#9CA3AF', fontWeight: item.active ? 700 : 400 }}>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Slide dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '20px' }}>
                {APP_SCREENS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        style={{ width: i === current ? '20px' : '6px', height: '6px', borderRadius: '3px', backgroundColor: i === current ? '#F59E0B' : '#D1D5DB', border: 'none', cursor: 'pointer', transition: 'all 0.3s ease', padding: 0 }}
                    />
                ))}
            </div>
        </div>
    );
}
