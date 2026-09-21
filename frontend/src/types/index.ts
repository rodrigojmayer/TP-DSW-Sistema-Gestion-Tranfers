export type RolUsuario = 'ADMIN' | 'CLIENTE' | 'OPERADOR' | 'CHOFER';

export interface UsuarioBackend {
  id: string;
  usuario: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  telefono?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Usuario = Omit<UsuarioBackend, 'id'> & {
  idUsuario: string;
  id?: string; // Permite p.id sin romper la firma de MikroORM
  dni?: string;
  nroLicencia?: string;
  vencimientoLicencia?: string;
};

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
export interface PuntoRutaBackend {
  id?: string;
  orden: number;
  idPunto?: string;
  direccion?: string;
  punto?: Punto;
}
export type PuntoRuta = Omit<PuntoRutaBackend, 'id'> & {
  idPuntoRuta?: string;
  id?: string;
}

export interface PuntoRutaInput {
  idPunto: string;
  orden: number;
}

export interface RutaBackend {
  id: string;
  nombre: string;
  puntosRuta?: PuntoRuta[]; 
  puntos?: PuntoRuta[];    
  origen: string; 
  destino: string; 
  createdAt?: string;
  updatedAt?: string;
}

export type Ruta = Omit<RutaBackend, 'id'> & {
  idRuta: string;
};

export interface PuntoBackend {
  id: string;
  nombre: string;
  direccion: string;
  tipo: TipoPunto; // o tu TipoPunto si lo tenés exportado
  latitud: string;
  longitud: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Punto = Omit<PuntoBackend, 'id'> & {
    idPunto: string;
    id?: string;
};

export type TipoPunto = 'Terminal' | 'Punto Intermedio' | 'Aeropuerto';

export interface CrearRutaInput {
    nombre: string;
    puntos: {
        idPunto: string;
        orden: number;
    }[];
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