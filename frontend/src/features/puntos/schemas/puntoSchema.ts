import { z } from 'zod';

export const puntoSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  direccion: z.string().min(3, 'La dirección es obligatoria'),
  tipo: z.enum(['Terminal', 'Punto Intermedio', 'Aeropuerto'], {
     message: 'Seleccioná un tipo válido'
  }),
  latitud: z
    .string()
    .min(1, 'La latitud es obligatoria')
    .refine((val) => !isNaN(Number(val)), { message: 'Debe ser un número válido' }),
  longitud: z
    .string()
    .min(1, 'La longitud es obligatoria')
    .refine((val) => !isNaN(Number(val)), { message: 'Debe ser un número válido' }),
});

export type PuntoFormData = z.infer<typeof puntoSchema>;