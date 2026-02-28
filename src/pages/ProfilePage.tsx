import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Briefcase } from 'lucide-react';

export default function ProfilePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const profile = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('user_id', authUser!.id);
    setSaving(false);
    if (error) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    } else {
      setUser({ ...profile, full_name: fullName });
      setEditing(false);
      toast({ title: t('common.success') });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              {profile?.account_type === 'professional' ? <Briefcase size={28} /> : <User size={28} />}
            </div>
            <div>
              <CardTitle>{profile?.full_name || '—'}</CardTitle>
              <p className="text-sm text-muted-foreground">{authUser?.email}</p>
              <span className="mt-1 inline-block rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
                {t(`auth.${profile?.account_type || 'personal'}`)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t('auth.fullName')}</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={saving}>
                  {saving ? t('common.loading') : t('profile.save')}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => { setFullName(profile?.full_name || ''); setEditing(true); }}>
              {t('profile.editProfile')}
            </Button>
          )}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full text-destructive hover:bg-destructive/10 lg:hidden"
        onClick={() => supabase.auth.signOut()}
      >
        <LogOut size={18} /> {t('auth.logout')}
      </Button>
    </div>
  );
}
