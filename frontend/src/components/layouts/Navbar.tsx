import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* LOGO + NOMBRE */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-amber-500 text-white font-bold p-2 rounded-lg text-sm">
              TR
            </div>
            <span className="font-bold text-gray-900 text-lg">
              Transfers App
            </span>
          </Link>

          {/* ENLACES DE NAVEGACIÓN HORIZONTAL */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/viajes"
              className="text-gray-600 hover:text-amber-600 font-medium text-sm transition-colors"
            >
              Viajes
            </Link>
            <Link
              to="/reservas"
              className="text-gray-600 hover:text-amber-600 font-medium text-sm transition-colors"
            >
              Reservas
            </Link>
            {user?.rol === 'ADMIN' && (
              <>
                <Link
                  to="/puntos"
                  className="text-gray-600 hover:text-amber-600 font-medium text-sm transition-colors"
                >
                  Puntos
                </Link>
                <Link
                  to="/usuarios"
                  className="text-gray-600 hover:text-amber-600 font-medium text-sm transition-colors"
                >
                  Usuarios
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* ÁREA DE USUARIO Y ACCIONES */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                {user.nombre} {user.apellido}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// import { useNavigate, Link } from 'react-router-dom';
// import {
//   UserCircleIcon,
//   ArrowRightStartOnRectangleIcon,
// } from '@heroicons/react/24/outline';
// import { useAuthStore } from '../../store/authStore';

// export const Navbar = () => {
//   const navigate = useNavigate();
//   const { user, logout } = useAuthStore();

//   const handleLogout = () => {
//     logout();
//     navigate('/login', { replace: true });
//   };
//   return (
//     <header className="bg-white border-b border-slate-200 px-6 py-1 flex justify-between items-center">
//       <h1 className="text-slate-500 font-semibold text-sd">
//         Panel de Administración
//       </h1>

//     <Link to="/perfil" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 'bold' }}>
//        {/* {user ? `${user.nombre} ${user.apellido}` : 'Invitado'} */}
//       <div className="flex items-center gap-4">
//         <div className="flex items-center gap-2 text-sm text-slate-600">
//           <UserCircleIcon className="w-6 h-6 text-slate-400" />
//             <span className="font-medium">
//               {user ? `${user.nombre} ${user.apellido}` : 'Invitado'}
//             </span>
//         </div>

//         <button
//           onClick={handleLogout}
//           className="p-1.5 text-slate-500 hover:text-red-600 transition cursor-pointer"
//           title="Cerrar Sesión"
//         >
//           <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
//         </button>
//       </div>
//     </Link>

//     </header>
//   );
// };
