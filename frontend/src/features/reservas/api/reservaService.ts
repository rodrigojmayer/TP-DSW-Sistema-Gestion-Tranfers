
import { apiFetch } from '../../../api/apiClient';
import type { Reserva } from '../../../types';
import type { ReservaFormData } from '../schemas/reservaSchema';

export const reservaService = {
  obtenerTodas: async (): Promise<Reserva[]> => {
    return apiFetch<Reserva[]>('/reserva');
  },

  obtenerPorId: async (idReserva: string): Promise<Reserva> => {
    return apiFetch<Reserva>(`/reserva/${idReserva}`);
  },

  obtenerPorCliente: async (idCliente: string): Promise<Reserva[]> => {
    return apiFetch<Reserva[]>(`/reserva/cliente/${idCliente}`);
  },
  
  obtenerPorViaje: async (idViaje: string): Promise<Reserva[]> => {
    return apiFetch<Reserva[]>(`/reserva/viaje/${idViaje}`);
  },

  crear: async (data: ReservaFormData): Promise<Reserva> => {
    return apiFetch<Reserva>('/reserva', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  actualizar: async (idReserva: string, data: Partial<ReservaFormData>): Promise<Reserva> => {
    return apiFetch<Reserva>(`/reserva/${idReserva}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  cancelar: async (idReserva: string): Promise<void> => {
    return apiFetch<void>(`/reserva/${idReserva}`, {
      method: 'DELETE',
    });
  },
};