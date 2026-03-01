import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, FileText, ClipboardCheck, ChevronLeft } from 'lucide-react';

const ONBOARDING_KEY = 'obraboa_onboarding_done';

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

/* overlays diferentes por step para legibilidade otimizada */
const IMG_OVERLAYS = [
  'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.30) 40%, rgba(13,50,89,0.92) 70%, rgba(13,50,89,1) 100%)',
  'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.30) 40%, rgba(13,50,89,0.92) 70%, rgba(13,50,89,1) 100%)',
  'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.20) 35%, rgba(13,50,89,0.85) 65%, rgba(13,50,89,1) 100%)',
];

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStartX = useRef(0);

  const finish = (path: string) => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    navigate(path, { replace: true });
  };

  const next = () => { if (step < 2) { setDirection(1); setStep(step + 1); } };
  const prev = () => { if (step > 0) { setDirection(-1); setStep(step - 1); } };

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) next(); else prev();
  };

  const images = [
    '/images/campanha/reforma_08_hero.jpeg',
    '/images/campanha/reforma_02_obra.jpeg',
    '/images/campanha/reforma_01_planejamento.jpeg',
  ];
  const imgPositions = ['center center', 'center 30%', 'center 20%'];

  const features = [
    { icon: CalendarDays, title: t('onboarding.step2Feature1'), desc: t('onboarding.step2Feature1Desc') },
    { icon: FileText, title: t('onboarding.step2Feature2'), desc: t('onboarding.step2Feature2Desc') },
    { icon: ClipboardCheck, title: t('onboarding.step2Feature3'), desc: t('onboarding.step2Feature3Desc') },
  ];

  const stepContents = [
    /* ─ Step 1: hero emocional ─ */
    <div key="step1" className="flex flex-col gap-4">
      <h1 className="font-bold text-white leading-tight" style={{ fontSize: '30px' }}>
        Sua obra,{'\n'}organizada.
      </h1>
      <p className="text-base" style={{ color: 'rgba(255,255,255,0.80)', lineHeight: 1.5 }}>
        Do planejamento à entrega das chaves, tudo em um só lugar.
      </p>
    </div>,

    /* ─ Step 2: features ─ */
    <div key="step2" className="flex flex-col gap-4 w-full max-w-xs">
      <h2 className="font-bold text-white" style={{ fontSize: '28px' }}>
        {t('onboarding.step2Title')}
      </h2>
      {features.map((f, i) => (
        <div
          key={i}
          className="flex items-center gap-4 p-4"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.20)',
            borderRadius: '16px',
            padding: '16px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.20)' }}>
            <f.icon className="w-5 h-5" style={{ color: '#F59E0B' }} />
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-sm">{f.title}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{f.desc}</p>
          </div>
        </div>
      ))}
    </div>,

    /* ─ Step 3: CTA ─ */
    <div key="step3" className="flex flex-col gap-4 w-full max-w-xs">
      <h2 className="font-bold text-white" style={{ fontSize: '28px' }}>
        {t('onboarding.step3Title')}
      </h2>
      <p className="text-base" style={{ color: 'rgba(255,255,255,0.80)', lineHeight: 1.5 }}>
        {t('onboarding.step3Subtitle')}
      </p>
      <button
        onClick={() => finish('/signup')}
        className="w-full font-bold text-base"
        style={{
          height: '56px',
          borderRadius: '28px',
          backgroundColor: '#F59E0B',
          color: '#0D3259',
          marginTop: '8px',
        }}
      >
        {t('onboarding.createAccount')}
      </button>
      <button
        onClick={() => finish('/login')}
        className="text-base underline"
        style={{ color: 'rgba(255,255,255,1)', marginTop: '16px' }}
      >
        {t('onboarding.alreadyHaveAccount')}
      </button>
    </div>,
  ];

  return (
    <div
      className="fixed inset-0 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Imagem de fundo fixa (não some no teclado mobile) ── */}
      <div className="absolute inset-0">
        <img
          src={images[step]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: imgPositions[step] }}
        />
        <div className="absolute inset-0" style={{ background: IMG_OVERLAYS[step] }} />
      </div>

      {/* ── Top bar: back + skip ── */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <button
          className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${step === 0 ? 'invisible' : ''}`}
          style={{ color: 'rgba(255,255,255,0.7)' }}
          onClick={prev}
          aria-label="Voltar"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          className="text-sm px-3 py-1 font-medium"
          style={{ color: 'rgba(255,255,255,0.6)' }}
          onClick={() => finish('/login')}
        >
          {t('onboarding.skip')}
        </button>
      </div>

      {/* ── Logo no step 1 — canto superior esquerdo ── */}
      {step === 0 && (
        <img
          src="/icon-obraboa-navy.svg"
          alt="ObraBoa"
          className="absolute z-20"
          style={{ top: '56px', left: '24px', width: '120px', filter: 'brightness(0) invert(1)' }}
        />
      )}

      {/* ── Espaçador ── */}
      <div className="flex-1" />

      {/* ── Conteúdo na metade inferior ── */}
      <div className="relative z-10 px-6 pb-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {stepContents[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Botão próximo (steps 0 e 1) ── */}
      <div className="relative z-10 flex flex-col items-center gap-5 pb-12 px-6">
        {step < 2 && (
          <button
            onClick={next}
            className="w-full max-w-xs font-bold text-base"
            style={{
              height: '56px',
              borderRadius: '28px',
              backgroundColor: '#F59E0B',
              color: '#0D3259',
            }}
          >
            {t('onboarding.next')}
          </button>
        )}

        {/* Dots de progresso */}
        <div className="flex gap-2 items-center">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === step ? '8px' : '4px',
                height: i === step ? '8px' : '4px',
                backgroundColor: i === step ? '#F59E0B' : 'rgba(255,255,255,0.30)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
