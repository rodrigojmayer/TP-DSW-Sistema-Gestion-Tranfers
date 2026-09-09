export type RolUsuario = 'ADMIN' | 'CLIENTE' | 'OPERADOR' | 'CHOFER';


export interface Usuario {
  idUsuario: string;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  dni?: string; // <-- Propiedad agregada (opcional)
  telefono?: string;
  rol: RolUsuario;
  // Campos exclusivos para Choferes (opcionales)
    nroLicencia?: string;
    vencimientoLicencia?: string;
}



export interface Pasajero {
  idPasajero: string;
  nombre: string;
  apellido: string;
  dni: string;
  idReserva?: string; // Para saber a qué reserva pertenece
}

// --- VEHÍCULOS Y AGENDA ---
export interface ModeloVehiculo {
  idModelo: string | number;
  marca: string;
  modelo: string;
  tipo: string;
  precioKm: number;
  capacidadPasajeros: number;
  capacidadValijas: number;
}

export interface Vehiculo {
  idVehiculo: string | number;
  // Relación 0..N a 1
  modeloVehiculo?: ModeloVehiculo;
}

export interface AgendaVehiculo {
  idAgenda: string | number;
  fechaHoraInicio: Date | string; // string si usas ISO strings (ej: '2023-10-12T10:00:00Z')
  fechaHoraFin: Date | string;
  tipo: string;
  // Relación 0..N a 1
  vehiculo?: Vehiculo;
}

// --- RUTAS (Para viajes compartidos) ---
export interface PuntoRuta {
  idPunto: string | number;
  direccion: string;
  orden: number;
}

export interface Ruta {
  idRuta: string | number;
  nombre: string;
  // Relación 1 a 2..N
  puntosRuta?: PuntoRuta[];
}
export interface Viaje {
  idViaje: string;
  idRuta: string;
  idChofer: string;
  fechaHoraSalida: string;
  precio: number;
  estado: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
}

// --- RESERVAS (Herencia) ---
export interface ReservaViajeBase {
  idViaje: string | number;
  origen: string;
  destino: string;
  fechaHoraInicio: Date | string;
  fechaHoraFin: Date | string;
  cantPasajeros: number;
  cantValijas: number;
  habilitado: boolean;
  precio: number;
  pagoAbonado: boolean;

  // Relaciones
  usuario?: Usuario;
  agendaVehiculo?: AgendaVehiculo;
}

export interface ReservaPrivado extends ReservaViajeBase {
  tipoViaje: 'PRIVADO';
}

export interface ReservaCompartido extends ReservaViajeBase {
  tipoViaje: 'COMPARTIDO';
  descuento: number;
  // Relación 1 a 1 específica de Compartido
  ruta?: Ruta;
}

// Tipo global exportable que el frontend usará para evaluar la UI
export type ReservaViaje = ReservaPrivado | ReservaCompartido;

// export type EstadoReserva = 'RESERVADO' | 'PAGADO' | 'CANCELADO';

// export interface Reserva {
//   idReserva: string;
//   idViaje: string;
//   idPasajero: string;
//   asiento: number;
//   precioFinal: number;
//   estado: EstadoReserva;
//   fechaReserva: string;
// }

// modificado usuario logueado y sin loguear


export type EstadoReserva = 'RESERVADO' | 'PAGADO' | 'CANCELADO';

export interface PasajeroDatos {
  nombre: string;
  apellido: string;
  dni: string;
  email: string;
  telefono: string;
}

export interface Reserva {
  idReserva: string;
  idViaje: string;
  tipoReserva: 'LOGUEADO' | 'INVITADO';
  idCliente?: string; // Presente solo si el cliente estaba autenticado
  pasajero: PasajeroDatos; // Datos finales de la persona que se sube al vehículo
  asiento: number;
  precioFinal: number;
  estado: EstadoReserva;
  fechaReserva: string;
}