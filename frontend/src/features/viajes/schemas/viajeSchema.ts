import { z } from 'zod';

export const viajeSchema = z.object({
  idRuta: z.string().min(1, { message: 'Debe seleccionar una ruta' }),
  idChofer: z.string().optional(),
  fechaHoraSalida: z
    .string()
    .min(1, { message: 'La fecha y hora de salida son obligatorias' }),
  fechaHoraLlegada: z
    .string()
    .min(1, { message: 'La fecha y hora de llegada son obligatorias' }),
  capacidadPasajeros: z.coerce
    .number()
    .min(1, { message: 'Debe permitir al menos 1 pasajero' }),
  capacidadValijas: z.coerce
    .number()
    .min(0, { message: 'La capacidad no puede ser negativa' }),
  precio: z.coerce
    .number()
    .positive({ message: 'El precio debe ser mayor a 0' }),
});

export type ViajeFormData = z.infer<typeof viajeSchema>;