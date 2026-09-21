import { NavLink } from 'react-router-dom';
import {
  UsersIcon,
  MapIcon,
  MapPinIcon,
  // PaperAirplaneIcon,
  TruckIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

export const Sidebar = () => {
  // const linkStyles = ({ isActive }: { isActive: boolean }) =>
  //   `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition ${
  //     isActive
  //       ? 'bg-amber-500 text-slate-950'
  //       : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  // }`;
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    { label: 'Usuarios', path: '/usuarios', roles: ['ADMIN'], icon: UsersIcon },
    { label: 'Puntos', path: '/puntos', roles: ['ADMIN', 'OPERADOR'], icon: MapPinIcon },
    { label: 'Rutas', path: '/rutas', roles: ['ADMIN', 'OPERADOR', 'CHOFER'], icon: MapIcon },
    { label: 'Viajes', path: '/viajes', roles: ['ADMIN', 'OPERADOR', 'CHOFER'], icon: TruckIcon },
    { label: 'Reservas', path: '/reservas', roles: ['ADMIN', 'OPERADOR'], icon: ClipboardDocumentCheckIcon },
  ];

  // Filtramos los ítems a los que el usuario tiene acceso
  const itemsFiltrados = menuItems.filter(
    (item) => user?.rol && item.roles.includes(user.rol)
  );

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
          {/* <NavLink to="/usuarios" className={linkStyles}>
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
          </NavLink> */}
          {itemsFiltrados.map((item) => {
          const Icon = item.icon; // Se asigna a una variable en mayúscula para renderizar como componente JSX

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
        </nav>
      </div>
    </aside>
  );
};
