import { useEffect, useState } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservaSchema, type ReservaFormData } from '../schemas/reservaSchema';
import { reservaService } from '../api/reservaService';
import { viajeService } from '../../viajes/api/viajeService';
import { usuarioService } from '../../usuarios/api/usuarioService';
import type { Reserva, Viaje, Usuario } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';

export const ReservasPage = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  // REFACTOR: Se eliminó 'useWatch' de la desestructuración de useForm
  // para evitar tapar la función importada de 'react-hook-form'.
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReservaFormData>({
    resolver: zodResolver(
      reservaSchema,
    ) as unknown as Resolver<ReservaFormData>,
    defaultValues: {
      tipoReserva: 'LOGUEADO',
      asiento: 1,
      precioFinal: 0,
      idCliente: '',
      pasajeroNombre: '',
      pasajeroApellido: '',
      pasajeroDni: '',
      pasajeroEmail: '',
      pasajeroTelefono: '',
    },
  });

  // REFACTOR: Uso correcto de useWatch pasándole la propiedad 'control'
  const tipoReservaActual = useWatch({ control, name: 'tipoReserva' });

  // REFACTOR: Función de refresco manual para invocar después de submit o cancelación
  const refrescarDatos = async () => {
    setCargando(true);
    try {
      const [resData, viajesData, usuariosData] = await Promise.all([
        reservaService.obtenerTodas(),
        viajeService.obtenerTodos(),
        usuarioService.obtenerTodos(),
      ]);

      setReservas(resData);
      setViajes(viajesData.filter((v) => v.estado === 'PROGRAMADO'));
      setClientes(usuariosData.filter((u) => u.rol === 'CLIENTE'));
    } catch (error) {
      console.error('Error al actualizar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  // REFACTOR: Carga de datos asíncrona dentro de useEffect declarando una función
  // interna con flag 'isMounted'. Soluciona la advertencia "cascading renders" y
  // evita memory leaks si el componente se desmonta antes de recibir respuesta.
  useEffect(() => {
    let isMounted = true;

    const cargarDatosIniciales = async () => {
      try {
        const [resData, viajesData, usuariosData] = await Promise.all([
          reservaService.obtenerTodas(),
          viajeService.obtenerTodos(),
          usuarioService.obtenerTodos(),
        ]);

        if (isMounted) {
          setReservas(resData);
          setViajes(viajesData.filter((v) => v.estado === 'PROGRAMADO'));
          setClientes(usuariosData.filter((u) => u.rol === 'CLIENTE'));
          setCargando(false);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error al cargar datos iniciales:', error);
          setCargando(false);
        }
      }
    };

    cargarDatosIniciales();

    return () => {
      isMounted = false;
    };
  }, []);

  // REFACTOR: Handler agregado para cambiar el modo de reserva (LOGUEADO / INVITADO)
  const handleCambiarModo = (modo: 'LOGUEADO' | 'INVITADO') => {
    setValue('tipoReserva', modo);
  };

  const handleViajeSelect = (idViaje: string) => {
    const seleccionado = viajes.find((v) => v.idViaje === idViaje);
    if (seleccionado) {
      setValue('precioFinal', seleccionado.precio);
    }
  };

  const handleClienteSelect = (idCliente: string) => {
    const cliente = clientes.find((c) => c.idUsuario === idCliente);
    if (cliente) {
      setValue('pasajeroNombre', cliente.nombre);
      setValue('pasajeroApellido', cliente.apellido);
      setValue('pasajeroDni', cliente.dni || '');
      setValue('pasajeroEmail', cliente.email || '');
    }
  };

  const onSubmit = async (data: ReservaFormData) => {
    await reservaService.crear(data);

    if (tipoReservaActual === 'INVITADO') {
      reset({
        tipoReserva: 'INVITADO',
        idViaje: '',
        asiento: 1,
        precioFinal: 0,
        pasajeroNombre: '',
        pasajeroApellido: '',
        pasajeroDni: '',
        pasajeroEmail: '',
        pasajeroTelefono: '',
      });
    } else {
      reset({
        tipoReserva: 'LOGUEADO',
        idViaje: '',
        idCliente: '',
        asiento: 1,
        precioFinal: 0,
        pasajeroNombre: '',
        pasajeroApellido: '',
        pasajeroDni: '',
        pasajeroEmail: '',
        pasajeroTelefono: '',
      });
    }

    // REFACTOR: Uso de refrescarDatos tras confirmar el submit
    await refrescarDatos();
  };

  const handleCancelar = async (id: string) => {
    if (window.confirm('¿Confirmas la cancelación de la reserva?')) {
      await reservaService.cancelar(id);
      // REFACTOR: Uso de refrescarDatos tras cancelar
      await refrescarDatos();
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* COLUMNA IZQUIERDA: FORMULARIO */}
      <div className=" bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit space-y-4">
        <h2 className="text-lg font-bold text-slate-800">
          Nueva Reserva Transfer
        </h2>

        {/* SELECTOR DE PESTAÑAS */}
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button
            type="button"
            onClick={() => handleCambiarModo('LOGUEADO')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
              tipoReservaActual === 'LOGUEADO'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cliente Registrado
          </button>
          <button
            type="button"
            onClick={() => handleCambiarModo('INVITADO')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
              tipoReservaActual === 'INVITADO'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Invitado Express
          </button>
        </div>

        {/* REFACTOR: Se eliminó la etiqueta <form> duplicada que envolvía el contenido */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Selección de Viaje */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Viaje Programado
            </label>
            <select
              {...register('idViaje')}
              onChange={(e) => {
                register('idViaje').onChange(e);
                handleViajeSelect(e.target.value);
              }}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="">Seleccione un viaje...</option>
              {viajes.map((v) => (
                <option key={v.idViaje} value={v.idViaje}>
                  Viaje #{v.idViaje} (Ruta: {v.idRuta}) - Salida:{' '}
                  {new Date(v.fechaHoraSalida).toLocaleString()} - ${v.precio}
                </option>
              ))}
            </select>
            {errors.idViaje && (
              <span className="text-xs text-red-500">
                {errors.idViaje.message}
              </span>
            )}
          </div>

          {/* MODO CLIENTE LOGUEADO */}
          {tipoReservaActual === 'LOGUEADO' && (
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-md space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Cliente Titular
                </label>
                <select
                  {...register('idCliente')}
                  onChange={(e) => {
                    register('idCliente').onChange(e);
                    handleClienteSelect(e.target.value);
                  }}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Seleccione un cliente registrado...</option>
                  {clientes.map((c) => (
                    <option key={c.idUsuario} value={c.idUsuario}>
                      {c.nombre} {c.apellido} ({c.email})
                    </option>
                  ))}
                </select>
                {errors.idCliente && (
                  <span className="text-xs text-red-500">
                    {errors.idCliente.message}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* DATOS DEL PASAJERO */}
          <div className="space-y-3 border-t pt-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Datos del Pasajero
            </p>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Nombre"
                error={errors.pasajeroNombre?.message}
                {...register('pasajeroNombre')}
              />
              <Input
                label="Apellido"
                error={errors.pasajeroApellido?.message}
                {...register('pasajeroApellido')}
              />
            </div>

            <Input
              label="DNI / Documento"
              error={errors.pasajeroDni?.message}
              {...register('pasajeroDni')}
            />

            {/* MODO INVITADO */}
            {tipoReservaActual === 'INVITADO' && (
              <>
                <Input
                  type="email"
                  label="Email (para ticket)"
                  error={errors.pasajeroEmail?.message}
                  {...register('pasajeroEmail')}
                />
                <Input
                  label="Teléfono / Celular"
                  error={errors.pasajeroTelefono?.message}
                  {...register('pasajeroTelefono')}
                />
              </>
            )}
          </div>

          {/* NUEVA SECCIÓN DETALLE (ASIENTO Y PRECIO PERFECTAMENTE ALINEADOS) */}
          <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4">
            {/* Campo Nº Asiento */}
            <div className="flex flex-col gap-1 justify-end">
              <label className="text-sm font-medium text-slate-700 min-h-5 flex items-center">
                Nº Asiento
              </label>
              <input
                type="number"
                {...register('asiento', { valueAsNumber: true })}
                className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
              />
              {errors.asiento && (
                <span className="text-xs text-red-500">
                  {errors.asiento.message}
                </span>
              )}
            </div>

            {/* Campo Precio Total con prefijo $ integrado */}
            <div className="flex flex-col gap-1 justify-end">
              <label className="text-sm font-medium text-slate-700 min-h-5 flex items-center">
                Precio Total
              </label>
              <div className="relative flex items-center w-full h-10 bg-slate-50 border border-slate-300 rounded-md overflow-hidden">
                <span className="pl-3 pr-1.5 text-sm font-semibold text-slate-400 select-none">
                  $
                </span>
                <input
                  type="number"
                  {...register('precioFinal', { valueAsNumber: true })}
                  className="w-full h-full pr-3 py-2 bg-transparent text-sm font-semibold text-slate-800 outline-none"
                  readOnly
                />
              </div>
              {errors.precioFinal && (
                <span className="text-xs text-red-500">
                  {errors.precioFinal.message}
                </span>
              )}
            </div>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            Confirmar Reserva
          </Button>
        </form>
      </div>

      {/* TABLA DE RESERVAS */}
      <div className="xl:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          Reservas Emitidas
        </h2>

        {cargando ? (
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
            Cargando reservas...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Pasajero</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Asiento</th>
                  <th className="py-3 px-4">Monto</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservas.map((r) => (
                  <tr
                    key={r.idReserva}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          r.tipoReserva === 'LOGUEADO'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {r.tipoReserva}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {r.pasajero.nombre} {r.pasajero.apellido}
                      <span className="block text-xs text-slate-400">
                        DNI: {r.pasajero.dni}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      {r.pasajero.email || 'N/A'}
                      <span className="block text-slate-400">
                        {r.pasajero.telefono}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      #{r.asiento}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      ${r.precioFinal}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          r.estado === 'RESERVADO'
                            ? 'bg-amber-100 text-amber-800'
                            : r.estado === 'PAGADO'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.estado}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.estado !== 'CANCELADO' && (
                        <button
                          onClick={() => handleCancelar(r.idReserva)}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};




