import { z } from 'zod';
import type { RolUsuario } from '../../../types';

const ROLES_INTERNOS = ['ADMIN', 'OPERADOR', 'CHOFER'] as [
  RolUsuario,
  ...RolUsuario[],
];

export const usuarioSchema = z
  .object({
    usuario: z
      .string()
      .min(3, { error: 'El usuario debe tener al menos 3 caracteres' }),
    dni: z
      .string()
      .min(6, 'El DNI debe tener al menos 6 números')
      .max(8, 'El DNI no puede tener más de 8 números')
      .regex(/^[0-9]+$/, 'El DNI solo debe contener números'),
    nombre: z.string().min(2, { error: 'El nombre es obligatorio' }),
    apellido: z.string().min(2, { error: 'El apellido es obligatorio' }),
    email: z
      .string()
      .trim()
      .min(1, 'El email es obligatorio')
      .pipe(z.email('Debe ser un email válido')),
    
    password: z
    .union([
      z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
      z.literal(''),
    ])
    .optional(),

    telefono: z
      .string()
      .min(8, { error: 'El teléfono debe tener al menos 8 dígitos' }),
    rol: z.enum(ROLES_INTERNOS),
    nroLicencia: z.string().optional(),
    vencimientoLicencia: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.rol === 'CHOFER') {
      if (!data.nroLicencia || data.nroLicencia.length < 5) {
        ctx.addIssue({
          code: 'custom',
          message: 'La licencia es obligatoria para choferes',
          path: ['nroLicencia'],
        });
      }
      if (!data.vencimientoLicencia) {
        ctx.addIssue({
          code: 'custom',
          message: 'El vencimiento es obligatorio',
          path: ['vencimientoLicencia'],
        });
      }
    }
  });

export type UsuarioFormData = z.infer<typeof usuarioSchema>;