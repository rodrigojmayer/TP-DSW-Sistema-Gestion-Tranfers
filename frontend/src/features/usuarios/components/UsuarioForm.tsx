import { useEffect } from 'react';
import { useForm, useWatch,type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioSchema, type UsuarioFormData } from '../schemas/usuarioSchema';
import { usuarioService } from '../api/usuarioService';
import { type Usuario } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

interface UsuarioFormProps {
  usuarioAEditar: Usuario | null;
  onCancelEdit: () => void;
  onSuccess: () => void;
}

export const UsuarioForm = ({
  usuarioAEditar,
  onCancelEdit,
  onSuccess,
}: UsuarioFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(
      usuarioSchema,
    ) as unknown as Resolver<UsuarioFormData>, // <-- Tipado 100% seguro sin 'any'
    defaultValues: {
      usuario: '',
      nombre: '',
      apellido: '',
      dni: '',
      email: '',
      telefono: '',
      rol: 'OPERADOR',
      nroLicencia: '',
      vencimientoLicencia: '',
    },
  });

  const rolSeleccionado = useWatch({ control, name: 'rol' });
  // Escucha cambios en 'usuarioAEditar' para rellenar o limpiar el formulario
  useEffect(() => {
    if (usuarioAEditar) {
      reset({
        usuario: usuarioAEditar.usuario,
        nombre: usuarioAEditar.nombre,
        apellido: usuarioAEditar.apellido,
        dni: usuarioAEditar.dni,
        email: usuarioAEditar.email,
        telefono: usuarioAEditar.telefono,
        rol: usuarioAEditar.rol,
        nroLicencia: usuarioAEditar.nroLicencia || '',
        vencimientoLicencia: usuarioAEditar.vencimientoLicencia || '',
      });
    } else {
      reset({
        usuario: '',
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        rol: 'OPERADOR',
        nroLicencia: '',
        vencimientoLicencia: '',
      });
    }
  }, [usuarioAEditar, reset]);

  const onSubmit = async (data: UsuarioFormData) => {
    if (usuarioAEditar) {
      await usuarioService.actualizar(usuarioAEditar.idUsuario, data);
    } else {
      await usuarioService.crear(data);
    }
    reset();
    onSuccess();
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-slate-800">
          {usuarioAEditar ? 'Editar Registro' : 'Nuevo Empleado'}
        </h2>
        {usuarioAEditar && (
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
          label="DNI"
          type="text"
          error={errors.dni?.message}
          {...register('dni')}
          placeholder="Ej: 32111222"
        />

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
            <option value="CLIENTE">Cliente</option>
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
          {usuarioAEditar ? 'Guardar Cambios' : 'Guardar Registro'}
        </Button>
      </form>
    </div>
  );
};
