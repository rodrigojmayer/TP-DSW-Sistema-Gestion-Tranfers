import { useNavigate } from 'react-router-dom';
import {
  UserCircleIcon,
  ArrowRightStartOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-1 flex justify-between items-center">
      <h1 className="text-slate-500 font-semibold text-sd">
        Panel de Administración
      </h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <UserCircleIcon className="w-6 h-6 text-slate-400" />
            <span className="font-medium">
              {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
            </span>
        </div>

        <button
          onClick={handleLogout}
          className="p-1.5 text-slate-500 hover:text-red-600 transition cursor-pointer"
          title="Cerrar Sesión"
        >
          <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
