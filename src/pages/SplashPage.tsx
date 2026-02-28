import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const ONBOARDING_KEY = 'obraboa_onboarding_done';

export default function SplashPage() {
  const navigate = useNavigate();
  const { session, isLoading } = useAuth();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        if (session) {
          navigate('/', { replace: true });
        } else if (localStorage.getItem(ONBOARDING_KEY)) {
          navigate('/login', { replace: true });
        } else {
          navigate('/onboarding', { replace: true });
        }
      }, 400);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isLoading, session, navigate]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center"
          style={{ backgroundColor: '#1B3A5C' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.img
            src="/logo-obraboa-white.svg"
            alt="ObraBoa"
            className="w-60"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
