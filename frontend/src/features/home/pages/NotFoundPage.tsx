import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
        
        {/* Icono e Ilustración Visual */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 shadow-inner">
            <AlertTriangle className="w-10 h-10" />
          </div>
        </div>

        {/* Código de error y títulos */}
        <div className="space-y-2">
          <span className="text-sm font-semibold tracking-wider text-amber-600 uppercase">
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Página no encontrada
          </h1>
          <p className="text-sm text-gray-500">
            Lo sentimos, la página que estás buscando no existe, fue movida o no tienes permisos para acceder.
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver atrás
          </button>

          <Link
            to="/"
            className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-xl text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-sm transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al inicio
          </Link>
        </div>

      </div>
    </div>
  );
}