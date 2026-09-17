import type { Ruta, CrearRutaInput, RutaBackend } from '../../../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 1. Definimos las interfaces para la creación y edición de rutas
export interface PuntoRutaPayload {
  idPunto: string;
  orden: number;
}

export interface CrearRutaPayload {
  nombre: string;
  puntos?: PuntoRutaPayload[];
}

export type ActualizarRutaPayload = Partial<CrearRutaPayload>;

// Helper para adjuntar el token
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const rutaService = {
  // GET /api/ruta
  async obtenerTodas(): Promise<Ruta[]> {
    const res = await fetch(`${API_URL}/ruta`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener las rutas');

    // return response.json();
    const data = await res.json();
    return data.map((r: RutaBackend) => ({ ...r, idRuta: r.id }));
  },

  // GET /api/ruta/:id
  async obtenerPorId(id: string | number): Promise<Ruta> {
    const res = await fetch(`${API_URL}/ruta/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener la ruta');
    return res.json();
  },

  // POST /api/ruta
  async crear(datos: CrearRutaInput): Promise<Ruta> {
    const res = await fetch(`${API_URL}/ruta`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(datos),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al crear la ruta');
    }
    return res.json();
  },

  // PATCH /api/ruta/:id
  async actualizar(id: string | number, datos: ActualizarRutaPayload): Promise<Ruta> {
    const res = await fetch(`${API_URL}/ruta/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(datos),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al actualizar la ruta');
    }
    return res.json();
  },

  // DELETE /api/ruta/:id
  async eliminar(id: string | number): Promise<void> {
    const res = await fetch(`${API_URL}/ruta/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar la ruta');
  },
};