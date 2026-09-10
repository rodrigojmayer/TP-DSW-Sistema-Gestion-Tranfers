// src/features/rutas/api/rutaService.ts
import type { Ruta, CrearRutaDTO } from '../../../types';

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
  // GET /api/rutas
  async obtenerTodas(): Promise<Ruta[]> {
    const res = await fetch(`${API_URL}/rutas`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener las rutas');
    return res.json();
  },

  // GET /api/rutas/:id
  async obtenerPorId(id: string | number): Promise<Ruta> {
    const res = await fetch(`${API_URL}/rutas/${id}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al obtener la ruta');
    return res.json();
  },

  // POST /api/rutas
  async crear(datos: CrearRutaDTO): Promise<Ruta> {
    const res = await fetch(`${API_URL}/rutas`, {
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

  // PATCH /api/rutas/:id
  async actualizar(id: string | number, datos: ActualizarRutaPayload): Promise<Ruta> {
    const res = await fetch(`${API_URL}/rutas/${id}`, {
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

  // DELETE /api/rutas/:id
  async eliminar(id: string | number): Promise<void> {
    const res = await fetch(`${API_URL}/rutas/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Error al eliminar la ruta');
  },
};