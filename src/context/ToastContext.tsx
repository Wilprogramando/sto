import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastTipo = 'sucesso' | 'erro' | 'aviso' | 'info';

interface Toast {
  id: number;
  mensagem: string;
  tipo: ToastTipo;
}

interface ToastContextType {
  toast: (mensagem: string, tipo?: ToastTipo) => void;
  sucesso: (mensagem: string) => void;
  erro: (mensagem: string) => void;
  aviso: (mensagem: string) => void;
  info: (mensagem: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remover = useCallback((id: number) => {
    setToasts((arr) => arr.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (mensagem: string, tipo: ToastTipo = 'info') => {
      const id = Date.now() + Math.random();
      setToasts((arr) => [...arr, { id, mensagem, tipo }]);
      setTimeout(() => remover(id), 4000);
    },
    [remover]
  );

  const value: ToastContextType = {
    toast,
    sucesso: (m) => toast(m, 'sucesso'),
    erro: (m) => toast(m, 'erro'),
    aviso: (m) => toast(m, 'aviso'),
    info: (m) => toast(m, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remover(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const styles: Record<ToastTipo, { bg: string; icon: ReactNode }> = {
    sucesso: {
      bg: 'bg-green-50 border-green-300 text-green-900',
      icon: <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />,
    },
    erro: {
      bg: 'bg-red-50 border-red-300 text-red-900',
      icon: <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />,
    },
    aviso: {
      bg: 'bg-amber-50 border-amber-300 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />,
    },
    info: {
      bg: 'bg-blue-50 border-blue-300 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />,
    },
  };

  const s = styles[toast.tipo];

  return (
    <div
      className={`${s.bg} border rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 animate-slide-in`}
    >
      {s.icon}
      <p className="flex-1 text-sm font-medium">{toast.mensagem}</p>
      <button
        onClick={onClose}
        className="text-current opacity-60 hover:opacity-100 transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
  return ctx;
}
