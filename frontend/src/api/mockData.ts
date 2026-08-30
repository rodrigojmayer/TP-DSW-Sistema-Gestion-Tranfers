import type { Usuario, Ruta } from '../types';

export const mockUsuarios: Usuario[] = [
  {
    idUsuario: 'usr-1',
    usuario: 'jdoe',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@email.com',
    telefono: '1198765432',
    rol: 'ADMIN',
  },
];

export const mockRutas: Ruta[] = [
  {
    idRuta: 'rut-1',
    nombre: 'Ezeiza - Centro Madero',
    puntosRuta: [
      { idPunto: 'p-1', direccion: 'Aeropuerto Ezeiza (EZE)', orden: 1 },
      { idPunto: 'p-2', direccion: 'Parada Quilmes', orden: 2 },
      { idPunto: 'p-3', direccion: 'Terminal Madero', orden: 3 },
    ],
  },
];
