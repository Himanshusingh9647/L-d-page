import { useState, useEffect } from 'react';
import { adminApi } from '../../api/apiClient';
import { Search, ShieldAlert, ShieldCheck, X, CheckCircle2, AlertCircle, Calendar, Play, FileText, Loader2, User } from 'lucide-react';

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Employee Detail State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [employeeDetail, setEmployeeDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, [search]);

  const loadEmployees = async () => {
    try {
      const response = await adminApi.getEmployees(search);
      setEmployees(response.data.data);
    } catch (error) {
      console.error('Error loading employees:', error);
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
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedEmployeeId(null);
    setEmployeeDetail(null);
  };

  if (loading && employees.length === 0) return <div className="p-8 flex items-center justify-center text-slate-400 h-64">Loading employees...</div>;

  return (
    <div className="p-8">
      <div className="main-header -mx-8 -mt-8 mb-8 px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Employee Directory</h1>
          <p className="text-sm text-slate-500 mt-1">Compliance overview and individual training records.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, code, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Completed</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Pending</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-400 text-sm">
                    No employees found matching "{search}".
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr 
                    key={emp.userId} 
                    onClick={() => handleRowClick(emp.userId)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                          {emp.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm tracking-tight">{emp.fullName}</div>
                          <div className="text-xs text-slate-400 font-medium">{emp.employeeCode} &bull; {emp.department}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {emp.isCompliant ? (
                        <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wide border border-emerald-100">
                          <ShieldCheck size={14} /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold uppercase tracking-wide border border-rose-100">
                          <ShieldAlert size={14} /> Action
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-slate-700">{emp.completed}</span>
                      <span className="text-xs font-medium text-slate-400 ml-1">/ {emp.totalAssigned}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100/50">{emp.pending}</span>
                    </td>
                    <td className="p-4 text-center">
                      {emp.overdue > 0 ? (
                        <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100/50">{emp.overdue}</span>
                      ) : (
                        <span className="text-slate-300 font-medium">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Detail Slide-over */}
      {selectedEmployeeId && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={closeDetail}></div>
          <div className="relative w-full max-w-lg bg-slate-50 h-full shadow-2xl animate-fade-in flex flex-col border-l border-slate-200 overflow-hidden">
            <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <User size={18} className="text-indigo-500" />
                Employee Profile
              </h2>
              <button 
                onClick={closeDetail}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-indigo-500">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="text-sm font-medium">Loading records...</p>
                </div>
              ) : employeeDetail ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xl font-bold border border-slate-200">
                      {employeeDetail.employee.initials}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">{employeeDetail.employee.fullName}</h3>
                      <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
                        {employeeDetail.employee.employeeCode} &bull; {employeeDetail.employee.department}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">{employeeDetail.employee.email}</p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Compliance Status</div>
                      {employeeDetail.isCompliant ? (
                        <div className="inline-flex items-center gap-1.5 text-emerald-600 font-bold text-lg tracking-tight">
                          <ShieldCheck size={20} /> Compliant
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-rose-600 font-bold text-lg tracking-tight">
                          <ShieldAlert size={20} /> Non-Compliant
                        </div>
                      )}
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-2">Overall Progress</div>
                      <div className="text-2xl font-black tracking-tighter text-slate-800">
                        {employeeDetail.trainings.filter(t => t.status === 'Completed').length} <span className="text-lg text-slate-400 font-bold">/ {employeeDetail.trainings.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trainings List */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Assigned Modules</h4>
                    <div className="space-y-3">
                      {employeeDetail.trainings.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center text-sm font-medium text-slate-400">
                          No trainings assigned.
                        </div>
                      ) : (
                        employeeDetail.trainings.map(t => {
                          const isOverdue = t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < new Date();
                          return (
                            <div key={t.moduleId} className={`bg-white p-5 rounded-2xl border shadow-sm flex flex-col gap-3 transition-colors ${isOverdue ? 'border-rose-100 bg-rose-50/30' : 'border-slate-100'}`}>
                              <div className="flex justify-between items-start">
                                <div className="flex gap-3">
                                  <div className={`mt-0.5 shrink-0 ${t.type === 'Video' ? 'text-indigo-500' : 'text-amber-500'}`}>
                                    {t.type === 'Video' ? <Play size={18} /> : <FileText size={18} />}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-slate-800 text-sm tracking-tight">{t.moduleTitle}</h5>
                                    <div className="text-[10px] uppercase tracking-wider font-bold mt-1 text-slate-400 flex items-center gap-2">
                                      {t.type} Module
                                      {t.isRequired && <span className="text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">Required</span>}
                                      {t.isRecurring && <span className="text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">Recurring</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="shrink-0">
                                  {t.status === 'Completed' ? (
                                    <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold border border-emerald-100 tracking-wide uppercase">Done</span>
                                  ) : isOverdue ? (
                                    <span className="bg-rose-50 text-rose-600 px-2 py-1 rounded text-xs font-bold border border-rose-100 tracking-wide uppercase">Overdue</span>
                                  ) : (
                                    <span className="bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs font-bold border border-amber-100 tracking-wide uppercase">Pending</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center text-xs font-medium pt-3 border-t border-slate-50 mt-1">
                                <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-rose-500' : 'text-slate-500'}`}>
                                  <Calendar size={14} /> Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}
                                </div>
                                {t.status === 'Completed' && (
                                  <div className="text-slate-400">
                                    Finished: {new Date(t.completedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 p-8 font-medium">Failed to load employee details.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
