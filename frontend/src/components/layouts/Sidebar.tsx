import { NavLink } from 'react-router-dom';
import {
  UsersIcon,
  MapIcon,
  MapPinIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

export const Sidebar = () => {
  const linkStyles = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition ${
      isActive
        ? 'bg-amber-500 text-slate-950'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  return (
    <aside className="w-50 bg-slate-900 text-white flex flex-col justify-between h-screen p-4">
      <div className="space-y-6">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 bg-amber-500 rounded-md flex items-center justify-center font-bold text-slate-900">
            TR
          </div>
          <span className="font-bold text-lg tracking-wide">Transfers App</span>
        </div>

        <nav className="space-y-2">
          <NavLink to="/usuarios" className={linkStyles}>
            <UsersIcon className="w-5 h-5" />
            Usuarios
          </NavLink>
          <NavLink to="/puntos" className={linkStyles}>
            <MapPinIcon className="w-5 h-5" />
            Puntos 
          </NavLink>
          <NavLink to="/rutas" className={linkStyles}>
            <MapIcon className="w-5 h-5" />
            Rutas
          </NavLink>
          <NavLink to="/viajes" className={linkStyles}>
            <PaperAirplaneIcon className="w-5 h-5" />
            Viajes
          </NavLink>
          <NavLink to="/reservas" className={linkStyles}>
            <PaperAirplaneIcon className="w-5 h-5" />
            Reservas
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};
