// frontend/src/features/rutas/api/rutaService.ts
import {type  Ruta } from '../../../types';
import { type RutaFormData } from '../schemas/rutaSchema';

// Datos iniciales de prueba (Mock)
let rutasMock: Ruta[] = [
  {
    idRuta: 'ruta-1',
    nombre: 'Rosario ↔ Eziza(Directo)',
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
            // Nos aseguramos de que el orden sea secuencial según su posición en el array
            orden: index + 1,
          })),
        };
        rutasMock.push(nuevaRuta);
        resolve(nuevaRuta);
      }, 800);
    });
  },

  eliminar: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        rutasMock = rutasMock.filter((r) => r.idRuta !== id);
        resolve();
      }, 500);
    });
  },
};
