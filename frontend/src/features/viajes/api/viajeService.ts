// frontend/src/features/viajes/api/viajeService.ts
import type { Viaje } from '../../../types';
import type { ViajeFormData } from '../schemas/viajeSchema';

// Mock de Viajes iniciales
let viajesMock: Viaje[] = [
  {
    idViaje: 'viaje-1',
    idRuta: 'ruta-1',
    idChofer: 'chofer-1',
    fechaHoraSalida: '2026-06-15T08:00',
    precio: 4500,
    estado: 'PROGRAMADO',
  },
];

export const viajeService = {
  obtenerTodos: async (): Promise<Viaje[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...viajesMock]), 500);
    });
  },

  crear: async (data: ViajeFormData): Promise<Viaje> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevoViaje: Viaje = {
          idViaje: crypto.randomUUID(),
          idRuta: data.idRuta,
          idChofer: data.idChofer,
          fechaHoraSalida: data.fechaHoraSalida,
          precio: data.precio,
          estado: 'PROGRAMADO',
        };
        viajesMock.push(nuevoViaje);
        resolve(nuevoViaje);
      }, 700);
    });
  },

  eliminar: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        viajesMock = viajesMock.filter((v) => v.idViaje !== id);
        resolve();
      }, 400);
    });
  },
};
