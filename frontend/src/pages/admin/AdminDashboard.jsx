import { useState, useEffect } from 'react';
import { adminApi } from '../../api/apiClient';
import { Users, CheckCircle, Clock, AlertTriangle, Activity, ArrowRight, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

  const hasOverdue = stats?.overdueAssignments > 0;
  const overdueColor = hasOverdue ? 'text-danger' : 'text-success';
  const overdueBorder = hasOverdue ? 'border-danger/20 hover:border-danger/40' : 'border-border hover:border-success/40';

  const complianceRate = stats?.overallCompletionRate || 0;
  const complianceStatus = complianceRate >= 90 ? 'success' : complianceRate >= 75 ? 'warning' : 'danger';
  const complianceStatusText = complianceRate >= 90 ? 'On Track' : complianceRate >= 75 ? 'Needs Attention' : 'Critical';

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto flex flex-col min-h-[calc(100vh-64px)] space-y-8">
      <div className="shrink-0">
        <h1 className="text-2xl font-bold text-text tracking-tight">Overview</h1>
        <p className="text-sm text-text-secondary mt-1">Compliance and training activity across the organization.</p>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compliance Hero */}
        <Card className="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all">
          <CardContent className="p-8 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-3 text-text-secondary font-semibold uppercase tracking-wider text-sm">
                <Activity size={20} className="text-primary" />
                Overall Compliance
              </div>
              <Badge variant={complianceStatus}>{complianceStatusText}</Badge>
            </div>
            <div className="flex items-end justify-between mt-auto">
              <div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-6xl font-black tracking-tighter text-text">{complianceRate}%</h2>
                </div>
                <p className="text-text-secondary mt-2 font-medium">
                  <strong className="text-text">{stats?.compliantEmployees || 0}</strong> of <strong className="text-text">{stats?.totalEmployees || 0}</strong> employees compliant
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-sm font-semibold text-primary pb-2">
                View list <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Overdue */}
        <Card className={`group cursor-pointer hover:shadow-md transition-all ${overdueBorder}`}>
          <CardContent className="p-8 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-3 text-text-secondary font-semibold uppercase tracking-wider text-sm">
                <AlertTriangle size={20} className={overdueColor} />
                Overdue Trainings
              </div>
              {hasOverdue ? (
                <Badge variant="danger">Action Req.</Badge>
              ) : (
                <Badge variant="success">All Clear</Badge>
              )}
            </div>
            <div className="flex items-end justify-between mt-auto">
              <div>
                <h2 className={`text-6xl font-black tracking-tighter ${hasOverdue ? 'text-text' : 'text-text-secondary'}`}>
                  {stats?.overdueAssignments || 0}
                </h2>
              </div>
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-sm font-semibold pb-2 ${overdueColor}`}>
                View list <ArrowRight size={16} className="ml-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-sm transition-all border-border/50 hover:border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-surface-hover rounded-xl text-text-secondary">
              <Clock size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Pending Trainings</p>
              <p className="text-2xl font-bold text-text">{stats?.pendingTrainings || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-all border-border/50 hover:border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-surface-hover rounded-xl text-text-secondary">
              <CheckCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Completed Today</p>
              <p className="text-2xl font-bold text-text">{stats?.completedToday || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-sm transition-all border-border/50 hover:border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-surface-hover rounded-xl text-text-secondary">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Total Workforce</p>
              <p className="text-2xl font-bold text-text">{stats?.totalEmployees || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown Chart */}
      {stats?.departmentCompliance && (
        <Card className="flex-1 flex flex-col min-h-[320px]">
          <CardHeader className="p-6 pb-2 border-b-0 flex flex-row items-center gap-2 shrink-0">
             <BarChart3 size={18} className="text-text-secondary" />
             <CardTitle className="text-base text-text-secondary uppercase tracking-wider font-semibold">Department Compliance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.departmentCompliance} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} 
                  domain={[0, 100]}
                  tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                  cursor={{ fill: 'var(--surface-hover)', opacity: 0.5 }}
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: 'var(--text)', fontWeight: 600 }}
                  formatter={(value) => [`${value}%`, 'Compliance']}
                />
                <Bar dataKey="rate" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
