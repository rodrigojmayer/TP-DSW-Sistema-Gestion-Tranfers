import { useEffect, useState, useCallback } from 'react';
import { puntoService } from '../api/puntoService';
import { PuntoForm } from '../components/PuntoForm';
import type { Punto } from '../../../types';

export const PuntosPage = () => {
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [puntoAEditar, setPuntoAEditar] = useState<Punto | null>(null);

  const cargarPuntos = useCallback(async () => {
    try {
      const data = await puntoService.obtenerTodos();
      setPuntos(data);
    } catch (error) {
      console.error('Error al cargar puntos:', error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let cancelado = false;

    puntoService
      .obtenerTodos()
      .then((data) => {
        if (!cancelado) setPuntos(data);
      })
      .catch((error) => console.error('Error al cargar puntos:', error))
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const handleEliminar = async (idPunto: string) => {
    if (confirm('¿Estás seguro de eliminar este punto?')) {
      setCargando(true);
      try {
        await puntoService.eliminar(idPunto);
        await cargarPuntos();
      } catch (error) {
        console.error('Error al eliminar punto:', error);
        setCargando(false);
      }
    }
  };

  const formatTipoLabel = (tipo?: string) => {
    switch (tipo) {
      case 'Aeropuerto':
        return 'Aeropuerto';
      case 'Punto Intermedio':
        return 'Punto Intermedio';
      case 'Terminal':
      default:
        return 'Terminal';
    }
  };

  return (
    <div className="p-8">
      {/* CORREGIDO: Typo del título */}
      <h1 className="text-3xl font-extrabold text-slate-700 mb-8">
        Panel de Administración
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <PuntoForm
            puntoAEditar={puntoAEditar}
            onCancelEdit={() => setPuntoAEditar(null)}
            onSuccess={() => {
              setPuntoAEditar(null);
              setCargando(true);
              cargarPuntos();
            }}
          />
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              Puntos / Paradas ({puntos.length})
            </h2>
            <button
              onClick={() => {
                setCargando(true);
                cargarPuntos();
              }}
              className="text-xs text-amber-600 hover:underline font-medium"
            >
              Refrescar
            </button>
          </div>

          {cargando ? (
            <p className="text-sm text-slate-500">Cargando puntos...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <th className="py-3 px-2">Tipo</th>
                    <th className="py-3 px-2">Nombre</th>
                    <th className="py-3 px-2">Dirección</th>
                    <th className="py-3 px-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {puntos.map((punto, index) => (
                    // CORREGIDO: punto.idPunto en lugar de punto.id
                    <tr key={punto.idPunto ?? index} className="hover:bg-slate-50">
                      {/* CORREGIDO: Agregada la columna de Tipo faltante */}
                      <td className="py-3 px-2 text-xs">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-medium">
                          {formatTipoLabel(punto.tipo)}
                        </span>
                      </td>

                      <td className="py-3 px-2 font-medium text-slate-800">
                        {punto.nombre}
                      </td>

                      <td className="py-3 px-2 text-slate-600">
                        {punto.direccion}
                      </td>

                      <td className="py-3 px-2 text-right space-x-3">
                        <button
                          onClick={() => setPuntoAEditar(punto)}
                          className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold"
                        >
                          Editar
                        </button>
                        <button
                          // CORREGIDO: punto.idPunto en lugar de punto.id
                          onClick={() => handleEliminar(punto.idPunto)}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};