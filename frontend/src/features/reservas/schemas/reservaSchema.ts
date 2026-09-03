// import { z } from 'zod';

// export const reservaSchema = z.object({
//   idViaje: z.string().min(1, 'Debe seleccionar un viaje programado'),
//   idPasajero: z.string().min(1, 'Debe seleccionar un pasajero'),
//   asiento: z.coerce
//     .number()
//     .min(1, 'El número de asiento debe ser al menos 1')
//     .max(60, 'El asiento máximo permitido es 60'),
//   precioFinal: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
// });

// export type ReservaFormData = z.infer<typeof reservaSchema>;

// reforma con ususario logueado y sin loguear
import { z } from 'zod';

// Campos compartidos obligatorios para cualquier tipo de reserva
const reservaBase = {
  idViaje: z.string().min(1, 'Debe seleccionar un viaje programado'),
  asiento: z.coerce
    .number()
    .min(1, 'El asiento debe ser al menos 1')
    .max(60, 'El asiento máximo es 60'),
  precioFinal: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
};

// 1. Esquema cuando el comprador es un Cliente Autenticado
const reservaLogueadoSchema = z.object({
  ...reservaBase,
  tipoReserva: z.literal('LOGUEADO'),
  idCliente: z.string().min(1, 'Debe seleccionar un cliente registrado'),
  // En este modo, pedimos los datos básicos del pasajero que viajará
  pasajeroNombre: z.string().min(2, 'Nombre del pasajero es requerido'),
  pasajeroApellido: z.string().min(2, 'Apellido del pasajero es requerido'),
  pasajeroDni: z.string().min(6, 'DNI / Documento requerido'),
  pasajeroEmail: z.string().optional(),
  pasajeroTelefono: z.string().optional(),
});

// 2. Esquema cuando el comprador es un Invitado (Reserva Express)
const reservaInvitadoSchema = z.object({
  ...reservaBase,
  tipoReserva: z.literal('INVITADO'),
  idCliente: z.string().optional(),
  // Al no estar registrado, Email y Teléfono se vuelven 100% OBLIGATORIOS
  pasajeroNombre: z.string().min(2, 'El nombre es obligatorio'),
  pasajeroApellido: z.string().min(2, 'El apellido es obligatorio'),
  pasajeroDni: z.string().min(6, 'El DNI / Documento es obligatorio'),
  pasajeroEmail: z.string().email('Email inválido para el envío del pasaje'),
  pasajeroTelefono: z
    .string()
    .min(8, 'Teléfono obligatorio para el servicio de transfer'),
});

// Unimos ambos esquemas discriminando por la clave 'tipoReserva'
export const reservaSchema = z.discriminatedUnion('tipoReserva', [
  reservaLogueadoSchema,
  reservaInvitadoSchema,
]);

export type ReservaFormData = z.infer<typeof reservaSchema>;