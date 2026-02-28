import { useState, useCallback, useMemo } from 'react';
import { useAppStore, type FeatureKey } from '@/stores/useAppStore';
import PlanGateDrawer from '@/components/profile/PlanGateDrawer';

export type GateFeature = 'project' | 'member' | 'pdf_export' | 'financial_module';

interface UsePlanGateReturn {
  checkAndGate: (feature: GateFeature, context?: { memberCount?: number }) => boolean;
  closeGate: () => void;
  GateDrawer: JSX.Element;
}

export function usePlanGate(): UsePlanGateReturn {
  const [gateOpen, setGateOpen] = useState(false);
  const [gateFeature, setGateFeature] = useState<GateFeature | null>(null);

  const canCreateProject = useAppStore((s) => s.canCreateProject);
  const canAddMember = useAppStore((s) => s.canAddMember);
  const canAccessFeature = useAppStore((s) => s.canAccessFeature);

  const checkAndGate = useCallback((feature: GateFeature, context?: { memberCount?: number }): boolean => {
    let allowed = false;

    switch (feature) {
      case 'project':
        allowed = canCreateProject();
        break;
      case 'member':
        allowed = canAddMember(context?.memberCount ?? 0);
        break;
      case 'pdf_export':
        allowed = canAccessFeature('pdf_export');
        break;
      case 'financial_module':
        allowed = canAccessFeature('financial_module');
        break;
    }

    if (!allowed) {
      setGateFeature(feature);
      setGateOpen(true);
    }

    return allowed;
  }, [canCreateProject, canAddMember, canAccessFeature]);

  const closeGate = useCallback(() => {
    setGateOpen(false);
    setGateFeature(null);
  }, []);

  const GateDrawerElement = useMemo(() => (
    <PlanGateDrawer
      open={gateOpen}
      onOpenChange={setGateOpen}
      onViewPlans={() => setGateOpen(false)}
      feature={gateFeature}
    />
  ), [gateOpen, gateFeature]);

  return { checkAndGate, closeGate, GateDrawer: GateDrawerElement };
}
