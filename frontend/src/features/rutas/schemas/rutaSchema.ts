// frontend/src/features/rutas/schemas/rutaSchema.ts
import { z } from 'zod';

// Esquema para cada parada individual
export const puntoRutaSchema = z.object({
  direccion: z.string().min(3, { message: 'La dirección es muy corta' }),
  // El orden se manejará internamente en el array, pero lo validamos
  orden: z.number().int().nonnegative(),
});

// Esquema principal de la Ruta
export const rutaSchema = z.object({
  nombre: z.string().min(3, { message: 'El nombre de la ruta es obligatorio' }),
  puntosRuta: z
    .array(puntoRutaSchema)
    .min(2, {
      message: 'Una ruta debe tener al menos origen y destino (2 paradas)',
    })
    .max(10, { message: 'No se permiten más de 10 paradas por ruta' }),
});

export type PuntoRutaFormData = z.infer<typeof puntoRutaSchema>;
export type RutaFormData = z.infer<typeof rutaSchema>;
