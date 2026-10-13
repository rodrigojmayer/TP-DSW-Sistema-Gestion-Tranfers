// src/features/viajes/components/ViajesTabla.tsx
import type { Viaje, Ruta, Usuario } from '../../../types';

interface ViajesTablaProps {
  viajes: Viaje[];
  rutasDisponibles: Ruta[];
  choferesDisponibles: Usuario[];
  cargando: boolean;
  esAdmin: boolean;
  usuarioId?: string;
  rolUsuario?: string; // 👈 Agregamos el rol para validarlo en la tabla
  onSeleccionarViaje: (viaje: Viaje) => void;
  onEditar?: (viaje: Viaje) => void;
  onEliminar?: (id: string) => void;
}

export const ViajesTabla = ({
  viajes,
  rutasDisponibles,
  choferesDisponibles,
  cargando,
  esAdmin,
  usuarioId,
  rolUsuario,
  onSeleccionarViaje,
  onEditar,
  onEliminar,
}: ViajesTablaProps) => {
  const obtenerNombreRuta = (viaje: Viaje) => {
    if (viaje.rutaNombre) return viaje.rutaNombre;

    if (typeof viaje.ruta === 'object' && viaje.ruta !== null) {
      const rutaObj = viaje.ruta as {
        origen?: string | { nombre?: string };
        destino?: string | { nombre?: string };
        nombre?: string;
      };

      if (rutaObj.origen && rutaObj.destino) {
        const origenNombre =
          typeof rutaObj.origen === 'object' && rutaObj.origen !== null
            ? rutaObj.origen.nombre || 'Origen'
            : rutaObj.origen;

        const destinoNombre =
          typeof rutaObj.destino === 'object' && rutaObj.destino !== null
            ? rutaObj.destino.nombre || 'Destino'
            : rutaObj.destino;

        return `${origenNombre} ➔ ${destinoNombre}`;
      }
      if (rutaObj.nombre) return rutaObj.nombre;
    }
    const r = rutasDisponibles.find((item) => item.idRuta === viaje.idRuta);
    return r ? r.nombre : 'Ruta no asignada';
  };

  const obtenerNombreChofer = (idChofer?: string) => {
    if (!idChofer) return 'Sin chofer';
    const c = choferesDisponibles.find((item) => item.idUsuario === idChofer);
    return c ? `${c.nombre} ${c.apellido}` : 'Sin chofer';
  };

  return (
    <div
      className={`${esAdmin ? 'xl:col-span-2' : 'w-full'} bg-white p-6 rounded-lg border border-slate-200 shadow-sm`}
    >
      <h2 className="text-lg font-bold text-slate-800 mb-4">
        {esAdmin ? 'Gestión de Viajes Programados' : 'Viajes Disponibles'}
      </h2>

      {cargando ? (
        <p className="text-sm text-slate-500 flex items-center gap-2">
          <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
          Cargando viajes...
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
              <tr>
                <th className="py-3 px-4">Ruta</th>
                <th className="py-3 px-4">Chofer</th>
                <th className="py-3 px-3">Salida</th>
                <th className="py-3 px-3">Llegada</th>
                <th className="py-3 px-3 text-center">Pasajeros</th>
                <th className="py-3 px-3 text-center">Valijas</th>
                <th className="py-3 px-3">Precio</th>
                <th className="py-3 px-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {viajes.map((viaje) => {
                // 🟢 Validación tipada y segura para TypeScript
                const usuarioYaReservo =
                  Boolean(usuarioId) &&
                  ((viaje.reservas &&
                    Array.isArray(viaje.reservas) &&
                    viaje.reservas.some((reserva: Record<string, unknown>) => {
                      const resUsuario = reserva.usuario as
                        | Record<string, unknown>
                        | string
                        | undefined;
                      const resIdUsuario =
                        (reserva.idUsuario as string) ||
                        (reserva.idCliente as string);

                      const idReservaUsuario =
                        typeof resUsuario === 'object' && resUsuario !== null
                          ? (resUsuario.id as string) ||
                            (resUsuario.idUsuario as string) ||
                            (resUsuario._id as string)
                          : resUsuario;

                      return (
                        String(idReservaUsuario) === String(usuarioId) ||
                        String(resIdUsuario) === String(usuarioId)
                      );
                    })) ||
                    (!esAdmin && rolUsuario?.toUpperCase() === 'CLIENTE'));

                const esCompartido = viaje.tipo?.toUpperCase() === 'COMPARTIDO';

                return (
                  <tr
                    key={viaje.id}
                    onClick={() => onSeleccionarViaje(viaje)}
                    className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
                      {obtenerNombreRuta(viaje)}
                    </td>
                    <td className="py-3 px-4">
                      {viaje.idChofer
                        ? obtenerNombreChofer(viaje.idChofer)
                        : 'Sin chofer'}
                    </td>
                    <td className="py-3 px-3 text-xs whitespace-nowrap">
                      {viaje.fechaHoraInicio
                        ? new Date(viaje.fechaHoraInicio).toLocaleString()
                        : '-'}
                    </td>
                    <td className="py-3 px-3 text-xs whitespace-nowrap">
                      {viaje.fechaHoraFin
                        ? new Date(viaje.fechaHoraFin).toLocaleString()
                        : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">
                      {viaje.capacidadPasajeros ?? '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">
                      {viaje.capacidadValijas ?? '-'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      ${viaje.precio}
                    </td>

                    <td
                      className="py-3 px-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {esAdmin ? (
                        <div className="flex justify-end gap-2">
                          {onEditar && (
                            <button
                              onClick={() => onEditar(viaje)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-xs transition"
                            >
                              Editar
                            </button>
                          )}
                          {onEliminar && (
                            <button
                              onClick={() => onEliminar(viaje.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-xs transition"
                            >
                              Cancelar
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end items-center gap-2">
                          <button
                            onClick={() => onSeleccionarViaje(viaje)}
                            className="text-slate-500 hover:text-slate-800 font-medium text-xs px-2 py-1 transition flex items-center gap-1"
                            title="Ver detalles"
                          >
                            👁️ Detalle
                          </button>

                          {esCompartido ? (
                            usuarioYaReservo ? (
                              <span className="text-[11px] font-semibold px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                                ✓ Reservado
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                                Disponible
                              </span>
                            )
                          ) : (
                            <span className="text-[11px] font-medium px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
                              Privado
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// // src/features/viajes/components/ViajesTabla.tsx
// import type { Viaje, Ruta, Usuario } from '../../../types';

// interface ViajesTablaProps {
//   viajes: Viaje[];
//   rutasDisponibles: Ruta[];
//   choferesDisponibles: Usuario[];
//   cargando: boolean;
//   esAdmin: boolean;
//   usuarioId?: string;
//   onSeleccionarViaje: (viaje: Viaje) => void;
//   onEditar?: (viaje: Viaje) => void;
//   onEliminar?: (id: string) => void;
// }

// export const ViajesTabla = ({
//   viajes,
//   rutasDisponibles,
//   choferesDisponibles,
//   cargando,
//   esAdmin,
//   usuarioId,
//   onSeleccionarViaje,
//   onEditar,
//   onEliminar,
// }: ViajesTablaProps) => {

//   const obtenerNombreRuta = (viaje: Viaje) => {
//     if (viaje.rutaNombre) return viaje.rutaNombre;

//     if (typeof viaje.ruta === 'object' && viaje.ruta !== null) {
//       const rutaObj = viaje.ruta as {
//         origen?: string | { nombre?: string };
//         destino?: string | { nombre?: string };
//         nombre?: string;
//       };

//       if (rutaObj.origen && rutaObj.destino) {
//         const origenNombre =
//           typeof rutaObj.origen === 'object' && rutaObj.origen !== null
//             ? rutaObj.origen.nombre || 'Origen'
//             : rutaObj.origen;

//         const destinoNombre =
//           typeof rutaObj.destino === 'object' && rutaObj.destino !== null
//             ? rutaObj.destino.nombre || 'Destino'
//             : rutaObj.destino;

//         return `${origenNombre} ➔ ${destinoNombre}`;
//       }
//       if (rutaObj.nombre) return rutaObj.nombre;
//     }
//     const r = rutasDisponibles.find((item) => item.idRuta === viaje.idRuta);
//     return r ? r.nombre : 'Ruta no asignada';
//   };

//   const obtenerNombreChofer = (idChofer?: string) => {
//     if (!idChofer) return 'Sin chofer';
//     const c = choferesDisponibles.find((item) => item.idUsuario === idChofer);
//     return c ? `${c.nombre} ${c.apellido}` : 'Sin chofer';
//   };

//   return (
//     <div
//       className={`${esAdmin ? 'xl:col-span-2' : 'w-full'} bg-white p-6 rounded-lg border border-slate-200 shadow-sm`}
//     >
//       <h2 className="text-lg font-bold text-slate-800 mb-4">
//         {esAdmin ? 'Gestión de Viajes Programados' : 'Viajes Disponibles'}
//       </h2>

//       {cargando ? (
//         <p className="text-sm text-slate-500 flex items-center gap-2">
//           <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
//           Cargando viajes...
//         </p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm text-slate-600 border-collapse">
//             <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
//               <tr>
//                 <th className="py-3 px-4">Ruta</th>
//                 <th className="py-3 px-4">Chofer</th>
//                 <th className="py-3 px-3">Salida</th>
//                 <th className="py-3 px-3">Llegada</th>
//                 <th className="py-3 px-3 text-center">Pasajeros</th>
//                 <th className="py-3 px-3 text-center">Valijas</th>
//                 <th className="py-3 px-3">Precio</th>
//                 <th className="py-3 px-3 text-right">Acciones</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {viajes.map((viaje) => {

//                 const usuarioYaReservo =
//                   usuarioId &&
//                   viaje.reservas?.some(
//                     (reserva: {
//                       usuario?:
//                         | string
//                         | { id?: string; idUsuario?: string; _id?: string };
//                       idUsuario?: string;
//                     }) => {
//                       const resUsuario = reserva.usuario;
//                       const resIdUsuario = reserva.idUsuario;

//                       const idReservaUsuario =
//                         typeof resUsuario === 'object' && resUsuario !== null
//                           ? resUsuario.id ||
//                             resUsuario.idUsuario ||
//                             resUsuario._id
//                           : resUsuario;

//                       return (
//                         String(idReservaUsuario) === String(usuarioId) ||
//                         String(resIdUsuario) === String(usuarioId)
//                       );
//                     },
//                   );

//                 const esCompartido = viaje.tipo?.toUpperCase() === 'COMPARTIDO';

//                 return (
//                   <tr
//                     key={viaje.id}
//                     onClick={() => onSeleccionarViaje(viaje)}
//                     className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
//                   >
//                     <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
//                       {obtenerNombreRuta(viaje)}
//                     </td>
//                     <td className="py-3 px-4">
//                       {viaje.idChofer
//                         ? obtenerNombreChofer(viaje.idChofer)
//                         : 'Sin chofer'}
//                     </td>
//                     <td className="py-3 px-3 text-xs whitespace-nowrap">
//                       {viaje.fechaHoraInicio
//                         ? new Date(viaje.fechaHoraInicio).toLocaleString()
//                         : '-'}
//                     </td>
//                     <td className="py-3 px-3 text-xs whitespace-nowrap">
//                       {viaje.fechaHoraFin
//                         ? new Date(viaje.fechaHoraFin).toLocaleString()
//                         : '-'}
//                     </td>
//                     <td className="py-3 px-3 text-center font-medium text-slate-800">
//                       {viaje.capacidadPasajeros ?? '-'}
//                     </td>
//                     <td className="py-3 px-3 text-center font-medium text-slate-800">
//                       {viaje.capacidadValijas ?? '-'}
//                     </td>
//                     <td className="py-3 px-3 font-semibold text-slate-700">
//                       ${viaje.precio}
//                     </td>

//                     <td
//                       className="py-3 px-3 text-right"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       {esAdmin ? (
//                         <div className="flex justify-end gap-2">
//                           {onEditar && (
//                             <button
//                               onClick={() => onEditar(viaje)}
//                               className="text-blue-600 hover:text-blue-800 font-medium text-xs transition"
//                             >
//                               Editar
//                             </button>
//                           )}
//                           {onEliminar && (
//                             <button
//                               onClick={() => onEliminar(viaje.id)}
//                               className="text-red-600 hover:text-red-800 font-medium text-xs transition"
//                             >
//                               Cancelar
//                             </button>
//                           )}
//                         </div>
//                       ) : (
//                         <div className="flex justify-end items-center gap-2">
//                           <button
//                             onClick={() => onSeleccionarViaje(viaje)}
//                             className="text-slate-500 hover:text-slate-800 font-medium text-xs px-2 py-1 transition flex items-center gap-1"
//                             title="Ver detalles"
//                           >
//                             👁️ Detalle
//                           </button>

//                           {esCompartido ? (
//                             usuarioYaReservo ? (
//                               <span className="text-[11px] font-semibold px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
//                                 ✓ Reservado
//                               </span>
//                             ) : (
//                               <span className="text-[11px] font-medium px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
//                                 Disponible
//                               </span>
//                             )
//                           ) : (
//                             <span className="text-[11px] font-medium px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
//                               Privado
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}

//               {viajes.length === 0 && (
//                 <tr>
//                   <td colSpan={8} className="py-8 text-center text-slate-500">
//                     No hay viajes programados.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };;

// *******/

// // src/features/viajes/components/ViajesTabla.tsx
// import type { Viaje, Ruta, Usuario } from '../../../types';

// interface ViajesTablaProps {
//   viajes: Viaje[];
//   rutasDisponibles: Ruta[];
//   choferesDisponibles: Usuario[];
//   cargando: boolean;
//   esAdmin: boolean;
//   usuarioId?: string;
//   onSeleccionarViaje: (viaje: Viaje) => void;
//   onEditar?: (viaje: Viaje) => void;
//   onEliminar?: (id: string) => void;
// }

// export const ViajesTabla = ({
//   viajes,
//   rutasDisponibles,
//   choferesDisponibles,
//   cargando,
//   esAdmin,
//   usuarioId,
//   onSeleccionarViaje,
//   onEditar,
//   onEliminar,
// }: ViajesTablaProps) => {
//   const obtenerNombreRuta = (viaje: Viaje) => {
//     if (viaje.rutaNombre) return viaje.rutaNombre;

//     if (typeof viaje.ruta === 'object' && viaje.ruta !== null) {
//       // 🟢 Tipado seguro sin usar any
//       const rutaObj = viaje.ruta as {
//         origen?: string | { nombre?: string };
//         destino?: string | { nombre?: string };
//         nombre?: string;
//       };

//       if (rutaObj.origen && rutaObj.destino) {
//         const origenNombre =
//           typeof rutaObj.origen === 'object' && rutaObj.origen !== null
//             ? rutaObj.origen.nombre || 'Origen'
//             : rutaObj.origen;

//         const destinoNombre =
//           typeof rutaObj.destino === 'object' && rutaObj.destino !== null
//             ? rutaObj.destino.nombre || 'Destino'
//             : rutaObj.destino;

//         return `${origenNombre} ➔ ${destinoNombre}`;
//       }
//       if (rutaObj.nombre) return rutaObj.nombre;
//     }
//     const r = rutasDisponibles.find((item) => item.idRuta === viaje.idRuta);
//     return r ? r.nombre : 'Ruta no asignada';
//   };

//   const obtenerNombreChofer = (idChofer?: string) => {
//     if (!idChofer) return 'Sin chofer';
//     const c = choferesDisponibles.find((item) => item.idUsuario === idChofer);
//     return c ? `${c.nombre} ${c.apellido}` : 'Sin chofer';
//   };

//   return (
//     <div
//       className={`${esAdmin ? 'xl:col-span-2' : 'w-full'} bg-white p-6 rounded-lg border border-slate-200 shadow-sm`}
//     >
//       <h2 className="text-lg font-bold text-slate-800 mb-4">
//         {esAdmin ? 'Gestión de Viajes Programados' : 'Viajes Disponibles'}
//       </h2>

//       {cargando ? (
//         <p className="text-sm text-slate-500 flex items-center gap-2">
//           <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
//           Cargando viajes...
//         </p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm text-slate-600 border-collapse">
//             <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
//               <tr>
//                 <th className="py-3 px-4">Ruta</th>
//                 <th className="py-3 px-4">Chofer</th>
//                 <th className="py-3 px-3">Salida</th>
//                 <th className="py-3 px-3">Llegada</th>
//                 <th className="py-3 px-3 text-center">Pasajeros</th>
//                 <th className="py-3 px-3 text-center">Valijas</th>
//                 <th className="py-3 px-3">Precio</th>
//                 <th className="py-3 px-3 text-right">Acciones</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {viajes.map((viaje) => {
//                 const usuarioYaReservo =
//                   usuarioId &&
//                   viaje.reservas?.some((reserva: Record<string, unknown>) => {
//                     // 🟢 Tipado seguro de las propiedades de la reserva sin any
//                     const resUsuario = reserva.usuario as
//                       | string
//                       | { id?: string; idUsuario?: string; _id?: string }
//                       | undefined;
//                     const resIdUsuario = reserva.idUsuario as
//                       | string
//                       | undefined;

//                     const idReservaUsuario =
//                       typeof resUsuario === 'object' && resUsuario !== null
//                         ? resUsuario.id ||
//                           resUsuario.idUsuario ||
//                           resUsuario._id
//                         : resUsuario;

//                     return (
//                       String(idReservaUsuario) === String(usuarioId) ||
//                       String(resIdUsuario) === String(usuarioId)
//                     );
//                   });

//                 const esCompartido = viaje.tipo?.toUpperCase() === 'COMPARTIDO';

//                 return (
//                   <tr
//                     key={viaje.id}
//                     onClick={() => onSeleccionarViaje(viaje)}
//                     className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
//                   >
//                     <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
//                       {obtenerNombreRuta(viaje)}
//                     </td>
//                     <td className="py-3 px-4">
//                       {viaje.idChofer
//                         ? obtenerNombreChofer(viaje.idChofer)
//                         : 'Sin chofer'}
//                     </td>
//                     <td className="py-3 px-3 text-xs whitespace-nowrap">
//                       {viaje.fechaHoraInicio
//                         ? new Date(viaje.fechaHoraInicio).toLocaleString()
//                         : '-'}
//                     </td>
//                     <td className="py-3 px-3 text-xs whitespace-nowrap">
//                       {viaje.fechaHoraFin
//                         ? new Date(viaje.fechaHoraFin).toLocaleString()
//                         : '-'}
//                     </td>
//                     <td className="py-3 px-3 text-center font-medium text-slate-800">
//                       {viaje.capacidadPasajeros ?? '-'}
//                     </td>
//                     <td className="py-3 px-3 text-center font-medium text-slate-800">
//                       {viaje.capacidadValijas ?? '-'}
//                     </td>
//                     <td className="py-3 px-3 font-semibold text-slate-700">
//                       ${viaje.precio}
//                     </td>

//                     <td
//                       className="py-3 px-3 text-right"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       {esAdmin ? (
//                         <div className="flex justify-end gap-2">
//                           {onEditar && (
//                             <button
//                               onClick={() => onEditar(viaje)}
//                               className="text-blue-600 hover:text-blue-800 font-medium text-xs transition"
//                             >
//                               Editar
//                             </button>
//                           )}
//                           {onEliminar && (
//                             <button
//                               onClick={() => onEliminar(viaje.id)}
//                               className="text-red-600 hover:text-red-800 font-medium text-xs transition"
//                             >
//                               Cancelar
//                             </button>
//                           )}
//                         </div>
//                       ) : (
//                         <div className="flex justify-end items-center gap-2">
//                           <button
//                             onClick={() => onSeleccionarViaje(viaje)}
//                             className="text-slate-500 hover:text-slate-800 font-medium text-xs px-2 py-1 transition flex items-center gap-1"
//                             title="Ver detalles"
//                           >
//                             👁️ Detalle
//                           </button>

//                           {esCompartido ? (
//                             usuarioYaReservo ? (
//                               <span className="text-[11px] font-semibold px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
//                                 ✓ Reservado
//                               </span>
//                             ) : (
//                               <span className="text-[11px] font-medium px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
//                                 Disponible
//                               </span>
//                             )
//                           ) : (
//                             <span className="text-[11px] font-medium px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
//                               Privado
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}

//               {viajes.length === 0 && (
//                 <tr>
//                   <td colSpan={8} className="py-8 text-center text-slate-500">
//                     No hay viajes programados.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// // src/features/viajes/components/ViajesTabla.tsx
// import type { Viaje, Ruta, Usuario } from '../../../types';

// interface ViajesTablaProps {
//   viajes: Viaje[];
//   rutasDisponibles: Ruta[];
//   choferesDisponibles: Usuario[];
//   cargando: boolean;
//   esAdmin: boolean;
//   usuarioId?: string;
//   onSeleccionarViaje: (viaje: Viaje) => void;
//   onEditar?: (viaje: Viaje) => void;
//   onEliminar?: (id: string) => void;
//   onReservar?: (viaje: Viaje) => void;
// }

// export const ViajesTabla = ({
//   viajes,
//   rutasDisponibles,
//   choferesDisponibles,
//   cargando,
//   esAdmin,
//   usuarioId,
//   onSeleccionarViaje,
//   onEditar,
//   onEliminar,
//   onReservar,
// }: ViajesTablaProps) => {
//   const obtenerNombreRuta = (viaje: Viaje) => {
//     if (viaje.rutaNombre) return viaje.rutaNombre;
//     if (typeof viaje.ruta === 'object' && viaje.ruta !== null) {
//       const ruta = viaje.ruta as any;
//       if (ruta.origen && ruta.destino) {
//         const origenNombre =
//           typeof ruta.origen === 'object' ? ruta.origen.nombre : ruta.origen;
//         const destinoNombre =
//           typeof ruta.destino === 'object' ? ruta.destino.nombre : ruta.destino;
//         return `${origenNombre} ➔ ${destinoNombre}`;
//       }
//       if (ruta.nombre) return ruta.nombre;
//     }
//     const r = rutasDisponibles.find((item) => item.idRuta === viaje.idRuta);
//     return r ? r.nombre : 'Ruta no asignada';
//   };

//   const obtenerNombreChofer = (idChofer?: string) => {
//     if (!idChofer) return 'Sin chofer';
//     const c = choferesDisponibles.find((item) => item.idUsuario === idChofer);
//     return c ? `${c.nombre} ${c.apellido}` : 'Sin chofer';
//   };

//   return (
//     <div
//       className={`${esAdmin ? 'xl:col-span-2' : 'w-full'} bg-white p-6 rounded-lg border border-slate-200 shadow-sm`}
//     >
//       <h2 className="text-lg font-bold text-slate-800 mb-4">
//         {esAdmin ? 'Gestión de Viajes Programados' : 'Viajes Disponibles'}
//       </h2>

//       {cargando ? (
//         <p className="text-sm text-slate-500 flex items-center gap-2">
//           <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
//           Cargando viajes...
//         </p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm text-slate-600 border-collapse">
//             <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
//               <tr>
//                 <th className="py-3 px-4">Ruta</th>
//                 <th className="py-3 px-4">Chofer</th>
//                 <th className="py-3 px-3">Salida</th>
//                 <th className="py-3 px-3">Llegada</th>
//                 <th className="py-3 px-3 text-center">Pasajeros</th>
//                 <th className="py-3 px-3 text-center">Valijas</th>
//                 <th className="py-3 px-3">Precio</th>
//                 <th className="py-3 px-3 text-right">Acciones</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {viajes.map((viaje) => {
//                 // Validación para detectar si el usuario ya reservó este viaje compartido
//                 const usuarioYaReservo =
//                   usuarioId &&
//                   viaje.reservas?.some((reserva: any) => {
//                     const resUsuario = reserva.usuario;
//                     const resIdUsuario = reserva.idUsuario;

//                     const idReservaUsuario =
//                       typeof resUsuario === 'object' && resUsuario !== null
//                         ? resUsuario.id ||
//                           resUsuario.idUsuario ||
//                           resUsuario._id
//                         : resUsuario;

//                     return (
//                       String(idReservaUsuario) === String(usuarioId) ||
//                       String(resIdUsuario) === String(usuarioId)
//                     );
//                   });

//                 const esCompartido = viaje.tipo?.toUpperCase() === 'COMPARTIDO';

//                 return (
//                   <tr
//                     key={viaje.id}
//                     onClick={() => onSeleccionarViaje(viaje)}
//                     className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
//                   >
//                     <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
//                       {obtenerNombreRuta(viaje)}
//                     </td>
//                     <td className="py-3 px-4">
//                       {viaje.idChofer
//                         ? obtenerNombreChofer(viaje.idChofer)
//                         : 'Sin chofer'}
//                     </td>
//                     <td className="py-3 px-3 text-xs whitespace-nowrap">
//                       {viaje.fechaHoraInicio
//                         ? new Date(viaje.fechaHoraInicio).toLocaleString()
//                         : '-'}
//                     </td>
//                     <td className="py-3 px-3 text-xs whitespace-nowrap">
//                       {viaje.fechaHoraFin
//                         ? new Date(viaje.fechaHoraFin).toLocaleString()
//                         : '-'}
//                     </td>
//                     <td className="py-3 px-3 text-center font-medium text-slate-800">
//                       {viaje.capacidadPasajeros ?? '-'}
//                     </td>
//                     <td className="py-3 px-3 text-center font-medium text-slate-800">
//                       {viaje.capacidadValijas ?? '-'}
//                     </td>
//                     <td className="py-3 px-3 font-semibold text-slate-700">
//                       ${viaje.precio}
//                     </td>

//                     <td
//                       className="py-3 px-3 text-right"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       {esAdmin ? (
//                         <div className="flex justify-end gap-2">
//                           {onEditar && (
//                             <button
//                               onClick={() => onEditar(viaje)}
//                               className="text-blue-600 hover:text-blue-800 font-medium text-xs transition"
//                             >
//                               Editar
//                             </button>
//                           )}
//                           {onEliminar && (
//                             <button
//                               onClick={() => onEliminar(viaje.id)}
//                               className="text-red-600 hover:text-red-800 font-medium text-xs transition"
//                             >
//                               Cancelar
//                             </button>
//                           )}
//                         </div>
//                       ) : (
//                         <div className="flex justify-end items-center gap-2">
//                           <button
//                             onClick={() => onSeleccionarViaje(viaje)}
//                             className="text-slate-500 hover:text-slate-800 font-medium text-xs px-2 py-1 transition flex items-center gap-1"
//                             title="Ver detalles"
//                           >
//                             👁️ Detalle
//                           </button>

//                           {/* Acciones diferenciadas para cliente según si es compartido o privado */}
//                           {esCompartido ? (
//                             usuarioYaReservo ? (
//                               <span className="text-[11px] font-semibold px-2.5 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
//                                 ✓ Reservado
//                               </span>
//                             ) : (
//                               onReservar && (
//                                 <button
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     onReservar(viaje);
//                                   }}
//                                   className="bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs px-3 py-1.5 rounded-md transition shadow-sm"
//                                 >
//                                   Reservar
//                                 </button>
//                               )
//                             )
//                           ) : (
//                             <span className="text-[11px] font-medium px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
//                               Privado
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}

//               {viajes.length === 0 && (
//                 <tr>
//                   <td colSpan={8} className="py-8 text-center text-slate-500">
//                     No hay viajes programados.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

//  *******

// import type { Viaje, Ruta, Usuario } from '../../../types';

// interface ViajesTablaProps {
//   viajes: Viaje[];
//   rutasDisponibles: Ruta[];
//   choferesDisponibles: Usuario[];
//   cargando: boolean;
//   esAdmin: boolean;
//   onSeleccionarViaje: (viaje: Viaje) => void;
//   onEditar: (viaje: Viaje) => void;
//   onEliminar: (id: string) => void;
// }

// export const ViajesTabla = ({
//   viajes,
//   rutasDisponibles,
//   choferesDisponibles,
//   cargando,
//   esAdmin,
//   onSeleccionarViaje,
//   onEditar,
//   onEliminar,
// }: ViajesTablaProps) => {
//   const obtenerNombreRuta = (viaje: Viaje) => {
//     if (viaje.rutaNombre) return viaje.rutaNombre;
//     if (typeof viaje.ruta === 'object' && viaje.ruta !== null) {
//       if (viaje.ruta.origen && viaje.ruta.destino) {
//         return `${viaje.ruta.origen} ➔ ${viaje.ruta.destino}`;
//       }
//       if (viaje.ruta.nombre) return viaje.ruta.nombre;
//     }
//     const r = rutasDisponibles.find((item) => item.idRuta === viaje.idRuta);
//     return r ? r.nombre : 'Ruta no asignada';
//   };

//   const obtenerNombreChofer = (idChofer?: string) => {
//     if (!idChofer) return 'Sin chofer';
//     const c = choferesDisponibles.find((item) => item.idUsuario === idChofer);
//     return c ? `${c.nombre} ${c.apellido}` : 'Sin chofer';
//   };

//   return (
//     <div
//       className={`${esAdmin ? 'xl:col-span-2' : 'w-full'} bg-white p-6 rounded-lg border border-slate-200 shadow-sm`}
//     >
//       <h2 className="text-lg font-bold text-slate-800 mb-4">
//         Viajes Programados
//       </h2>

//       {cargando ? (
//         <p className="text-sm text-slate-500 flex items-center gap-2">
//           <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
//           Cargando viajes...
//         </p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm text-slate-600 border-collapse">
//             <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
//               <tr>
//                 <th className="py-3 px-4">Ruta</th>
//                 <th className="py-3 px-4">Chofer</th>
//                 <th className="py-3 px-3">Salida</th>
//                 <th className="py-3 px-3">Llegada</th>
//                 <th className="py-3 px-3 text-center">Pasajeros</th>
//                 <th className="py-3 px-3 text-center">Valijas</th>
//                 <th className="py-3 px-3">Precio</th>
//                 {esAdmin && <th className="py-3 px-3 text-right">Acciones</th>}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {viajes.map((viaje) => (
//                 <tr
//                   key={viaje.id}
//                   onClick={() => onSeleccionarViaje(viaje)}
//                   className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
//                 >
//                   <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
//                     {obtenerNombreRuta(viaje)}
//                   </td>
//                   <td className="py-3 px-4">
//                     {viaje.idChofer
//                       ? obtenerNombreChofer(viaje.idChofer)
//                       : 'Sin chofer'}
//                   </td>
//                   <td className="py-3 px-3 text-xs whitespace-nowrap">
//                     {viaje.fechaHoraInicio
//                       ? new Date(viaje.fechaHoraInicio).toLocaleString()
//                       : '-'}
//                   </td>
//                   <td className="py-3 px-3 text-xs whitespace-nowrap">
//                     {viaje.fechaHoraFin
//                       ? new Date(viaje.fechaHoraFin).toLocaleString()
//                       : '-'}
//                   </td>
//                   <td className="py-3 px-3 text-center font-medium text-slate-800">
//                     {viaje.capacidadPasajeros ?? '-'}
//                   </td>
//                   <td className="py-3 px-3 text-center font-medium text-slate-800">
//                     {viaje.capacidadValijas ?? '-'}
//                   </td>
//                   <td className="py-3 px-3 font-semibold text-slate-700">
//                     ${viaje.precio}
//                   </td>
//                   {esAdmin && (
//                     <td
//                       className="py-3 px-3 text-right"
//                       onClick={(e) => e.stopPropagation()}
//                     >
//                       <div className="flex justify-end gap-2">
//                         <button
//                           onClick={() => onEditar(viaje)}
//                           className="text-blue-600 hover:text-blue-800 font-medium text-xs transition"
//                         >
//                           Editar
//                         </button>
//                         <button
//                           onClick={() => onEliminar(viaje.id)}
//                           className="text-red-600 hover:text-red-800 font-medium text-xs transition"
//                         >
//                           Cancelar
//                         </button>
//                       </div>
//                     </td>
//                   )}
//                 </tr>
//               ))}
//               {viajes.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={esAdmin ? 8 : 7}
//                     className="py-8 text-center text-slate-500"
//                   >
//                     No hay viajes programados.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };
