import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Share2, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RdoDetail } from '@/hooks/useRdos';

interface RdoExportMenuProps {
  rdo: RdoDetail;
}

export default function RdoExportMenu({ rdo }: RdoExportMenuProps) {
  const { t } = useTranslation();

  const summary = buildSummary(rdo);

  const handlePrint = () => window.print();

  const handleShare = async (method: 'whatsapp' | 'telegram' | 'email') => {
    const text = summary;

    // Try Web Share API first
    if (navigator.share && method === 'whatsapp') {
      try {
        await navigator.share({ title: `RDO - ${rdo.date}`, text });
        return;
      } catch { /* fallback */ }
    }

    const encoded = encodeURIComponent(text);
    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encoded}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(' ')}&text=${encoded}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent(`RDO - ${format(parseISO(rdo.date), 'dd/MM/yyyy')}`)}&body=${encoded}`, '_blank');
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 size={14} className="mr-1" /> {t('rdo.export')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePrint}>
          <FileDown size={14} className="mr-2" /> {t('rdo.export')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('whatsapp')}>
          {t('rdo.shareWhatsapp')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('telegram')}>
          {t('rdo.shareTelegram')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare('email')}>
          {t('rdo.shareEmail')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function buildSummary(rdo: RdoDetail): string {
  const date = format(parseISO(rdo.date), 'dd/MM/yyyy');
  const lines = [`📋 RDO - ${date}\n`];
  if (rdo.activities) lines.push(`📝 Atividades:\n${rdo.activities}\n`);
  if (rdo.team_members.length > 0) {
    lines.push(`👥 Equipe:`);
    rdo.team_members.forEach((m) => lines.push(`  • ${m.name} (${m.role || '-'}) - ${m.hours_worked}h`));
    const totalHours = rdo.team_members.reduce((s, m) => s + Number(m.hours_worked), 0);
    lines.push(`  Total: ${totalHours}h\n`);
  }
  if (rdo.photos.length > 0) lines.push(`📷 ${rdo.photos.length} foto(s)\n`);
  if (rdo.observations) lines.push(`📌 Observações:\n${rdo.observations}`);
  return lines.join('\n');
}
