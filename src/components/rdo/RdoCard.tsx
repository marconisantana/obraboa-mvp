import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Users } from 'lucide-react';
import type { Rdo } from '@/hooks/useRdos';

interface RdoCardProps {
  rdo: Rdo;
  onClick: () => void;
}

export default function RdoCard({ rdo, onClick }: RdoCardProps) {
  const { t } = useTranslation();
  const dateFormatted = format(parseISO(rdo.date), "dd 'de' MMMM, yyyy", { locale: ptBR });

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]" onClick={onClick}>
      <CardContent className="p-4 flex gap-3">
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {rdo.first_photo_url ? (
            <img src={rdo.first_photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <Camera size={24} className="text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm font-semibold capitalize">{dateFormatted}</p>
          {rdo.activities && (
            <p className="text-xs text-muted-foreground line-clamp-2">{rdo.activities}</p>
          )}
          <div className="flex items-center gap-3">
            {(rdo.photo_count ?? 0) > 0 && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Camera size={12} /> {rdo.photo_count}
              </Badge>
            )}
            {(rdo.member_count ?? 0) > 0 && (
              <Badge variant="secondary" className="text-xs gap-1">
                <Users size={12} /> {rdo.member_count}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
