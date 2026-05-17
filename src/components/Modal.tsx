import { ReactNode, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ModalProps {
  aberto: boolean;
  onFechar: () => void;
  titulo?: string;
  children: ReactNode;
  largura?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Modal({
  aberto,
  onFechar,
  titulo,
  children,
  largura = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFechar();
    };
    if (aberto) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  const larguras: Record<string, string> = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    '2xl': 'max-w-7xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onFechar}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${larguras[largura]} max-h-[90vh] flex flex-col animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {titulo && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">{titulo}</h2>
            <button
              onClick={onFechar}
              className="text-gray-400 hover:text-gray-700 transition p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  aberto: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  perigo?: boolean;
}

export function ConfirmModal({
  aberto,
  onConfirmar,
  onCancelar,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  perigo = true,
}: ConfirmModalProps) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onCancelar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                perigo ? 'bg-red-100' : 'bg-amber-100'
              }`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${
                  perigo ? 'text-red-600' : 'text-amber-600'
                }`}
              />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{titulo}</h3>
              <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">
                {mensagem}
              </p>
            </div>
          </div>
          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={onCancelar}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
            >
              {textoCancelar}
            </button>
            <button
              onClick={onConfirmar}
              className={`px-4 py-2 rounded-lg text-white font-medium transition ${
                perigo
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {textoConfirmar}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
