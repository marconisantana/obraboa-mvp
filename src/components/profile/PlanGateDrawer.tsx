import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface PlanGateDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewPlans: () => void;
}

export default function PlanGateDrawer({ open, onOpenChange, onViewPlans }: PlanGateDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-2">
            <Crown size={32} className="text-accent" />
          </div>
          <DrawerTitle>{t('planGate.title')}</DrawerTitle>
          <p className="text-sm text-muted-foreground mt-2">{t('planGate.description')}</p>
        </DrawerHeader>
        <DrawerFooter>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={onViewPlans}>
            {t('profile.viewPlans')}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common.cancel')}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
