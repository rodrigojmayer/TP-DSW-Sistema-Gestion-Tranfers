import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore'; 

export const HomePage = () => {
  const navigate = useNavigate();
  // Verificamos si hay un usuario logueado en el store
  const user = useAuthStore((state) => state.user);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 text-white py-20 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold tracking-wide border border-amber-500/30">
            Servicio de Traslados & Transfers
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white">
            Viajá cómodo, seguro y a tiempo
          </h1>
          
          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto font-light">
            Reservá tu asiento en nuestros viajes programados de manera rápida y sin complicaciones.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/reservas')}
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Reservar Traslado Ahora
            </button>

            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all"
              >
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. TARJETAS DE SERVICIOS Y CARACTERÍSTICAS */}
      <section className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800">¿Por qué elegir nuestro servicio?</h2>
          <p className="text-slate-500 mt-2">Diseñado para brindarte la mejor experiencia en cada trayecto</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 text-2xl font-bold">
              ⚡
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Reserva Inmediata</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Consultá las salidas disponibles y asegurá tu lugar en pocos pasos de forma directa.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 text-2xl font-bold">
              🗺️
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Múltiples Rutas</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Conectamos los principales puntos de la región con horarios y frecuencias acordes a tus necesidades.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 text-2xl font-bold">
              🛡️
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Seguridad & Confort</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Choferes profesionales y unidades equipadas para ofrecer un viaje placentero y puntual.
            </p>
          </div>
        </div>
      </section>

      {/* 3. LLAMADO A LA ACCIÓN FINAL */}
      <section className="bg-amber-500 text-slate-900 py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold">¿Listo para emprender tu próximo viaje?</h3>
            <p className="text-slate-800 font-medium">Revisá la lista de salidas programadas y reservá tu pasaje.</p>
          </div>
          <button
            onClick={() => navigate('/reservas')}
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
          >
            Ver Salidas Disponibles
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm border-t border-slate-800">
        <p>© {new Date().getFullYear()} Transfers App. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};