import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { RootRedirect } from './RootRedirect'; // 👈 Importamos el componente desde su propio archivo
//import { HomePage } from '../features/home/pages/HomePage';
import { AdminDashboardPage } from '../features/home/pages/AdminDashboardPage';
import { ViajesPage } from '../features/viajes/pages/ViajesPage';
import { UsuariosPage } from '../features/usuarios/pages/UsuariosPage';
import { RutasPage } from '../features/rutas/pages/RutasPage';
import { PuntosPage } from '../features/puntos/pages/PuntosPage';
import { ReservasPage } from '../features/reservas/pages/ReservasPage';
import { MiPerfilPage } from '../features/usuarios/pages/MiPerfilPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';
import NotFoundPage from '../features/home/pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignUpPage /> },
    ],
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      // Evaluamos la raíz de forma limpia con RootRedirect
      { index: true, element: <RootRedirect /> },

      { path: 'viajes', element: <ViajesPage /> },

      // Rutas para Admin y Operador
      {
        element: <ProtectedRoute rolesPermitidos={['ADMIN', 'OPERADOR']} />,
        children: [
          { path: 'admin', element: <AdminDashboardPage /> },
          { path: 'rutas', element: <RutasPage /> },
          { path: 'puntos', element: <PuntosPage /> },
        ],
      },

      // Rutas exclusivas de Admin
      {
        element: <ProtectedRoute rolesPermitidos={['ADMIN']} />,
        children: [{ path: 'usuarios', element: <UsuariosPage /> }],
      },

      // Rutas para todos los usuarios autenticados
      {
        element: (
          <ProtectedRoute
            rolesPermitidos={['ADMIN', 'OPERADOR', 'CHOFER', 'CLIENTE']}
          />
        ),
        children: [
          { path: 'reservas', element: <ReservasPage /> },
          { path: 'perfil', element: <MiPerfilPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
// import { createBrowserRouter } from 'react-router-dom';
// import { MainLayout } from '../layouts/MainLayout';
// import { HomePage } from '../features/home/pages/HomePage';
// import { AdminDashboardPage } from '../features/home/pages/AdminDashboardPage'; // 👈 Importamos la página del panel
// import { ViajesPage } from '../features/viajes/pages/ViajesPage';
// import { UsuariosPage } from '../features/usuarios/pages/UsuariosPage';
// import { RutasPage } from '../features/rutas/pages/RutasPage';
// import { PuntosPage } from '../features/puntos/pages/PuntosPage';
// import { ReservasPage } from '../features/reservas/pages/ReservasPage';
// import { MiPerfilPage } from '../features/usuarios/pages/MiPerfilPage';
// import { LoginPage } from '../features/auth/pages/LoginPage';
// import { SignUpPage } from '../features/auth/pages/SignUpPage';
// import NotFoundPage from '../features/home/pages/NotFoundPage';
// import { ProtectedRoute } from './ProtectedRoute';
// import { PublicOnlyRoute } from './PublicOnlyRoute';

// export const router = createBrowserRouter([
//   {
//     element: <PublicOnlyRoute />,
//     children: [
//       { path: '/login', element: <LoginPage /> },
//       { path: '/signup', element: <SignUpPage /> },
//     ],
//   },
//   {
//     path: '/',
//     element: <MainLayout />,
//     children: [
//       // Landing Page Pública en la raíz
//       { index: true, element: <HomePage /> },

//       { path: 'viajes', element: <ViajesPage /> },

//       // Ruta del Panel de Administración / Operador
//       {
//         element: <ProtectedRoute rolesPermitidos={['ADMIN', 'OPERADOR']} />,
//         children: [
//           { path: 'admin', element: <AdminDashboardPage /> }, // 👈 Nueva ruta /admin
//           { path: 'rutas', element: <RutasPage /> },
//           { path: 'puntos', element: <PuntosPage /> },
//         ],
//       },

//       // Rutas exclusivas de Admin
//       {
//         element: <ProtectedRoute rolesPermitidos={['ADMIN']} />,
//         children: [{ path: 'usuarios', element: <UsuariosPage /> }],
//       },

//       // Rutas generales para usuarios autenticados
//       {
//         element: (
//           <ProtectedRoute
//             rolesPermitidos={['ADMIN', 'OPERADOR', 'CHOFER', 'CLIENTE']}
//           />
//         ),
//         children: [
//           { path: 'reservas', element: <ReservasPage /> },
//           { path: 'perfil', element: <MiPerfilPage /> },
//         ],
//       },
//     ],
//   },
//   {
//     path: '*',
//     element: <NotFoundPage />,
//   },
// ]);

//   otros

// import { createBrowserRouter } from 'react-router-dom';
// import { AdminLayout } from '../layouts/AdminLayout';
// import { UsuariosPage } from '../features/usuarios/pages/UsuariosPage';
// import { RutasPage } from '../features/rutas/pages/RutasPage';
// import { ViajesPage } from '../features/viajes/pages/ViajesPage';
// import { ReservasPage } from '../features/reservas/pages/ReservasPage';
// import { PuntosPage } from '../features/puntos/pages/PuntosPage';
// import { LoginPage } from '../features/auth/pages/LoginPage';
// import { SignUpPage } from '../features/auth/pages/SignUpPage';
// import { ProtectedRoute } from './ProtectedRoute';
// import { PublicOnlyRoute } from './PublicOnlyRoute';
// import { HomePage } from '../features/home/pages/HomePage';
// import { MiPerfilPage } from '../features/usuarios/pages/MiPerfilPage';
// import NotFoundPage from '../features/home/pages/NotFoundPage';

// export const router = createBrowserRouter([
//   // 1. Ruta Pública: Login
//   {
//     element: <PublicOnlyRoute />,
//     children: [
//       {
//         path: '/login',
//         element: <LoginPage />,
//       },
//       {
//         path: '/signup', // 👈 3. Nueva ruta de Registro
//         element: <SignUpPage />,
//       },
//     ],
//   },
//   // 2. Layout Principal
//   {
//     path: '/',
//     element: <AdminLayout />,
//     children: [
//       { index: true, element: <HomePage /> },
//       { path: 'viajes', element: <ViajesPage /> },

//       // Rutas exclusivas para ADMIN
//       {
//         element: <ProtectedRoute rolesPermitidos={['ADMIN']} />,
//         children: [
//           { path: 'usuarios', element: <UsuariosPage /> },
//         ],
//       },

//       // Rutas para ADMIN ha OPERADOR
//       {
//         element: <ProtectedRoute rolesPermitidos={['ADMIN', 'OPERADOR']} />,
//         children: [
//           { path: 'rutas', element: <RutasPage /> },
//           { path: 'puntos', element: <PuntosPage /> },
//         ],
//       },
//       {
//         element: <ProtectedRoute rolesPermitidos={['ADMIN', 'OPERADOR', 'CHOFER', 'CLIENTE']} />,
//         children: [
//           { path: 'reservas', element: <ReservasPage /> },
//           { path: 'perfil', element: <MiPerfilPage /> },
//         ],
//       },

//     ],
//   },

//   // 3. Redirección
//   {
//     path: '*',
//     element: <NotFoundPage />,
//   },
// ]);
