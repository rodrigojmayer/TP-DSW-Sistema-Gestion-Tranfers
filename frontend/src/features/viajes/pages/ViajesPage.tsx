import { useEffect, useState, useCallback } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { viajeSchema, type ViajeFormData } from '../schemas/viajeSchema';
import { viajeService } from '../api/viajeService';
import { rutaService } from '../../rutas/api/rutaService';
import { usuarioService } from '../../usuarios/api/usuarioService';
// import { puntoService } from '../../puntos/api/puntoService';
import { useAuthStore } from '../../../store/authStore';
import type { Viaje, Ruta, Usuario, Punto, Reserva} from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { reservaService } from '../../reservas/api/reservaService';
import { calcularDisponibilidadViaje, type PuntoRutaConOrden, type ReservaMinima } from '../../../utils/disponibilidad';

// Estructura opcional de punto medio en la ruta
interface PuntoDetalle {
  nombre: string;
  direccion?: string;
  horaEstimada: string;
  pasajerosDisponibles: number;
  valijasDisponibles: number;
}

export const ViajesPage = () => {
  const user = useAuthStore((state) => state.user);
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [rutasDisponibles, setRutasDisponibles] = useState<Ruta[]>([]);
  const [choferesDisponibles, setChoferesDisponibles] = useState<Usuario[]>([]);
  // const [puntosDisponibles, setPuntosDisponibles] = useState<Punto[]>([]); // 2. Agregar estado para puntos
  const [cargando, setCargando] = useState(true);
  const [idEditando, setIdEditando] = useState<string | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);

  // Estado para controlar el modal de detalle del viaje
  const [viajeSeleccionado, setViajeSeleccionado] = useState<Viaje | null>(null);

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
      fechaHoraSalida: '',
      fechaHoraLlegada: '',
      capacidadPasajeros: 4,
      capacidadValijas: 4,
      precio: 0,
    },
  });

  // Helper para consultar viajes según el rol del usuario
  const obtenerViajesSegunRol = useCallback(async (): Promise<Viaje[]> => {
    if (user?.rol === 'ADMIN') {
      return await viajeService.obtenerTodosAdmin();
    }
    if (user?.rol === 'CLIENTE') {
      return await viajeService.obtenerMisViajes();
    }
    return await viajeService.obtenerPublicos();
  }, [user]);

  // Carga de datos auxiliares (Rutas y Choferes) y Viajes
  const cargarDatos = useCallback(async () => {
    try {
      if (user?.rol === 'ADMIN') {
        const [dataViajes, dataRutas, dataUsuarios, dataReservas] = await Promise.all([
          obtenerViajesSegunRol(),
          rutaService.obtenerTodas(),
          usuarioService.obtenerTodos(),
          // puntoService.obtenerTodos(), // Consulta de los puntos guardados
          reservaService.obtenerTodas(),
        ]);
        setViajes(dataViajes);
        setRutasDisponibles(dataRutas);
        setChoferesDisponibles(dataUsuarios.filter((u) => u.rol === 'CHOFER'));
        // setPuntosDisponibles(dataPuntos);
        setReservas(dataReservas);
      } else {
        const dataViajes = await obtenerViajesSegunRol();
        let dataReservas: Reserva[] = [];
        if (user?.id) {
          dataReservas = await reservaService.obtenerPorCliente(user.id);
        }
        setViajes(dataViajes);
        setReservas(dataReservas);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setCargando(false);
    }
  }, [user, obtenerViajesSegunRol]);

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
    try {
      if (idEditando) {
        await viajeService.actualizar(idEditando, data);
      } else {
        await viajeService.crear(data);
      }
      cancelarEdicion();
      setCargando(true);
      await cargarDatos();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Error al guardar');
    }
  };

  const handleEditar = (viaje: Viaje) => {
    setIdEditando(viaje.id);
    setValue('idRuta', viaje.idRuta || '');
    setValue('idChofer', viaje.idChofer || '');
    setValue(
      'fechaHoraSalida',
      viaje.fechaHoraSalida ? new Date(viaje.fechaHoraSalida).toISOString().slice(0, 16) : ''
    );
    setValue(
      'fechaHoraLlegada',
      viaje.fechaHoraLlegada ? new Date(viaje.fechaHoraLlegada).toISOString().slice(0, 16) : ''
    );
    setValue('capacidadPasajeros', viaje.capacidadPasajeros ?? 4);
    setValue('capacidadValijas', viaje.capacidadValijas ?? 4);
    setValue('precio', viaje.precio);
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    reset({
      idRuta: '',
      idChofer: '',
      fechaHoraSalida: '',
      fechaHoraLlegada: '',
      capacidadPasajeros: 4,
      capacidadValijas: 4,
      precio: 0,
    });
  };

  const handleEliminar = async (id: string) => {
    if (window.confirm('¿Estás seguro de cancelar este viaje?')) {
      setCargando(true);
      await viajeService.eliminar(id);
      await cargarDatos();
    }
  };

  const obtenerNombreRuta = (viaje: Viaje) => {
    if (viaje.rutaNombre) return viaje.rutaNombre;
    if (typeof viaje.ruta === 'object' && viaje.ruta !== null) {
      if (viaje.ruta.origen && viaje.ruta.destino) {
        return `${viaje.ruta.origen} ➔ ${viaje.ruta.destino}`;
      }
      if (viaje.ruta.nombre) return viaje.ruta.nombre;
    }
    const r = rutasDisponibles.find((item) => item.idRuta === viaje.idRuta);
    return r ? r.nombre : 'Ruta no asignada';
  };

  const obtenerNombreChofer = (idChofer?: string) => {
    if (!idChofer) return 'Sin chofer';
    const c = choferesDisponibles.find((item) => item.idUsuario === idChofer);
    return c ? `${c.nombre} ${c.apellido}` : 'Sin chofer';
  };

  // Helper para construir la lista de puntos a mostrar en el Modal
  const obtenerPuntosRuta = (viaje: Viaje): PuntoDetalle[] => {
    const rutaCompleta = rutasDisponibles.find((r) => r.idRuta === viaje.idRuta);
    const elementos = rutaCompleta?.puntos || [];

    if (elementos.length === 0) return [];

    // 1. Mapear y ordenar los puntos de la ruta con su 'orden'
    const puntosOrdenados: PuntoRutaConOrden[] = [...elementos]
      .map((item, idx) => {
        const puntoObj: Punto | undefined =
          'punto' in item && item.punto ? item.punto : (item as unknown as Punto);
        
        const ordenItem = 'orden' in item && typeof item.orden === 'number' ? item.orden : idx + 1;
        const nombrePunto = puntoObj?.nombre || `Punto ${ordenItem}`;

        return {
          orden: ordenItem,
          nombre: nombrePunto,
        };
      })
      .sort((a, b) => a.orden - b.orden);

    // 2. Mapear las reservas asociadas a este viaje al formato ReservaMinima
    const reservasDelViaje: ReservaMinima[] = reservas
      .filter((r) => {
        const idViajeReserva = typeof r.viaje === 'object' && r.viaje !== null ? r.viaje.id : r.viaje;
        return idViajeReserva === viaje.id;
      })
      .map((r) => ({
        origen: r.origen || '',
        destino: r.destino || '',
        cantPasajeros: r.cantPasajeros ?? 1,
        cantValijas: r.cantValijas ?? 0,
      }));

    // 3. Ejecutar el cálculo por tramos
    const tramosCalculados = calcularDisponibilidadViaje(
      viaje.capacidadPasajeros ?? 0,
      viaje.capacidadValijas ?? 0,
      puntosOrdenados,
      reservasDelViaje
    );

    // 4. Mapear la información para renderizar en la tabla del modal
    return elementos
      .sort((a, b) => {
        const ordenA = 'orden' in a && typeof a.orden === 'number' ? a.orden : 0;
        const ordenB = 'orden' in b && typeof b.orden === 'number' ? b.orden : 0;
        return ordenA - ordenB;
      })
      .map((item, idx) => {
        const esOrigen = idx === 0;
        const esDestino = idx === elementos.length - 1;

        const puntoObj: Punto | undefined =
          'punto' in item && item.punto ? item.punto : (item as unknown as Punto);

        const ordenItem = 'orden' in item && typeof item.orden === 'number' ? item.orden : idx + 1;
        const direccionFallback = 'direccion' in item && typeof item.direccion === 'string' ? item.direccion : '';

        // Buscar el tramo calculado correspondiente a este punto
        const tramoInfo = tramosCalculados.find((t) => t.ordenInicio === ordenItem);

        const formatoFechaHora = (fechaStr: string) => {
          const fecha = new Date(fechaStr);
          return isNaN(fecha.getTime())
            ? '-'
            : fecha.toLocaleString([], {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
        };

        let horaEstimada = '-';
        if (esOrigen && viaje.fechaHoraSalida) {
          horaEstimada = formatoFechaHora(viaje.fechaHoraSalida);
        } else if (esDestino && viaje.fechaHoraLlegada) {
          horaEstimada = formatoFechaHora(viaje.fechaHoraLlegada);
        } else if ('horaEstimada' in item && typeof item.horaEstimada === 'string' && item.horaEstimada) {
          horaEstimada = item.horaEstimada;
        }

        return {
          nombre: puntoObj?.nombre || (ordenItem ? `Punto ${ordenItem}` : 'Punto sin nombre'),
          direccion: puntoObj?.direccion || direccionFallback || 'Sin dirección',
          horaEstimada,
          pasajerosDisponibles: tramoInfo ? tramoInfo.pasajerosDisponibles : (viaje.capacidadPasajeros ?? 0),
          valijasDisponibles: tramoInfo ? tramoInfo.valijasDisponibles : (viaje.capacidadValijas ?? 0),
        };
      });
  };

  const esAdmin = user?.rol === 'ADMIN';

  return (
    <div className={`grid grid-cols-1 ${esAdmin ? 'xl:grid-cols-3' : ''} gap-6`}>
      {/* Formulario Crear/Editar (Visible solo para administradores) */}
      {esAdmin && (
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              {idEditando ? 'Editar Viaje' : 'Programar Viaje'}
            </h2>
            {idEditando && (
              <button
                type="button"
                onClick={cancelarEdicion}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Cancelar Edición
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Select de Ruta */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">Ruta Asignada</label>
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
              <label className="text-sm font-medium text-slate-700">Chofer Responsable</label>
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

            {/* Fechas de Salida y Llegada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                type="datetime-local"
                label="Fecha/Hora Salida"
                error={errors.fechaHoraSalida?.message}
                {...register('fechaHoraSalida')}
              />
              <Input
                type="datetime-local"
                label="Fecha/Hora Llegada"
                error={errors.fechaHoraLlegada?.message}
                {...register('fechaHoraLlegada')}
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
              <label className="text-sm font-medium text-slate-700">Precio del Pasaje</label>
              <div className="relative flex items-center w-full h-10 border border-slate-300 rounded-md overflow-hidden bg-white focus-within:ring-2 focus-within:ring-amber-400">
                <span className="pl-3 pr-1.5 text-sm font-semibold text-slate-400 select-none">$</span>
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
      )}

      {/* Listado de Viajes */}
      <div className={`${esAdmin ? 'xl:col-span-2' : 'w-full'} bg-white p-6 rounded-lg border border-slate-200 shadow-sm`}>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Viajes Programados</h2>

        {cargando ? (
          <p className="text-sm text-slate-500 flex items-center gap-2">
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-amber-500 border-t-transparent" />
            Cargando viajes...
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="py-3 px-4">Ruta</th>
                  <th className="py-3 px-4">Chofer</th>
                  <th className="py-3 px-3">Salida</th>
                  <th className="py-3 px-3">Llegada</th>
                  <th className="py-3 px-3 text-center">Pasajeros</th>
                  <th className="py-3 px-3 text-center">Valijas</th>
                  <th className="py-3 px-3">Precio</th>
                  {esAdmin && <th className="py-3 px-3 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viajes.map((viaje) => (
                  <tr
                    key={viaje.id}
                    onClick={() => setViajeSeleccionado(viaje)}
                    className="hover:bg-amber-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-medium text-slate-900 group-hover:text-amber-600 transition-colors">
                      {obtenerNombreRuta(viaje)}
                    </td>
                    <td className="py-3 px-4">
                      {viaje.idChofer ? obtenerNombreChofer(viaje.idChofer) : 'Sin chofer'}
                    </td>
                    <td className="py-3 px-3 text-xs whitespace-nowrap">
                      {viaje.fechaHoraSalida
                        ? new Date(viaje.fechaHoraSalida).toLocaleString()
                        : '-'}
                    </td>
                    <td className="py-3 px-3 text-xs whitespace-nowrap">
                      {viaje.fechaHoraLlegada
                        ? new Date(viaje.fechaHoraLlegada).toLocaleString()
                        : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">
                      {viaje.capacidadPasajeros ?? '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium text-slate-800">
                      {viaje.capacidadValijas ?? '-'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      ${viaje.precio}
                    </td>
                    {esAdmin && (
                      <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditar(viaje)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(viaje.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-xs transition"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {viajes.length === 0 && (
                  <tr>
                    <td colSpan={esAdmin ? 8 : 7} className="py-8 text-center text-slate-500">
                      No hay viajes programados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DE DETALLE DE RUTA Y PUNTOS MEDIOS */}
      {viajeSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
          onClick={() => setViajeSeleccionado(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado del Modal */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Detalle del Viaje: <span className="text-amber-600">{obtenerNombreRuta(viajeSeleccionado)}</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Chofer: {obtenerNombreChofer(viajeSeleccionado.idChofer)}
                </p>
              </div>
              <button
                onClick={() => setViajeSeleccionado(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            {/* Tabla de Puntos Medios y Disponibilidad */}
            <div className="p-6 overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-semibold text-xs uppercase">
                  <tr>
                    <th className="py-2.5 px-4 border-b">Horario</th>
                    <th className="py-2.5 px-4 border-b">Punto / Parada</th>
                    <th className="py-2.5 px-4 border-b text-center">Pasajeros Disp.</th>
                    <th className="py-2.5 px-4 border-b text-center">Valijas Disp.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {obtenerPuntosRuta(viajeSeleccionado).map((punto, idx, arr) => {
                    const esOrigen = idx === 0;
                    const esDestino = idx === arr.length - 1;
                    const numeroParada = idx; // Las paradas intermedias empiezan en 1°

                    return (
                      <tr
                        key={idx}
                        className={esOrigen || esDestino ? 'bg-amber-50/30 font-medium' : 'hover:bg-slate-50'}
                      >
                        {/* Horario */}
                       <td className="py-2.5 px-4 text-xs font-semibold text-slate-700 whitespace-nowrap">
                        {punto.horaEstimada}
                      </td>

                        {/* Punto con etiquetas Origen, N° Parada o Destino */}
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span>{punto.nombre}</span>

                            {esOrigen && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-normal">
                                Origen
                              </span>
                            )}

                            {!esOrigen && !esDestino && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-normal">
                                {numeroParada}° Parada
                              </span>
                            )}

                            {esDestino && (
                              <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-normal">
                                Destino
                              </span>
                            )}
                          </div>
                          {punto.direccion && (
                            <div className="text-xs text-slate-400 font-normal mt-0.5">
                              {punto.direccion}
                            </div>
                          )}
                        </td>

                        {/* Pasajeros Disponibles */}
                        <td className="py-2.5 px-4 text-center font-bold">
                          {esDestino ? (
                            <span className="text-slate-400 font-normal">-</span>
                          ) : (
                            <span className={punto.pasajerosDisponibles === 0 ? 'text-red-500 font-extrabold' : 'text-slate-700'}>
                              {punto.pasajerosDisponibles}
                            </span>
                          )}
                        </td>
                        {/* Valijas Disponibles */}
                        <td className="py-2.5 px-4 text-center font-bold">
                          {esDestino ? (
                            <span className="text-slate-400 font-normal">-</span>
                          ) : (
                            <span className={punto.valijasDisponibles === 0 ? 'text-red-500 font-extrabold' : 'text-slate-700'}>
                              {punto.valijasDisponibles}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViajeSeleccionado(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-md transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};