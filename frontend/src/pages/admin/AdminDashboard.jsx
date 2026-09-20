import { useState, useEffect, useMemo } from 'react';
import { adminApi, modulesApi } from '../../api/apiClient';
import { useTheme } from '../../context/ThemeContext';
import { 
  Users, CheckCircle, Clock, AlertTriangle, Activity, 
  TrendingUp, Shield, Building2, BarChart3, Award, Sparkles, Download 
} from 'lucide-react';
import Highcharts from 'highcharts';
import * as HighchartsReactModule from 'highcharts-react-official';

// Resilient resolution for HighchartsReact in Vite / React 19 ESM interop
const HighchartsReact = 
  HighchartsReactModule.HighchartsReact || 
  HighchartsReactModule.default?.default || 
  HighchartsReactModule.default || 
  HighchartsReactModule;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashRes, empRes, modRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getEmployees(),
        modulesApi.getAll()
      ]);
      setStats(dashRes.data.data);
      setEmployees(empRes.data.data || []);
      setModules(modRes.data.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 1. Employee Compliance Overview (replaces department chart - no department filtering)
  const employeeComplianceOptions = useMemo(() => {
    const compliantCount = employees.filter(e => e.isCompliant).length;
    const nonCompliantCount = employees.filter(e => !e.isCompliant).length;

    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? '#1e293b' : '#f1f5f9';

    const hasData = employees.length > 0;

    return {
      chart: {
        type: 'column',
        backgroundColor: 'transparent',
        style: { fontFamily: 'Inter, sans-serif' }
      },
      title: {
        text: 'Employee Compliance Overview',
        align: 'left',
        style: { color: textColor, fontWeight: '700', fontSize: '15px' }
      },
      subtitle: {
        text: hasData
          ? `${compliantCount} of ${employees.length} employees fully compliant`
          : 'No employee data available yet',
        align: 'left',
        style: { color: isDark ? '#94a3b8' : '#64748b', fontSize: '12px' }
      },
      xAxis: {
        categories: hasData ? ['Compliant', 'Non-Compliant'] : [],
        labels: { style: { color: isDark ? '#94a3b8' : '#64748b' } },
        lineColor: gridColor
      },
      yAxis: {
        min: 0,
        title: { text: 'Employees', style: { color: isDark ? '#94a3b8' : '#64748b' } },
        gridLineColor: gridColor,
        labels: { style: { color: isDark ? '#94a3b8' : '#64748b' } },
        allowDecimals: false
      },
      tooltip: {
        pointFormat: '<span style="color:{point.color}">\u25CF</span> <b>{point.y}</b> employees'
      },
      legend: { enabled: false },
      credits: { enabled: false },
      series: hasData ? [{
        name: 'Employees',
        data: [
          { y: compliantCount, color: '#10b981' },
          { y: nonCompliantCount, color: '#f43f5e' }
        ],
        borderRadius: 6
      }] : []
    };
  }, [employees, isDark]);

  // 2. Training Status Breakdown Donut
  const statusDonutOptions = useMemo(() => {
    const compliantCount = stats?.compliantEmployees || 0;
    const pendingCount = stats?.pendingTrainings || 0;
    const overdueCount = stats?.overdueTrainings || 0;

    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const hasData = compliantCount > 0 || pendingCount > 0 || overdueCount > 0;

    return {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent',
        style: { fontFamily: 'Inter, sans-serif' }
      },
      title: {
        text: 'Training Fulfillment Status',
        align: 'left',
        style: { color: textColor, fontWeight: '700', fontSize: '15px' }
      },
      subtitle: {
        text: hasData ? 'Completed vs Pending vs Overdue' : 'No training data available yet',
        align: 'left',
        style: { color: isDark ? '#94a3b8' : '#64748b', fontSize: '12px' }
      },
      plotOptions: {
        pie: {
          innerSize: '65%',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.y}',
            style: { color: isDark ? '#cbd5e1' : '#475569', fontSize: '11px' }
          }
        }
      },
      credits: { enabled: false },
      series: hasData ? [{
        name: 'Modules',
        data: [
          { name: 'Completed', y: compliantCount, color: '#10b981' },
          { name: 'In Progress', y: pendingCount, color: '#3b82f6' },
          { name: 'Overdue', y: overdueCount, color: '#f43f5e' }
        ]
      }] : []
    };
  }, [stats, isDark]);

  // 3. IT vs HR Training Track Completion
  const trackComparisonOptions = useMemo(() => {
    let itTotal = 0;
    let hrTotal = 0;
    modules.forEach(m => {
      if (m.category === 'IT') itTotal += 1;
      else hrTotal += 1;
    });

    const textColor = isDark ? '#f1f5f9' : '#1e293b';
    const gridColor = isDark ? '#1e293b' : '#f1f5f9';
    const hasData = modules.length > 0;

    return {
      chart: {
        type: 'bar',
        backgroundColor: 'transparent',
        style: { fontFamily: 'Inter, sans-serif' }
      },
      title: {
        text: 'IT vs HR Curriculum Tracks',
        align: 'left',
        style: { color: textColor, fontWeight: '700', fontSize: '15px' }
      },
      subtitle: {
        text: hasData ? 'Active Modules by Track' : 'No modules created yet',
        align: 'left',
        style: { color: isDark ? '#94a3b8' : '#64748b', fontSize: '12px' }
      },
      xAxis: {
        categories: hasData ? ['IT Security & Tech', 'HR & Culture'] : [],
        labels: { style: { color: isDark ? '#94a3b8' : '#64748b' } },
        lineColor: gridColor
      },
      yAxis: {
        min: 0,
        title: { text: 'Number of Modules', style: { color: isDark ? '#94a3b8' : '#64748b' } },
        gridLineColor: gridColor,
        labels: { style: { color: isDark ? '#94a3b8' : '#64748b' } },
        allowDecimals: false
      },
      legend: { enabled: false },
      credits: { enabled: false },
      series: hasData ? [{
        name: 'Modules',
        data: [
          { y: itTotal, color: '#6366f1' },
          { y: hrTotal, color: '#8b5cf6' }
        ],
        borderRadius: 6
      }] : []
    };
  }, [modules, isDark]);

  if (loading) {
    return (
      <div className="p-8 h-[75vh] flex items-center justify-center text-slate-400 font-medium">
        Loading L&D Dashboard...
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle, textColor, badge }) => (
    <div className="card p-6 flex flex-col justify-between border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorClass} text-white shadow-md group-hover:scale-105 transition-transform duration-300`}>
          <Icon size={22} strokeWidth={2.4} />
        </div>
        {badge && (
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full text-xs font-bold">
            {badge}
          </span>
        )}
      </div>
      <div>
        <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-1">{title}</p>
        <div className="flex items-baseline justify-between">
          <h3 className={`text-3xl font-black tracking-tight ${textColor}`}>{value}</h3>
          {subtitle && <span className="text-xs text-slate-400 font-medium">{subtitle}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
              Samsung Electro-Mechanics
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Compliance & Training Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time workforce compliance tracking, IT/HR curriculum statistics, and analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl font-semibold shadow-sm">
            Workforce: <b>{stats?.totalEmployees || 0}</b> Active
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard
          title="Workforce Compliance"
          value={`${stats?.complianceRate || 0}%`}
          icon={Activity}
          colorClass="bg-blue-600"
          textColor="text-blue-600 dark:text-blue-400"
          subtitle={`${stats?.compliantEmployees || 0} of ${stats?.totalEmployees || 0} completed`}
          badge="Audit Rate"
        />
        <StatCard
          title="Pending Modules"
          value={stats?.pendingTrainings || 0}
          icon={Clock}
          colorClass="bg-indigo-600"
          textColor="text-indigo-600 dark:text-indigo-400"
          subtitle="In progress"
        />
        <StatCard
          title="Overdue Modules"
          value={stats?.overdueTrainings || 0}
          icon={AlertTriangle}
          colorClass="bg-rose-500"
          textColor="text-rose-600 dark:text-rose-400"
          badge="Action Req."
          subtitle="Exceeded deadline"
        />
        <StatCard
          title="Completed Today"
          value={stats?.completedToday || 0}
          icon={CheckCircle}
          colorClass="bg-emerald-500"
          textColor="text-emerald-600 dark:text-emerald-400"
          subtitle="Course completions"
        />
      </div>

      {/* Highcharts Interactive Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Employee Compliance Highcharts */}
        <div className="card p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
          <HighchartsReact highcharts={Highcharts} options={employeeComplianceOptions} />
        </div>

        {/* Training Status Donut Highcharts */}
        <div className="card p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm">
          <HighchartsReact highcharts={Highcharts} options={statusDonutOptions} />
        </div>

        {/* IT vs HR Track Highcharts */}
        <div className="card p-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm lg:col-span-2">
          <HighchartsReact highcharts={Highcharts} options={trackComparisonOptions} />
        </div>
      </div>
    </div>
  );
}
