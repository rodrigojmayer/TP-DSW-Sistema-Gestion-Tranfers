// src/components/ui/GlobalModal.tsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalStore } from '../../store/useModalStore';

import { ViajeDetalleContent } from '../../features/viajes/components/ViajeDetalleContent';
import { DetalleViajePublicoContent } from '../../features/viajes/components/DetalleViajePublicoContent';
import type { Viaje } from '../../types';

export const GlobalModal = () => {
  const { isOpen, type, title, data, content, closeModal } = useModalStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeModal]);

  if (!isOpen || !type) return null;

  const renderContent = () => {
    switch (type) {
      case 'VER_DETALLE_VIAJE':
      case 'DETALLE_VIAJE':
        return data?.viaje ? (
          <ViajeDetalleContent viaje={data.viaje} onCerrar={closeModal} />
        ) : null;

      case 'DETALLE_VIAJE_PUBLICO':
        return data?.viaje ? (
          <DetalleViajePublicoContent
            viaje={data.viaje}
            onClose={closeModal}
            onReservar={data.onReservar as ((viaje: Viaje) => void) | undefined}
          />
        ) : null;

      default:
        return (
          <>
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">
                {title || 'Detalles'}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grow">{content}</div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
              >
                Cerrar
              </button>
            </div>
          </>
        );
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>
    </div>,
    document.body,
  );
};

//antes ultima prueba

// // src/components/ui/GlobalModal.tsx
// import { useEffect } from 'react';
// import { createPortal } from 'react-dom';
// import { X } from 'lucide-react';
// import { useModalStore } from '../../store/useModalStore';

// import { ViajeDetalleContent } from '../../features/viajes/components/ViajeDetalleContent';
// import { DetalleViajePublicoContent } from '../../features/viajes/components/DetalleViajePublicoContent';
// import type { Viaje } from '../../types';

// export const GlobalModal = () => {
//   const { isOpen, type, title, data, content, closeModal } = useModalStore();

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') closeModal();
//     };

//     if (isOpen) {
//       window.addEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'hidden';
//     }

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, closeModal]);

//   if (!isOpen || !type) return null;

//   const renderContent = () => {
//     switch (type) {
//       case 'VER_DETALLE_VIAJE':
//       case 'DETALLE_VIAJE':
//         return data?.viaje ? (
//           <ViajeDetalleContent viaje={data.viaje} onCerrar={closeModal} />
//         ) : null;

//       case 'DETALLE_VIAJE_PUBLICO':
//         return data?.viaje ? (
//           <DetalleViajePublicoContent
//             viaje={data.viaje}
//             onClose={closeModal}
//             onReservar={data.onReservar as ((viaje: Viaje) => void) | undefined}
//           />
//         ) : null;

//       default:
//         return (
//           <>
//             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
//               <h3 className="text-lg font-bold text-slate-800">
//                 {title || 'Detalles'}
//               </h3>
//               <button
//                 onClick={closeModal}
//                 className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
//                 aria-label="Cerrar modal"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6 overflow-y-auto grow">{content}</div>

//             <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
//               <button
//                 onClick={closeModal}
//                 className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
//               >
//                 Cerrar
//               </button>
//             </div>
//           </>
//         );
//     }
//   };

//   return createPortal(
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
//       onClick={closeModal}
//     >
//       <div
//         className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {renderContent()}
//       </div>
//     </div>,
//     document.body,
//   );
// };

// *******

// import { useEffect } from 'react';
// import { createPortal } from 'react-dom';
// import { X } from 'lucide-react';
// import { useModalStore } from '../../store/useModalStore';

// import { ViajeDetalleContent } from '../../features/viajes/components/ViajeDetalleContent';
// import { DetalleViajePublicoContent } from '../../features/viajes/components/DetalleViajePublicoContent';
// import type { Viaje } from '../../types';

// export const GlobalModal = () => {
//   const { isOpen, type, title, data, content, closeModal } = useModalStore();

//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') closeModal();
//     };

//     if (isOpen) {
//       window.addEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'hidden';
//     }

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, closeModal]);

//   if (!isOpen || !type) return null;

//   const renderContent = () => {
//     switch (type) {
//       case 'VER_DETALLE_VIAJE':
//       case 'DETALLE_VIAJE':
//         return data?.viaje ? (
//           <ViajeDetalleContent viaje={data.viaje} onCerrar={closeModal} />
//         ) : null;

//       case 'DETALLE_VIAJE_PUBLICO':
//         return data?.viaje ? (
//           <DetalleViajePublicoContent
//             viaje={data.viaje}
//             onClose={closeModal}
//             onReservar={data.onReservar as ((viaje: Viaje) => void) | undefined}
//           />
//         ) : null;

//       default:
//         return (
//           <>
//             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
//               <h3 className="text-lg font-bold text-slate-800">
//                 {title || 'Detalles'}
//               </h3>
//               <button
//                 onClick={closeModal}
//                 className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
//                 aria-label="Cerrar modal"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6 overflow-y-auto grow">{content}</div>

//             <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
//               <button
//                 onClick={closeModal}
//                 className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
//               >
//                 Cerrar
//               </button>
//             </div>
//           </>
//         );
//     }
//   };

//   return createPortal(
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
//       onClick={closeModal}
//     >
//       <div
//         className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {renderContent()}
//       </div>
//     </div>,
//     document.body,
//   );
// };

// ultimo funcionando

// // src/components/ui/GlobalModal.tsx
// import { useEffect } from 'react';
// import { createPortal } from 'react-dom';
// import { X } from 'lucide-react';
// import { useModalStore } from '../../store/useModalStore';

// // Importación de componentes de modales específicos
// import { ViajeDetalleContent } from '../../features/viajes/components/ViajeDetalleContent';
// import { DetalleViajePublicoModal } from '../../features/viajes/components/DetalleViajePublicoModal';

// export const GlobalModal = () => {
//   const { isOpen, type, title, data, content, closeModal } = useModalStore();

//   // Escuchar la tecla Escape y bloquear el scroll del fondo cuando el modal está abierto
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') closeModal();
//     };

//     if (isOpen) {
//       window.addEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'hidden';
//     }

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, closeModal]);

//   if (!isOpen || !type) return null;

//   // Función para renderizar el contenido según el 'type' del modal
//   const renderContent = () => {
//     switch (type) {
//       case 'VER_DETALLE_VIAJE':
//       case 'DETALLE_VIAJE':
//         return data?.viaje ? (
//           <ViajeDetalleContent viaje={data.viaje} onCerrar={closeModal} />
//         ) : null;

//       case 'DETALLE_VIAJE_PUBLICO':
//         return data?.viaje ? (
//           <DetalleViajePublicoModal viaje={data.viaje} onClose={closeModal} />
//         ) : null;

//       // ... Agrega aquí nuevos tipos cuando crees más modales (CREAR_VIAJE, EDITAR_VIAJE, etc.)

//       default:
//         /* Contenido por defecto / fallback en caso de pasar un ReactNode directo */
//         return (
//           <>
//             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
//               <h3 className="text-lg font-bold text-slate-800">
//                 {title || 'Detalles'}
//               </h3>
//               <button
//                 onClick={closeModal}
//                 className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
//                 aria-label="Cerrar modal"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-6 overflow-y-auto grow">{content}</div>

//             <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
//               <button
//                 onClick={closeModal}
//                 className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
//               >
//                 Cerrar
//               </button>
//             </div>
//           </>
//         );
//     }
//   };

//   return createPortal(
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
//       onClick={closeModal}
//     >
//       <div
//         className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {renderContent()}
//       </div>
//     </div>,
//     document.body,
//   );
// };

// import { useEffect } from 'react';
// import { createPortal } from 'react-dom';
// import { X } from 'lucide-react';
// import { useModalStore } from '../../store/useModalStore';
// import { ViajeDetalleContent } from '../../features/viajes/components/ViajeDetalleContent';

// export const GlobalModal = () => {
//   const { isOpen, type, title, data, content, closeModal } = useModalStore();

//   // Escuchar la tecla Escape y bloquear el scroll del fondo
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') closeModal();
//     };

//     if (isOpen) {
//       window.addEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'hidden';
//     }

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       document.body.style.overflow = 'unset';
//     };
//   }, [isOpen, closeModal]);

//   if (!isOpen) return null;

//   return createPortal(
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
//       onClick={closeModal}
//     >
//       <div
//         className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Renderizado según el tipo de modal */}
//         {type === 'DETALLE_VIAJE' && data.viaje ? (
//           <ViajeDetalleContent viaje={data.viaje} onCerrar={closeModal} />
//         ) : (
//           /* Renderizado genérico para modales custom o basados en ReactNode */
//           <>
//             {/* Encabezado */}
//             <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50 shrink-0">
//               <h3 className="text-lg font-bold text-slate-800">
//                 {title || 'Detalles'}
//               </h3>
//               <button
//                 onClick={closeModal}
//                 className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition"
//                 aria-label="Cerrar modal"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Contenido Dinámico */}
//             <div className="p-6 overflow-y-auto grow">{content}</div>

//             {/* Pie del Modal */}
//             <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
//               <button
//                 onClick={closeModal}
//                 className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-lg transition"
//               >
//                 Cerrar
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>,
//     document.body,
//   );
// };

// // src/components/ui/GlobalModal.tsx
// import { useEffect } from 'react';
// import { createPortal } from 'react-dom';
// import { useModalStore } from '../../store/useModalStore';

// export const GlobalModal = () => {
//   const { isOpen, title, content, closeModal } = useModalStore();

//   // Escuchar la tecla Escape para cerrar
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') closeModal();
//     };

//     if (isOpen) {
//       window.addEventListener('keydown', handleKeyDown);
//     }

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [isOpen, closeModal]);

//   if (!isOpen) return null;

//   return createPortal(
//     <div
//       className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
//       onClick={closeModal}
//     >
//       <div
//         className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
//         onClick={(e) => e.stopPropagation()} // Evita cerrar si hace clic dentro del modal
//       >
//         {/* Encabezado */}
//         <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50">
//           <h3 className="text-lg font-bold text-slate-800">{title}</h3>
//           <button
//             onClick={closeModal}
//             className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition"
//             aria-label="Cerrar modal"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Contenido Dinámico */}
//         <div className="p-6 overflow-x-auto max-h-[75vh]">{content}</div>

//         {/* Pie del Modal */}
//         <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
//           <button
//             onClick={closeModal}
//             className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium text-sm rounded-md transition"
//           >
//             Cerrar
//           </button>
//         </div>
//       </div>
//     </div>,
//     document.body,
//   );
// };

// // import React, { useEffect } from 'react';
// // import { createPortal } from 'react-dom';

// // interface ModalProps {
// //   isOpen: boolean;
// //   onClose: () => void;
// //   title?: string;
// //   children: React.ReactNode;
// //   size?: 'sm' | 'md' | 'lg' | 'xl';
// // }

// // export const Modal: React.FC<ModalProps> = ({
// //   isOpen,
// //   onClose,
// //   title,
// //   children,
// //   size = 'md',
// // }) => {
// //   // Cerrar al presionar la tecla ESC & bloquear el scroll de fondo
// //   useEffect(() => {
// //     const handleKeyDown = (e: KeyboardEvent) => {
// //       if (e.key === 'Escape') onClose();
// //     };

// //     if (isOpen) {
// //       document.body.style.overflow = 'hidden';
// //       window.addEventListener('keydown', handleKeyDown);
// //     }

// //     return () => {
// //       document.body.style.overflow = 'unset';
// //       window.removeEventListener('keydown', handleKeyDown);
// //     };
// //   }, [isOpen, onClose]);

// //   if (!isOpen) return null;

// //   // Clases según el tamaño deseado
// //   const sizeClasses = {
// //     sm: 'max-w-sm',
// //     md: 'max-w-md',
// //     lg: 'max-w-lg',
// //     xl: 'max-w-2xl',
// //   };

// //   return createPortal(
// //     <div
// //       aria-modal="true"
// //       role="dialog"
// //       className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
// //       onClick={onClose} // Cierra al hacer clic en el backdrop
// //     >
// //       {/* Contenedor del Modal (evita que los clics internos cierren el modal) */}
// //       <div
// //         className={`w-full ${sizeClasses[size]} rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-gray-800 dark:text-white transform animate-scale-up`}
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         {/* Encabezado */}
// //         <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
// //           {title && (
// //             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
// //               {title}
// //             </h3>
// //           )}
// //           <button
// //             onClick={onClose}
// //             type="button"
// //             className="ml-auto inline-flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white"
// //           >
// //             <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
// //               <path
// //                 fillRule="evenodd"
// //                 d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
// //                 clipRule="evenodd"
// //               />
// //             </svg>
// //           </button>
// //         </div>

// //         {/* Cuerpo del Modal */}
// //         <div className="mt-4">{children}</div>
// //       </div>
// //     </div>,
// //     document.body,
// //   );
// // };
