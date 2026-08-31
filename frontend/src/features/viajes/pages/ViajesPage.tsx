import { useEffect, useState, useCallback } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { viajeSchema,type ViajeFormData } from '../schemas/viajeSchema';
import { viajeService } from '../api/viajeService';
import { rutaService } from '../../rutas/api/rutaService';
import { usuarioService } from '../../usuarios/api/usuarioService';
import type { Viaje, Ruta, Usuario } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';



export const ViajesPage = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [rutasDisponibles, setRutasDisponibles] = useState<Ruta[]>([]);
  const [choferesDisponibles, setChoferesDisponibles] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

 const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ViajeFormData>({
    // Casteo seguro nivel Senior: De unknown a Resolver estricto de nuestro Schema
    resolver: zodResolver(viajeSchema) as unknown as Resolver<ViajeFormData>,
    defaultValues: {
      idRuta: '',
      idChofer: '',
      fechaHoraSalida: '',
      precio: 0,
    },
  });
 

  // Carga de datos auxiliares (Rutas y Choferes para los selects) y Viajes
  const cargarDatos = useCallback(async () => {
    const [dataViajes, dataRutas, dataUsuarios] = await Promise.all([
      viajeService.obtenerTodos(),
      rutaService.obtenerTodas(),
      usuarioService.obtenerTodos(),
    ]);

    setViajes(dataViajes);
    setRutasDisponibles(dataRutas);
    // Filtramos solo los usuarios que tengan rol CHOFER
    setChoferesDisponibles(dataUsuarios.filter((u) => u.rol === 'CHOFER'));
    setCargando(false);
  }, []);

  useEffect(() => {
    let ignorar = false;
    const fetchInicial = async () => {
      await cargarDatos();
    };
    if (!ignorar) fetchInicial();
    return () => {
      ignorar = true;
    };
  }, [cargarDatos]);

  const onSubmit = async (data: ViajeFormData) => {
    await viajeService.crear(data);
    reset();
    setCargando(true);
    await cargarDatos();
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿Estás seguro de cancelar este viaje?')) {
      setCargando(true);
      await viajeService.eliminar(id);
      await cargarDatos();
    }
  };

  // Helpers para encontrar nombres rápidamente en la tabla
  const obtenerNombreRuta = (idRuta: string) => {
    const r = rutasDisponibles.find((item) => item.idRuta === idRuta);
    return r ? r.nombre : 'Ruta desconocida';
  };

  const obtenerNombreChofer = (idChofer: string) => {
    const c = choferesDisponibles.find((item) => item.idUsuario === idChofer);
    return c ? `${c.nombre} ${c.apellido}` : 'Chofer no asignado';
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Formulario Programar Viaje */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Programar Viaje
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Select de Ruta */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Ruta Asignada
            </label>
            <select
              {...register('idRuta')}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              <option value="">Seleccione una ruta...</option>
              {rutasDisponibles.map((r) => (
                <option key={r.idRuta} value={r.idRuta}>
                  {r.nombre}
                </option>
              ))}
            </select>
            {errors.idRuta && (
              <span className="text-xs text-red-500 font-medium">
                {errors.idRuta.message}
              </span>
            )}
          </div>

          {/* Select de Chofer */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Chofer Responsable
            </label>
            <select
              {...register('idChofer')}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              <option value="">Seleccione un chofer...</option>
              {choferesDisponibles.map((c) => (
                <option key={c.idUsuario} value={c.idUsuario}>
                  {c.nombre} {c.apellido} (Lic: {c.nroLicencia})
                </option>
              ))}
            </select>
            {errors.idChofer && (
              <span className="text-xs text-red-500 font-medium">
                {errors.idChofer.message}
              </span>
            )}
          </div>

          <Input
            type="datetime-local"
            label="Fecha y Hora de Salida"
            error={errors.fechaHoraSalida?.message}
            {...register('fechaHoraSalida')}
          />

          <Input
            type="number"
            step="0.01"
            label="Precio del Pasaje ($)"
            error={errors.precio?.message}
            {...register('precio')}
          />

          <Button type="submit" isLoading={isSubmitting}>
            Programar Servicio
          </Button>
        </form>
      </div>

      {/* Listado de Viajes */}
      <div className="xl:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Viajes Programados
        </h2>

        {cargando ? (
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
            Cargando viajes...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Ruta</th>
                  <th className="py-3 px-4">Chofer</th>
                  <th className="py-3 px-4">Salida</th>
                  <th className="py-3 px-4">Precio</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viajes.map((viaje) => (
                  <tr
                    key={viaje.idViaje}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {obtenerNombreRuta(viaje.idRuta)}
                    </td>
                    <td className="py-3 px-4">
                      {obtenerNombreChofer(viaje.idChofer)}
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {new Date(viaje.fechaHoraSalida).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">
                      ${viaje.precio}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEliminar(String(viaje.idViaje))}
                        className="text-red-600 hover:text-red-800 font-medium text-xs transition"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
                {viajes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No hay viajes programados.
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
