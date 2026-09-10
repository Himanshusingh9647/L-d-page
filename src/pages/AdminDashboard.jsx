import { useApp } from '../context/AppContext';
import KpiCard from '../components/KpiCard';
import Badge from '../components/Badge';
import {
  Users,
  ShieldCheck,
  Clock,
  Download,
  Search,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const {
    state,
    getComplianceRate,
    getPendingTrainings,
    getUserVideoStats,
    getUserPdfStats,
    isUserCompliant,
    dispatch,
  } = useApp();

  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const employees = state.users.filter((u) => u.role === 'employee');
  const filteredEmployees = employees.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.department.toLowerCase().includes(search.toLowerCase())
  );

  const complianceRate = getComplianceRate();
  const pendingCount = getPendingTrainings();

  return (
    <div>
      {/* ── Header ────────────────────────────────────── */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Admin Dashboard</h2>
          <p className="text-sm text-slate-600 mt-1">
            Monitor employee compliance and training progress.
          </p>
        </div>
        <button
          onClick={() =>
            dispatch({
              type: 'SHOW_TOAST',
              payload: {
                message: 'Audit log exported successfully (audit_log_2025.csv)',
                toastType: 'success',
              },
            })
          }
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-md transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" />
          Export Audit Log
        </button>
      </div>

      {/* ── KPI Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <KpiCard
          icon={Users}
          label="Total Employees"
          value={employees.length}
          color="slate"
        />
        <KpiCard
          icon={ShieldCheck}
          label="Compliance Rate"
          value={`${complianceRate}%`}
          color={complianceRate >= 80 ? 'green' : complianceRate >= 50 ? 'amber' : 'blue'}
        />
        <KpiCard
          icon={Clock}
          label="Pending Trainings"
          value={pendingCount}
          color="amber"
        />
      </div>

      {/* ── Employee Table ────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-semibold text-slate-900">Employee Compliance Report</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm rounded-md border border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Employee</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 font-semibold text-center">Videos Completed</th>
                <th className="px-5 py-3 font-semibold text-center">PDFs Consented</th>
                <th className="px-5 py-3 font-semibold text-center">Overall Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((user) => {
                const videoStats = getUserVideoStats(user.id);
                const pdfStats = getUserPdfStats(user.id);
                const compliant = isUserCompliant(user.id);

                return (
                  <tr 
                    key={user.id} 
                    onClick={() => navigate(`/admin/employee/${user.id}`)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    {/* Name + avatar */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-100 text-slate-700 text-xs font-semibold flex-shrink-0">
                          {user.initials}
                        </div>
                        <span className="font-medium text-slate-900">{user.name}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3 text-slate-600">
                      {user.department}
                    </td>

                    {/* Videos */}
                    <td className="px-5 py-3 text-center text-slate-700">
                      {videoStats.completed}/{videoStats.total}
                    </td>

                    {/* PDFs */}
                    <td className="px-5 py-3 text-center text-slate-700">
                      {pdfStats.completed}/{pdfStats.total}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3 text-center">
                      {compliant ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Compliant
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                    No employees found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>
      </div>
    </div>
  );
}
