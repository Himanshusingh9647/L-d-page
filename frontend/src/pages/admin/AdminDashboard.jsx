import { useState, useEffect } from 'react';
import { adminApi } from '../../api/apiClient';
import { Users, CheckCircle, Clock, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

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
    <div className="p-8 h-[80vh] flex items-center justify-center text-text-secondary font-medium tracking-wide">
      Loading metrics...
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle, textColor }) => (
    <Card className="flex flex-col justify-between group h-full">
      <CardContent className="p-7 flex-1 flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-3.5 rounded-2xl ${colorClass} text-white shadow-md group-hover:scale-105 transition-transform duration-150 ease-out`}>
            <Icon size={24} strokeWidth={2} />
          </div>
          {subtitle && (
            <Badge variant="default" className="text-xs">{subtitle}</Badge>
          )}
        </div>
        <div className="mt-auto">
          <p className="text-sm font-bold tracking-wide text-text-secondary uppercase mb-1">{title}</p>
          <h3 className={`text-4xl font-black tracking-tighter ${textColor}`}>{value}</h3>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-text tracking-tight">Overview</h1>
        <p className="text-text-secondary mt-2 text-sm font-medium">Compliance and training activity across the organization.</p>
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
        <Card variant="featured">
          <CardContent className="p-8 flex items-center justify-between h-full">
            <div>
              <h3 className="text-sm font-bold tracking-wide text-text-secondary uppercase mb-3 flex items-center gap-2">
                <CheckCircle size={16} className="text-emerald-500" />
                Completed Today
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter text-text">{stats?.completedToday || 0}</span>
                <span className="text-text-secondary font-medium">modules</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center opacity-70">
              <CheckCircle className="text-emerald-500 w-12 h-12" />
            </div>
          </CardContent>
        </Card>
        
        <Card variant="featured">
          <CardContent className="p-8 flex items-center justify-between h-full">
            <div>
              <h3 className="text-sm font-bold tracking-wide text-text-secondary uppercase mb-3 flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                Total Workforce
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black tracking-tighter text-text">{stats?.totalEmployees || 0}</span>
                <span className="text-text-secondary font-medium">active</span>
              </div>
            </div>
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center opacity-70">
              <Users className="text-blue-500 w-12 h-12" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
