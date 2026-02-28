import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { HardHat, CalendarDays, FileText, ClipboardCheck, ArrowRight } from 'lucide-react';

const ONBOARDING_KEY = 'obraboa_onboarding_done';

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -300 : 300, opacity: 0 }),
};

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const finish = (path: string) => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    navigate(path, { replace: true });
  };

  const next = () => {
    if (step < 2) {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const features = [
    { icon: CalendarDays, title: t('onboarding.step2Feature1'), desc: t('onboarding.step2Feature1Desc') },
    { icon: FileText, title: t('onboarding.step2Feature2'), desc: t('onboarding.step2Feature2Desc') },
    { icon: ClipboardCheck, title: t('onboarding.step2Feature3'), desc: t('onboarding.step2Feature3Desc') },
  ];

  const steps = [
    // Step 1
    <div key="step1" className="flex flex-col items-center text-center gap-6 px-6">
      <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center">
        <HardHat className="w-12 h-12 text-accent" />
      </div>
      <h1 className="text-3xl font-bold text-white">{t('onboarding.step1Title')}</h1>
      <p className="text-white/70 text-lg max-w-xs">{t('onboarding.step1Subtitle')}</p>
    </div>,
    // Step 2
    <div key="step2" className="flex flex-col items-center text-center gap-6 px-6">
      <h2 className="text-2xl font-bold text-white">{t('onboarding.step2Title')}</h2>
      <p className="text-white/70 mb-2">{t('onboarding.step2Subtitle')}</p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl bg-white/10 p-4">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0">
              <f.icon className="w-5 h-5 text-accent" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white text-sm">{f.title}</p>
              <p className="text-white/60 text-xs">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>,
    // Step 3
    <div key="step3" className="flex flex-col items-center text-center gap-6 px-6">
      <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
        <ArrowRight className="w-10 h-10 text-accent" />
      </div>
      <h2 className="text-2xl font-bold text-white">{t('onboarding.step3Title')}</h2>
      <p className="text-white/70 max-w-xs">{t('onboarding.step3Subtitle')}</p>
      <Button
        className="w-full max-w-xs bg-accent text-accent-foreground hover:bg-accent/90 text-base h-12"
        onClick={() => finish('/signup')}
      >
        {t('onboarding.createAccount')}
      </Button>
      <button
        className="text-white/60 hover:text-white text-sm underline"
        onClick={() => finish('/login')}
      >
        {t('onboarding.alreadyHaveAccount')}
      </button>
    </div>,
  ];

  return (
    <div className="fixed inset-0 flex flex-col" style={{ backgroundColor: '#1B3A5C' }}>
      {/* Skip button */}
      <div className="flex justify-end p-4">
        <button
          className="text-white/60 hover:text-white text-sm px-3 py-1"
          onClick={() => finish('/login')}
        >
          {t('onboarding.skip')}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full"
          >
            {steps[step]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom: dots + next */}
      <div className="flex flex-col items-center gap-6 pb-10 px-6">
        {step < 2 && (
          <Button
            className="w-full max-w-xs bg-accent text-accent-foreground hover:bg-accent/90 h-12"
            onClick={next}
          >
            {t('onboarding.next')}
          </Button>
        )}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i === step ? '#F59E0B' : 'rgba(255,255,255,0.3)' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
