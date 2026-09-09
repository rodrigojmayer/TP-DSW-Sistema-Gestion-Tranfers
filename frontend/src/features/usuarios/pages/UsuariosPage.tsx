import { useEffect, useState } from 'react';
import { usuarioService } from '../api/usuarioService';
import { type Usuario } from '../../../types';
import { UsuarioForm } from '../components/UsuarioForm';

export const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState<Usuario | null>(
    null,
  );
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState<'PERSONAL' | 'CLIENTES'>(
    'PERSONAL',
  );

  const refrescarTabla = async () => {
    setCargando(true);
    const data = await usuarioService.obtenerTodos();
    setUsuarios(data);
    setCargando(false);
  };

  useEffect(() => {
    let ignorar = false;

    const fetchInicial = async () => {
      const data = await usuarioService.obtenerTodos();
      if (!ignorar) {
        setUsuarios(data);
        setCargando(false);
      }
    };

    fetchInicial();

    return () => {
      ignorar = true;
    };
  }, []);

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      await usuarioService.eliminar(id);
      if (usuarioEnEdicion?.idUsuario === id) {
        setUsuarioEnEdicion(null);
      }
      await refrescarTabla();
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

// import { useEffect, useState } from 'react';

// import { usuarioService } from '../api/usuarioService';
// import { type Usuario } from '../../../types';
// import { UsuarioForm } from '../components/UsuarioForm';
// export const UsuariosPage = () => {
//   const [usuarios, setUsuarios] = useState<Usuario[]>([]);
//   const [cargando, setCargando] = useState(true);
//   const [tabActiva, setTabActiva] = useState<'PERSONAL' | 'CLIENTES'>(
//     'PERSONAL',
//   );

//   const refrescarTabla = async () => {
//     setCargando(true);
//     const data = await usuarioService.obtenerTodos();
//     setUsuarios(data);
//     setCargando(false);
//   };

//   useEffect(() => {
//     let ignorar = false;

//     const fetchInicial = async () => {
//       const data = await usuarioService.obtenerTodos();
//       if (!ignorar) {
//         setUsuarios(data);
//         setCargando(false);
//       }
//     };
//     fetchInicial();

//     return () => {
//       ignorar = true;
//     };
//   }, []);

//   const handleEliminar = async (id: string) => {
//     if (window.confirm('¿Estás seguro de eliminar este registro?')) {
//       await usuarioService.eliminar(id);
//       if (usuarioEnEdicion?.idUsuario === id) {
//         setUsuarioEnEdicion(null);
//       }
//       await refrescarTabla();
//     }
//   };

//   const personalInterno = usuarios.filter((u) => u.rol !== 'CLIENTE');
//   const clientes = usuarios.filter((u) => u.rol === 'CLIENTE');
//   const listaActual = tabActiva === 'PERSONAL' ? personalInterno : clientes;

//   //       **

//  const personalInterno = usuarios.filter((u) => u.rol !== 'CLIENTE');
//   const clientes = usuarios.filter((u) => u.rol === 'CLIENTE');
//   const listaActual = tabActiva === 'PERSONAL' ? personalInterno : clientes;
//   return (
//     <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
//       {/* Pasamos el usuario a editar y funciones de control al formulario */}
//       <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
//         <UsuarioForm
//           usuarioAEditar={usuarioEnEdicion}
//           onCancelEdit={handleCancelarEdicion}
//           onSuccess={async () => {
//             setUsuarioEnEdicion(null);
//             await cargarDatos();
//           }}
//         />
//       </div>

//       {/* Listado con el botón de Editar */}
//       <div className="xl:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
//         {/* ... tabla de usuarios ... */}
//         <button
//           onClick={() => handleEditar(usuario)}
//           className="text-blue-600 hover:text-blue-800 font-medium text-xs mr-3"
//         >
//           Editar
//         </button>
//       </div>
//     </div>
//   );
// };

// // ****

//   const {
//     register,
//     handleSubmit,
//     reset,
//     control, // <-- Extraemos control en lugar de watch
//     formState: { errors, isSubmitting },
//   } = useForm<UsuarioFormData>({
//     resolver: zodResolver(usuarioSchema),
//     defaultValues: { rol: 'OPERADOR' },
//   });

//   // Solución para el React Compiler: Usamos useWatch
//   const rolSeleccionado = useWatch({ control, name: 'rol' });

//   // const cargarUsuarios = async () => {
//   //   setCargando(true);
//   //   const data = await usuarioService.obtenerTodos();
//   //   setUsuarios(data);
//   //   setCargando(false);
//   // };

//   // 1. Lógica EXCLUSIVA para el montaje inicial (Effect puro)
//   useEffect(() => {
//     let ignorar = false; // Bandera para evitar problemas en React Strict Mode

//     const fetchInicial = async () => {
//       const data = await usuarioService.obtenerTodos();
//       if (!ignorar) {
//         setUsuarios(data);
//         setCargando(false);
//       }
//     };

//     fetchInicial();

//     return () => {
//       ignorar = true; // Cleanup: si el componente se desmonta antes del await, cancela el setState
//     };
//   }, []); // <-- Array VÍRGULA, cero dependencias cruzadas. Compilador 100% feliz.

//   // 2. Lógica EXCLUSIVA para eventos del usuario (botones, formularios)
//   const refrescarTabla = async () => {
//     setCargando(true);
//     const data = await usuarioService.obtenerTodos();
//     setUsuarios(data);
//     setCargando(false);
//   };

//   // 3. Manejadores de eventos limpios
//   const onSubmit = async (data: UsuarioFormData) => {
//     await usuarioService.crear(data);
//     reset();
//     await refrescarTabla();
//     setTabActiva('PERSONAL');
//   };

//   const handleEliminar = async (id: string) => {
//     if (window.confirm('¿Estás seguro de eliminar este registro?')) {
//       await usuarioService.eliminar(id);
//       await refrescarTabla();
//     }
//   };

//   const personalInterno = usuarios.filter((u) => u.rol !== 'CLIENTE');
//   const clientes = usuarios.filter((u) => u.rol === 'CLIENTE');

//   const listaActual = tabActiva === 'PERSONAL' ? personalInterno : clientes;

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

//           {/* NUEVO: Input para DNI */}
//           <Input
//             label="DNI"
//             type="text" // Es preferible 'text' y validar con regex para evitar que los inputs 'number' quiten los ceros a la izquierda, aunque en Argentina no son comunes.
//             error={errors.dni?.message}
//             {...register('dni')}
//             placeholder="Ej: 32111222"
//           />

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

//       {/* Listado con Pestañas */}
//       <div className="xl:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
//         <div className="flex gap-6 border-b border-slate-200 mb-6">
//           <button
//             onClick={() => setTabActiva('PERSONAL')}
//             className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
//               tabActiva === 'PERSONAL'
//                 ? 'border-amber-500 text-amber-600'
//                 : 'border-transparent text-slate-500 hover:text-slate-700'
//             }`}
//           >
//             Personal Interno ({personalInterno.length})
//           </button>
//           <button
//             onClick={() => setTabActiva('CLIENTES')}
//             className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
//               tabActiva === 'CLIENTES'
//                 ? 'border-amber-500 text-amber-600'
//                 : 'border-transparent text-slate-500 hover:text-slate-700'
//             }`}
//           >
//             Clientes Registrados ({clientes.length})
//           </button>
//         </div>

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
//                   {tabActiva === 'PERSONAL' && (
//                     <th className="py-3 px-4">Rol</th>
//                   )}
//                   <th className="py-3 px-4 text-right">Acciones</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {listaActual.map((u) => (
//                   <tr
//                     key={u.idUsuario}
//                     className="hover:bg-slate-50 transition-colors"
//                   >
//                     <td className="py-3 px-4 font-medium text-slate-900">
//                       {u.usuario}
//                     </td>
//                     <td className="py-3 px-4">
//                       {u.nombre} {u.apellido}
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
//                     {tabActiva === 'PERSONAL' && (
//                       <td className="py-3 px-4">
//                         <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
//                           {u.rol}
//                         </span>
//                       </td>
//                     )}

//                     {/* COLUMNA DE ACCIONES DINÁMICAS */}
//                     <td className="py-3 px-4 text-right">
//                       <div className="flex justify-end gap-3">
//                         {tabActiva === 'CLIENTES' && (
//                           <button
//                             className="text-amber-600 hover:text-amber-800 font-medium text-xs transition"
//                             onClick={() =>
//                               alert(`Próximamente: Ver reservas de ${u.nombre}`)
//                             }
//                           >
//                             Ver Reservas
//                           </button>
//                         )}
//                         <button
//                           onClick={() => handleEliminar(u.idUsuario)}
//                           className="text-red-600 hover:text-red-800 font-medium text-xs transition"
//                         >
//                           Eliminar
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//                 {listaActual.length === 0 && (
//                   <tr>
//                     <td
//                       colSpan={tabActiva === 'PERSONAL' ? 5 : 4}
//                       className="py-8 text-center text-slate-500"
//                     >
//                       No hay registros para mostrar.
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
