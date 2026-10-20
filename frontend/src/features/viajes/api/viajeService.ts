// src/features/viajes/api/viajeService.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
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

const mapBackendToFrontend = (
  raw: ViajeBackend & {
    origen?: any;
    destino?: any;
    paradas?: any;
    puntos?: any;
  },
): Viaje => {
  let idRuta = '';
  let rutaNombre = '';
  let origenMapeado = 'Origen no especificado';
  let destinoMapeado = 'Destino no especificado';
  let paradasMapeadas: any[] = [];

  if (raw.ruta && typeof raw.ruta === 'object') {
    idRuta = raw.ruta.id;
    rutaNombre = (raw.ruta as any).nombre || '';
    origenMapeado = (raw.ruta as any).origen || origenMapeado;
    destinoMapeado = (raw.ruta as any).destino || destinoMapeado;

    // Mapeo dinámico de paradas ordenadas desde la relación de la Ruta
    if (Array.isArray((raw.ruta as any).puntos)) {
      paradasMapeadas = (raw.ruta as any).puntos
        .sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0))
        .map(
          (p: any) =>
            p.punto?.nombre ||
            p.nombre ||
            p.punto?.direccion ||
            `Parada #${p.orden}`,
        );
    }
  } else if (typeof raw.ruta === 'string') {
    idRuta = raw.ruta;
  }

  //   // Fallbacks directos si la raíz trae propiedades planas
  //   if (raw.origen) origenMapeado = raw.origen;
  //   if (raw.destino) destinoMapeado = raw.destino;
  //   if (raw.paradas) paradasMapeadas = raw.paradas;

  //   let idChofer = '';
  //   if (raw.chofer && typeof raw.chofer === 'object') {
  //     idChofer = raw.chofer.id;
  //   } else if (typeof raw.chofer === 'string') {
  //     idChofer = raw.chofer;
  //   } else if (raw.idChofer) {
  //     idChofer = raw.idChofer;
  //   }

  //   return {
  //     id: raw.id,
  //     tipo: raw.tipo || (raw as any).tipoViaje || 'COMPARTIDO',
  //     idRuta: idRuta,
  //     idChofer: idChofer,
  //     fechaHoraInicio: raw.fechaHoraInicio,
  //     fechaHoraFin: raw.fechaHoraFin || '',
  //     precio: raw.precioBase,
  //     estado: 'PROGRAMADO',
  //     capacidadPasajeros: raw.capacidadPasajeros,
  //     capacidadValijas: raw.capacidadValijas,
  //     rutaNombre: rutaNombre || (raw as any).rutaNombre,
  //     origen: origenMapeado,
  //     destino: destinoMapeado,
  //     paradas: paradasMapeadas,
  //   };
  // };

  // 🟢 Corrección para el Chofer (soporta id, idUsuario y extrae su nombre)
  let idChofer = '';
 // let choferNombre = '';

  if (raw.chofer && typeof raw.chofer === 'object') {
    idChofer = (raw.chofer as any).id || (raw.chofer as any).idUsuario || '';
    //const nombre = (raw.chofer as any).nombre || '';
    //const apellido = (raw.chofer as any).apellido || '';
    //choferNombre = `${nombre} ${apellido}`.trim();
  } else if (typeof raw.chofer === 'string') {
    idChofer = raw.chofer;
  } else if (raw.idChofer) {
    idChofer = raw.idChofer;
  }

  return {
    id: raw.id,
    tipo: raw.tipo || (raw as any).tipoViaje || 'COMPARTIDO',
    idRuta: idRuta,
    idChofer: idChofer,
    chofer: raw.chofer, // 👈 AGREGA ESTA LÍNEA PARA PRESERVAR EL OBJETO CHOFER
    //choferNombre: choferNombre || (raw as any).choferNombre, // 🟢 Aseguramos que viaje el nombre
    fechaHoraInicio: raw.fechaHoraInicio,
    fechaHoraFin: raw.fechaHoraFin || '',
    precio: raw.precioBase,
    estado: 'PROGRAMADO',
    capacidadPasajeros: raw.capacidadPasajeros,
    capacidadValijas: raw.capacidadValijas,
    rutaNombre: rutaNombre || (raw as any).rutaNombre,
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
    return data.map(mapBackendToFrontend)
    
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
      //tipo: 'COMPARTIDO',
      tipo: datos.tipo || 'COMPARTIDO', // 👈 Respetamos el tipo seleccionado o editado
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
      // tipo: 'COMPARTIDO',
      tipo: datos.tipo || 'COMPARTIDO', // 👈 Igualmente aquí para el PATCH
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

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import type { Viaje, ViajeBackend } from '../../../types';
// import type { ViajeFormData } from '../schemas/viajeSchema';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// // Helper para obtener el token desde localStorage
// const getAuthHeaders = () => {
//   const token = localStorage.getItem('token');
//   return {
//     'Content-Type': 'application/json',
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };
// };

// const mapBackendToFrontend = (raw: ViajeBackend): Viaje => {
//   let idRuta = '';
//   let rutaNombre = '';

//   if (raw.ruta && typeof raw.ruta === 'object') {
//     idRuta = raw.ruta.id;
//     rutaNombre = raw.ruta.nombre;
//   } else if (typeof raw.ruta === 'string') {
//     idRuta = raw.ruta;
//   }

//   let idChofer = '';
//   if (raw.chofer && typeof raw.chofer === 'object') {
//     idChofer = raw.chofer.id;
//   } else if (typeof raw.chofer === 'string') {
//     idChofer = raw.chofer;
//   } else if (raw.idChofer) {
//     idChofer = raw.idChofer;
//   }

//   return {
//     id: raw.id,
//     tipo: raw.tipo || (raw as any).tipoViaje || 'COMPARTIDO',
//     idRuta: idRuta,
//     idChofer: idChofer,
//     fechaHoraInicio: raw.fechaHoraInicio,
//     fechaHoraFin: raw.fechaHoraFin || '',
//     precio: raw.precioBase,
//     estado: 'PROGRAMADO',
//     capacidadPasajeros: raw.capacidadPasajeros,
//     capacidadValijas: raw.capacidadValijas,
//     rutaNombre: rutaNombre,
//   };
// };

// export const viajeService = {
//   // 1. PÚBLICO: Obtiene solo los viajes de tipo COMPARTIDO (Para la home o invitados)
//   obtenerPublicos: async (): Promise<Viaje[]> => {
//     const res = await fetch(`${API_URL}/viaje/compartidos`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!res.ok) {
//       throw new Error('Error al obtener la lista de viajes públicos');
//     }

//     const data: ViajeBackend[] = await res.json();
//     return data.map(mapBackendToFrontend);
//   },

//   // 2. CLIENTE LOGUEADO: Viajes compartidos + sus viajes reservados
//   obtenerMisViajes: async (): Promise<Viaje[]> => {
//     const res = await fetch(`${API_URL}/viaje/mis-viajes`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!res.ok) {
//       throw new Error('Error al obtener tus viajes');
//     }

//     const data: ViajeBackend[] = await res.json();
//     return data.map(mapBackendToFrontend);
//   },

//   // 3. ADMIN: Obtiene la totalidad de los viajes almacenados en la base de datos
//   obtenerTodosAdmin: async (): Promise<Viaje[]> => {
//     const res = await fetch(`${API_URL}/viaje/admin/todos`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!res.ok) {
//       throw new Error('Error al obtener la totalidad de viajes');
//     }

//     const data: ViajeBackend[] = await res.json();
//     return data.map(mapBackendToFrontend);
//   },

//   obtenerPorId: async (id: string): Promise<Viaje> => {
//     const res = await fetch(`${API_URL}/viaje/${id}`, {
//       method: 'GET',
//       headers: getAuthHeaders(),
//     });

//     if (!res.ok) {
//       throw new Error('Viaje no encontrado');
//     }

//     const data: ViajeBackend = await res.json();
//     return mapBackendToFrontend(data);
//   },

//   crear: async (datos: ViajeFormData): Promise<Viaje> => {
//     const payload = {
//       tipo: 'COMPARTIDO',
//       fechaHoraInicio: new Date(datos.fechaHoraInicio).toISOString(),
//       fechaHoraFin: new Date(datos.fechaHoraFin).toISOString(),
//       capacidadPasajeros: datos.capacidadPasajeros,
//       capacidadValijas: datos.capacidadValijas,
//       precioBase: Number(datos.precio),
//       idRuta: datos.idRuta,
//       idChofer: datos.idChofer || null,
//     };

//     const res = await fetch(`${API_URL}/viaje`, {
//       method: 'POST',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(payload),
//     });

//     if (!res.ok) {
//       const errData = await res.json().catch(() => null);
//       throw new Error(errData?.message || 'Error al crear el viaje');
//     }

//     const nuevoViajeBackend: ViajeBackend = await res.json();
//     return mapBackendToFrontend(nuevoViajeBackend);
//   },

//   actualizar: async (id: string, datos: ViajeFormData): Promise<Viaje> => {
//     const payload = {
//       tipo: 'COMPARTIDO',
//       fechaHoraInicio: new Date(datos.fechaHoraInicio).toISOString(),
//       fechaHoraFin: new Date(datos.fechaHoraFin).toISOString(),
//       capacidadPasajeros: datos.capacidadPasajeros,
//       capacidadValijas: datos.capacidadValijas,
//       precioBase: Number(datos.precio),
//       idRuta: datos.idRuta,
//       idChofer: datos.idChofer || null,
//     };

//     const res = await fetch(`${API_URL}/viaje/${id}`, {
//       method: 'PATCH',
//       headers: getAuthHeaders(),
//       body: JSON.stringify(payload),
//     });

//     if (!res.ok) {
//       const errData = await res.json().catch(() => null);
//       throw new Error(errData?.message || 'Error al actualizar el viaje');
//     }

//     const viajeBackend: ViajeBackend = await res.json();
//     return mapBackendToFrontend(viajeBackend);
//   },

//   eliminar: async (id: string): Promise<void> => {
//     const res = await fetch(`${API_URL}/viaje/${id}`, {
//       method: 'DELETE',
//       headers: getAuthHeaders(),
//     });

//     if (!res.ok) {
//       throw new Error('Error al eliminar el viaje');
//     }
//   },
// };
