// import type { Reserva } from '../../../types';
// import type { ReservaFormData } from '../schemas/reservaSchema';

// let reservasMock: Reserva[] = [
//   {
//     idReserva: 'reserva-1',
//     idViaje: 'viaje-1',
//     idPasajero: 'usuario-1',
//     asiento: 12,
//     precioFinal: 4500,
//     estado: 'RESERVADO',
//     fechaReserva: new Date().toISOString(),
//   },
// ];

// export const reservaService = {
//   obtenerTodas: async (): Promise<Reserva[]> => {
//     return new Promise((resolve) => {
//       setTimeout(() => resolve([...reservasMock]), 500);
//     });
//   },

//   crear: async (data: ReservaFormData): Promise<Reserva> => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         const nuevaReserva: Reserva = {
//           idReserva: crypto.randomUUID(),
//           idViaje: data.idViaje,
//           idPasajero: data.idPasajero,
//           asiento: data.asiento,
//           precioFinal: data.precioFinal,
//           estado: 'RESERVADO',
//           fechaReserva: new Date().toISOString(),
//         };
//         reservasMock.push(nuevaReserva);
//         resolve(nuevaReserva);
//       }, 700);
//     });
//   },

//   cancelar: async (id: string): Promise<void> => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         reservasMock = reservasMock.map((r) =>
//           r.idReserva === id ? { ...r, estado: 'CANCELADO' } : r,
//         );
//         resolve();
//       }, 400);
//     });
//   },
// };

// cambio con usuario logueado y sin loguear

import type { Reserva } from '../../../types';
import type { ReservaFormData } from '../schemas/reservaSchema';

let reservasMock: Reserva[] = [
  {
    idReserva: 'res-101',
    idViaje: 'viaje-1',
    tipoReserva: 'LOGUEADO',
    idCliente: 'usr-cliente-1',
    pasajero: {
      nombre: 'Carlos',
      apellido: 'Gómez',
      dni: '38123456',
      email: 'carlos@gmail.com',
      telefono: '+543415550199',
    },
    asiento: 14,
    precioFinal: 5000,
    estado: 'RESERVADO',
    fechaReserva: new Date().toISOString(),
  },
];

export const reservaService = {
  obtenerTodas: async (): Promise<Reserva[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve([...reservasMock]), 400),
    );
  },

  crear: async (data: ReservaFormData): Promise<Reserva> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nuevaReserva: Reserva = {
          idReserva: crypto.randomUUID(),
          idViaje: data.idViaje,
          tipoReserva: data.tipoReserva,
          idCliente:
            data.tipoReserva === 'LOGUEADO' ? data.idCliente : undefined,
          pasajero: {
            nombre: data.pasajeroNombre,
            apellido: data.pasajeroApellido,
            dni: data.pasajeroDni,
            email: data.pasajeroEmail || '',
            telefono: data.pasajeroTelefono || '',
          },
          asiento: data.asiento,
          precioFinal: data.precioFinal,
          estado: 'RESERVADO',
          fechaReserva: new Date().toISOString(),
        };

        reservasMock.unshift(nuevaReserva);
        resolve(nuevaReserva);
      }, 600);
    });
  },

  cancelar: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        reservasMock = reservasMock.map((r) =>
          r.idReserva === id ? { ...r, estado: 'CANCELADO' } : r,
        );
        resolve();
      }, 300);
    });
  },
};