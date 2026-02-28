import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/useAppStore';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Loader2 } from 'lucide-react';

export default function AvatarUpload() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const profile = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawFile = e.target.files?.[0];
    if (!rawFile || !authUser || !profile) return;

    setUploading(true);
    const { compressImage } = await import('@/lib/compressImage');
    const file = await compressImage(rawFile);
    const path = `${authUser.id}/avatar.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      toast({ title: t('common.error'), description: uploadError.message, variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url })
      .eq('user_id', authUser.id);

    if (updateError) {
      toast({ title: t('common.error'), description: updateError.message, variant: 'destructive' });
    } else {
      setUser({ ...profile, avatar_url });
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar className="h-20 w-20 text-xl">
          {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={profile.full_name} />}
          <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs text-muted-foreground"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <Camera size={14} />
        {uploading ? t('profile.uploadingAvatar') : t('profile.changeAvatar')}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
