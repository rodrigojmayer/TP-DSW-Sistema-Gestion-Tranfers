import type { Usuario } from '../../../types';
import { mockUsuarios } from '../../../api/mockData';

let usuariosDB = [...mockUsuarios];

export const usuarioService = {
  obtenerTodos: async (): Promise<Usuario[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [...usuariosDB];
  },

  crear: async (datos: Omit<Usuario, 'idUsuario'>): Promise<Usuario> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const nuevoUsuario: Usuario = {
      ...datos,
      idUsuario: `usr-${Date.now()}`,
    };
    usuariosDB.push(nuevoUsuario);
    return nuevoUsuario;
  },

  eliminar: async (idUsuario: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    usuariosDB = usuariosDB.filter((u) => u.idUsuario !== idUsuario);
  },
};
