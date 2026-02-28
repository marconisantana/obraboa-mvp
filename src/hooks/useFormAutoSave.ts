import { useEffect, useRef, useState, useCallback } from 'react';

interface UseFormAutoSaveReturn<T> {
  hasDraft: boolean;
  restoreDraft: () => T | null;
  clearDraft: () => void;
}

export function useFormAutoSave<T>(key: string, data: T, enabled = true): UseFormAutoSaveReturn<T> {
  const storageKey = `form_draft_${key}`;
  const [hasDraft, setHasDraft] = useState(() => {
    try {
      return !!localStorage.getItem(storageKey);
    } catch {
      return false;
    }
  });
  const dataRef = useRef(data);
  dataRef.current = data;

  // Auto-save every 30s
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(dataRef.current));
        setHasDraft(true);
      } catch {
        // ignore storage errors
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [storageKey, enabled]);

  const restoreDraft = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [storageKey]);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { hasDraft, restoreDraft, clearDraft };
}
