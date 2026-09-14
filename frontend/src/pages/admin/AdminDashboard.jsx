import { useState, useEffect } from 'react';
import { adminApi } from '../../api/apiClient';
import { Users, CheckCircle, Clock, AlertTriangle, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await adminApi.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-8 h-[80vh] flex items-center justify-center text-slate-400 font-medium tracking-wide">
      Loading metrics...
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle, textColor }) => (
    <div className="bg-white rounded-3xl p-7 flex flex-col justify-between border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3.5 rounded-2xl ${colorClass} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={24} strokeWidth={2} />
        </div>
        {subtitle && <span className="bg-slate-50 text-slate-400 border border-slate-100 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">{subtitle}</span>}
      </div>
      <div>
        <p className="text-sm font-bold tracking-wide text-slate-400 uppercase mb-1">{title}</p>
        <h3 className={`text-4xl font-black tracking-tighter ${textColor}`}>{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Overview</h1>
        <p className="text-slate-500 mt-2 text-sm font-medium">Compliance and training activity across the organization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Overall Compliance"
          value={`${stats?.complianceRate || 0}%`}
          icon={Activity}
          colorClass="bg-indigo-500"
          textColor="text-indigo-600"
          subtitle={`${stats?.compliantEmployees} / ${stats?.totalEmployees} OK`}
        />
        <StatCard
          title="Pending Trainings"
          value={stats?.pendingTrainings || 0}
          icon={Clock}
          colorClass="bg-amber-500"
          textColor="text-amber-600"
        />
        <StatCard
          title="Overdue Trainings"
          value={stats?.overdueTrainings || 0}
          icon={AlertTriangle}
          colorClass="bg-rose-500"
          textColor="text-rose-600"
          subtitle="Action Req."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-400 uppercase mb-3 flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-400" />
              Completed Today
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter text-slate-800">{stats?.completedToday || 0}</span>
              <span className="text-slate-400 font-medium">modules</span>
            </div>
          </div>
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center opacity-70">
            <CheckCircle className="text-emerald-400 w-12 h-12" />
          </div>
        </div>
        
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-wide text-slate-400 uppercase mb-3 flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Total Workforce
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter text-slate-800">{stats?.totalEmployees || 0}</span>
              <span className="text-slate-400 font-medium">active</span>
            </div>
          </div>
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center opacity-70">
            <Users className="text-blue-400 w-12 h-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
