import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { UsuariosPage } from '../features/usuarios/pages/UsuariosPage';
import { RutasPage } from '../features/rutas/pages/RutasPage';
import { ViajesPage } from '../features/viajes/pages/ViajesPage';
import { ReservasPage } from '../features/reservas/pages/ReservasPage';
import { PuntosPage } from '../features/puntos/pages/PuntosPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  // 1. Ruta Pública: Login
  {
    path: '/login',
    element: <LoginPage />,
  },

  // 2. Rutas Protegidas (Requieren autenticación)
  {
    path: '/',
    element: <ProtectedRoute />, // Evalúa si hay token/sesión activa
    children: [
      {
        element: <AdminLayout />, // Layout de la app con Sidebar/Header
        children: [
          { index: true, element: <Navigate to="/usuarios" replace /> },
          { path: 'usuarios', element: <UsuariosPage /> },
          { path: 'rutas', element: <RutasPage /> },
          { path: 'puntos', element: <PuntosPage /> },
          { path: 'viajes', element: <ViajesPage /> },
          { path: 'reservas', element: <ReservasPage /> },
        ],
      },
    ],
  },

  // 3. Redirección para rutas inexistentes
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);