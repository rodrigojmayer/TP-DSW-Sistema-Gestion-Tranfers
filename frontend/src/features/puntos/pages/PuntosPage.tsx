// src/features/puntos/pages/PuntosPage.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { puntoService } from '../api/puntoService';
import { PuntoForm } from '../components/PuntoForm';
import type { Punto } from '../../../types';
import { Plus, RefreshCw, Search, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

export const PuntosPage = () => {
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [puntoAEditar, setPuntoAEditar] = useState<Punto | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  // Estados de Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const cargarPuntos = useCallback(async () => {
    try {
      const data = await puntoService.obtenerTodos();
      setPuntos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar puntos:', error);
      setPuntos([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let cancelado = false;
    puntoService
      .obtenerTodos()
      .then((data) => {
        if (!cancelado) setPuntos(Array.isArray(data) ? data : []);
      })
      .catch((error) => console.error('Error al cargar puntos:', error))
      .finally(() => {
        if (!cancelado) setCargando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // Bloquear el scroll de la página principal al abrir el modal
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

  const puntosFiltrados = useMemo(() => {
    const query = busqueda.toLowerCase().trim();
    if (!query) return puntos;

    return puntos.filter((p) => {
      const nombre = (p.nombre || '').toLowerCase();
      const direccion = (p.direccion || '').toLowerCase();
      const tipo = (p.tipo || '').toLowerCase();

      return nombre.includes(query) || direccion.includes(query) || tipo.includes(query);
    });
  }, [puntos, busqueda]);

  const totalPaginas = Math.ceil(puntosFiltrados.length / elementosPorPagina) || 1;

  const puntosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return puntosFiltrados.slice(inicio, inicio + elementosPorPagina);
  }, [puntosFiltrados, paginaActual]);

  const abrirModalCrear = () => {
    setPuntoAEditar(null);
    setModalAbierto(true);
  };

  const handleEditar = (punto: Punto) => {
    setPuntoAEditar(punto);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setPuntoAEditar(null);
    setModalAbierto(false);
  };

  const handleEliminar = async (idPunto?: string) => {
    if (!idPunto) return;
    if (confirm('¿Estás seguro de eliminar este punto?')) {
      setCargando(true);
      try {
        await puntoService.eliminar(idPunto);
        if (puntoAEditar?.idPunto === idPunto) {
          handleCerrarModal();
        }
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
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bold text-gray-900">Gestión de Puntos</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCargando(true);
              cargarPuntos();
            }}
            disabled={cargando}
            className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Recargar puntos"
          >
            <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Punto
          </button>
        </div>
      </div>

      {/* 2. BARRA DE BÚSQUEDA */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, dirección o tipo de punto..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* 3. TABLA PRINCIPAL DE PUNTOS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Puntos / Paradas</h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            Total: {puntosFiltrados.length}
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm">Cargando puntos...</p>
          </div>
        ) : puntosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <MapPin className="w-12 h-12 text-gray-300" />
            <p className="font-medium text-gray-700">No se encontraron puntos</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Nombre</th>
                    <th className="py-3 px-4">Dirección</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {puntosPaginados.map((punto, index) => (
                    <tr key={punto.idPunto ?? index} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-xs">
                        <span className="px-2.5 py-1 text-slate-700 font-medium">
                          {formatTipoLabel(punto.tipo)}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-medium text-slate-900">
                        {punto.nombre}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {punto.direccion}
                      </td>

                      <td className="py-3 px-4 text-right space-x-3">
                        <button
                          onClick={() => handleEditar(punto)}
                          className="text-amber-600 hover:text-amber-800 text-xs font-semibold transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(punto.idPunto)}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold transition"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
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

      {/* 4. MODAL FLOTANTE OCULTO PARA CREAR / EDITAR PUNTO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col relative overflow-hidden">
            {/* Header Fijo */}
            <div className="flex justify-between items-center border-b px-6 py-4 bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-800">
                {puntoAEditar ? 'Editar Punto' : 'Nuevo Punto'}
              </h2>
              <button
                type="button"
                onClick={handleCerrarModal}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Contenido con scroll interno */}
            <div className="p-6 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <PuntoForm
                puntoAEditar={puntoAEditar}
                onCancelEdit={handleCerrarModal}
                onSuccess={() => {
                  handleCerrarModal();
                  setCargando(true);
                  cargarPuntos();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PuntosPage;