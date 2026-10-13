// src/store/useModalStore.ts
import { create } from 'zustand';
import type { ReactNode } from 'react';
import type { Viaje } from '../types';

// 1. Agregamos los nuevos tipos de modales que necesitas
export type ModalType =
  | 'DETALLE_VIAJE'
  | 'VER_DETALLE_VIAJE'
  | 'DETALLE_VIAJE_PUBLICO'
  | 'CREAR_VIAJE'
  | 'EDITAR_VIAJE'
  | 'CONFIRMAR_ELIMINAR'
  | 'CREAR_RESERVA' // 🟢 Añade esta opción aquí
  | 'CUSTOM'
  | null;

export interface ModalData {
  viaje?: Viaje;
  mensaje?: string;
  onSuccess?: () => void;
  onConfirm?: () => void;
  [key: string]: unknown;
}

interface ModalOptions {
  title?: string;
  data?: ModalData;
  content?: ReactNode;
}

interface ModalState {
  isOpen: boolean;
  type: ModalType;
  title?: string;
  data: ModalData;
  content?: ReactNode | null;
  // Permitimos enviar las opciones tradicionales ({ title, data }) o directamente el objeto ModalData
  openModal: (
    type: ModalType,
    optionsOrData?: ModalOptions | ModalData,
  ) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  type: null,
  title: '',
  data: {},
  content: null,

  openModal: (type, optionsOrData = {}) =>
    set(() => {
      // Normalizamos la entrada para soportar openModal('DETALLE_VIAJE', { viaje })
      const isOptionsObj =
        'title' in optionsOrData ||
        'data' in optionsOrData ||
        'content' in optionsOrData;

      if (isOptionsObj) {
        const opts = optionsOrData as ModalOptions;
        return {
          isOpen: true,
          type,
          title: opts.title || '',
          data: opts.data || {},
          content: opts.content || null,
        };
      }

      return {
        isOpen: true,
        type,
        title: '',
        data: optionsOrData as ModalData,
        content: null,
      };
    }),

  closeModal: () =>
    set({
      isOpen: false,
      type: null,
      title: '',
      data: {},
      content: null,
    }),
}));

// ****************  MODAL STORE  *****************

// import { create } from 'zustand';
// import type { ReactNode } from 'react';
// import type { Viaje } from '../types';

// export type ModalType = 'DETALLE_VIAJE' | 'CUSTOM' | null;

// export interface ModalData {
//   viaje?: Viaje;
//   [key: string]: unknown;
// }

// interface ModalState {
//   isOpen: boolean;
//   type: ModalType;
//   title?: string;
//   data: ModalData;
//   content?: ReactNode | null;
//   openModal: (
//     type: ModalType,
//     options?: { title?: string; data?: ModalData; content?: ReactNode },
//   ) => void;
//   closeModal: () => void;
// }

// export const useModalStore = create<ModalState>((set) => ({
//   isOpen: false,
//   type: null,
//   title: '',
//   data: {},
//   content: null,

//   openModal: (type, options = {}) =>
//     set({
//       isOpen: true,
//       type,
//       title: options.title || '',
//       data: options.data || {},
//       content: options.content || null,
//     }),

//   closeModal: () =>
//     set({
//       isOpen: false,
//       type: null,
//       title: '',
//       data: {},
//       content: null,
//     }),
// }));

//*************** */

// import { create } from 'zustand';
// import type { ReactNode } from 'react';

// interface ModalState {
//   isOpen: boolean;
//   title: string;
//   content: ReactNode | null;
//   openModal: (title: string, content: ReactNode) => void;
//   closeModal: () => void;
// }

// export const useModalStore = create<ModalState>((set) => ({
//   isOpen: false,
//   title: '',
//   content: null,
//   openModal: (title, content) => set({ isOpen: true, title, content }),
//   closeModal: () => set({ isOpen: false, title: '', content: null }),
// }));
