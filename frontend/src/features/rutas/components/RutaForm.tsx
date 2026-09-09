// src/features/rutas/components/RutaForm.tsx
import { useEffect } from 'react';
import { useForm, useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { rutaSchema, type RutaFormData } from '../schemas/rutaSchema';
import { rutaService } from '../api/rutaService';
import { type Ruta } from '../../../types';
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
  // PASO 1: Configurar el formulario con Zod
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
      puntosRuta: [
        { direccion: '', orden: 0 },
        { direccion: '', orden: 1 },
      ],
    },
  });

  // PASO 2: Vincular useFieldArray al array 'puntosRuta'
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'puntosRuta',
  });

  // PASO 3: Sincronizar datos al Editar o Crear
  useEffect(() => {
    if (rutaAEditar) {
      reset({
        nombre: rutaAEditar.nombre,
        // ✅ CORRECCIÓN: Usamos (rutaAEditar.puntosRuta ?? []) para garantizar que sea un Array
        puntosRuta: (rutaAEditar.puntosRuta ?? []).map((p, index) => ({
          direccion: p.direccion,
          orden: index,
        })),
      });
    } else {
      reset({
        nombre: '',
        puntosRuta: [
          { direccion: '', orden: 0 },
          { direccion: '', orden: 1 },
        ],
      });
    }
  }, [rutaAEditar, reset]);

  // PASO 4: Función de envío
  const onSubmit = async (data: RutaFormData) => {
    const datosConOrden = {
      ...data,
      puntosRuta: data.puntosRuta.map((punto, index) => ({
        ...punto,
        orden: index,
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

  // PASO 5: Renderizado del Formulario
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

        {/* Campos dinámicos: Array de Paradas */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">
              Paradas ({fields.length})
            </label>
            {fields.length < 10 && (
              <button
                type="button"
                onClick={() => append({ direccion: '', orden: fields.length })}
                className="text-xs font-medium text-amber-600 hover:text-amber-700 transition"
              >
                + Agregar Parada
              </button>
            )}
          </div>

          {/* Mapeo dinámico de inputs */}
          {fields.map((field, index) => {
            const isOrigen = index === 0;
            const isDestino = index === fields.length - 1;

            let etiqueta = `Parada #${index}`;
            if (isOrigen) etiqueta = '1. Origen';
            else if (isDestino) etiqueta = `${fields.length}. Destino`;

            return (
              <div
                key={field.id}
                className="flex items-start gap-2 bg-slate-50 p-3 rounded-md border border-slate-200"
              >
                <div className="flex-1">
                  <Input
                    label={etiqueta}
                    placeholder={
                      isOrigen
                        ? 'Ej: Terminal Retiro'
                        : isDestino
                          ? 'Ej: Terminal Rosario'
                          : 'Ej: San Pedro'
                    }
                    error={errors.puntosRuta?.[index]?.direccion?.message}
                    {...register(`puntosRuta.${index}.direccion`)}
                  />
                </div>

                {fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-7 p-2 text-slate-400 hover:text-red-600 transition"
                    title="Eliminar parada"
                  >
                    🗑️
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          {rutaAEditar ? 'Guardar Cambios' : 'Crear Ruta'}
        </Button>
      </form>
    </div>
  );
};
