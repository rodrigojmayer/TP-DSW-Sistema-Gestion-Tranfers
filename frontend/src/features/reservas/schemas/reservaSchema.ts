import { z } from 'zod';

// Campos compartidos base
const reservaBase = {
  tipoViaje: z.enum(['COMPARTIDO', 'PRIVADO'] as const, {
    message: 'Debe seleccionar un tipo de viaje válido',
  }),
  // 💡 Permite string opcional o cadena vacía inicialmente
  idViaje: z.string().optional().or(z.literal('')),
  origen: z.string().min(1, 'Debe ingresar o seleccionar un origen'),
  destino: z.string().min(1, 'Debe ingresar o seleccionar un destino'),
  asiento: z.coerce
    .number({ message: 'Debe ingresar un número válido' })
    .min(1, 'Mínimo 1 pasajero')
    .max(60, 'El máximo de asientos permitido es 60')
    .int('Debe ser un número entero'),
  cantValijas: z.coerce
    .number({ message: 'Debe ingresar un número válido' })
    .min(0, 'Mínimo 0 valijas')
    .max(60, 'El máximo de valijas por reserva es 60')
    .int('Debe ser un número entero')
    .default(0),
  precioFinal: z.coerce.number().min(0.01, 'El precio debe ser mayor a 0'),
};

// 1. Esquema cuando el comprador es un Cliente Autenticado
const reservaLogueadoSchema = z.object({
  ...reservaBase,
  tipoReserva: z.literal('LOGUEADO'),
  idCliente: z
    .string()
    .min(1, 'Debe seleccionar un cliente registrado')
    .optional()
    .or(z.literal('')),
  pasajeroNombre: z.string().min(2, 'Nombre del pasajero es requerido'),
  pasajeroApellido: z.string().min(2, 'Apellido del pasajero es requerido'),
  pasajeroDni: z.string().min(6, 'DNI / Documento requerido'),
  pasajeroEmail: z.string().optional().or(z.literal('')),
  pasajeroTelefono: z.string().optional().or(z.literal('')),
});

// 2. Esquema cuando la reserva es de un Invitado (Express)
const reservaInvitadoSchema = z.object({
  ...reservaBase,
  tipoReserva: z.literal('INVITADO'),
  idCliente: z.string().optional().or(z.literal('')),
  pasajeroNombre: z.string().min(2, 'El nombre es obligatorio'),
  pasajeroApellido: z.string().min(2, 'El apellido es obligatorio'),
  pasajeroDni: z.string().min(6, 'El DNI / Documento es obligatorio'),
  pasajeroEmail: z.string().email('Email inválido para el envío del pasaje'),
  pasajeroTelefono: z
    .string()
    .min(8, 'Teléfono obligatorio para el servicio de transfer'),
});

// Función de refinamiento condicional para validar 'idViaje' según el 'tipoViaje'
const validarTipoViaje = (
  data: z.infer<typeof reservaLogueadoSchema> | z.infer<typeof reservaInvitadoSchema>,
  ctx: z.RefinementCtx
) => {
  if (data.tipoViaje === 'COMPARTIDO' && (!data.idViaje || data.idViaje.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Debe seleccionar un viaje programado',
      path: ['idViaje'],
    });
  }
};

// Unimos ambos esquemas y aplicamos la refinación condicional
export const reservaSchema = z
  .discriminatedUnion('tipoReserva', [
    reservaLogueadoSchema,
    reservaInvitadoSchema,
  ])
  .superRefine(validarTipoViaje);

// Alias de exportación
export const crearReservaSchema = reservaSchema;

export type ReservaFormData = z.infer<typeof reservaSchema>;