

import { Outlet } from 'react-router-dom';
import Navbar from '../components/layouts/Navbar';
import { GlobalModal } from '../components/ui/GlobalModal'; // <-- IMPORTALO AQUÍ

export function MainLayout() {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col m-0 p-0 overflow-x-hidden">
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>

      {/* AGREGADO AQUÍ: Disponible para todas las páginas que usen este layout */}
      <GlobalModal />
    </div>
  );
}
