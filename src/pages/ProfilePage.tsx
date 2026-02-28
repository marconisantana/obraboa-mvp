import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Briefcase, User, Pencil } from 'lucide-react';
import AvatarUpload from '@/components/profile/AvatarUpload';
import PlanCard from '@/components/profile/PlanCard';
import ProjectListSection from '@/components/profile/ProjectListSection';
import AboutSection from '@/components/profile/AboutSection';

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
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

      {/* Header: Avatar + Identity */}
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-6">
          <AvatarUpload />
          <div className="text-center">
            <p className="text-lg font-semibold">{profile?.full_name || '—'}</p>
            <p className="text-sm text-muted-foreground">{authUser?.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent">
              {profile?.account_type === 'professional' ? <Briefcase size={12} /> : <User size={12} />}
              {t(`auth.${profile?.account_type || 'personal'}`)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Edit Name */}
      <Card>
        <CardContent className="p-4">
          {editing ? (
            <div className="space-y-3">
              <Label>{t('auth.fullName')}</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={saving}>
                  {saving ? t('common.loading') : t('profile.save')}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
              </div>
            </div>
          ) : (
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { setFullName(profile?.full_name || ''); setEditing(true); }}>
              <Pencil size={16} /> {t('profile.editProfile')}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <ProjectListSection />

      {/* Plan */}
      <PlanCard />

      {/* About */}
      <AboutSection />

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full text-destructive hover:bg-destructive/10"
        onClick={() => supabase.auth.signOut()}
      >
        <LogOut size={18} /> {t('profile.logout')}
      </Button>
    </div>
  );
}
