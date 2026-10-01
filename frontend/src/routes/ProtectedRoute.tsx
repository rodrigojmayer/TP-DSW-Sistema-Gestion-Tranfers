import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  rolesPermitidos?: string[];
}

export const ProtectedRoute = ({ rolesPermitidos }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);


  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

 
  if (rolesPermitidos && user?.rol && !rolesPermitidos.includes(user.rol)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};