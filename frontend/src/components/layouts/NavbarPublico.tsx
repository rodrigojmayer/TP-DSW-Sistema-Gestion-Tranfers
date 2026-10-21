import { Link, useNavigate } from 'react-router-dom';
import {
  Bus,
  Car,
  
  Phone,
  LogIn,
  LayoutDashboard,
  LogOut,
  User,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export function NavbarPublico() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleGoToPanel = () => {
    if (!user) return;
    if (user.rol === 'CLIENTE') {
      navigate('/admin/reservas'); 
    } else {
      navigate('/admin/viajes');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-amber-500"
        >
          <Car className="w-8 h-8" />
          <span>TransferApp</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
          <Link
            to="/viajes"
            className="hover:text-amber-500 transition-colors flex items-center gap-1.5"
          >
            <Bus className="w-4 h-4" />
            Bus / Traslados
          </Link>
          {/* <Link
            to="/coches"
            className="hover:text-amber-500 transition-colors flex items-center gap-1.5"
          >
            <Car className="w-4 h-4" />
            Remis / Coches
          </Link> */}
          
        </nav>

        {/* Acciones de Contacto, Panel y Logout */}
        <div className="flex items-center gap-3">
          <Link
            to="/contacto"
            className="hidden sm:flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:border-amber-500 hover:text-amber-500 transition-colors"
          >
            <Phone className="w-4 h-4" />
            Contacto
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoToPanel}
                className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors shadow-sm"
              >
                {user.rol === 'CLIENTE' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <LayoutDashboard className="w-4 h-4" />
                )}
                Mi Panel ({user.rol})
              </button>

              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="border border-gray-300 p-2 rounded-full text-gray-600 hover:text-red-600 hover:border-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-full text-sm flex items-center gap-2 transition-colors shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              Ingresar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
