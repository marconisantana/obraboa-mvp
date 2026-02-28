import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAppStore } from '@/stores/useAppStore';

interface ProjectRoleResult {
  role: string | null;
  canEdit: boolean;
  isOwner: boolean;
  isLoading: boolean;
}

export function useProjectRole(): ProjectRoleResult {
  const { user } = useAuth();
  const activeProject = useAppStore((s) => s.activeProject);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || !activeProject?.id) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    supabase
      .rpc('get_project_role', {
        _project_id: activeProject.id,
        _user_id: user.id,
      })
      .then(({ data, error }) => {
        if (error) {
          setRole(null);
        } else {
          setRole(data);
        }
        setIsLoading(false);
      });
  }, [user?.id, activeProject?.id]);

  return {
    role,
    canEdit: role === 'owner' || role === 'professional',
    isOwner: role === 'owner',
    isLoading,
  };
}
