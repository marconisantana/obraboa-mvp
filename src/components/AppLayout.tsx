import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';
import FAB from './FAB';
import OfflineDetector from './OfflineDetector';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <OfflineDetector />
      <BottomNavigation />
      <Header />
      <main className="momentum-scroll pt-16 pb-6">
        <div className="mx-auto max-w-5xl p-4">
          <Outlet />
        </div>
      </main>
      <FAB />
    </div>
  );
}
