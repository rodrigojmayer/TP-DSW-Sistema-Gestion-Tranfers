// src/features/viajes/pages/ViajesPage.tsx
import { useEffect, useState, useMemo } from 'react';
import type { Viaje, Ruta, Usuario } from '../../../types';
import { viajeService } from '../api/viajeService';
import { rutaService } from '../../rutas/api/rutaService';
import { usuarioService } from '../../usuarios/api/usuarioService';
import { ViajeForm } from '../components/ViajeForm';
import { useAuthStore } from '../../../store/authStore';
import { Plus, RefreshCw, Search, Truck, ChevronLeft, ChevronRight } from 'lucide-react';

export const ViajesPage = () => {
  const user = useAuthStore((state) => state.user);
  const esAdminOrOperador = user?.rol === 'ADMIN' || user?.rol === 'OPERADOR';

  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [choferes, setChoferes] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [viajeAEditar, setViajeAEditar] = useState<Viaje | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  // Estados de Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const refrescarDatos = async () => {
    setCargando(true);
    try {
      // Si es admin/operador carga todo, si es cliente carga los viajes disponibles/públicos o sus reservas
      const dataViajes = esAdminOrOperador 
        ? await viajeService.obtenerTodosAdmin() 
        : await viajeService.obtenerPublicos();

      const dataRutas = await rutaService.obtenerTodas().catch(() => []);
      
      let soloChoferes: Usuario[] = [];
      if (esAdminOrOperador) {
        const dataUsuarios = await usuarioService.obtenerTodos().catch(() => []);
        soloChoferes = (Array.isArray(dataUsuarios) ? dataUsuarios : []).filter(
          (u) => u.rol === 'CHOFER'
        );
      }

      setViajes(Array.isArray(dataViajes) ? dataViajes : []);
      setRutas(Array.isArray(dataRutas) ? dataRutas : []);
      setChoferes(soloChoferes);
    } catch (error) {
      console.error('Error al cargar datos de viajes:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const cargar = async () => {
      try {
        const dataViajes = esAdminOrOperador 
          ? await viajeService.obtenerTodosAdmin() 
          : await viajeService.obtenerPublicos();

        const dataRutas = await rutaService.obtenerTodas().catch(() => []);
        
        let soloChoferes: Usuario[] = [];
        if (esAdminOrOperador) {
          const dataUsuarios = await usuarioService.obtenerTodos().catch(() => []);
          soloChoferes = (Array.isArray(dataUsuarios) ? dataUsuarios : []).filter(
            (u) => u.rol === 'CHOFER'
          );
        }

        if (isMounted) {
          setViajes(Array.isArray(dataViajes) ? dataViajes : []);
          setRutas(Array.isArray(dataRutas) ? dataRutas : []);
          setChoferes(soloChoferes);
        }
      } catch (error) {
        if (isMounted) console.error('Error al cargar datos de viajes:', error);
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargar();

    return () => {
      isMounted = false;
    };
  }, [esAdminOrOperador]);

  // Bloquear scroll del fondo cuando el modal esté abierto
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

  // Helper para resolver el nombre del chofer de forma segura
  const obtenerNombreChoferTexto = (viaje: Viaje) => {
    if (viaje.chofer && typeof viaje.chofer === 'object') {
      const nombre = viaje.chofer.nombre ?? '';
      const apellido = viaje.chofer.apellido ?? '';
      if (nombre || apellido) return `${nombre} ${apellido}`.trim();
    }
    const idChofer = viaje.idChofer || (typeof viaje.chofer === 'string' ? viaje.chofer : '');
    if (!idChofer) return 'Sin chofer asignado';

    const c = choferes.find((item) => item.idUsuario === idChofer || item.id === idChofer);
    return c ? `${c.nombre} ${c.apellido}` : 'Sin chofer asignado';
  };

  // Helper robusto para extraer el nombre de la ruta
  const obtenerNombreRutaTexto = (v: Viaje) => {
    if (v.rutaNombre) return v.rutaNombre;
    if ((v as { nombreRuta?: string }).nombreRuta) return (v as { nombreRuta?: string }).nombreRuta!;

    if (v.ruta && typeof v.ruta === 'object') {
      const rutaObj = v.ruta as {
        nombre?: string;
        origen?: string | { nombre?: string };
        destino?: string | { nombre?: string };
      };
      if (rutaObj.nombre) return rutaObj.nombre;
      if (rutaObj.origen && rutaObj.destino) {
        const origen = typeof rutaObj.origen === 'object' ? rutaObj.origen.nombre : rutaObj.origen;
        const destino = typeof rutaObj.destino === 'object' ? rutaObj.destino.nombre : rutaObj.destino;
        return `${origen} ➔ ${destino}`;
      }
    }

    if (typeof v.ruta === 'string') return v.ruta;

    const encontrada = rutas.find((r) => r.idRuta === v.idRuta);
    if (encontrada?.nombre) return encontrada.nombre;

    return 'Ruta sin nombre';
  };

  const viajesFiltrados = useMemo(() => {
    return viajes.filter((v) => {
      const query = busqueda.toLowerCase().trim();
      const rutaNombre = obtenerNombreRutaTexto(v).toLowerCase();
      const choferNombre = obtenerNombreChoferTexto(v).toLowerCase();
      const tipoViaje = v.tipo?.toLowerCase() || '';

      return (
        !query ||
        rutaNombre.includes(query) ||
        choferNombre.includes(query) ||
        tipoViaje.includes(query)
      );
    });
  }, [viajes, busqueda, choferes, rutas]);

  const totalPaginas = Math.ceil(viajesFiltrados.length / elementosPorPagina) || 1;

  const viajesPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return viajesFiltrados.slice(inicio, inicio + elementosPorPagina);
  }, [viajesFiltrados, paginaActual]);

  const abrirModalCrear = () => {
    setIdEditando(null);
    setViajeAEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (viaje: Viaje) => {
    const idReal = viaje.id || (viaje as { idViaje?: string }).idViaje || '';
    setIdEditando(idReal);
    setViajeAEditar(viaje);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setIdEditando(null);
    setViajeAEditar(null);
    setModalAbierto(false);
  };

  const handleEliminar = async (id?: string) => {
    if (!id) return;
    if (window.confirm('¿Estás seguro de eliminar este viaje programado?')) {
      try {
        await viajeService.eliminar(id);
        if (idEditando === id) cerrarModal();
        await refrescarDatos();
      } catch (error) {
        console.error('Error al eliminar viaje:', error);
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bold text-gray-900">
            {esAdminOrOperador ? 'Gestión de Viajes' : 'Viajes Disponibles'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refrescarDatos}
            disabled={cargando}
            className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Recargar viajes"
          >
            <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
          </button>

          {esAdminOrOperador && (
            <button
              onClick={abrirModalCrear}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              Programar Viaje
            </button>
          )}
        </div>
      </div>

      {/* 2. BARRA DE BÚSQUEDA */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por ruta, chofer o tipo de viaje..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* 3. TABLA PRINCIPAL DE VIAJES */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">
            {esAdminOrOperador ? 'Viajes Programados' : 'Lista de Viajes'}
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            Total: {viajesFiltrados.length}
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm">Cargando viajes...</p>
          </div>
        ) : viajesFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <Truck className="w-12 h-12 text-gray-300" />
            <p className="font-medium text-gray-700">No se encontraron viajes programados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Ruta / Tipo</th>
                    <th className="py-3 px-4">Chofer</th>
                    <th className="py-3 px-4">Salida</th>
                    <th className="py-3 px-4 text-center">Cupos</th>
                    <th className="py-3 px-4 text-right">Precio</th>
                    {esAdminOrOperador && <th className="py-3 px-4 text-right">Acciones</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viajesPaginados.map((v, idx) => {
                    const idViajeActual = v.id || (v as { idViaje?: string }).idViaje || String(idx);

                    return (
                      <tr key={idViajeActual} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <div>{obtenerNombreRutaTexto(v)}</div>
                          <span className="text-xs text-amber-600 font-semibold">{v.tipo || 'COMPARTIDO'}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {obtenerNombreChoferTexto(v)}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500">
                          {v.fechaHoraInicio ? new Date(v.fechaHoraInicio).toLocaleString('es-AR') : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2.5 py-1 text-xs font-medium rounded-full text-slate-700">
                            {v.capacidadPasajeros ?? 0} pas. / {v.capacidadValijas ?? 0} val.
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-slate-900">
                          ${v.precio ?? 0}
                        </td>
                        {esAdminOrOperador && (
                          <td className="py-3 px-4 text-right space-x-3">
                            <button
                              onClick={() => abrirModalEditar(v)}
                              className="text-amber-600 hover:text-amber-800 font-semibold text-xs transition cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminar(v.id || (v as { idViaje?: string }).idViaje)}
                              className="text-red-600 hover:text-red-800 font-semibold text-xs transition cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </td>
                        )}
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

      {/* 4. MODAL FLOTANTE PARA PROGRAMAR / EDITAR VIAJE */}
      {modalAbierto && esAdminOrOperador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col relative overflow-hidden">
            {/* Header Fijo */}
            <div className="flex justify-between items-center border-b px-6 py-4 bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-800">
                {idEditando ? 'Editar Viaje' : 'Programar Viaje'}
              </h2>
              <button
                type="button"
                onClick={cerrarModal}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenido con scroll interno */}
            <div className="p-6 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <ViajeForm
                idEditando={idEditando}
                viajeAEditar={viajeAEditar}
                rutasDisponibles={rutas}
                choferesDisponibles={choferes}
                onSuccess={() => {
                  cerrarModal();
                  refrescarDatos();
                }}
                onCancelar={cerrarModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViajesPage;