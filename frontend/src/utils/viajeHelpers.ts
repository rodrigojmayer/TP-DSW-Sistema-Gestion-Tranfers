import type { Viaje, Punto, PuntoRutaBackend, PuntoGeografico } from '../types/index'; 

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

export const obtenerPuntosNormalizados = (
  viaje?: Viaje | null,
): PuntoNormalizado[] => {
  if (!viaje) return [];

  const puntosBrutos: PuntoRutaBackend[] =
    (viaje.ruta?.puntos as PuntoRutaBackend[]) || viaje.punto_ruta || [];

  const elementos: PuntoNormalizado[] = puntosBrutos.map((item, index) => {
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
