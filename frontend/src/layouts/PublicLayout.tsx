import { Outlet } from 'react-router-dom';
import { NavbarPublico } from '../components/layouts/NavbarPublico';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <NavbarPublico />
        <main className="pb-12">
          <Outlet />
        </main>
      </div>

      {/* Footer simple estilo comercial */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <p>
          © {new Date().getFullYear()} TransferApp. Todos los derechos
          reservados.
        </p>
      </footer>
    </div>
  );
}
