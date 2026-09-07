

import { z } from 'zod';
import type { RolUsuario } from '../../../types';

// En el panel admin solo gestionamos personal interno
// Definimos la tupla estricta asegurando que son roles válidos (ignorando CLIENTE)
// const ROLES_INTERNOS: [Extract<RolUsuario, 'ADMIN' | 'OPERADOR' | 'CHOFER'>, ...string[]] = [
//   'ADMIN', 
//   'OPERADOR', 
//   'CHOFER'
// ];

// Al castearlo usando tu tipo global, TypeScript y React Hook Form sabrán exactamente qué valores son válidos


const ROLES_INTERNOS = ['ADMIN', 'OPERADOR', 'CHOFER'] as [
  RolUsuario,
  ...RolUsuario[],
];

export const usuarioSchema = z
  .object({
    usuario: z
      .string()
      .min(3, { error: 'El usuario debe tener al menos 3 caracteres' }), // En v4 se usa 'error'
    dni: z
      .string()
      .min(6, 'El DNI debe tener al menos 6 números')
      .max(8, 'El DNI no puede tener más de 8 números')
      .regex(/^[0-9]+$/, 'El DNI solo debe contener números'),
    nombre: z.string().min(2, { error: 'El nombre es obligatorio' }),
    apellido: z.string().min(2, { error: 'El apellido es obligatorio' }),

    // ✅ CORRECCIÓN PARA ZOD V4 (Sin warnings de desuso ni errores de nombres externos):
    email: z
      .string()
      .trim()
      .min(1, 'El email es obligatorio')
      .pipe(z.email('Debe ser un email válido')),

    telefono: z
      .string()
      .min(8, { error: 'El teléfono debe tener al menos 8 dígitos' }),
    rol: z.enum(ROLES_INTERNOS),
    nroLicencia: z.string().optional(),
    vencimientoLicencia: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validación condicional: Si es chofer, exigimos los datos extra
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







