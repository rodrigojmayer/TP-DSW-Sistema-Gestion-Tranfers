import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { HomePage } from '../features/home/pages/HomePage';

export function RootRedirect() {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <HomePage />;
  }

  if (user.rol === 'ADMIN' || user.rol === 'OPERADOR') {
    return <Navigate to="/admin/viajes" replace />;
  }

  return <Navigate to="/admin/reservas" replace />;
}