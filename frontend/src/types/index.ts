export type RolUsuario = 'ADMIN' | 'CLIENTE' | 'OPERADOR' | 'CHOFER';

export interface UsuarioBackend {
  id: string;
  usuario: string;
  password: string;
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
  id?: string; 
  dni?: string;
  nroLicencia?: string;
  vencimientoLicencia?: string;
};

export interface Pasajero {
  idPasajero: string;
  nombre: string;
  apellido: string;
  dni: string;
  idReserva?: string; 
}


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
  ruta_id?: string;
  punto_id?: string;
  orden: number;
  nombre?: string;
  // Relación populada desde el backend con la tabla 'punto'
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

export interface PuntoBackend {
  id: string;
  nombre: string;
  direccion: string;
  tipo: TipoPunto;
  latitud: string;
  longitud: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrearRutaInput {
    nombre: string;
    puntos: {
        idPunto: string;
        orden: number;
    }[];
}

// --- VIAJES ---
export interface ViajeBackend {
  id: string;
  tipo: 'COMPARTIDO' | 'PRIVADO';
  fechaHoraInicio: string;
  fechaHoraFin?: string;
  capacidadPasajeros: number;
  capacidadValijas: number;
  precioBase: number;
  ruta?: {
    id: string;
    nombre: string;
  } | string;
  // AGREGAR ESTAS DOS PROPIEDADES:
  idChofer?: string;
  chofer?: {
    id: string;
    nombre?: string;
    apellido?: string;
    email?: string;
  } | string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Parada {
  id?: string;
  nombre: string;
}

export interface Viaje {
  id: string;
  idRuta?: string;
  idChofer?: string;
  fechaHoraSalida: string;
  fechaHoraLlegada?: string;
  precio: number;
  estado?: 'PROGRAMADO' | 'EN_CURSO' | 'FINALIZADO' | 'CANCELADO';
  capacidadPasajeros?: number;
  capacidadValijas?: number;
  rutaNombre?: string;
  // estado: string;
  tipo?: 'COMPARTIDO' | 'PRIVADO';
  origen?: string;
  destino?: string;
  fechaHora?: string; 
  punto_ruta?: PuntoRuta[];
  chofer?: {
    id: string;
    nombre?: string;
    apellido?: string;
    email?: string;
  } | string; 
  // paradas?: Parada[];
  paradas?: Array<{ nombre: string } | string>;
  // AGREGAR ESTA PROPIEDAD POBLADA:
  ruta?: RutaBackend;
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
    nombre?: string;
    apellido?: string;
    dni?: string;
    email?: string;
    telefono?: string;
}

export interface Reserva {
  id: string;
  usuario: Usuario | string;
  viaje: Viaje | string;
  origen: string;
  destino: string;
  cantPasajeros: number;
  cantValijas: number;
  precio: number;
  pagoAbonado: boolean;
  habilitado: boolean;
  createdAt?: string | Date;
}

export interface OcupacionReserva {
  id: string;
  origen: string;
  destino: string;
  cantPasajeros: number;
  cantValijas: number;
}