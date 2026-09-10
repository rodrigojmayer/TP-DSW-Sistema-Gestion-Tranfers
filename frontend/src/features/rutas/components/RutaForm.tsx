// src/features/rutas/components/RutaForm.tsx
import { useEffect, useState } from 'react';
import { useForm, useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rutaSchema, type RutaFormData } from '../schemas/rutaSchema';
import { rutaService } from '../api/rutaService';
import { puntoService } from '../../puntos/api/puntoService';
import type { Ruta, Punto } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface RutaFormProps {
  rutaAEditar: Ruta | null;
  onCancelEdit: () => void;
  onSuccess: () => void;
}

export const RutaForm = ({
  rutaAEditar,
  onCancelEdit,
  onSuccess,
}: RutaFormProps) => {
  const [catalogoPuntos, setCatalogoPuntos] = useState<Punto[]>([]);
  const [cargandoPuntos, setCargandoPuntos] = useState(true);

  // 1. Cargar el catálogo de puntos registrados en la BD
  useEffect(() => {
    const obtenerCatalogo = async () => {
      try {
        const datos = await puntoService.obtenerTodos();
        setCatalogoPuntos(datos);
      } catch (error) {
        console.error('Error al cargar catálogo de puntos:', error);
      } finally {
        setCargandoPuntos(false);
      }
    };
    obtenerCatalogo();
  }, []);

  // 2. Formulario vinculado a Zod y la estructura { idPunto, orden }
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RutaFormData>({
    resolver: zodResolver(rutaSchema) as unknown as Resolver<RutaFormData>,
    defaultValues: {
      nombre: '',
      puntos: [
        { idPunto: '', orden: 1 },
        { idPunto: '', orden: 2 },
      ],
    },
  });

  // 3. Manejo dinámico del arreglo de paradas
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'puntos',
  });

  // 4. Sincronización al editar o resetear formulario
  useEffect(() => {
    if (rutaAEditar) {
      const listaPuntos = rutaAEditar.puntos || [];
      const ordenados = [...listaPuntos].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));

      reset({
        nombre: rutaAEditar.nombre,
        puntos: ordenados.map((p, index) => ({
          idPunto: p.idPunto || p.punto?.idPunto || '',
          orden: index + 1,
        })),
      });
    } else {
      reset({
        nombre: '',
        puntos: [
          { idPunto: '', orden: 1 },
          { idPunto: '', orden: 2 },
        ],
      });
    }
  }, [rutaAEditar, reset]);

  // 5. Envío al Backend mediante rutaService
  const onSubmit = async (data: RutaFormData) => {
    const datosConOrden = {
      ...data,
      puntos: data.puntos.map((item, index) => ({
        idPunto: item.idPunto,
        orden: index + 1,
      })),
    };

    if (rutaAEditar) {
      await rutaService.actualizar(rutaAEditar.idRuta, datosConOrden);
    } else {
      await rutaService.crear(datosConOrden);
    }
    reset();
    onSuccess();
  };

  
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">
          {rutaAEditar ? 'Editar Ruta' : 'Nueva Ruta'}
        </h2>
        {rutaAEditar && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Cancelar
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Campo estático: Nombre */}
        <Input
          label="Nombre de la Ruta"
          placeholder="Ej: Buenos Aires - Rosario"
          error={errors.nombre?.message}
          {...register('nombre')}
        />

        {/* Campos dinámicos: Array de Selección de Puntos */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">
              Paradas ({fields.length})
            </label>
            {fields.length < 10 && (
              <button
                type="button"
                onClick={() => append({ idPunto: '', orden: fields.length + 1 })}
                className="text-xs font-medium text-amber-600 hover:text-amber-700 transition"
              >
                + Agregar Parada
              </button>
            )}
          </div>

          {cargandoPuntos ? (
            <p className="text-xs text-slate-400">Cargando puntos...</p>
          ) : (
            fields.map((field, index) => {
              const isOrigen = index === 0;
              const isDestino = index === fields.length - 1;

              let etiqueta = `Parada #${index + 1}`;
              if (isOrigen) etiqueta = '1. Origen';
              else if (isDestino) etiqueta = `${fields.length}. Destino`;

              return (
                <div
                  key={field.id}
                  className="flex items-start gap-2 bg-slate-50 p-3 rounded-md border border-slate-200"
                >
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {etiqueta}
                    </label>
                    <select
                      className="w-full text-sm border border-slate-300 rounded-md p-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      {...register(`puntos.${index}.idPunto`)}
                    >
                      <option value="">-- Seleccionar punto --</option>
                      {catalogoPuntos.map((punto) => (
                        <option key={punto.idPunto} value={punto.idPunto}>
                          {punto.nombre ? `${punto.nombre} (${punto.direccion})` : punto.direccion}
                        </option>
                      ))}
                    </select>
                    {errors.puntos?.[index]?.idPunto && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.puntos[index]?.idPunto?.message}
                      </p>
                    )}
                  </div>

                  {fields.length > 2 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="mt-6 p-2 text-slate-400 hover:text-red-600 transition"
                      title="Eliminar parada"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          {rutaAEditar ? 'Guardar Cambios' : 'Crear Ruta'}
        </Button>
      </form>
    </div>
  );
};
