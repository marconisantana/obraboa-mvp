import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { Copy, MessageCircle, Mail, Link2 } from 'lucide-react';

interface Props {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InviteMemberDialog({ projectId, open, onOpenChange }: Props) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const user = useAppStore((s) => s.user);
  const [role, setRole] = useState('viewer');
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'professional', label: t('members.professional'), desc: t('members.professionalDesc') },
    { value: 'client', label: t('members.client'), desc: t('members.clientDesc') },
    { value: 'viewer', label: t('members.viewer'), desc: t('members.viewerDesc') },
  ];

  const generateLink = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { error } = await supabase.from('project_invites').insert({
        project_id: projectId,
        invited_by: user.id,
        role,
        token,
        expires_at: expiresAt,
      });

      if (error) throw error;

      const url = `${window.location.origin}/invite/${token}`;
      setLink(url);
    } catch {
      toast({ title: t('common.error'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    toast({ title: t('members.linkCopied') });
  };

  const shareWhatsapp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(link)}`, '_blank');
  };

  const shareEmail = () => {
    window.open(`mailto:?body=${encodeURIComponent(link)}`, '_blank');
  };

  const handleClose = (v: boolean) => {
    if (!v) {
      setLink('');
      setRole('viewer');
    }
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('members.inviteTitle')}</DialogTitle>
          <DialogDescription>{t('members.linkExpires')}</DialogDescription>
        </DialogHeader>

        {!link ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('members.selectRole')}</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      <div>
                        <span className="font-medium">{r.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">— {r.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={generateLink} disabled={loading} className="w-full">
              <Link2 size={16} className="mr-2" />
              {t('members.generateLink')}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={link} readOnly className="text-xs" />
              <Button variant="outline" size="icon" onClick={copyLink}>
                <Copy size={16} />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={shareWhatsapp}>
                <MessageCircle size={16} className="mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" className="flex-1" onClick={shareEmail}>
                <Mail size={16} className="mr-2" />
                Email
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
