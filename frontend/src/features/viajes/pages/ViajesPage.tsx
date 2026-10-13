// src/features/viajes/pages/ViajesPage.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  AlertCircle,
  Search,
  Filter,
  Car,
} from 'lucide-react';
import type { Viaje } from '../../../types';
import { useModalStore } from '../../../store/useModalStore';
import { useAuthStore } from '../../../store/authStore';
import { viajeService } from '../api/viajeService';
import { ViajesTabla } from '../components/ViajesTabla';

export function ViajesPage() {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'compartidos' | 'privados'>(
    'compartidos',
  );

  const { openModal } = useModalStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<
    'TODOS' | 'COMPARTIDO' | 'PRIVADO'
  >('TODOS');

  const rol = user?.rol?.toUpperCase();
  const esAdminOrOperador =
    rol === 'ADMIN' || rol === 'ADMINISTRADOR' || rol === 'OPERADOR';

  const usuarioIdActual = user?.idUsuario || user?.id;

  const cargarSegunRol = useCallback(async (): Promise<Viaje[]> => {
    if (esAdminOrOperador) {
      return await viajeService.obtenerTodosAdmin();
    }
    if (rol === 'CHOFER' || rol === 'PASAJERO' || rol === 'CLIENTE') {
      return await viajeService.obtenerMisViajes();
    }
    return await viajeService.obtenerPublicos();
  }, [rol, esAdminOrOperador]);

  // 🟢 CORRECCIÓN: Función asíncrona dentro de useEffect que evita setState síncrono en cascada
  useEffect(() => {
    let cancelado = false;

    const sincronizarDatos = async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await cargarSegunRol();
        if (!cancelado) {
          setViajes(data);
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : 'Ocurrió un error al cargar los viajes.',
          );
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    sincronizarDatos();

    return () => {
      cancelado = true;
    };
  }, [cargarSegunRol, location]);

  const viajesFiltrados = useMemo(() => {
    return viajes.filter((viaje) => {
      const query = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        !query ||
        (viaje.rutaNombre && viaje.rutaNombre.toLowerCase().includes(query)) ||
        viaje.id.toString().toLowerCase().includes(query);

      const coincideTipo =
        filtroTipo === 'TODOS' || viaje.tipo?.toUpperCase() === filtroTipo;

      return coincideBusqueda && coincideTipo;
    });
  }, [viajes, busqueda, filtroTipo]);

  const viajesCompartidos = useMemo(() => {
    return viajesFiltrados.filter(
      (v) => v.tipo?.toUpperCase() === 'COMPARTIDO',
    );
  }, [viajesFiltrados]);

  const viajesPrivados = useMemo(() => {
    return viajesFiltrados.filter((v) => v.tipo?.toUpperCase() === 'PRIVADO');
  }, [viajesFiltrados]);

  const handleCrear = () => {
    openModal('CREAR_VIAJE', {
      data: {
        onSuccess: async () => {
          const data = await cargarSegunRol();
          setViajes(data);
        },
      },
    });
  };

  const handleEditar = (viaje: Viaje) => {
    openModal('EDITAR_VIAJE', {
      data: {
        viaje,
        onSuccess: async () => {
          const data = await cargarSegunRol();
          setViajes(data);
        },
      },
    });
  };

  const handleEliminar = (id: string) => {
    openModal('CONFIRMAR_ELIMINAR', {
      data: {
        mensaje: '¿Estás seguro de que deseas eliminar este viaje?',
        onConfirm: async () => {
          await viajeService.eliminar(id);
          const data = await cargarSegunRol();
          setViajes(data);
        },
      },
    });
  };

  const handleVerDetalle = (viaje: Viaje) => {
    const esCliente = !user || rol === 'CLIENTE' || rol === 'PASAJERO';
    const esCompartido = viaje.tipo?.toUpperCase() === 'COMPARTIDO';

    if (esCliente) {
      if (esCompartido) {
        openModal('DETALLE_VIAJE_PUBLICO', {
          data: {
            viaje,
            onSuccess: async () => {
              const data = await cargarSegunRol();
              setViajes(data);
            },
          },
        });
      } else {
        openModal('VER_DETALLE_VIAJE', { data: { viaje } });
      }
    } else {
      openModal('VER_DETALLE_VIAJE', { data: { viaje } });
    }
  };

  
  const renderContenedorTabla = (
    listaViajes: Viaje[],
    mensajeVacio: string,
  ) => {
    if (cargando) {
      return (
        <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm">Cargando viajes...</p>
        </div>
      );
    }

    if (listaViajes.length === 0) {
      return (
        <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
          <Car className="w-12 h-12 text-gray-300" />
          <p className="font-medium text-gray-700">No se encontraron viajes</p>
          <p className="text-sm text-gray-400">{mensajeVacio}</p>
        </div>
      );
    }

    return (
      <ViajesTabla
        viajes={listaViajes}
        rutasDisponibles={[]}
        choferesDisponibles={[]}
        cargando={cargando}
        esAdmin={esAdminOrOperador}
        usuarioId={usuarioIdActual}
        onSeleccionarViaje={handleVerDetalle}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />
    );
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {esAdminOrOperador ? 'Gestión de Viajes' : 'Viajes Disponibles'}
          </h1>
          <p className="text-sm text-gray-500">
            {user
              ? `Vista personalizada para rol: ${user.rol}`
              : 'Mostrando viajes públicos'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={async () => {
              const data = await cargarSegunRol();
              setViajes(data);
            }}
            disabled={cargando}
            className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Recargar viajes"
          >
            <RefreshCw
              className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`}
            />
          </button>

          {esAdminOrOperador && (
            <button
              onClick={handleCrear}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nuevo Viaje
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={async () => {
              const data = await cargarSegunRol();
              setViajes(data);
            }}
            className="text-sm font-semibold text-red-700 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre de ruta o ID..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
          />
        </div>

        {esAdminOrOperador && (
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-5 h-5" />
            <select
              value={filtroTipo}
              onChange={(e) =>
                setFiltroTipo(
                  e.target.value as 'TODOS' | 'COMPARTIDO' | 'PRIVADO',
                )
              }
              className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="COMPARTIDO">Compartido</option>
              <option value="PRIVADO">Privado</option>
            </select>
          </div>
        )}
      </div>

      {/* Pestañas para clientes */}
      {!esAdminOrOperador ? (
        <div className="space-y-4">
          <div className="flex border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('compartidos')}
              className={`pb-3 px-5 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'compartidos'
                  ? 'border-amber-500 text-amber-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>🚐</span>
              <span>Viajes Compartidos</span>
              <span className="ml-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full font-bold">
                {viajesCompartidos.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privados')}
              className={`pb-3 px-5 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'privados'
                  ? 'border-amber-500 text-amber-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>🔒</span>
              <span>Mis Traslados Privados</span>
              <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full font-bold">
                {viajesPrivados.length}
              </span>
            </button>
          </div>

          <div>
            {activeTab === 'compartidos'
              ? renderContenedorTabla(
                  viajesCompartidos,
                  'No hay viajes compartidos disponibles.',
                )
              : renderContenedorTabla(
                  viajesPrivados,
                  'No tienes traslados privados asignados.',
                )}
          </div>
        </div>
      ) : (
        renderContenedorTabla(
          viajesFiltrados,
          'Intenta cambiar los parámetros de búsqueda.',
        )
      )}
    </div>
  );
}

export default ViajesPage;

// // src/features/viajes/pages/ViajesPage.tsx
// import { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   Plus,
//   RefreshCw,
//   AlertCircle,
//   Search,
//   Filter,
//   Car,
// } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { useModalStore } from '../../../store/useModalStore';
// import { useAuthStore } from '../../../store/authStore';
// import { viajeService } from '../api/viajeService';
// import { ViajesTabla } from '../components/ViajesTabla';

// export function ViajesPage() {
//   const [viajes, setViajes] = useState<Viaje[]>([]);
//   const [cargando, setCargando] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const [activeTab, setActiveTab] = useState<'compartidos' | 'privados'>(
//     'compartidos',
//   );

//   const { openModal } = useModalStore();
//   const { user } = useAuthStore();

//   const [busqueda, setBusqueda] = useState<string>('');
//   const [filtroTipo, setFiltroTipo] = useState<
//     'TODOS' | 'COMPARTIDO' | 'PRIVADO'
//   >('TODOS');

//   const rol = user?.rol?.toUpperCase();
//   const esAdminOrOperador =
//     rol === 'ADMIN' || rol === 'ADMINISTRADOR' || rol === 'OPERADOR';

//   const usuarioIdActual = user?.idUsuario || user?.id;

//   const cargarSegunRol = useCallback(async (): Promise<Viaje[]> => {
//     if (esAdminOrOperador) {
//       return await viajeService.obtenerTodosAdmin();
//     }
//     if (rol === 'CHOFER' || rol === 'PASAJERO' || rol === 'CLIENTE') {
//       return await viajeService.obtenerMisViajes();
//     }
//     return await viajeService.obtenerPublicos();
//   }, [rol, esAdminOrOperador]);

//   const cargarViajes = useCallback(async () => {
//     setCargando(true);
//     setError(null);
//     try {
//       const data = await cargarSegunRol();
//       setViajes(data);
//     } catch (err) {
//       setError(
//         err instanceof Error
//           ? err.message
//           : 'Ocurrió un error al cargar los viajes.',
//       );
//     } finally {
//       setCargando(false);
//     }
//   }, [cargarSegunRol]);

//   useEffect(() => {
//     let cancelado = false;
//     const inicializarCarga = async () => {
//       setCargando(true);
//       setError(null);
//       try {
//         const data = await cargarSegunRol();
//         if (!cancelado) setViajes(data);
//       } catch (err) {
//         if (!cancelado) {
//           setError(
//             err instanceof Error
//               ? err.message
//               : 'Ocurrió un error al cargar los viajes.',
//           );
//         }
//       } finally {
//         if (!cancelado) setCargando(false);
//       }
//     };
//     inicializarCarga();
//     return () => {
//       cancelado = true;
//     };
//   }, [cargarSegunRol]);

//   const viajesFiltrados = useMemo(() => {
//     return viajes.filter((viaje) => {
//       const query = busqueda.toLowerCase().trim();
//       const coincideBusqueda =
//         !query ||
//         (viaje.rutaNombre && viaje.rutaNombre.toLowerCase().includes(query)) ||
//         viaje.id.toString().toLowerCase().includes(query);

//       const coincideTipo =
//         filtroTipo === 'TODOS' || viaje.tipo?.toUpperCase() === filtroTipo;

//       return coincideBusqueda && coincideTipo;
//     });
//   }, [viajes, busqueda, filtroTipo]);

//   const viajesCompartidos = useMemo(() => {
//     return viajesFiltrados.filter(
//       (v) => v.tipo?.toUpperCase() === 'COMPARTIDO',
//     );
//   }, [viajesFiltrados]);

//   const viajesPrivados = useMemo(() => {
//     return viajesFiltrados.filter((v) => v.tipo?.toUpperCase() === 'PRIVADO');
//   }, [viajesFiltrados]);

//   const handleCrear = () => {
//     openModal('CREAR_VIAJE', { data: { onSuccess: cargarViajes } });
//   };

//   const handleEditar = (viaje: Viaje) => {
//     openModal('EDITAR_VIAJE', { data: { viaje, onSuccess: cargarViajes } });
//   };

//   const handleEliminar = (id: string) => {
//     openModal('CONFIRMAR_ELIMINAR', {
//       data: {
//         mensaje: '¿Estás seguro de que deseas eliminar este viaje?',
//         onConfirm: async () => {
//           await viajeService.eliminar(id);
//           cargarViajes();
//         },
//       },
//     });
//   };

//   const handleVerDetalle = (viaje: Viaje) => {
//     const esCliente = !user || rol === 'CLIENTE' || rol === 'PASAJERO';
//     const esCompartido = viaje.tipo?.toUpperCase() === 'COMPARTIDO';

//     if (esCliente) {
//       if (esCompartido) {
//         openModal('DETALLE_VIAJE_PUBLICO', {
//           data: {
//             viaje,
//             onSuccess: cargarViajes,
//           },
//         });
//       } else {
//         openModal('VER_DETALLE_VIAJE', { data: { viaje } });
//       }
//     } else {
//       openModal('VER_DETALLE_VIAJE', { data: { viaje } });
//     }
//   };

//   const renderContenedorTabla = (
//     listaViajes: Viaje[],
//     mensajeVacio: string,
//   ) => {
//     if (cargando) {
//       return (
//         <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//           <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
//           <p className="text-sm">Cargando viajes...</p>
//         </div>
//       );
//     }

//     if (listaViajes.length === 0) {
//       return (
//         <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//           <Car className="w-12 h-12 text-gray-300" />
//           <p className="font-medium text-gray-700">No se encontraron viajes</p>
//           <p className="text-sm text-gray-400">{mensajeVacio}</p>
//         </div>
//       );
//     }

//     return (
//       <ViajesTabla
//         viajes={listaViajes}
//         rutasDisponibles={[]}
//         choferesDisponibles={[]}
//         cargando={cargando}
//         esAdmin={esAdminOrOperador}
//         usuarioId={usuarioIdActual}
//         onSeleccionarViaje={handleVerDetalle}
//         onEditar={handleEditar}
//         onEliminar={handleEliminar}
//       />
//     );
//   };

//   return (
//     <div className="p-6 space-y-6 max-w-7xl mx-auto">
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             {esAdminOrOperador ? 'Gestión de Viajes' : 'Viajes Disponibles'}
//           </h1>
//           <p className="text-sm text-gray-500">
//             {user
//               ? `Vista personalizada para rol: ${user.rol}`
//               : 'Mostrando viajes públicos'}
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={cargarViajes}
//             disabled={cargando}
//             className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
//             title="Recargar viajes"
//           >
//             <RefreshCw
//               className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`}
//             />
//           </button>

//           {esAdminOrOperador && (
//             <button
//               onClick={handleCrear}
//               className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
//             >
//               <Plus className="w-5 h-5" />
//               Nuevo Viaje
//             </button>
//           )}
//         </div>
//       </div>

//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-5 h-5 text-red-500" />
//             <p className="text-sm text-red-700">{error}</p>
//           </div>
//           <button
//             onClick={cargarViajes}
//             className="text-sm font-semibold text-red-700 hover:underline"
//           >
//             Reintentar
//           </button>
//         </div>
//       )}

//       {/* 🟢 BARRA DE BÚSQUEDA Y FILTROS RESTAURADA */}
//       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Buscar por nombre de ruta o ID..."
//             value={busqueda}
//             onChange={(e) => setBusqueda(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
//           />
//         </div>

//         {esAdminOrOperador && (
//           <div className="flex items-center gap-2">
//             <Filter className="text-gray-400 w-5 h-5" />
//             <select
//               value={filtroTipo}
//               onChange={(e) =>
//                 setFiltroTipo(
//                   e.target.value as 'TODOS' | 'COMPARTIDO' | 'PRIVADO',
//                 )
//               }
//               className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
//             >
//               <option value="TODOS">Todos los tipos</option>
//               <option value="COMPARTIDO">Compartido</option>
//               <option value="PRIVADO">Privado</option>
//             </select>
//           </div>
//         )}
//       </div>

//       {/* Pestañas para clientes */}
//       {!esAdminOrOperador ? (
//         <div className="space-y-4">
//           <div className="flex border-b border-gray-200">
//             <button
//               type="button"
//               onClick={() => setActiveTab('compartidos')}
//               className={`pb-3 px-5 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
//                 activeTab === 'compartidos'
//                   ? 'border-amber-500 text-amber-600 font-semibold'
//                   : 'border-transparent text-gray-500 hover:text-gray-800'
//               }`}
//             >
//               <span>🚐</span>
//               <span>Viajes Compartidos</span>
//               <span className="ml-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full font-bold">
//                 {viajesCompartidos.length}
//               </span>
//             </button>

//             <button
//               type="button"
//               onClick={() => setActiveTab('privados')}
//               className={`pb-3 px-5 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
//                 activeTab === 'privados'
//                   ? 'border-amber-500 text-amber-600 font-semibold'
//                   : 'border-transparent text-gray-500 hover:text-gray-800'
//               }`}
//             >
//               <span>🔒</span>
//               <span>Mis Traslados Privados</span>
//               <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full font-bold">
//                 {viajesPrivados.length}
//               </span>
//             </button>
//           </div>

//           <div>
//             {activeTab === 'compartidos'
//               ? renderContenedorTabla(
//                   viajesCompartidos,
//                   'No hay viajes compartidos disponibles.',
//                 )
//               : renderContenedorTabla(
//                   viajesPrivados,
//                   'No tienes traslados privados asignados.',
//                 )}
//           </div>
//         </div>
//       ) : (
//         renderContenedorTabla(
//           viajesFiltrados,
//           'Intenta cambiar los parámetros de búsqueda.',
//         )
//       )}
//     </div>
//   );
// }

// export default ViajesPage;

// antes ultima prueba

// // src/features/viajes/pages/ViajesPage.tsx
// import { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   Plus,
//   RefreshCw,
//   AlertCircle,
//   Search,
//   Filter,
//   Car,
// } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { useModalStore } from '../../../store/useModalStore';
// import { useAuthStore } from '../../../store/authStore';
// import { viajeService } from '../api/viajeService';
// import { ViajesTabla } from '../components/ViajesTabla';

// export function ViajesPage() {
//   const [viajes, setViajes] = useState<Viaje[]>([]);
//   const [cargando, setCargando] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Pestaña activa para clientes / pasajeros ('compartidos' | 'privados')
//   const [activeTab, setActiveTab] = useState<'compartidos' | 'privados'>(
//     'compartidos',
//   );

//   // Stores
//   const { openModal } = useModalStore();
//   const { user } = useAuthStore();

//   // Filtros
//   const [busqueda, setBusqueda] = useState<string>('');
//   const [filtroTipo, setFiltroTipo] = useState<
//     'TODOS' | 'COMPARTIDO' | 'PRIVADO'
//   >('TODOS');

//   const rol = user?.rol?.toUpperCase();
//   const esAdminOrOperador =
//     rol === 'ADMIN' || rol === 'ADMINISTRADOR' || rol === 'OPERADOR';

//   // ID del usuario logueado
//   const usuarioIdActual = user?.idUsuario || user?.id;

//   // Lógica condicional según el rol del usuario
//   const cargarSegunRol = useCallback(async (): Promise<Viaje[]> => {
//     if (esAdminOrOperador) {
//       return await viajeService.obtenerTodosAdmin();
//     }

//     if (rol === 'CHOFER' || rol === 'PASAJERO' || rol === 'CLIENTE') {
//       return await viajeService.obtenerMisViajes();
//     }

//     return await viajeService.obtenerPublicos();
//   }, [rol, esAdminOrOperador]);

//   // Recarga manual de viajes
//   const cargarViajes = useCallback(async () => {
//     setCargando(true);
//     setError(null);
//     try {
//       const data = await cargarSegunRol();
//       setViajes(data);
//     } catch (err) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError('Ocurrió un error al cargar los viajes.');
//       }
//     } finally {
//       setCargando(false);
//     }
//   }, [cargarSegunRol]);

//   // Carga inicial
//   useEffect(() => {
//     let cancelado = false;

//     const inicializarCarga = async () => {
//       setCargando(true);
//       setError(null);
//       try {
//         const data = await cargarSegunRol();
//         if (!cancelado) setViajes(data);
//       } catch (err) {
//         if (!cancelado) {
//           setError(
//             err instanceof Error
//               ? err.message
//               : 'Ocurrió un error al cargar los viajes.',
//           );
//         }
//       } finally {
//         if (!cancelado) setCargando(false);
//       }
//     };

//     inicializarCarga();

//     return () => {
//       cancelado = true;
//     };
//   }, [cargarSegunRol]);

//   // Filtrado general
//   const viajesFiltrados = useMemo(() => {
//     return viajes.filter((viaje) => {
//       const query = busqueda.toLowerCase().trim();
//       const coincideBusqueda =
//         !query ||
//         (viaje.rutaNombre && viaje.rutaNombre.toLowerCase().includes(query)) ||
//         viaje.id.toString().toLowerCase().includes(query);

//       const coincideTipo =
//         filtroTipo === 'TODOS' || viaje.tipo?.toUpperCase() === filtroTipo;

//       return coincideBusqueda && coincideTipo;
//     });
//   }, [viajes, busqueda, filtroTipo]);

//   // Separación por pestañas para Clientes / Pasajeros
//   const viajesCompartidos = useMemo(() => {
//     return viajesFiltrados.filter(
//       (v) => v.tipo?.toUpperCase() === 'COMPARTIDO',
//     );
//   }, [viajesFiltrados]);

//   const viajesPrivados = useMemo(() => {
//     return viajesFiltrados.filter((v) => v.tipo?.toUpperCase() === 'PRIVADO');
//   }, [viajesFiltrados]);

//   // Handlers para acciones
//   const handleCrear = () => {
//     openModal('CREAR_VIAJE', { onSuccess: cargarViajes });
//   };

//   const handleEditar = (viaje: Viaje) => {
//     openModal('EDITAR_VIAJE', { viaje, onSuccess: cargarViajes });
//   };

//   const handleEliminar = (id: string) => {
//     openModal('CONFIRMAR_ELIMINAR', {
//       mensaje: '¿Estás seguro de que deseas eliminar este viaje?',
//       onConfirm: async () => {
//         await viajeService.eliminar(id);
//         cargarViajes();
//       },
//     });
//   };

//   // 🟢 Distinción de modales: Compartidos interactivos con opción de reserva / Privados solo informativos
//   const handleVerDetalle = (viaje: Viaje) => {
//     const esCliente = !user || rol === 'CLIENTE' || rol === 'PASAJERO';
//     const esCompartido = viaje.tipo?.toUpperCase() === 'COMPARTIDO';

//     if (esCliente) {
//       if (esCompartido) {
//         openModal('DETALLE_VIAJE_PUBLICO' as any, {
//           viaje,
//           onSuccess: cargarViajes,
//         });
//       } else {
//         openModal('VER_DETALLE_VIAJE', { viaje });
//       }
//     } else {
//       openModal('VER_DETALLE_VIAJE', { viaje });
//     }
//   };

//   const handleReservar = (viaje: Viaje) => {
//     openModal('CREAR_RESERVA' as any, { viaje, onSuccess: cargarViajes });
//   };

//   // Renderizador auxiliar
//   const renderContenedorTabla = (
//     listaViajes: Viaje[],
//     mensajeVacio: string,
//   ) => {
//     if (cargando) {
//       return (
//         <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//           <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
//           <p className="text-sm">Cargando viajes...</p>
//         </div>
//       );
//     }

//     if (listaViajes.length === 0) {
//       return (
//         <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//           <Car className="w-12 h-12 text-gray-300" />
//           <p className="font-medium text-gray-700">No se encontraron viajes</p>
//           <p className="text-sm text-gray-400">{mensajeVacio}</p>
//         </div>
//       );
//     }

//     return (
//       <ViajesTabla
//         viajes={listaViajes}
//         rutasDisponibles={[]}
//         choferesDisponibles={[]}
//         cargando={cargando}
//         esAdmin={esAdminOrOperador}
//         usuarioId={usuarioIdActual}
//         onSeleccionarViaje={handleVerDetalle}
//         onEditar={handleEditar}
//         onEliminar={handleEliminar}
//         onReservar={handleReservar}
//       />
//     );
//   };

//   return (
//     <div className="p-6 space-y-6 max-w-7xl mx-auto">
//       {/* Header principal */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             {esAdminOrOperador ? 'Gestión de Viajes' : 'Viajes Disponibles'}
//           </h1>
//           <p className="text-sm text-gray-500">
//             {user
//               ? `Vista personalizada para rol: ${user.rol}`
//               : 'Mostrando viajes públicos disponibles'}
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={cargarViajes}
//             disabled={cargando}
//             className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
//             title="Recargar viajes"
//           >
//             <RefreshCw
//               className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`}
//             />
//           </button>

//           {esAdminOrOperador && (
//             <button
//               onClick={handleCrear}
//               className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
//             >
//               <Plus className="w-5 h-5" />
//               Nuevo Viaje
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Banner de error */}
//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-5 h-5 text-red-500" />
//             <p className="text-sm text-red-700">{error}</p>
//           </div>
//           <button
//             onClick={cargarViajes}
//             className="text-sm font-semibold text-red-700 hover:underline"
//           >
//             Reintentar
//           </button>
//         </div>
//       )}

//       {/* Filtros */}
//       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Buscar por nombre de ruta o ID..."
//             value={busqueda}
//             onChange={(e) => setBusqueda(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
//           />
//         </div>

//         {esAdminOrOperador && (
//           <div className="flex items-center gap-2">
//             <Filter className="text-gray-400 w-5 h-5" />
//             <select
//               value={filtroTipo}
//               onChange={(e) =>
//                 setFiltroTipo(
//                   e.target.value as 'TODOS' | 'COMPARTIDO' | 'PRIVADO',
//                 )
//               }
//               className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
//             >
//               <option value="TODOS">Todos los tipos</option>
//               <option value="COMPARTIDO">Compartido</option>
//               <option value="PRIVADO">Privado</option>
//             </select>
//           </div>
//         )}
//       </div>

//       {/* SECCIÓN DE PESTAÑAS (TABS) PARA CLIENTES / PASAJEROS / PÚBLICO */}
//       {!esAdminOrOperador ? (
//         <div className="space-y-4">
//           <div className="flex border-b border-gray-200">
//             <button
//               type="button"
//               onClick={() => setActiveTab('compartidos')}
//               className={`pb-3 px-5 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
//                 activeTab === 'compartidos'
//                   ? 'border-amber-500 text-amber-600 font-semibold'
//                   : 'border-transparent text-gray-500 hover:text-gray-800'
//               }`}
//             >
//               <span>🚐</span>
//               <span>Viajes Compartidos</span>
//               <span className="ml-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full font-bold">
//                 {viajesCompartidos.length}
//               </span>
//             </button>

//             <button
//               type="button"
//               onClick={() => setActiveTab('privados')}
//               className={`pb-3 px-5 font-medium text-sm border-b-2 transition-all flex items-center gap-2 ${
//                 activeTab === 'privados'
//                   ? 'border-amber-500 text-amber-600 font-semibold'
//                   : 'border-transparent text-gray-500 hover:text-gray-800'
//               }`}
//             >
//               <span>🔒</span>
//               <span>Mis Traslados Privados</span>
//               <span className="ml-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded-full font-bold">
//                 {viajesPrivados.length}
//               </span>
//             </button>
//           </div>

//           <div>
//             {activeTab === 'compartidos' ? (
//               <div>
//                 <div className="bg-amber-50/50 border-b border-amber-100 p-3 text-xs text-amber-900 px-6 mb-4 rounded-lg">
//                   💡 <strong>Catálogo Abierto:</strong> Explora los viajes
//                   compartidos disponibles, inspecciona su itinerario detallado
//                   con paradas y realiza tu reserva.
//                 </div>
//                 {renderContenedorTabla(
//                   viajesCompartidos,
//                   'No hay viajes compartidos disponibles en este momento.',
//                 )}
//               </div>
//             ) : (
//               <div>
//                 <div className="bg-gray-50 border-b border-gray-200 p-3 text-xs text-gray-700 px-6 mb-4 rounded-lg">
//                   ℹ️ <strong>Traslados Privados:</strong> Tus servicios
//                   exclusivos asignados. Son de carácter informativo; recuerda
//                   que puedes gestionarlos desde tu sección de{' '}
//                   <strong>Reservas</strong>.
//                 </div>
//                 {renderContenedorTabla(
//                   viajesPrivados,
//                   'No tienes traslados privados asignados.',
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         /* Vista Estándar para ADMIN / OPERADOR */
//         <div>
//           {renderContenedorTabla(
//             viajesFiltrados,
//             'Intenta cambiar los parámetros de búsqueda o filtro.',
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// export default ViajesPage;
/**           */

// // src/features/viajes/pages/ViajesPage.tsx
// import { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   Plus,
//   RefreshCw,
//   AlertCircle,
//   Search,
//   Filter,
//   Car,
//   Eye,
//   Edit,
//   Trash2,
// } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { useModalStore } from '../../../store/useModalStore';
// import { useAuthStore } from '../../../store/authStore';
// import { viajeService } from '../api/viajeService';

// export function ViajesPage() {
//   const [viajes, setViajes] = useState<Viaje[]>([]);
//   const [cargando, setCargando] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Stores
//   const { openModal } = useModalStore();
//   const { user } = useAuthStore();

//   // Filtros
//   const [busqueda, setBusqueda] = useState<string>('');
//   const [filtroTipo, setFiltroTipo] = useState<
//     'TODOS' | 'COMPARTIDO' | 'PRIVADO'
//   >('TODOS');

//   // Lógica condicional según el rol del usuario
//   const cargarSegunRol = useCallback(async (): Promise<Viaje[]> => {
//     const rol = user?.rol?.toUpperCase();

//     if (rol === 'ADMIN' || rol === 'ADMINISTRADOR' || rol === 'OPERADOR') {
//       return await viajeService.obtenerTodosAdmin();
//     }

//     if (rol === 'CHOFER' || rol === 'PASAJERO' || rol === 'CLIENTE') {
//       return await viajeService.obtenerMisViajes();
//     }

//     return await viajeService.obtenerPublicos();
//   }, [user]);

//   // Recarga manual de viajes
//   const cargarViajes = useCallback(async () => {
//     setCargando(true);
//     setError(null);
//     try {
//       const data = await cargarSegunRol();
//       setViajes(data);
//     } catch (err) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError('Ocurrió un error al cargar los viajes.');
//       }
//     } finally {
//       setCargando(false);
//     }
//   }, [cargarSegunRol]);

//   // Carga inicial
//   useEffect(() => {
//     let cancelado = false;

//     const inicializarCarga = async () => {
//       setCargando(true);
//       setError(null);
//       try {
//         const data = await cargarSegunRol();
//         if (!cancelado) setViajes(data);
//       } catch (err) {
//         if (!cancelado) {
//           setError(
//             err instanceof Error
//               ? err.message
//               : 'Ocurrió un error al cargar los viajes.',
//           );
//         }
//       } finally {
//         if (!cancelado) setCargando(false);
//       }
//     };

//     inicializarCarga();

//     return () => {
//       cancelado = true;
//     };
//   }, [cargarSegunRol]);

//   // Filtrado
//   const viajesFiltrados = useMemo(() => {
//     return viajes.filter((viaje) => {
//       const query = busqueda.toLowerCase().trim();
//       const coincideBusqueda =
//         !query ||
//         (viaje.rutaNombre && viaje.rutaNombre.toLowerCase().includes(query)) ||
//         viaje.id.toString().toLowerCase().includes(query);

//       const coincideTipo =
//         filtroTipo === 'TODOS' || viaje.tipo?.toUpperCase() === filtroTipo;

//       return coincideBusqueda && coincideTipo;
//     });
//   }, [viajes, busqueda, filtroTipo]);

//   // Handlers para acciones
//   const handleCrear = () => {
//     openModal('CREAR_VIAJE', { onSuccess: cargarViajes });
//   };

//   const handleEditar = (viaje: Viaje) => {
//     openModal('EDITAR_VIAJE', { viaje, onSuccess: cargarViajes });
//   };

//   const handleEliminar = (id: string) => {
//     openModal('CONFIRMAR_ELIMINAR', {
//       mensaje: '¿Estás seguro de que deseas eliminar este viaje?',
//       onConfirm: async () => {
//         await viajeService.eliminar(id);
//         cargarViajes();
//       },
//     });
//   };

//   // 🟢 SECTOR MODIFICADO: Evalúa si es cliente para mostrar el modal de reserva/público
//   const handleVerDetalle = (viaje: Viaje) => {
//     const rol = user?.rol?.toUpperCase();
//     const esCliente = !user || rol === 'CLIENTE' || rol === 'PASAJERO';

//     if (esCliente) {
//       openModal('DETALLE_VIAJE_PUBLICO', { viaje });
//     } else {
//       openModal('VER_DETALLE_VIAJE', { viaje });
//     }
//   };

//   const esAdminOrOperador =
//     user?.rol?.toUpperCase() === 'ADMIN' ||
//     user?.rol?.toUpperCase() === 'ADMINISTRADOR' ||
//     user?.rol?.toUpperCase() === 'OPERADOR';

//   return (
//     <div className="p-6 space-y-6 max-w-7xl mx-auto">
//       {/* Header principal */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             {esAdminOrOperador ? 'Gestión de Viajes' : 'Viajes Disponibles'}
//           </h1>
//           <p className="text-sm text-gray-500">
//             {user
//               ? `Vista personalizada para rol: ${user.rol}`
//               : 'Mostrando viajes públicos disponibles'}
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={cargarViajes}
//             disabled={cargando}
//             className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
//             title="Recargar viajes"
//           >
//             <RefreshCw
//               className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`}
//             />
//           </button>

//           {esAdminOrOperador && (
//             <button
//               onClick={handleCrear}
//               className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
//             >
//               <Plus className="w-5 h-5" />
//               Nuevo Viaje
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Banner de error */}
//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-5 h-5 text-red-500" />
//             <p className="text-sm text-red-700">{error}</p>
//           </div>
//           <button
//             onClick={cargarViajes}
//             className="text-sm font-semibold text-red-700 hover:underline"
//           >
//             Reintentar
//           </button>
//         </div>
//       )}

//       {/* Filtros */}
//       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Buscar por nombre de ruta o ID..."
//             value={busqueda}
//             onChange={(e) => setBusqueda(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <Filter className="text-gray-400 w-5 h-5" />
//           <select
//             value={filtroTipo}
//             onChange={(e) =>
//               setFiltroTipo(
//                 e.target.value as 'TODOS' | 'COMPARTIDO' | 'PRIVADO',
//               )
//             }
//             className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
//           >
//             <option value="TODOS">Todos los tipos</option>
//             <option value="COMPARTIDO">Compartido</option>
//             <option value="PRIVADO">Privado</option>
//           </select>
//         </div>
//       </div>

//       {/* Tabla de Viajes */}
//       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//         {cargando ? (
//           <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//             <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
//             <p className="text-sm">Cargando viajes...</p>
//           </div>
//         ) : viajesFiltrados.length === 0 ? (
//           <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//             <Car className="w-12 h-12 text-gray-300" />
//             <p className="font-medium text-gray-700">
//               No se encontraron viajes
//             </p>
//             <p className="text-sm text-gray-400">
//               Intenta cambiar los parámetros de búsqueda o filtro.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   <th className="py-3 px-4">Ruta</th>
//                   <th className="py-3 px-4">Tipo</th>
//                   <th className="py-3 px-4">Salida</th>
//                   <th className="py-3 px-4">Capacidad</th>
//                   <th className="py-3 px-4">Precio Base</th>
//                   <th className="py-3 px-4 text-right">Acciones</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 text-sm">
//                 {viajesFiltrados.map((viaje) => (
//                   <tr
//                     key={viaje.id}
//                     className="hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="py-3 px-4 font-medium text-gray-900">
//                       {viaje.rutaNombre || `Ruta ID: ${viaje.idRuta || 'N/A'}`}
//                     </td>
//                     <td className="py-3 px-4">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           viaje.tipo === 'PRIVADO'
//                             ? 'bg-purple-100 text-purple-800'
//                             : 'bg-blue-100 text-blue-800'
//                         }`}
//                       >
//                         {viaje.tipo}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4 text-gray-600">
//                       {viaje.fechaHoraInicio
//                         ? new Date(viaje.fechaHoraInicio).toLocaleString(
//                             'es-AR',
//                             {
//                               dateStyle: 'short',
//                               timeStyle: 'short',
//                             },
//                           )
//                         : 'Sin fecha'}
//                     </td>
//                     <td className="py-3 px-4 text-gray-600">
//                       👥 {viaje.capacidadPasajeros ?? 0} | 🧳{' '}
//                       {viaje.capacidadValijas ?? 0}
//                     </td>
//                     <td className="py-3 px-4 font-medium text-gray-900">
//                       ${viaje.precio ?? 0}
//                     </td>
//                     <td className="py-3 px-4 text-right space-x-2">
//                       <button
//                         onClick={() => handleVerDetalle(viaje)}
//                         className="p-1.5 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-gray-100"
//                         title="Ver detalle"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </button>

//                       {esAdminOrOperador && (
//                         <>
//                           <button
//                             onClick={() => handleEditar(viaje)}
//                             className="p-1.5 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-gray-100"
//                             title="Editar"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleEliminar(viaje.id)}
//                             className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
//                             title="Eliminar"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ViajesPage;

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   Plus,
//   RefreshCw,
//   AlertCircle,
//   Search,
//   Filter,
//   Car,
//   Eye,
//   Edit,
//   Trash2,
// } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { useModalStore } from '../../../store/useModalStore';
// import { useAuthStore } from '../../../store/authStore';
// import { viajeService } from '../api/viajeService';

// export function ViajesPage() {
//   const [viajes, setViajes] = useState<Viaje[]>([]);
//   const [cargando, setCargando] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Stores
//   const { openModal } = useModalStore();
//   const { user } = useAuthStore();

//   // Filtros
//   const [busqueda, setBusqueda] = useState<string>('');
//   const [filtroTipo, setFiltroTipo] = useState<
//     'TODOS' | 'COMPARTIDO' | 'PRIVADO'
//   >('TODOS');

//   // Lógica condicional según el rol del usuario
//   const cargarSegunRol = useCallback(async (): Promise<Viaje[]> => {
//     const rol = user?.rol?.toUpperCase();

//     if (rol === 'ADMIN' || rol === 'ADMINISTRADOR' || rol === 'OPERADOR') {
//       return await viajeService.obtenerTodosAdmin();
//     }

//     if (rol === 'CHOFER' || rol === 'PASAJERO' || rol === 'CLIENTE') {
//       return await viajeService.obtenerMisViajes();
//     }

//     return await viajeService.obtenerPublicos();
//   }, [user]);

//   // Recarga manual de viajes
//   const cargarViajes = useCallback(async () => {
//     setCargando(true);
//     setError(null);
//     try {
//       const data = await cargarSegunRol();
//       setViajes(data);
//     } catch (err) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError('Ocurrió un error al cargar los viajes.');
//       }
//     } finally {
//       setCargando(false);
//     }
//   }, [cargarSegunRol]);

//   // Carga inicial
//   useEffect(() => {
//     let cancelado = false;

//     const inicializarCarga = async () => {
//       setCargando(true);
//       setError(null);
//       try {
//         const data = await cargarSegunRol();
//         if (!cancelado) setViajes(data);
//       } catch (err) {
//         if (!cancelado) {
//           setError(
//             err instanceof Error
//               ? err.message
//               : 'Ocurrió un error al cargar los viajes.',
//           );
//         }
//       } finally {
//         if (!cancelado) setCargando(false);
//       }
//     };

//     inicializarCarga();

//     return () => {
//       cancelado = true;
//     };
//   }, [cargarSegunRol]);

//   // Filtrado
//   const viajesFiltrados = useMemo(() => {
//     return viajes.filter((viaje) => {
//       const query = busqueda.toLowerCase().trim();
//       const coincideBusqueda =
//         !query ||
//         (viaje.rutaNombre && viaje.rutaNombre.toLowerCase().includes(query)) ||
//         viaje.id.toString().toLowerCase().includes(query);

//       const coincideTipo =
//         filtroTipo === 'TODOS' || viaje.tipo?.toUpperCase() === filtroTipo;

//       return coincideBusqueda && coincideTipo;
//     });
//   }, [viajes, busqueda, filtroTipo]);

//   // Handlers para acciones
//   const handleCrear = () => {
//     openModal('CREAR_VIAJE', { onSuccess: cargarViajes });
//   };

//   const handleEditar = (viaje: Viaje) => {
//     openModal('EDITAR_VIAJE', { viaje, onSuccess: cargarViajes });
//   };

//   const handleEliminar = (id: string) => {
//     openModal('CONFIRMAR_ELIMINAR', {
//       mensaje: '¿Estás seguro de que deseas eliminar este viaje?',
//       onConfirm: async () => {
//         await viajeService.eliminar(id);
//         cargarViajes();
//       },
//     });
//   };

//   const handleVerDetalle = (viaje: Viaje) => {
//     if (!user) {
//       openModal('DETALLE_VIAJE_PUBLICO', { viaje });
//     } else {
//       openModal('VER_DETALLE_VIAJE', { viaje });
//     }
//   };

//   const esAdminOrOperador =
//     user?.rol?.toUpperCase() === 'ADMIN' ||
//     user?.rol?.toUpperCase() === 'ADMINISTRADOR' ||
//     user?.rol?.toUpperCase() === 'OPERADOR';

//   return (
//     <div className="p-6 space-y-6 max-w-7xl mx-auto">
//       {/* Header principal */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             {esAdminOrOperador ? 'Gestión de Viajes' : 'Viajes Disponibles'}
//           </h1>
//           <p className="text-sm text-gray-500">
//             {user
//               ? `Vista personalizada para rol: ${user.rol}`
//               : 'Mostrando viajes públicos disponibles'}
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={cargarViajes}
//             disabled={cargando}
//             className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
//             title="Recargar viajes"
//           >
//             <RefreshCw
//               className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`}
//             />
//           </button>

//           {esAdminOrOperador && (
//             <button
//               onClick={handleCrear}
//               className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
//             >
//               <Plus className="w-5 h-5" />
//               Nuevo Viaje
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Banner de error */}
//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-5 h-5 text-red-500" />
//             <p className="text-sm text-red-700">{error}</p>
//           </div>
//           <button
//             onClick={cargarViajes}
//             className="text-sm font-semibold text-red-700 hover:underline"
//           >
//             Reintentar
//           </button>
//         </div>
//       )}

//       {/* Filtros */}
//       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Buscar por nombre de ruta o ID..."
//             value={busqueda}
//             onChange={(e) => setBusqueda(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <Filter className="text-gray-400 w-5 h-5" />
//           <select
//             value={filtroTipo}
//             onChange={(e) =>
//               setFiltroTipo(
//                 e.target.value as 'TODOS' | 'COMPARTIDO' | 'PRIVADO',
//               )
//             }
//             className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
//           >
//             <option value="TODOS">Todos los tipos</option>
//             <option value="COMPARTIDO">Compartido</option>
//             <option value="PRIVADO">Privado</option>
//           </select>
//         </div>
//       </div>

//       {/* Tabla de Viajes */}
//       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//         {cargando ? (
//           <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//             <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
//             <p className="text-sm">Cargando viajes...</p>
//           </div>
//         ) : viajesFiltrados.length === 0 ? (
//           <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//             <Car className="w-12 h-12 text-gray-300" />
//             <p className="font-medium text-gray-700">
//               No se encontraron viajes
//             </p>
//             <p className="text-sm text-gray-400">
//               Intenta cambiar los parámetros de búsqueda o filtro.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   <th className="py-3 px-4">Ruta</th>
//                   <th className="py-3 px-4">Tipo</th>
//                   <th className="py-3 px-4">Salida</th>
//                   <th className="py-3 px-4">Capacidad</th>
//                   <th className="py-3 px-4">Precio Base</th>
//                   <th className="py-3 px-4 text-right">Acciones</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 text-sm">
//                 {viajesFiltrados.map((viaje) => (
//                   <tr
//                     key={viaje.id}
//                     className="hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="py-3 px-4 font-medium text-gray-900">
//                       {viaje.rutaNombre || `Ruta ID: ${viaje.idRuta || 'N/A'}`}
//                     </td>
//                     <td className="py-3 px-4">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           viaje.tipo === 'PRIVADO'
//                             ? 'bg-purple-100 text-purple-800'
//                             : 'bg-blue-100 text-blue-800'
//                         }`}
//                       >
//                         {viaje.tipo}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4 text-gray-600">
//                       {viaje.fechaHoraInicio
//                         ? new Date(viaje.fechaHoraInicio).toLocaleString(
//                             'es-AR',
//                             {
//                               dateStyle: 'short',
//                               timeStyle: 'short',
//                             },
//                           )
//                         : 'Sin fecha'}
//                     </td>
//                     <td className="py-3 px-4 text-gray-600">
//                       👥 {viaje.capacidadPasajeros ?? 0} | 🧳{' '}
//                       {viaje.capacidadValijas ?? 0}
//                     </td>
//                     <td className="py-3 px-4 font-medium text-gray-900">
//                       ${viaje.precio ?? 0}
//                     </td>
//                     <td className="py-3 px-4 text-right space-x-2">
//                       <button
//                         onClick={() => handleVerDetalle(viaje)}
//                         className="p-1.5 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-gray-100"
//                         title="Ver detalle"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </button>

//                       {esAdminOrOperador && (
//                         <>
//                           <button
//                             onClick={() => handleEditar(viaje)}
//                             className="p-1.5 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-gray-100"
//                             title="Editar"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleEliminar(viaje.id)}
//                             className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
//                             title="Eliminar"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default ViajesPage;

// import { useState, useEffect, useMemo, useCallback } from 'react';
// import {
//   Plus,
//   RefreshCw,
//   AlertCircle,
//   Search,
//   Filter,
//   Car,
//   Eye,
//   Edit,
//   Trash2,
// } from 'lucide-react';
// import type { Viaje } from '../../../types';
// import { useModalStore } from '../../../store/useModalStore';
// import { useAuthStore } from '../../../store/authStore';
// import { viajeService } from '../api/viajeService';

// export function ViajesPage() {
//   const [viajes, setViajes] = useState<Viaje[]>([]);
//   const [cargando, setCargando] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   // Zustand Stores
//   const { openModal } = useModalStore();
//   const { user } = useAuthStore();

//   // Estados de filtros
//   const [busqueda, setBusqueda] = useState<string>('');
//   const [filtroTipo, setFiltroTipo] = useState<
//     'TODOS' | 'COMPARTIDO' | 'PRIVADO'
//   >('TODOS');

//   // 1. Lógica condicional para consumir el endpoint correcto según el rol
//   const cargarSegunRol = useCallback(async (): Promise<Viaje[]> => {
//     const rol = user?.rol?.toUpperCase();

//     // ADMIN y OPERADOR: Ven el historial completo de viajes
//     if (rol === 'ADMIN' || rol === 'ADMINISTRADOR' || rol === 'OPERADOR') {
//       return await viajeService.obtenerTodosAdmin();
//     }

//     // CHOFER y PASAJERO / CLIENTE: Ven sus viajes asociados / reservados
//     if (rol === 'CHOFER' || rol === 'PASAJERO' || rol === 'CLIENTE') {
//       return await viajeService.obtenerMisViajes();
//     }

//     // INVITADO (o sin sesión): Solo viajes compartidos públicos
//     return await viajeService.obtenerPublicos();
//   }, [user]);

//   // 2. Función de recarga manual
//   const cargarViajes = useCallback(async () => {
//     setCargando(true);
//     setError(null);
//     try {
//       const data = await cargarSegunRol();
//       setViajes(data);
//     } catch (err) {
//       if (err instanceof Error) {
//         setError(err.message);
//       } else {
//         setError('Ocurrió un error al cargar los viajes.');
//       }
//     } finally {
//       setCargando(false);
//     }
//   }, [cargarSegunRol]);

//   // 3. Efecto inicial con soporte de cancelación para unmounting
//   useEffect(() => {
//     let cancelado = false;

//     const inicializarCarga = async () => {
//       setCargando(true);
//       setError(null);
//       try {
//         const data = await cargarSegunRol();
//         if (!cancelado) {
//           setViajes(data);
//         }
//       } catch (err) {
//         if (!cancelado) {
//           if (err instanceof Error) {
//             setError(err.message);
//           } else {
//             setError('Ocurrió un error al cargar los viajes.');
//           }
//         }
//       } finally {
//         if (!cancelado) {
//           setCargando(false);
//         }
//       }
//     };

//     inicializarCarga();

//     return () => {
//       cancelado = true;
//     };
//   }, [cargarSegunRol]);

//   // 4. Filtrado local en cliente por búsqueda y tipo
//   const viajesFiltrados = useMemo(() => {
//     return viajes.filter((viaje) => {
//       const coincideBusqueda =
//         (viaje.rutaNombre &&
//           viaje.rutaNombre.toLowerCase().includes(busqueda.toLowerCase())) ||
//         viaje.id.toLowerCase().includes(busqueda.toLowerCase());

//       const coincideTipo =
//         filtroTipo === 'TODOS' || viaje.tipo?.toUpperCase() === filtroTipo;

//       return coincideBusqueda && coincideTipo;
//     });
//   }, [viajes, busqueda, filtroTipo]);

//   // Handlers para modals y acciones
//   const handleCrear = () => {
//     openModal('CREAR_VIAJE', { onSuccess: cargarViajes });
//   };

//   const handleEditar = (viaje: Viaje) => {
//     openModal('EDITAR_VIAJE', { viaje, onSuccess: cargarViajes });
//   };

//   const handleEliminar = (id: string) => {
//     openModal('CONFIRMAR_ELIMINAR', {
//       mensaje: '¿Estás seguro de que deseas eliminar este viaje?',
//       onConfirm: async () => {
//         await viajeService.eliminar(id);
//         cargarViajes();
//       },
//     });
//   };

//   const esAdminOrOperador =
//     user?.rol?.toUpperCase() === 'ADMIN' ||
//     user?.rol?.toUpperCase() === 'ADMINISTRADOR' ||
//     user?.rol?.toUpperCase() === 'OPERADOR';

//   return (
//     <div className="p-6 space-y-6">
//       {/* Encabezado y Acciones Principal */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">
//             Gestión de Viajes
//           </h1>
//           <p className="text-sm text-gray-500">
//             {user
//               ? `Vista personalizada para rol: ${user.rol}`
//               : 'Mostrando viajes públicos disponibles'}
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={cargarViajes}
//             disabled={cargando}
//             className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
//             title="Recargar viajes"
//           >
//             <RefreshCw
//               className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`}
//             />
//           </button>

//           {esAdminOrOperador && (
//             <button
//               onClick={handleCrear}
//               className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
//             >
//               <Plus className="w-5 h-5" />
//               Nuevo Viaje
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Banner de Error */}
//       {error && (
//         <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <AlertCircle className="w-5 h-5 text-red-500" />
//             <p className="text-sm text-red-700">{error}</p>
//           </div>
//           <button
//             onClick={cargarViajes}
//             className="text-sm font-semibold text-red-700 hover:underline"
//           >
//             Reintentar
//           </button>
//         </div>
//       )}

//       {/* Barra de Búsqueda y Filtros */}
//       <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Buscar por nombre de ruta o ID..."
//             value={busqueda}
//             onChange={(e) => setBusqueda(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
//           />
//         </div>

//         <div className="flex items-center gap-2">
//           <Filter className="text-gray-400 w-5 h-5" />
//           <select
//             value={filtroTipo}
//             onChange={(e) =>
//               setFiltroTipo(
//                 e.target.value as 'TODOS' | 'COMPARTIDO' | 'PRIVADO',
//               )
//             }
//             className="border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
//           >
//             <option value="TODOS">Todos los tipos</option>
//             <option value="COMPARTIDO">Compartido</option>
//             <option value="PRIVADO">Privado</option>
//           </select>
//         </div>
//       </div>

//       {/* Tabla de Viajes */}
//       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//         {cargando ? (
//           <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//             <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
//             <p>Cargando viajes...</p>
//           </div>
//         ) : viajesFiltrados.length === 0 ? (
//           <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
//             <Car className="w-12 h-12 text-gray-300" />
//             <p className="font-medium text-gray-700">
//               No se encontraron viajes
//             </p>
//             <p className="text-sm text-gray-400">
//               Intenta cambiar los parámetros de búsqueda o filtro.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                   <th className="py-3 px-4">Ruta</th>
//                   <th className="py-3 px-4">Tipo</th>
//                   <th className="py-3 px-4">Salida</th>
//                   <th className="py-3 px-4">Capacidad</th>
//                   <th className="py-3 px-4">Precio Base</th>
//                   <th className="py-3 px-4 text-right">Acciones</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200 text-sm">
//                 {viajesFiltrados.map((viaje) => (
//                   <tr
//                     key={viaje.id}
//                     className="hover:bg-gray-50 transition-colors"
//                   >
//                     <td className="py-3 px-4 font-medium text-gray-900">
//                       {viaje.rutaNombre || `Ruta ID: ${viaje.idRuta || 'N/A'}`}
//                     </td>
//                     <td className="py-3 px-4">
//                       <span
//                         className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                           viaje.tipo === 'PRIVADO'
//                             ? 'bg-purple-100 text-purple-800'
//                             : 'bg-blue-100 text-blue-800'
//                         }`}
//                       >
//                         {viaje.tipo}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4 text-gray-600">
//                       {new Date(viaje.fechaHoraInicio).toLocaleString('es-AR', {
//                         dateStyle: 'short',
//                         timeStyle: 'short',
//                       })}
//                     </td>
//                     <td className="py-3 px-4 text-gray-600">
//                       👥 {viaje.capacidadPasajeros} | 🧳{' '}
//                       {viaje.capacidadValijas}
//                     </td>
//                     <td className="py-3 px-4 font-medium text-gray-900">
//                       ${viaje.precio}
//                     </td>
//                     <td className="py-3 px-4 text-right space-x-2">
//                       <button
//                         onClick={() =>
//                           openModal('VER_DETALLE_VIAJE', { viaje })
//                         }
//                         className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-gray-100"
//                         title="Ver detalle"
//                       >
//                         <Eye className="w-4 h-4" />
//                       </button>

//                       {esAdminOrOperador && (
//                         <>
//                           <button
//                             onClick={() => handleEditar(viaje)}
//                             className="p-1.5 text-gray-500 hover:text-amber-600 rounded-lg hover:bg-gray-100"
//                             title="Editar"
//                           >
//                             <Edit className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleEliminar(viaje.id)}
//                             className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-gray-100"
//                             title="Eliminar"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // import { useState, useEffect, useMemo, useCallback } from 'react';
// // import {
// //   Eye,
// //   RefreshCw,
// //   AlertCircle,
// //   Search,
// //   Filter,
// //   Car,
// //   UserCheck,
// //   Shield,
// // } from 'lucide-react';
// // import type { Viaje } from '../../../types/index';
// // import { useModalStore } from '../../../store/useModalStore';
// // import { viajeService } from '../api/viajeService'; // Importación correcta desde la carpeta api

// // export function ViajesPage() {
// //   const [viajes, setViajes] = useState<Viaje[]>([]);
// //   const [cargando, setCargando] = useState<boolean>(true);
// //   const [error, setError] = useState<string | null>(null);

// //   // Hook del Global Modal Store
// //   const { openModal } = useModalStore();

// //   // Estados de interfaz
// //   const [busqueda, setBusqueda] = useState<string>('');
// //   const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'PUBLICO' | 'PRIVADO'>(
// //     'TODOS',
// //   );

// //   const cargarViajes = useCallback(async () => {
// //     setCargando(true);
// //     setError(null);
// //     try {
// //       const data = await viajeService.obtenerTodosAdmin();
// //       setViajes(data);
// //     } catch (err) {
// //       if (err instanceof Error) {
// //         setError(err.message);
// //       } else {
// //         setError('Ocurrió un error desconocido al cargar los viajes.');
// //       }
// //     } finally {
// //       setCargando(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     let cancelado = false;

// //     const inicializarCarga = async () => {
// //       setCargando(true);
// //       setError(null);
// //       try {
// //         const data = await viajeService.obtenerTodosAdmin();
// //         if (!cancelado) {
// //           setViajes(data);
// //         }
// //       } catch (err) {
// //         if (!cancelado) {
// //           if (err instanceof Error) {
// //             setError(err.message);
// //           } else {
// //             setError('Ocurrió un error desconocido al cargar los viajes.');
// //           }
// //         }
// //       } finally {
// //         if (!cancelado) {
// //           setCargando(false);
// //         }
// //       }
// //     };

// //     inicializarCarga();

// //     return () => {
// //       cancelado = true;
// //     };
// //   }, []);

// //   const viajesFiltrados = useMemo(() => {
// //     return viajes.filter((viaje) => {
// //       const coincideTipo =
// //         filtroTipo === 'TODOS' ||
// //         (viaje.tipo && viaje.tipo.toUpperCase() === filtroTipo);

// //       const choferNombre =
// //         typeof viaje.chofer === 'object' && viaje.chofer !== null
// //           ? `${viaje.chofer.nombre || ''} ${viaje.chofer.apellido || ''}`.toLowerCase()
// //           : typeof viaje.chofer === 'string'
// //             ? viaje.chofer.toLowerCase()
// //             : '';

// //       const query = busqueda.toLowerCase().trim();
// //       const coincideBusqueda =
// //         !query ||
// //         viaje.id?.toString().includes(query) ||
// //         choferNombre.includes(query);

// //       return coincideTipo && coincideBusqueda;
// //     });
// //   }, [viajes, filtroTipo, busqueda]);

// //   const totalViajes = viajes.length;
// //   const totalPrivados = viajes.filter(
// //     (v) => v.tipo?.toUpperCase() === 'PRIVADO',
// //   ).length;
// //   const totalPublicos = totalViajes - totalPrivados;

// //   return (
// //     <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
// //       {/* Cabecera */}
// //       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// //         <div>
// //           <h1 className="text-2xl font-bold text-slate-900">
// //             Gestión de Viajes
// //           </h1>
// //           <p className="text-sm text-slate-500">
// //             Administra los traslados programados y examina su recorrido en
// //             detalle.
// //           </p>
// //         </div>

// //         <button
// //           onClick={cargarViajes}
// //           disabled={cargando}
// //           className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition self-start sm:self-auto disabled:opacity-50 shadow-sm"
// //         >
// //           <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
// //           Refrescar
// //         </button>
// //       </div>

// //       {/* Tarjetas de Métricas / KPIs */}
// //       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
// //         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
// //           <div>
// //             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
// //               Total Viajes
// //             </p>
// //             <p className="text-2xl font-bold text-slate-800 mt-1">
// //               {totalViajes}
// //             </p>
// //           </div>
// //           <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
// //             <Car className="w-5 h-5" />
// //           </div>
// //         </div>

// //         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
// //           <div>
// //             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
// //               Públicos / Compartidos
// //             </p>
// //             <p className="text-2xl font-bold text-blue-600 mt-1">
// //               {totalPublicos}
// //             </p>
// //           </div>
// //           <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
// //             <UserCheck className="w-5 h-5" />
// //           </div>
// //         </div>

// //         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
// //           <div>
// //             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
// //               Viajes Privados
// //             </p>
// //             <p className="text-2xl font-bold text-purple-600 mt-1">
// //               {totalPrivados}
// //             </p>
// //           </div>
// //           <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
// //             <Shield className="w-5 h-5" />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Barra de Búsqueda y Filtros */}
// //       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
// //         <div className="relative w-full md:w-80">
// //           <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
// //           <input
// //             type="text"
// //             placeholder="Buscar por ID o Conductor..."
// //             value={busqueda}
// //             onChange={(e) => setBusqueda(e.target.value)}
// //             className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
// //           />
// //         </div>

// //         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
// //           <Filter className="w-4 h-4 text-slate-400 shrink-0" />
// //           <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">
// //             Tipo:
// //           </span>

// //           {(['TODOS', 'PUBLICO', 'PRIVADO'] as const).map((tipo) => (
// //             <button
// //               key={tipo}
// //               onClick={() => setFiltroTipo(tipo)}
// //               className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
// //                 filtroTipo === tipo
// //                   ? 'bg-slate-900 text-white shadow-sm'
// //                   : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
// //               }`}
// //             >
// //               {tipo === 'TODOS'
// //                 ? 'Todos'
// //                 : tipo === 'PUBLICO'
// //                   ? 'Público'
// //                   : 'Privado'}
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Estado: Error */}
// //       {error && (
// //         <div className="flex items-center gap-2 bg-rose-50 text-rose-700 p-4 rounded-lg border border-rose-200">
// //           <AlertCircle className="w-5 h-5 shrink-0" />
// //           <span className="text-sm font-medium">{error}</span>
// //         </div>
// //       )}

// //       {/* Estado: Cargando */}
// //       {cargando ? (
// //         <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
// //           <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-400" />
// //           <p className="text-sm">Cargando la lista de viajes...</p>
// //         </div>
// //       ) : (
// //         /* Tabla de Viajes */
// //         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
// //           <div className="overflow-x-auto">
// //             <table className="w-full text-left text-sm text-slate-600">
// //               <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
// //                 <tr>
// //                   <th className="py-3 px-4">ID</th>
// //                   <th className="py-3 px-4">Tipo</th>
// //                   <th className="py-3 px-4">Fecha / Hora</th>
// //                   <th className="py-3 px-4">Conductor</th>
// //                   <th className="py-3 px-4">Precio</th>
// //                   <th className="py-3 px-4">Capacidad</th>
// //                   <th className="py-3 px-4 text-right">Acciones</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-slate-100">
// //                 {viajesFiltrados.length === 0 ? (
// //                   <tr>
// //                     <td
// //                       colSpan={7}
// //                       className="text-center py-10 text-slate-400"
// //                     >
// //                       No se encontraron viajes que coincidan con el filtro.
// //                     </td>
// //                   </tr>
// //                 ) : (
// //                   viajesFiltrados.map((viaje) => {
// //                     const esPrivado = viaje.tipo?.toUpperCase() === 'PRIVADO';
// //                     const fechaObj = viaje.fechaHoraInicio
// //                       ? new Date(viaje.fechaHoraInicio)
// //                       : null;
// //                     const fechaTexto =
// //                       fechaObj && !isNaN(fechaObj.getTime())
// //                         ? fechaObj.toLocaleString([], {
// //                             dateStyle: 'short',
// //                             timeStyle: 'short',
// //                           })
// //                         : 'Sin fecha';

// //                     const choferNombre =
// //                       typeof viaje.chofer === 'object' && viaje.chofer !== null
// //                         ? `${viaje.chofer.nombre || ''} ${viaje.chofer.apellido || ''}`.trim()
// //                         : typeof viaje.chofer === 'string'
// //                           ? viaje.chofer
// //                           : 'Sin asignar';

// //                     return (
// //                       <tr
// //                         key={viaje.id}
// //                         className="hover:bg-slate-50/80 transition"
// //                       >
// //                         <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
// //                           #{viaje.id}
// //                         </td>
// //                         <td className="py-3.5 px-4">
// //                           <span
// //                             className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
// //                               esPrivado
// //                                 ? 'bg-purple-100 text-purple-700'
// //                                 : 'bg-blue-100 text-blue-700'
// //                             }`}
// //                           >
// //                             {esPrivado ? 'Privado' : 'Público'}
// //                           </span>
// //                         </td>
// //                         <td className="py-3.5 px-4 text-slate-700 font-medium">
// //                           {fechaTexto}
// //                         </td>
// //                         <td className="py-3.5 px-4 text-slate-700">
// //                           {choferNombre}
// //                         </td>
// //                         <td className="py-3.5 px-4 font-semibold text-slate-900">
// //                           ${viaje.precio ?? 0}
// //                         </td>
// //                         <td className="py-3.5 px-4 text-slate-600">
// //                           {viaje.capacidadPasajeros ?? 0} pas.
// //                         </td>
// //                         <td className="py-3.5 px-4 text-right">
// //                           <button
// //                             onClick={() =>
// //                               openModal('DETALLE_VIAJE', { data: { viaje } })
// //                             }
// //                             className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition shadow-sm"
// //                           >
// //                             <Eye className="w-3.5 h-3.5" />
// //                             Ver Detalle
// //                           </button>
// //                         </td>
// //                       </tr>
// //                     );
// //                   })
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default ViajesPage;

// // import { useState, useEffect, useMemo, useCallback } from 'react';
// // import {
// //   Eye,
// //   RefreshCw,
// //   AlertCircle,
// //   Search,
// //   Filter,
// //   Car,
// //   UserCheck,
// //   Shield,
// // } from 'lucide-react';
// // import type { Viaje } from '../../../types/index';
// // import { useModalStore } from '../../../store/useModalStore';
// // import { viajeService } from '../api/viajeService'; // Importación correcta desde la carpeta api

// // export function ViajesPage() {
// //   const [viajes, setViajes] = useState<Viaje[]>([]);
// //   const [cargando, setCargando] = useState<boolean>(true);
// //   const [error, setError] = useState<string | null>(null);

// //   // Hook del Global Modal Store
// //   const { openModal } = useModalStore();

// //   // Estados de interfaz
// //   const [busqueda, setBusqueda] = useState<string>('');
// //   const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'PUBLICO' | 'PRIVADO'>(
// //     'TODOS',
// //   );

// //   const cargarViajes = useCallback(async () => {
// //     setCargando(true);
// //     setError(null);
// //     try {
// //       const data = await viajeService.obtenerTodosAdmin();
// //       setViajes(data);
// //     } catch (err) {
// //       if (err instanceof Error) {
// //         setError(err.message);
// //       } else {
// //         setError('Ocurrió un error desconocido al cargar los viajes.');
// //       }
// //     } finally {
// //       setCargando(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     let cancelado = false;

// //     const inicializarCarga = async () => {
// //       setCargando(true);
// //       setError(null);
// //       try {
// //         const data = await viajeService.obtenerTodosAdmin();
// //         if (!cancelado) {
// //           setViajes(data);
// //         }
// //       } catch (err) {
// //         if (!cancelado) {
// //           if (err instanceof Error) {
// //             setError(err.message);
// //           } else {
// //             setError('Ocurrió un error desconocido al cargar los viajes.');
// //           }
// //         }
// //       } finally {
// //         if (!cancelado) {
// //           setCargando(false);
// //         }
// //       }
// //     };

// //     inicializarCarga();

// //     return () => {
// //       cancelado = true;
// //     };
// //   }, []);

// //   const viajesFiltrados = useMemo(() => {
// //     return viajes.filter((viaje) => {
// //       const coincideTipo =
// //         filtroTipo === 'TODOS' ||
// //         (viaje.tipo && viaje.tipo.toUpperCase() === filtroTipo);

// //       const choferNombre =
// //         typeof viaje.chofer === 'object' && viaje.chofer !== null
// //           ? `${viaje.chofer.nombre || ''} ${viaje.chofer.apellido || ''}`.toLowerCase()
// //           : typeof viaje.chofer === 'string'
// //             ? viaje.chofer.toLowerCase()
// //             : '';

// //       const query = busqueda.toLowerCase().trim();
// //       const coincideBusqueda =
// //         !query ||
// //         viaje.id?.toString().includes(query) ||
// //         choferNombre.includes(query);

// //       return coincideTipo && coincideBusqueda;
// //     });
// //   }, [viajes, filtroTipo, busqueda]);

// //   const totalViajes = viajes.length;
// //   const totalPrivados = viajes.filter(
// //     (v) => v.tipo?.toUpperCase() === 'PRIVADO',
// //   ).length;
// //   const totalPublicos = totalViajes - totalPrivados;

// //   return (
// //     <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
// //       {/* Cabecera */}
// //       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// //         <div>
// //           <h1 className="text-2xl font-bold text-slate-900">
// //             Gestión de Viajes
// //           </h1>
// //           <p className="text-sm text-slate-500">
// //             Administra los traslados programados y examina su recorrido en
// //             detalle.
// //           </p>
// //         </div>

// //         <button
// //           onClick={cargarViajes}
// //           disabled={cargando}
// //           className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition self-start sm:self-auto disabled:opacity-50 shadow-sm"
// //         >
// //           <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
// //           Refrescar
// //         </button>
// //       </div>

// //       {/* Tarjetas de Métricas / KPIs */}
// //       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
// //         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
// //           <div>
// //             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
// //               Total Viajes
// //             </p>
// //             <p className="text-2xl font-bold text-slate-800 mt-1">
// //               {totalViajes}
// //             </p>
// //           </div>
// //           <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
// //             <Car className="w-5 h-5" />
// //           </div>
// //         </div>

// //         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
// //           <div>
// //             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
// //               Públicos / Compartidos
// //             </p>
// //             <p className="text-2xl font-bold text-blue-600 mt-1">
// //               {totalPublicos}
// //             </p>
// //           </div>
// //           <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
// //             <UserCheck className="w-5 h-5" />
// //           </div>
// //         </div>

// //         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
// //           <div>
// //             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
// //               Viajes Privados
// //             </p>
// //             <p className="text-2xl font-bold text-purple-600 mt-1">
// //               {totalPrivados}
// //             </p>
// //           </div>
// //           <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
// //             <Shield className="w-5 h-5" />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Barra de Búsqueda y Filtros */}
// //       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
// //         <div className="relative w-full md:w-80">
// //           <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
// //           <input
// //             type="text"
// //             placeholder="Buscar por ID o Conductor..."
// //             value={busqueda}
// //             onChange={(e) => setBusqueda(e.target.value)}
// //             className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
// //           />
// //         </div>

// //         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
// //           <Filter className="w-4 h-4 text-slate-400 shrink-0" />
// //           <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">
// //             Tipo:
// //           </span>

// //           {(['TODOS', 'PUBLICO', 'PRIVADO'] as const).map((tipo) => (
// //             <button
// //               key={tipo}
// //               onClick={() => setFiltroTipo(tipo)}
// //               className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
// //                 filtroTipo === tipo
// //                   ? 'bg-slate-900 text-white shadow-sm'
// //                   : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
// //               }`}
// //             >
// //               {tipo === 'TODOS'
// //                 ? 'Todos'
// //                 : tipo === 'PUBLICO'
// //                   ? 'Público'
// //                   : 'Privado'}
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Estado: Error */}
// //       {error && (
// //         <div className="flex items-center gap-2 bg-rose-50 text-rose-700 p-4 rounded-lg border border-rose-200">
// //           <AlertCircle className="w-5 h-5 shrink-0" />
// //           <span className="text-sm font-medium">{error}</span>
// //         </div>
// //       )}

// //       {/* Estado: Cargando */}
// //       {cargando ? (
// //         <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
// //           <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-400" />
// //           <p className="text-sm">Cargando la lista de viajes...</p>
// //         </div>
// //       ) : (
// //         /* Tabla de Viajes */
// //         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
// //           <div className="overflow-x-auto">
// //             <table className="w-full text-left text-sm text-slate-600">
// //               <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
// //                 <tr>
// //                   <th className="py-3 px-4">ID</th>
// //                   <th className="py-3 px-4">Tipo</th>
// //                   <th className="py-3 px-4">Fecha / Hora</th>
// //                   <th className="py-3 px-4">Conductor</th>
// //                   <th className="py-3 px-4">Precio</th>
// //                   <th className="py-3 px-4">Capacidad</th>
// //                   <th className="py-3 px-4 text-right">Acciones</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-slate-100">
// //                 {viajesFiltrados.length === 0 ? (
// //                   <tr>
// //                     <td
// //                       colSpan={7}
// //                       className="text-center py-10 text-slate-400"
// //                     >
// //                       No se encontraron viajes que coincidan con el filtro.
// //                     </td>
// //                   </tr>
// //                 ) : (
// //                   viajesFiltrados.map((viaje) => {
// //                     const esPrivado = viaje.tipo?.toUpperCase() === 'PRIVADO';
// //                     const fechaObj = viaje.fechaHoraInicio
// //                       ? new Date(viaje.fechaHoraInicio)
// //                       : null;
// //                     const fechaTexto =
// //                       fechaObj && !isNaN(fechaObj.getTime())
// //                         ? fechaObj.toLocaleString([], {
// //                             dateStyle: 'short',
// //                             timeStyle: 'short',
// //                           })
// //                         : 'Sin fecha';

// //                     const choferNombre =
// //                       typeof viaje.chofer === 'object' && viaje.chofer !== null
// //                         ? `${viaje.chofer.nombre || ''} ${viaje.chofer.apellido || ''}`.trim()
// //                         : typeof viaje.chofer === 'string'
// //                           ? viaje.chofer
// //                           : 'Sin asignar';

// //                     return (
// //                       <tr
// //                         key={viaje.id}
// //                         className="hover:bg-slate-50/80 transition"
// //                       >
// //                         <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
// //                           #{viaje.id}
// //                         </td>
// //                         <td className="py-3.5 px-4">
// //                           <span
// //                             className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
// //                               esPrivado
// //                                 ? 'bg-purple-100 text-purple-700'
// //                                 : 'bg-blue-100 text-blue-700'
// //                             }`}
// //                           >
// //                             {esPrivado ? 'Privado' : 'Público'}
// //                           </span>
// //                         </td>
// //                         <td className="py-3.5 px-4 text-slate-700 font-medium">
// //                           {fechaTexto}
// //                         </td>
// //                         <td className="py-3.5 px-4 text-slate-700">
// //                           {choferNombre}
// //                         </td>
// //                         <td className="py-3.5 px-4 font-semibold text-slate-900">
// //                           ${viaje.precio ?? 0}
// //                         </td>
// //                         <td className="py-3.5 px-4 text-slate-600">
// //                           {viaje.capacidadPasajeros ?? 0} pas.
// //                         </td>
// //                         <td className="py-3.5 px-4 text-right">
// //                           <button
// //                             onClick={() =>
// //                               openModal('DETALLE_VIAJE', { data: { viaje } })
// //                             }
// //                             className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition shadow-sm"
// //                           >
// //                             <Eye className="w-3.5 h-3.5" />
// //                             Ver Detalle
// //                           </button>
// //                         </td>
// //                       </tr>
// //                     );
// //                   })
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default ViajesPage;

// // ultimo funcionando

// // import { useState, useEffect, useMemo, useCallback } from 'react';
// // import {
// //   Eye,
// //   RefreshCw,
// //   AlertCircle,
// //   Search,
// //   Filter,
// //   Car,
// //   UserCheck,
// //   Shield,
// // } from 'lucide-react';
// // import type { Viaje } from '../../../types/index';
// // import { useModalStore } from '../../../store/useModalStore'; // Ajusta la ruta a tu store

// // export function ViajesPage() {
// //   const [viajes, setViajes] = useState<Viaje[]>([]);
// //   const [cargando, setCargando] = useState<boolean>(true);
// //   const [error, setError] = useState<string | null>(null);

// //   // Hook del Global Modal Store
// //   const { openModal } = useModalStore();

// //   // Estados de interfaz
// //   const [busqueda, setBusqueda] = useState<string>('');
// //   const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'PUBLICO' | 'PRIVADO'>(
// //     'TODOS',
// //   );

// //   const cargarViajes = useCallback(async () => {
// //     setCargando(true);
// //     setError(null);
// //     try {
// //       const response = await fetch('/api/viajes');
// //       if (!response.ok) {
// //         throw new Error('Error al obtener la lista de viajes');
// //       }
// //       const data: Viaje[] = await response.json();
// //       setViajes(data);
// //     } catch (err) {
// //       if (err instanceof Error) {
// //         setError(err.message);
// //       } else {
// //         setError('Ocurrió un error desconocido al cargar los viajes.');
// //       }
// //     } finally {
// //       setCargando(false);
// //     }
// //   }, []);

// //   useEffect(() => {
// //     let cancelado = false;

// //     const inicializarCarga = async () => {
// //       setCargando(true);
// //       setError(null);
// //       try {
// //         const response = await fetch('/api/viajes');
// //         if (!response.ok) {
// //           throw new Error('Error al obtener la lista de viajes');
// //         }
// //         const data: Viaje[] = await response.json();
// //         if (!cancelado) {
// //           setViajes(data);
// //         }
// //       } catch (err) {
// //         if (!cancelado) {
// //           if (err instanceof Error) {
// //             setError(err.message);
// //           } else {
// //             setError('Ocurrió un error desconocido al cargar los viajes.');
// //           }
// //         }
// //       } finally {
// //         if (!cancelado) {
// //           setCargando(false);
// //         }
// //       }
// //     };

// //     Promise.resolve().then(inicializarCarga);

// //     return () => {
// //       cancelado = true;
// //     };
// //   }, []);

// //   const viajesFiltrados = useMemo(() => {
// //     return viajes.filter((viaje) => {
// //       const coincideTipo =
// //         filtroTipo === 'TODOS' ||
// //         (viaje.tipo && viaje.tipo.toUpperCase() === filtroTipo);

// //       const choferNombre =
// //         typeof viaje.chofer === 'object' && viaje.chofer !== null
// //           ? `${viaje.chofer.nombre || ''} ${viaje.chofer.apellido || ''}`.toLowerCase()
// //           : typeof viaje.chofer === 'string'
// //             ? viaje.chofer.toLowerCase()
// //             : '';

// //       const query = busqueda.toLowerCase().trim();
// //       const coincideBusqueda =
// //         !query ||
// //         viaje.id?.toString().includes(query) ||
// //         choferNombre.includes(query);

// //       return coincideTipo && coincideBusqueda;
// //     });
// //   }, [viajes, filtroTipo, busqueda]);

// //   const totalViajes = viajes.length;
// //   const totalPrivados = viajes.filter(
// //     (v) => v.tipo?.toUpperCase() === 'PRIVADO',
// //   ).length;
// //   const totalPublicos = totalViajes - totalPrivados;

// //   return (
// //     <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
// //       {/* Cabecera */}
// //       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
// //         <div>
// //           <h1 className="text-2xl font-bold text-slate-900">
// //             Gestión de Viajes
// //           </h1>
// //           <p className="text-sm text-slate-500">
// //             Administra los traslados programados y examina su recorrido en
// //             detalle.
// //           </p>
// //         </div>

// //         <button
// //           onClick={cargarViajes}
// //           disabled={cargando}
// //           className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition self-start sm:self-auto disabled:opacity-50 shadow-sm"
// //         >
// //           <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
// //           Refrescar
// //         </button>
// //       </div>

// //       {/* Tarjetas de Métricas / KPIs */}
// //       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
// //         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
// //           <div>
// //             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
// //               Total Viajes
// //             </p>
// //             <p className="text-2xl font-bold text-slate-800 mt-1">
// //               {totalViajes}
// //             </p>
// //           </div>
// //           <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
// //             <Car className="w-5 h-5" />
// //           </div>
// //         </div>

// //         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
// //           <div>
// //             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
// //               Públicos / Compartidos
// //             </p>
// //             <p className="text-2xl font-bold text-blue-600 mt-1">
// //               {totalPublicos}
// //             </p>
// //           </div>
// //           <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
// //             <UserCheck className="w-5 h-5" />
// //           </div>
// //         </div>

// //         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
// //           <div>
// //             <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
// //               Viajes Privados
// //             </p>
// //             <p className="text-2xl font-bold text-purple-600 mt-1">
// //               {totalPrivados}
// //             </p>
// //           </div>
// //           <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
// //             <Shield className="w-5 h-5" />
// //           </div>
// //         </div>
// //       </div>

// //       {/* Barra de Búsqueda y Filtros */}
// //       <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
// //         <div className="relative w-full md:w-80">
// //           <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
// //           <input
// //             type="text"
// //             placeholder="Buscar por ID o Conductor..."
// //             value={busqueda}
// //             onChange={(e) => setBusqueda(e.target.value)}
// //             className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
// //           />
// //         </div>

// //         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
// //           <Filter className="w-4 h-4 text-slate-400 shrink-0" />
// //           <span className="text-xs text-slate-500 font-medium mr-1 hidden sm:inline">
// //             Tipo:
// //           </span>

// //           {(['TODOS', 'PUBLICO', 'PRIVADO'] as const).map((tipo) => (
// //             <button
// //               key={tipo}
// //               onClick={() => setFiltroTipo(tipo)}
// //               className={`px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 ${
// //                 filtroTipo === tipo
// //                   ? 'bg-slate-900 text-white shadow-sm'
// //                   : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
// //               }`}
// //             >
// //               {tipo === 'TODOS'
// //                 ? 'Todos'
// //                 : tipo === 'PUBLICO'
// //                   ? 'Público'
// //                   : 'Privado'}
// //             </button>
// //           ))}
// //         </div>
// //       </div>

// //       {/* Estado: Error */}
// //       {error && (
// //         <div className="flex items-center gap-2 bg-rose-50 text-rose-700 p-4 rounded-lg border border-rose-200">
// //           <AlertCircle className="w-5 h-5 shrink-0" />
// //           <span className="text-sm font-medium">{error}</span>
// //         </div>
// //       )}

// //       {/* Estado: Cargando */}
// //       {cargando ? (
// //         <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
// //           <RefreshCw className="w-8 h-8 animate-spin mx-auto text-slate-400" />
// //           <p className="text-sm">Cargando la lista de viajes...</p>
// //         </div>
// //       ) : (
// //         /* Tabla de Viajes */
// //         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
// //           <div className="overflow-x-auto">
// //             <table className="w-full text-left text-sm text-slate-600">
// //               <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
// //                 <tr>
// //                   <th className="py-3 px-4">ID</th>
// //                   <th className="py-3 px-4">Tipo</th>
// //                   <th className="py-3 px-4">Fecha / Hora</th>
// //                   <th className="py-3 px-4">Conductor</th>
// //                   <th className="py-3 px-4">Precio</th>
// //                   <th className="py-3 px-4">Capacidad</th>
// //                   <th className="py-3 px-4 text-right">Acciones</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-slate-100">
// //                 {viajesFiltrados.length === 0 ? (
// //                   <tr>
// //                     <td
// //                       colSpan={7}
// //                       className="text-center py-10 text-slate-400"
// //                     >
// //                       No se encontraron viajes que coincidan con el filtro.
// //                     </td>
// //                   </tr>
// //                 ) : (
// //                   viajesFiltrados.map((viaje) => {
// //                     const esPrivado = viaje.tipo?.toUpperCase() === 'PRIVADO';
// //                     const fechaObj = viaje.fechaHoraInicio
// //                       ? new Date(viaje.fechaHoraInicio)
// //                       : null;
// //                     const fechaTexto =
// //                       fechaObj && !isNaN(fechaObj.getTime())
// //                         ? fechaObj.toLocaleString([], {
// //                             dateStyle: 'short',
// //                             timeStyle: 'short',
// //                           })
// //                         : 'Sin fecha';

// //                     const choferNombre =
// //                       typeof viaje.chofer === 'object' && viaje.chofer !== null
// //                         ? `${viaje.chofer.nombre || ''} ${viaje.chofer.apellido || ''}`.trim()
// //                         : typeof viaje.chofer === 'string'
// //                           ? viaje.chofer
// //                           : 'Sin asignar';

// //                     return (
// //                       <tr
// //                         key={viaje.id}
// //                         className="hover:bg-slate-50/80 transition"
// //                       >
// //                         <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
// //                           #{viaje.id}
// //                         </td>
// //                         <td className="py-3.5 px-4">
// //                           <span
// //                             className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
// //                               esPrivado
// //                                 ? 'bg-purple-100 text-purple-700'
// //                                 : 'bg-blue-100 text-blue-700'
// //                             }`}
// //                           >
// //                             {esPrivado ? 'Privado' : 'Público'}
// //                           </span>
// //                         </td>
// //                         <td className="py-3.5 px-4 text-slate-700 font-medium">
// //                           {fechaTexto}
// //                         </td>
// //                         <td className="py-3.5 px-4 text-slate-700">
// //                           {choferNombre}
// //                         </td>
// //                         <td className="py-3.5 px-4 font-semibold text-slate-900">
// //                           ${viaje.precio ?? 0}
// //                         </td>
// //                         <td className="py-3.5 px-4 text-slate-600">
// //                           {viaje.capacidadPasajeros ?? 0} pas.
// //                         </td>
// //                         <td className="py-3.5 px-4 text-right">
// //                           <button
// //                             onClick={() =>
// //                               openModal('DETALLE_VIAJE', { data: { viaje } })
// //                             }
// //                             className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition shadow-sm"
// //                           >
// //                             <Eye className="w-3.5 h-3.5" />
// //                             Ver Detalle
// //                           </button>
// //                         </td>
// //                       </tr>
// //                     );
// //                   })
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // export default ViajesPage;

// //  a prueba

// // import { useEffect, useState, useCallback } from 'react';
// // //import { useForm, type Resolver } from 'react-hook-form';
// // //import { zodResolver } from '@hookform/resolvers/zod';
// // //import { viajeSchema, type ViajeFormData } from '../schemas/viajeSchema';
// // import { viajeService } from '../api/viajeService';
// // import { rutaService } from '../../rutas/api/rutaService';
// // import { usuarioService } from '../../usuarios/api/usuarioService';
// // // import { puntoService } from '../../puntos/api/puntoService';
// // import { useAuthStore } from '../../../store/authStore';
// // import type {
// //   Viaje,
// //   Ruta,
// //   Usuario,
// //   Punto,
// //   Reserva,
// //   OcupacionReserva,
// //   PuntoGeografico,
// // } from '../../../types';
// // import { Input } from '../../../components/ui/Input';
// // import { Button } from '../../../components/ui/Button';
// // import { reservaService } from '../../reservas/api/reservaService';
// // // import {
// // //   calcularDisponibilidadViaje,
// // //   type PuntoRutaConOrden,
// // //   type ReservaMinima,
// // // } from '../../../utils/disponibilidad';

// // // IMPORTAR NUEVOS COMPONENTES EXTRAÍDOS:
// //  import { ViajeForm } from '../components/ViajeForm';
// //  import { ViajesTabla } from '../components/ViajesTabla';
// //  import { ViajeDetalleModal } from '../components/ViajeDetalleModal';

// // // nuevas importaciones
// // // import { useModalStore } from '../../../store/useModalStore';
// // // import { ViajeDetalleContent } from '../components/ViajeDetalleContent';

// // // // extraemos la funcion
// // // export const ViajesPage = () => {
// // //   const openModal = useModalStore((state) => state.openModal);

// // // Estructura opcional de punto medio en la ruta

// // // interface PuntoDetalle {
// // //   nombre: string;
// // //   direccion?: string;
// // //   horaEstimada: string;
// // //   pasajerosDisponibles: number;
// // //   valijasDisponibles: number;
// // // }

// // // Estados principales de la vista
// // export const ViajesPage = () => {
// //   const user = useAuthStore((state) => state.user);
// //   const [viajes, setViajes] = useState<Viaje[]>([]);
// //   const [rutasDisponibles, setRutasDisponibles] = useState<Ruta[]>([]);
// //   const [choferesDisponibles, setChoferesDisponibles] = useState<Usuario[]>([]);
// //   // const [puntosDisponibles, setPuntosDisponibles] = useState<Punto[]>([]); // 2. Agregar estado para puntos
// //   const [cargando, setCargando] = useState(true);
// //   const [idEditando, setIdEditando] = useState<string | null>(null);
// //   const [reservas, setReservas] = useState<Reserva[]>([]);
// //   const [ocupacionesViaje, setOcupacionesViaje] = useState<OcupacionReserva[]>(
// //     [],
// //   );

// //   // Estado para controlar el modal de detalle del viaje
// //   const [viajeSeleccionado, setViajeSeleccionado] = useState<Viaje | null>(
// //     null,
// //   );

// //   console.log('viajes: ', viajes);
// //   console.log('viajeSeleccionado: ', viajeSeleccionado);
// //   const {
// //     register,
// //     handleSubmit,
// //     reset,
// //     setValue,
// //     formState: { errors, isSubmitting },
// //   } = useForm<ViajeFormData>({
// //     resolver: zodResolver(viajeSchema) as unknown as Resolver<ViajeFormData>,
// //     defaultValues: {
// //       idRuta: '',
// //       idChofer: '',
// //       fechaHoraInicio: '',
// //       fechaHoraFin: '',
// //       capacidadPasajeros: 4,
// //       capacidadValijas: 4,
// //       precio: 0,
// //     },
// //   });

// //   // Helper para consultar viajes según el rol del usuario
// //   // const obtenerViajesSegunRol = useCallback(async (): Promise<Viaje[]> => {
// //   //   if (user?.rol === 'ADMIN') {
// //   //     return await viajeService.obtenerTodosAdmin();
// //   //   }
// //   //   if (user?.rol === 'CLIENTE') {
// //   //     return await viajeService.obtenerMisViajes();
// //   //   }
// //   //   return await viajeService.obtenerPublicos();
// //   // }, [user]);

// //   // ============================================================================
// //   // LÓGICA DE CONSULTA DE DATOS (MANTENER EN LA PÁGINA CONTENEDORA)
// //   // ============================================================================

// //   const obtenerViajesSegunRol = useCallback(async (): Promise<Viaje[]> => {
// //     // 1. Administrador: ve absolutamente todos los viajes
// //     if (user?.rol === 'ADMIN') {
// //       return await viajeService.obtenerTodosAdmin();
// //     }

// //     // 2. Cliente: ve los compartidos/públicos + sus viajes privados
// //     if (user?.rol === 'CLIENTE') {
// //       const [publicos, misViajes] = await Promise.all([
// //         viajeService.obtenerPublicos().catch(() => []),
// //         viajeService.obtenerMisViajes().catch(() => []),
// //       ]);

// //       // Combinar sin duplicar (por id)
// //       const mapaViajes = new Map<string, Viaje>();
// //       [...publicos, ...misViajes].forEach((v) => mapaViajes.set(v.id, v));

// //       return Array.from(mapaViajes.values());
// //     }

// //     // 3. Invitados u otros roles: ven solo los viajes compartidos/públicos
// //     return await viajeService.obtenerPublicos();
// //   }, [user]);

// //   useEffect(() => {
// //     // Si no hay viaje seleccionado, no iniciamos ninguna petición
// //     if (!viajeSeleccionado) {
// //       return;
// //     }

// //     let cancelado = false;

// //     reservaService
// //       .obtenerOcupacionPorViaje(viajeSeleccionado.id)
// //       .then((data) => {
// //         if (!cancelado) {
// //           setOcupacionesViaje(data);
// //         }
// //       })
// //       .catch(() => {
// //         if (!cancelado) {
// //           setOcupacionesViaje([]);
// //         }
// //       });

// //     // Función de limpieza: resetea el estado y evita race conditions al desmontar o cambiar de viaje
// //     return () => {
// //       cancelado = true;
// //       setOcupacionesViaje([]);
// //     };
// //   }, [viajeSeleccionado]);

// //   // Carga de datos auxiliares (Rutas y Choferes) y Viajes
// //   const cargarDatos = useCallback(async () => {
// //     try {
// //       const dataRutas = await rutaService.obtenerTodas().catch(() => []);
// //       setRutasDisponibles(dataRutas);

// //       if (user?.rol === 'ADMIN') {
// //         const [dataViajes, dataRutas, dataUsuarios, dataReservas] =
// //           await Promise.all([
// //             obtenerViajesSegunRol(),
// //             rutaService.obtenerTodas(),
// //             usuarioService.obtenerTodos(),
// //             // puntoService.obtenerTodos(), // Consulta de los puntos guardados
// //             reservaService.obtenerTodas(),
// //           ]);
// //         setViajes(dataViajes);
// //         setRutasDisponibles(dataRutas);
// //         setChoferesDisponibles(dataUsuarios.filter((u) => u.rol === 'CHOFER'));
// //         // setPuntosDisponibles(dataPuntos);
// //         setReservas(dataReservas);
// //       } else {
// //         const dataViajes = await obtenerViajesSegunRol();
// //         let dataReservas: Reserva[] = [];
// //         if (user?.id) {
// //           dataReservas = await reservaService.obtenerPorCliente(user.id);
// //         }
// //         setViajes(dataViajes);
// //         setReservas(dataReservas);
// //       }
// //     } catch (error) {
// //       console.error('Error cargando datos:', error);
// //     } finally {
// //       setCargando(false);
// //     }
// //   }, [user, obtenerViajesSegunRol]);

// //   useEffect(() => {
// //     let ignorar = false;
// //     const fetchInicial = async () => {
// //       await cargarDatos();
// //     };
// //     if (!ignorar) fetchInicial();
// //     return () => {
// //       ignorar = true;
// //     };
// //   }, [cargarDatos]);

// //   const onSubmit = async (data: ViajeFormData) => {
// //     try {
// //       if (idEditando) {
// //         await viajeService.actualizar(idEditando, data);
// //       } else {
// //         await viajeService.crear(data);
// //       }
// //       cancelarEdicion();
// //       setCargando(true);
// //       await cargarDatos();
// //     } catch (error) {
// //       alert(error instanceof Error ? error.message : 'Error al guardar');
// //     }
// //   };

// //   // ============================================================================
// //   // HANDLERS (SE PASAN COMO PROPS A LOS NUEVOS COMPONENTES)
// //   // ============================================================================

// //   const handleEditar = (viaje: Viaje) => {
// //     setIdEditando(viaje.id);
// //     setValue('idRuta', viaje.idRuta || '');
// //     setValue('idChofer', viaje.idChofer || '');
// //     setValue(
// //       'fechaHoraInicio',
// //       viaje.fechaHoraInicio
// //         ? new Date(viaje.fechaHoraInicio).toISOString().slice(0, 16)
// //         : '',
// //     );
// //     setValue(
// //       'fechaHoraFin',
// //       viaje.fechaHoraFin
// //         ? new Date(viaje.fechaHoraFin).toISOString().slice(0, 16)
// //         : '',
// //     );
// //     setValue('capacidadPasajeros', viaje.capacidadPasajeros ?? 4);
// //     setValue('capacidadValijas', viaje.capacidadValijas ?? 4);
// //     setValue('precio', viaje.precio);
// //   };

// //   const cancelarEdicion = () => {
// //     setIdEditando(null);
// //     reset({
// //       idRuta: '',
// //       idChofer: '',
// //       fechaHoraInicio: '',
// //       fechaHoraFin: '',
// //       capacidadPasajeros: 4,
// //       capacidadValijas: 4,
// //       precio: 0,
// //     });
// //   };

// //   const handleEliminar = async (id: string) => {
// //     if (window.confirm('¿Estás seguro de cancelar este viaje?')) {
// //       setCargando(true);
// //       await viajeService.eliminar(id);
// //       await cargarDatos();
// //     }
// //   };

// //   const obtenerNombreRuta = (viaje: Viaje) => {
// //     if (viaje.rutaNombre) return viaje.rutaNombre;
// //     if (typeof viaje.ruta === 'object' && viaje.ruta !== null) {
// //       if (viaje.ruta.origen && viaje.ruta.destino) {
// //         return `${viaje.ruta.origen} ➔ ${viaje.ruta.destino}`;
// //       }
// //       if (viaje.ruta.nombre) return viaje.ruta.nombre;
// //     }
// //     const r = rutasDisponibles.find((item) => item.idRuta === viaje.idRuta);
// //     return r ? r.nombre : 'Ruta no asignada';
// //   };

// //   const obtenerNombreChofer = (idChofer?: string) => {
// //     if (!idChofer) return 'Sin chofer';
// //     const c = choferesDisponibles.find((item) => item.idUsuario === idChofer);
// //     return c ? `${c.nombre} ${c.apellido}` : 'Sin chofer';
// //   };

// //   const recortarTexto = (texto: string, max: number = 70): string => {
// //     if (!texto) return '';
// //     return texto.length > max ? `${texto.substring(0, max)}...` : texto;
// //   };

// //   // Helper para construir la lista de puntos a mostrar en el Modal
// //   const obtenerPuntosRuta = (viaje: Viaje): PuntoDetalle[] => {
// //     console.log('viaje: ', viaje);
// //     const nombreRuta = obtenerNombreRuta(viaje);
// //     const esViajePrivado =
// //       !viaje.idRuta ||
// //       viaje.tipo === 'PRIVADO' ||
// //       nombreRuta.toLowerCase().includes('privada');

// //     if (esViajePrivado) {
// //       // Buscar si el viaje tiene una reserva vinculada en el estado local de reservas
// //       const reservaAsociada = reservas.find((r) => {
// //         const idViajeReserva =
// //           typeof r.viaje === 'object' && r.viaje !== null
// //             ? r.viaje.id
// //             : r.viaje;
// //         return idViajeReserva === viaje.id;
// //       });

// //       // Extraer Origen
// //       let origenStr = 'Origen Privado';
// //       let direccionOrigen = '';

// //       if (typeof viaje.origen === 'object' && viaje.origen !== null) {
// //         origenStr =
// //           (viaje.origen as PuntoGeografico).nombre || 'Origen Privado';
// //         direccionOrigen =
// //           (viaje.origen as PuntoGeografico).direccion || origenStr;
// //       } else if (typeof viaje.origen === 'string' && viaje.origen) {
// //         origenStr = viaje.origen;
// //         direccionOrigen = viaje.origen;
// //       } else if (reservaAsociada?.origen) {
// //         origenStr = reservaAsociada.origen;
// //         direccionOrigen = reservaAsociada.origen;
// //       }

// //       // Extraer Destino
// //       let destinoStr = 'Destino Privado';
// //       let direccionDestino = '';

// //       if (typeof viaje.destino === 'object' && viaje.destino !== null) {
// //         destinoStr =
// //           (viaje.destino as PuntoGeografico).nombre || 'Destino Privado';
// //         direccionDestino =
// //           (viaje.destino as PuntoGeografico).direccion || destinoStr;
// //       } else if (typeof viaje.destino === 'string' && viaje.destino) {
// //         destinoStr = viaje.destino;
// //         direccionDestino = viaje.destino;
// //       } else if (reservaAsociada?.destino) {
// //         destinoStr = reservaAsociada.destino;
// //         direccionDestino = reservaAsociada.destino;
// //       }

// //       // Si origen y destino siguen vacíos, intentar parsear la cadena "Ruta Privada: Origen - Destino"
// //       if (origenStr === 'Origen Privado' && nombreRuta.includes(' - ')) {
// //         const partes = nombreRuta
// //           .replace(/^Ruta Privada:\s*/i, '')
// //           .split(' - ');
// //         if (partes.length >= 2) {
// //           origenStr = partes[0].trim();
// //           direccionOrigen = partes[0].trim();
// //           destinoStr = partes[1].trim();
// //           direccionDestino = partes[1].trim();
// //         }
// //       }

// //       const formatoFechaHora = (fechaStr?: string) => {
// //         if (!fechaStr) return '-';
// //         const fecha = new Date(fechaStr);
// //         return isNaN(fecha.getTime())
// //           ? '-'
// //           : fecha.toLocaleString([], {
// //               day: '2-digit',
// //               month: '2-digit',
// //               year: 'numeric',
// //               hour: '2-digit',
// //               minute: '2-digit',
// //             });
// //       };

// //       return [
// //         {
// //           nombre: origenStr,
// //           direccion: direccionOrigen,
// //           horaEstimada: formatoFechaHora(viaje.fechaHoraInicio),
// //           pasajerosDisponibles: viaje.capacidadPasajeros ?? 0,
// //           valijasDisponibles: viaje.capacidadValijas ?? 0,
// //         },
// //         {
// //           nombre: destinoStr,
// //           direccion: direccionDestino,
// //           horaEstimada: formatoFechaHora(viaje.fechaHoraFin),
// //           pasajerosDisponibles: 0,
// //           valijasDisponibles: 0,
// //         },
// //       ];
// //     }

// //     const rutaCompleta = rutasDisponibles.find(
// //       (r) => r.idRuta === viaje.idRuta,
// //     );
// //     const elementos = rutaCompleta?.puntos || [];

// //     if (elementos.length === 0) return [];

// //     // 1. Mapear y ordenar los puntos de la ruta con su 'orden'
// //     const puntosOrdenados: PuntoRutaConOrden[] = [...elementos]
// //       .map((item, idx) => {
// //         const puntoObj: Punto | undefined =
// //           'punto' in item && item.punto
// //             ? item.punto
// //             : (item as unknown as Punto);

// //         const ordenItem =
// //           'orden' in item && typeof item.orden === 'number'
// //             ? item.orden
// //             : idx + 1;
// //         const nombrePunto = puntoObj?.nombre || `Punto ${ordenItem}`;

// //         return {
// //           orden: ordenItem,
// //           nombre: nombrePunto,
// //         };
// //       })
// //       .sort((a, b) => a.orden - b.orden);

// //     // 2. Mapear las reservas asociadas a este viaje al formato ReservaMinima
// //     // Si es ADMIN usa la lista completa de 'reservas'; si no, usa las 'ocupacionesViaje' anónimas
// //     const fuenteReservas = esAdmin
// //       ? reservas.filter((r) => {
// //           const idViajeReserva =
// //             typeof r.viaje === 'object' && r.viaje !== null
// //               ? r.viaje.id
// //               : r.viaje;
// //           return idViajeReserva === viaje.id;
// //         })
// //       : ocupacionesViaje;

// //     const reservasDelViaje: ReservaMinima[] = fuenteReservas.map((r) => ({
// //       origen: r.origen || '',
// //       destino: r.destino || '',
// //       cantPasajeros: r.cantPasajeros ?? 1,
// //       cantValijas: r.cantValijas ?? 0,
// //     }));

// //     // 3. Ejecutar el cálculo por tramos
// //     const tramosCalculados = calcularDisponibilidadViaje(
// //       viaje.capacidadPasajeros ?? 0,
// //       viaje.capacidadValijas ?? 0,
// //       puntosOrdenados,
// //       reservasDelViaje,
// //     );

// //     // 4. Mapear la información para renderizar en la tabla del modal
// //     return elementos
// //       .sort((a, b) => {
// //         const ordenA =
// //           'orden' in a && typeof a.orden === 'number' ? a.orden : 0;
// //         const ordenB =
// //           'orden' in b && typeof b.orden === 'number' ? b.orden : 0;
// //         return ordenA - ordenB;
// //       })
// //       .map((item, idx) => {
// //         const esOrigen = idx === 0;
// //         const esDestino = idx === elementos.length - 1;

// //         const puntoObj: Punto | undefined =
// //           'punto' in item && item.punto
// //             ? item.punto
// //             : (item as unknown as Punto);

// //         const ordenItem =
// //           'orden' in item && typeof item.orden === 'number'
// //             ? item.orden
// //             : idx + 1;
// //         const direccionFallback =
// //           'direccion' in item && typeof item.direccion === 'string'
// //             ? item.direccion
// //             : '';

// //         // Buscar el tramo calculado correspondiente a este punto
// //         const tramoInfo = tramosCalculados.find(
// //           (t) => t.ordenInicio === ordenItem,
// //         );

// //         const formatoFechaHora = (fechaStr: string) => {
// //           const fecha = new Date(fechaStr);
// //           return isNaN(fecha.getTime())
// //             ? '-'
// //             : fecha.toLocaleString([], {
// //                 day: '2-digit',
// //                 month: '2-digit',
// //                 year: 'numeric',
// //                 hour: '2-digit',
// //                 minute: '2-digit',
// //               });
// //         };

// //         let horaEstimada = '-';
// //         if (esOrigen && viaje.fechaHoraInicio) {
// //           horaEstimada = formatoFechaHora(viaje.fechaHoraInicio);
// //         } else if (esDestino && viaje.fechaHoraFin) {
// //           horaEstimada = formatoFechaHora(viaje.fechaHoraFin);
// //         } else if (
// //           'horaEstimada' in item &&
// //           typeof item.horaEstimada === 'string' &&
// //           item.horaEstimada
// //         ) {
// //           horaEstimada = item.horaEstimada;
// //         }

// //         return {
// //           nombre:
// //             puntoObj?.nombre ||
// //             (ordenItem ? `Punto ${ordenItem}` : 'Punto sin nombre'),
// //           direccion:
// //             puntoObj?.direccion || direccionFallback || 'Sin dirección',
// //           horaEstimada,
// //           pasajerosDisponibles: tramoInfo
// //             ? tramoInfo.pasajerosDisponibles
// //             : (viaje.capacidadPasajeros ?? 0),
// //           valijasDisponibles: tramoInfo
// //             ? tramoInfo.valijasDisponibles
// //             : (viaje.capacidadValijas ?? 0),
// //         };
// //       });
// //   };

// //   const esAdmin = user?.rol === 'ADMIN';

// //   return (
// //     <div
// //       className={`grid grid-cols-1 ${esAdmin ? 'xl:grid-cols-3' : ''} gap-6`}
// //     >
// //       {/* Formulario Crear/Editar (Visible solo para administradores) */}
// //       {esAdmin && (
// //         <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
// //           <div className="flex justify-between items-center mb-4">
// //             <h2 className="text-lg font-bold text-slate-800">
// //               {idEditando ? 'Editar Viaje' : 'Programar Viaje'}
// //             </h2>
// //             {idEditando && (
// //               <button
// //                 type="button"
// //                 onClick={cancelarEdicion}
// //                 className="text-xs text-slate-500 hover:text-slate-700 underline"
// //               >
// //                 Cancelar Edición
// //               </button>
// //             )}
// //           </div>

// //           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
// //             {/* Select de Ruta */}
// //             <div className="flex flex-col gap-1">
// //               <label className="text-sm font-medium text-slate-700">
// //                 Ruta Asignada
// //               </label>
// //               <select
// //                 {...register('idRuta')}
// //                 className="px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white"
// //               >
// //                 <option value="">Seleccione una ruta...</option>
// //                 {rutasDisponibles.map((r) => (
// //                   <option key={r.idRuta} value={r.idRuta}>
// //                     {recortarTexto(r.nombre)}
// //                   </option>
// //                 ))}
// //               </select>
// //               {errors.idRuta && (
// //                 <span className="text-xs text-red-500 font-medium">
// //                   {errors.idRuta.message}
// //                 </span>
// //               )}
// //             </div>

// //             {/* Select de Chofer */}
// //             <div className="flex flex-col gap-1">
// //               <label className="text-sm font-medium text-slate-700">
// //                 Chofer Responsable
// //               </label>
// //               <select
// //                 {...register('idChofer')}
// //                 className="px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white"
// //               >
// //                 <option value="">Seleccione un chofer...</option>
// //                 {choferesDisponibles.map((c) => (
// //                   <option key={c.idUsuario} value={c.idUsuario}>
// //                     {c.nombre} {c.apellido} (Lic: {c.nroLicencia})
// //                   </option>
// //                 ))}
// //               </select>
// //               {errors.idChofer && (
// //                 <span className="text-xs text-red-500 font-medium">
// //                   {errors.idChofer.message}
// //                 </span>
// //               )}
// //             </div>

// //             {/* Fechas de Salida y Llegada */}
// //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
// //               <Input
// //                 type="datetime-local"
// //                 label="Fecha/Hora Salida"
// //                 error={errors.fechaHoraInicio?.message}
// //                 {...register('fechaHoraInicio')}
// //               />
// //               <Input
// //                 type="datetime-local"
// //                 label="Fecha/Hora Llegada"
// //                 error={errors.fechaHoraFin?.message}
// //                 {...register('fechaHoraFin')}
// //               />
// //             </div>

// //             {/* Capacidades */}
// //             <div className="grid grid-cols-2 gap-3">
// //               <Input
// //                 type="number"
// //                 label="Cupo Pasajeros"
// //                 error={errors.capacidadPasajeros?.message}
// //                 {...register('capacidadPasajeros')}
// //               />
// //               <Input
// //                 type="number"
// //                 label="Cupo Valijas"
// //                 error={errors.capacidadValijas?.message}
// //                 {...register('capacidadValijas')}
// //               />
// //             </div>

// //             {/* Precio */}
// //             <div className="flex flex-col gap-1">
// //               <label className="text-sm font-medium text-slate-700">
// //                 Precio del Pasaje
// //               </label>
// //               <div className="relative flex items-center w-full h-10 border border-slate-300 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-amber-400">
// //                 <span className="pl-3 pr-1.5 text-sm font-semibold text-slate-400 select-none">
// //                   $
// //                 </span>
// //                 <input
// //                   type="number"
// //                   step="0.01"
// //                   {...register('precio', { valueAsNumber: true })}
// //                   className="w-full h-full pr-3 py-2 bg-transparent text-sm text-slate-800 outline-none"
// //                 />
// //               </div>
// //               {errors.precio?.message && (
// //                 <span className="text-xs text-red-500 font-medium">
// //                   {errors.precio.message}
// //                 </span>
// //               )}
// //             </div>

// //             <Button type="submit" isLoading={isSubmitting}>
// //               {idEditando ? 'Guardar Cambios' : 'Programar Servicio'}
// //             </Button>
// //           </form>
// //         </div>
// //       )}

// //       {/* Listado de Viajes */}
// //       <div
// //         className={`${esAdmin ? 'xl:col-span-2' : 'w-full'} bg-white p-6 rounded-lg border border-slate-200 shadow-sm`}
// //       >
// //         <h2 className="text-lg font-bold text-slate-800 mb-4">
// //           Viajes Programados
// //         </h2>

// //         {cargando ? (
// //           <p className="text-sm text-slate-500 flex items-center gap-2">
// //             <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
// //             Cargando viajes...
// //           </p>
// //         ) : (
// //           <div className="overflow-x-auto">
// //             <table className="w-full text-left text-sm text-slate-600 border-collapse">
// //               <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
// //                 <tr>
// //                   <th className="py-3 px-4">Ruta</th>
// //                   <th className="py-3 px-4">Chofer</th>
// //                   <th className="py-3 px-3">Salida</th>
// //                   <th className="py-3 px-3">Llegada</th>
// //                   <th className="py-3 px-3 text-center">Pasajeros</th>
// //                   <th className="py-3 px-3 text-center">Valijas</th>
// //                   <th className="py-3 px-3">Precio</th>
// //                   {esAdmin && (
// //                     <th className="py-3 px-3 text-right">Acciones</th>
// //                   )}
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-slate-100">
// //                 {viajes.map((viaje) => (
// //                   <tr
// //                     key={viaje.id}
// //                     onClick={() => setViajeSeleccionado(viaje)}
// //                     className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
// //                   >
// //                     <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
// //                       {obtenerNombreRuta(viaje)}
// //                     </td>
// //                     <td className="py-3 px-4">
// //                       {viaje.idChofer
// //                         ? obtenerNombreChofer(viaje.idChofer)
// //                         : 'Sin chofer'}
// //                     </td>
// //                     <td className="py-3 px-3 text-xs whitespace-nowrap">
// //                       {viaje.fechaHoraInicio
// //                         ? new Date(viaje.fechaHoraInicio).toLocaleString()
// //                         : '-'}
// //                     </td>
// //                     <td className="py-3 px-3 text-xs whitespace-nowrap">
// //                       {viaje.fechaHoraFin
// //                         ? new Date(viaje.fechaHoraFin).toLocaleString()
// //                         : '-'}
// //                     </td>
// //                     <td className="py-3 px-3 text-center font-medium text-slate-800">
// //                       {viaje.capacidadPasajeros ?? '-'}
// //                     </td>
// //                     <td className="py-3 px-3 text-center font-medium text-slate-800">
// //                       {viaje.capacidadValijas ?? '-'}
// //                     </td>
// //                     <td className="py-3 px-3 font-semibold text-slate-700">
// //                       ${viaje.precio}
// //                     </td>
// //                     {esAdmin && (
// //                       <td
// //                         className="py-3 px-3 text-right"
// //                         onClick={(e) => e.stopPropagation()}
// //                       >
// //                         <div className="flex justify-end gap-2">
// //                           <button
// //                             onClick={() => handleEditar(viaje)}
// //                             className="text-blue-600 hover:text-blue-800 font-medium text-xs transition"
// //                           >
// //                             Editar
// //                           </button>
// //                           <button
// //                             onClick={() => handleEliminar(viaje.id)}
// //                             className="text-red-600 hover:text-red-800 font-medium text-xs transition"
// //                           >
// //                             Cancelar
// //                           </button>
// //                         </div>
// //                       </td>
// //                     )}
// //                   </tr>
// //                 ))}
// //                 {viajes.length === 0 && (
// //                   <tr>
// //                     <td
// //                       colSpan={esAdmin ? 8 : 7}
// //                       className="py-8 text-center text-slate-500"
// //                     >
// //                       No hay viajes programados.
// //                     </td>
// //                   </tr>
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>

// //       {/* MODAL DE DETALLE DE RUTA Y PUNTOS MEDIOS */}
// //       {viajeSeleccionado && (
// //         <div
// //           className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
// //           onClick={() => setViajeSeleccionado(null)}
// //         >
// //           <div
// //             className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200"
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             {/* Encabezado del Modal */}
// //             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
// //               <div>
// //                 <h3 className="text-lg font-bold text-slate-800">
// //                   Detalle del Viaje:{' '}
// //                   <span className="text-amber-600">
// //                     {recortarTexto(obtenerNombreRuta(viajeSeleccionado))}
// //                   </span>
// //                 </h3>
// //                 <p className="text-xs text-slate-500">
// //                   Chofer: {obtenerNombreChofer(viajeSeleccionado.idChofer)}
// //                 </p>
// //               </div>
// //               <button
// //                 onClick={() => setViajeSeleccionado(null)}
// //                 className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
// //               >
// //                 ✕
// //               </button>
// //             </div>

// //             {/* Tabla de Puntos Medios y Disponibilidad */}
// //             <div className="p-6 overflow-x-auto">
// //               <table className="w-full text-left text-sm text-slate-600 border border-slate-200 rounded-lg overflow-hidden">
// //                 <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase">
// //                   <tr>
// //                     <th className="py-2.5 px-4 border-b">Horario</th>
// //                     <th className="py-2.5 px-4 border-b">Punto / Parada</th>
// //                     <th className="py-2.5 px-4 border-b text-center">
// //                       Pasajeros{' '}
// //                       {viajeSeleccionado.tipo === 'PRIVADO' ? '' : 'Disp.'}
// //                     </th>
// //                     <th className="py-2.5 px-4 border-b text-center">
// //                       Valijas{' '}
// //                       {viajeSeleccionado.tipo === 'PRIVADO' ? '' : 'Disp.'}
// //                     </th>
// //                   </tr>
// //                 </thead>
// //                 <tbody className="divide-y divide-slate-100">
// //                   {obtenerPuntosRuta(viajeSeleccionado).map(
// //                     (punto, idx, arr) => {
// //                       const esOrigen = idx === 0;
// //                       const esDestino = idx === arr.length - 1;
// //                       const numeroParada = idx; // Las paradas intermedias empiezan en 1°

// //                       return (
// //                         <tr
// //                           key={idx}
// //                           className={
// //                             esOrigen || esDestino
// //                               ? 'bg-amber-50/30 font-medium'
// //                               : 'hover:bg-slate-50'
// //                           }
// //                         >
// //                           {/* Horario */}
// //                           <td className="py-2.5 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
// //                             {punto.horaEstimada}
// //                           </td>

// //                           {/* Punto con etiquetas Origen, N° Parada o Destino */}
// //                           <td className="py-2.5 px-4 font-semibold text-slate-800">
// //                             <div className="flex items-center gap-2">
// //                               <span>{punto.nombre}</span>

// //                               {esOrigen && (
// //                                 <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-normal">
// //                                   Origen
// //                                 </span>
// //                               )}

// //                               {!esOrigen && !esDestino && (
// //                                 <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-normal">
// //                                   {numeroParada}° Parada
// //                                 </span>
// //                               )}

// //                               {esDestino && (
// //                                 <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-normal">
// //                                   Destino
// //                                 </span>
// //                               )}
// //                             </div>
// //                             {punto.direccion && (
// //                               <div className="text-xs text-slate-400 font-normal mt-0.5">
// //                                 {punto.direccion}
// //                               </div>
// //                             )}
// //                           </td>

// //                           {/* Pasajeros Disponibles */}
// //                           <td className="py-2.5 px-4 text-center font-bold">
// //                             {esDestino ? (
// //                               <span className="text-slate-400 font-normal">
// //                                 -
// //                               </span>
// //                             ) : (
// //                               <span
// //                                 className={
// //                                   punto.pasajerosDisponibles === 0
// //                                     ? 'text-red-500 font-extrabold'
// //                                     : 'text-slate-700'
// //                                 }
// //                               >
// //                                 {punto.pasajerosDisponibles}
// //                               </span>
// //                             )}
// //                           </td>
// //                           {/* Valijas Disponibles */}
// //                           <td className="py-2.5 px-4 text-center font-bold">
// //                             {esDestino ? (
// //                               <span className="text-slate-400 font-normal">
// //                                 -
// //                               </span>
// //                             ) : (
// //                               <span
// //                                 className={
// //                                   punto.valijasDisponibles === 0
// //                                     ? 'text-red-500 font-extrabold'
// //                                     : 'text-slate-700'
// //                                 }
// //                               >
// //                                 {punto.valijasDisponibles}
// //                               </span>
// //                             )}
// //                           </td>
// //                         </tr>
// //                       );
// //                     },
// //                   )}
// //                 </tbody>
// //               </table>
// //             </div>

// //             {/* Footer Modal */}
// //             <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
// //               <button
// //                 onClick={() => setViajeSeleccionado(null)}
// //                 className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-md transition"
// //               >
// //                 Cerrar
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// //

// // archivo intacto sin cambios

// //

// // import { useEffect, useState, useCallback } from 'react';
// // import { useForm, type Resolver } from 'react-hook-form';
// // import { zodResolver } from '@hookform/resolvers/zod';
// // import { viajeSchema, type ViajeFormData } from '../schemas/viajeSchema';
// // import { viajeService } from '../api/viajeService';
// // import { rutaService } from '../../rutas/api/rutaService';
// // import { usuarioService } from '../../usuarios/api/usuarioService';
// // // import { puntoService } from '../../puntos/api/puntoService';
// // import { useAuthStore } from '../../../store/authStore';
// // import type {
// //   Viaje,
// //   Ruta,
// //   Usuario,
// //   Punto,
// //   Reserva,
// //   OcupacionReserva,
// //   PuntoGeografico,
// // } from '../../../types';
// // import { Input } from '../../../components/ui/Input';
// // import { Button } from '../../../components/ui/Button';
// // import { reservaService } from '../../reservas/api/reservaService';
// // import {
// //   calcularDisponibilidadViaje,
// //   type PuntoRutaConOrden,
// //   type ReservaMinima,
// // } from '../../../utils/disponibilidad';

// // // Estructura opcional de punto medio en la ruta
// // interface PuntoDetalle {
// //   nombre: string;
// //   direccion?: string;
// //   horaEstimada: string;
// //   pasajerosDisponibles: number;
// //   valijasDisponibles: number;
// // }

// // export const ViajesPage = () => {
// //   const user = useAuthStore((state) => state.user);
// //   const [viajes, setViajes] = useState<Viaje[]>([]);
// //   const [rutasDisponibles, setRutasDisponibles] = useState<Ruta[]>([]);
// //   const [choferesDisponibles, setChoferesDisponibles] = useState<Usuario[]>([]);
// //   // const [puntosDisponibles, setPuntosDisponibles] = useState<Punto[]>([]); // 2. Agregar estado para puntos
// //   const [cargando, setCargando] = useState(true);
// //   const [idEditando, setIdEditando] = useState<string | null>(null);
// //   const [reservas, setReservas] = useState<Reserva[]>([]);
// //   const [ocupacionesViaje, setOcupacionesViaje] = useState<OcupacionReserva[]>(
// //     [],
// //   );

// //   // Estado para controlar el modal de detalle del viaje
// //   const [viajeSeleccionado, setViajeSeleccionado] = useState<Viaje | null>(
// //     null,
// //   );

// //   console.log('viajes: ', viajes);
// //   console.log('viajeSeleccionado: ', viajeSeleccionado);
// //   const {
// //     register,
// //     handleSubmit,
// //     reset,
// //     setValue,
// //     formState: { errors, isSubmitting },
// //   } = useForm<ViajeFormData>({
// //     resolver: zodResolver(viajeSchema) as unknown as Resolver<ViajeFormData>,
// //     defaultValues: {
// //       idRuta: '',
// //       idChofer: '',
// //       fechaHoraInicio: '',
// //       fechaHoraFin: '',
// //       capacidadPasajeros: 4,
// //       capacidadValijas: 4,
// //       precio: 0,
// //     },
// //   });

// //   // Helper para consultar viajes según el rol del usuario
// //   // const obtenerViajesSegunRol = useCallback(async (): Promise<Viaje[]> => {
// //   //   if (user?.rol === 'ADMIN') {
// //   //     return await viajeService.obtenerTodosAdmin();
// //   //   }
// //   //   if (user?.rol === 'CLIENTE') {
// //   //     return await viajeService.obtenerMisViajes();
// //   //   }
// //   //   return await viajeService.obtenerPublicos();
// //   // }, [user]);
// //   const obtenerViajesSegunRol = useCallback(async (): Promise<Viaje[]> => {
// //     // 1. Administrador: ve absolutamente todos los viajes
// //     if (user?.rol === 'ADMIN') {
// //       return await viajeService.obtenerTodosAdmin();
// //     }

// //     // 2. Cliente: ve los compartidos/públicos + sus viajes privados
// //     if (user?.rol === 'CLIENTE') {
// //       const [publicos, misViajes] = await Promise.all([
// //         viajeService.obtenerPublicos().catch(() => []),
// //         viajeService.obtenerMisViajes().catch(() => []),
// //       ]);

// //       // Combinar sin duplicar (por id)
// //       const mapaViajes = new Map<string, Viaje>();
// //       [...publicos, ...misViajes].forEach((v) => mapaViajes.set(v.id, v));

// //       return Array.from(mapaViajes.values());
// //     }

// //     // 3. Invitados u otros roles: ven solo los viajes compartidos/públicos
// //     return await viajeService.obtenerPublicos();
// //   }, [user]);

// //   useEffect(() => {
// //     // Si no hay viaje seleccionado, no iniciamos ninguna petición
// //     if (!viajeSeleccionado) {
// //       return;
// //     }

// //     let cancelado = false;

// //     reservaService
// //       .obtenerOcupacionPorViaje(viajeSeleccionado.id)
// //       .then((data) => {
// //         if (!cancelado) {
// //           setOcupacionesViaje(data);
// //         }
// //       })
// //       .catch(() => {
// //         if (!cancelado) {
// //           setOcupacionesViaje([]);
// //         }
// //       });

// //     // Función de limpieza: resetea el estado y evita race conditions al desmontar o cambiar de viaje
// //     return () => {
// //       cancelado = true;
// //       setOcupacionesViaje([]);
// //     };
// //   }, [viajeSeleccionado]);

// //   // Carga de datos auxiliares (Rutas y Choferes) y Viajes
// //   const cargarDatos = useCallback(async () => {
// //     try {
// //       const dataRutas = await rutaService.obtenerTodas().catch(() => []);
// //       setRutasDisponibles(dataRutas);

// //       if (user?.rol === 'ADMIN') {
// //         const [dataViajes, dataRutas, dataUsuarios, dataReservas] =
// //           await Promise.all([
// //             obtenerViajesSegunRol(),
// //             rutaService.obtenerTodas(),
// //             usuarioService.obtenerTodos(),
// //             // puntoService.obtenerTodos(), // Consulta de los puntos guardados
// //             reservaService.obtenerTodas(),
// //           ]);
// //         setViajes(dataViajes);
// //         setRutasDisponibles(dataRutas);
// //         setChoferesDisponibles(dataUsuarios.filter((u) => u.rol === 'CHOFER'));
// //         // setPuntosDisponibles(dataPuntos);
// //         setReservas(dataReservas);
// //       } else {
// //         const dataViajes = await obtenerViajesSegunRol();
// //         let dataReservas: Reserva[] = [];
// //         if (user?.id) {
// //           dataReservas = await reservaService.obtenerPorCliente(user.id);
// //         }
// //         setViajes(dataViajes);
// //         setReservas(dataReservas);
// //       }
// //     } catch (error) {
// //       console.error('Error cargando datos:', error);
// //     } finally {
// //       setCargando(false);
// //     }
// //   }, [user, obtenerViajesSegunRol]);

// //   useEffect(() => {
// //     let ignorar = false;
// //     const fetchInicial = async () => {
// //       await cargarDatos();
// //     };
// //     if (!ignorar) fetchInicial();
// //     return () => {
// //       ignorar = true;
// //     };
// //   }, [cargarDatos]);

// //   const onSubmit = async (data: ViajeFormData) => {
// //     try {
// //       if (idEditando) {
// //         await viajeService.actualizar(idEditando, data);
// //       } else {
// //         await viajeService.crear(data);
// //       }
// //       cancelarEdicion();
// //       setCargando(true);
// //       await cargarDatos();
// //     } catch (error) {
// //       alert(error instanceof Error ? error.message : 'Error al guardar');
// //     }
// //   };

// //   const handleEditar = (viaje: Viaje) => {
// //     setIdEditando(viaje.id);
// //     setValue('idRuta', viaje.idRuta || '');
// //     setValue('idChofer', viaje.idChofer || '');
// //     setValue(
// //       'fechaHoraInicio',
// //       viaje.fechaHoraInicio
// //         ? new Date(viaje.fechaHoraInicio).toISOString().slice(0, 16)
// //         : '',
// //     );
// //     setValue(
// //       'fechaHoraFin',
// //       viaje.fechaHoraFin
// //         ? new Date(viaje.fechaHoraFin).toISOString().slice(0, 16)
// //         : '',
// //     );
// //     setValue('capacidadPasajeros', viaje.capacidadPasajeros ?? 4);
// //     setValue('capacidadValijas', viaje.capacidadValijas ?? 4);
// //     setValue('precio', viaje.precio);
// //   };

// //   const cancelarEdicion = () => {
// //     setIdEditando(null);
// //     reset({
// //       idRuta: '',
// //       idChofer: '',
// //       fechaHoraInicio: '',
// //       fechaHoraFin: '',
// //       capacidadPasajeros: 4,
// //       capacidadValijas: 4,
// //       precio: 0,
// //     });
// //   };

// //   const handleEliminar = async (id: string) => {
// //     if (window.confirm('¿Estás seguro de cancelar este viaje?')) {
// //       setCargando(true);
// //       await viajeService.eliminar(id);
// //       await cargarDatos();
// //     }
// //   };

// //   const obtenerNombreRuta = (viaje: Viaje) => {
// //     if (viaje.rutaNombre) return viaje.rutaNombre;
// //     if (typeof viaje.ruta === 'object' && viaje.ruta !== null) {
// //       if (viaje.ruta.origen && viaje.ruta.destino) {
// //         return `${viaje.ruta.origen} ➔ ${viaje.ruta.destino}`;
// //       }
// //       if (viaje.ruta.nombre) return viaje.ruta.nombre;
// //     }
// //     const r = rutasDisponibles.find((item) => item.idRuta === viaje.idRuta);
// //     return r ? r.nombre : 'Ruta no asignada';
// //   };

// //   const obtenerNombreChofer = (idChofer?: string) => {
// //     if (!idChofer) return 'Sin chofer';
// //     const c = choferesDisponibles.find((item) => item.idUsuario === idChofer);
// //     return c ? `${c.nombre} ${c.apellido}` : 'Sin chofer';
// //   };

// //   const recortarTexto = (texto: string, max: number = 70): string => {
// //     if (!texto) return '';
// //     return texto.length > max ? `${texto.substring(0, max)}...` : texto;
// //   };

// //   // Helper para construir la lista de puntos a mostrar en el Modal
// //   const obtenerPuntosRuta = (viaje: Viaje): PuntoDetalle[] => {
// //     console.log('viaje: ', viaje);
// //     const nombreRuta = obtenerNombreRuta(viaje);
// //     const esViajePrivado =
// //       !viaje.idRuta ||
// //       viaje.tipo === 'PRIVADO' ||
// //       nombreRuta.toLowerCase().includes('privada');

// //     if (esViajePrivado) {
// //       // Buscar si el viaje tiene una reserva vinculada en el estado local de reservas
// //       const reservaAsociada = reservas.find((r) => {
// //         const idViajeReserva =
// //           typeof r.viaje === 'object' && r.viaje !== null
// //             ? r.viaje.id
// //             : r.viaje;
// //         return idViajeReserva === viaje.id;
// //       });

// //       // Extraer Origen
// //       let origenStr = 'Origen Privado';
// //       let direccionOrigen = '';

// //       if (typeof viaje.origen === 'object' && viaje.origen !== null) {
// //         origenStr =
// //           (viaje.origen as PuntoGeografico).nombre || 'Origen Privado';
// //         direccionOrigen =
// //           (viaje.origen as PuntoGeografico).direccion || origenStr;
// //       } else if (typeof viaje.origen === 'string' && viaje.origen) {
// //         origenStr = viaje.origen;
// //         direccionOrigen = viaje.origen;
// //       } else if (reservaAsociada?.origen) {
// //         origenStr = reservaAsociada.origen;
// //         direccionOrigen = reservaAsociada.origen;
// //       }

// //       // Extraer Destino
// //       let destinoStr = 'Destino Privado';
// //       let direccionDestino = '';

// //       if (typeof viaje.destino === 'object' && viaje.destino !== null) {
// //         destinoStr =
// //           (viaje.destino as PuntoGeografico).nombre || 'Destino Privado';
// //         direccionDestino =
// //           (viaje.destino as PuntoGeografico).direccion || destinoStr;
// //       } else if (typeof viaje.destino === 'string' && viaje.destino) {
// //         destinoStr = viaje.destino;
// //         direccionDestino = viaje.destino;
// //       } else if (reservaAsociada?.destino) {
// //         destinoStr = reservaAsociada.destino;
// //         direccionDestino = reservaAsociada.destino;
// //       }

// //       // Si origen y destino siguen vacíos, intentar parsear la cadena "Ruta Privada: Origen - Destino"
// //       if (origenStr === 'Origen Privado' && nombreRuta.includes(' - ')) {
// //         const partes = nombreRuta
// //           .replace(/^Ruta Privada:\s*/i, '')
// //           .split(' - ');
// //         if (partes.length >= 2) {
// //           origenStr = partes[0].trim();
// //           direccionOrigen = partes[0].trim();
// //           destinoStr = partes[1].trim();
// //           direccionDestino = partes[1].trim();
// //         }
// //       }

// //       const formatoFechaHora = (fechaStr?: string) => {
// //         if (!fechaStr) return '-';
// //         const fecha = new Date(fechaStr);
// //         return isNaN(fecha.getTime())
// //           ? '-'
// //           : fecha.toLocaleString([], {
// //               day: '2-digit',
// //               month: '2-digit',
// //               year: 'numeric',
// //               hour: '2-digit',
// //               minute: '2-digit',
// //             });
// //       };

// //       return [
// //         {
// //           nombre: origenStr,
// //           direccion: direccionOrigen,
// //           horaEstimada: formatoFechaHora(viaje.fechaHoraInicio),
// //           pasajerosDisponibles: viaje.capacidadPasajeros ?? 0,
// //           valijasDisponibles: viaje.capacidadValijas ?? 0,
// //         },
// //         {
// //           nombre: destinoStr,
// //           direccion: direccionDestino,
// //           horaEstimada: formatoFechaHora(viaje.fechaHoraFin),
// //           pasajerosDisponibles: 0,
// //           valijasDisponibles: 0,
// //         },
// //       ];
// //     }

// //     const rutaCompleta = rutasDisponibles.find(
// //       (r) => r.idRuta === viaje.idRuta,
// //     );
// //     const elementos = rutaCompleta?.puntos || [];

// //     if (elementos.length === 0) return [];

// //     // 1. Mapear y ordenar los puntos de la ruta con su 'orden'
// //     const puntosOrdenados: PuntoRutaConOrden[] = [...elementos]
// //       .map((item, idx) => {
// //         const puntoObj: Punto | undefined =
// //           'punto' in item && item.punto
// //             ? item.punto
// //             : (item as unknown as Punto);

// //         const ordenItem =
// //           'orden' in item && typeof item.orden === 'number'
// //             ? item.orden
// //             : idx + 1;
// //         const nombrePunto = puntoObj?.nombre || `Punto ${ordenItem}`;

// //         return {
// //           orden: ordenItem,
// //           nombre: nombrePunto,
// //         };
// //       })
// //       .sort((a, b) => a.orden - b.orden);

// //     // 2. Mapear las reservas asociadas a este viaje al formato ReservaMinima
// //     // Si es ADMIN usa la lista completa de 'reservas'; si no, usa las 'ocupacionesViaje' anónimas
// //     const fuenteReservas = esAdmin
// //       ? reservas.filter((r) => {
// //           const idViajeReserva =
// //             typeof r.viaje === 'object' && r.viaje !== null
// //               ? r.viaje.id
// //               : r.viaje;
// //           return idViajeReserva === viaje.id;
// //         })
// //       : ocupacionesViaje;

// //     const reservasDelViaje: ReservaMinima[] = fuenteReservas.map((r) => ({
// //       origen: r.origen || '',
// //       destino: r.destino || '',
// //       cantPasajeros: r.cantPasajeros ?? 1,
// //       cantValijas: r.cantValijas ?? 0,
// //     }));

// //     // 3. Ejecutar el cálculo por tramos
// //     const tramosCalculados = calcularDisponibilidadViaje(
// //       viaje.capacidadPasajeros ?? 0,
// //       viaje.capacidadValijas ?? 0,
// //       puntosOrdenados,
// //       reservasDelViaje,
// //     );

// //     // 4. Mapear la información para renderizar en la tabla del modal
// //     return elementos
// //       .sort((a, b) => {
// //         const ordenA =
// //           'orden' in a && typeof a.orden === 'number' ? a.orden : 0;
// //         const ordenB =
// //           'orden' in b && typeof b.orden === 'number' ? b.orden : 0;
// //         return ordenA - ordenB;
// //       })
// //       .map((item, idx) => {
// //         const esOrigen = idx === 0;
// //         const esDestino = idx === elementos.length - 1;

// //         const puntoObj: Punto | undefined =
// //           'punto' in item && item.punto
// //             ? item.punto
// //             : (item as unknown as Punto);

// //         const ordenItem =
// //           'orden' in item && typeof item.orden === 'number'
// //             ? item.orden
// //             : idx + 1;
// //         const direccionFallback =
// //           'direccion' in item && typeof item.direccion === 'string'
// //             ? item.direccion
// //             : '';

// //         // Buscar el tramo calculado correspondiente a este punto
// //         const tramoInfo = tramosCalculados.find(
// //           (t) => t.ordenInicio === ordenItem,
// //         );

// //         const formatoFechaHora = (fechaStr: string) => {
// //           const fecha = new Date(fechaStr);
// //           return isNaN(fecha.getTime())
// //             ? '-'
// //             : fecha.toLocaleString([], {
// //                 day: '2-digit',
// //                 month: '2-digit',
// //                 year: 'numeric',
// //                 hour: '2-digit',
// //                 minute: '2-digit',
// //               });
// //         };

// //         let horaEstimada = '-';
// //         if (esOrigen && viaje.fechaHoraInicio) {
// //           horaEstimada = formatoFechaHora(viaje.fechaHoraInicio);
// //         } else if (esDestino && viaje.fechaHoraFin) {
// //           horaEstimada = formatoFechaHora(viaje.fechaHoraFin);
// //         } else if (
// //           'horaEstimada' in item &&
// //           typeof item.horaEstimada === 'string' &&
// //           item.horaEstimada
// //         ) {
// //           horaEstimada = item.horaEstimada;
// //         }

// //         return {
// //           nombre:
// //             puntoObj?.nombre ||
// //             (ordenItem ? `Punto ${ordenItem}` : 'Punto sin nombre'),
// //           direccion:
// //             puntoObj?.direccion || direccionFallback || 'Sin dirección',
// //           horaEstimada,
// //           pasajerosDisponibles: tramoInfo
// //             ? tramoInfo.pasajerosDisponibles
// //             : (viaje.capacidadPasajeros ?? 0),
// //           valijasDisponibles: tramoInfo
// //             ? tramoInfo.valijasDisponibles
// //             : (viaje.capacidadValijas ?? 0),
// //         };
// //       });
// //   };

// //   const esAdmin = user?.rol === 'ADMIN';

// //   return (
// //     <div
// //       className={`grid grid-cols-1 ${esAdmin ? 'xl:grid-cols-3' : ''} gap-6`}
// //     >
// //       {/* Formulario Crear/Editar (Visible solo para administradores) */}
// //       {esAdmin && (
// //         <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
// //           <div className="flex justify-between items-center mb-4">
// //             <h2 className="text-lg font-bold text-slate-800">
// //               {idEditando ? 'Editar Viaje' : 'Programar Viaje'}
// //             </h2>
// //             {idEditando && (
// //               <button
// //                 type="button"
// //                 onClick={cancelarEdicion}
// //                 className="text-xs text-slate-500 hover:text-slate-700 underline"
// //               >
// //                 Cancelar Edición
// //               </button>
// //             )}
// //           </div>

// //           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
// //             {/* Select de Ruta */}
// //             <div className="flex flex-col gap-1">
// //               <label className="text-sm font-medium text-slate-700">
// //                 Ruta Asignada
// //               </label>
// //               <select
// //                 {...register('idRuta')}
// //                 className="px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white"
// //               >
// //                 <option value="">Seleccione una ruta...</option>
// //                 {rutasDisponibles.map((r) => (
// //                   <option key={r.idRuta} value={r.idRuta}>
// //                     {recortarTexto(r.nombre)}
// //                   </option>
// //                 ))}
// //               </select>
// //               {errors.idRuta && (
// //                 <span className="text-xs text-red-500 font-medium">
// //                   {errors.idRuta.message}
// //                 </span>
// //               )}
// //             </div>

// //             {/* Select de Chofer */}
// //             <div className="flex flex-col gap-1">
// //               <label className="text-sm font-medium text-slate-700">
// //                 Chofer Responsable
// //               </label>
// //               <select
// //                 {...register('idChofer')}
// //                 className="px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white"
// //               >
// //                 <option value="">Seleccione un chofer...</option>
// //                 {choferesDisponibles.map((c) => (
// //                   <option key={c.idUsuario} value={c.idUsuario}>
// //                     {c.nombre} {c.apellido} (Lic: {c.nroLicencia})
// //                   </option>
// //                 ))}
// //               </select>
// //               {errors.idChofer && (
// //                 <span className="text-xs text-red-500 font-medium">
// //                   {errors.idChofer.message}
// //                 </span>
// //               )}
// //             </div>

// //             {/* Fechas de Salida y Llegada */}
// //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
// //               <Input
// //                 type="datetime-local"
// //                 label="Fecha/Hora Salida"
// //                 error={errors.fechaHoraInicio?.message}
// //                 {...register('fechaHoraInicio')}
// //               />
// //               <Input
// //                 type="datetime-local"
// //                 label="Fecha/Hora Llegada"
// //                 error={errors.fechaHoraFin?.message}
// //                 {...register('fechaHoraFin')}
// //               />
// //             </div>

// //             {/* Capacidades */}
// //             <div className="grid grid-cols-2 gap-3">
// //               <Input
// //                 type="number"
// //                 label="Cupo Pasajeros"
// //                 error={errors.capacidadPasajeros?.message}
// //                 {...register('capacidadPasajeros')}
// //               />
// //               <Input
// //                 type="number"
// //                 label="Cupo Valijas"
// //                 error={errors.capacidadValijas?.message}
// //                 {...register('capacidadValijas')}
// //               />
// //             </div>

// //             {/* Precio */}
// //             <div className="flex flex-col gap-1">
// //               <label className="text-sm font-medium text-slate-700">
// //                 Precio del Pasaje
// //               </label>
// //               <div className="relative flex items-center w-full h-10 border border-slate-300 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-amber-400">
// //                 <span className="pl-3 pr-1.5 text-sm font-semibold text-slate-400 select-none">
// //                   $
// //                 </span>
// //                 <input
// //                   type="number"
// //                   step="0.01"
// //                   {...register('precio', { valueAsNumber: true })}
// //                   className="w-full h-full pr-3 py-2 bg-transparent text-sm text-slate-800 outline-none"
// //                 />
// //               </div>
// //               {errors.precio?.message && (
// //                 <span className="text-xs text-red-500 font-medium">
// //                   {errors.precio.message}
// //                 </span>
// //               )}
// //             </div>

// //             <Button type="submit" isLoading={isSubmitting}>
// //               {idEditando ? 'Guardar Cambios' : 'Programar Servicio'}
// //             </Button>
// //           </form>
// //         </div>
// //       )}

// //       {/* Listado de Viajes */}
// //       <div
// //         className={`${esAdmin ? 'xl:col-span-2' : 'w-full'} bg-white p-6 rounded-lg border border-slate-200 shadow-sm`}
// //       >
// //         <h2 className="text-lg font-bold text-slate-800 mb-4">
// //           Viajes Programados
// //         </h2>

// //         {cargando ? (
// //           <p className="text-sm text-slate-500 flex items-center gap-2">
// //             <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
// //             Cargando viajes...
// //           </p>
// //         ) : (
// //           <div className="overflow-x-auto">
// //             <table className="w-full text-left text-sm text-slate-600 border-collapse">
// //               <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
// //                 <tr>
// //                   <th className="py-3 px-4">Ruta</th>
// //                   <th className="py-3 px-4">Chofer</th>
// //                   <th className="py-3 px-3">Salida</th>
// //                   <th className="py-3 px-3">Llegada</th>
// //                   <th className="py-3 px-3 text-center">Pasajeros</th>
// //                   <th className="py-3 px-3 text-center">Valijas</th>
// //                   <th className="py-3 px-3">Precio</th>
// //                   {esAdmin && (
// //                     <th className="py-3 px-3 text-right">Acciones</th>
// //                   )}
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-slate-100">
// //                 {viajes.map((viaje) => (
// //                   <tr
// //                     key={viaje.id}
// //                     onClick={() => setViajeSeleccionado(viaje)}
// //                     className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
// //                   >
// //                     <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
// //                       {obtenerNombreRuta(viaje)}
// //                     </td>
// //                     <td className="py-3 px-4">
// //                       {viaje.idChofer
// //                         ? obtenerNombreChofer(viaje.idChofer)
// //                         : 'Sin chofer'}
// //                     </td>
// //                     <td className="py-3 px-3 text-xs whitespace-nowrap">
// //                       {viaje.fechaHoraInicio
// //                         ? new Date(viaje.fechaHoraInicio).toLocaleString()
// //                         : '-'}
// //                     </td>
// //                     <td className="py-3 px-3 text-xs whitespace-nowrap">
// //                       {viaje.fechaHoraFin
// //                         ? new Date(viaje.fechaHoraFin).toLocaleString()
// //                         : '-'}
// //                     </td>
// //                     <td className="py-3 px-3 text-center font-medium text-slate-800">
// //                       {viaje.capacidadPasajeros ?? '-'}
// //                     </td>
// //                     <td className="py-3 px-3 text-center font-medium text-slate-800">
// //                       {viaje.capacidadValijas ?? '-'}
// //                     </td>
// //                     <td className="py-3 px-3 font-semibold text-slate-700">
// //                       ${viaje.precio}
// //                     </td>
// //                     {esAdmin && (
// //                       <td
// //                         className="py-3 px-3 text-right"
// //                         onClick={(e) => e.stopPropagation()}
// //                       >
// //                         <div className="flex justify-end gap-2">
// //                           <button
// //                             onClick={() => handleEditar(viaje)}
// //                             className="text-blue-600 hover:text-blue-800 font-medium text-xs transition"
// //                           >
// //                             Editar
// //                           </button>
// //                           <button
// //                             onClick={() => handleEliminar(viaje.id)}
// //                             className="text-red-600 hover:text-red-800 font-medium text-xs transition"
// //                           >
// //                             Cancelar
// //                           </button>
// //                         </div>
// //                       </td>
// //                     )}
// //                   </tr>
// //                 ))}
// //                 {viajes.length === 0 && (
// //                   <tr>
// //                     <td
// //                       colSpan={esAdmin ? 8 : 7}
// //                       className="py-8 text-center text-slate-500"
// //                     >
// //                       No hay viajes programados.
// //                     </td>
// //                   </tr>
// //                 )}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>

// //       {/* MODAL DE DETALLE DE RUTA Y PUNTOS MEDIOS */}
// //       {viajeSeleccionado && (
// //         <div
// //           className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
// //           onClick={() => setViajeSeleccionado(null)}
// //         >
// //           <div
// //             className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200"
// //             onClick={(e) => e.stopPropagation()}
// //           >
// //             {/* Encabezado del Modal */}
// //             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
// //               <div>
// //                 <h3 className="text-lg font-bold text-slate-800">
// //                   Detalle del Viaje:{' '}
// //                   <span className="text-amber-600">
// //                     {recortarTexto(obtenerNombreRuta(viajeSeleccionado))}
// //                   </span>
// //                 </h3>
// //                 <p className="text-xs text-slate-500">
// //                   Chofer: {obtenerNombreChofer(viajeSeleccionado.idChofer)}
// //                 </p>
// //               </div>
// //               <button
// //                 onClick={() => setViajeSeleccionado(null)}
// //                 className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
// //               >
// //                 ✕
// //               </button>
// //             </div>

// //             {/* Tabla de Puntos Medios y Disponibilidad */}
// //             <div className="p-6 overflow-x-auto">
// //               <table className="w-full text-left text-sm text-slate-600 border border-slate-200 rounded-lg overflow-hidden">
// //                 <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase">
// //                   <tr>
// //                     <th className="py-2.5 px-4 border-b">Horario</th>
// //                     <th className="py-2.5 px-4 border-b">Punto / Parada</th>
// //                     <th className="py-2.5 px-4 border-b text-center">
// //                       Pasajeros{' '}
// //                       {viajeSeleccionado.tipo === 'PRIVADO' ? '' : 'Disp.'}
// //                     </th>
// //                     <th className="py-2.5 px-4 border-b text-center">
// //                       Valijas{' '}
// //                       {viajeSeleccionado.tipo === 'PRIVADO' ? '' : 'Disp.'}
// //                     </th>
// //                   </tr>
// //                 </thead>
// //                 <tbody className="divide-y divide-slate-100">
// //                   {obtenerPuntosRuta(viajeSeleccionado).map(
// //                     (punto, idx, arr) => {
// //                       const esOrigen = idx === 0;
// //                       const esDestino = idx === arr.length - 1;
// //                       const numeroParada = idx; // Las paradas intermedias empiezan en 1°

// //                       return (
// //                         <tr
// //                           key={idx}
// //                           className={
// //                             esOrigen || esDestino
// //                               ? 'bg-amber-50/30 font-medium'
// //                               : 'hover:bg-slate-50'
// //                           }
// //                         >
// //                           {/* Horario */}
// //                           <td className="py-2.5 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
// //                             {punto.horaEstimada}
// //                           </td>

// //                           {/* Punto con etiquetas Origen, N° Parada o Destino */}
// //                           <td className="py-2.5 px-4 font-semibold text-slate-800">
// //                             <div className="flex items-center gap-2">
// //                               <span>{punto.nombre}</span>

// //                               {esOrigen && (
// //                                 <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-normal">
// //                                   Origen
// //                                 </span>
// //                               )}

// //                               {!esOrigen && !esDestino && (
// //                                 <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-normal">
// //                                   {numeroParada}° Parada
// //                                 </span>
// //                               )}

// //                               {esDestino && (
// //                                 <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-normal">
// //                                   Destino
// //                                 </span>
// //                               )}
// //                             </div>
// //                             {punto.direccion && (
// //                               <div className="text-xs text-slate-400 font-normal mt-0.5">
// //                                 {punto.direccion}
// //                               </div>
// //                             )}
// //                           </td>

// //                           {/* Pasajeros Disponibles */}
// //                           <td className="py-2.5 px-4 text-center font-bold">
// //                             {esDestino ? (
// //                               <span className="text-slate-400 font-normal">
// //                                 -
// //                               </span>
// //                             ) : (
// //                               <span
// //                                 className={
// //                                   punto.pasajerosDisponibles === 0
// //                                     ? 'text-red-500 font-extrabold'
// //                                     : 'text-slate-700'
// //                                 }
// //                               >
// //                                 {punto.pasajerosDisponibles}
// //                               </span>
// //                             )}
// //                           </td>
// //                           {/* Valijas Disponibles */}
// //                           <td className="py-2.5 px-4 text-center font-bold">
// //                             {esDestino ? (
// //                               <span className="text-slate-400 font-normal">
// //                                 -
// //                               </span>
// //                             ) : (
// //                               <span
// //                                 className={
// //                                   punto.valijasDisponibles === 0
// //                                     ? 'text-red-500 font-extrabold'
// //                                     : 'text-slate-700'
// //                                 }
// //                               >
// //                                 {punto.valijasDisponibles}
// //                               </span>
// //                             )}
// //                           </td>
// //                         </tr>
// //                       );
// //                     },
// //                   )}
// //                 </tbody>
// //               </table>
// //             </div>

// //             {/* Footer Modal */}
// //             <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
// //               <button
// //                 onClick={() => setViajeSeleccionado(null)}
// //                 className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-md transition"
// //               >
// //                 Cerrar
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };
