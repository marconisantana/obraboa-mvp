import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/stores/useAppStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { UserPlus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import InviteMemberDialog from './InviteMemberDialog';
import { usePlanGate } from '@/hooks/usePlanGate';

interface MemberInfo {
  id: string;
  role: string;
  profile_id: string;
  full_name: string;
  avatar_url: string | null;
  initials: string;
}

const roleBadge: Record<string, string> = {
  owner: 'bg-blue-100 text-blue-700',
  professional: 'bg-green-100 text-green-700',
  client: 'bg-orange-100 text-orange-700',
  viewer: 'bg-muted text-muted-foreground',
};

export default function MembersSection({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const currentUser = useAppStore((s) => s.user);
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const { checkAndGate, GateDrawer } = usePlanGate();

  const fetchMembers = async () => {
    const { data } = await supabase
      .from('project_members')
      .select('id, role, profile_id')
      .eq('project_id', projectId);

    if (!data || data.length === 0) { setMembers([]); return; }

    const profileIds = data.map((m) => m.profile_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', profileIds);

    const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

    const mapped = data.map((m) => {
      const prof = profileMap[m.profile_id] || { full_name: '', avatar_url: null };
      const initials = prof.full_name
        .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
      return { id: m.id, role: m.role, profile_id: m.profile_id, full_name: prof.full_name, avatar_url: prof.avatar_url, initials };
    });

    setMembers(mapped);
    const me = mapped.find((m) => m.profile_id === currentUser?.id);
    setCurrentUserRole(me?.role ?? null);
  };

  useEffect(() => { fetchMembers(); }, [projectId, currentUser?.id]);

  const isOwner = currentUserRole === 'owner';

  const handleRemove = async (memberId: string) => {
    const { error } = await supabase.from('project_members').delete().eq('id', memberId);
    if (error) { toast({ title: t('common.error'), variant: 'destructive' }); return; }
    fetchMembers();
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    const { error } = await supabase.from('project_members').update({ role: newRole }).eq('id', memberId);
    if (error) { toast({ title: t('common.error'), variant: 'destructive' }); return; }
    fetchMembers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted-foreground">{t('projectView.members')}</p>
        {(isOwner || currentUserRole === 'professional') && (
          <Button variant="outline" size="sm" onClick={() => {
            if (checkAndGate('member', { memberCount: members.length })) {
              setInviteOpen(true);
            }
          }}>
            <UserPlus size={14} className="mr-1" />
            {t('projectView.invite')}
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-lg border p-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={m.avatar_url ?? undefined} alt={m.full_name} />
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {m.initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.full_name}</p>
              {isOwner && m.role !== 'owner' ? (
                <Select value={m.role} onValueChange={(v) => handleRoleChange(m.id, v)}>
                  <SelectTrigger className="h-6 text-xs w-auto border-0 p-0 shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">{t('members.professional')}</SelectItem>
                    <SelectItem value="client">{t('members.client')}</SelectItem>
                    <SelectItem value="viewer">{t('members.viewer')}</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary" className={`text-[10px] ${roleBadge[m.role] || ''}`}>
                  {t(`members.${m.role}`)}
                </Badge>
              )}
            </div>

            {isOwner && m.role !== 'owner' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                    <Trash2 size={14} />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('members.removeMember')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('members.removeConfirm')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRemove(m.id)}>
                      {t('common.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        ))}
      </div>

      <InviteMemberDialog projectId={projectId} open={inviteOpen} onOpenChange={setInviteOpen} />
      {GateDrawer}
    </div>
  );
}
