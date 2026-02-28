import { Outlet } from 'react-router-dom';
import BottomNavigation from './BottomNavigation';
import Sidebar from './Sidebar';
import Header from './Header';
import FAB from './FAB';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="momentum-scroll pb-24 md:pb-6 md:pl-64">
        <div className="mx-auto max-w-5xl p-4">
          <Outlet />
        </div>
      </main>
      <FAB />
      <BottomNavigation />
    </div>
  );
}
