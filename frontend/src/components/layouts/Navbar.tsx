import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Estilos dinámicos para los enlaces activos vs inactivos
  const linkStyles = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-amber-500 text-white font-semibold shadow-sm'
        : 'text-gray-600 hover:text-amber-600 hover:bg-gray-50'
    }`;

  const linkStylesMobile = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-amber-500 text-white font-semibold'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO + ENLACES (Escritorio) */}
        <div className="flex items-center gap-8">
          <NavLink
            to="/admin/viajes"
            className="flex items-center gap-2"
          >
            <div className="bg-amber-500 text-white font-bold p-2 rounded-lg text-sm">
              TR
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              Transfers App
            </span>
          </NavLink>

          {/* Menú visible SOLO para usuarios autenticados en Escritorio */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              {(user.rol === 'ADMIN' || user.rol === 'OPERADOR') && (
                <>
                  <NavLink to="/admin/puntos" className={linkStyles}>
                    Puntos
                  </NavLink>
                  <NavLink to="/admin/rutas" className={linkStyles}>
                    Rutas
                  </NavLink>
                </>
              )}
              <NavLink to="/admin/viajes" className={linkStyles}>
                Viajes
              </NavLink>
              <NavLink to="/admin/reservas" className={linkStyles}>
                Reservas
              </NavLink>


              {user.rol === 'ADMIN' && (
                <NavLink to="/admin/usuarios" className={linkStyles}>
                  Usuarios
                </NavLink>
              )}

              <NavLink to="/perfil" className={linkStyles}>
                Perfil
              </NavLink>
            </nav>
          )}
        </div>

        {/* ACCIONES DE USUARIO / INGRESO (Escritorio) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {user.nombre} {user.apellido || ''} ({user.rol})
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <NavLink
              to="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Ingresar
            </NavLink>
          )}
        </div>

        {/* BOTÓN HAMBURGUESA (Móvil / Pantallas chicas) */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú"
          >
            {menuAbierto ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {menuAbierto && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-4 space-y-3 shadow-lg">
          {user && (
            <div className="py-2 border-b border-gray-100 text-xs font-semibold text-gray-600">
              Sesión: <span className="text-amber-600">{user.nombre} {user.apellido || ''} ({user.rol})</span>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/admin/viajes"
              onClick={() => setMenuAbierto(false)}
              className={linkStylesMobile}
            >
              Viajes
            </NavLink>
            <NavLink
              to="/admin/reservas"
              onClick={() => setMenuAbierto(false)}
              className={linkStylesMobile}
            >
              Reservas
            </NavLink>

            {user && (user.rol === 'ADMIN' || user.rol === 'OPERADOR') && (
              <>
                <NavLink
                  to="/admin/rutas"
                  onClick={() => setMenuAbierto(false)}
                  className={linkStylesMobile}
                >
                  Rutas
                </NavLink>
                <NavLink
                  to="/admin/puntos"
                  onClick={() => setMenuAbierto(false)}
                  className={linkStylesMobile}
                >
                  Puntos
                </NavLink>
              </>
            )}

            {user && user.rol === 'ADMIN' && (
              <NavLink
                to="/admin/usuarios"
                onClick={() => setMenuAbierto(false)}
                className={linkStylesMobile}
              >
                Usuarios
              </NavLink>
            )}

            {user && (
              <NavLink
                to="/perfil"
                onClick={() => setMenuAbierto(false)}
                className={linkStylesMobile}
              >
                Perfil
              </NavLink>
            )}
          </nav>

          <div className="pt-2 border-t border-gray-100">
            {user ? (
              <button
                onClick={() => {
                  setMenuAbierto(false);
                  handleLogout();
                }}
                className="w-full text-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            ) : (
              <NavLink
                to="/login"
                onClick={() => setMenuAbierto(false)}
                className="block text-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
              >
                Ingresar
              </NavLink>
            )}
          </div>
        </div>
      )}
    </header>
  );
}