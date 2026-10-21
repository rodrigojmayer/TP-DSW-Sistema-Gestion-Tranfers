import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  rolesPermitidos?: string[];
}

export const ProtectedRoute = ({ rolesPermitidos }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    const rutaDestino =
      user.rol === 'CLIENTE' ? '/admin/viajes' : '/admin/viajes';
    return <Navigate to={rutaDestino} replace />;
  }

  return <Outlet />;
};