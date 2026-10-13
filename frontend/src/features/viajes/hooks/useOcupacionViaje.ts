// File: src/features/viajes/hooks/useOcupacionViaje.ts
import { useState, useEffect } from 'react';
import { viajeService } from '../api/viajeService';

export interface OcupacionInfo {
  asientosTotales: number;
  asientosOcupados: number;
  asientosDisponibles: number;
  porcentajeOcupacion: number;
}

function getErrorMessage(err: unknown, fallbackMessage: string): string {
  if (err instanceof Error) return err.message;
  return fallbackMessage;
}

export function useOcupacionViaje(viajeId?: string | number) {
  const [ocupacion, setOcupacion] = useState<OcupacionInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!viajeId) return;

    let cancelado = false;

    const cargarOcupacion = async () => {
      setLoading(true);
      setError(null);
      try {
        const viaje = await viajeService.obtenerPorId(String(viajeId));

        if (!cancelado) {
          const asientosTotales = viaje.capacidadPasajeros || 0;
          const asientosOcupados = 0; // Aquí podés vincular pasajes o reservas vendidas cuando existan
          const asientosDisponibles = Math.max(
            0,
            asientosTotales - asientosOcupados,
          );
          const porcentajeOcupacion =
            asientosTotales > 0
              ? Math.round((asientosOcupados / asientosTotales) * 100)
              : 0;

          setOcupacion({
            asientosTotales,
            asientosOcupados,
            asientosDisponibles,
            porcentajeOcupacion,
          });
        }
      } catch (err: unknown) {
        if (!cancelado) {
          setError(
            getErrorMessage(err, 'Error al obtener la ocupación del viaje'),
          );
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    };

    cargarOcupacion();

    return () => {
      cancelado = true;
    };
  }, [viajeId]);

  return {
    ocupacion,
    loading,
    error,
    estaLleno: ocupacion
      ? ocupacion.asientosDisponibles === 0 && ocupacion.asientosTotales > 0
      : false,
  };
}
