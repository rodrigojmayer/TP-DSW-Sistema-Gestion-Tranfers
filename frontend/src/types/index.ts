
export type RolUsuario = 'ADMIN' | 'CLIENTE' | 'OPERADOR' | 'CHOFER';


// --- USUARIO ---
export interface Usuario {
  idUsuario: string | number;
  usuario: string;
  // password: string; -> Normalmente no viaja al frontend por seguridad
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: string;
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
