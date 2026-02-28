import type { Reference } from '@/hooks/useReferences';
import { getCategoryColor, getCategoryLabel } from './CategoryFilter';
import { useTranslation } from 'react-i18next';

interface Props {
  reference: Reference;
  onClick: () => void;
}

export default function ReferenceCard({ reference, onClick }: Props) {
  const { t } = useTranslation();

  return (
    <button
      onClick={onClick}
      className="break-inside-avoid mb-3 w-full overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-transform hover:shadow-md active:scale-[0.98]"
    >
      <img
        src={reference.image_url}
        alt={reference.observation || ''}
        className="w-full object-cover"
        loading="lazy"
      />
      <div className="p-2.5 space-y-1.5">
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${getCategoryColor(reference.category)}`}>
          {getCategoryLabel(reference.category, t)}
        </span>
        {reference.observation && (
          <p className="text-xs text-muted-foreground line-clamp-2">{reference.observation}</p>
        )}
      </div>
    </button>
  );
}
