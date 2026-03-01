import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Header from './Header';
import FAB from './FAB';
import OfflineDetector from './OfflineDetector';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <OfflineDetector />
      <Header />
      <main className="momentum-scroll pt-14 pb-[calc(4rem+env(safe-area-inset-bottom,0px)+1.5rem)]">
        <div className="mx-auto max-w-5xl p-4">
          <Outlet />
        </div>
      </main>
      <FAB />
      <BottomNavigation />
    </div>
  );
}
