// actualizado version zod v4
import { z } from 'zod';

// Esquema para cada parada individual
export const puntoRutaSchema = z.object({
  direccion: z.string().min(3, { error: 'La dirección es muy corta' }),
  orden: z.number().int().nonnegative(),
});

// Esquema principal de la Ruta (Zod v4)
export const rutaSchema = z.object({
  nombre: z.string().min(3, { error: 'El nombre de la ruta es obligatorio' }),
  puntosRuta: z
    .array(puntoRutaSchema)
    .min(2, {
      error: 'Una ruta debe tener al menos origen y destino (2 paradas)',
    })
    .max(10, { error: 'No se permiten más de 10 paradas por ruta' }),
});

export type PuntoRutaFormData = z.infer<typeof puntoRutaSchema>;
export type RutaFormData = z.infer<typeof rutaSchema>;
