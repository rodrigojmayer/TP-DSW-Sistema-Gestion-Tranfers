import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { puntoSchema, type PuntoFormData } from '../schemas/puntoSchema';
import { puntoService } from '../api/puntoService';
import type { Punto } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface PuntoFormProps {
  puntoAEditar: Punto | null;
  onCancelEdit: () => void;
  onSuccess: () => void;
}

export const PuntoForm = ({
  puntoAEditar,
  onCancelEdit,
  onSuccess,
}: PuntoFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PuntoFormData>({
    resolver: zodResolver(puntoSchema),
    defaultValues: {
      nombre: '',
      direccion: '',
      tipo: 'Terminal',
      latitud: '',
      longitud: '',
    },
  });

  useEffect(() => {
    if (puntoAEditar) {
      reset({
        nombre: puntoAEditar.nombre || '',
        direccion: puntoAEditar.direccion || '',
        tipo: puntoAEditar.tipo || 'Terminal',
        // ARREGLO: Se convierte a string para coincidir con la estructura de PuntoFormData
        latitud: puntoAEditar.latitud !== undefined && puntoAEditar.latitud !== null 
          ? String(puntoAEditar.latitud) 
          : '',
        longitud: puntoAEditar.longitud !== undefined && puntoAEditar.longitud !== null 
          ? String(puntoAEditar.longitud) 
          : '',
      });
    } else {
      // ARREGLO: Se limpian como '' en lugar de 0
      reset({
        nombre: '',
        direccion: '',
        tipo: 'Terminal',
        latitud: '',
        longitud: '',
      });
    }
  }, [puntoAEditar, reset]);

  const onSubmit = async (data: PuntoFormData) => {
    console.log("puntoAEditar: ", puntoAEditar);
    if (puntoAEditar) {
      await puntoService.actualizar(puntoAEditar.idPunto, data);
    } else {
      await puntoService.crear(data);
    }
    reset();
    onSuccess();
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">
          {puntoAEditar ? 'Editar Punto' : 'Nuevo Punto'}
        </h2>
        {puntoAEditar && (
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
        <Input
          label="Nombre del Punto / Terminal"
          placeholder="Ej: Aeroparque Jorge Newbery"
          error={errors.nombre?.message}
          {...register('nombre')}
        />

        <Input
          label="Dirección"
          placeholder="Ej: Av. Costanera Rafael Obligado s/n"
          error={errors.direccion?.message}
          {...register('direccion')}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
            Tipo
          </label>
          <select
            {...register('tipo')}
            className="w-full px-3 py-2 border rounded-md text-sm border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="Terminal">Terminal</option>
            <option value="Punto Intermedio">Punto Intermedio</option>
            <option value="Aeropuerto">Aeropuerto</option>
          </select>
          {errors.tipo && (
            <p className="text-xs text-red-500 mt-1">{errors.tipo.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* ARREGLO: type="text" para ser coherente con la entrada de tipo string */}
          <Input
            label="Latitud"
            type="text"
            placeholder="-34.558"
            error={errors.latitud?.message}
            {...register('latitud')}
          />

          <Input
            label="Longitud"
            type="text"
            placeholder="-58.417"
            error={errors.longitud?.message}
            {...register('longitud')}
          />
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          {puntoAEditar ? 'Guardar Cambios' : 'Crear Punto'}
        </Button>
      </form>
    </div>
  );
};