import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const Toast = ({ toast, onDismiss }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timeout;
    if (toast.duration > 0) {
      timeout = setTimeout(() => {
        handleDismiss();
      }, toast.duration);
    }
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 200); // Wait for CSS transition (matches --transition-base)
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all ease-out duration-200 transform ${
        isClosing ? 'translate-x-8 opacity-0 scale-95' : 'translate-x-0 opacity-100 scale-100 animate-slide-in-right'
      } ${
        toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
        toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
        'bg-blue-50 border-blue-200 text-blue-800'
      }`}
      style={{
        transitionDuration: 'var(--transition-base)',
        transitionTimingFunction: 'var(--ease-standard)'
      }}
    >
      {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
      {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
      {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
      
      <p className="text-sm font-semibold tracking-tight">{toast.message}</p>
      
      <button
        onClick={handleDismiss}
        className="ml-2 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors duration-150"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
