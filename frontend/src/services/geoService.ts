/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Coordenada {
  lat: number;
  lng: number;
}

export interface DireccionSugerida {
  id: string;
  nombre: string; // Nombre completo/Formateado
  coords: Coordenada;
}

// Buscar direcciones exactas en Argentina usando OpenStreetMap (Gratis)
export const buscarDireccionesOSM = async (texto: string): Promise<DireccionSugerida[]> => {
  if (!texto || texto.trim().length < 3) return [];

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        texto
      )}&countrycodes=ar&addressdetails=1&limit=6`,
      {
        headers: {
          // OpenStreetMap requiere que indiques un User-Agent identificativo
          'User-Agent': 'MiAplicacionTransfer/1.0',
        },
      }
    );

    const data = await response.json();

    return data.map((item: any) => ({
      id: String(item.place_id),
      nombre: item.display_name,
      coords: {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      },
    }));
  } catch (error) {
    console.error('Error al consultar OpenStreetMap:', error);
    return [];
  }
};

// Se mantiene el cálculo Haversine
export const calcularDistanciaHaversine = (puntoA: Coordenada, puntoB: Coordenada): number => {
  const R = 6371; // Radio de la Tierra en km
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