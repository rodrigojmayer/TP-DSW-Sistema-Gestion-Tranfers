import React from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  XCircle,
  AlertCircle,
} from 'lucide-react';

import type { Viaje } from '../../../types/';

import {
  obtenerNombrePunto,
  obtenerPuntosNormalizados,
} from '../../../utils/viajeHelpers';

interface ViajeDetalleContentProps {
  viaje: Viaje;
  onCerrar?: () => void;
}

export const ViajeDetalleContent: React.FC<ViajeDetalleContentProps> = ({
  viaje,
  onCerrar,
}) => {
  const puntosRuta = obtenerPuntosNormalizados(viaje);
  const esPrivado = viaje.tipo?.toUpperCase() === 'PRIVADO';

  const fechaObjeto = viaje.fechaHoraInicio
    ? new Date(viaje.fechaHoraInicio)
    : null;
  const fechaTexto =
    fechaObjeto && !isNaN(fechaObjeto.getTime())
      ? fechaObjeto.toLocaleDateString()
      : 'N/A';
  const horaTexto =
    fechaObjeto && !isNaN(fechaObjeto.getTime())
      ? fechaObjeto.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'N/A';

  const choferNombre =
    typeof viaje.chofer === 'object' && viaje.chofer !== null
      ? `${viaje.chofer.nombre || ''} ${viaje.chofer.apellido || ''}`.trim()
      : typeof viaje.chofer === 'string'
        ? viaje.chofer
        : 'Sin asignar';

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-2xl w-full mx-auto my-4 border border-slate-200">
      <div className="bg-slate-900 text-white p-4 sm:p-6 flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {esPrivado ? 'Viaje Privado' : 'Viaje Público / Compartido'}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold mt-2">
            Detalle del Viaje #{viaje.id}
          </h2>
        </div>
        {onCerrar && (
          <button
            onClick={onCerrar}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            aria-label="Cerrar modal"
          >
            <XCircle className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-700">
            <Calendar className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-400">Fecha</p>
              <p className="text-sm font-semibold">{fechaTexto}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-400">Hora</p>
              <p className="text-sm font-semibold">{horaTexto}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <Users className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-400">Asientos</p>
              <p className="text-sm font-semibold">
                {viaje.capacidadPasajeros ?? 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-700">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-400">Precio</p>
              <p className="text-sm font-semibold">${viaje.precio ?? 0}</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Itinerario y Recorrido
          </h3>

          {puntosRuta.length === 0 ? (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                No se encontraron puntos de parada registrados para este viaje.
              </span>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {puntosRuta.map((item, idx) => {
                const esUltimo = idx === puntosRuta.length - 1;
                const nombreLugar = obtenerNombrePunto(item.punto);

                return (
                  <div
                    key={item.punto.id || idx}
                    className="relative flex items-start justify-between gap-4"
                  >
                    <span
                      className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                        item.tipo === 'ORIGEN'
                          ? 'border-emerald-500 bg-emerald-500'
                          : esUltimo
                            ? 'border-rose-500 bg-rose-500'
                            : 'border-blue-500'
                      }`}
                    />

                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase">
                        {item.tipo ||
                          (idx === 0
                            ? 'ORIGEN'
                            : esUltimo
                              ? 'DESTINO'
                              : 'PARADA')}
                      </p>
                      <p className="font-semibold text-slate-800 text-sm sm:text-base">
                        {nombreLugar}
                      </p>
                      {item.punto.direccion &&
                        item.punto.direccion !== nombreLugar && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {item.punto.direccion}
                          </p>
                        )}
                    </div>

                    {!esPrivado && !esUltimo && (
                      <div className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md text-right border border-slate-200 shrink-0">
                        <span className="block font-medium">
                          {item.asientosDisponibles} disp.
                        </span>
                        <span className="text-[10px] text-slate-400">
                          hacia próx. parada
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {viaje.chofer && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                {choferNombre[0] || 'C'}
              </div>
              <div>
                <p className="text-xs text-slate-400">Conductor</p>
                <p className="text-sm font-medium text-slate-700">
                  {choferNombre}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViajeDetalleContent;
