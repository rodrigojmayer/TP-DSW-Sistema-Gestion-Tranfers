import { type Punto, type PuntoBackend } from '../../../types';
import { type PuntoFormData } from '../schemas/puntoSchema';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const puntoService = {
  obtenerTodos: async (): Promise<Punto[]> => {
    const response = await fetch(`${API_URL}/punto`);
    if (!response.ok) {
      throw new Error('Error al obtener el catálogo de puntos');
    }
    // return response.json();
    const data = await response.json();
    return data.map((p: PuntoBackend) => ({ ...p, idPunto: p.id }));
  },
  crear: async (datos: PuntoFormData): Promise<Punto> => {
    console.log("crear punto datos: ", datos)
    const response = await fetch(`${API_URL}/punto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al crear punto');
    return response.json();
  },

  actualizar: async (idPunto: string, datos: PuntoFormData): Promise<Punto> => {
    console.log("idPunto: ", idPunto)
    console.log("datos: ", datos)
    const response = await fetch(`${API_URL}/punto/${idPunto}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    if (!response.ok) throw new Error('Error al actualizar punto');
    return response.json();
  },

  eliminar: async (idPunto: string): Promise<void> => {
    const response = await fetch(`${API_URL}/punto/${idPunto}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar punto');
  },
};