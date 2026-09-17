import { useState, useEffect } from 'react';
import { assignmentsApi } from '../../api/apiClient';
import { Save, Loader2, CheckSquare, Square, XCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function AssignmentsMatrix() {
  const [data, setData] = useState({ employees: [], modules: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState({});
  const [globalDueDate, setGlobalDueDate] = useState('');
  const toast = useToast();

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
             isRequired: true,
             dueDate: globalDueDate ? globalDueDate : null
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

      toast.success(`Saved successfully: ${addCount} assigned, ${removeCount} removed.`);
      await loadMatrix(); 
    } catch (error) {
      console.error('Failed to save assignments:', error);
      toast.error(error.response?.data?.message || 'Failed to save assignments.');
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    setChanges({});
  };

  const hasChanges = Object.keys(changes).length > 0;

  if (loading) return <div className="p-8 flex items-center justify-center text-text-secondary h-64">Loading Assignment Matrix...</div>;

  return (
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-8 flex flex-col min-h-[calc(100vh-64px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Assignment Matrix</h1>
          <p className="text-sm text-text-secondary mt-1">Assign and manage mandatory training per department or role.</p>
        </div>
        
        {hasChanges && (
          <div className="flex gap-3 items-center animate-fade-in bg-warning/10 px-4 py-2 rounded-xl border border-warning/20 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-warning mr-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-warning animate-pulse"></span>
              Unsaved changes
            </span>
            <div className="flex items-center gap-2 mr-2 border-r border-warning/20 pr-4">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Due Date:</label>
              <input 
                type="date" 
                value={globalDueDate}
                onChange={(e) => setGlobalDueDate(e.target.value)}
                className="text-sm bg-surface border border-border rounded-lg px-2 py-1 outline-none focus:border-primary focus:ring-1 focus:ring-primary text-text"
              />
            </div>
            <button onClick={discardChanges} className="text-text-secondary hover:text-text font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-surface-hover transition-colors">
              Discard
            </button>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              size="sm"
            >
              {saving ? <Loader2 size={16} className="animate-spin mr-2 inline" /> : <Save size={16} className="mr-2 inline" />}
              Save Assignments
            </Button>
          </div>
        )}
      </div>
      <Card className="flex-1 flex flex-col min-h-0 relative z-10">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 bg-surface-hover backdrop-blur-md border-b border-border border-r min-w-[220px] sticky left-0 z-20 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Employee</span>
                </th>
                {data.modules.map(module => (
                  <th key={module.moduleId} className="p-4 bg-surface-hover backdrop-blur-md border-b border-border min-w-[160px] text-center">
                    <div className="text-sm font-bold text-text truncate tracking-tight" title={module.title}>{module.title}</div>
                    <Badge variant="default" className="mt-1.5">{module.type}</Badge>
                  </th>
                ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.employees.map(employee => (
              <tr key={employee.userId} className="hover:bg-slate-50 transition-colors group">
                <td className="p-4 border-r border-border sticky left-0 bg-surface z-10 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.02)] group-hover:bg-slate-50 transition-colors">
                  <div className="font-semibold text-text text-sm">{employee.fullName}</div>
                  <div className="text-xs font-medium text-text-secondary mt-0.5">{employee.department}</div>
                </td>
                {data.modules.map(module => {
                  const assigned = isAssigned(employee.userId, module.moduleId);
                  const status = getStatus(employee.userId, module.moduleId);
                  const isChanged = changes[`${employee.userId}-${module.moduleId}`] !== undefined;
                  
                  return (
                    <td key={module.moduleId} className="p-4 text-center">
                      <button
                        onClick={() => toggleAssignment(employee.userId, module.moduleId)}
                        className={`inline-flex flex-col items-center justify-center p-3 rounded-xl transition-all w-24 h-20 outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          isChanged ? 'bg-primary-light border border-primary/20 shadow-inner' : 'hover:bg-surface-hover hover:shadow-sm border border-transparent'
                        }`}
                        title={assigned ? 'Click to unassign' : 'Click to assign'}
                      >
                        {assigned ? (
                          <div className={`flex items-center justify-center w-6 h-6 rounded ${isChanged ? 'bg-primary text-white shadow-md' : 'bg-slate-800 text-white shadow-sm'}`}>
                            <CheckSquare size={14} strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-6 h-6 rounded border-2 border-border text-transparent">
                            <Square size={14} />
                          </div>
                        )}
                        
                        {assigned && status && (
                          <Badge 
                            variant={status === 'Completed' ? 'success' : status === 'InProgress' ? 'warning' : 'secondary'} 
                            className="mt-2 text-[9px] px-1.5 py-0.5"
                          >
                            {status}
                          </Badge>
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
      </Card>
    </div>
  );
}
