// src/features/reservas/pages/ReservasPage.tsx
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crearReservaSchema, type ReservaFormData } from '../schemas/reservaSchema';
import { reservaService } from '../api/reservaService';
import { viajeService } from '../../viajes/api/viajeService';
import { usuarioService } from '../../usuarios/api/usuarioService';
import { useAuthStore } from '../../../store/authStore';

import type { Reserva, Viaje, Usuario, CrearReservaPrivadaFormData } from '../../../types';

import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { InputAutocompleteGeo } from '../../../components/ui/InputAutocompleteGeo';
import { calcularDistanciaHaversine, type Coordenada } from '../../../services/geoService';
import { Plus, RefreshCw, Search, ClipboardList, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const formatToDatetimeLocal = (dateStr?: string | Date) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const ReservasPage = () => {
  const user = useAuthStore((state) => state.user);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [todasLasReservasViaje, setTodasLasReservasViaje] = useState<Reserva[]>([]);
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState<string | null>(null);

  // Estados de Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  const estaLogueado = Boolean(user);
  const esAdminOrOperador = user?.rol === 'ADMIN' || user?.rol === 'OPERADOR';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReservaFormData>({
    resolver: zodResolver(crearReservaSchema) as unknown as Resolver<ReservaFormData>,
    defaultValues: {
      tipoReserva: estaLogueado ? 'LOGUEADO' : 'INVITADO',
      tipoViaje: 'COMPARTIDO',
      idViaje: '',
      origen: '',
      destino: '',
      asiento: 1,
      cantValijas: 0,
      precioFinal: 0,
      idCliente: user?.id || '',
      pasajeroNombre: user?.nombre || '',
      pasajeroApellido: user?.apellido || '',
      pasajeroDni: user?.dni || '',
      pasajeroEmail: user?.email || '',
      pasajeroTelefono: user?.telefono || '',
    },
  });

  const tipoReservaActual = useWatch({ control, name: 'tipoReserva' });
  const tipoViaje = useWatch({ control, name: 'tipoViaje' });
  const idViajeSeleccionado = useWatch({ control, name: 'idViaje' });
  const origenSeleccionado = useWatch({ control, name: 'origen' });
  const destinoSeleccionado = useWatch({ control, name: 'destino' });
  const asientoIngresado = useWatch({ control, name: 'asiento' }) || 1;
  const valijasIngresadas = useWatch({ control, name: 'cantValijas' }) || 0;
  
  const [coordsOrigen, setCoordsOrigen] = useState<Coordenada | null>(null);
  const [coordsDestino, setCoordsDestino] = useState<Coordenada | null>(null);
  const [fechaInicioPrivada, setFechaInicioPrivada] = useState<string>('');

  const viajeSeleccionado = useMemo(() => {
    return viajes.find((v) => v.id === idViajeSeleccionado);
  }, [viajes, idViajeSeleccionado]);

  const viajesCompartidosDisponibles = useMemo(() => {
    if (!viajes || !Array.isArray(viajes)) return [];
    return viajes.filter((viaje) => viaje.tipo === 'COMPARTIDO');
  }, [viajes]);

  const listaParadas = useMemo(() => {
    if (!viajeSeleccionado) return [];
    return viajeSeleccionado.paradas || [];
  }, [viajeSeleccionado]);

  const origenesDisponibles = useMemo(() => {
    if (tipoViaje !== 'COMPARTIDO' || listaParadas.length === 0) return [];
    return listaParadas.slice(0, -1);
  }, [tipoViaje, listaParadas]);

  const destinosDisponibles = useMemo(() => {
    if (
      tipoViaje !== 'COMPARTIDO' ||
      !origenSeleccionado ||
      listaParadas.length === 0
    ) {
      return [];
    }
    const idxOrigen = listaParadas.indexOf(origenSeleccionado);
    if (idxOrigen === -1) return [];

    return listaParadas.slice(idxOrigen + 1);
  }, [tipoViaje, origenSeleccionado, listaParadas]);

  useEffect(() => {
    if (estaLogueado && user) {
      setValue('tipoReserva', 'LOGUEADO');
      setValue('idCliente', user.id);
      setValue('pasajeroNombre', user.nombre || '');
      setValue('pasajeroApellido', user.apellido || '');
      setValue('pasajeroDni', user.dni || '');
      setValue('pasajeroEmail', user.email || '');
      setValue('pasajeroTelefono', user.telefono || '');
    } else {
      setValue('tipoReserva', 'INVITADO');
      setValue('idCliente', '');
    }
  }, [estaLogueado, user, setValue]);

  const distanciaKm = useMemo(() => {
    if (tipoViaje === 'PRIVADO' && coordsOrigen && coordsDestino) {
      return calcularDistanciaHaversine(coordsOrigen, coordsDestino);
    }
    return null;
  }, [tipoViaje, coordsOrigen, coordsDestino]);

  useEffect(() => {
    let cancelado = false;
    if (idViajeSeleccionado) {
      reservaService
        .obtenerPorViaje(idViajeSeleccionado)
        .then((data) => {
          if (!cancelado) setTodasLasReservasViaje(data);
        })
        .catch(() => {
          if (!cancelado) setTodasLasReservasViaje([]);
        });
    }
    return () => {
      cancelado = true;
    };
  }, [idViajeSeleccionado]);

  useEffect(() => {
    setValue('origen', '');
    setValue('destino', '');
  }, [idViajeSeleccionado, tipoViaje, setValue]);

  useEffect(() => {
    const pasajerosEquivalentes = asientoIngresado + valijasIngresadas * 0.5;

    if (tipoViaje === 'PRIVADO') {
      if (distanciaKm && distanciaKm > 0) {
        const precioPrivado = distanciaKm * 2000;
        setValue('precioFinal', Math.round(precioPrivado));
      } else {
        setValue('precioFinal', 0);
      }
      return;
    }

    if (!viajeSeleccionado || !viajeSeleccionado.precio) {
      setValue('precioFinal', 0);
      return;
    }

    const precioBase = viajeSeleccionado.precio;
    if (
      !origenSeleccionado ||
      !destinoSeleccionado ||
      listaParadas.length < 2
    ) {
      const totalPrivado = precioBase * pasajerosEquivalentes;
      setValue('precioFinal', totalPrivado);
      return;
    }

    const idxOrigen = listaParadas.indexOf(origenSeleccionado);
    const idxDestino = listaParadas.indexOf(destinoSeleccionado);

    if (idxOrigen !== -1 && idxDestino !== -1 && idxDestino > idxOrigen) {
      const totalTramosViaje = listaParadas.length - 1;
      const tramosRecorridos = idxDestino - idxOrigen;
      const precioPorTramo = precioBase / totalTramosViaje;
      const precioCalculado =
        pasajerosEquivalentes * precioPorTramo * tramosRecorridos;

      setValue('precioFinal', Math.round(precioCalculado * 100) / 100);
    } else {
      setValue('precioFinal', 0);
    }
  }, [
    viajeSeleccionado,
    tipoViaje,
    distanciaKm,
    origenSeleccionado,
    destinoSeleccionado,
    listaParadas,
    asientoIngresado,
    valijasIngresadas,
    setValue,
  ]);

  useEffect(() => {
    if (tipoViaje === 'COMPARTIDO') {
      setValue('destino', '');
    }
  }, [origenSeleccionado, tipoViaje, setValue]);

  const obtenerViajesSegunRol = useCallback(async (): Promise<Viaje[]> => {
    try {
      if (user?.rol === 'ADMIN') {
        return await viajeService.obtenerTodosAdmin();
      }
      if (user?.rol === 'CLIENTE') {
        return await viajeService.obtenerMisViajes();
      }
      return await viajeService.obtenerPublicos();
    } catch (error) {
      console.error('Error al obtener viajes:', error);
      return [];
    }
  }, [user]);

  const obtenerReservasSegunRol = async (): Promise<Reserva[]> => {
    if (!estaLogueado || !user?.id) return [];
    if (user.rol === 'ADMIN') {
      return await reservaService.obtenerTodas().catch(() => []);
    }
    return await reservaService.obtenerPorCliente(user.id).catch(() => []);
  };

  const refrescarDatos = async () => {
    setCargando(true);
    try {
      const resData = await obtenerReservasSegunRol();
      const viajesData = await obtenerViajesSegunRol();

      setReservas(resData);
      setViajes(
        viajesData.filter(
          (v) => !v.estado || v.estado.toUpperCase() === 'PROGRAMADO',
        ),
      );

      if (user?.rol === 'ADMIN') {
        const usuariosData = await usuarioService.obtenerTodos().catch(() => []);
        setClientes(usuariosData.filter((u) => u.rol === 'CLIENTE'));
      }
    } catch (error) {
      console.error('Error al actualizar datos:', error);
    } finally {
      setCargando(false);
    }
  };

  const calcularLimiteAsientos = () => {
    const capacidadTotal = viajeSeleccionado?.capacidadPasajeros ?? 0;
    if (!viajeSeleccionado || !origenSeleccionado || !destinoSeleccionado) {
      return capacidadTotal;
    }

    const idxOrigen = listaParadas.indexOf(origenSeleccionado);
    const idxDestino = listaParadas.indexOf(destinoSeleccionado);

    if (idxOrigen === -1 || idxDestino === -1 || idxOrigen >= idxDestino) {
      return capacidadTotal;
    }

    const tramosRecorridos = [];
    for (let i = idxOrigen; i < idxDestino; i++) {
      tramosRecorridos.push({ desdeIdx: i, hastaIdx: i + 1 });
    }

    const reservasActivas = todasLasReservasViaje.filter((r) => {
      const idViajeReserva =
        typeof r.viaje === 'object' && r.viaje !== null ? r.viaje.id : r.viaje;
      const esMismaReserva = modoEdicion && r.id === idEdicion;
      return idViajeReserva === viajeSeleccionado.id && !esMismaReserva;
    });

    let maxPasajerosPermitidos = capacidadTotal;
    tramosRecorridos.forEach((tramo) => {
      let ocupadosEnTramo = 0;
      reservasActivas.forEach((res) => {
        const resIdxOrigen = listaParadas.indexOf(res.origen);
        const resIdxDestino = listaParadas.indexOf(res.destino);
        if (resIdxOrigen < tramo.hastaIdx && resIdxDestino > tramo.desdeIdx) {
          ocupadosEnTramo += res.cantPasajeros || 1;
        }
      });
      const disponiblesEnTramo = capacidadTotal - ocupadosEnTramo;
      if (disponiblesEnTramo < maxPasajerosPermitidos) {
        maxPasajerosPermitidos = disponiblesEnTramo;
      }
    });
    return Math.max(0, maxPasajerosPermitidos);
  };

  const maxAsientosDisponibles = calcularLimiteAsientos();
  
  const calcularLimiteValijas = () => {
    const capacidadTotalValijas = viajeSeleccionado?.capacidadValijas ?? 0;
    if (!viajeSeleccionado || !origenSeleccionado || !destinoSeleccionado) {
      return capacidadTotalValijas;
    }

    const idxOrigen = listaParadas.indexOf(origenSeleccionado);
    const idxDestino = listaParadas.indexOf(destinoSeleccionado);

    if (idxOrigen === -1 || idxDestino === -1 || idxOrigen >= idxDestino) {
      return capacidadTotalValijas;
    }

    const tramosRecorridos = [];
    for (let i = idxOrigen; i < idxDestino; i++) {
      tramosRecorridos.push({ desdeIdx: i, hastaIdx: i + 1 });
    }

    const reservasActivas = todasLasReservasViaje.filter((r) => {
      const idViajeReserva =
        typeof r.viaje === 'object' && r.viaje !== null ? r.viaje.id : r.viaje;
      const esMismaReserva = modoEdicion && r.id === idEdicion;
      return idViajeReserva === viajeSeleccionado.id && !esMismaReserva;
    });

    let maxValijasPermitidas = capacidadTotalValijas;
    tramosRecorridos.forEach((tramo) => {
      let ocupadasEnTramo = 0;
      reservasActivas.forEach((res) => {
        const resIdxOrigen = listaParadas.indexOf(res.origen);
        const resIdxDestino = listaParadas.indexOf(res.destino);
        if (resIdxOrigen < tramo.hastaIdx && resIdxDestino > tramo.desdeIdx) {
          ocupadasEnTramo += res.cantValijas || 0;
        }
      });
      const disponiblesEnTramo = capacidadTotalValijas - ocupadasEnTramo;
      if (disponiblesEnTramo < maxValijasPermitidas) {
        maxValijasPermitidas = disponiblesEnTramo;
      }
    });
    return Math.max(0, maxValijasPermitidas);
  };

  const maxValijasDisponibles = calcularLimiteValijas();
  const limitePasajeros = tipoViaje === 'PRIVADO' ? 4 : maxAsientosDisponibles;
  const limiteValijas = tipoViaje === 'PRIVADO' ? 4 : maxValijasDisponibles;

  useEffect(() => {
    if (asientoIngresado < 1) {
      setValue('asiento', 1);
    } else if (asientoIngresado > limitePasajeros && limitePasajeros > 0) {
      setValue('asiento', limitePasajeros);
    }
  }, [limitePasajeros, asientoIngresado, setValue]);

  useEffect(() => {
    if (valijasIngresadas < 0) {
      setValue('cantValijas', 0);
    } else if (valijasIngresadas > limiteValijas && limiteValijas >= 0) {
      setValue('cantValijas', limiteValijas);
    }
  }, [limiteValijas, valijasIngresadas, setValue]);

  const fechaInicio = useMemo(() => {
    if (tipoViaje === 'COMPARTIDO') {
      const inicio = viajeSeleccionado?.fechaHoraInicio || viajeSeleccionado?.fechaHora;
      return formatToDatetimeLocal(inicio);
    }
    return fechaInicioPrivada;
  }, [tipoViaje, viajeSeleccionado, fechaInicioPrivada]);

  const sumarHorasADatetimeLocal = (datetimeStr: string, horasASumar: number): string => {
    if (!datetimeStr || isNaN(horasASumar) || horasASumar <= 0) return '';
    const fecha = new Date(datetimeStr);
    if (isNaN(fecha.getTime())) return '';
    const fechaFin = new Date(fecha.getTime() + horasASumar * 60 * 60 * 1000);
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    return `${fechaFin.getFullYear()}-${pad(fechaFin.getMonth() + 1)}-${pad(fechaFin.getDate())}T${pad(fechaFin.getHours())}:${pad(fechaFin.getMinutes())}`;
  };

  const fechaFinPrivadaCalculada = useMemo(() => {
    if (!fechaInicioPrivada || !distanciaKm || distanciaKm <= 0) return '';
    const horasEstimadas = distanciaKm / 100;
    return sumarHorasADatetimeLocal(fechaInicioPrivada, horasEstimadas);
  }, [fechaInicioPrivada, distanciaKm]);

  const fechaFin = useMemo(() => {
    if (tipoViaje === 'COMPARTIDO') {
      return formatToDatetimeLocal(viajeSeleccionado?.fechaHoraFin);
    }
    return fechaFinPrivadaCalculada;
  }, [tipoViaje, viajeSeleccionado, fechaFinPrivadaCalculada]);

  useEffect(() => {
    let isMounted = true;
    const cargarDatosIniciales = async () => {
      try {
        const resPromise = estaLogueado ? reservaService.obtenerTodas().catch(() => []) : Promise.resolve([]);
        const [resData, viajesData] = await Promise.all([resPromise, obtenerViajesSegunRol()]);
        let usuariosData: Usuario[] = [];
        if (user?.rol === 'ADMIN') {
          usuariosData = await usuarioService.obtenerTodos().catch(() => []);
        }

        if (isMounted) {
          setReservas(resData);
          setViajes(viajesData);
          if (user?.rol === 'ADMIN') {
            setClientes(usuariosData.filter((u) => u.rol === 'CLIENTE'));
          }
        }
      } catch (error) {
        if (isMounted) console.error('Error al cargar datos iniciales:', error);
      } finally {
        if (isMounted) setCargando(false);
      }
    };

    cargarDatosIniciales();
    return () => {
      isMounted = false;
    };
  }, [user, estaLogueado, obtenerViajesSegunRol]);
  
  useEffect(() => {
      if (modalAbierto) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [modalAbierto]);
    
  const reservasFiltradas = useMemo(() => {
    return reservas.filter((r: Reserva) => {
      const query = busqueda.toLowerCase().trim();
      
      // Tipado seguro sin usar 'any'
      const persona = (r.usuario && typeof r.usuario === 'object' ? r.usuario : {}) as Record<string, unknown>;
      
      const reservaConPasajero = r as Reserva & { pasajeroNombre?: string; pasajeroApellido?: string; pasajeroDni?: string };
      const nombreCompleto = `${String(persona.nombre || reservaConPasajero.pasajeroNombre || '')} ${String(persona.apellido || reservaConPasajero.pasajeroApellido || '')}`.toLowerCase();
      const dni = String(persona.dni || reservaConPasajero.pasajeroDni || '').toLowerCase();
      const trayecto = `${r.origen || ''} ${r.destino || ''}`.toLowerCase();

      return !query || nombreCompleto.includes(query) || dni.includes(query) || trayecto.includes(query);
    });
  }, [reservas, busqueda]);

  const totalPaginas = Math.ceil(reservasFiltradas.length / elementosPorPagina) || 1;

  const reservasPaginadas = useMemo(() => {
    const inicio = (paginaActual - 1) * elementosPorPagina;
    return reservasFiltradas.slice(inicio, inicio + elementosPorPagina);
  }, [reservasFiltradas, paginaActual]);

  const handleViajeSelect = (idViaje: string) => {
    const seleccionado = viajes.find((v) => v.id === idViaje);
    if (seleccionado) {
      setValue('precioFinal', seleccionado.precio);
      setValue('origen', '');
      setValue('destino', '');
    }
  };

  const handleClienteSelect = (idCliente: string) => {
    const cliente = clientes.find((c) => c.id === idCliente || c.idUsuario === idCliente);
    if (cliente) {
      setValue('pasajeroNombre', cliente.nombre ? cliente.nombre : '');
      setValue('pasajeroApellido', cliente.apellido);
      setValue('pasajeroDni', cliente.dni || '');
      setValue('pasajeroEmail', cliente.email || '');
    }
  };

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setIdEdicion(null);
    reset({
      tipoReserva: estaLogueado ? 'LOGUEADO' : 'INVITADO',
      tipoViaje: 'COMPARTIDO',
      idViaje: '',
      origen: '',
      destino: '',
      idCliente: user?.id || '',
      asiento: 1,
      cantValijas: 0,
      precioFinal: 0,
      pasajeroNombre: user?.nombre || '',
      pasajeroApellido: user?.apellido || '',
      pasajeroDni: user?.dni || '',
      pasajeroEmail: user?.email || '',
      pasajeroTelefono: user?.telefono || '',
    });
    setModalAbierto(true);
  };

  const handleEditar = (reserva: Reserva) => {
    setModoEdicion(true);
    setIdEdicion(reserva.id);

    const viajeId = typeof reserva.viaje === 'object' && reserva.viaje !== null ? reserva.viaje.id : reserva.viaje || '';
    const clienteId = typeof reserva.usuario === 'object' && reserva.usuario !== null ? reserva.usuario.id || reserva.usuario.idUsuario : reserva.usuario || '';

    reset({
      tipoReserva: clienteId ? 'LOGUEADO' : 'INVITADO',
      tipoViaje: 'tipoViaje' in reserva && typeof reserva.tipoViaje === 'string' ? (reserva.tipoViaje as ReservaFormData['tipoViaje']) : 'COMPARTIDO',
      idViaje: viajeId,
      idCliente: clienteId,
      origen: reserva.origen || '',
      destino: reserva.destino || '',
      asiento: reserva.cantPasajeros || 1,
      cantValijas: reserva.cantValijas || 0,
      precioFinal: reserva.precio || 0,
      pasajeroNombre: typeof reserva.usuario === 'object' ? reserva.usuario?.nombre || '' : '',
      pasajeroApellido: typeof reserva.usuario === 'object' ? reserva.usuario?.apellido || '' : '',
      pasajeroDni: typeof reserva.usuario === 'object' ? reserva.usuario?.dni || '' : '',
      pasajeroEmail: typeof reserva.usuario === 'object' ? reserva.usuario?.email || '' : '',
      pasajeroTelefono: typeof reserva.usuario === 'object' ? reserva.usuario?.telefono || '' : '',
    });
    setModalAbierto(true);
  };

  const handleCancelarEdicion = () => {
    setModoEdicion(false);
    setIdEdicion(null);
    setModalAbierto(false);
  };

  const onSubmit = async (data: ReservaFormData) => {
    try {
      const cantPasajerosSolicitados = Number(data.asiento) || 1;
      const cantValijasSolicitadas = Number(data.cantValijas) || 0;

      if (tipoViaje === 'PRIVADO') {
        if (!data.origen || !data.destino) {
          alert('Por favor ingrese el origen y destino exactos para el viaje privado.');
          return;
        }

        const payloadPrivado: CrearReservaPrivadaFormData = {
          pasajeroNombre: data.pasajeroNombre,
          pasajeroApellido: data.pasajeroApellido,
          pasajeroDni: data.pasajeroDni,
          pasajeroEmail: data.pasajeroEmail || '',
          pasajeroTelefono: data.pasajeroTelefono || '',
          origen: {
            nombre: data.origen,
            latitud: coordsOrigen?.lat || -34.5889,
            longitud: coordsOrigen?.lng || -58.3758,
            direccion: data.origen,
          },
          destino: {
            nombre: data.destino,
            latitud: coordsDestino?.lat || -34.8222,
            longitud: coordsDestino?.lng || -58.5358,
            direccion: data.destino,
          },
          fechaHoraInicio: new Date().toISOString(),
          cantPasajeros: cantPasajerosSolicitados,
          cantValijas: cantValijasSolicitadas,
          precio: Number(data.precioFinal),
          distanciaKm: distanciaKm || undefined,
        };

        if (modoEdicion && idEdicion) {
          await reservaService.actualizar(idEdicion, data);
        } else {
          await reservaService.crearPrivada(payloadPrivado);
        }

        handleCancelarEdicion();
        await refrescarDatos();
        return;
      }

      if (cantPasajerosSolicitados > maxAsientosDisponibles) {
        alert(`No es posible realizar la reserva. El límite de asientos disponibles es ${maxAsientosDisponibles}.`);
        return;
      }
      if (cantValijasSolicitadas > maxValijasDisponibles) {
        alert(`No es posible realizar la reserva. El límite de valijas permitidas es ${maxValijasDisponibles}.`);
        return;
      }

      const idClienteValido = data.tipoReserva === 'LOGUEADO' ? data.idCliente || user?.id || '' : '';
      const idxOrigen = listaParadas.indexOf(data.origen);
      const idxDestino = listaParadas.indexOf(data.destino);

      const payload = {
        ...data,
        idCliente: idClienteValido,
        precio: data.precioFinal,
        origen: data.origen,
        destino: data.destino,
        cantPasajeros: cantPasajerosSolicitados,
        cantValijas: cantValijasSolicitadas,
        ordenSubida: idxOrigen !== -1 ? idxOrigen + 1 : 1,
        ordenBajada: idxDestino !== -1 ? idxDestino + 1 : listaParadas.length,
      };

      if (modoEdicion && idEdicion) {
        await reservaService.actualizar(idEdicion, payload);
      } else {
        await reservaService.crear(payload);
      }

      handleCancelarEdicion();
      await refrescarDatos();
    } catch (error: unknown) {
      if (error instanceof Error) {
        alert(`Error al guardar la reserva: ${error.message}`);
      }
    }
  };

  const handleCancelar = async (id: string) => {
    if (window.confirm('¿Confirmas la cancelación de la reserva?')) {
      await reservaService.cancelar(id);
      await refrescarDatos();
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bold text-gray-900">
            {esAdminOrOperador ? 'Gestión de Reservas' : 'Mis Reservas'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refrescarDatos}
            disabled={cargando}
            className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            title="Recargar reservas"
          >
            <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Reserva
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por pasajero, DNI o trayecto..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800">Reservas Emitidas</h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
            Total: {reservasFiltradas.length}
          </span>
        </div>

        {cargando ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
            <p className="text-sm">Cargando reservas...</p>
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-3">
            <ClipboardList className="w-12 h-12 text-gray-300" />
            <p className="font-medium text-gray-700">No se encontraron reservas</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b">
                  <tr>
                    <th className="py-3 px-4">Pasajero</th>
                    <th className="py-3 px-4">Contacto</th>
                    <th className="py-3 px-4">Trayecto</th>
                    <th className="py-3 px-4">Cant. Pas. / Val.</th>
                    <th className="py-3 px-4">Monto</th>
                    <th className="py-3 px-4">Estado Pago</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservasPaginadas.map((r: Reserva) => {
                    // 1. Tipamos de forma segura la reserva como un objeto genérico o de registro
                    const reservaObj = r as unknown as Record<string, unknown>;

                    // 2. Extraemos el ID del usuario o pasajero
                    const idPersona = typeof r.usuario === 'string' 
                      ? r.usuario 
                      : (r.usuario && typeof r.usuario === 'object' ? (r.usuario as { id?: string; idUsuario?: string }).id || (r.usuario as { idUsuario?: string }).idUsuario : reservaObj.pasajero || reservaObj.cliente);

                    // 3. Buscamos los datos del usuario en la lista de clientes o en el usuario logueado actual
                    const usuarioEncontrado = clientes.find(
                      (c) => c.id === idPersona || c.idUsuario === idPersona
                    ) || (user?.id === idPersona ? user : null);

                    // 4. Obtenemos los campos finales priorizando el usuario encontrado o propiedades alternativas de la reserva
                    const nombrePasajero = usuarioEncontrado?.nombre || String(reservaObj.pasajeroNombre || '');
                    const apellidoPasajero = usuarioEncontrado?.apellido || String(reservaObj.pasajeroApellido || '');
                    const dniPasajero = usuarioEncontrado?.dni || String(reservaObj.pasajeroDni || 'N/A');
                    const emailPasajero = usuarioEncontrado?.email || String(reservaObj.pasajeroEmail || 'N/A');
                    const telefonoPasajero = usuarioEncontrado?.telefono || String(reservaObj.pasajeroTelefono || 'N/A');

                    const tieneNombre = Boolean(nombrePasajero.trim() || apellidoPasajero.trim());

                    return (
                      <tr key={r.id || reservaObj.idReserva as string} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {tieneNombre ? `${nombrePasajero} ${apellidoPasajero}` : 'Invitado Express'}
                          <span className="block text-xs text-slate-400">
                            DNI: {dniPasajero}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs">
                          {emailPasajero}
                          <span className="block text-slate-400">
                            {telefonoPasajero}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-xs font-medium text-slate-700">
                          {r.origen} ➔ {r.destino}
                        </td>

                        <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                          {r.cantPasajeros ?? (reservaObj.asientos as number) ?? 1} pas. / {r.cantValijas ?? 0} val.
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-900">
                          ${r.precio ?? (reservaObj.precioFinal as number) ?? 0}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 text-xs font-semibold rounded ${
                              reservaObj.pagoAbonado
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {reservaObj.pagoAbonado ? 'ABONADO' : 'PENDIENTE'}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleEditar(r)}
                            className="text-amber-600 hover:text-amber-800 text-xs font-semibold"
                          >
                            Editar
                          </button>
                          {reservaObj.habilitado !== false && (
                            <button
                              onClick={() => handleCancelar(r.id || (reservaObj.idReserva as string))}
                              className="text-red-600 hover:text-red-800 text-xs font-semibold"
                            >
                              Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            {totalPaginas > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs text-slate-500">
                  Página <span className="font-semibold">{paginaActual}</span> de{' '}
                  <span className="font-semibold">{totalPaginas}</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                    disabled={paginaActual === 1}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Página anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setPaginaActual(num)}
                        className={`w-8 h-8 text-xs font-semibold rounded-lg transition-colors ${
                          paginaActual === num
                            ? 'bg-amber-500 text-white'
                            : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))}
                    disabled={paginaActual === totalPaginas}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Página siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center border-b px-6 py-4 bg-white sticky top-0 z-10">
              <h2 className="text-lg font-bold text-slate-800">
                {modoEdicion ? 'Editar Reserva' : 'Programar Nueva Reserva'}
              </h2>
              <button
                type="button"
                onClick={handleCancelarEdicion}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-600">
                Modo actual:{' '}
                <span className="font-bold text-amber-600">
                  {estaLogueado
                    ? `${user?.rol === 'ADMIN' ? 'Administrador' : 'Cliente Registrado'} (${user?.nombre} ${user?.apellido})`
                    : 'Invitado Express'}
                </span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-slate-700">Tipo de Viaje</label>
                  <select
                    {...register('tipoViaje')}
                    className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                  >
                    <option value="COMPARTIDO">Compartido (Paradas predefinidas)</option>
                    <option value="PRIVADO">Privado (Dirección exacta)</option>
                  </select>
                </div>

                {tipoViaje === 'COMPARTIDO' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Viaje Programado</label>
                    <select
                      {...register('idViaje', {
                        onChange: (e) => handleViajeSelect(e.target.value),
                      })}
                      className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                    >
                      <option value="">Seleccione un viaje...</option>
                      {viajesCompartidosDisponibles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.rutaNombre || (v.origen && v.destino ? `${v.origen} ➔ ${v.destino}` : `Viaje #${v.id.slice(0, 5)}`)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {tipoViaje === 'PRIVADO' ? (
                  <div className="grid grid-cols-1 gap-3">
                    <InputAutocompleteGeo
                      label="Origen Exacto / Localidad"
                      placeholder="Ej: Rosario, Santa Fe"
                      value={origenSeleccionado || ''}
                      onChangeText={(val) => setValue('origen', val)}
                      onSeleccionarCoordenada={(coords) => setCoordsOrigen(coords)}
                      error={errors.origen?.message}
                    />
                    <InputAutocompleteGeo
                      label="Destino Exacto / Localidad"
                      placeholder="Ej: Córdoba, Córdoba"
                      value={destinoSeleccionado || ''}
                      onChangeText={(val) => setValue('destino', val)}
                      onSeleccionarCoordenada={(coords) => setCoordsDestino(coords)}
                      error={errors.destino?.message}
                    />
                    {distanciaKm !== null && (
                      <div className="p-2 bg-amber-50 border border-amber-200 rounded-md text-xs font-semibold text-amber-800 flex justify-between items-center">
                        <span>Distancia estimada:</span>
                        <span className="text-sm font-bold text-amber-900">{distanciaKm} km</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">Origen (Punto de subida)</label>
                      <select
                        {...register('origen')}
                        disabled={!idViajeSeleccionado || origenesDisponibles.length === 0}
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white disabled:bg-slate-100"
                      >
                        <option value="">{!idViajeSeleccionado ? 'Seleccione un viaje primero' : '-- Seleccione Parada Origen --'}</option>
                        {origenesDisponibles.map((p, idx) => {
                          const nombreParada = typeof p === 'object' && p !== null && 'nombre' in p 
                            ? String((p as { nombre: unknown }).nombre) 
                            : String(p);
                          return <option key={idx} value={nombreParada}>{nombreParada}</option>;
                        })}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">Destino (Punto de bajada)</label>
                      <select
                        {...register('destino')}
                        disabled={!origenSeleccionado || destinosDisponibles.length === 0}
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white disabled:bg-slate-100"
                      >
                        <option value="">{!origenSeleccionado ? 'Seleccione un origen primero' : '-- Seleccione Parada Destino --'}</option>
                        {destinosDisponibles.map((p, idx) => {
                          const nombreParada = typeof p === 'object' && p !== null && 'nombre' in p 
                            ? String((p as { nombre: unknown }).nombre) 
                            : String(p);
                          return <option key={idx} value={nombreParada}>{nombreParada}</option>;
                        })}
                      </select>
                    </div>
                  </div>
                )}

                {user?.rol === 'ADMIN' && (
                  <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-md space-y-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-slate-700">Cliente Titular (Admin)</label>
                      <select
                        {...register('idCliente', {
                          onChange: (e) => handleClienteSelect(e.target.value),
                        })}
                        className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                      >
                        <option value="">Seleccione un cliente registrado...</option>
                        {clientes.map((c, indx) => (
                          <option key={c.id || c.idUsuario || indx} value={c.id || c.idUsuario}>
                            {c.nombre} {c.apellido} ({c.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Fecha y Hora de Inicio */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Fecha y Hora de Inicio</label>
                    <div className="relative flex items-center">
                      <input
                        type="datetime-local"
                        value={fechaInicio}
                        disabled={tipoViaje === 'COMPARTIDO'}
                        onChange={(e) => setFechaInicioPrivada(e.target.value)}
                        id="input-fecha-inicio-reserva"
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md text-sm bg-white disabled:bg-slate-100 outline-none focus:ring-2 focus:ring-amber-400"
                      />
                      <button
                        type="button"
                        disabled={tipoViaje === 'COMPARTIDO'}
                        onClick={() => {
                          const input = document.getElementById('input-fecha-inicio-reserva') as HTMLInputElement;
                          if (input && typeof input.showPicker === 'function') {
                            input.showPicker();
                          }
                        }}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 disabled:opacity-40"
                      >
                        <Calendar className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Fecha y Hora de Fin */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Fecha y Hora de Fin</label>
                    <div className="relative flex items-center">
                      <input
                        type="datetime-local"
                        value={fechaFin}
                        disabled={true}
                        className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md text-sm bg-slate-100 cursor-not-allowed outline-none"
                      />
                      <div className="absolute right-3 text-slate-300">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-3">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Datos del Pasajero</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Input label="Nombre" error={errors.pasajeroNombre?.message} {...register('pasajeroNombre')} />
                    <Input label="Apellido" error={errors.pasajeroApellido?.message} {...register('pasajeroApellido')} />
                  </div>
                  <Input label="DNI / Documento" error={errors.pasajeroDni?.message} {...register('pasajeroDni')} />
                  {tipoReservaActual === 'INVITADO' && (
                    <>
                      <Input type="email" label="Email" error={errors.pasajeroEmail?.message} {...register('pasajeroEmail')} />
                      <Input label="Teléfono" error={errors.pasajeroTelefono?.message} {...register('pasajeroTelefono')} />
                    </>
                  )}
                </div>

                <div className="border-t border-slate-200 pt-4 grid grid-cols-3 gap-3 items-start">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Pasajeros (Máx: {limitePasajeros})</label>
                    <input
                      type="number"
                      min={1}
                      max={limitePasajeros}
                      {...register('asiento', { valueAsNumber: true })}
                      className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Valijas (Máx: {limiteValijas})</label>
                    <input
                      type="number"
                      min={0}
                      max={limiteValijas}
                      {...register('cantValijas', { valueAsNumber: true })}
                      className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Precio Total</label>
                    <div className="relative flex items-center w-full h-10 bg-slate-50 border border-slate-300 rounded-md overflow-hidden">
                      <span className="pl-3 pr-1.5 text-sm font-semibold text-slate-400 select-none">$</span>
                      <input
                        type="number"
                        {...register('precioFinal', { valueAsNumber: true })}
                        className="w-full h-full pr-3 py-2 bg-transparent text-sm font-semibold text-slate-800 outline-none"
                        readOnly
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCancelarEdicion}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <Button type="submit" isLoading={isSubmitting}>
                    {modoEdicion ? 'Guardar Cambios' : 'Confirmar Reserva'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservasPage;