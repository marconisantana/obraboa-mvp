import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FileText size={48} className="mb-3 text-muted-foreground/50" />
      <h1 className="text-xl font-bold">{t('documents.title')}</h1>
      <p className="text-muted-foreground">{t('documents.comingSoon')}</p>
    </div>
  );
}
