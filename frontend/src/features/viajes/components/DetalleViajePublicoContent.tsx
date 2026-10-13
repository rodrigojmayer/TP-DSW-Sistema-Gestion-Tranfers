// src/features/viajes/components/DetalleViajePublicoContent.tsx
import { useNavigate } from 'react-router-dom';
import {
  X,
  Calendar,
  Users,
  Luggage,
  MapPin,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import type { Viaje } from '../../../types';
import { useAuthStore } from '../../../store/authStore';

interface Props {
  viaje: Viaje;
  onClose: () => void;
  onReservar?: (viaje: Viaje) => void;
}

export const DetalleViajePublicoContent = ({
  viaje,
  onClose,
  onReservar,
}: Props) => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Mapeo seguro de Origen
  const origenTexto =
    typeof viaje.origen === 'string'
      ? viaje.origen
      : viaje.origen?.nombre || 'Origen no especificado';

  // Mapeo seguro de Destino
  const destinoTexto =
    typeof viaje.destino === 'string'
      ? viaje.destino
      : viaje.destino?.nombre || 'Destino no especificado';

  // Lista de paradas tipadas
  const listaParadas = viaje.paradas || [];

  const handleAccionReserva = () => {
    onClose();

    if (!isAuthenticated) {
      navigate('/signup', { state: { from: '/viajes', viajeId: viaje.id } });
    } else if (onReservar) {
      onReservar(viaje);
    } else {
      // 🟢 MEJORA: Redirección exacta a la página independiente de reservas (/admin/reservas) pasando el viajeId
      navigate(`/admin/reservas?viajeId=${viaje.id}`);
    }
  };

  return (
    <>
      {/* Encabezado del Modal */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                viaje.tipo === 'PRIVADO'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {viaje.tipo || 'COMPARTIDO'}
            </span>
            <h3 className="text-lg font-bold text-slate-800">
              {viaje.rutaNombre || 'Detalle del Viaje'}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {viaje.fechaHoraInicio
              ? new Date(viaje.fechaHoraInicio).toLocaleString('es-AR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : 'Fecha a confirmar'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Contenido / Itinerario */}
      <div className="p-6 space-y-6 overflow-y-auto grow">
        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <div className="flex justify-center text-slate-400 mb-1">
              <Users className="w-4 h-4" />
            </div>
            <span className="block text-xs text-slate-500">Asientos</span>
            <span className="text-sm font-bold text-slate-800">
              {viaje.capacidadPasajeros ?? 0}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
            <div className="flex justify-center text-slate-400 mb-1">
              <Luggage className="w-4 h-4" />
            </div>
            <span className="block text-xs text-slate-500">Valijas</span>
            <span className="text-sm font-bold text-slate-800">
              {viaje.capacidadValijas ?? 0}
            </span>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
            <div className="flex justify-center text-amber-600 mb-1">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="block text-xs text-amber-700 font-medium">
              Precio
            </span>
            <span className="text-sm font-bold text-amber-900">
              ${viaje.precio ?? 0}
            </span>
          </div>
        </div>

        {/* Sección de Recorrido */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Itinerario del Recorrido
          </h4>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
            {/* Origen */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1 bg-emerald-100 text-emerald-700 rounded-full">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  ORIGEN
                </span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {origenTexto}
                </p>
              </div>
            </div>

            {/* Lista de Paradas tipada sin any */}
            {listaParadas.length > 0 && (
              <div className="pl-3 border-l-2 border-dashed border-slate-200 my-2 space-y-2 ml-3">
                {listaParadas.map((parada, idx) => {
                  let textoParada = `Parada #${idx + 1}`;

                  if (typeof parada === 'string') {
                    textoParada = parada;
                  } else if (parada && typeof parada === 'object') {
                    textoParada =
                      ('nombre' in parada && typeof parada.nombre === 'string'
                        ? parada.nombre
                        : undefined) ||
                      ('direccion' in parada &&
                      typeof parada.direccion === 'string'
                        ? parada.direccion
                        : undefined) ||
                      `Parada #${idx + 1}`;
                  }

                  return (
                    <div
                      key={idx}
                      className="text-xs text-slate-600 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      <span>{textoParada}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Destino */}
            <div className="flex items-start gap-3 pt-1 border-t border-slate-200/60">
              <div className="mt-0.5 p-1 bg-amber-100 text-amber-700 rounded-full">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  DESTINO
                </span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {destinoTexto}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie con botón de Acción */}
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
        >
          Cancelar
        </button>

        <button
          onClick={handleAccionReserva}
          className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer"
        >
          <span>
            {isAuthenticated
              ? 'Reservar este viaje'
              : 'Iniciar sesión para reservar'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
};

// // src/features/viajes/components/DetalleViajePublicoContent.tsx
// import { useNavigate } from 'react-router-dom';
// import {
//   X,
//   Calendar,
//   Users,
//   Luggage,
//   MapPin,
//   DollarSign,
//   ArrowRight,
// } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { useAuthStore } from '../../../store/authStore';

// interface Props {
//   viaje: Viaje;
//   onClose: () => void;
//   onReservar?: (viaje: Viaje) => void;
// }

// export const DetalleViajePublicoContent = ({
//   viaje,
//   onClose,
//   onReservar,
// }: Props) => {
//   const navigate = useNavigate();
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

//   // Mapeo seguro de Origen
//   const origenTexto =
//     typeof viaje.origen === 'string'
//       ? viaje.origen
//       : viaje.origen?.nombre || 'Origen no especificado';

//   // Mapeo seguro de Destino
//   const destinoTexto =
//     typeof viaje.destino === 'string'
//       ? viaje.destino
//       : viaje.destino?.nombre || 'Destino no especificado';

//   // Lista de paradas tipadas
//   const listaParadas = viaje.paradas || [];

//   const handleAccionReserva = () => {
//     onClose();

//     if (!isAuthenticated) {
//       navigate('/signup', { state: { from: '/viajes', viajeId: viaje.id } });
//     } else if (onReservar) {
//       onReservar(viaje);
//     } else {
//       navigate(`/reservas/nueva?viajeId=${viaje.id}`);
//     }
//   };

//   return (
//     <>
//       {/* Encabezado del Modal */}
//       <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
//         <div>
//           <div className="flex items-center gap-2">
//             <span
//               className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
//                 viaje.tipo === 'PRIVADO'
//                   ? 'bg-purple-100 text-purple-800'
//                   : 'bg-amber-100 text-amber-800'
//               }`}
//             >
//               {viaje.tipo || 'COMPARTIDO'}
//             </span>
//             <h3 className="text-lg font-bold text-slate-800">
//               {viaje.rutaNombre || 'Detalle del Viaje'}
//             </h3>
//           </div>
//           <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
//             <Calendar className="w-3.5 h-3.5 text-slate-400" />
//             {viaje.fechaHoraInicio
//               ? new Date(viaje.fechaHoraInicio).toLocaleString('es-AR', {
//                   dateStyle: 'medium',
//                   timeStyle: 'short',
//                 })
//               : 'Fecha a confirmar'}
//           </p>
//         </div>
//         <button
//           onClick={onClose}
//           className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
//           aria-label="Cerrar modal"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Contenido / Itinerario */}
//       <div className="p-6 space-y-6 overflow-y-auto grow">
//         {/* Métricas */}
//         <div className="grid grid-cols-3 gap-3">
//           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-slate-400 mb-1">
//               <Users className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-slate-500">Asientos</span>
//             <span className="text-sm font-bold text-slate-800">
//               {viaje.capacidadPasajeros ?? 0}
//             </span>
//           </div>

//           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-slate-400 mb-1">
//               <Luggage className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-slate-500">Valijas</span>
//             <span className="text-sm font-bold text-slate-800">
//               {viaje.capacidadValijas ?? 0}
//             </span>
//           </div>

//           <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-amber-600 mb-1">
//               <DollarSign className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-amber-700 font-medium">
//               Precio
//             </span>
//             <span className="text-sm font-bold text-amber-900">
//               ${viaje.precio ?? 0}
//             </span>
//           </div>
//         </div>

//         {/* Sección de Recorrido */}
//         <div className="space-y-3">
//           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//             Itinerario del Recorrido
//           </h4>

//           <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
//             {/* Origen */}
//             <div className="flex items-start gap-3">
//               <div className="mt-0.5 p-1 bg-emerald-100 text-emerald-700 rounded-full">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <div>
//                 <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
//                   ORIGEN
//                 </span>
//                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
//                   {origenTexto}
//                 </p>
//               </div>
//             </div>

//             {/* Lista de Paradas tipada sin any */}
//             {listaParadas.length > 0 && (
//               <div className="pl-3 border-l-2 border-dashed border-slate-200 my-2 space-y-2 ml-3">
//                 {listaParadas.map((parada, idx) => {
//                   let textoParada = `Parada #${idx + 1}`;

//                   if (typeof parada === 'string') {
//                     textoParada = parada;
//                   } else if (parada && typeof parada === 'object') {
//                     textoParada =
//                       ('nombre' in parada && typeof parada.nombre === 'string'
//                         ? parada.nombre
//                         : undefined) ||
//                       ('direccion' in parada &&
//                       typeof parada.direccion === 'string'
//                         ? parada.direccion
//                         : undefined) ||
//                       `Parada #${idx + 1}`;
//                   }

//                   return (
//                     <div
//                       key={idx}
//                       className="text-xs text-slate-600 flex items-center gap-2"
//                     >
//                       <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
//                       <span>{textoParada}</span>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}

//             {/* Destino */}
//             <div className="flex items-start gap-3 pt-1 border-t border-slate-200/60">
//               <div className="mt-0.5 p-1 bg-amber-100 text-amber-700 rounded-full">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <div>
//                 <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
//                   DESTINO
//                 </span>
//                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
//                   {destinoTexto}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Pie con botón de Acción */}
//       <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
//         <button
//           onClick={onClose}
//           className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
//         >
//           Cancelar
//         </button>

//         <button
//           onClick={handleAccionReserva}
//           className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer"
//         >
//           <span>
//             {isAuthenticated
//               ? 'Reservar este viaje'
//               : 'Iniciar sesión para reservar'}
//           </span>
//           <ArrowRight className="w-4 h-4" />
//         </button>
//       </div>
//     </>
//   );
// };

// // src/features/viajes/components/DetalleViajePublicoContent.tsx
// import { useNavigate } from 'react-router-dom';
// import {
//   X,
//   Calendar,
//   Users,
//   Luggage,
//   MapPin,
//   DollarSign,
//   ArrowRight,
// } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { useAuthStore } from '../../../store/authStore';

// interface Props {
//   viaje: Viaje;
//   onClose: () => void;
//   onReservar?: (viaje: Viaje) => void;
// }

// export const DetalleViajePublicoContent = ({
//   viaje,
//   onClose,
//   onReservar,
// }: Props) => {
//   const navigate = useNavigate();
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

//   // Mapeo seguro de Origen y Destino
//   const origenTexto =
//     typeof viaje.origen === 'string'
//       ? viaje.origen
//       : viaje.origen?.nombre || 'Origen no especificado';

//   const destinoTexto =
//     typeof viaje.destino === 'string'
//       ? viaje.destino
//       : viaje.destino?.nombre || 'Destino no especificado';

//   // Lógica unificada y limpia del botón Reservar
//   const handleAccionReserva = () => {
//     onClose();

//     if (!isAuthenticated) {
//       // Redirige al registro/login conservando el ID del viaje seleccionado
//       navigate('/signup', { state: { from: '/viajes', viajeId: viaje.id } });
//     } else if (onReservar) {
//       onReservar(viaje);
//     } else {
//       navigate(`/reservas/nueva?viajeId=${viaje.id}`);
//     }
//   };

//   return (
//     <>
//       {/* Encabezado del Content */}
//       <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
//         <div>
//           <div className="flex items-center gap-2">
//             <span
//               className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
//                 viaje.tipo === 'PRIVADO'
//                   ? 'bg-purple-100 text-purple-800'
//                   : 'bg-amber-100 text-amber-800'
//               }`}
//             >
//               {viaje.tipo || 'COMPARTIDO'}
//             </span>
//             <h3 className="text-lg font-bold text-slate-800">
//               {viaje.rutaNombre || 'Detalle del Viaje'}
//             </h3>
//           </div>
//           <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
//             <Calendar className="w-3.5 h-3.5 text-slate-400" />
//             {viaje.fechaHoraInicio
//               ? new Date(viaje.fechaHoraInicio).toLocaleString('es-AR', {
//                   dateStyle: 'medium',
//                   timeStyle: 'short',
//                 })
//               : 'Fecha a confirmar'}
//           </p>
//         </div>
//         <button
//           onClick={onClose}
//           className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
//           aria-label="Cerrar modal"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Cuerpo del Content (Contenido desplazable) */}
//       <div className="p-6 space-y-6 overflow-y-auto grow">
//         {/* Fichas de Capacidad y Tarifa */}
//         <div className="grid grid-cols-3 gap-3">
//           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-slate-400 mb-1">
//               <Users className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-slate-500">Asientos</span>
//             <span className="text-sm font-bold text-slate-800">
//               {viaje.capacidadPasajeros ?? 0}
//             </span>
//           </div>

//           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-slate-400 mb-1">
//               <Luggage className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-slate-500">Valijas</span>
//             <span className="text-sm font-bold text-slate-800">
//               {viaje.capacidadValijas ?? 0}
//             </span>
//           </div>

//           <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-amber-600 mb-1">
//               <DollarSign className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-amber-700 font-medium">
//               Precio
//             </span>
//             <span className="text-sm font-bold text-amber-900">
//               ${viaje.precio ?? 0}
//             </span>
//           </div>
//         </div>

//         {/* Recorrido / Itinerario */}
//         <div className="space-y-3">
//           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//             Itinerario del Recorrido
//           </h4>

//           <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
//             {/* Punto de Origen */}
//             <div className="flex items-start gap-3">
//               <div className="mt-0.5 p-1 bg-emerald-100 text-emerald-700 rounded-full">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <div>
//                 <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
//                   ORIGEN
//                 </span>
//                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
//                   {origenTexto}
//                 </p>
//               </div>
//             </div>

//             {/* Paradas Intermedias */}
//             {viaje.paradas && viaje.paradas.length > 0 && (
//               <div className="pl-3 border-l-2 border-dashed border-slate-200 my-2 space-y-2 ml-3">
//                 {viaje.paradas.map((parada, idx) => (
//                   <div
//                     key={idx}
//                     className="text-xs text-slate-600 flex items-center gap-2"
//                   >
//                     <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
//                     <span>
//                       {typeof parada === 'string' ? parada : parada.nombre}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Punto de Destino */}
//             <div className="flex items-start gap-3 pt-1 border-t border-slate-200/60">
//               <div className="mt-0.5 p-1 bg-amber-100 text-amber-700 rounded-full">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <div>
//                 <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
//                   DESTINO
//                 </span>
//                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
//                   {destinoTexto}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Pie del Content */}
//       <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
//         <button
//           onClick={onClose}
//           className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
//         >
//           Cancelar
//         </button>

//         <button
//           onClick={handleAccionReserva}
//           className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer"
//         >
//           <span>
//             {isAuthenticated
//               ? 'Reservar este viaje'
//               : 'Iniciar sesión para reservar'}
//           </span>
//           <ArrowRight className="w-4 h-4" />
//         </button>
//       </div>
//     </>
//   );
// };

// // prueba

// // src/features/viajes/components/DetalleViajePublicoContent.tsx
// import { useNavigate } from 'react-router-dom';
// import {
//   X,
//   Calendar,
//   Users,
//   Luggage,
//   MapPin,
//   DollarSign,
//   ArrowRight,
// } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { useAuthStore } from '../../../store/authStore';

// interface Props {
//   viaje: Viaje;
//   onClose: () => void;
//   onReservar?: (viaje: Viaje) => void;
// }

// export const DetalleViajePublicoContent = ({
//   viaje,
//   onClose,
//   onReservar,
// }: Props) => {
//   const navigate = useNavigate();
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

//   // Mapeo seguro de Origen y Destino
//   const origenTexto =
//     typeof viaje.origen === 'string'
//       ? viaje.origen
//       : viaje.origen?.nombre || 'Origen no especificado';

//   const destinoTexto =
//     typeof viaje.destino === 'string'
//       ? viaje.destino
//       : viaje.destino?.nombre || 'Destino no especificado';

//   // Lógica del botón Reservar

//     const handleAccionReserva = () => {
//       onClose();

//       if (!isAuthenticated) {
//         // Redirige al registro/login conservando el ID del viaje seleccionado
//         navigate('/signup', { state: { from: '/viajes', viajeId: viaje.id } });
//       } else if (onReservar) {
//         onReservar(viaje);
//       } else {
//         navigate(`/reservas/nueva?viajeId=${viaje.id}`);
//       }
//     };

//     // if (!isAuthenticated) {
//     //   // Redirige al usuario no logueado al registro guardando el destino deseado
//     //   navigate('/signup', { state: { from: '/viajes', viajeId: viaje.id } });
//     // } else if (onReservar) {
//     //   onReservar(viaje);
//     // } else {
//     //   // Flujo directo a nueva reserva para el usuario autenticado
//     //   navigate(`/reservas/nueva?viajeId=${viaje.id}`);
//     // }

//   return (
//     <>
//       {/* Encabezado del Content */}
//       <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
//         <div>
//           <div className="flex items-center gap-2">
//             <span
//               className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
//                 viaje.tipo === 'PRIVADO'
//                   ? 'bg-purple-100 text-purple-800'
//                   : 'bg-amber-100 text-amber-800'
//               }`}
//             >
//               {viaje.tipo || 'COMPARTIDO'}
//             </span>
//             <h3 className="text-lg font-bold text-slate-800">
//               {viaje.rutaNombre || 'Detalle del Viaje'}
//             </h3>
//           </div>
//           <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
//             <Calendar className="w-3.5 h-3.5 text-slate-400" />
//             {viaje.fechaHoraInicio
//               ? new Date(viaje.fechaHoraInicio).toLocaleString('es-AR', {
//                   dateStyle: 'medium',
//                   timeStyle: 'short',
//                 })
//               : 'Fecha a confirmar'}
//           </p>
//         </div>
//         <button
//           onClick={onClose}
//           className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
//           aria-label="Cerrar modal"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Cuerpo del Content (Contenido desplazable) */}
//       <div className="p-6 space-y-6 overflow-y-auto grow">
//         {/* Fichas de Capacidad y Tarifa */}
//         <div className="grid grid-cols-3 gap-3">
//           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-slate-400 mb-1">
//               <Users className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-slate-500">Asientos</span>
//             <span className="text-sm font-bold text-slate-800">
//               {viaje.capacidadPasajeros ?? 0}
//             </span>
//           </div>

//           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-slate-400 mb-1">
//               <Luggage className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-slate-500">Valijas</span>
//             <span className="text-sm font-bold text-slate-800">
//               {viaje.capacidadValijas ?? 0}
//             </span>
//           </div>

//           <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-amber-600 mb-1">
//               <DollarSign className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-amber-700 font-medium">
//               Precio
//             </span>
//             <span className="text-sm font-bold text-amber-900">
//               ${viaje.precio ?? 0}
//             </span>
//           </div>
//         </div>

//         {/* Recorrido / Itinerario */}
//         <div className="space-y-3">
//           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//             Itinerario del Recorrido
//           </h4>

//           <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
//             {/* Punto de Origen */}
//             <div className="flex items-start gap-3">
//               <div className="mt-0.5 p-1 bg-emerald-100 text-emerald-700 rounded-full">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <div>
//                 <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
//                   ORIGEN
//                 </span>
//                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
//                   {origenTexto}
//                 </p>
//               </div>
//             </div>

//             {/* Paradas Intermedias */}
//             {viaje.paradas && viaje.paradas.length > 0 && (
//               <div className="pl-3 border-l-2 border-dashed border-slate-200 my-2 space-y-2 ml-3">
//                 {viaje.paradas.map((parada, idx) => (
//                   <div
//                     key={idx}
//                     className="text-xs text-slate-600 flex items-center gap-2"
//                   >
//                     <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
//                     <span>
//                       {typeof parada === 'string' ? parada : parada.nombre}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Punto de Destino */}
//             <div className="flex items-start gap-3 pt-1 border-t border-slate-200/60">
//               <div className="mt-0.5 p-1 bg-amber-100 text-amber-700 rounded-full">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <div>
//                 <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
//                   DESTINO
//                 </span>
//                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
//                   {destinoTexto}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Pie del Content */}
//       <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
//         <button
//           onClick={onClose}
//           className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
//         >
//           Cancelar
//         </button>

//         <button
//           onClick={handleAccionReserva}
//           className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer"
//         >
//           <span>
//             {isAuthenticated
//               ? 'Reservar este viaje'
//               : 'Iniciar sesión para reservar'}
//           </span>
//           <ArrowRight className="w-4 h-4" />
//         </button>

//         {/* <button
//           onClick={handleAccionReserva}
//           className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer"
//         >
//           <span>Reservar este viaje</span>
//           <ArrowRight className="w-4 h-4" />
//         </button> */}
//       </div>
//     </>
//   );
// };

// // DetalleViajePublicoContent.tsx reemplazo detalleviajepublico modal

// import { useNavigate } from 'react-router-dom';
// import {
//   X,
//   Calendar,
//   Users,
//   Luggage,
//   MapPin,
//   DollarSign,
//   ArrowRight,
// } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { useAuthStore } from '../../../store/authStore';

// interface Props {
//   viaje: Viaje;
//   onClose: () => void;
//   onReservar?: (viaje: Viaje) => void;
// }

// export const DetalleViajePublicoContent = ({
//   viaje,
//   onClose,
//   onReservar,
// }: Props) => {
//   const navigate = useNavigate();
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

//   // Mapeo seguro de Origen y Destino
//   const origenTexto =
//     typeof viaje.origen === 'string'
//       ? viaje.origen
//       : viaje.origen?.nombre || 'Origen no especificado';

//   const destinoTexto =
//     typeof viaje.destino === 'string'
//       ? viaje.destino
//       : viaje.destino?.nombre || 'Destino no especificado';

//   // Lógica del botón Reservar
//   const handleAccionReserva = () => {
//     onClose();

//     if (!isAuthenticated) {
//       // Redirige al usuario no logueado al registro guardando el destino deseado
//       navigate('/signup', { state: { from: '/viajes', viajeId: viaje.id } });
//     } else if (onReservar) {
//       onReservar(viaje);
//     } else {
//       // Flujo directo a nueva reserva para el usuario autenticado
//       navigate(`/reservas/nueva?viajeId=${viaje.id}`);
//     }
//   };

//   return (
//     <>
//       {/* Encabezado del Modal */}
//       <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
//         <div>
//           <div className="flex items-center gap-2">
//             <span
//               className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
//                 viaje.tipo === 'PRIVADO'
//                   ? 'bg-purple-100 text-purple-800'
//                   : 'bg-amber-100 text-amber-800'
//               }`}
//             >
//               {viaje.tipo || 'COMPARTIDO'}
//             </span>
//             <h3 className="text-lg font-bold text-slate-800">
//               {viaje.rutaNombre || 'Detalle del Viaje'}
//             </h3>
//           </div>
//           <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
//             <Calendar className="w-3.5 h-3.5 text-slate-400" />
//             {viaje.fechaHoraInicio
//               ? new Date(viaje.fechaHoraInicio).toLocaleString('es-AR', {
//                   dateStyle: 'medium',
//                   timeStyle: 'short',
//                 })
//               : 'Fecha a confirmar'}
//           </p>
//         </div>
//         <button
//           onClick={onClose}
//           className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
//           aria-label="Cerrar modal"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Cuerpo del Modal (Contenido desplazable) */}
//       <div className="p-6 space-y-6 overflow-y-auto grow">
//         {/* Fichas de Capacidad y Tarifa */}
//         <div className="grid grid-cols-3 gap-3">
//           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-slate-400 mb-1">
//               <Users className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-slate-500">Asientos</span>
//             <span className="text-sm font-bold text-slate-800">
//               {viaje.capacidadPasajeros ?? 0}
//             </span>
//           </div>

//           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-slate-400 mb-1">
//               <Luggage className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-slate-500">Valijas</span>
//             <span className="text-sm font-bold text-slate-800">
//               {viaje.capacidadValijas ?? 0}
//             </span>
//           </div>

//           <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-amber-600 mb-1">
//               <DollarSign className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-amber-700 font-medium">
//               Precio
//             </span>
//             <span className="text-sm font-bold text-amber-900">
//               ${viaje.precio ?? 0}
//             </span>
//           </div>
//         </div>

//         {/* Recorrido / Itinerario */}
//         <div className="space-y-3">
//           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//             Itinerario del Recorrido
//           </h4>

//           <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
//             {/* Punto de Origen */}
//             <div className="flex items-start gap-3">
//               <div className="mt-0.5 p-1 bg-emerald-100 text-emerald-700 rounded-full">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <div>
//                 <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
//                   ORIGEN
//                 </span>
//                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
//                   {origenTexto}
//                 </p>
//               </div>
//             </div>

//             {/* Paradas Intermedias */}
//             {viaje.paradas && viaje.paradas.length > 0 && (
//               <div className="pl-3 border-l-2 border-dashed border-slate-200 my-2 space-y-2 ml-3">
//                 {viaje.paradas.map((parada, idx) => (
//                   <div
//                     key={idx}
//                     className="text-xs text-slate-600 flex items-center gap-2"
//                   >
//                     <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
//                     <span>
//                       {typeof parada === 'string' ? parada : parada.nombre}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Punto de Destino */}
//             <div className="flex items-start gap-3 pt-1 border-t border-slate-200/60">
//               <div className="mt-0.5 p-1 bg-amber-100 text-amber-700 rounded-full">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <div>
//                 <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
//                   DESTINO
//                 </span>
//                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
//                   {destinoTexto}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Pie del Modal */}
//       <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
//         <button
//           onClick={onClose}
//           className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
//         >
//           Cancelar
//         </button>
//         <button
//           onClick={handleAccionReserva}
//           className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer"
//         >
//           <span>Reservar este viaje</span>
//           <ArrowRight className="w-4 h-4" />
//         </button>
//       </div>
//     </>
//   );
// };

// // prueba

// // src/features/viajes/components/DetalleViajePublicoContent.tsx
// import { useNavigate } from 'react-router-dom';
// import {
//   X,
//   Calendar,
//   Users,
//   Luggage,
//   MapPin,
//   DollarSign,
//   ArrowRight,
// } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { useAuthStore } from '../../../store/authStore';

// interface Props {
//   viaje: Viaje;
//   onClose: () => void;
//   onReservar?: (viaje: Viaje) => void;
// }

// export const DetalleViajePublicoContent = ({
//   viaje,
//   onClose,
//   onReservar,
// }: Props) => {
//   const navigate = useNavigate();
//   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

//   // Mapeo seguro de Origen y Destino
//   const origenTexto =
//     typeof viaje.origen === 'string'
//       ? viaje.origen
//       : viaje.origen?.nombre || 'Origen no especificado';

//   const destinoTexto =
//     typeof viaje.destino === 'string'
//       ? viaje.destino
//       : viaje.destino?.nombre || 'Destino no especificado';

//   // Lógica del botón Reservar

//     const handleAccionReserva = () => {
//       onClose();

//       if (!isAuthenticated) {
//         // Redirige al registro/login conservando el ID del viaje seleccionado
//         navigate('/signup', { state: { from: '/viajes', viajeId: viaje.id } });
//       } else if (onReservar) {
//         onReservar(viaje);
//       } else {
//         navigate(`/reservas/nueva?viajeId=${viaje.id}`);
//       }
//     };

//     // if (!isAuthenticated) {
//     //   // Redirige al usuario no logueado al registro guardando el destino deseado
//     //   navigate('/signup', { state: { from: '/viajes', viajeId: viaje.id } });
//     // } else if (onReservar) {
//     //   onReservar(viaje);
//     // } else {
//     //   // Flujo directo a nueva reserva para el usuario autenticado
//     //   navigate(`/reservas/nueva?viajeId=${viaje.id}`);
//     // }

//   return (
//     <>
//       {/* Encabezado del Content */}
//       <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
//         <div>
//           <div className="flex items-center gap-2">
//             <span
//               className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
//                 viaje.tipo === 'PRIVADO'
//                   ? 'bg-purple-100 text-purple-800'
//                   : 'bg-amber-100 text-amber-800'
//               }`}
//             >
//               {viaje.tipo || 'COMPARTIDO'}
//             </span>
//             <h3 className="text-lg font-bold text-slate-800">
//               {viaje.rutaNombre || 'Detalle del Viaje'}
//             </h3>
//           </div>
//           <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
//             <Calendar className="w-3.5 h-3.5 text-slate-400" />
//             {viaje.fechaHoraInicio
//               ? new Date(viaje.fechaHoraInicio).toLocaleString('es-AR', {
//                   dateStyle: 'medium',
//                   timeStyle: 'short',
//                 })
//               : 'Fecha a confirmar'}
//           </p>
//         </div>
//         <button
//           onClick={onClose}
//           className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
//           aria-label="Cerrar modal"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Cuerpo del Content (Contenido desplazable) */}
//       <div className="p-6 space-y-6 overflow-y-auto grow">
//         {/* Fichas de Capacidad y Tarifa */}
//         <div className="grid grid-cols-3 gap-3">
//           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-slate-400 mb-1">
//               <Users className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-slate-500">Asientos</span>
//             <span className="text-sm font-bold text-slate-800">
//               {viaje.capacidadPasajeros ?? 0}
//             </span>
//           </div>

//           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-slate-400 mb-1">
//               <Luggage className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-slate-500">Valijas</span>
//             <span className="text-sm font-bold text-slate-800">
//               {viaje.capacidadValijas ?? 0}
//             </span>
//           </div>

//           <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
//             <div className="flex justify-center text-amber-600 mb-1">
//               <DollarSign className="w-4 h-4" />
//             </div>
//             <span className="block text-xs text-amber-700 font-medium">
//               Precio
//             </span>
//             <span className="text-sm font-bold text-amber-900">
//               ${viaje.precio ?? 0}
//             </span>
//           </div>
//         </div>

//         {/* Recorrido / Itinerario */}
//         <div className="space-y-3">
//           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
//             Itinerario del Recorrido
//           </h4>

//           <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
//             {/* Punto de Origen */}
//             <div className="flex items-start gap-3">
//               <div className="mt-0.5 p-1 bg-emerald-100 text-emerald-700 rounded-full">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <div>
//                 <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
//                   ORIGEN
//                 </span>
//                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
//                   {origenTexto}
//                 </p>
//               </div>
//             </div>

//             {/* Paradas Intermedias */}
//             {viaje.paradas && viaje.paradas.length > 0 && (
//               <div className="pl-3 border-l-2 border-dashed border-slate-200 my-2 space-y-2 ml-3">
//                 {viaje.paradas.map((parada, idx) => (
//                   <div
//                     key={idx}
//                     className="text-xs text-slate-600 flex items-center gap-2"
//                   >
//                     <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
//                     <span>
//                       {typeof parada === 'string' ? parada : parada.nombre}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             )}

//             {/* Punto de Destino */}
//             <div className="flex items-start gap-3 pt-1 border-t border-slate-200/60">
//               <div className="mt-0.5 p-1 bg-amber-100 text-amber-700 rounded-full">
//                 <MapPin className="w-4 h-4" />
//               </div>
//               <div>
//                 <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
//                   DESTINO
//                 </span>
//                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
//                   {destinoTexto}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Pie del Content */}
//       <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
//         <button
//           onClick={onClose}
//           className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
//         >
//           Cancelar
//         </button>

//         <button
//           onClick={handleAccionReserva}
//           className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer"
//         >
//           <span>
//             {isAuthenticated
//               ? 'Reservar este viaje'
//               : 'Iniciar sesión para reservar'}
//           </span>
//           <ArrowRight className="w-4 h-4" />
//         </button>

//         {/* <button
//           onClick={handleAccionReserva}
//           className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer"
//         >
//           <span>Reservar este viaje</span>
//           <ArrowRight className="w-4 h-4" />
//         </button> */}
//       </div>
//     </>
//   );
// };

// // // DetalleViajePublicoContent.tsx reemplazo detalleviajepublico modal

// // import { useNavigate } from 'react-router-dom';
// // import {
// //   X,
// //   Calendar,
// //   Users,
// //   Luggage,
// //   MapPin,
// //   DollarSign,
// //   ArrowRight,
// // } from 'lucide-react';
// // import type { Viaje } from '../../../types';
// // import { useAuthStore } from '../../../store/authStore';

// // interface Props {
// //   viaje: Viaje;
// //   onClose: () => void;
// //   onReservar?: (viaje: Viaje) => void;
// // }

// // export const DetalleViajePublicoContent = ({
// //   viaje,
// //   onClose,
// //   onReservar,
// // }: Props) => {
// //   const navigate = useNavigate();
// //   const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

// //   // Mapeo seguro de Origen y Destino
// //   const origenTexto =
// //     typeof viaje.origen === 'string'
// //       ? viaje.origen
// //       : viaje.origen?.nombre || 'Origen no especificado';

// //   const destinoTexto =
// //     typeof viaje.destino === 'string'
// //       ? viaje.destino
// //       : viaje.destino?.nombre || 'Destino no especificado';

// //   // Lógica del botón Reservar
// //   const handleAccionReserva = () => {
// //     onClose();

// //     if (!isAuthenticated) {
// //       // Redirige al usuario no logueado al registro guardando el destino deseado
// //       navigate('/signup', { state: { from: '/viajes', viajeId: viaje.id } });
// //     } else if (onReservar) {
// //       onReservar(viaje);
// //     } else {
// //       // Flujo directo a nueva reserva para el usuario autenticado
// //       navigate(`/reservas/nueva?viajeId=${viaje.id}`);
// //     }
// //   };

// //   return (
// //     <>
// //       {/* Encabezado del Modal */}
// //       <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
// //         <div>
// //           <div className="flex items-center gap-2">
// //             <span
// //               className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
// //                 viaje.tipo === 'PRIVADO'
// //                   ? 'bg-purple-100 text-purple-800'
// //                   : 'bg-amber-100 text-amber-800'
// //               }`}
// //             >
// //               {viaje.tipo || 'COMPARTIDO'}
// //             </span>
// //             <h3 className="text-lg font-bold text-slate-800">
// //               {viaje.rutaNombre || 'Detalle del Viaje'}
// //             </h3>
// //           </div>
// //           <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
// //             <Calendar className="w-3.5 h-3.5 text-slate-400" />
// //             {viaje.fechaHoraInicio
// //               ? new Date(viaje.fechaHoraInicio).toLocaleString('es-AR', {
// //                   dateStyle: 'medium',
// //                   timeStyle: 'short',
// //                 })
// //               : 'Fecha a confirmar'}
// //           </p>
// //         </div>
// //         <button
// //           onClick={onClose}
// //           className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
// //           aria-label="Cerrar modal"
// //         >
// //           <X className="w-5 h-5" />
// //         </button>
// //       </div>

// //       {/* Cuerpo del Modal (Contenido desplazable) */}
// //       <div className="p-6 space-y-6 overflow-y-auto grow">
// //         {/* Fichas de Capacidad y Tarifa */}
// //         <div className="grid grid-cols-3 gap-3">
// //           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
// //             <div className="flex justify-center text-slate-400 mb-1">
// //               <Users className="w-4 h-4" />
// //             </div>
// //             <span className="block text-xs text-slate-500">Asientos</span>
// //             <span className="text-sm font-bold text-slate-800">
// //               {viaje.capacidadPasajeros ?? 0}
// //             </span>
// //           </div>

// //           <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
// //             <div className="flex justify-center text-slate-400 mb-1">
// //               <Luggage className="w-4 h-4" />
// //             </div>
// //             <span className="block text-xs text-slate-500">Valijas</span>
// //             <span className="text-sm font-bold text-slate-800">
// //               {viaje.capacidadValijas ?? 0}
// //             </span>
// //           </div>

// //           <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
// //             <div className="flex justify-center text-amber-600 mb-1">
// //               <DollarSign className="w-4 h-4" />
// //             </div>
// //             <span className="block text-xs text-amber-700 font-medium">
// //               Precio
// //             </span>
// //             <span className="text-sm font-bold text-amber-900">
// //               ${viaje.precio ?? 0}
// //             </span>
// //           </div>
// //         </div>

// //         {/* Recorrido / Itinerario */}
// //         <div className="space-y-3">
// //           <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
// //             Itinerario del Recorrido
// //           </h4>

// //           <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
// //             {/* Punto de Origen */}
// //             <div className="flex items-start gap-3">
// //               <div className="mt-0.5 p-1 bg-emerald-100 text-emerald-700 rounded-full">
// //                 <MapPin className="w-4 h-4" />
// //               </div>
// //               <div>
// //                 <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
// //                   ORIGEN
// //                 </span>
// //                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
// //                   {origenTexto}
// //                 </p>
// //               </div>
// //             </div>

// //             {/* Paradas Intermedias */}
// //             {viaje.paradas && viaje.paradas.length > 0 && (
// //               <div className="pl-3 border-l-2 border-dashed border-slate-200 my-2 space-y-2 ml-3">
// //                 {viaje.paradas.map((parada, idx) => (
// //                   <div
// //                     key={idx}
// //                     className="text-xs text-slate-600 flex items-center gap-2"
// //                   >
// //                     <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
// //                     <span>
// //                       {typeof parada === 'string' ? parada : parada.nombre}
// //                     </span>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}

// //             {/* Punto de Destino */}
// //             <div className="flex items-start gap-3 pt-1 border-t border-slate-200/60">
// //               <div className="mt-0.5 p-1 bg-amber-100 text-amber-700 rounded-full">
// //                 <MapPin className="w-4 h-4" />
// //               </div>
// //               <div>
// //                 <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
// //                   DESTINO
// //                 </span>
// //                 <p className="text-sm font-semibold text-slate-800 mt-0.5">
// //                   {destinoTexto}
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Pie del Modal */}
// //       <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
// //         <button
// //           onClick={onClose}
// //           className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
// //         >
// //           Cancelar
// //         </button>
// //         <button
// //           onClick={handleAccionReserva}
// //           className="px-5 py-2 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer"
// //         >
// //           <span>Reservar este viaje</span>
// //           <ArrowRight className="w-4 h-4" />
// //         </button>
// //       </div>
// //     </>
// //   );
// // };
