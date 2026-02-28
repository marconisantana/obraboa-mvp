import { useTranslation } from 'react-i18next';
import { Wrench } from 'lucide-react';

export default function ToolsPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <Wrench size={48} className="mb-4" />
      <h1 className="text-xl font-semibold text-foreground">{t('nav.tools')}</h1>
      <p className="mt-2">{t('common.comingSoon')}</p>
    </div>
  );
}
