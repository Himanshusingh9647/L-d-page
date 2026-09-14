import { useState, useEffect } from 'react';
import { assignmentsApi } from '../../api/apiClient';
import { Save, Loader2, CheckSquare, Square, XCircle } from 'lucide-react';

export default function AssignmentsMatrix() {
  const [data, setData] = useState({ employees: [], modules: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadMatrix();
  }, []);

  const loadMatrix = async () => {
    try {
      const response = await assignmentsApi.getMatrix();
      setData(response.data.data);
      setChanges({});
    } catch (error) {
      console.error('Failed to load matrix:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAssigned = (userId, moduleId) => {
    const key = `${userId}-${moduleId}`;
    if (changes[key] !== undefined) return changes[key];
    
    return data.assignments.some(a => a.userId === userId && a.moduleId === moduleId && a.isAssigned);
  };

  const getStatus = (userId, moduleId) => {
    const assignment = data.assignments.find(a => a.userId === userId && a.moduleId === moduleId);
    return assignment ? assignment.status : null;
  };

  const toggleAssignment = (userId, moduleId) => {
    const key = `${userId}-${moduleId}`;
    const currentlyAssigned = isAssigned(userId, moduleId);
    
    setChanges(prev => ({
      ...prev,
      [key]: !currentlyAssigned
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      let addCount = 0;
      let removeCount = 0;

      const toAdd = Object.keys(changes).filter(key => changes[key] === true);
      const toRemove = Object.keys(changes).filter(key => changes[key] === false);

      for (const key of toAdd) {
        const [userId, moduleId] = key.split('-');
        const alreadyExists = data.assignments.some(a => a.userId === parseInt(userId) && a.moduleId === parseInt(moduleId) && a.isAssigned);
        if (!alreadyExists) {
           await assignmentsApi.create({
             userIds: [parseInt(userId)],
             moduleIds: [parseInt(moduleId)],
             isRequired: true
           });
           addCount++;
        }
      }

      for (const key of toRemove) {
        const [userId, moduleId] = key.split('-');
        const alreadyExists = data.assignments.some(a => a.userId === parseInt(userId) && a.moduleId === parseInt(moduleId) && a.isAssigned);
        if (alreadyExists) {
          await assignmentsApi.remove({
            userId: parseInt(userId),
            moduleId: parseInt(moduleId)
          });
          removeCount++;
        }
      }

      setMessage({ type: 'success', text: `Saved successfully: ${addCount} assigned, ${removeCount} removed.` });
      await loadMatrix(); 
    } catch (error) {
      console.error('Failed to save assignments:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to save assignments.' });
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setChanges({});
    setMessage(null);
  };

  const hasChanges = Object.keys(changes).length > 0;

  if (loading) return <div className="p-8 flex items-center justify-center text-slate-400 h-64">Loading Assignment Matrix...</div>;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      <div className="main-header -mx-8 -mt-8 mb-8 px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Training Assignment Matrix</h1>
          <p className="text-sm text-slate-500 mt-1">Select which training modules each employee needs to complete.</p>
        </div>
        
        {hasChanges && (
          <div className="flex gap-3 items-center animate-fade-in bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100/50 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 mr-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Unsaved changes
            </span>
            <button onClick={discardChanges} className="text-slate-500 hover:text-slate-700 font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-white transition-colors">
              Discard
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="btn-primary py-1.5 px-4 text-sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
              Save Assignments
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 font-medium text-sm border shadow-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
          {message.type === 'error' ? <XCircle size={18} /> : <CheckSquare size={18} />}
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto relative z-10">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-100 border-r min-w-[220px] sticky left-0 z-20 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Employee</span>
              </th>
              {data.modules.map(module => (
                <th key={module.moduleId} className="p-4 bg-slate-50/80 backdrop-blur-md border-b border-slate-100 min-w-[160px] text-center">
                  <div className="text-sm font-bold text-slate-700 truncate tracking-tight" title={module.title}>{module.title}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 bg-white inline-block px-2 py-0.5 rounded shadow-sm border border-slate-100">{module.type}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.employees.map(employee => (
              <tr key={employee.userId} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4 border-r border-slate-100 sticky left-0 bg-white z-10 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)] group-hover:bg-slate-50/50 transition-colors">
                  <div className="font-semibold text-slate-800 text-sm">{employee.fullName}</div>
                  <div className="text-xs font-medium text-slate-400 mt-0.5">{employee.department}</div>
                </td>
                {data.modules.map(module => {
                  const assigned = isAssigned(employee.userId, module.moduleId);
                  const status = getStatus(employee.userId, module.moduleId);
                  const isChanged = changes[`${employee.userId}-${module.moduleId}`] !== undefined;
                  
                  return (
                    <td key={module.moduleId} className="p-4 text-center">
                      <button
                        onClick={() => toggleAssignment(employee.userId, module.moduleId)}
                        className={`inline-flex flex-col items-center justify-center p-3 rounded-xl transition-all w-24 h-20 ${
                          isChanged ? 'bg-indigo-50 border border-indigo-100 shadow-inner' : 'hover:bg-slate-50 hover:shadow-sm border border-transparent'
                        }`}
                        title={assigned ? 'Click to unassign' : 'Click to assign'}
                      >
                        {assigned ? (
                          <div className={`flex items-center justify-center w-6 h-6 rounded ${isChanged ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-800 text-white shadow-sm'}`}>
                            <CheckSquare size={14} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-slate-200 text-transparent">
                            <Square size={14} />
                          </div>
                        )}
                        
                        {assigned && status && (
                          <span className={`text-[9px] font-bold uppercase tracking-widest mt-2 px-1.5 py-0.5 rounded ${
                            status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                            status === 'InProgress' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {status}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
