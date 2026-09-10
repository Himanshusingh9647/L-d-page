import { useState, useEffect } from 'react';
import { assignmentsApi } from '../../api/apiClient';
import { Save, Loader2, CheckSquare, Square, XCircle } from 'lucide-react';

export default function AssignmentsMatrix() {
  const [data, setData] = useState({ employees: [], modules: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState({}); // { 'userId-moduleId': boolean (true=assign, false=remove) }
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

      // Group changes by action
      const toAdd = Object.keys(changes).filter(key => changes[key] === true);
      const toRemove = Object.keys(changes).filter(key => changes[key] === false);

      // Add assignments
      for (const key of toAdd) {
        const [userId, moduleId] = key.split('-');
        // Check if it's already assigned in DB
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

      // Remove assignments
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
      await loadMatrix(); // reload fresh data
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

  if (loading) return <div className="p-8">Loading Assignment Matrix...</div>;

  return (
    <div className="p-8">
      <div className="main-header -mx-8 -mt-8 mb-8 px-8 py-6 flex justify-between items-center bg-white border-b border-slate-200 sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Training Assignment Matrix</h1>
          <p className="text-slate-500 mt-1">Select which training modules each employee needs to complete.</p>
        </div>
        
        {hasChanges && (
          <div className="flex gap-3 items-center animate-fade-in bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
            <span className="text-sm font-medium text-indigo-700 mr-2">Unsaved changes</span>
            <button onClick={discardChanges} className="text-slate-500 hover:text-slate-700 font-medium text-sm px-2">
              Discard
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="btn-primary"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Assignments
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.type === 'error' && <XCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="card overflow-hidden overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-slate-50 border-b border-slate-200 border-r min-w-[200px] sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</span>
              </th>
              {data.modules.map(module => (
                <th key={module.moduleId} className="p-4 bg-slate-50 border-b border-slate-200 min-w-[150px] text-center">
                  <div className="text-sm font-bold text-slate-800 truncate" title={module.title}>{module.title}</div>
                  <div className="text-xs font-medium text-slate-400 uppercase mt-1">{module.type}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.employees.map(employee => (
              <tr key={employee.userId} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 border-r border-slate-200 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  <div className="font-semibold text-slate-800">{employee.fullName}</div>
                  <div className="text-xs text-slate-500">{employee.department}</div>
                </td>
                {data.modules.map(module => {
                  const assigned = isAssigned(employee.userId, module.moduleId);
                  const status = getStatus(employee.userId, module.moduleId);
                  const isChanged = changes[`${employee.userId}-${module.moduleId}`] !== undefined;
                  
                  return (
                    <td key={module.moduleId} className="p-4 text-center">
                      <button
                        onClick={() => toggleAssignment(employee.userId, module.moduleId)}
                        className={`inline-flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                          isChanged ? 'bg-indigo-50 ring-2 ring-indigo-200' : 'hover:bg-slate-100'
                        }`}
                        title={assigned ? 'Click to unassign' : 'Click to assign'}
                      >
                        {assigned ? (
                          <CheckSquare size={24} className="text-indigo-600" />
                        ) : (
                          <Square size={24} className="text-slate-300" />
                        )}
                        
                        {assigned && status && (
                          <span className={`text-[10px] font-bold uppercase mt-1 ${
                            status === 'Completed' ? 'text-emerald-500' :
                            status === 'InProgress' ? 'text-amber-500' : 'text-slate-400'
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
