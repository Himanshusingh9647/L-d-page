import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentsApi } from '../../api/apiClient';
import { PlayCircle, FileText, CheckCircle2, Clock } from 'lucide-react';

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

  if (loading) return <div className="p-8">Loading your trainings...</div>;

  const getStatusBadge = (status) => {
    if (status === 'Completed') return <span className="badge badge-success"><CheckCircle2 size={14} className="mr-1" /> Completed</span>;
    if (status === 'InProgress') return <span className="badge badge-warning"><Clock size={14} className="mr-1" /> In Progress</span>;
    return <span className="badge badge-neutral">Not Started</span>;
  };

  return (
    <div className="p-8">
      <div className="main-header -mx-8 -mt-8 mb-8 px-8 py-6">
        <h1 className="text-2xl font-bold text-slate-800">My Training</h1>
        <p className="text-slate-500 mt-1">Complete your assigned training modules below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainings.map((training) => (
          <div key={training.moduleId} className="card hover:shadow-md transition-shadow group flex flex-col">
            <div className="relative h-40 bg-slate-100 overflow-hidden">
              {training.posterUrl ? (
                <img src={training.posterUrl} alt={training.moduleTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  {training.moduleType === 'Video' ? <PlayCircle size={48} /> : <FileText size={48} />}
                </div>
              )}
              <div className="absolute top-3 right-3">
                {getStatusBadge(training.status)}
              </div>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="badge bg-black/70 text-white border-0 backdrop-blur-md">
                  {training.moduleType}
                </span>
                {training.isRequired && (
                  <span className="badge bg-rose-500/90 text-white border-0 backdrop-blur-md">
                    Required
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2">{training.moduleTitle}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">{training.moduleDescription}</p>

              {training.dueDate && (
                <div className="text-xs text-slate-500 mb-4 flex items-center gap-1.5 font-medium">
                  <Clock size={14} className="text-amber-500" />
                  Due: {new Date(training.dueDate).toLocaleDateString()}
                </div>
              )}
              
              {training.status === 'InProgress' && training.moduleType === 'Video' && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                  <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${training.videoWatchedPercent}%` }}></div>
                </div>
              )}

              <button
                onClick={() => navigate(`/training/${training.moduleId}`)}
                className="btn-primary w-full mt-auto"
              >
                {training.status === 'Completed' ? 'Review Module' : (training.status === 'InProgress' ? 'Resume Training' : 'Start Training')}
              </button>
            </div>
          </div>
        ))}

        {trainings.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-400 opacity-50" />
            <h3 className="text-lg font-medium text-slate-800 mb-1">All caught up!</h3>
            <p>You have no pending training assignments at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
