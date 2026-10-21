// src/routes/ProtectedRoute.tsx
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

  // Si tiene restricciones de rol y el rol del usuario no está autorizado
  if (rolesPermitidos && !rolesPermitidos.includes(user.rol)) {
    // Redirigir según el rol del usuario para evitar caer en el landing público
    const rutaDestino =
      user.rol === 'CLIENTE' ? '/admin/viajes' : '/admin/viajes';
    return <Navigate to={rutaDestino} replace />;
  }

  return <Outlet />;
};

// original
// import { Navigate, Outlet } from 'react-router-dom';
// import { useAuthStore } from '../store/authStore';

// interface ProtectedRouteProps {
//   rolesPermitidos?: string[];
// }

// export const ProtectedRoute = ({ rolesPermitidos }: ProtectedRouteProps) => {
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
//   const user = useAuthStore((state) => state.user);

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (rolesPermitidos && user?.rol && !rolesPermitidos.includes(user.rol)) {
//     return <Navigate to="/" replace />;
//   }

//   return <Outlet />;
// };
