import { useEffect, useState, useMemo } from 'react';
import { useForm, useWatch, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { crearReservaSchema, type ReservaFormData } from '../schemas/reservaSchema';
import { reservaService } from '../api/reservaService';
import { viajeService } from '../../viajes/api/viajeService';
import { usuarioService } from '../../usuarios/api/usuarioService';
import { useAuthStore } from '../../../store/authStore';
import type { Reserva, Viaje, Usuario, Ruta } from '../../../types';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { rutaService } from '../../rutas/api/rutaService';
import { InputAutocompleteGeo } from '../../../components/ui/InputAutocompleteGeo';
import { calcularDistanciaHaversine, type Coordenada } from '../../../services/geoService';

export const ReservasPage = () => {
  const user = useAuthStore((state) => state.user);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [todasLasReservasViaje, setTodasLasReservasViaje] = useState<Reserva[]>([]);
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [rutas, setRutas] = useState<Ruta[]>([]);

  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState<string | null>(null);
  const estaLogueado = Boolean(user);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ReservaFormData>({
    resolver: zodResolver(
      crearReservaSchema,
    ) as unknown as Resolver<ReservaFormData>,
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

  // Observamos los cambios en tiempo real
  const tipoReservaActual = useWatch({ control, name: 'tipoReserva' });
  const tipoViaje = useWatch({ control, name: 'tipoViaje' });
  const idViajeSeleccionado = useWatch({ control, name: 'idViaje' });
  const origenSeleccionado = useWatch({ control, name: 'origen' });
  const destinoSeleccionado = useWatch({ control, name: 'destino'});
  const asientoIngresado = useWatch({ control, name: 'asiento' }) || 1;
  const valijasIngresadas = useWatch({ control, name: 'cantValijas' }) || 0;
  const [coordsOrigen, setCoordsOrigen] = useState<Coordenada | null>(null);
  const [coordsDestino, setCoordsDestino] = useState<Coordenada | null>(null);
  // const [distanciaKm, setDistanciaKm] = useState<number | null>(null);

  // 1. Obtener el objeto completo del viaje seleccionado
  const viajeSeleccionado = useMemo(() => {
    return viajes.find((v) => v.id === idViajeSeleccionado);
  }, [viajes, idViajeSeleccionado]);

  // 2. Extraer y normalizar todas las paradas en un arreglo de strings
  const listaParadas = useMemo(() => {

    if (!viajeSeleccionado || !viajeSeleccionado.idRuta) return [];

    // 1. Buscamos el arreglo de punto_ruta dentro del viaje o dentro de la ruta
    const rutaEncontrada = rutas.find((r) => r.idRuta === viajeSeleccionado.idRuta);

    if (!rutaEncontrada) return [];

    const puntosRuta = rutaEncontrada.puntos || [];

    if (!Array.isArray(puntosRuta) || puntosRuta.length === 0) return [];
    
    // 2. Ordenamos por la columna 'orden' que tenés en la base de datos
    const paradasOrdenadas = [...puntosRuta].sort((a, b) => {
      const ordenA = a.orden ?? 0;
      const ordenB = b.orden ?? 0;
      return ordenA - ordenB;
    });

    // 3. Extraemos el nombre desde la relación con la tabla 'punto'
    return paradasOrdenadas
      .map((item) => {
        // Si viene plano en el objeto (como muestra tu consola) o dentro de 'punto'
        return item.nombre || item.punto?.nombre || '';
      })
      .filter((nombre): nombre is string => Boolean(nombre) && nombre.trim() !== '');
  }, [viajeSeleccionado]);

  // 3. Orígenes disponibles: Todas las paradas menos la ÚLTIMA
  const origenesDisponibles = useMemo(() => {
    if (tipoViaje !== 'COMPARTIDO' || listaParadas.length === 0) return [];
    return listaParadas.slice(0, -1);
  }, [tipoViaje, listaParadas]);

  // 4. Destinos disponibles: Solo las paradas POSTERIORES a la parada de Origen seleccionada
  const destinosDisponibles = useMemo(() => {
    if (tipoViaje !== 'COMPARTIDO' || !origenSeleccionado || listaParadas.length === 0) {
      return [];
    }
    const idxOrigen = listaParadas.indexOf(origenSeleccionado);
    if (idxOrigen === -1) return [];

    return listaParadas.slice(idxOrigen + 1);
  }, [tipoViaje, origenSeleccionado, listaParadas]);

  // Efecto para sincronizar la sesión del usuario con las variables de formulario
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

//   useEffect(() => {
//   if (idViajeSeleccionado) {
//     reservaService.obtenerPorViaje(idViajeSeleccionado) // Endpoint backend para traer reservas de un viaje
//       .then((data) => setTodasLasReservasViaje(data))
//       .catch(() => setTodasLasReservasViaje([]));
//   } else {
//     setTodasLasReservasViaje([]);
//   }
// }, [idViajeSeleccionado]);
  useEffect(() => {
    let cancelado = false;

    if (idViajeSeleccionado) {
      reservaService
        .obtenerPorViaje(idViajeSeleccionado)
        .then((data) => {
          if (!cancelado) {
            setTodasLasReservasViaje(data);
          }
        })
        .catch(() => {
          if (!cancelado) {
            setTodasLasReservasViaje([]);
          }
        });
    }

    return () => {
      cancelado = true;
    };
  }, [idViajeSeleccionado]);

  // Resetear origen y destino al cambiar de viaje o de tipo de viaje
  useEffect(() => {
    setValue('origen', '');
    setValue('destino', '');
  }, [idViajeSeleccionado, tipoViaje, setValue]);

  // useEffect(() => {
  //   if (viajeSeleccionado) {
  //     const precioUnitario = viajeSeleccionado.precio || 0;
  //     setValue('precioFinal', precioUnitario * asientoIngresado);
  //   }
  // }, [viajeSeleccionado, asientoIngresado, setValue]);

  useEffect(() => {

    // Calculamos la equivalencia de ocupación (cada valija es el 50% de un pasajero)
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

    // Si no hay viaje seleccionado o el precio no existe, reseteamos a 0
    if (!viajeSeleccionado || !viajeSeleccionado.precio) {
      setValue('precioFinal', 0);
      return;
    }

    const precioBase = viajeSeleccionado.precio;
    // Si no hay paradas seleccionadas, cobramos el viaje completo
    if (
      !origenSeleccionado ||
      !destinoSeleccionado ||
      listaParadas.length < 2
    ) {
      const totalPrivado = precioBase * pasajerosEquivalentes;
      setValue('precioFinal', totalPrivado);
      return;
    }

    // Para viaje COMPARTIDO: obtenemos los índices del trayecto
    const idxOrigen = listaParadas.indexOf(origenSeleccionado);
    const idxDestino = listaParadas.indexOf(destinoSeleccionado);

    if (idxOrigen !== -1 && idxDestino !== -1 && idxDestino > idxOrigen) {
      const totalTramosViaje = listaParadas.length - 1; // Ej: 5 paradas = 4 tramos
      const tramosRecorridos = idxDestino - idxOrigen;  // Ej: A (0) -> C (2) = 2 tramos

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

  // Reset del destino al cambiar el origen en viaje compartido
  useEffect(() => {
    if (tipoViaje === 'COMPARTIDO') {
      setValue('destino', '');
    }
  }, [origenSeleccionado, tipoViaje, setValue]);

  const obtenerViajesSegunRol = async (): Promise<Viaje[]> => {
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
  };

  const obtenerReservasSegunRol = async (): Promise<Reserva[]> => {
    if (!estaLogueado || !user?.id) return [];
    
    if (user.rol === 'ADMIN') {
      return await reservaService.obtenerTodas().catch(() => []);
    }
    
    // Al usar user.id después de la verificación !user?.id, 
    // TypeScript reconoce que id es de tipo string
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
          (v) => !v.estado || v.estado.toUpperCase() === 'PROGRAMADO'
        )
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


  // Calculamos el límite máximo disponible según el origen y destino seleccionados
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

    // 1. Obtener los sub-tramos que recorre la nueva reserva (ej: Rosario -> San Nicolás -> CABA)
    const tramosRecorridos = [];
    for (let i = idxOrigen; i < idxDestino; i++) {
      tramosRecorridos.push({
        desdeIdx: i,
        hastaIdx: i + 1,
      });
    }

    // // 2. Filtrar reservas activas de este viaje (excluyendo la que estamos editando)
    // const reservasActivas = reservas.filter((r) => {
    //   const idViajeReserva = typeof r.viaje === 'object' && r.viaje !== null ? r.viaje.id : r.viaje;
    //   const esMismaReserva = modoEdicion && r.id === idEdicion;
    //   return idViajeReserva === viajeSeleccionado.id && !esMismaReserva;
    // });
    // ✅ AHORA (usa 'todasLasReservasViaje'):
    const reservasActivas = todasLasReservasViaje.filter((r) => {
      const idViajeReserva = typeof r.viaje === 'object' && r.viaje !== null ? r.viaje.id : r.viaje;
      const esMismaReserva = modoEdicion && r.id === idEdicion;
      return idViajeReserva === viajeSeleccionado.id && !esMismaReserva;
    });
    
    // 3. Para cada tramo de la ruta, sumar pasajeros ocupados por reservas que se solapan
    let maxPasajerosPermitidos = capacidadTotal;

    tramosRecorridos.forEach((tramo) => {
      let ocupadosEnTramo = 0;

      reservasActivas.forEach((res) => {
        const resIdxOrigen = listaParadas.indexOf(res.origen);
        const resIdxDestino = listaParadas.indexOf(res.destino);

        // Si la reserva existente se solapa con el tramo actual
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

  // Guardamos el máximo actual en una variable simple
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

    // 1. Sub-tramos recorridos
    const tramosRecorridos = [];
    for (let i = idxOrigen; i < idxDestino; i++) {
      tramosRecorridos.push({
        desdeIdx: i,
        hastaIdx: i + 1,
      });
    }

  //   // 2. Filtrar reservas activas (excluyendo la reserva en edición)
  //   reservaService.obtenerPorViaje(idViajeSeleccionado)
  // .then((data) => setTodasLasReservasViaje(data));

  const reservasActivas = todasLasReservasViaje.filter((r) => {
    const idViajeReserva = typeof r.viaje === 'object' && r.viaje !== null ? r.viaje.id : r.viaje;
    const esMismaReserva = modoEdicion && r.id === idEdicion;
    return idViajeReserva === viajeSeleccionado.id && !esMismaReserva;
  });

    // 3. Sumar valijas ocupadas por tramo
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

  // Control de límites para Valijas
  useEffect(() => {
    if (valijasIngresadas < 0) {
      setValue('cantValijas', 0);
    } else if (valijasIngresadas > limiteValijas && limiteValijas >= 0) {
      setValue('cantValijas', limiteValijas);
    }
  }, [limiteValijas, valijasIngresadas, setValue]);

  useEffect(() => {
    let isMounted = true;

    const cargarDatosIniciales = async () => {
      try {
        const resPromise = estaLogueado
          ? reservaService.obtenerTodas().catch(() => [])
          : Promise.resolve([]);

        const [resData, viajesData] = await Promise.all([
          resPromise,
          obtenerViajesSegunRol(),
        ]);

        const rutasData = await rutaService.obtenerTodas().catch(() => []);
        setRutas(rutasData);

        console.log('Estructura del objeto Viaje:', viajesData[0]);

        let usuariosData: Usuario[] = [];
        if (user?.rol === 'ADMIN') {
          usuariosData = await usuarioService.obtenerTodos().catch(() => []);
        }

        if (isMounted) {
          setReservas(resData);
          // setViajes(viajesData.filter((v) => v.estado === 'PROGRAMADO'));
          setViajes(viajesData);
          if (user?.rol === 'ADMIN') {
            setClientes(usuariosData.filter((u) => u.rol === 'CLIENTE'));
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error al cargar datos iniciales:', error);
        }
      } finally {
        if (isMounted) {
          setCargando(false);
        }
      }
    };

    cargarDatosIniciales();

    return () => {
      isMounted = false;
    };
  }, [user, estaLogueado]);

  // useEffect(() => {
  //   if (asientoIngresado < 1) {
  //     setValue('asiento', 1);
  //   } else if (asientoIngresado > maxAsientosDisponibles && maxAsientosDisponibles > 1) {
  //     setValue('asiento', maxAsientosDisponibles);
  //   }
  // }, [maxAsientosDisponibles, asientoIngresado, setValue]);

  // useEffect(() => {
  //   if (valijasIngresadas < 0) {
  //     setValue('cantValijas', 0);
  //   } else if (valijasIngresadas > maxValijasDisponibles) {
  //     setValue('cantValijas', maxValijasDisponibles);
  //   }
  // }, [maxValijasDisponibles, valijasIngresadas, setValue]);

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

  const handleEditar = (reserva: Reserva) => {
    setModoEdicion(true);
    setIdEdicion(reserva.id);

    const viajeId =
      typeof reserva.viaje === 'object' && reserva.viaje !== null
        ? reserva.viaje.id
        : reserva.viaje || '';
    const clienteId =
      typeof reserva.usuario === 'object' && reserva.usuario !== null
        ? reserva.usuario.id || reserva.usuario.idUsuario
        : reserva.usuario || '';

    const tipoReservaCalculado = clienteId ? 'LOGUEADO' : 'INVITADO';

    if (tipoReservaCalculado === 'LOGUEADO') {
      reset({
        tipoReserva: 'LOGUEADO',
        tipoViaje:
          'tipoViaje' in reserva && typeof reserva.tipoViaje === 'string'
            ? (reserva.tipoViaje as ReservaFormData['tipoViaje'])
            : 'COMPARTIDO',
        idViaje: viajeId,
        idCliente: clienteId,
        origen: reserva.origen || '',
        destino: reserva.destino || '',
        asiento: reserva.cantPasajeros || 1,
        cantValijas: reserva.cantValijas || 0,
        precioFinal: reserva.precio || 0,
        pasajeroNombre:
          typeof reserva.usuario === 'object' ? reserva.usuario?.nombre || '' : '',
        pasajeroApellido:
          typeof reserva.usuario === 'object' ? reserva.usuario?.apellido || '' : '',
        pasajeroDni:
          typeof reserva.usuario === 'object' ? reserva.usuario?.dni || '' : '',
        pasajeroEmail:
          typeof reserva.usuario === 'object' ? reserva.usuario?.email || '' : '',
        pasajeroTelefono:
          typeof reserva.usuario === 'object' ? reserva.usuario?.telefono || '' : '',
      });
      } else {
      reset({
        tipoReserva: 'INVITADO',
        tipoViaje:
          'tipoViaje' in reserva && typeof reserva.tipoViaje === 'string'
            ? (reserva.tipoViaje as ReservaFormData['tipoViaje'])
            : 'COMPARTIDO',
        idViaje: viajeId,
        idCliente: '',
        origen: reserva.origen || '',
        destino: reserva.destino || '',
        asiento: reserva.cantPasajeros || 1,
        cantValijas: reserva.cantValijas || 0,
        precioFinal: reserva.precio || 0,
        pasajeroNombre:
          typeof reserva.usuario === 'object' ? reserva.usuario?.nombre || '' : '',
        pasajeroApellido:
          typeof reserva.usuario === 'object' ? reserva.usuario?.apellido || '' : '',
        pasajeroDni:
          typeof reserva.usuario === 'object' ? reserva.usuario?.dni || '' : '',
        pasajeroEmail:
          typeof reserva.usuario === 'object' ? reserva.usuario?.email || '' : '',
        pasajeroTelefono:
          typeof reserva.usuario === 'object' ? reserva.usuario?.telefono || '' : '',
      });
    }
  };

  const handleCancelarEdicion = () => {
    setModoEdicion(false);
    setIdEdicion(null);

    const esUserLogueado = Boolean(user);

    if (esUserLogueado) {
      reset({
        tipoReserva: 'LOGUEADO',
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
    } else {
      reset({
        tipoReserva: 'INVITADO',
        tipoViaje: 'COMPARTIDO',
        idViaje: '',
        origen: '',
        destino: '',
        idCliente: '',
        asiento: 1,
        cantValijas: 0,
        precioFinal: 0,
        pasajeroNombre: '',
        pasajeroApellido: '',
        pasajeroDni: '',
        pasajeroEmail: '',
        pasajeroTelefono: '',
      });
    }
  };

  const onSubmit = async (data: ReservaFormData) => {
    try {
      
      const cantPasajerosSolicitados = Number(data.asiento) || 1;
      const cantValijasSolicitadas = Number(data.cantValijas) || 0;
      
      // Validar el límite calculado para el tramo
      if (cantPasajerosSolicitados > maxAsientosDisponibles) {
        alert(
          `No es posible realizar la reserva. El límite de asientos disponibles para este tramo es ${maxAsientosDisponibles}.`
        );
        return;
      }
      if (cantValijasSolicitadas > maxValijasDisponibles) {
        alert(
          `No es posible realizar la reserva. El límite de valijas permitidas para este tramo es ${maxValijasDisponibles}.`
        );
        return;
      }
    
      const idClienteValido =
        data.tipoReserva === 'LOGUEADO'
          ? data.idCliente || user?.id || ''
          : '';

      const payload = {
        ...data,
        idCliente: idClienteValido,
        precio: data.precioFinal,
        origen: data.origen,  
        destino: data.destino,
        cantPasajeros: cantPasajerosSolicitados,
        cantValijas: cantValijasSolicitadas,
      };


      if (modoEdicion && idEdicion) {
        await reservaService.actualizar(idEdicion, payload);
        handleCancelarEdicion();
      } else {
        await reservaService.crear(payload);
        handleCancelarEdicion();
      }

      await refrescarDatos();
      if (idViajeSeleccionado) {
        const data = await reservaService.obtenerPorViaje(idViajeSeleccionado).catch(() => []);
        setTodasLasReservasViaje(data);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error al guardar la reserva:', error.message);
        alert(`Error al guardar la reserva: ${error.message}`);
      } else {
        console.error('Error desconocido:', error);
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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* COLUMNA IZQUIERDA: FORMULARIO */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm h-fit space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">
            {modoEdicion ? 'Editar Reserva' : 'Nueva Reserva Transfer'}
          </h2>
          {modoEdicion && (
            <button
              type="button"
              onClick={handleCancelarEdicion}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
            >
              Cancelar Edición
            </button>
          )}
        </div>

        {/* Indicador de Estado de Sesión */}
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-600">
          Modo actual:{' '}
          <span className="font-bold text-amber-600">
            {estaLogueado
              ? `${user?.rol === 'ADMIN' ? 'Administrador' : 'Cliente Registrado'} (${user?.nombre} ${user?.apellido})`
              : 'Invitado Express'}
          </span>
        </div>

        <form 
          onSubmit={handleSubmit(onSubmit, (validationErrors) => {
            console.warn('Errores de validación en el formulario:', validationErrors);
          })} 
          className="space-y-4"
        >
          {/* Seleccionar Tipo de Viaje */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Tipo de Viaje
            </label>
            <select
              {...register('tipoViaje')}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
            >
              <option value="COMPARTIDO">Compartido (Paradas predefinidas)</option>
              <option value="PRIVADO">Privado (Dirección exacta)</option>
            </select>
            {errors.tipoViaje && (
              <span className="text-xs text-red-500">{errors.tipoViaje.message}</span>
            )}
          </div>

          {/* Selección de Viaje */}
          {tipoViaje === 'COMPARTIDO' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Viaje Programado
              </label>
              <select
                {...register('idViaje', {
                  onChange: (e) => handleViajeSelect(e.target.value),
                })}
                className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
              >
                <option value="">Seleccione un viaje...</option>
                {viajes.map((v) => {
                  const nombreEtiqueta =
                    v.rutaNombre ||
                    (v.origen && v.destino
                      ? `${v.origen} ➔ ${v.destino}`
                      : `Viaje #${v.id.slice(0, 5)}`);

                  const fechaSalida = v.fechaHoraSalida || v.fechaHora;

                  return (
                    <option key={v.id} value={v.id}>
                      {nombreEtiqueta}{' '}
                      {fechaSalida ? `(${new Date(fechaSalida).toLocaleString()})` : ''}
                    </option>
                  );
                })}
              </select>
              {errors.idViaje && (
                <span className="text-xs text-red-500">
                  {errors.idViaje.message}
                </span>
              )}
            </div>
          )}

          {/* ORIGEN Y DESTINO DINÁMICOS */}
          {tipoViaje === 'PRIVADO' ? (
            <div className="grid grid-cols-1 gap-3">
              {/* <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Dirección Exacta de Origen</label>
                <input 
                  type="text" 
                  placeholder="Ej: Av. San Martín 1234, Piso 2" 
                  {...register('origen')} 
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                />
                {errors.origen && <span className="text-xs text-red-500">{errors.origen.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Dirección Exacta de Destino</label>
                <input 
                  type="text" 
                  placeholder="Ej: Aeropuerto Ezeiza, Terminal A" 
                  {...register('destino')} 
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
                />
                {errors.destino && <span className="text-xs text-red-500">{errors.destino.message}</span>}
              </div> */}
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
                  <span>Distancia estimada del trayecto:</span>
                  <span className="text-sm font-bold text-amber-900">{distanciaKm} km</span>
                </div>
              )}
            </div>
          ) : (
            /* VISTA PARA VIAJE COMPARTIDO */
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Origen (Punto de subida)</label>
                <select 
                  {...register('origen')} 
                  disabled={!idViajeSeleccionado || origenesDisponibles.length === 0}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none disabled:bg-slate-100"
                >
                  <option value="">
                    {!idViajeSeleccionado ? 'Seleccione un viaje primero' : '-- Seleccione Parada Origen --'}
                  </option>
                  {origenesDisponibles.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
                {errors.origen && <span className="text-xs text-red-500">{errors.origen.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">Destino (Punto de bajada)</label>
                <select 
                  {...register('destino')} 
                  disabled={!origenSeleccionado || destinosDisponibles.length === 0}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none disabled:bg-slate-100"
                >
                  <option value="">
                    {!origenSeleccionado ? 'Seleccione un origen primero' : '-- Seleccione Parada Destino --'}
                  </option>
                  {destinosDisponibles.map((p, idx) => (
                    <option key={idx} value={p}>{p}</option>
                  ))}
                </select>
                {errors.destino && <span className="text-xs text-red-500">{errors.destino.message}</span>}
              </div>
            </div>
          )}

          {/* ADMIN: Selección de Cliente Titular */}
          {user?.rol === 'ADMIN' && (
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-md space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700">
                  Cliente Titular (Admin)
                </label>
                <select
                  {...register('idCliente', {
                    onChange: (e) => handleClienteSelect(e.target.value),
                  })}
                  className="px-3 py-2 border border-slate-300 rounded-md text-sm bg-white outline-none focus:ring-2 focus:ring-amber-400"
                >
                  <option value="">Seleccione un cliente registrado...</option>
                  {clientes.map((c, indx) => (
                    <option key={c.id || c.idUsuario || indx} value={c.id || c.idUsuario}>
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

            {/* INVITADO: Contacto */}
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

          <div className="border-t border-slate-200 pt-4 grid grid-cols-3 gap-3 items-start">
            {/* Cantidad Pasajeros */}
            <div className="relative flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 min-h-5 flex items-center justify-between">
                <span>Pasajeros</span>
                <span className="text-xs text-amber-600 font-bold">
                  (Máx: {limitePasajeros})
                </span>
              </label>

              <input
                type="number"
                min={1}
                max={limitePasajeros}
                {...register('asiento', { valueAsNumber: true })}
                onInput={(e) => {
                  const el = e.currentTarget;
                  if (Number(el.value) > limitePasajeros) el.value = String(limitePasajeros);
                  if (Number(el.value) < 1 && el.value !== '') el.value = '1';
                }}
                className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
              />

              {errors.asiento && (
                <span className="absolute -bottom-5 left-0 text-xs text-red-500 whitespace-nowrap">
                  {errors.asiento.message}
                </span>
              )}
            </div>

            {/* Cantidad de Valijas */}
            <div className="relative flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 min-h-5 flex items-center justify-between">
                <span>Valijas</span>
                <span className="text-xs text-amber-600 font-bold">
                  (Máx: {limiteValijas})
                </span>
              </label>

              <input
                type="number"
                min={0}
                max={limiteValijas}
                {...register('cantValijas', { valueAsNumber: true })}
                onInput={(e) => {
                  const el = e.currentTarget;
                  if (Number(el.value) > limiteValijas) el.value = String(limiteValijas);
                  if (Number(el.value) < 0 && el.value !== '') el.value = '0';
                }}
                className="w-full h-10 px-3 py-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-amber-400 outline-none"
              />

              {errors.cantValijas && (
                <span className="absolute -bottom-5 left-0 text-xs text-red-500 whitespace-nowrap">
                  {errors.cantValijas.message}
                </span>
              )}
            </div>

            {/* Precio Total */}
            <div className="relative flex flex-col gap-1">
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
                <span className="absolute -bottom-5 left-0 text-xs text-red-500 whitespace-nowrap">
                  {errors.precioFinal.message}
                </span>
              )}
            </div>
          </div>
          <div className="mt-10">
            <Button type="submit" isLoading={isSubmitting}>
              {modoEdicion ? 'Guardar Cambios' : 'Confirmar Reserva'}
            </Button>
          </div>
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
                {reservas.map((r) => {
                  const usuarioObj = typeof r.usuario === 'object' ? r.usuario : null;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {usuarioObj ? `${usuarioObj.nombre} ${usuarioObj.apellido}` : 'Invitado Express'}
                        <span className="block text-xs text-slate-400">
                          DNI: {usuarioObj?.dni || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs">
                        {usuarioObj?.email || 'N/A'}
                        <span className="block text-slate-400">
                          {usuarioObj?.telefono || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        {r.origen} ➔ {r.destino}
                      </td>

                      <td className="py-3 px-4 text-xs font-semibold text-slate-800">
                        {r.cantPasajeros} pas. / {r.cantValijas} val.
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-900">
                        ${r.precio}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            r.pagoAbonado
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {r.pagoAbonado ? 'ABONADO' : 'PENDIENTE'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleEditar(r)}
                          className="text-amber-600 hover:text-amber-800 text-xs font-semibold"
                        >
                          Editar
                        </button>
                        {r.habilitado && (
                          <button
                            onClick={() => handleCancelar(r.id)}
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
        )}
      </div>
    </div>
  );
};