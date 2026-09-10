import { useNavigate } from 'react-router-dom';
import { Play, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Badge from './Badge';

export default function ModuleCard({ module, progress }) {
  const navigate = useNavigate();
  const isCompleted = progress?.status === 'completed';
  const inProgress = progress?.status === 'pending' && progress?.resumeTime > 0;

  return (
    <button
      onClick={() => !isCompleted && navigate(`/module/${module.id}`)}
      disabled={isCompleted}
      className={`group relative w-full text-left rounded-lg border overflow-hidden transition-colors
        ${isCompleted
          ? 'bg-slate-50 border-slate-200 cursor-default'
          : 'bg-white border-slate-200 hover:border-slate-400 cursor-pointer shadow-sm hover:shadow'
        }`}
    >
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded text-white ${
              module.type === 'video' ? 'bg-blue-600' : 'bg-slate-700'
            }`}>
              {module.type === 'video' ? (
                <Play className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {module.type}
            </span>
          </div>
          <div>
            {module.required && <Badge variant="required">Required</Badge>}
          </div>
        </div>

        {/* Title + description */}
        <h3 className={`text-base font-semibold mb-1.5 leading-snug ${isCompleted ? 'text-slate-600' : 'text-slate-900'}`}>
          {module.title}
        </h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
          {module.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {module.duration}
          </span>
          {isCompleted ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-green-700">
              <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
          ) : inProgress ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-amber-700">
              <AlertCircle className="w-4 h-4" /> In Progress
            </span>
          ) : (
            <span className="text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Start Module →
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
