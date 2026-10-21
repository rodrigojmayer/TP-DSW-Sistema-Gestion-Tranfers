import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layouts/Navbar';
import { GlobalModal } from '../components/ui/GlobalModal';

export function MainLayout() {
  const { pathname } = useLocation();

  // Hace reset del scroll al tope cada vez que cambia la ruta
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col m-0 p-0 overflow-x-hidden text-slate-900">
      {/* Navbar Superior */}
      <Navbar />

      {/* Área Principal: Cambiamos py-6 por pt-2 pb-6 para reducir drásticamente el espacio superior */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Modales y Notificaciones Globales */}
      <GlobalModal />
    </div>
  );
}

export default MainLayout;