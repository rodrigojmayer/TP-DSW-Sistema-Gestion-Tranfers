import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layouts/Sidebar'
import { Navbar } from '../components/layouts/Navbar';

export const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
