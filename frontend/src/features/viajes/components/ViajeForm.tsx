import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { viajeSchema, type ViajeFormData } from '../schemas/viajeSchema';
import { viajeService } from '../api/viajeService';
import type { Viaje, Ruta, Usuario } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface ViajeFormProps {
  idEditando: string | null;
  viajeAEditar: Viaje | null;
  rutasDisponibles: Ruta[];
  choferesDisponibles: Usuario[];
  onSuccess: () => void;
  onCancelar: () => void;
}

export const ViajeForm = ({
  idEditando,
  viajeAEditar,
  rutasDisponibles,
  choferesDisponibles,
  onSuccess,
  onCancelar,
}: ViajeFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ViajeFormData>({
    resolver: zodResolver(viajeSchema) as unknown as Resolver<ViajeFormData>,
    defaultValues: {
      idRuta: '',
      idChofer: '',
      fechaHoraInicio: '',
      fechaHoraFin: '',
      capacidadPasajeros: 4,
      capacidadValijas: 4,
      precio: 0,
    },
  });

  useEffect(() => {
    if (viajeAEditar) {
      setValue('idRuta', viajeAEditar.idRuta || '');
      setValue('idChofer', viajeAEditar.idChofer || '');
      setValue('tipo', viajeAEditar.tipo || 'COMPARTIDO'); // 👈 Seteamos el tipo al editar
      setValue(
        'fechaHoraInicio',
        viajeAEditar.fechaHoraInicio
          ? new Date(viajeAEditar.fechaHoraInicio).toISOString().slice(0, 16)
          : '',
      );
      setValue(
        'fechaHoraFin',
        viajeAEditar.fechaHoraFin
          ? new Date(viajeAEditar.fechaHoraFin).toISOString().slice(0, 16)
          : '',
      );
      setValue('capacidadPasajeros', viajeAEditar.capacidadPasajeros ?? 4);
      setValue('capacidadValijas', viajeAEditar.capacidadValijas ?? 4);
      setValue('precio', viajeAEditar.precio);
    } else {
      reset({
        idRuta: '',
        idChofer: '',
        fechaHoraInicio: '',
        fechaHoraFin: '',
        capacidadPasajeros: 4,
        capacidadValijas: 4,
        precio: 0,
      });
    }
  }, [viajeAEditar, setValue, reset]);

  const onSubmit = async (data: ViajeFormData) => {
    try {
      if (idEditando) {
        await viajeService.actualizar(idEditando, data);
      } else {
        await viajeService.crear(data);
      }
      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar');
    }
  };

  const recortarTexto = (texto: string, max: number = 70): string => {
    if (!texto) return '';
    return texto.length > max ? `${texto.substring(0, max)}...` : texto;
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">
          {idEditando ? 'Editar Viaje' : 'Programar Viaje'}
        </h2>
        {idEditando && (
          <button
            type="button"
            onClick={onCancelar}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Cancelar Edición
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Select Ruta */}
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
                {recortarTexto(r.nombre)}
              </option>
            ))}
          </select>
          {errors.idRuta && (
            <span className="text-xs text-red-500 font-medium">
              {errors.idRuta.message}
            </span>
          )}
        </div>

        {/* Select Chofer */}
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

        {/* Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            type="datetime-local"
            label="Fecha/Hora Salida"
            error={errors.fechaHoraInicio?.message}
            {...register('fechaHoraInicio')}
          />
          <Input
            type="datetime-local"
            label="Fecha/Hora Llegada"
            error={errors.fechaHoraFin?.message}
            {...register('fechaHoraFin')}
          />
        </div>

        {/* Capacidades */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="number"
            label="Cupo Pasajeros"
            error={errors.capacidadPasajeros?.message}
            {...register('capacidadPasajeros')}
          />
          <Input
            type="number"
            label="Cupo Valijas"
            error={errors.capacidadValijas?.message}
            {...register('capacidadValijas')}
          />
        </div>

        {/* Precio */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">
            Precio del Pasaje
          </label>
          <div className="relative flex items-center w-full h-10 border border-slate-300 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-amber-400">
            <span className="pl-3 pr-1.5 text-sm font-semibold text-slate-400 select-none">
              $
            </span>
            <input
              type="number"
              step="0.01"
              {...register('precio', { valueAsNumber: true })}
              className="w-full h-full pr-3 py-2 bg-transparent text-sm text-slate-800 outline-none"
            />
          </div>
          {errors.precio?.message && (
            <span className="text-xs text-red-500 font-medium">
              {errors.precio.message}
            </span>
          )}
        </div>

        <Button type="submit" isLoading={isSubmitting}>
          {idEditando ? 'Guardar Cambios' : 'Programar Servicio'}
        </Button>
      </form>
    </div>
  );
};
