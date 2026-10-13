// src/utils/viajeHelpers.ts

import type { Viaje, Punto, PuntoRutaBackend, PuntoGeografico } from '../types/index'; // Ajusta la ruta relativa hacia tu archivo de interfaces/types

export interface PuntoNormalizado {
  orden: number;
  tipo: string;
  asientosDisponibles: number;
  punto: {
    id?: string;
    nombre: string;
    direccion?: string;
  };
}

/**
 * Normaliza la obtención del nombre de un punto probando
 * las distintas propiedades posibles que envía el backend/DB o las estructuras del cliente.
 */
export const obtenerNombrePunto = (
  punto?:
    | Punto
    | PuntoGeografico
    | { nombre?: string; direccion?: string }
    | string
    | null,
): string => {
  if (!punto) return 'Punto no especificado';

  if (typeof punto === 'string') {
    return punto;
  }

  return punto.nombre || punto.direccion || 'Ubicación sin nombre';
};

/**
 * Mapea y ordena secuencialmente los puntos de la ruta
 * resolviendo diferencias entre la ruta del viaje y sus puntos asociados.
 */
export const obtenerPuntosNormalizados = (
  viaje?: Viaje | null,
): PuntoNormalizado[] => {
  if (!viaje) return [];

  // Extrae los puntos de la relación con RutaBackend o del arreglo punto_ruta
  const puntosBrutos: PuntoRutaBackend[] =
    (viaje.ruta?.puntos as PuntoRutaBackend[]) || viaje.punto_ruta || [];

  const elementos: PuntoNormalizado[] = puntosBrutos.map((item, index) => {
    // Si viene la entidad 'punto' la usamos; de lo contrario armamos la estructura con los datos disponibles
    const entidadPunto = item.punto
      ? {
          id: item.punto.id,
          nombre: item.punto.nombre,
          direccion: item.punto.direccion,
        }
      : {
          id: item.id || item.punto_id,
          nombre: item.nombre || 'Punto sin nombre',
        };

    const esPrimero = index === 0;
    const esUltimo = index === puntosBrutos.length - 1;
    const tipoDefecto = esPrimero ? 'ORIGEN' : esUltimo ? 'DESTINO' : 'PARADA';

    return {
      orden: item.orden ?? index,
      tipo: tipoDefecto,
      asientosDisponibles: viaje.capacidadPasajeros ?? 0,
      punto: entidadPunto,
    };
  });

  return elementos.sort((a, b) => a.orden - b.orden);
};
