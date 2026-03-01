import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/stores/useAppStore';
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
      <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Crown size={20} style={{ color: '#F59E0B' }} />
            <div>
              <p className="text-sm font-medium" style={{ color: '#374151' }}>{t('profile.myPlan')}</p>
              <Badge className={planColors[plan]}>{t(`profile.plan${capitalize(plan)}`)}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            {t('profile.viewPlans')}
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg p-0">
          {/* Hero com imagem */}
          <div className="relative overflow-hidden" style={{ height: '200px' }}>
            <img
              src="/images/campanha/reforma_05_quarto_crianca.jpeg"
              alt="Planos ObraBoa"
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center 30%' }}
            />
            {/* Gradiente para branco */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(transparent 40%, #ffffff 100%)' }}
            />
            {/* Títulos sobre a imagem */}
            <div className="absolute bottom-4 left-5">
              <p className="font-bold" style={{ fontSize: '22px', color: '#0D3259' }}>
                Escolha seu plano
              </p>
              <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
                Desbloqueie tudo que sua obra precisa
              </p>
            </div>
          </div>

          <div className="space-y-3 p-5">
            {plans.map((p) => {
              const isCurrent = plan === p.key;
              const isPopular = p.key === 'flipper';
              return (
                <div
                  key={p.key}
                  className="relative rounded-2xl overflow-hidden"
                  style={{
                    border: isCurrent ? '2px solid #F59E0B' : '1px solid #E5E7EB',
                    backgroundColor: '#fff',
                    padding: '16px',
                  }}
                >
                  {/* Badge Mais popular */}
                  {isPopular && (
                    <span
                      className="absolute top-0 right-0 text-xs font-bold px-3 py-1"
                      style={{ backgroundColor: '#F59E0B', color: '#0D3259', borderRadius: '0 16px 0 12px' }}
                    >
                      Mais popular
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base" style={{ color: '#0D3259' }}>
                      {t(`profile.plan${capitalize(p.key)}`)}
                    </span>
                    <div className="flex items-center gap-2">
                      {isCurrent && (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">Atual</Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-xs mb-3" style={{ color: '#6B7280' }}>
                    {t(`profile.plan${capitalize(p.key)}Desc`)}
                  </p>

                  <ul className="space-y-1.5 text-sm">
                    <FeatureItem label={t('profile.projectLimit', { count: p.projects })} />
                    <FeatureItem label={t('profile.memberLimit', { count: p.members })} />
                    {p.pdf && <FeatureItem label={t('profile.pdfExport')} />}
                    {p.financial && <FeatureItem label={t('profile.financialModule')} />}
                    {p.allModules && <FeatureItem label={t('profile.allModules')} />}
                  </ul>
                </div>
              );
            })}
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
