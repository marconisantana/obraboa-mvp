import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { RdoDetail } from '@/hooks/useRdos';

interface RdoPrintViewProps {
  rdo: RdoDetail;
}

export default function RdoPrintView({ rdo }: RdoPrintViewProps) {
  const dateFormatted = format(parseISO(rdo.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="hidden print:block print:p-8">
      <style>{`
        @media print {
          body > *:not(.print-content-wrapper) { display: none !important; }
          .print-content-wrapper { display: block !important; }
        }
      `}</style>

      <div className="print-content-wrapper">
        <h1 className="text-2xl font-bold mb-1">Relatório Diário de Obra</h1>
        <p className="text-lg mb-6 capitalize">{dateFormatted}</p>

        {rdo.activities && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">Atividades Realizadas</h2>
            <p className="whitespace-pre-wrap">{rdo.activities}</p>
          </div>
        )}

        {rdo.team_members.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">Equipe Presente</h2>
            <table className="w-full border-collapse border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Nome</th>
                  <th className="border p-2 text-left">Função</th>
                  <th className="border p-2 text-right">Horas</th>
                </tr>
              </thead>
              <tbody>
                {rdo.team_members.map((m) => (
                  <tr key={m.id}>
                    <td className="border p-2">{m.name}</td>
                    <td className="border p-2">{m.role}</td>
                    <td className="border p-2 text-right">{m.hours_worked}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {rdo.photos.length > 0 && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">Fotos</h2>
            <div className="grid grid-cols-2 gap-4">
              {rdo.photos.map((photo) => (
                <div key={photo.id}>
                  <img src={photo.url} alt={photo.caption || ''} className="w-full h-48 object-cover" />
                  {photo.caption && <p className="text-xs mt-1">{photo.caption}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {rdo.observations && (
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">Observações</h2>
            <p className="whitespace-pre-wrap">{rdo.observations}</p>
          </div>
        )}
      </div>
    </div>
  );
}
