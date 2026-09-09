// frontend/src/features/viajes/schemas/viajeSchema.ts
import { z } from 'zod';

export const viajeSchema = z.object({
  idRuta: z.string().min(1, { message: 'Debe seleccionar una ruta' }),
  idChofer: z.string().min(1, { message: 'Debe asignar un chofer' }),
  fechaHoraSalida: z
    .string()
    .min(1, { message: 'La fecha y hora de salida son obligatorias' }),
  precio: z.coerce
    .number()
    .positive({ message: 'El precio debe ser mayor a 0' }),
});

export type ViajeFormData = z.infer<typeof viajeSchema>;
