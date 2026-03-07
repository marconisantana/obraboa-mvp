import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/landing/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import AppPreviewSection from '@/components/landing/AppPreviewSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PlansSection from '@/components/landing/PlansSection';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';

export default function LandingPage() {
    const { session, isLoading } = useAuth();

    // While auth is resolving, show nothing (prevents flash)
    if (isLoading) {
        return (
            <div style={{ minHeight: '100vh', backgroundColor: '#0D3259', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/logo-obraboa-white.svg" alt="ObraBoa" style={{ height: '40px', opacity: 0.6 }} />
            </div>
        );
    }

    // Logged-in users go to the dashboard
    if (session) {
        return <Navigate to="/home" replace />;
    }

    return (
        <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
            <Navbar />
            <main>
                <HeroSection />
                <AppPreviewSection />
                <FeaturesSection />
                <PlansSection />
                <CTASection />
            </main>
            <Footer />
        </div>
    );
}
