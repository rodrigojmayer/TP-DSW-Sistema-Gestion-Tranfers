import { type Punto } from '../../../types';

// URL según el puerto/host del servidor Backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const puntoService = {
  obtenerTodos: async (): Promise<Punto[]> => {
    const response = await fetch(`${API_URL}/puntos`);

    if (!response.ok) {
      throw new Error('Error al obtener el catálogo de puntos');
    }

    return response.json();
  },
};