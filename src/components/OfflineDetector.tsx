import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

export default function OfflineDetector() {
  const { t } = useTranslation();
  const { toast, dismiss } = useToast();
  const toastIdRef = useRef<string | undefined>();

  useEffect(() => {
    const handleOffline = () => {
      const { id } = toast({
        title: t('offline.title'),
        description: t('offline.description'),
        variant: 'destructive',
        duration: Infinity,
      });
      toastIdRef.current = id;
    };

    const handleOnline = () => {
      if (toastIdRef.current) {
        dismiss(toastIdRef.current);
        toastIdRef.current = undefined;
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    // Check initial state
    if (!navigator.onLine) handleOffline();

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [toast, dismiss, t]);

  return null;
}
