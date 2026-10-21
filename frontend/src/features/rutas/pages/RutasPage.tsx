// src/features/rutas/pages/RutasPage.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import type { Ruta } from '../../../types';
import { rutaService } from '../api/rutaService';
import { RutaForm } from '../components/RutaForm';
import { Plus, RefreshCw, Search, Map, ChevronLeft, ChevronRight } from 'lucide-react';

export const RutasPage = () => {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [rutaAEditar, setRutaAEditar] = useState<Ruta | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  // Estados de Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const refrescarTabla = useCallback(async () => {
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
  }, []);

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

  // Bloquear scroll de la página principal al abrir el modal
  useEffect(() => {
    if (modalAbierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalAbierto]);

  const rutasFiltradas = useMemo(() => {
    return rutas.filter((ruta) => {
      const query = busqueda.toLowerCase().trim();
      const nombre = ruta.nombre?.toLowerCase() || '';
      const listaPuntos = ruta.puntos || [];
      const recorridoStr = listaPuntos
        .map((p) => p.punto?.nombre || p.punto?.direccion || '')
        .join(' ')
        .toLowerCase();

      return !query || nombre.includes(query) || recorridoStr.includes(query);
    });
  }, [rutas, busqueda]);

  // Elementos paginados para la tabla actual
  const rutasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return rutasFiltradas.slice(inicio, inicio + elementosPorPagina);
  }, [rutasFiltradas, paginaActual]);

  const totalPaginas = Math.ceil(rutasFiltradas.length / elementosPorPagina);

  const abrirModalCrear = () => {
    setRutaAEditar(null);
    setModalAbierto(true);
  };

  const handleEditar = (ruta: Ruta) => {
    setRutaAEditar(ruta);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setRutaAEditar(null);
    setModalAbierto(false);
  };

  const handleEliminar = async (id?: string | number) => {
    if (!id) return;
    if (window.confirm('¿Estás seguro de eliminar esta ruta?')) {
      try {
        await rutaService.eliminar(id);
        if (rutaAEditar?.idRuta === id) {
          handleCerrarModal();
        }
        await refrescarTabla();
      } catch (error) {
        console.error('Error al eliminar la ruta:', error);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className=" font-bold text-gray-900">Gestión de Rutas</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refrescarTabla}
            disabled={cargando}
            className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Recargar rutas"
          >
            <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Ruta
          </button>
        </div>
      </div>

      {/* 2. BARRA DE BÚSQUEDA */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre de ruta o puntos del recorrido..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* 3. TABLA PRINCIPAL DE RUTAS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Rutas Activas</h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            Total: {rutasFiltradas.length}
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm">Cargando rutas...</p>
          </div>
        ) : rutasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <Map className="w-12 h-12 text-gray-300" />
            <p className="font-medium text-gray-700">No se encontraron rutas</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
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
                  {rutasPaginadas.map((ruta, idx) => {
                    const listaPuntos = ruta.puntos || [];
                    const puntosOrdenados = [...listaPuntos].sort(
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
                            .map((p) => p.punto?.nombre || p.punto?.direccion)
                            .filter(Boolean)
                            .join(' ➔ ') || 'Sin paradas'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-3">
                          <button
                            onClick={() => handleEditar(ruta)}
                            className="text-amber-600 hover:text-amber-800 font-semibold text-xs transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(ruta.idRuta)}
                            className="text-red-600 hover:text-red-800 font-semibold text-xs transition"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            {totalPaginas > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs text-slate-500">
                  Página <span className="font-semibold">{paginaActual}</span> de{' '}
                  <span className="font-semibold">{totalPaginas}</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                    disabled={paginaActual === 1}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setPaginaActual(num)}
                        className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${
                          paginaActual === num
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. MODAL FLOTANTE PARA CREAR / EDITAR RUTA */}
{modalAbierto && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    {/* Contenedor principal con overflow-visible para dejar salir la lista */}
    <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full my-8 flex flex-col relative overflow-visible">
      {/* Header Fijo */}
      <div className="flex justify-between items-center border-b px-6 py-4 bg-white sticky top-0 z-30 rounded-t-2xl">
        <h2 className="text-lg font-bold text-slate-800">
          {rutaAEditar ? 'Editar Ruta' : 'Nueva Ruta'}
        </h2>
        <button
          type="button"
          onClick={handleCerrarModal}
          className="text-slate-400 hover:text-slate-600 font-bold text-lg"
        >
          ✕
        </button>
      </div>

      {/* Contenido (Cambiamos max-h por overflow-visible o dejamos que fluya) */}
      <div className="p-6 space-y-4 overflow-visible">
        <RutaForm
          rutaAEditar={rutaAEditar}
          onCancelEdit={handleCerrarModal}
          onSuccess={() => {
            handleCerrarModal();
            refrescarTabla();
          }}
        />
      </div>
    </div>
  </div>

      )}
    </div>
  );
};

export default RutasPage;