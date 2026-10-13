// src/features/viajes/pages/ViajesPublicosPage.tsx
import { useState, useEffect } from 'react';
import { Car, RefreshCw, Eye, Calendar, Users, Luggage } from 'lucide-react';
import type { Viaje } from '../../../types';
import { viajeService } from '../api/viajeService';
import { useModalStore } from '../../../store/useModalStore';

export function ViajesPublicosPage() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { openModal } = useModalStore();

  useEffect(() => {
    let cancelado = false;

    const cargarViajesPublicos = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await viajeService.obtenerPublicos();
        if (!cancelado) {
          setViajes(data);
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error al cargar los viajes públicos.',
          );
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargarViajesPublicos();

    return () => {
      cancelado = true;
    };
  }, []);

  // 🟢 Abre siempre el modal público con el itinerario y las paradas, sin bloquear invitados
  const handleVerDetalle = (viaje: Viaje) => {
    openModal('DETALLE_VIAJE_PUBLICO', { viaje });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Viajes Disponibles
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Consulta los traslados y salidas programadas en nuestras rutas
            habituales.
          </p>
        </div>
      </div>

      {/* Estado de Carga */}
      {cargando ? (
        <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Buscando viajes disponibles...</p>
        </div>
      ) : error ? (
        /* Error */
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-sm text-red-700">
          {error}
        </div>
      ) : viajes.length === 0 ? (
        /* Lista Vacía */
        <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <Car className="w-12 h-12 text-gray-300" />
          <p className="font-semibold text-gray-700">
            No hay viajes programados por el momento
          </p>
          <p className="text-xs text-gray-400">
            Vuelve a consultar más tarde para nuevas salidas.
          </p>
        </div>
      ) : (
        /* Catálogo de Tarjetas */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viajes.map((viaje) => (
            <div
              key={viaje.id}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      viaje.tipo === 'PRIVADO'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {viaje.tipo}
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    ${viaje.precio ?? 0}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-gray-800 leading-snug">
                  {viaje.rutaNombre || `Ruta #${viaje.idRuta || 'N/A'}`}
                </h2>

                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {viaje.fechaHoraInicio
                        ? new Date(viaje.fechaHoraInicio).toLocaleString(
                            'es-AR',
                            {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            },
                          )
                        : 'Sin fecha asignada'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{viaje.capacidadPasajeros ?? 0} asientos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Luggage className="w-4 h-4 text-gray-400" />
                      <span>{viaje.capacidadValijas ?? 0} valijas</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleVerDetalle(viaje)}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                Ver detalles y paradas
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViajesPublicosPage;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Car, RefreshCw, Eye, Calendar, Users, Luggage } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { viajeService } from '../api/viajeService';
// import { useModalStore } from '../../../store/useModalStore';
// import { useAuthStore } from '../../../store/authStore';

// export function ViajesPublicosPage() {
//   const [viajes, setViajes] = useState<Viaje[]>([]);
//   const [cargando, setCargando] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const navigate = useNavigate();
//   const { openModal } = useModalStore();
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

//   useEffect(() => {
//     let cancelado = false;

//     const cargarViajesPublicos = async () => {
//       setCargando(true);
//       setError(null);
//       try {
//         const data = await viajeService.obtenerPublicos();
//         if (!cancelado) {
//           setViajes(data);
//         }
//       } catch (err) {
//         if (!cancelado) {
//           setError(
//             err instanceof Error
//               ? err.message
//               : 'Ocurrió un error al cargar los viajes públicos.',
//           );
//         }
//       } finally {
//         if (!cancelado) {
//           setCargando(false);
//         }
//       }
//     };

//     cargarViajesPublicos();

//     return () => {
//       cancelado = true;
//     };
//   }, []);

//   const handleVerDetalle = (viaje: Viaje) => {
//     // Si el usuario no está autenticado, se lo redirige a la pantalla de registro
//     if (!isAuthenticated) {
//       navigate('/signup', {
//         state: { from: '/viajes', viajeId: viaje.id },
//       });
//       return;
//     }

//     // Si ya está logueado, abre el modal de detalle / reserva
//     openModal('DETALLE_VIAJE_PUBLICO', { viaje });
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
//       {/* Encabezado */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             Viajes Disponibles
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Consulta los traslados y salidas programadas en nuestras rutas
//             habituales.
//           </p>
//         </div>
//       </div>

//       {/* Estado de Carga */}
//       {cargando ? (
//         <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//           <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
//           <p className="text-sm font-medium">Buscando viajes disponibles...</p>
//         </div>
//       ) : error ? (
//         /* Error */
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-sm text-red-700">
//           {error}
//         </div>
//       ) : viajes.length === 0 ? (
//         /* Lista Vacía */
//         <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
//           <Car className="w-12 h-12 text-gray-300" />
//           <p className="font-semibold text-gray-700">
//             No hay viajes programados por el momento
//           </p>
//           <p className="text-xs text-gray-400">
//             Vuelve a consultar más tarde para nuevas salidas.
//           </p>
//         </div>
//       ) : (
//         /* Catálogo de Tarjetas */
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {viajes.map((viaje) => (
//             <div
//               key={viaje.id}
//               className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
//             >
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span
//                     className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
//                       viaje.tipo === 'PRIVADO'
//                         ? 'bg-purple-100 text-purple-800'
//                         : 'bg-amber-100 text-amber-800'
//                     }`}
//                   >
//                     {viaje.tipo}
//                   </span>
//                   <span className="text-xl font-bold text-gray-900">
//                     ${viaje.precio ?? 0}
//                   </span>
//                 </div>

//                 <h2 className="text-lg font-bold text-gray-800 leading-snug">
//                   {viaje.rutaNombre || `Ruta #${viaje.idRuta || 'N/A'}`}
//                 </h2>

//                 <div className="space-y-1.5 text-xs text-gray-600">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="w-4 h-4 text-gray-400" />
//                     <span>
//                       {viaje.fechaHoraInicio
//                         ? new Date(viaje.fechaHoraInicio).toLocaleString(
//                             'es-AR',
//                             {
//                               dateStyle: 'medium',
//                               timeStyle: 'short',
//                             },
//                           )
//                         : 'Sin fecha asignada'}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-4 pt-1">
//                     <div className="flex items-center gap-1.5">
//                       <Users className="w-4 h-4 text-gray-400" />
//                       <span>{viaje.capacidadPasajeros ?? 0} asientos</span>
//                     </div>
//                     <div className="flex items-center gap-1.5">
//                       <Luggage className="w-4 h-4 text-gray-400" />
//                       <span>{viaje.capacidadValijas ?? 0} valijas</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <button
//                 onClick={() => handleVerDetalle(viaje)}
//                 className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
//               >
//                 <Eye className="w-4 h-4" />
//                 Ver detalles y paradas
//               </button>

//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default ViajesPublicosPage;

// import { useState, useEffect } from 'react';
// import { Car, RefreshCw, Eye, Calendar, Users, Luggage } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { viajeService } from '../api/viajeService';
// import { useModalStore } from '../../../store/useModalStore';

// export function ViajesPublicosPage() {
//   const [viajes, setViajes] = useState<Viaje[]>([]);
//   const [cargando, setCargando] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const { openModal } = useModalStore();

//   useEffect(() => {
//     let cancelado = false;

//     const cargarViajesPublicos = async () => {
//       setCargando(true);
//       setError(null);
//       try {
//         const data = await viajeService.obtenerPublicos();
//         if (!cancelado) {
//           setViajes(data);
//         }
//       } catch (err) {
//         if (!cancelado) {
//           setError(
//             err instanceof Error
//               ? err.message
//               : 'Ocurrió un error al cargar los viajes públicos.',
//           );
//         }
//       } finally {
//         if (!cancelado) {
//           setCargando(false);
//         }
//       }
//     };

//     cargarViajesPublicos();

//     return () => {
//       cancelado = true;
//     };
//   }, []);

//   const handleVerDetalle = (viaje: Viaje) => {
//     openModal('DETALLE_VIAJE_PUBLICO', { viaje });
//   };

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
//       {/* Encabezado */}
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             Viajes Disponibles
//           </h1>
//           <p className="text-sm text-gray-500 mt-1">
//             Consulta los traslados y salidas programadas en nuestras rutas
//             habituales.
//           </p>
//         </div>
//       </div>

//       {/* Estado de Carga */}
//       {cargando ? (
//         <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//           <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
//           <p className="text-sm font-medium">Buscando viajes disponibles...</p>
//         </div>
//       ) : error ? (
//         /* Error */
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg text-sm text-red-700">
//           {error}
//         </div>
//       ) : viajes.length === 0 ? (
//         /* Lista Vacía */
//         <div className="p-16 text-center text-gray-500 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
//           <Car className="w-12 h-12 text-gray-300" />
//           <p className="font-semibold text-gray-700">
//             No hay viajes programados por el momento
//           </p>
//           <p className="text-xs text-gray-400">
//             Vuelve a consultar más tarde para nuevas salidas.
//           </p>
//         </div>
//       ) : (
//         /* Catálogo de Tarjetas */
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {viajes.map((viaje) => (
//             <div
//               key={viaje.id}
//               className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
//             >
//               <div className="space-y-3">
//                 <div className="flex items-center justify-between">
//                   <span
//                     className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
//                       viaje.tipo === 'PRIVADO'
//                         ? 'bg-purple-100 text-purple-800'
//                         : 'bg-amber-100 text-amber-800'
//                     }`}
//                   >
//                     {viaje.tipo}
//                   </span>
//                   <span className="text-xl font-bold text-gray-900">
//                     ${viaje.precio ?? 0}
//                   </span>
//                 </div>

//                 <h2 className="text-lg font-bold text-gray-800 leading-snug">
//                   {viaje.rutaNombre || `Ruta #${viaje.idRuta || 'N/A'}`}
//                 </h2>

//                 <div className="space-y-1.5 text-xs text-gray-600">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="w-4 h-4 text-gray-400" />
//                     <span>
//                       {viaje.fechaHoraInicio
//                         ? new Date(viaje.fechaHoraInicio).toLocaleString(
//                             'es-AR',
//                             {
//                               dateStyle: 'medium',
//                               timeStyle: 'short',
//                             },
//                           )
//                         : 'Sin fecha asignada'}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-4 pt-1">
//                     <div className="flex items-center gap-1.5">
//                       <Users className="w-4 h-4 text-gray-400" />
//                       <span>{viaje.capacidadPasajeros ?? 0} asientos</span>
//                     </div>
//                     <div className="flex items-center gap-1.5">
//                       <Luggage className="w-4 h-4 text-gray-400" />
//                       <span>{viaje.capacidadValijas ?? 0} valijas</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <button
//                 onClick={() => handleVerDetalle(viaje)}
//                 className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-sm"
//               >
//                 <Eye className="w-4 h-4" />
//                 Ver Detalles / Reservar
//               </button>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default ViajesPublicosPage;
