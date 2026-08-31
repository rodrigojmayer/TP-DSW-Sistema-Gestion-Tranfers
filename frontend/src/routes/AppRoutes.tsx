import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { UsuariosPage } from '../features/usuarios/pages/UsuariosPage';
import { RutasPage } from '../features/rutas/pages/RutasPage';
import { ViajesPage } from '../features/viajes/pages/ViajesPage'; // <-- Importar

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AdminLayout />, // El Layout envuelve a sus "children"
    children: [
      // Redirección por defecto al entrar a la raíz "/"
      { index: true, element: <Navigate to="/usuarios" replace /> },

      { path: 'usuarios', element: <UsuariosPage /> },
      { path: 'rutas', element: <RutasPage /> },
      { path: 'viajes', element: <ViajesPage /> },
       
      
    ],
  },
  // Catch-all para rutas que no existen (Error 404 manejado como redirección)
  {
    path: '*',
    element: <Navigate to="/usuarios" replace />,
  },
]);
