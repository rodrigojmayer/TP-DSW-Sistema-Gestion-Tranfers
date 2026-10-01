import { Navigate, Outlet } from 'react-router-dom';

export const PublicOnlyRoute = () => {
  const token = localStorage.getItem('token'); // O la forma en que verifiques la sesión en tu app

  if (token) {
    // Si ya está logueado, lo mandamos al Home o Dashboard
    return <Navigate to="/" replace />;
  }

  // Si NO está logueado, se le muestra la ruta pública (Login / SignUp)
  return <Outlet />;
};