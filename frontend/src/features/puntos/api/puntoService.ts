import { type Punto } from '../../../types';
import { type PuntoFormData } from '../schemas/puntoSchema';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const puntoService = {
  obtenerTodos: async (): Promise<Punto[]> => {
    const response = await fetch(`${API_URL}/puntos`);
    if (!response.ok) {
      throw new Error('Error al obtener el catálogo de puntos');
    }
    return response.json();
  },
  crear: async (datos: PuntoFormData): Promise<Punto> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al crear punto');
    return response.json();
  },

  actualizar: async (idPunto: string, datos: PuntoFormData): Promise<Punto> => {
    const response = await fetch(`${API_URL}/${idPunto}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al actualizar punto');
    return response.json();
  },

  eliminar: async (idPunto: string): Promise<void> => {
    const response = await fetch(`${API_URL}/${idPunto}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar punto');
  },
};