import { useState, useEffect } from 'react';
import { adminApi } from '../../api/apiClient';
import { Search, ShieldAlert, ShieldCheck, X, Calendar, Play, FileText, Loader2, User } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

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
          </div>
          <input
            type="text"
            placeholder="Search by name, code, dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-text-secondary/50"
          />
        </div>
      </div>

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
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Employee Detail Slide-over */}
      {selectedEmployeeId && (
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
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              {detailLoading ? (
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
                  </div>

                  {/* Trainings List */}
                  <div>
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
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
