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
    defaultValues: { nombre: '', direccion: '' },
  });

  useEffect(() => {
    if (puntoAEditar) {
      reset({
        nombre: puntoAEditar.nombre || '',
        direccion: puntoAEditar.direccion || '',
      });
    } else {
      reset({ nombre: '', direccion: '' });
    }
  }, [puntoAEditar, reset]);

  const onSubmit = async (data: PuntoFormData) => {
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
        <Button type="submit" isLoading={isSubmitting}>
          {puntoAEditar ? 'Guardar Cambios' : 'Crear Punto'}
        </Button>
      </form>
    </div>
  );
};