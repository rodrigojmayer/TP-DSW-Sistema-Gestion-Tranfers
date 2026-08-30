import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        {/* Placeholder temporal hasta crear la Feature de Usuarios */}
        <Route
          path="/usuarios"
          element={
            <div className="p-4 bg-white rounded shadow">
              Módulo de Usuarios (En construcción)
            </div>
          }
        />
        <Route
          path="/rutas"
          element={
            <div className="p-4 bg-white rounded shadow">
              Módulo de Rutas (En construcción)
            </div>
          }
        />
        <Route
          path="/viajes"
          element={
            <div className="p-4 bg-white rounded shadow">
              Módulo de Viajes (En construcción)
            </div>
          }
        />
      </Route>

      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/usuarios" replace />} />
    </Routes>
  );
};
