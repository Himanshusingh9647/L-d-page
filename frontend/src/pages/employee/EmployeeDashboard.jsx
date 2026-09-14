import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentsApi } from '../../api/apiClient';
import { PlayCircle, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function EmployeeDashboard() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      const response = await assignmentsApi.getMy();
      setTrainings(response.data.data);
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-8 h-[80vh] flex items-center justify-center text-slate-400 font-medium tracking-wide">
      Loading your workspace...
    </div>
  );

  const getStatusBadge = (status) => {
    if (status === 'Completed') return <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center shadow-sm"><CheckCircle2 size={12} className="mr-1.5" /> Completed</span>;
    if (status === 'InProgress') return <span className="bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center shadow-sm"><Clock size={12} className="mr-1.5" /> In Progress</span>;
    return <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase flex items-center shadow-sm">Not Started</span>;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Workspace</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Your required and ongoing learning modules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trainings.map((training) => (
          <div key={training.moduleId} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden">
            <div className="relative h-44 bg-slate-50 overflow-hidden border-b border-slate-100">
              {training.posterUrl ? (
                <img src={training.posterUrl} alt={training.moduleTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300/50 bg-gradient-to-br from-slate-50 to-slate-100 group-hover:scale-105 transition-transform duration-700">
                  {training.moduleType === 'Video' ? <PlayCircle size={56} strokeWidth={1.5} /> : <FileText size={56} strokeWidth={1.5} />}
                </div>
              )}
              
              <div className="absolute top-4 right-4">
                {getStatusBadge(training.status)}
              </div>
              
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span className="bg-white/90 backdrop-blur-md text-slate-800 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase shadow-sm">
                  {training.moduleType}
                </span>
                {training.isRequired && (
                  <span className="bg-rose-500/90 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase shadow-sm">
                    Required
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 leading-snug tracking-tight">{training.moduleTitle}</h3>
              <p className="text-sm text-slate-500 mb-5 line-clamp-2 flex-1 leading-relaxed">{training.moduleDescription}</p>

              {training.dueDate && (
                <div className="text-xs text-slate-500 mb-5 flex items-center gap-2 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                  <Clock size={14} className={new Date(training.dueDate) < new Date() && training.status !== 'Completed' ? 'text-rose-500' : 'text-slate-400'} />
                  <span className={new Date(training.dueDate) < new Date() && training.status !== 'Completed' ? 'text-rose-600 font-semibold' : ''}>
                    Due {new Date(training.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              )}
              
              {training.status === 'InProgress' && training.moduleType === 'Video' && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-5 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full transition-all duration-500 relative" style={{ width: `${training.videoWatchedPercent}%` }}>
                     <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white/50 rounded-full"></div>
                  </div>
                </div>
              )}

              <button
                onClick={() => navigate(`/training/${training.moduleId}`)}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 ${
                  training.status === 'Completed' 
                    ? 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {training.status === 'Completed' ? 'Review Module' : (training.status === 'InProgress' ? 'Resume Training' : 'Start Training')}
              </button>
            </div>
          </div>
        ))}

        {trainings.length === 0 && (
          <div className="col-span-full py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={40} className="text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2 tracking-tight">All caught up!</h3>
            <p className="text-slate-500 font-medium">You have no pending training assignments.</p>
          </div>
        )}
      </div>
    </div>
  );
}
