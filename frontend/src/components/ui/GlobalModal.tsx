import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalStore } from '../../store/useModalStore';
import { ViajeForm } from '../../features/viajes/components/ViajeForm';
import type { Viaje, Ruta, Usuario } from '../../types';
import { ViajeDetalleContent } from '../../features/viajes/components/ViajeDetalleContent';
import { DetalleViajePublicoContent } from '../../features/viajes/components/DetalleViajePublicoContent';


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
      case 'CREAR_VIAJE':
        return (
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            <ViajeForm
              idEditando={null}
              viajeAEditar={null}
              rutasDisponibles={(data?.rutasDisponibles as Ruta[]) || []}
              choferesDisponibles={
                (data?.choferesDisponibles as Usuario[]) || []
              }
              onSuccess={async () => {
                if (data?.onSuccess && typeof data.onSuccess === 'function') {
                  await data.onSuccess();
                }
                closeModal();
              }}
              onCancelar={closeModal}
            />
          </div>
        );

      case 'EDITAR_VIAJE':
        return data?.viaje ? (
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            <ViajeForm
              idEditando={data.viaje.id ? String(data.viaje.id) : null}
              viajeAEditar={data.viaje}
              rutasDisponibles={(data?.rutasDisponibles as Ruta[]) || []}
              choferesDisponibles={
                (data?.choferesDisponibles as Usuario[]) || []
              }
              onSuccess={async () => {
                if (data?.onSuccess && typeof data.onSuccess === 'function') {
                  await data.onSuccess();
                }
                closeModal();
              }}
              onCancelar={closeModal}
            />
          </div>
        ) : null;

      case 'CONFIRMAR_ELIMINAR':
        return (
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Confirmar Acción
            </h3>
            <p className="text-slate-600 mb-6">
              {data?.mensaje ||
                '¿Estás seguro de que deseas eliminar este elemento?'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (data?.onConfirm && typeof data.onConfirm === 'function') {
                    await data.onConfirm();
                  }
                  closeModal();
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        );

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
