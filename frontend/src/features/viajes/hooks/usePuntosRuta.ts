import { useState } from 'react';

export interface PuntoRuta {
  id?: number;
  origen: string;
  destino: string;
  orden: number;
  horaEstimada?: string;
}

export function usePuntosRuta(puntosIniciales: PuntoRuta[] = []) {
  const [puntos, setPuntos] = useState<PuntoRuta[]>(puntosIniciales);
  const agregarPunto = (nuevoPunto: Omit<PuntoRuta, 'orden'>) => {
    setPuntos((prev) => [...prev, { ...nuevoPunto, orden: prev.length + 1 }]);
  };

  const eliminarPunto = (index: number) => {
    setPuntos(
      (prev) =>
        prev
          .filter((_, i) => i !== index)
          .map((punto, i) => ({ ...punto, orden: i + 1 })), 
    );
  };

  const reordenarPuntos = (origenIndex: number, destinoIndex: number) => {
    setPuntos((prev) => {
      const resultado = Array.from(prev);
      const [removido] = resultado.splice(origenIndex, 1);
      resultado.splice(destinoIndex, 0, removido);
      return resultado.map((punto, i) => ({ ...punto, orden: i + 1 }));
    });
  };

  const limpiarPuntos = () => setPuntos([]);

  return {
    puntos,
    setPuntos,
    agregarPunto,
    eliminarPunto,
    reordenarPuntos,
    limpiarPuntos,
  };
}
