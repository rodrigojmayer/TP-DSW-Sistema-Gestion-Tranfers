
import type { Viaje, Ruta, Usuario } from '../../../types';

interface ViajesTablaProps {
  viajes: Viaje[];
  rutasDisponibles: Ruta[];
  choferesDisponibles: Usuario[];
  cargando: boolean;
  esAdmin: boolean;
  usuarioId?: string;
  rolUsuario?: string;
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

 const obtenerNombreChofer = (viaje: Viaje) => {
   if (viaje.chofer && typeof viaje.chofer === 'object') {
     const nombre = viaje.chofer.nombre ?? '';
     const apellido = viaje.chofer.apellido ?? '';
     if (nombre || apellido) return `${nombre} ${apellido}`.trim();
   }

   const idChofer =
     viaje.idChofer || (typeof viaje.chofer === 'string' ? viaje.chofer : '');
   if (!idChofer) return 'Sin chofer';

   const c = choferesDisponibles.find(
     (item) => item.idUsuario === idChofer || item.id === idChofer,
   );
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
                const usuarioYaReservo =
                  Boolean(usuarioId) &&
                  ((viaje.reservas &&
                    Array.isArray(viaje.reservas) &&
                    viaje.reservas.some((reserva: Record<string, unknown>) => {
                      const resUsuario = reserva.usuario as
                        | Record<string, unknown>
                        | string
                        | undefined;

                      const resViaje = reserva.viaje as
                        | Record<string, unknown>
                        | string
                        | undefined;

                      const resIdViaje =
                        typeof resViaje === 'object' && resViaje !== null
                          ? (resViaje.id as string) || (resViaje._id as string)
                          : resViaje;

                      const resIdUsuario =
                        (reserva.idUsuario as string) ||
                        (reserva.idCliente as string);

                      const idReservaUsuario =
                        typeof resUsuario === 'object' && resUsuario !== null
                          ? (resUsuario.id as string) ||
                            (resUsuario.idUsuario as string) ||
                            (resUsuario._id as string)
                          : resUsuario;

                      const coincideUsuario =
                        String(idReservaUsuario).trim() === String(usuarioId).trim() ||
                        String(resIdUsuario).trim() === String(usuarioId).trim();

                      const coincideViaje =
                        !resIdViaje || String(resIdViaje).trim() === String(viaje.id).trim();

                      return coincideUsuario && coincideViaje;
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
                      {viaje.idChofer || viaje.chofer
                        ? obtenerNombreChofer(viaje)
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
                              Eliminar
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

              {viajes.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No hay viajes programados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
