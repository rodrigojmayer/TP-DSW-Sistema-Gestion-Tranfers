// // frontend/src/features/rutas/api/rutaService.ts
// import {type  Ruta } from '../../../types';
// import { type RutaFormData } from '../schemas/rutaSchema';

// // Datos iniciales de prueba (Mock)
// let rutasMock: Ruta[] = [
//   {
//     idRuta: 'ruta-1',
//     nombre: 'Rosario ↔ Eziza(Directo)',
//     puntosRuta: [
//       {
//         idPunto: 'pto-1',
//         direccion: 'Terminal de Ómnibus Mariano Moreno, Rosario',
//         orden: 1,
//       },
//       {
//         idPunto: 'pto-2',
//         direccion: 'Aeropuerto Ezeiza',
//         orden: 2,
//       },
//     ],
//   },
// ];

// export const rutaService = {
//   obtenerTodas: async (): Promise<Ruta[]> => {
//     return new Promise((resolve) => {
//       setTimeout(() => resolve([...rutasMock]), 600);
//     });
//   },

//   crear: async (data: RutaFormData): Promise<Ruta> => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const nuevaRuta: Ruta = {
//           idRuta: crypto.randomUUID(),
//           nombre: data.nombre,
//           puntosRuta: data.puntosRuta.map((punto, index) => ({
//             idPunto: crypto.randomUUID(),
//             direccion: punto.direccion,
//             // Nos aseguramos de que el orden sea secuencial según su posición en el array
//             orden: index + 1,
//           })),
//         };
//         rutasMock.push(nuevaRuta);
//         resolve(nuevaRuta);
//       }, 800);
//     });
//   },

  

//   eliminar: async (id: string): Promise<void> => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         rutasMock = rutasMock.filter((r) => r.idRuta !== id);
//         resolve();
//       }, 500);
//     });
//   },
// };

// frontend/src/features/rutas/api/rutaService.ts
import { type Ruta } from '../../../types';
import { type RutaFormData } from '../schemas/rutaSchema';

// Datos iniciales de prueba (Mock)
let rutasMock: Ruta[] = [
  {
    idRuta: 'ruta-1',
    nombre: 'Rosario ↔ Ezeiza (Directo)',
    puntosRuta: [
      {
        idPunto: 'pto-1',
        direccion: 'Terminal de Ómnibus Mariano Moreno, Rosario',
        orden: 1,
      },
      {
        idPunto: 'pto-2',
        direccion: 'Aeropuerto Ezeiza',
        orden: 2,
      },
    ],
  },
];

export const rutaService = {
  obtenerTodas: async (): Promise<Ruta[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...rutasMock]), 600);
    });
  },

  crear: async (data: RutaFormData): Promise<Ruta> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevaRuta: Ruta = {
          idRuta: crypto.randomUUID(),
          nombre: data.nombre,
          puntosRuta: data.puntosRuta.map((punto, index) => ({
            idPunto: crypto.randomUUID(),
            direccion: punto.direccion,
            orden: index + 1,
          })),
        };
        rutasMock.push(nuevaRuta);
        resolve(nuevaRuta);
      }, 800);
    });
  },

  // ✅ Método de actualización añadido para soportar la edición
  // Permitimos que idRuta sea string o number
  actualizar: async (
    idRuta: string | number,
    data: RutaFormData,
  ): Promise<Ruta> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Convertimos ambos a String para comparar sin importar si vienen numéricos o texto
        const rutaExistente = rutasMock.find(
          (r) => String(r.idRuta) === String(idRuta),
        );

        if (!rutaExistente) {
          reject(new Error('Ruta no encontrada'));
          return;
        }

        const puntosAnteriores = rutaExistente.puntosRuta ?? [];

        const rutaActualizada: Ruta = {
          ...rutaExistente,
          nombre: data.nombre,
          puntosRuta: data.puntosRuta.map((punto, i) => ({
            idPunto: puntosAnteriores[i]?.idPunto ?? crypto.randomUUID(),
            direccion: punto.direccion,
            orden: i + 1,
          })),
        };

        rutasMock = rutasMock.map((r) =>
          String(r.idRuta) === String(idRuta) ? rutaActualizada : r,
        );

        resolve(rutaActualizada);
      }, 800);
    });
  },

  eliminar: async (id: string | number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        rutasMock = rutasMock.filter((r) => String(r.idRuta) !== String(id));
        resolve();
      }, 500);
    });
  },
};