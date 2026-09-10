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

  if (loading) return <div className="p-8">Loading dashboard metrics...</div>;

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <div className="card p-6 flex items-start gap-4">
      <div className={`p-4 rounded-2xl ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="main-header -mx-8 -mt-8 mb-8 px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of training compliance and activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Overall Compliance"
          value={`${stats?.complianceRate || 0}%`}
          icon={Activity}
          colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-500/30 shadow-lg"
          subtitle={`${stats?.compliantEmployees} / ${stats?.totalEmployees} employees compliant`}
        />
        <StatCard
          title="Pending Trainings"
          value={stats?.pendingTrainings || 0}
          icon={Clock}
          colorClass="bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/30 shadow-lg"
          subtitle="Required trainings not yet completed"
        />
        <StatCard
          title="Overdue Trainings"
          value={stats?.overdueTrainings || 0}
          icon={AlertTriangle}
          colorClass="bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/30 shadow-lg"
          subtitle="Requires immediate attention"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-emerald-500" size={20} />
            Completed Today
          </h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-slate-800">{stats?.completedToday || 0}</span>
            <span className="text-slate-500 mb-1 font-medium">modules</span>
          </div>
          <p className="text-sm text-slate-400 mt-2">Training modules finished by employees today.</p>
        </div>
        
        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users className="text-blue-500" size={20} />
            Total Workforce
          </h3>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-black text-slate-800">{stats?.totalEmployees || 0}</span>
            <span className="text-slate-500 mb-1 font-medium">active employees</span>
          </div>
          <p className="text-sm text-slate-400 mt-2">Enrolled in the L&D training portal.</p>
        </div>
      </div>
    </div>
  );
}
