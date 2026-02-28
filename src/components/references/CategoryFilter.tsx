import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const CATEGORIES = [
  { key: 'all', color: 'bg-muted text-muted-foreground' },
  { key: 'livingRoom', value: 'sala', color: 'bg-blue-100 text-blue-700' },
  { key: 'kitchen', value: 'cozinha', color: 'bg-green-100 text-green-700' },
  { key: 'bathroom', value: 'banheiro', color: 'bg-pink-100 text-pink-700' },
  { key: 'bedroom', value: 'quarto', color: 'bg-purple-100 text-purple-700' },
  { key: 'facade', value: 'fachada', color: 'bg-amber-100 text-amber-700' },
  { key: 'other', value: 'outros', color: 'bg-secondary text-secondary-foreground' },
];

export const CATEGORY_LIST = CATEGORIES;

export function getCategoryColor(category: string) {
  return CATEGORIES.find(c => c.value === category)?.color ?? 'bg-secondary text-secondary-foreground';
}

export function getCategoryLabel(category: string, t: (key: string) => string) {
  const cat = CATEGORIES.find(c => c.value === category);
  return cat ? t(`references.${cat.key}`) : category;
}

interface Props {
  active: string;
  onChange: (cat: string) => void;
}

export default function CategoryFilter({ active, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map(({ key, value, color }) => {
        const isActive = active === (value ?? 'all');
        return (
          <button
            key={key}
            onClick={() => onChange(value ?? 'all')}
            className={cn(
              'shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all border',
              isActive ? `${color} border-transparent ring-2 ring-primary/30` : 'border-border bg-card text-muted-foreground hover:bg-secondary'
            )}
          >
            {t(`references.${key}`)}
          </button>
        );
      })}
    </div>
  );
}
