import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";
import SplashPage from "@/pages/SplashPage";
import OnboardingPage from "@/pages/OnboardingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import HomePage from "@/pages/HomePage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import SchedulePage from "@/pages/SchedulePage";
import RdoPage from "@/pages/RdoPage";
import RdoDetail from "@/components/rdo/RdoDetail";
import ChecklistsPage from "@/pages/ChecklistsPage";
import ChecklistDetail from "@/components/checklist/ChecklistDetail";
import PurchasesPage from "@/pages/PurchasesPage";
import PurchaseOrderDetail from "@/components/purchases/PurchaseOrderDetail";
import DossiersPage from "@/pages/DossiersPage";
import DossierDetail from "@/components/dossiers/DossierDetail";
import DocumentsPage from "@/pages/DocumentsPage";
import ToolsPage from "@/pages/ToolsPage";
import ReferencesPage from "@/pages/ReferencesPage";
import PendingPage from "@/pages/PendingPage";
import ProfilePage from "@/pages/ProfilePage";
import NotFound from "@/pages/NotFound";
import "@/i18n";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/splash" element={<SplashPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/rdo" element={<RdoPage />} />
                <Route path="/rdo/:id" element={<RdoDetail />} />
                <Route path="/checklists" element={<ChecklistsPage />} />
                <Route path="/checklists/:id" element={<ChecklistDetail />} />
                <Route path="/purchases" element={<PurchasesPage />} />
                <Route path="/purchases/:id" element={<PurchaseOrderDetail />} />
                <Route path="/dossiers" element={<DossiersPage />} />
                <Route path="/dossiers/:id" element={<DossierDetail />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/references" element={<ReferencesPage />} />
                <Route path="/pending" element={<PendingPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
