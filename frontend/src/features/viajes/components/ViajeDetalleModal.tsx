import type { Viaje, PuntoDetalle } from '../../../types';

interface ViajeDetalleModalProps {
  viaje: Viaje;
  puntos: PuntoDetalle[];
  nombreChofer: string;
  nombreRuta: string;
  onClose: () => void;
}

export const ViajeDetalleModal = ({
  viaje,
  puntos,
  nombreChofer,
  nombreRuta,
  onClose,
}: ViajeDetalleModalProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Detalle del Viaje:{' '}
              <span className="text-amber-600">{nombreRuta}</span>
            </h3>
            <p className="text-xs text-slate-500">Chofer: {nombreChofer}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase">
              <tr>
                <th className="py-2.5 px-4 border-b">Horario</th>
                <th className="py-2.5 px-4 border-b">Punto / Parada</th>
                <th className="py-2.5 px-4 border-b text-center">
                  Pasajeros {viaje.tipo === 'PRIVADO' ? '' : 'Disp.'}
                </th>
                <th className="py-2.5 px-4 border-b text-center">
                  Valijas {viaje.tipo === 'PRIVADO' ? '' : 'Disp.'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {puntos.map((punto, idx) => {
                const esOrigen = idx === 0;
                const esDestino = idx === puntos.length - 1;

                return (
                  <tr
                    key={idx}
                    className={
                      esOrigen || esDestino
                        ? 'bg-amber-50/30 font-medium'
                        : 'hover:bg-slate-50'
                    }
                  >
                    <td className="py-2.5 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {punto.horaEstimada}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span>{punto.nombre}</span>
                        {esOrigen && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-normal">
                            Origen
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center font-medium">
                      {punto.pasajerosDisponibles}
                    </td>
                    <td className="py-2.5 px-4 text-center font-medium">
                      {punto.valijasDisponibles}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Modal incluido dentro del componente modal */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-md transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
