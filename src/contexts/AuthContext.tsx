import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/useAppStore';
import type { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, user: null, isLoading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setUser = useAppStore((s) => s.setUser);

  useEffect(() => {
    const fetchProfile = (userId: string) => {
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
        .then(({ data }) => {
          if (data) {
            setUser({
              id: data.id,
              full_name: data.full_name,
              avatar_url: data.avatar_url,
              account_type: data.account_type as 'personal' | 'professional',
              created_at: data.created_at,
              updated_at: data.updated_at,
            });
          }
        });
    };

    const acceptPendingInvite = async () => {
      const pendingToken = localStorage.getItem('pending_invite_token');
      if (!pendingToken) return;
      try {
        await supabase.functions.invoke('accept-invite', {
          body: { token: pendingToken },
        });
      } catch { /* ignore */ }
      localStorage.removeItem('pending_invite_token');
    };

    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        acceptPendingInvite();
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Then restore session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
