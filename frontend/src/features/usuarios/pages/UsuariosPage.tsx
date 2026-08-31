// import { useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { usuarioSchema, type UsuarioFormData } from '../schemas/usuarioSchema';
// import { usuarioService } from '../api/usuarioService';
// import type { Usuario } from '../../../types';
// import { Input } from '../../../components/ui/Input';
// import { Button } from '../../../components/ui/Button';

// export const UsuariosPage = () => {
//   const [usuarios, setUsuarios] = useState<Usuario[]>([]);
//   const [cargando, setCargando] = useState(true);

//   // 1. Configuración del formulario
//   const {
//     register,
//     handleSubmit,
//     reset,
//     watch,
//     formState: { errors, isSubmitting },
//   } = useForm<UsuarioFormData>({
//     resolver: zodResolver(usuarioSchema),
//     defaultValues: { rol: 'OPERADOR' }, // Por defecto un rol interno
//   });

//   // 2. Observamos el rol seleccionado para la lógica condicional
//   const rolSeleccionado = watch('rol');

//   const cargarUsuarios = async () => {
//     setCargando(true);
//     const data = await usuarioService.obtenerTodos();
//     setUsuarios(data);
//     setCargando(false);
//   };

//   useEffect(() => {
//     cargarUsuarios();
//   }, []);

//   const onSubmit = async (data: UsuarioFormData) => {
//     await usuarioService.crear(data);
//     reset(); // Limpia el formulario
//     await cargarUsuarios(); // Refresca la tabla
//   };

//   const handleEliminar = async (id: string) => {
//     if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
//       await usuarioService.eliminar(id);
//       await cargarUsuarios();
//     }
//   };

//   return (
//     <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//       {/* Formulario de Alta */}
//       <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
//         <h2 className="text-lg font-bold text-slate-800 mb-4">
//           Nuevo Empleado
//         </h2>

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <Input
//             label="Usuario (Alias)"
//             error={errors.usuario?.message}
//             {...register('usuario')}
//           />

//           <div className="grid grid-cols-2 gap-4">
//             <Input
//               label="Nombre"
//               error={errors.nombre?.message}
//               {...register('nombre')}
//             />
//             <Input
//               label="Apellido"
//               error={errors.apellido?.message}
//               {...register('apellido')}
//             />
//           </div>

//           <Input
//             label="Email"
//             type="email"
//             error={errors.email?.message}
//             {...register('email')}
//           />
//           <Input
//             label="Teléfono"
//             error={errors.telefono?.message}
//             {...register('telefono')}
//           />

//           <div className="flex flex-col gap-1">
//             <label className="text-sm font-medium text-slate-700">
//               Rol del Empleado
//             </label>
//             <select
//               {...register('rol')}
//               className="px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white"
//             >
//               <option value="OPERADOR">Operador</option>
//               <option value="CHOFER">Chofer</option>
//               <option value="ADMIN">Administrador</option>
//             </select>
//             {errors.rol && (
//               <span className="text-xs text-red-500 font-medium">
//                 {errors.rol.message}
//               </span>
//             )}
//           </div>

//           {/* RENDERIZADO CONDICIONAL: Solo aparece si selecciona CHOFER */}
//           {rolSeleccionado === 'CHOFER' && (
//             <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-4 animate-in fade-in slide-in-from-top-2">
//               <h3 className="text-sm font-semibold text-slate-800">
//                 Datos Legales del Chofer
//               </h3>
//               <Input
//                 label="Número de Licencia"
//                 error={errors.nroLicencia?.message}
//                 {...register('nroLicencia')}
//               />
//               <Input
//                 type="date"
//                 label="Vencimiento Licencia"
//                 error={errors.vencimientoLicencia?.message}
//                 {...register('vencimientoLicencia')}
//               />
//             </div>
//           )}

//           <Button type="submit" isLoading={isSubmitting}>
//             Guardar Registro
//           </Button>
//         </form>
//       </div>

//       {/* Listado de Usuarios */}
//       <div className="xl:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
//         <h2 className="text-lg font-bold text-slate-800 mb-4">
//           Personal Registrado
//         </h2>

//         {cargando ? (
//           <p className="text-sm text-slate-500 flex items-center gap-2">
//             <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
//             Cargando registros...
//           </p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-left text-sm text-slate-600">
//               <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
//                 <tr>
//                   <th className="py-3 px-4">Usuario</th>
//                   <th className="py-3 px-4">Nombre Completo</th>
//                   <th className="py-3 px-4">Contacto</th>
//                   <th className="py-3 px-4">Rol</th>
//                   <th className="py-3 px-4 text-right">Acción</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {usuarios.map((u) => (
//                   <tr
//                     key={u.idUsuario}
//                     className="hover:bg-slate-50 transition-colors"
//                   >
//                     <td className="py-3 px-4 font-medium text-slate-900">
//                       {u.usuario}
//                     </td>
//                     <td className="py-3 px-4">
//                       {u.nombre} {u.apellido}
//                       {/* Si es chofer, mostramos un badge chiquito con la licencia */}
//                       {u.rol === 'CHOFER' && u.nroLicencia && (
//                         <span className="block text-xs text-slate-400 mt-0.5">
//                           Lic: {u.nroLicencia}
//                         </span>
//                       )}
//                     </td>
//                     <td className="py-3 px-4 text-xs">
//                       <div>{u.email}</div>
//                       <div className="text-slate-400">{u.telefono}</div>
//                     </td>
//                     <td className="py-3 px-4">
//                       <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
//                         {u.rol}
//                       </span>
//                     </td>
//                     <td className="py-3 px-4 text-right">
//                       <button
//                         onClick={() => handleEliminar(u.idUsuario)}
//                         className="text-red-600 hover:text-red-800 font-medium text-xs transition"
//                       >
//                         Eliminar
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {usuarios.length === 0 && (
//                   <tr>
//                     <td colSpan={5} className="py-8 text-center text-slate-500">
//                       No hay personal registrado.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

//  modificado para ver tabla clientes

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form'; // <-- Importamos useWatch
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioSchema,type UsuarioFormData } from '../schemas/usuarioSchema';
import { usuarioService } from '../api/usuarioService';
import { type Usuario } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState<'PERSONAL' | 'CLIENTES'>(
    'PERSONAL',
  );

  const {
    register,
    handleSubmit,
    reset,
    control, // <-- Extraemos control en lugar de watch
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { rol: 'OPERADOR' },
  });

  // Solución para el React Compiler: Usamos useWatch
  const rolSeleccionado = useWatch({ control, name: 'rol' });

  // const cargarUsuarios = async () => {
  //   setCargando(true);
  //   const data = await usuarioService.obtenerTodos();
  //   setUsuarios(data);
  //   setCargando(false);
  // };

  // 1. Lógica EXCLUSIVA para el montaje inicial (Effect puro)
  useEffect(() => {
    let ignorar = false; // Bandera para evitar problemas en React Strict Mode

    const fetchInicial = async () => {
      const data = await usuarioService.obtenerTodos();
      if (!ignorar) {
        setUsuarios(data);
        setCargando(false);
      }
    };

    fetchInicial();

    return () => {
      ignorar = true; // Cleanup: si el componente se desmonta antes del await, cancela el setState
    };
  }, []); // <-- Array VÍRGULA, cero dependencias cruzadas. Compilador 100% feliz.

  // 2. Lógica EXCLUSIVA para eventos del usuario (botones, formularios)
  const refrescarTabla = async () => {
    setCargando(true);
    const data = await usuarioService.obtenerTodos();
    setUsuarios(data);
    setCargando(false);
  };

  // 3. Manejadores de eventos limpios
  const onSubmit = async (data: UsuarioFormData) => {
    await usuarioService.crear(data);
    reset();
    await refrescarTabla();
    setTabActiva('PERSONAL');
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      await usuarioService.eliminar(id);
      await refrescarTabla();
    }
  };

  const personalInterno = usuarios.filter((u) => u.rol !== 'CLIENTE');
  const clientes = usuarios.filter((u) => u.rol === 'CLIENTE');

  const listaActual = tabActiva === 'PERSONAL' ? personalInterno : clientes;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Formulario de Alta */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Nuevo Empleado
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Usuario (Alias)"
            error={errors.usuario?.message}
            {...register('usuario')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nombre"
              error={errors.nombre?.message}
              {...register('nombre')}
            />
            <Input
              label="Apellido"
              error={errors.apellido?.message}
              {...register('apellido')}
            />
          </div>

          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Teléfono"
            error={errors.telefono?.message}
            {...register('telefono')}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Rol del Empleado
            </label>
            <select
              {...register('rol')}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              <option value="OPERADOR">Operador</option>
              <option value="CHOFER">Chofer</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {errors.rol && (
              <span className="text-xs text-red-500 font-medium">
                {errors.rol.message}
              </span>
            )}
          </div>

          {rolSeleccionado === 'CHOFER' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-4 animate-in fade-in slide-in-from-top-2">
              <h3 className="text-sm font-semibold text-slate-800">
                Datos Legales del Chofer
              </h3>
              <Input
                label="Número de Licencia"
                error={errors.nroLicencia?.message}
                {...register('nroLicencia')}
              />
              <Input
                type="date"
                label="Vencimiento Licencia"
                error={errors.vencimientoLicencia?.message}
                {...register('vencimientoLicencia')}
              />
            </div>
          )}

          <Button type="submit" isLoading={isSubmitting}>
            Guardar Registro
          </Button>
        </form>
      </div>

      {/* Listado con Pestañas */}
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
                {listaActual.map((u) => (
                  <tr
                    key={u.idUsuario}
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

                    {/* COLUMNA DE ACCIONES DINÁMICAS */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-3">
                        {tabActiva === 'CLIENTES' && (
                          <button
                            className="text-amber-600 hover:text-amber-800 font-medium text-xs transition"
                            onClick={() =>
                              alert(`Próximamente: Ver reservas de ${u.nombre}`)
                            }
                          >
                            Ver Reservas
                          </button>
                        )}
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
};;;;