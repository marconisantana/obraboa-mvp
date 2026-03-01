import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore, type Project } from '@/stores/useAppStore';
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
  const setProjects = useAppStore((s) => s.setProjects);
  const setActiveProject = useAppStore((s) => s.setActiveProject);

  /**
   * Carrega projetos na store global assim que a sessão é confirmada.
   * Fix do bug: Dashboard estava vazio na primeira visita porque os projetos
   * só eram buscados quando ProjectsPage montava. Agora a carga é global.
   */
  const loadProjects = useCallback(async (userId: string | null) => {
    if (!userId) {
      setProjects([]);
      setActiveProject(null);
      return;
    }
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProjects(data as Project[]);
  }, [setProjects, setActiveProject]);

  const fetchProfile = useCallback((userId: string) => {
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
  }, [setUser]);

  const acceptPendingInvite = useCallback(async () => {
    const pendingToken = localStorage.getItem('pending_invite_token');
    if (!pendingToken) return;
    try {
      await supabase.functions.invoke('accept-invite', { body: { token: pendingToken } });
    } catch { /* ignore */ }
    localStorage.removeItem('pending_invite_token');
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        acceptPendingInvite();
        // Garante que projetos caem na store logo após qualquer mudança de sessão
        loadProjects(session.user.id);
      } else {
        setUser(null);
        loadProjects(null);
      }
      setIsLoading(false);
    });

    // Restore existing session (primeira visita / F5)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
        loadProjects(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [setUser, fetchProfile, loadProjects, acceptPendingInvite]);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
