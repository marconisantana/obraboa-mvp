import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const { session, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!session) {
      // Save token and redirect to signup
      if (token) localStorage.setItem('pending_invite_token', token);
      navigate('/signup?invite=true', { replace: true });
      return;
    }

    // User is logged in, accept the invite
    if (!token) {
      setStatus('error');
      setErrorMsg(t('members.inviteNotFound'));
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('accept-invite', {
          body: { token },
        });

        if (error) {
          setStatus('error');
          setErrorMsg(t('members.inviteExpired'));
          return;
        }

        if (data?.error) {
          setStatus('error');
          const msgs: Record<string, string> = {
            invite_not_found: t('members.inviteNotFound'),
            invite_already_used: t('members.inviteExpired'),
            invite_expired: t('members.inviteExpired'),
          };
          setErrorMsg(msgs[data.error] || t('common.error'));
          return;
        }

        setStatus('success');
        setTimeout(() => {
          navigate(`/projects/${data.project_id}`, { replace: true });
        }, 1500);
      } catch {
        setStatus('error');
        setErrorMsg(t('common.error'));
      }
    })();
  }, [session, authLoading, token, navigate, t]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        {status === 'loading' && (
          <>
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">{t('members.acceptingInvite')}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-green-500" />
            <p className="font-medium">{t('members.inviteAccepted')}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
            <p className="text-destructive">{errorMsg}</p>
          </>
        )}
      </div>
    </div>
  );
}
