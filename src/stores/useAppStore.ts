import { create } from 'zustand';

export type AccountType = 'personal' | 'professional';

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  account_type: AccountType;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'planning' | 'in_progress' | 'paused' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  address: string | null;
  type: string | null;
  cover_image_url: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  project_id: string;
  user_id: string;
  type: string;
  description: string;
  created_at: string;
}

export type PlanType = 'free' | 'basic' | 'flipper' | 'pro';
export type FeatureKey = 'multi_project' | 'pdf_export' | 'unlimited_members' | 'financial_module';

const FEATURE_ACCESS: Record<PlanType, FeatureKey[]> = {
  free: [],
  basic: ['multi_project', 'pdf_export'],
  flipper: ['multi_project', 'pdf_export', 'financial_module'],
  pro: ['multi_project', 'pdf_export', 'unlimited_members', 'financial_module'],
};

interface AppState {
  user: Profile | null;
  setUser: (user: Profile | null) => void;

  activeProject: Project | null;
  setActiveProject: (project: Project | null) => void;

  projects: Project[];
  setProjects: (projects: Project[]) => void;

  plan: PlanType;
  canAccessFeature: (feature: FeatureKey) => boolean;

  activities: Activity[];
  isLoadingActivities: boolean;
  setActivities: (activities: Activity[]) => void;
  setLoadingActivities: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  activeProject: null,
  setActiveProject: (project) => set({ activeProject: project }),

  projects: [],
  setProjects: (projects) => set({ projects }),

  plan: 'free',
  canAccessFeature: (feature) => {
    const { plan } = get();
    return FEATURE_ACCESS[plan]?.includes(feature) ?? false;
  },

  activities: [],
  isLoadingActivities: false,
  setActivities: (activities) => set({ activities }),
  setLoadingActivities: (loading) => set({ isLoadingActivities: loading }),
}));
