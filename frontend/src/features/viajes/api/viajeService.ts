import type { Viaje, ViajeBackend } from '../../../types';
import type { ViajeFormData } from '../schemas/viajeSchema';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const mapBackendToFrontend = (raw: ViajeBackend): Viaje => {
  const rawFields = raw as ViajeBackend & UnknownRecord;
  let idRuta = '';
  let rutaNombre = '';
  let origenMapeado = 'Origen no especificado';
  let destinoMapeado = 'Destino no especificado';
  let paradasMapeadas: string[] = [];

  if (isRecord(raw.ruta)) {
    const rutaFields = raw.ruta as UnknownRecord;
    idRuta = typeof raw.ruta.id === 'string' ? raw.ruta.id : '';
    rutaNombre = typeof raw.ruta.nombre === 'string' ? raw.ruta.nombre : '';
    origenMapeado = typeof rutaFields.origen === 'string' ? rutaFields.origen : origenMapeado;
    destinoMapeado = typeof rutaFields.destino === 'string' ? rutaFields.destino : destinoMapeado;

    if (Array.isArray(rutaFields.puntos)) {
      paradasMapeadas = rutaFields.puntos
        .filter(isRecord)
        .sort((a, b) =>
          (typeof a.orden === 'number' ? a.orden : 0) -
          (typeof b.orden === 'number' ? b.orden : 0),
        )
        .map((parada) => {
          const punto = isRecord(parada.punto) ? parada.punto : {};
          const orden = typeof parada.orden === 'number' ? parada.orden : 0;
          return (
            (typeof punto.nombre === 'string' && punto.nombre) ||
            (typeof parada.nombre === 'string' && parada.nombre) ||
            (typeof punto.direccion === 'string' && punto.direccion) ||
            `Parada #${orden}`
          );
        });
    }
  } else if (typeof raw.ruta === 'string') {
    idRuta = raw.ruta;
  }

  let idChofer = '';

  if (isRecord(raw.chofer)) {
    const choferFields = raw.chofer as UnknownRecord;
    idChofer =
      (typeof choferFields.id === 'string' && choferFields.id) ||
      (typeof choferFields.idUsuario === 'string' && choferFields.idUsuario) ||
      '';
  } else if (typeof raw.chofer === 'string') {
    idChofer = raw.chofer;
  } else if (typeof rawFields.idChofer === 'string') {
    idChofer = rawFields.idChofer;
  }

  return {
    id: raw.id,
    tipo: raw.tipo || (typeof rawFields.tipoViaje === 'string' ? rawFields.tipoViaje : 'COMPARTIDO'),
    idRuta: idRuta,
    idChofer: idChofer,
    chofer: raw.chofer, 
    fechaHoraInicio: raw.fechaHoraInicio,
    fechaHoraFin: raw.fechaHoraFin || '',
    precio: raw.precioBase,
    estado: 'PROGRAMADO',
    capacidadPasajeros: raw.capacidadPasajeros,
    capacidadValijas: raw.capacidadValijas,
    rutaNombre: rutaNombre || (typeof rawFields.rutaNombre === 'string' ? rawFields.rutaNombre : undefined),
    origen: origenMapeado,
    destino: destinoMapeado,
    paradas: paradasMapeadas,
  };
};

export const viajeService = {
  obtenerPublicos: async (): Promise<Viaje[]> => {
    const res = await fetch(`${API_URL}/viaje/compartidos`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Error al obtener la lista de viajes públicos');
    }

    const data: ViajeBackend[] = await res.json();
    return data.map(mapBackendToFrontend);
  },

  obtenerMisViajes: async (): Promise<Viaje[]> => {
    const res = await fetch(`${API_URL}/viaje/mis-viajes`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Error al obtener tus viajes');
    }

    const data: ViajeBackend[] = await res.json();
    return data.map(mapBackendToFrontend);
  },

  obtenerTodosAdmin: async (): Promise<Viaje[]> => {
    const res = await fetch(`${API_URL}/viaje/admin/todos`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Error al obtener la totalidad de viajes');
    }

    const data: ViajeBackend[] = await res.json();
    return data.map(mapBackendToFrontend);
  },

  obtenerPorId: async (id: string): Promise<Viaje> => {
    const res = await fetch(`${API_URL}/viaje/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Viaje no encontrado');
    }

    const data: ViajeBackend = await res.json();
    return mapBackendToFrontend(data);
  },

  crear: async (datos: ViajeFormData): Promise<Viaje> => {
    const payload = {
      tipo: datos.tipo || 'COMPARTIDO',
      fechaHoraInicio: new Date(datos.fechaHoraInicio).toISOString(),
      fechaHoraFin: new Date(datos.fechaHoraFin).toISOString(),
      capacidadPasajeros: datos.capacidadPasajeros,
      capacidadValijas: datos.capacidadValijas,
      precioBase: Number(datos.precio),
      idRuta: datos.idRuta,
      idChofer: datos.idChofer || null,
    };

    const res = await fetch(`${API_URL}/viaje`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Error al crear el viaje');
    }

    const nuevoViajeBackend: ViajeBackend = await res.json();
    return mapBackendToFrontend(nuevoViajeBackend);
  },

  actualizar: async (id: string, datos: ViajeFormData): Promise<Viaje> => {
    const payload = {
      tipo: datos.tipo || 'COMPARTIDO',
      fechaHoraInicio: new Date(datos.fechaHoraInicio).toISOString(),
      fechaHoraFin: new Date(datos.fechaHoraFin).toISOString(),
      capacidadPasajeros: datos.capacidadPasajeros,
      capacidadValijas: datos.capacidadValijas,
      precioBase: Number(datos.precio),
      idRuta: datos.idRuta,
      idChofer: datos.idChofer || null,
    };

    const res = await fetch(`${API_URL}/viaje/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.message || 'Error al actualizar el viaje');
    }

    const viajeBackend: ViajeBackend = await res.json();
    return mapBackendToFrontend(viajeBackend);
  },

  eliminar: async (id: string): Promise<void> => {
    const res = await fetch(`${API_URL}/viaje/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      throw new Error('Error al eliminar el viaje');
    }
  },
};
