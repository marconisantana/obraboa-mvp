import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import Header from './Header';
import FAB from './FAB';

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <main className="momentum-scroll pb-24 lg:pb-6 lg:pl-64">
        <div className="mx-auto max-w-5xl p-4">
          <Outlet />
        </div>
      </main>
      <FAB />
      <BottomNav />
    </div>
  );
}
