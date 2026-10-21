// src/routes/RootRedirect.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { HomePage } from '../features/home/pages/HomePage';

export function RootRedirect() {
  const user = useAuthStore((state) => state.user);

  // 1. Si no hay usuario en sesión, renderiza la HomePage comercial
  if (!user) {
    return <HomePage />;
  }

  // 2. Si es Admin u Operador, va a su panel administrativo principal
  if (user.rol === 'ADMIN' || user.rol === 'OPERADOR') {
    return <Navigate to="/admin/viajes" replace />;
  }

  // 3. Para clientes y choferes, redirige a sus reservas/panel
  return <Navigate to="/admin/reservas" replace />;
}

// import { Navigate } from 'react-router-dom';
// import { useAuthStore } from '../store/authStore';
// import { HomePage } from '../features/home/pages/HomePage';

// export function RootRedirect() {
//   const user = useAuthStore((state) => state.user);

//   // 1. Si no hay usuario en sesión, renderiza la Landing Page pública
//   if (!user) {
//     return <HomePage />;
//   }

//   // 2. Si es Admin u Operador, lo redirige a su panel principal
//   if (user.rol === 'ADMIN' || user.rol === 'OPERADOR') {
//     return <Navigate to="/admin" replace />;
//   }

//   // 3. Para clientes y choferes, redirige a la vista de viajes
//   return <Navigate to="/viajes" replace />;
// }
