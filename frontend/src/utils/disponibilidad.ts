export interface PuntoRutaConOrden {
  orden: number;
  nombre: string;
}

export interface ReservaMinima {
  origen: string;
  destino: string;
  cantPasajeros: number;
  cantValijas: number;
}

export interface DisponibilidadTramo {
  ordenInicio: number;
  origenNombre: string;
  destinoNombre: string;
  pasajerosDisponibles: number;
  valijasDisponibles: number;
}

/**
 * Calcula la disponibilidad punto por punto / tramo por tramo
 */
export function calcularDisponibilidadViaje(
  capacidadPasajeros: number,
  capacidadValijas: number,
  puntosRutaOrdenados: PuntoRutaConOrden[],
  reservasDelViaje: ReservaMinima[]
): DisponibilidadTramo[] {
  // Ordenar puntos por la columna 'orden' por seguridad
  const puntos = [...puntosRutaOrdenados].sort((a, b) => a.orden - b.orden);

  // Inicializar ocupación por cada tramo (tramo i sale del punto i hacia el i+1)
  const ocupacionPorTramo: Record<number, { pasajeros: number; valijas: number }> = {};

  puntos.forEach((p) => {
    ocupacionPorTramo[p.orden] = { pasajeros: 0, valijas: 0 };
  });

  // Acumular el impacto de cada reserva existente
  reservasDelViaje.forEach((reserva) => {
    const pOrigen = puntos.find((p) => p.nombre === reserva.origen);
    const pDestino = puntos.find((p) => p.nombre === reserva.destino);

    if (pOrigen && pDestino) {
      // Sumar pasajes en los tramos donde el pasajero está efectivamente arriba del vehículo
      for (let o = pOrigen.orden; o < pDestino.orden; o++) {
        if (ocupacionPorTramo[o]) {
          ocupacionPorTramo[o].pasajeros += reserva.cantPasajeros;
          ocupacionPorTramo[o].valijas += reserva.cantValijas;
        }
      }
    }
  });

  // Retornar disponibilidad tramo a tramo
  return puntos.map((punto, idx) => {
    const esUltimo = idx === puntos.length - 1;
    const siguientePunto = !esUltimo ? puntos[idx + 1] : null;

    const ocupacion = ocupacionPorTramo[punto.orden] || { pasajeros: 0, valijas: 0 };

    return {
      ordenInicio: punto.orden,
      origenNombre: punto.nombre,
      destinoNombre: siguientePunto ? siguientePunto.nombre : 'Destino Final',
      // En la última parada ya bajaron todos, no sale ningún tramo nuevo
      pasajerosDisponibles: esUltimo ? capacidadPasajeros : Math.max(0, capacidadPasajeros - ocupacion.pasajeros),
      valijasDisponibles: esUltimo ? capacidadValijas : Math.max(0, capacidadValijas - ocupacion.valijas),
    };
  });
}