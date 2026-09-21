import { apiFetch } from '../../../api/apiClient';
import type { Usuario } from '../../../types';
import type { UsuarioFormData } from '../schemas/usuarioSchema';

const mapearUsuario = (usuario: Usuario): Usuario => ({
  ...usuario,
  idUsuario: usuario.idUsuario || usuario.id || '',
});

export const usuarioService = {
  // 1. OBTENER TODOS (Solo ADMIN)
  obtenerTodos: async (): Promise<Usuario[]> => {
    const usuarios = await apiFetch<Usuario[]>('/usuario');
    return usuarios.map(mapearUsuario);
  },

  // 2. OBTENER MI PERFIL (Usuario autenticado)
  obtenerMiPerfil: async (): Promise<Usuario> => {
    const usuario = await apiFetch<Usuario>('/usuario/me');
    return mapearUsuario(usuario);
  },

  // 3. OBTENER POR ID (Solo ADMIN)
  obtenerPorId: async (id: string): Promise<Usuario> => {
    const usuario = await apiFetch<Usuario>(`/usuario/${id}`);
    return mapearUsuario(usuario);
  },

  // 4. CREAR NUEVO USUARIO (Solo ADMIN)
  crear: async (datos: UsuarioFormData): Promise<Usuario> => {
    const nuevoUsuario = await apiFetch<Usuario>('/usuario', {
      method: 'POST',
      body: JSON.stringify(datos),
    });
    return mapearUsuario(nuevoUsuario);
  },

  // 5. ACTUALIZAR USUARIO (Solo ADMIN)
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

  // 6. ACTUALIZAR MI PERFIL
  actualizarMiPerfil: async (
    datos: Partial<UsuarioFormData>
  ): Promise<Usuario> => {
    const usuarioActualizado = await apiFetch<Usuario>('/usuario/me', {
      method: 'PATCH',
      body: JSON.stringify(datos),
    });
    return mapearUsuario(usuarioActualizado);
  },

  // 7. ELIMINAR USUARIO (Solo ADMIN)
  eliminar: async (id: string): Promise<void> => {
    return apiFetch<void>(`/usuario/${id}`, {
      method: 'DELETE',
    });
  },
};