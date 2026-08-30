import {
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

export const Navbar = () => {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
      <h1 className="text-slate-800 font-semibold text-lg">
        Panel de Administración
      </h1>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <UserCircleIcon className="w-6 h-6 text-slate-400" />
          <span className="font-medium">Admin Mock</span>
        </div>

        <button
          className="p-1.5 text-slate-500 hover:text-red-600 transition"
          title="Cerrar Sesión"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
