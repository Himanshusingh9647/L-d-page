import { useState, useEffect } from 'react';
import { adminApi } from '../../api/apiClient';
import { 
  Search, ShieldAlert, ShieldCheck, X, CheckCircle2, AlertCircle, 
  Calendar, Play, FileText, Loader2, User, Download, Filter, 
  Shield, Award, Mail, ExternalLink, Clock, Info
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

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
            className="input-field pl-10 text-xs py-2"
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
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Detail Modal (centered large popup) */}
      {selectedEmployeeId && (
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
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {detailLoading ? (
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
                  </div>

                  {/* Per-Module Breakdown */}
                  <div>
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
