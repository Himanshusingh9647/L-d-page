import { useApp } from '../context/AppContext';
import ModuleCard from '../components/ModuleCard';
import ProgressBar from '../components/ProgressBar';
import { BookOpen, Trophy, Clock } from 'lucide-react';

export default function EmployeeDashboard() {
  const { currentUser, state, getUserMandatoryCompletion, getModuleProgress } = useApp();
  const { completed, total } = getUserMandatoryCompletion(state.currentUserId);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div>
      {/* ── Welcome Banner ────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <p className="text-slate-500 text-sm font-medium mb-1">{greeting()},</p>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">{currentUser?.name}</h2>
          <p className="text-slate-600 text-sm max-w-xl">
            Please complete your mandatory training modules to stay compliant with corporate policies.
            {completed === total
              ? " You're currently up to date."
              : ` You have ${total - completed} module${total - completed > 1 ? 's' : ''} remaining.`}
          </p>
          
          <div className="mt-5 max-w-md">
            <ProgressBar value={completed} max={total} size="md" />
          </div>
        </div>

        <div className="flex gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div className="text-center min-w-[80px]">
            <p className="text-3xl font-bold text-slate-800">{completed}/{total}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">MANDATORY</p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-3xl font-bold text-slate-800">{state.modules.length}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">TOTAL</p>
          </div>
        </div>
      </div>

      {/* ── Section header ────────────────────────────── */}
      <div className="flex items-center justify-between mb-5 border-b border-slate-200 pb-3">
        <h3 className="text-lg font-semibold text-slate-900">Training Modules</h3>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Clock className="w-4 h-4" />
          Last updated: Today
        </div>
      </div>

      {/* ── Module Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.modules.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            progress={getModuleProgress(state.currentUserId, mod.id)}
          />
        ))}
      </div>
    </div>
  );
}
