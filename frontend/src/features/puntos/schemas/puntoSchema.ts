import { z } from 'zod';

export const puntoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  direccion: z.string().min(3, 'La dirección es obligatoria'),
});

export type PuntoFormData = z.infer<typeof puntoSchema>;