import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Info, FileText, Shield } from 'lucide-react';

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <p className="font-medium flex items-center gap-2">
          <Info size={18} className="text-primary" />
          {t('profile.aboutApp')}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>{t('profile.version')}</span>
            <span>1.0.0</span>
          </div>
          <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <FileText size={14} /> {t('profile.termsOfUse')}
          </a>
          <a href="#" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Shield size={14} /> {t('profile.privacyPolicy')}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
