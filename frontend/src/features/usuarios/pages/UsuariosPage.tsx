import { useEffect, useState } from 'react';
import { usuarioService } from '../api/usuarioService';
import { type Usuario } from '../../../types';
import { UsuarioForm } from '../components/UsuarioForm';
import { useAuthStore } from '../../../store/authStore';

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | null>(
    null,
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabActiva, setTabActiva] = useState<'PERSONAL' | 'CLIENTES'>(
    'PERSONAL',
  );

  const refrescarTabla = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await usuarioService.obtenerTodos();
      setUsuarios(data);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Error al obtener usuarios');
    } finally {
      setCargando(false);
    }
  };
  
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    let ignorar = false;

    const fetchInicial = async () => {
      
      if (user?.rol !== 'ADMIN') {
        setCargando(false);
        setError('Ndereguerekoi permiso rehecha haguã ko página');
        return;
      }
        setCargando(false);
      try {
        const data = await usuarioService.obtenerTodos();
        if (!ignorar) {
          setUsuarios(data);
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

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
      await usuarioService.eliminar(id);
      if (usuarioEnEdicion?.idUsuario === id) {
        setUsuarioEnEdicion(null);
      }
      await refrescarTabla();
      } catch (err: unknown) {
        const e = err as Error;
        alert(e.message || 'No se pudo eliminar el registro');
      }
    }
  };

  const personalInterno = usuarios.filter((u) => u.rol !== 'CLIENTE');
  const clientes = usuarios.filter((u) => u.rol === 'CLIENTE');
  const listaActual = tabActiva === 'PERSONAL' ? personalInterno : clientes;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Renderizado del Formulario aislado */}
      <UsuarioForm
        usuarioAEditar={usuarioEnEdicion}
        onCancelEdit={() => setUsuarioEnEdicion(null)}
        onSuccess={async () => {
          setUsuarioEnEdicion(null);
          await refrescarTabla();
        }}
      />

      {/* Renderizado de la Tabla */}
      <div className="xl:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex gap-6 border-b border-slate-200 mb-6">
          <button
            onClick={() => setTabActiva('PERSONAL')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              tabActiva === 'PERSONAL'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Personal Interno ({personalInterno.length})
          </button>
          <button
            onClick={() => setTabActiva('CLIENTES')}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
              tabActiva === 'CLIENTES'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Clientes Registrados ({clientes.length})
          </button>
        </div>

        {cargando ? (
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
            Cargando registros...
          </p>
        ) : error ? (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          <p className="font-semibold">Ocurrió un error al cargar la información</p>
          <p>{error}</p>
        </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Nombre Completo</th>
                  <th className="py-3 px-4">Contacto</th>
                  {tabActiva === 'PERSONAL' && (
                    <th className="py-3 px-4">Rol</th>
                  )}
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listaActual.map((u, i) => (
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
                          onClick={() => setUsuarioEnEdicion(u)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminar(u.idUsuario)}
                          className="text-red-600 hover:text-red-800 font-medium text-xs transition"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {listaActual.length === 0 && (
                  <tr>
                    <td
                      colSpan={tabActiva === 'PERSONAL' ? 5 : 4}
                      className="py-8 text-center text-slate-500"
                    >
                      No hay registros para mostrar.
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