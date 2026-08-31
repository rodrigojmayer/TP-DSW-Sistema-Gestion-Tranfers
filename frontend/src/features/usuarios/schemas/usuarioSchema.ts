

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
const ROLES_INTERNOS = ['ADMIN', 'OPERADOR', 'CHOFER'] as [RolUsuario, ...RolUsuario[]];

export const usuarioSchema = z
  .object({
    usuario: z
      .string()
      .min(3, { message: 'El usuario debe tener al menos 3 caracteres' }),
    nombre: z.string().min(2, { message: 'El nombre es obligatorio' }),
    apellido: z.string().min(2, { message: 'El apellido es obligatorio' }),
    email: z
      .string()
      .min(1, { message: 'El email es obligatorio' })
      .email({ message: 'Debe ser un email válido' }),
    telefono: z
      .string()
      .min(8, { message: 'El teléfono debe tener al menos 8 dígitos' }),
    rol: z.enum(ROLES_INTERNOS),
    nroLicencia: z.string().optional(),
    vencimientoLicencia: z.string().optional(),
  })
  // ... (el resto del superRefine queda igual)
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







// import { z } from 'zod';
// import type { RolUsuario } from '../../../types';

// // Definimos una tupla estricta con los valores reales de tu tipo

// const ROLES_VALIDOS: [RolUsuario, ...RolUsuario[]] = [
//   'ADMIN',
//   'CLIENTE',
//   'OPERADOR',
//   'CHOFER'
// ];

// export const usuarioSchema = z.object({
//   usuario: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
//   nombre: z.string().min(2, 'El nombre es obligatorio'),
//   apellido: z.string().min(2, 'El apellido es obligatorio'),
//   email: z.string().email('Debe ser un email válido'),
//   telefono: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
//   rol: z.enum(ROLES_VALIDOS), // <-- Aquí se lee 'RolUsuario', eliminando el error
// });

// export type UsuarioFormData = z.infer<typeof usuarioSchema>;
