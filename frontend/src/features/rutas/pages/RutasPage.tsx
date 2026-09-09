// src/features/rutas/pages/RutasPage.tsx
import { useEffect, useState } from 'react';
import { type Ruta } from '../../../types';
import { rutaService } from '../api/rutaService';
import { RutaForm } from '../components/RutaForm';

export const RutasPage = () => {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [rutaAEditar, setRutaAEditar] = useState<Ruta | null>(null);

  // Carga inicial al montar el componente (cumple con las reglas del React Compiler/Linter)
  useEffect(() => {
    let isMounted = true;

    const cargarInicial = async () => {
      try {
        const data = await rutaService.obtenerTodas();
        if (isMounted) {
          setRutas(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error al cargar rutas:', error);
        if (isMounted) setRutas([]);
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarInicial();

    return () => {
      isMounted = false;
    };
  }, []);

  // Función exclusiva para refrescar ante acciones del usuario (click en botón, guardar, eliminar)
  const refrescarTabla = async () => {
    setCargando(true);
    try {
      const data = await rutaService.obtenerTodas();
      setRutas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar rutas:', error);
      setRutas([]);
    } finally {
      setCargando(false);
    }
  };

  const handleEliminar = async (id?: string | number) => {
    if (!id) return;
    if (window.confirm('¿Estás seguro de eliminar esta ruta?')) {
      try {
        await rutaService.eliminar(id);
        if (rutaAEditar?.idRuta === id) {
          setRutaAEditar(null);
        }
        await refrescarTabla();
      } catch (error) {
        console.error('Error al eliminar la ruta:', error);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Columna Izquierda: Formulario (Alta / Edición) */}
      <div className="xl:col-span-1">
        <RutaForm
          rutaAEditar={rutaAEditar}
          onCancelEdit={() => setRutaAEditar(null)}
          onSuccess={() => {
            setRutaAEditar(null);
            refrescarTabla();
          }}
        />
      </div>

      {/* Columna Derecha: Listado de Rutas */}
      <div className="xl:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Rutas Activas ({rutas.length})
          </h2>
          <button
            onClick={refrescarTabla}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            Refrescar
          </button>
        </div>

        {cargando ? (
          <p className="text-sm text-slate-500 flex items-center gap-2 py-8">
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
            Cargando rutas...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Ruta</th>
                  <th className="py-3 px-4">Paradas Totales</th>
                  <th className="py-3 px-4">Recorrido</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rutas.map((ruta, idx) => {
                  const puntosOrdenados = [...(ruta.puntosRuta || [])].sort(
                    (a, b) => (a.orden ?? 0) - (b.orden ?? 0),
                  );

                  return (
                    <tr
                      key={ruta.idRuta ?? idx}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {ruta.nombre}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {puntosOrdenados.length} puntos
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500">
                        {puntosOrdenados
                          .map((p) => p.direccion)
                          .filter(Boolean)
                          .join(' ➔ ') || 'Sin paradas'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-3">
                        <button
                          onClick={() => setRutaAEditar(ruta)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium text-xs transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(ruta.idRuta)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {rutas.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-500">
                      No hay rutas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
