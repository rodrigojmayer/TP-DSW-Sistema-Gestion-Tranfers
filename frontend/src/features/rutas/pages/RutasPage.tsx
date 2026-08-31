import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rutaSchema, type RutaFormData } from '../schemas/rutaSchema';
import { rutaService } from '../api/rutaService';
import { type Ruta } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const RutasPage = () => {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [cargando, setCargando] = useState(true);

  // 1. Configuración del Formulario
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RutaFormData>({
    resolver: zodResolver(rutaSchema),
    defaultValues: {
      nombre: '',
      // Por defecto, inicializamos con 2 paradas vacías (origen y destino)
      puntosRuta: [
        { direccion: '', orden: 1 },
        { direccion: '', orden: 2 },
      ],
    },
  });

  // 2. Extraer métodos del useFieldArray
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'puntosRuta', // El nombre exacto del array en nuestro esquema Zod
  });

  // 3. Carga Inicial Segura (El patrón que armamos antes)
  useEffect(() => {
    let ignorar = false;

    const fetchInicial = async () => {
      const data = await rutaService.obtenerTodas();
      if (!ignorar) {
        setRutas(data);
        setCargando(false);
      }
    };

    fetchInicial();
    return () => {
      ignorar = true;
    };
  }, []);

  const refrescarTabla = async () => {
    setCargando(true);
    const data = await rutaService.obtenerTodas();
    setRutas(data);
    setCargando(false);
  };

  const onSubmit = async (data: RutaFormData) => {
    await rutaService.crear(data);
    // Al resetear, volvemos al estado inicial (2 paradas)
    reset({
      nombre: '',
      puntosRuta: [
        { direccion: '', orden: 1 },
        { direccion: '', orden: 2 },
      ],
    });
    await refrescarTabla();
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar esta ruta?')) {
      await rutaService.eliminar(id);
      await refrescarTabla();
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Columna Izquierda: Formulario de Alta */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Nueva Ruta</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Nombre de la Ruta (Ej. Rosario - San Lorenzo)"
            error={errors.nombre?.message}
            {...register('nombre')}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">
                Paradas (Recorrido)
              </label>
              {/* Ocultar botón de agregar si llegamos a 10 paradas (límite Zod) */}
              {fields.length < 10 && (
                <button
                  type="button"
                  onClick={() =>
                    append({ direccion: '', orden: fields.length + 1 })
                  }
                  className="text-xs font-semibold text-amber-600 hover:text-amber-800 bg-amber-50 px-2 py-1 rounded transition"
                >
                  + Agregar Parada
                </button>
              )}
            </div>

            {/* Listado dinámico de Inputs */}
            <div className="space-y-3 relative border-l-2 border-slate-200 ml-2 pl-4">
              {fields.map((field, index) => (
                <div key={field.id} className="relative">
                  {/* Punto visual en la línea de tiempo */}
                  <div className="absolute -left-5.25 top-3.5 w-3 h-3 bg-white border-2 border-slate-300 rounded-full" />

                  <div className="flex gap-2 items-start">
                    <div className="flex-1">
                      <Input
                        label={`Parada ${index + 1}`} // <-- AGREGAMOS ESTA LÍNEA
                        placeholder={`Ej: ${index === 0 ? 'Terminal Origen' : index === fields.length - 1 ? 'Terminal Destino' : 'Parada Intermedia'}`}
                        error={errors.puntosRuta?.[index]?.direccion?.message}
                        {...register(`puntosRuta.${index}.direccion` as const)}
                      />
                      {/* Ocultamos el campo "orden" ya que lo maneja el array automáticamente */}
                      <input
                        type="hidden"
                        {...register(`puntosRuta.${index}.orden` as const)}
                        value={index + 1}
                      />
                    </div>

                    {/* Botón para eliminar parada (solo si hay más de 2) */}
                    {fields.length > 2 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-slate-400 hover:text-red-500 transition mt-1"
                        title="Eliminar parada"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {errors.puntosRuta?.root?.message && (
              <span className="text-xs text-red-500 font-medium block">
                {errors.puntosRuta.root.message}
              </span>
            )}
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Guardar Ruta
          </Button>
        </form>
      </div>

      {/* Columna Derecha: Listado de Rutas */}
      <div className="xl:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Rutas Activas</h2>

        {cargando ? (
          <p className="text-sm text-slate-500 flex items-center gap-2">
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
                {rutas.map((ruta) => (
                  <tr
                    key={ruta.idRuta}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {ruta.nombre}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {ruta.puntosRuta?.length || 0} puntos
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {(ruta.puntosRuta || [])
                        .map((p) => p.direccion)
                        .join(' ➔ ')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleEliminar(String(ruta.idRuta))}
                        className="text-red-600 hover:text-red-800 font-medium text-xs transition"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
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
