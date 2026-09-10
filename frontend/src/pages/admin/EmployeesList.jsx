import { useState, useEffect } from 'react';
import { adminApi } from '../../api/apiClient';
import { Search, ShieldAlert, ShieldCheck, X, CheckCircle2, AlertCircle, Calendar, Play, FileText, Loader2 } from 'lucide-react';

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

  if (loading && employees.length === 0) return <div className="p-8">Loading employees...</div>;

  return (
    <div className="p-8">
      <div className="main-header -mx-8 -mt-8 mb-8 px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employee Compliance</h1>
          <p className="text-slate-500 mt-1">Overview of all employees and their training status.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 bg-slate-50 border-transparent focus:bg-white"
          />
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Compliance</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Completed</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Pending</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Overdue</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  No employees found matching your search.
                </td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr 
                  key={emp.userId} 
                  onClick={() => handleRowClick(emp.userId)}
                  className="border-b border-slate-100 hover:bg-indigo-50 cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
                        {emp.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">{emp.fullName}</div>
                        <div className="text-xs text-slate-500">{emp.employeeCode} &bull; {emp.department}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {emp.isCompliant ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-sm font-medium border border-emerald-200">
                        <ShieldCheck size={16} /> Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 rounded-lg text-sm font-medium border border-rose-200">
                        <ShieldAlert size={16} /> Non-Compliant
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-slate-800">{emp.completed}</span>
                    <span className="text-xs text-slate-400 ml-1">/ {emp.totalAssigned}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{emp.pending}</span>
                  </td>
                  <td className="p-4 text-center">
                    {emp.overdue > 0 ? (
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">{emp.overdue}</span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Employee Detail Slide-over / Modal */}
      {selectedEmployeeId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-2xl bg-slate-50 h-full shadow-2xl animate-fade-in flex flex-col overflow-hidden border-l border-slate-200">
            <div className="p-6 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-slate-800">Employee Details</h2>
              <button 
                onClick={closeDetail}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {detailLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-indigo-600">
                  <Loader2 className="w-8 h-8 animate-spin mb-4" />
                  <p className="text-slate-500 font-medium">Loading details...</p>
                </div>
              ) : employeeDetail ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                      {employeeDetail.employee.initials}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{employeeDetail.employee.fullName}</h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {employeeDetail.employee.employeeCode} &bull; {employeeDetail.employee.department} &bull; {employeeDetail.employee.email}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Status</div>
                      {employeeDetail.isCompliant ? (
                        <div className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                          <ShieldCheck size={16} /> Compliant
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 text-rose-600 font-bold">
                          <ShieldAlert size={16} /> Warning
                        </div>
                      )}
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Overall</div>
                      <div className="text-xl font-bold text-slate-800">
                        {employeeDetail.trainings.filter(t => t.status === 'Completed').length} / {employeeDetail.trainings.length}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Videos</div>
                      <div className="text-xl font-bold text-indigo-600">
                        {employeeDetail.videosCompleted} / {employeeDetail.totalVideos}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                      <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">PDFs</div>
                      <div className="text-xl font-bold text-purple-600">
                        {employeeDetail.pdfsCompleted} / {employeeDetail.totalPdfs}
                      </div>
                    </div>
                  </div>

                  {/* Trainings List */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 px-1">Assigned Trainings</h4>
                    <div className="space-y-3">
                      {employeeDetail.trainings.length === 0 ? (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-500">
                          No trainings assigned to this employee yet.
                        </div>
                      ) : (
                        employeeDetail.trainings.map(t => {
                          const isOverdue = t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < new Date();
                          return (
                            <div key={t.moduleId} className={`bg-white p-4 rounded-xl border shadow-sm flex items-start gap-4 ${isOverdue ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200'}`}>
                              <div className={`mt-1 p-2 rounded-lg ${t.type === 'Video' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>
                                {t.type === 'Video' ? <Play size={18} /> : <FileText size={18} />}
                              </div>
                              <div className="flex-1">
                                <h5 className="font-bold text-slate-800">{t.moduleTitle}</h5>
                                <div className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                                  <span className="flex items-center gap-1"><Calendar size={12} /> Due: {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'N/A'}</span>
                                  <span>{t.isRecurring ? '🔄 Recurring' : '📌 One-time'}</span>
                                  {t.isRequired && <span className="text-rose-500 font-medium">Required</span>}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                {t.status === 'Completed' ? (
                                  <div className="flex flex-col items-end">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                                      <CheckCircle2 size={12} /> Done
                                    </span>
                                    <span className="text-[10px] text-slate-400 mt-1">{new Date(t.completedAt).toLocaleDateString()}</span>
                                  </div>
                                ) : isOverdue ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200">
                                    <AlertCircle size={12} /> Overdue
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200">
                                    Pending
                                  </span>
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
                <div className="text-center text-slate-500 p-8">Failed to load employee details.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
