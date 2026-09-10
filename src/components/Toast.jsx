import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function Toast() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.toast, dispatch]);

  if (!state.toast) return null;

  const styles = {
    success: {
      bg: 'bg-emerald-50 border-emerald-300',
      text: 'text-emerald-800',
      Icon: CheckCircle,
      iconColor: 'text-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50 border-amber-300',
      text: 'text-amber-800',
      Icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    info: {
      bg: 'bg-blue-50 border-blue-300',
      text: 'text-blue-800',
      Icon: Info,
      iconColor: 'text-blue-500',
    },
  };

  const s = styles[state.toast.type] || styles.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-lg ${s.bg}`}
      >
        <s.Icon className={`w-5 h-5 flex-shrink-0 ${s.iconColor}`} />
        <span className={`text-sm font-medium ${s.text}`}>{state.toast.message}</span>
        <button
          onClick={() => dispatch({ type: 'HIDE_TOAST' })}
          className="ml-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
