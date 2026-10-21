/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Coordenada {
  lat: number;
  lng: number;
}

export interface DireccionSugerida {
  id: string;
  nombre: string;
  coords: Coordenada;
}

export const buscarDireccionesOSM = async (query: string): Promise<DireccionSugerida[]> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
      {
        headers: {
          'Accept-Language': 'es',
        },
      }
    );
    const data = await response.json();

    return data.map((item: any) => {
      const calle = item.address?.road || item.address?.pedestrian || '';
      const altura = item.address?.house_number || '';
      const ciudad = item.address?.city || item.address?.town || item.address?.village || item.address?.county || '';
      const provincia = item.address?.state || '';

      let nombreFormateado = item.display_name;
      if (calle) {
        const direccionBase = altura ? `${calle} ${altura}` : calle;
        nombreFormateado = `${direccionBase}, ${ciudad || provincia}`.replace(/^,\s*/, '');
      }

      return {
        id: item.place_id,
        nombre: nombreFormateado,
        coords: {
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        },
      };
    });
  } catch (error) {
    console.error('Error al buscar direcciones:', error);
    return [];
  }
};

export const calcularDistanciaHaversine = (puntoA: Coordenada, puntoB: Coordenada): number => {
  const R = 6371; 
  const dLat = ((puntoB.lat - puntoA.lat) * Math.PI) / 180;
  const dLng = ((puntoB.lng - puntoA.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((puntoA.lat * Math.PI) / 180) *
      Math.cos((puntoB.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
};