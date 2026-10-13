import { Routes, Route } from 'react-router-dom';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { MainLayout } from '../layouts/MainLayout';

// Guardias / Protecciones
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { RootRedirect } from './RootRedirect';

// Páginas Públicas Comercial
import { HomePage } from '../features/home/pages/HomePage';
import { ViajesPublicosPage } from '../features/viajes/pages/ViajesPublicosPage';
import NotFoundPage from '../features/home/pages/NotFoundPage';

// Páginas de Auth
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';

// Páginas Privadas / Panel
import { AdminDashboardPage } from '../features/home/pages/AdminDashboardPage';
import { ViajesPage } from '../features/viajes/pages/ViajesPage';
import { RutasPage } from '../features/rutas/pages/RutasPage';
import { PuntosPage } from '../features/puntos/pages/PuntosPage';
import { ReservasPage } from '../features/reservas/pages/ReservasPage';
import { UsuariosPage } from '../features/usuarios/pages/UsuariosPage';
import { MiPerfilPage } from '../features/usuarios/pages/MiPerfilPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* 1. ZONA PÚBLICA COMERCIAL (Con NavbarPublico comercial + Footer) */}
      <Route element={<PublicLayout />}>
        {/* La raíz evalúa la sesión, pero renderiza el contenido dentro de PublicLayout */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/home" element={<HomePage />} />

        {/* Mapeados /viajes y /viajes-publicos para garantizar la coincidencia con la Navbar */}
        <Route path="/viajes" element={<ViajesPublicosPage />} />
        <Route path="/viajes-publicos" element={<ViajesPublicosPage />} />
      </Route>

      {/* 2. AUTENTICACIÓN (Solo accesibles si NO estás logueado) */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>

      {/* 3. ZONA PRIVADA (Requiere Login + MainLayout con Navbar Privado) */}
      <Route element={<MainLayout />}>
        {/* --- A. ACCESIBLE PARA TODOS LOS USUARIOS LOGUEADOS (Cliente, Chofer, Operador, Admin) --- */}
        <Route
          element={
            <ProtectedRoute
              rolesPermitidos={['ADMIN', 'OPERADOR', 'CHOFER', 'CLIENTE']}
            />
          }
        >
          <Route path="/admin/viajes" element={<ViajesPage />} />
          <Route path="/admin/reservas" element={<ReservasPage />} />
          <Route path="/perfil" element={<MiPerfilPage />} />
        </Route>

        {/* --- B. EXCLUSIVO PARA GESTIÓN OPERATIVA (Admin y Operador) --- */}
        <Route
          element={<ProtectedRoute rolesPermitidos={['ADMIN', 'OPERADOR']} />}
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/rutas" element={<RutasPage />} />
          <Route path="/admin/puntos" element={<PuntosPage />} />
        </Route>

        {/* --- C. EXCLUSIVO PARA ADMINISTRADOR PRINCIPAL --- */}
        <Route element={<ProtectedRoute rolesPermitidos={['ADMIN']} />}>
          <Route path="/admin/usuarios" element={<UsuariosPage />} />
        </Route>
      </Route>

      {/* 4. RUTA 404 NOT FOUND */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;

// primera modificacion

// import { createBrowserRouter } from 'react-router-dom';
// import { MainLayout } from '../layouts/MainLayout';
// import { RootRedirect } from './RootRedirect'; // 👈 Importamos el componente desde su propio archivo
// //import { HomePage } from '../features/home/pages/HomePage';
// import { AdminDashboardPage } from '../features/home/pages/AdminDashboardPage';
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
//       // Evaluamos la raíz de forma limpia con RootRedirect
//       { index: true, element: <RootRedirect /> },

//       { path: 'viajes', element: <ViajesPage /> },

//       // Rutas para Admin y Operador
//       {
//         element: <ProtectedRoute rolesPermitidos={['ADMIN', 'OPERADOR']} />,
//         children: [
//           { path: 'admin', element: <AdminDashboardPage /> },
//           { path: 'rutas', element: <RutasPage /> },
//           { path: 'puntos', element: <PuntosPage /> },
//         ],
//       },

//       // Rutas exclusivas de Admin
//       {
//         element: <ProtectedRoute rolesPermitidos={['ADMIN']} />,
//         children: [{ path: 'usuarios', element: <UsuariosPage /> }],
//       },

//       // Rutas para todos los usuarios autenticados
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

//   original
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
