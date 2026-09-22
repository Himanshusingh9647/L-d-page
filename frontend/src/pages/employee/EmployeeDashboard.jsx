import { useState, useEffect } from 'react';
import { assignmentsApi } from '../../api/apiClient';
import { useAuth } from '../../context/AuthContext';
import { 
  PlayCircle, FileText, CheckCircle2, Clock, AlertCircle, 
  Shield, Building2, Calendar, Search, Sparkles, Filter 
} from 'lucide-react';

export default function EmployeeDashboard() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL'); // 'ALL' | 'IT' | 'HR'
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'
  const [searchQuery, setSearchQuery] = useState('');

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      const response = await assignmentsApi.getMy();
      setTrainings(response.data.data || []);
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setLoading(false);
      // Stagger actual content reveal by a tiny bit to make it feel deliberate
      setTimeout(() => setShowContent(true), 150);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'Completed') {
      return (
        <span className="badge badge-success shadow-sm">
          <CheckCircle2 size={12} className="mr-1" /> Completed
        </span>
      );
    }
    if (status === 'InProgress') {
      return (
        <span className="badge badge-warning shadow-sm">
          <Clock size={12} className="mr-1" /> In Progress
        </span>
      );
    }
    return (
      <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
        Not Started
      </span>
    );
  };

  const getDueCountdown = (dueDate, status) => {
    if (status === 'Completed' || !dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return (
        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
          Overdue by {Math.abs(diffDays)}d
        </span>
      );
    }
    if (diffDays === 0) {
      return (
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900 animate-pulse">
          Due Today
        </span>
      );
    }
    if (diffDays <= 3) {
      return (
        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900">
          {diffDays} days left
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded">
        {diffDays} days left
      </span>
    );
  };

  const itCount = trainings.filter(t => t.category === 'IT').length;
  const hrCount = trainings.filter(t => t.category === 'HR' || !t.category).length;
  const completedCount = trainings.filter(t => t.status === 'Completed').length;

  const filteredTrainings = trainings.filter(t => {
    const matchesCategory = 
      selectedCategory === 'ALL' ? true :
      selectedCategory === 'IT' ? t.category === 'IT' :
      (t.category === 'HR' || !t.category);
    
    const matchesStatus =
      selectedStatus === 'ALL' ? true :
      selectedStatus === 'COMPLETED' ? t.status === 'Completed' :
      t.status !== 'Completed';

    const matchesSearch = t.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.moduleDescription && t.moduleDescription.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="p-8 h-[80vh] flex items-center justify-center text-slate-400 font-medium">
        Loading your Learning Curriculum...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
              Employee Portal
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Learning Workspace
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Required IT security courses and compliance policies.
          </p>
        </div>

        {/* Progress Snapshot */}
        <div className="flex items-center gap-3 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-blue-600" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Completed:</span>
          </div>
          <span className="text-sm font-black text-blue-600 dark:text-blue-400">
            {completedCount} of {trainings.length} Modules
          </span>
        </div>
      </div>

      {/* Track Category Filter Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Tracks
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {trainings.length}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('IT')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === 'IT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Shield size={14} />
            IT Security Track
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedCategory === 'IT' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {itCount}
            </span>
          </button>

          <button
            onClick={() => setSelectedCategory('HR')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              selectedCategory === 'HR'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 size={14} />
            HR Enterprise Track
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${selectedCategory === 'HR' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
              {hrCount}
            </span>
          </button>
        </div>

        {/* Secondary Filter & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search course title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 text-xs py-1.5"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl px-3 py-1.5 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending / In Progress</option>
            <option value="COMPLETED">Completed / Done</option>
          </select>
        </div>
      </div>

      {/* Training Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTrainings.map((training) => (
          <div 
            key={training.moduleId} 
            className="card bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden"
          >
            {/* Poster / Header Thumbnail */}
            <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden border-b border-slate-100 dark:border-slate-800">
              {training.posterUrl ? (
                <img 
                  src={training.posterUrl} 
                  alt={training.moduleTitle} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 group-hover:scale-105 transition-transform duration-700">
                  {training.moduleType === 'Video' ? <PlayCircle size={54} strokeWidth={1.5} /> : <FileText size={54} strokeWidth={1.5} />}
                </div>
              )}
              
              <div className="absolute top-3 right-3">
                {getStatusBadge(training.status)}
              </div>
              
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm ${training.category === 'IT' ? 'badge-it' : 'badge-hr'}`}>
                  {training.category === 'IT' ? 'IT Security' : 'HR Policy'}
                </span>
                <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
                  {training.moduleType}
                </span>
              </div>
            </div>

            {/* Card Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5 line-clamp-2 leading-snug tracking-tight group-hover:text-blue-600 transition-colors">
                  {training.moduleTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                  {training.moduleDescription || "Official corporate compliance module."}
                </p>
              </div>

              <div>
                {/* Due Date & Countdown */}
                {training.dueDate && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center justify-between font-medium bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className={new Date(training.dueDate) < new Date() && training.status !== 'Completed' ? 'text-rose-500' : 'text-slate-400'} />
                      <span className="text-[11px]">Due {new Date(training.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                    {getDueCountdown(training.dueDate, training.status)}
                  </div>
                )}
                
                {/* Progress Bar for Video */}
                {training.status === 'InProgress' && training.moduleType === 'Video' && (
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-500 relative" 
                      style={{ width: `${training.videoWatchedPercent || 0}%` }}
                    >
                      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/training/${training.moduleId}`)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer ${
                      training.status === 'Completed' 
                        ? 'btn-secondary' 
                        : 'btn-primary'
                    }`}
                  >
                    {training.status === 'Completed' ? 'Review Course' : 'Start Course'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTrainings.length === 0 && (
        <div className="card p-12 text-center text-slate-400 dark:text-slate-500 text-sm border-slate-200/80 dark:border-slate-800">
          No training modules found matching your current filter selections.
        </div>
      )}
    </div>
  </div>
  );
}

