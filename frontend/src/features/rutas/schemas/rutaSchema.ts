import { z } from 'zod';

export const rutaSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  puntos: z
    .array(
      z.object({
        idPunto: z.string().min(1, 'Debe seleccionar un punto del catálogo'),
        orden: z.number(),
      })
    )
    .min(2, 'Debe seleccionar al menos 2 puntos'),
});

export type RutaFormData = z.infer<typeof rutaSchema>;