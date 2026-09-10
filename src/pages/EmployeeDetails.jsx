import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, CheckCircle2, AlertCircle, Play, FileText } from 'lucide-react';
import Badge from '../components/Badge';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, getModuleProgress, getUserVideoStats, getUserPdfStats, isUserCompliant } = useApp();

  const employee = state.users.find((u) => u.id === id);

  if (!employee) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Employee Not Found</h2>
        <button onClick={() => navigate('/admin')} className="text-blue-600 hover:underline">
          Return to Admin Dashboard
        </button>
      </div>
    );
  }

  const videoStats = getUserVideoStats(id);
  const pdfStats = getUserPdfStats(id);
  const compliant = isUserCompliant(id);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/admin')}
        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
      </button>

      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-slate-100 text-slate-700 text-2xl font-bold">
            {employee.initials}
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{employee.name}</h2>
            <p className="text-slate-500 mt-1">{employee.department} • {employee.role}</p>
          </div>
        </div>
        <div className="flex gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{videoStats.completed}/{videoStats.total}</p>
            <p className="text-xs text-slate-500 font-medium uppercase mt-1">Videos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800">{pdfStats.completed}/{pdfStats.total}</p>
            <p className="text-xs text-slate-500 font-medium uppercase mt-1">PDFs</p>
          </div>
          <div className="flex items-center justify-center">
            {compliant ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                <CheckCircle2 className="w-4 h-4" /> Compliant
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="w-4 h-4" /> Pending Trainings
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Module List */}
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Training History</h3>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3 font-semibold">Module Name</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Requirement</th>
              <th className="px-5 py-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {state.modules.map((mod) => {
              const progress = getModuleProgress(id, mod.id);
              const isCompleted = progress?.status === 'completed';
              
              return (
                <tr key={mod.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {mod.title}
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      {mod.type === 'video' ? <Play className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                      <span className="capitalize">{mod.type}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {mod.required ? <Badge variant="required">Required</Badge> : <Badge variant="optional">Optional</Badge>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600">
                        <AlertCircle className="w-4 h-4" /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
