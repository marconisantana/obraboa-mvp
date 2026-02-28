import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, Check } from 'lucide-react';

const plans = [
  { key: 'free', projects: 1, members: 1, pdf: false, financial: false, allModules: false },
  { key: 'basic', projects: 3, members: 3, pdf: true, financial: false, allModules: false },
  { key: 'flipper', projects: 3, members: 5, pdf: true, financial: true, allModules: false },
  { key: 'pro', projects: 10, members: 10, pdf: true, financial: true, allModules: true },
] as const;

const planColors: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  basic: 'bg-blue-100 text-blue-700',
  flipper: 'bg-accent/15 text-accent',
  pro: 'bg-primary/15 text-primary',
};

export default function PlanCard() {
  const { t } = useTranslation();
  const plan = useAppStore((s) => s.plan);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Crown size={20} className="text-accent" />
            <div>
              <p className="text-sm font-medium">{t('profile.myPlan')}</p>
              <Badge className={planColors[plan]}>{t(`profile.plan${capitalize(plan)}`)}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            {t('profile.viewPlans')}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('profile.upgradePlans')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {plans.map((p) => (
              <Card key={p.key} className={plan === p.key ? 'ring-2 ring-accent' : ''}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{t(`profile.plan${capitalize(p.key)}`)}</span>
                    {plan === p.key && (
                      <Badge variant="secondary" className="text-xs">{t('profile.currentPlan')}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t(`profile.plan${capitalize(p.key)}Desc`)}
                  </p>
                  <ul className="space-y-1 text-sm">
                    <FeatureItem label={t('profile.projectLimit', { count: p.projects })} />
                    <FeatureItem label={t('profile.memberLimit', { count: p.members })} />
                    {p.pdf && <FeatureItem label={t('profile.pdfExport')} />}
                    {p.financial && <FeatureItem label={t('profile.financialModule')} />}
                    {p.allModules && <FeatureItem label={t('profile.allModules')} />}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FeatureItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2">
      <Check size={14} className="text-accent shrink-0" />
      <span>{label}</span>
    </li>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
