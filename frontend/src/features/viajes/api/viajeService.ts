// // frontend/src/features/viajes/api/viajeService.ts
// import type { Viaje } from '../../../types';
// import type { ViajeFormData } from '../schemas/viajeSchema';

// // Mock de Viajes iniciales
// let viajesMock: Viaje[] = [
//   {
//     idViaje: 'viaje-1',
//     idRuta: 'ruta-1',
//     idChofer: 'chofer-1',
//     fechaHoraSalida: '2026-06-15T08:00',
//     precio: 4500,
//     estado: 'PROGRAMADO',
//   },
// ];

// export const viajeService = {
//   obtenerTodos: async (): Promise<Viaje[]> => {
//     return new Promise((resolve) => {
//       setTimeout(() => resolve([...viajesMock]), 500);
//     });
//   },

//   crear: async (data: ViajeFormData): Promise<Viaje> => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const nuevoViaje: Viaje = {
//           idViaje: crypto.randomUUID(),
//           idRuta: data.idRuta,
//           idChofer: data.idChofer,
//           fechaHoraSalida: data.fechaHoraSalida,
//           precio: data.precio,
//           estado: 'PROGRAMADO',
//         };
//         viajesMock.push(nuevoViaje);
//         resolve(nuevoViaje);
//       }, 700);
//     });
//   },

//   eliminar: async (id: string): Promise<void> => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         viajesMock = viajesMock.filter((v) => v.idViaje !== id);
//         resolve();
//       }, 400);
//     });
//   },
// };

// // simulacion del backend
// import type { Viaje } from '../../../types';

// const STORAGE_KEY = 'transfers_app_viajes';

// const obtenerViajesIniciales = (): Viaje[] => {
//   const guardadas = localStorage.getItem(STORAGE_KEY);
//   if (guardadas) {
//     try {
//       return JSON.parse(guardadas);
//     } catch {
//       // Ignorar error de parseo
//     }
//   }

//   // Datos mock alineados estrictamente al tipo Viaje
//   const iniciales: Viaje[] = [
//     {
//       idViaje: 'viaje-1',
//       idRuta: 'ruta-san-lorenzo-rosario',
//       idChofer: 'chofer-1', // Usando el chofer que creamos antes
//       fechaHoraSalida: new Date(Date.now() + 86400000).toISOString(),
//       precio: 8500,
//       estado: 'PROGRAMADO',
//     },
//     {
//       idViaje: 'viaje-2',
//       idRuta: 'ruta-funes-aeropuerto',
//       idChofer: 'chofer-2',
//       fechaHoraSalida: new Date(Date.now() + 172800000).toISOString(),
//       precio: 6000,
//       estado: 'PROGRAMADO',
//     },
//   ];
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciales));
//   return iniciales;
// };

// export const viajeService = {
//   obtenerTodos: async (): Promise<Viaje[]> => {
//     await new Promise((resolve) => setTimeout(resolve, 200));
//     return obtenerViajesIniciales();
//   },

//   obtenerPorId: async (idViaje: string): Promise<Viaje> => {
//     await new Promise((resolve) => setTimeout(resolve, 150));
//     const viajes = obtenerViajesIniciales();
//     const viaje = viajes.find((v) => v.idViaje === idViaje);
//     if (!viaje) throw new Error('Viaje no encontrado');
//     return viaje;
//   },
// };

// implementaciones de crear y eliminar
import type { Viaje } from '../../../types';
import type { ViajeFormData } from '../schemas/viajeSchema'; // Ajusta la ruta si es distinta

const STORAGE_KEY = 'transfers_app_viajes';

const obtenerViajesIniciales = (): Viaje[] => {
  const guardadas = localStorage.getItem(STORAGE_KEY);
  if (guardadas) {
    try {
      return JSON.parse(guardadas);
    } catch {
      // Ignorar error de parseo
    }
  }

  // Datos mock alineados estrictamente a tu tipo Viaje
  const iniciales: Viaje[] = [
    {
      idViaje: 'viaje-1',
      idRuta: 'ruta-1', // Asegúrate de tener una ruta con este ID en tu rutaService
      idChofer: 'chofer-1', // Asegúrate de tener un chofer con este ID en tu usuarioService
      fechaHoraSalida: new Date(Date.now() + 86400000).toISOString(),
      precio: 8500,
      estado: 'PROGRAMADO',
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciales));
  return iniciales;
};

export const viajeService = {
  obtenerTodos: async (): Promise<Viaje[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200)); // Simulamos latencia de red
    return obtenerViajesIniciales();
  },

  obtenerPorId: async (idViaje: string): Promise<Viaje> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const viajes = obtenerViajesIniciales();
    const viaje = viajes.find((v) => v.idViaje === idViaje);
    if (!viaje) throw new Error('Viaje no encontrado');
    return viaje;
  },

  // Agregamos la función CREAR que usas en el formulario
  crear: async (datos: ViajeFormData): Promise<Viaje> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const viajes = obtenerViajesIniciales();

    const nuevoViaje: Viaje = {
      idViaje: `viaje-${Date.now()}`, // Generamos un ID único simple
      idRuta: datos.idRuta,
      idChofer: datos.idChofer,
      fechaHoraSalida: datos.fechaHoraSalida,
      precio: datos.precio,
      estado: 'PROGRAMADO',
    };

    const nuevosViajes = [...viajes, nuevoViaje];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosViajes));
    return nuevoViaje;
  },

  // Agregamos la función ELIMINAR (Cancelar) que usas en el botón
  eliminar: async (idViaje: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const viajes = obtenerViajesIniciales();
    const viajesFiltrados = viajes.filter((v) => v.idViaje !== idViaje);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(viajesFiltrados));
  },
};