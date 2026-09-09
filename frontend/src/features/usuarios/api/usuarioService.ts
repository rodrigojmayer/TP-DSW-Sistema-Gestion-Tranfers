

import type { Usuario } from '../../../types';
import type { UsuarioFormData } from '../schemas/usuarioSchema'; // Ajusta la ruta a tu schema

const STORAGE_KEY = 'transfers_app_usuarios';

const obtenerUsuariosIniciales = (): Usuario[] => {
  const guardadas = localStorage.getItem(STORAGE_KEY);
  if (guardadas) {
    try {
      return JSON.parse(guardadas);
    } catch {
      // Ignorar error
    }
  }

  // Datos mock con el campo 'dni' incluido para todos
  const iniciales: Usuario[] = [
    {
      idUsuario: 'cliente-1',
      usuario: 'juanperez',
      nombre: 'Juan',
      apellido: 'Pérez',
      dni: '32111222',
      email: 'juan.perez@email.com',
      telefono: '3414112233',
      rol: 'CLIENTE',
    },
    {
      idUsuario: 'chofer-1',
      usuario: 'robertito',
      nombre: 'Roberto',
      apellido: 'Sánchez',
      dni: '28111444',
      email: 'roberto.chofer@transfer.com',
      telefono: '3419887766',
      rol: 'CHOFER',
      nroLicencia: 'LIC-28111',
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(iniciales));
  return iniciales;
};

export const usuarioService = {
  // 1. OBTENER TODOS
  obtenerTodos: async (): Promise<Usuario[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return obtenerUsuariosIniciales();
  },

  // 2. CREAR NUEVO USUARIO 
  crear: async (datos: UsuarioFormData): Promise<Usuario> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const usuarios = obtenerUsuariosIniciales();

    const nuevoUsuario: Usuario = {
      idUsuario: `usr-${Date.now()}`, // Genera ID único falso
      usuario: datos.usuario,
      nombre: datos.nombre,
      apellido: datos.apellido,
      dni: datos.dni,
      email: datos.email,
      telefono: datos.telefono,
      rol: datos.rol,
      nroLicencia: datos.nroLicencia,
    };

    const nuevosUsuarios = [...usuarios, nuevoUsuario];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosUsuarios));
    return nuevoUsuario;
  },

 


// actualizar
actualizar: async (idUsuario: string, datos: Partial<UsuarioFormData>): Promise<Usuario> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const usuarios = obtenerUsuariosIniciales();
    const index = usuarios.findIndex((u) => u.idUsuario === idUsuario);
    
    if (index === -1) throw new Error('Usuario no encontrado');

    // Mantenemos el ID original y actualizamos el resto de los campos
    const usuarioActualizado: Usuario = {
      ...usuarios[index],
      ...datos,
    };

    usuarios[index] = usuarioActualizado;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
    return usuarioActualizado;
  },

  eliminar: async (idUsuario: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const usuarios = obtenerUsuariosIniciales();
    const usuariosFiltrados = usuarios.filter((u) => u.idUsuario !== idUsuario);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usuariosFiltrados));
  }
};