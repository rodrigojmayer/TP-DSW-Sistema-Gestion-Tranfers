import { apiFetch } from '../../../api/apiClient';
import type { Usuario } from '../../../types';
import type { UsuarioFormData } from '../schemas/usuarioSchema';

const mapearUsuario = (usuario: Usuario): Usuario => ({
  ...usuario,
  idUsuario: usuario.idUsuario || usuario.id || '',
});

export const usuarioService = {
  obtenerTodos: async (): Promise<Usuario[]> => {
    const usuarios = await apiFetch<Usuario[]>('/usuario');
    return usuarios.map(mapearUsuario);
  },

  obtenerMiPerfil: async (): Promise<Usuario> => {
    const usuario = await apiFetch<Usuario>('/usuario/me');
    return mapearUsuario(usuario);
  },

  obtenerPorId: async (id: string): Promise<Usuario> => {
    const usuario = await apiFetch<Usuario>(`/usuario/${id}`);
    return mapearUsuario(usuario);
  },

  crear: async (datos: UsuarioFormData): Promise<Usuario> => {
    const nuevoUsuario = await apiFetch<Usuario>('/usuario', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
    return mapearUsuario(nuevoUsuario);
  },

  actualizar: async (
    id: string,
    datos: Partial<UsuarioFormData>
  ): Promise<Usuario> => {
    const usuarioActualizado = await apiFetch<Usuario>(`/usuario/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(datos),
    });
    return mapearUsuario(usuarioActualizado);
  },

  actualizarMiPerfil: async (
    datos: Partial<UsuarioFormData>
  ): Promise<Usuario> => {
    const usuarioActualizado = await apiFetch<Usuario>('/usuario/me', {
      method: 'PATCH',
      body: JSON.stringify(datos),
    });
    return mapearUsuario(usuarioActualizado);
  },

  eliminar: async (id: string): Promise<void> => {
    return apiFetch<void>(`/usuario/${id}`, {
      method: 'DELETE',
    });
  },
};