
// simulacion backend

import type { Reserva } from '../../../types';
import type { ReservaFormData } from '../schemas/reservaSchema';

// Datos iniciales de prueba (Mock Data)
const STORAGE_KEY = 'transfers_app_reservas';

const obtenerReservasIniciales = (): Reserva[] => {
  const guardadas = localStorage.getItem(STORAGE_KEY);
  if (guardadas) {
    try {
      return JSON.parse(guardadas);
    } catch {
      // Si hay error al parsear, retorna datos por defecto
    }
  }
  
  // Datos mock por defecto si localStorage está vacío
  const iniciales: Reserva[] = [
    {
      idReserva: 'res-1',
      idViaje: 'viaje-1',
      tipoReserva: 'LOGUEADO',
      idCliente: 'cliente-1',
      pasajero: {
        nombre: 'Carlos',
        apellido: 'Gómez',
        dni: '35123456',
        email: 'carlos@mail.com',
        telefono: '341567890',
      },
      asiento: 4,
      precioFinal: 4500,
      estado: 'RESERVADO',
      fechaReserva: new Date().toISOString(),
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciales));
  return iniciales;
};

const guardarEnStorage = (reservas: Reserva[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reservas));
};

export const reservaService = {
  obtenerTodas: async (): Promise<Reserva[]> => {
    // Simulamos latencia de red de 300ms
    await new Promise((resolve) => setTimeout(resolve, 300));
    return obtenerReservasIniciales();
  },

  obtenerMisReservas: async (idUsuario: string): Promise<Reserva[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const reservas = obtenerReservasIniciales();
    return reservas.filter((r) => r.idCliente === idUsuario);
  },

  obtenerPorId: async (idReserva: string): Promise<Reserva> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const reservas = obtenerReservasIniciales();
    const encontrada = reservas.find((r) => r.idReserva === idReserva);
    if (!encontrada) throw new Error('Reserva no encontrada');
    return encontrada;
  },

  crear: async (data: ReservaFormData): Promise<Reserva> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const reservas = obtenerReservasIniciales();

    // Construimos la nueva reserva simulando lo que haría el backend
    const nuevaReserva: Reserva = {
      idReserva: `res-${Date.now()}`,
      idViaje: data.idViaje,
      idCliente: data.idCliente || undefined,
      tipoReserva: data.tipoReserva,
      pasajero: {
        nombre: data.pasajeroNombre,
        apellido: data.pasajeroApellido,
        dni: data.pasajeroDni,
        email: data.pasajeroEmail || '',
        telefono: data.pasajeroTelefono || '',
      },
      asiento: data.asiento,
      precioFinal: data.precioFinal,
      estado: 'RESERVADO',
      fechaReserva: new Date().toISOString(),
    };

    reservas.unshift(nuevaReserva); // Agregamos al inicio
    guardarEnStorage(reservas);
    return nuevaReserva;
  },

  cancelar: async (idReserva: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    let reservas = obtenerReservasIniciales();
    reservas = reservas.map((r) => {
      if (r.idReserva === idReserva) {
        return { ...r, estado: 'CANCELADO' as const };
      }
      return r;
    });
    guardarEnStorage(reservas);
  },
};