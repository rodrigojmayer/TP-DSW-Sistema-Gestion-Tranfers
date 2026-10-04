import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { UsuariosPage } from '../features/usuarios/pages/UsuariosPage';
import { RutasPage } from '../features/rutas/pages/RutasPage';
import { ViajesPage } from '../features/viajes/pages/ViajesPage';
import { ReservasPage } from '../features/reservas/pages/ReservasPage';
import { PuntosPage } from '../features/puntos/pages/PuntosPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { HomePage } from '../features/home/pages/HomePage';
import { MiPerfilPage } from '../features/usuarios/pages/MiPerfilPage';
import NotFoundPage from '../features/home/pages/NotFoundPage';

export const router = createBrowserRouter([
  // 1. Ruta Pública: Login
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/signup', // 👈 3. Nueva ruta de Registro
        element: <SignUpPage />,
      },
    ],
  },
  // 2. Layout Principal
  {
    path: '/',
    element: <AdminLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'viajes', element: <ViajesPage /> },

      // Rutas exclusivas para ADMIN
      {
        element: <ProtectedRoute rolesPermitidos={['ADMIN']} />,
        children: [       
          { path: 'usuarios', element: <UsuariosPage /> },
        ],
      },

      // Rutas para ADMIN ha OPERADOR
      {
        element: <ProtectedRoute rolesPermitidos={['ADMIN', 'OPERADOR']} />,
        children: [
          { path: 'rutas', element: <RutasPage /> },
          { path: 'puntos', element: <PuntosPage /> },
        ],
      },
      {
        element: <ProtectedRoute rolesPermitidos={['ADMIN', 'OPERADOR', 'CHOFER', 'CLIENTE']} />,
        children: [
          { path: 'reservas', element: <ReservasPage /> },
          { path: 'perfil', element: <MiPerfilPage /> },
        ],
      },

    ],
  },

  // 3. Redirección
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);