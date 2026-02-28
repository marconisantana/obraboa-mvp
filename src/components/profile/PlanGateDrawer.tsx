import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore, PLAN_LIMITS } from '@/stores/useAppStore';
import type { GateFeature } from '@/hooks/usePlanGate';

interface PlanGateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewPlans: () => void;
  feature?: GateFeature | null;
}

export default function PlanGateDrawer({ open, onOpenChange, onViewPlans, feature }: PlanGateDrawerProps) {
  const { t } = useTranslation();
  const plan = useAppStore((s) => s.plan);
  const limits = PLAN_LIMITS[plan];

  const getTitle = () => {
    switch (feature) {
      case 'project': return t('planGate.projectTitle');
      case 'member': return t('planGate.memberTitle');
      case 'pdf_export': return t('planGate.pdfTitle');
      case 'financial_module': return t('planGate.financialTitle');
      default: return t('planGate.title');
    }
  };

  const getDescription = () => {
    switch (feature) {
      case 'project': return t('planGate.projectDesc', { count: limits.projects });
      case 'member': return t('planGate.memberDesc', { count: limits.members });
      case 'pdf_export': return t('planGate.pdfDesc');
      case 'financial_module': return t('planGate.financialDesc');
      default: return t('planGate.description');
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-2">
            <Crown size={32} className="text-accent" />
          </div>
          <DrawerTitle>{getTitle()}</DrawerTitle>
          <Badge variant="secondary" className="mx-auto mt-2">
            {t('planGate.currentPlan', { plan: t(`profile.plan${plan.charAt(0).toUpperCase() + plan.slice(1)}`) })}
          </Badge>
          <p className="text-sm text-muted-foreground mt-2">{getDescription()}</p>
        </DrawerHeader>
        <DrawerFooter>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={onViewPlans}>
            {t('planGate.upgrade')}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
