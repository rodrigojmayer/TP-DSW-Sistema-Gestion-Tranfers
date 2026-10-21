import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';
import { RootRedirect } from './RootRedirect';
import { HomePage } from '../features/home/pages/HomePage';
import { ViajesPublicosPage } from '../features/viajes/pages/ViajesPublicosPage';
import NotFoundPage from '../features/home/pages/NotFoundPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SignUpPage } from '../features/auth/pages/SignUpPage';
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
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/home" element={<HomePage />} />

        <Route path="/viajes" element={<ViajesPublicosPage />} />
        <Route path="/viajes-publicos" element={<ViajesPublicosPage />} />
      </Route>

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Route>

      <Route element={<MainLayout />}>
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

        <Route
          element={<ProtectedRoute rolesPermitidos={['ADMIN', 'OPERADOR']} />}
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/rutas" element={<RutasPage />} />
          <Route path="/admin/puntos" element={<PuntosPage />} />
        </Route>

        <Route element={<ProtectedRoute rolesPermitidos={['ADMIN']} />}>
          <Route path="/admin/usuarios" element={<UsuariosPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;