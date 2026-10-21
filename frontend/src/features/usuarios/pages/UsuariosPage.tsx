import { useEffect, useState, useMemo, useCallback } from 'react';
import { usuarioService } from '../api/usuarioService';
import { type Usuario } from '../../../types';
import { UsuarioForm } from '../components/UsuarioForm';
import { useAuthStore } from '../../../store/authStore';
import { Plus, RefreshCw, Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<'PERSONAL' | 'CLIENTES'>('PERSONAL');
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const user = useAuthStore((state) => state.user);

  const refrescarTabla = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await usuarioService.obtenerTodos();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error al obtener usuarios');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let ignorar = false;

    const fetchInicial = async () => {
      if (user?.rol !== 'ADMIN') {
        setCargando(false);
        setError('No tiene permiso para ver esta página.');
        return;
      }
      try {
        const data = await usuarioService.obtenerTodos();
        if (!ignorar) {
          setUsuarios(Array.isArray(data) ? data : []);
        }
      } catch (err: unknown) {
        if (!ignorar) {
          const e = err as Error;
          setError(e.message || 'Error al cargar datos');
        }
      } finally {
        if (!ignorar) {
          setCargando(false);
        }
      }
    };

    fetchInicial();

    return () => {
      ignorar = true;
    };
  }, [user]);

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

  const personalInterno = useMemo(() => {
    return usuarios.filter((u) => {
      const esRolValido = u.rol !== 'CLIENTE';
      const esElMismoAdmin = user && (u.id === user.id || u.idUsuario === user.id || u.usuario === user.usuario);
      return esRolValido && !esElMismoAdmin;
    });
  }, [usuarios, user]);

  const clientes = useMemo(() => {
    return usuarios.filter((u) => u.rol === 'CLIENTE');
  }, [usuarios]);

  const listaActual = tabActiva === 'PERSONAL' ? personalInterno : clientes;

  const usuariosFiltrados = useMemo(() => {
    const query = busqueda.toLowerCase().trim();
    if (!query) return listaActual;

    return listaActual.filter((u) => {
      const nombreCompleto = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
      const username = (u.usuario || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      const dni = (u.dni || '').toLowerCase();

      return (
        nombreCompleto.includes(query) ||
        username.includes(query) ||
        email.includes(query) ||
        dni.includes(query)
      );
    });
  }, [listaActual, busqueda]);

  const totalPaginas = Math.ceil(usuariosFiltrados.length / elementosPorPagina) || 1;

  const usuariosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return usuariosFiltrados.slice(inicio, inicio + elementosPorPagina);
  }, [usuariosFiltrados, paginaActual]);

  const abrirModalCrear = () => {
    setUsuarioEnEdicion(null);
    setModalAbierto(true);
  };

  const handleEditar = (u: Usuario) => {
    setUsuarioEnEdicion(u);
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setUsuarioEnEdicion(null);
    setModalAbierto(false);
  };

  const handleEliminar = async (id?: string) => {
    if (!id) return;
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await usuarioService.eliminar(id);
        if (usuarioEnEdicion?.idUsuario === id) {
          handleCerrarModal();
        }
        await refrescarTabla();
      } catch (err: unknown) {
        const e = err as Error;
        alert(e.message || 'No se pudo eliminar el registro');
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bold text-gray-900">Gestión de Usuarios</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refrescarTabla}
            disabled={cargando}
            className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Recargar usuarios"
          >
            <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario, email o DNI..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-4 border-b border-gray-100 flex gap-6">
          <button
            onClick={() => {
              setTabActiva('PERSONAL');
              setBusqueda('');
              setPaginaActual(1);
            }}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              tabActiva === 'PERSONAL'
                ? 'border-amber-500 text-amber-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Personal Interno ({personalInterno.length})
          </button>
          <button
            onClick={() => {
              setTabActiva('CLIENTES');
              setBusqueda('');
              setPaginaActual(1);
            }}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              tabActiva === 'CLIENTES'
                ? 'border-amber-500 text-amber-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Clientes Registrados ({clientes.length})
          </button>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm">Cargando registros...</p>
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
              <p className="font-semibold">Ocurrió un error al cargar la información</p>
              <p>{error}</p>
            </div>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <Users className="w-12 h-12 text-gray-300" />
            <p className="font-medium text-gray-700">No se encontraron registros</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Nombre Completo</th>
                    <th className="py-3 px-4">Contacto</th>
                    {tabActiva === 'PERSONAL' && <th className="py-3 px-4">Rol</th>}
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuariosPaginados.map((u, i) => (
                    <tr
                      key={u.idUsuario || i}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {u.usuario}
                      </td>
                      <td className="py-3 px-4">
                        {u.nombre} {u.apellido}
                        {u.rol === 'CHOFER' && u.nroLicencia && (
                          <span className="block text-xs text-slate-400 mt-0.5">
                            Lic: {u.nroLicencia}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div>{u.email}</div>
                        <div className="text-slate-400">{u.telefono}</div>
                      </td>
                      {tabActiva === 'PERSONAL' && (
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {u.rol}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleEditar(u)}
                            className="text-amber-600 hover:text-amber-800 font-semibold text-xs transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(u.idUsuario)}
                            className="text-red-600 hover:text-red-800 font-semibold text-xs transition"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[85vh] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center border-b px-6 py-4 bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-800">
                {usuarioEnEdicion ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
              </h2>
              <button
                type="button"
                onClick={handleCerrarModal}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <UsuarioForm
                usuarioAEditar={usuarioEnEdicion}
                onCancelEdit={handleCerrarModal}
                onSuccess={async () => {
                  handleCerrarModal();
                  await refrescarTabla();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPage;