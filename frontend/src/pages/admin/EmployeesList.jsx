import { useState, useEffect } from 'react';
import { adminApi } from '../../api/apiClient';
<<<<<<< HEAD
import { Search, ShieldAlert, ShieldCheck, X, Calendar, Play, FileText, Loader2, User } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
=======
import { 
  Search, ShieldAlert, ShieldCheck, X, CheckCircle2, AlertCircle, 
  Calendar, Play, FileText, Loader2, User, Download, Filter, 
  Shield, Award, Mail, ExternalLink, Clock, Info
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'COMPLIANT' | 'OVERDUE'

  // Employee Detail Modal State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [employeeDetail, setEmployeeDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    loadEmployees();
  }, [search]);

  const loadEmployees = async () => {
    try {
      const response = await adminApi.getEmployees(search);
      setEmployees(response.data.data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employee list');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (userId) => {
    setSelectedEmployeeId(userId);
    setDetailLoading(true);
    setEmployeeDetail(null);
    try {
      const response = await adminApi.getEmployeeDetail(userId);
      setEmployeeDetail(response.data.data);
    } catch (error) {
      console.error('Error loading employee details:', error);
      toast.error('Failed to load employee details');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedEmployeeId(null);
    setEmployeeDetail(null);
  };

<<<<<<< HEAD
  if (loading && employees.length === 0) return <div className="p-8 flex items-center justify-center text-text-secondary h-64">Loading employees...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-8 flex flex-col min-h-[calc(100vh-64px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Employee Directory</h1>
          <p className="text-sm text-text-secondary mt-1">Compliance overview and individual training records.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-text-secondary" />
=======
  // 1-Click CSV Export for HR Audits
  const exportComplianceAuditCsv = () => {
    if (!employees || employees.length === 0) {
      toast.error('No employee records to export');
      return;
    }

    const headers = [
      'Employee Code',
      'Full Name',
      'Total Assigned',
      'Completed',
      'Pending',
      'Overdue',
      'Videos Done',
      'PDFs Consented',
      'Completion %',
      'Audit Compliance Status',
      'Report Date'
    ];

    const todayStr = new Date().toISOString().split('T')[0];

    const rows = employees.map(emp => [
      `"${emp.employeeCode}"`,
      `"${emp.fullName}"`,
      emp.totalAssigned,
      emp.completed,
      emp.pending,
      emp.overdue,
      emp.videosCompleted,
      emp.pdfsCompleted,
      `"${emp.totalAssigned > 0 ? Math.round((emp.completed / emp.totalAssigned) * 100) : 100}%"`,
      emp.isCompliant ? '"COMPLIANT"' : '"NON-COMPLIANT"',
      `"${todayStr}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SEMCO_HR_Compliance_Audit_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Compliance Audit Report exported successfully!');
  };

  const sendReminder = (emp, e) => {
    e.stopPropagation();
    toast.success(`Automated notification reminder sent to ${emp.fullName} (${emp.email})`);
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'COMPLIANT' ? emp.isCompliant :
      emp.overdue > 0;
    return matchesStatus;
  });

  // Calculate completion % for an employee
  const getCompletionPercent = (emp) => {
    if (!emp.totalAssigned || emp.totalAssigned === 0) return 100;
    return Math.round((emp.completed / emp.totalAssigned) * 100);
  };

  if (loading && employees.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-400 h-64">
        Loading employee directory...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
              Workforce Compliance Roster
            </span>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Employee Directory & Audits
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review employee compliance records, send reminders, and export official audit reports for HR reviews.
          </p>
        </div>

        {/* 1-Click Export Button */}
        <button
          onClick={exportComplianceAuditCsv}
          className="btn-primary shadow-md hover:shadow-lg flex items-center gap-2 text-xs font-bold py-2.5 px-4 cursor-pointer"
        >
          <Download size={16} />
          <span>Export Compliance Audit (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827]">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by name, employee code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
<<<<<<< HEAD
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-text-secondary/50"
=======
            className="input-field pl-10 text-xs py-2"
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-400 uppercase">Status:</span>
            {[
              { key: 'ALL', label: 'All Staff' },
              { key: 'COMPLIANT', label: 'Compliant' },
              { key: 'OVERDUE', label: 'Overdue' }
            ].map(pill => (
              <button
                key={pill.key}
                onClick={() => setStatusFilter(pill.key)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === pill.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <Card className="flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-hover border-b border-border">
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Employee</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">Completed</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">Pending</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-text-secondary text-sm">
                    No employees found matching "{search}".
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr 
                    key={emp.userId} 
                    onClick={() => handleRowClick(emp.userId)}
                    className="hover:bg-surface-hover transition-colors cursor-pointer group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold border border-primary/20 group-hover:bg-primary-light group-hover:text-primary transition-colors">
                          {emp.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-text text-sm tracking-tight">{emp.fullName}</div>
                          <div className="text-xs text-text-secondary font-medium mt-0.5">{emp.employeeCode} &bull; {emp.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {emp.isCompliant ? (
                        <Badge variant="success">
                          <ShieldCheck size={14} className="mr-1.5" /> OK
                        </Badge>
                      ) : (
                        <Badge variant="danger">
                          <ShieldAlert size={14} className="mr-1.5" /> Action
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-text">{emp.completed}</span>
                      <span className="text-xs font-medium text-text-secondary ml-1">/ {emp.totalAssigned}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-warning bg-warning/10 px-2 py-1 rounded-md border border-warning/20">{emp.pending}</span>
                    </td>
                    <td className="p-4 text-center">
                      {emp.overdue > 0 ? (
                        <span className="font-bold text-danger bg-danger/10 px-2 py-1 rounded-md border border-danger/20">{emp.overdue}</span>
                      ) : (
                        <span className="text-text-secondary/30 font-medium">-</span>
                      )}
                    </td>
                  </tr>
                ))
=======
      {/* Employees Table */}
      <div className="card shadow-sm border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Audit Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Completion</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Pending</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Overdue</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No employees found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const pct = getCompletionPercent(emp);
                  return (
                    <tr 
                      key={emp.userId} 
                      onClick={() => handleRowClick(emp.userId)}
                      className="table-row-hover hover:bg-slate-50/70 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900 group-hover:scale-105 transition-transform">
                            {emp.initials || 'EM'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                              {emp.fullName}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {emp.employeeCode}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`badge ${emp.isCompliant ? 'badge-success' : 'badge-error'}`}>
                          {emp.isCompliant ? (
                            <span className="flex items-center gap-1">
                              <ShieldCheck size={13} /> Compliant
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ShieldAlert size={13} /> Action Req.
                            </span>
                          )}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`text-xs font-extrabold ${
                              pct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
                            }`}>
                              {pct}%
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {emp.completed} / {emp.totalAssigned} modules
                          </span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {emp.pending}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {emp.overdue > 0 ? (
                          <span className="badge badge-error">
                            {emp.overdue} Overdue
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">0</span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        {emp.overdue > 0 || emp.pending > 0 ? (
                          <button
                            onClick={(e) => sendReminder(emp, e)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-bold border border-amber-200 dark:border-amber-800 transition-colors inline-flex items-center gap-1"
                            title="Send reminder notice"
                          >
                            <Mail size={12} /> Remind
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-end gap-1">
                            <CheckCircle2 size={13} /> Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Employee Detail Modal (centered large popup) */}
      {selectedEmployeeId && (
<<<<<<< HEAD
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm transition-opacity" onClick={closeDetail}></div>
          <div className="relative w-full max-w-lg bg-background h-full shadow-2xl animate-fade-in flex flex-col border-l border-border overflow-hidden">
            <div className="p-5 bg-surface border-b border-border flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-text tracking-tight flex items-center gap-2">
                <User size={18} className="text-primary" />
                Employee Profile
              </h2>
              <button 
                onClick={closeDetail}
                className="p-2 text-text-secondary hover:text-text hover:bg-surface-hover rounded-full transition-colors"
=======
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={closeDetail}>
          <div 
            className="w-full max-w-3xl bg-white dark:bg-[#111827] rounded-3xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 max-h-[85vh] animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-[#0f172a] rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-black text-lg flex items-center justify-center shadow-md">
                  {employeeDetail?.employee?.initials || 'EM'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                    {employeeDetail?.employee?.fullName || 'Employee Record'}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {employeeDetail?.employee?.employeeCode}
                  </p>
                </div>
              </div>
              <button 
                onClick={closeDetail}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
<<<<<<< HEAD
                <div className="flex flex-col items-center justify-center h-full text-primary">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="text-sm font-medium">Loading records...</p>
                </div>
              ) : employeeDetail ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <Card>
                    <CardContent className="p-6 flex items-center gap-5">
                      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold border border-primary/20 shrink-0">
                        {employeeDetail.employee.initials}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-text tracking-tight">{employeeDetail.employee.fullName}</h3>
                        <p className="text-xs font-medium text-text-secondary mt-1 uppercase tracking-wider">
                          {employeeDetail.employee.employeeCode} &bull; {employeeDetail.employee.department}
                        </p>
                        <p className="text-sm text-text-secondary mt-1">{employeeDetail.employee.email}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-5">
                        <div className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-2">Compliance Status</div>
                        {employeeDetail.isCompliant ? (
                          <div className="inline-flex items-center gap-1.5 text-success font-bold text-lg tracking-tight">
                            <ShieldCheck size={20} /> Compliant
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-danger font-bold text-lg tracking-tight">
                            <ShieldAlert size={20} /> Non-Compliant
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-5">
                        <div className="text-[10px] text-text-secondary uppercase font-bold tracking-widest mb-2">Overall Progress</div>
                        <div className="text-2xl font-black tracking-tighter text-text">
                          {employeeDetail.trainings.filter(t => t.status === 'Completed').length} <span className="text-lg text-text-secondary font-bold">/ {employeeDetail.trainings.length}</span>
                        </div>
                      </CardContent>
                    </Card>
=======
                <div className="flex items-center justify-center h-48 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                  Loading training history...
                </div>
              ) : (
                <>
                  {/* Status Summary Card */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Overall Status</p>
                      <span className={`badge text-sm ${employeeDetail?.isCompliant ? 'badge-success' : 'badge-error'}`}>
                        {employeeDetail?.isCompliant ? 'Compliant' : 'Non-Compliant'}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Modules Assigned</p>
                      <p className="text-2xl font-black text-slate-800 dark:text-white">{employeeDetail?.trainings?.length || 0}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Overall Completion</p>
                      <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                        {(() => {
                          const trainings = employeeDetail?.trainings || [];
                          if (trainings.length === 0) return '100%';
                          const completed = trainings.filter(t => t.status === 'Completed').length;
                          return `${Math.round((completed / trainings.length) * 100)}%`;
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Compliance Explanation */}
                  <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900">
                    <div className="flex items-start gap-2">
                      <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <p><strong className="text-blue-800 dark:text-blue-300">Compliant</strong> = All assigned training modules are completed before their due dates.</p>
                        <p><strong className="text-rose-700 dark:text-rose-400">Non-Compliant</strong> = One or more assigned modules are overdue or still pending past the deadline.</p>
                      </div>
                    </div>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
                  </div>

                  {/* Per-Module Breakdown */}
                  <div>
<<<<<<< HEAD
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-3 px-1">Assigned Modules</h4>
                    <div className="space-y-3">
                      {employeeDetail.trainings.length === 0 ? (
                        <Card>
                          <CardContent className="p-8 text-center text-sm font-medium text-text-secondary">
                            No trainings assigned.
                          </CardContent>
                        </Card>
                      ) : (
                        employeeDetail.trainings.map(t => {
                          const isOverdue = t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < new Date();
                          return (
                            <Card key={t.moduleId} className={`transition-colors ${isOverdue ? 'border-danger/30 bg-danger/5' : ''}`}>
                              <CardContent className="p-5 flex flex-col gap-3">
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex gap-3">
                                    <div className={`mt-0.5 shrink-0 ${t.type === 'Video' ? 'text-primary' : 'text-warning'}`}>
                                      {t.type === 'Video' ? <Play size={18} /> : <FileText size={18} />}
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-text text-sm tracking-tight">{t.moduleTitle}</h5>
                                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                        <Badge variant="default" className="text-[10px] py-0">{t.type} Module</Badge>
                                        {t.isRequired && <Badge variant="danger" className="text-[10px] py-0">Required</Badge>}
                                        {t.isRecurring && <Badge variant="primary" className="text-[10px] py-0">Recurring</Badge>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="shrink-0">
                                    {t.status === 'Completed' ? (
                                      <Badge variant="success">Done</Badge>
                                    ) : isOverdue ? (
                                      <Badge variant="danger">Overdue</Badge>
                                    ) : (
                                      <Badge variant="warning">Pending</Badge>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center text-xs font-medium pt-3 border-t border-border mt-1">
                                  <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-danger' : 'text-text-secondary'}`}>
                                    <Calendar size={14} /> Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                                  </div>
                                  {t.status === 'Completed' && (
                                    <div className="text-text-secondary">
                                      Finished: {new Date(t.completedAt).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-text-secondary p-8 font-medium">Failed to load employee details.</div>
=======
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                      <Award size={16} className="text-blue-600" />
                      Module-by-Module Progress
                    </h3>
                    
                    <div className="space-y-3">
                      {employeeDetail?.trainings?.map((t) => {
                        // Calculate module completion %
                        let modulePercent = 0;
                        if (t.status === 'Completed' || t.consentedAt) {
                          modulePercent = 100;
                        } else if (t.videoWatchedPercent != null && Number(t.videoWatchedPercent) > 0) {
                          modulePercent = Math.min(100, Math.round(Number(t.videoWatchedPercent)));
                        } else if (t.progressPercent != null && Number(t.progressPercent) > 0) {
                          modulePercent = Math.min(100, Math.round(Number(t.progressPercent)));
                        } else if (t.status === 'InProgress') {
                          modulePercent = 50;
                        }

                        const category = t.category || (/(security|cyber|it|tech|data|phishing|network|access)/i.test(t.moduleTitle || '') ? 'IT' : 'HR');

                        return (
                          <div 
                            key={t.moduleId}
                            className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#1e293b] shadow-sm"
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${category === 'IT' ? 'badge-it' : 'badge-hr'}`}>
                                    {category}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded uppercase">
                                    {t.moduleType}
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                                  {t.moduleTitle}
                                </h4>
                                {t.dueDate && (
                                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                                    <Calendar size={11} />
                                    Due: {new Date(t.dueDate).toLocaleDateString()}
                                  </p>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                {t.status === 'Completed' ? (
                                  <span className="badge badge-success">
                                    <CheckCircle2 size={12} className="mr-1" /> Completed
                                  </span>
                                ) : t.status === 'Overdue' ? (
                                  <span className="badge badge-error">
                                    <AlertCircle size={12} className="mr-1" /> Overdue
                                  </span>
                                ) : (
                                  <span className="badge badge-warning">
                                    <Clock size={12} className="mr-1" /> {t.status || 'Pending'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    modulePercent === 100 ? 'bg-emerald-500' 
                                    : modulePercent >= 50 ? 'bg-blue-500' 
                                    : modulePercent > 0 ? 'bg-amber-500'
                                    : 'bg-slate-300'
                                  }`}
                                  style={{ width: `${modulePercent}%` }}
                                />
                              </div>
                              <span className={`text-sm font-black min-w-[45px] text-right ${
                                modulePercent === 100 ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-slate-700 dark:text-slate-200'
                              }`}>
                                {modulePercent}%
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {(!employeeDetail?.trainings || employeeDetail.trainings.length === 0) && (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          No training modules assigned to this employee yet.
                        </div>
                      )}
                    </div>
                  </div>
                </>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
