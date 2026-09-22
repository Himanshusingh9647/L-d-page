import { useState, useEffect } from 'react';
import { recurringApi, modulesApi } from '../../api/apiClient';
<<<<<<< HEAD
import { RotateCw, Save, X, Plus, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
=======
import { 
  RotateCw, Save, X, Plus, AlertCircle, Calendar, Clock, 
  Shield, Building2, CheckCircle2, Edit2, Trash2, Check 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad

export default function RecurringConfig() {
  const [configs, setConfigs] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [selectedModule, setSelectedModule] = useState('');
  const [intervalDays, setIntervalDays] = useState(90);
  const [completionDays, setCompletionDays] = useState(5);
  const [isActive, setIsActive] = useState(true);

  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [confRes, modRes] = await Promise.all([
        recurringApi.getAll(),
        modulesApi.getAll()
      ]);
      setConfigs(confRes.data.data || []);
      setModules(modRes.data.data || []);
    } catch (error) {
      console.error('Error loading recurring configs:', error);
      toast.error('Failed to load recurring configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (isAdding) {
        await recurringApi.create({
          moduleId: parseInt(selectedModule),
          recurrenceIntervalDays: parseInt(intervalDays) || 90,
          completionDays: parseInt(completionDays) || 5
        });
        toast.success('Recurring schedule configuration created!');
      } else if (editingId) {
        await recurringApi.update(editingId, {
          recurrenceIntervalDays: parseInt(intervalDays) || 90,
          completionDays: parseInt(completionDays) || 5,
          isActive
        });
        toast.success('Recurring schedule configuration updated!');
      }
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error(error.response?.data?.message || 'Error saving configuration');
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setSelectedModule('');
    setIntervalDays(90);
    setCompletionDays(5);
    setIsActive(true);
  };

  const startEdit = (config) => {
    setEditingId(config.configId);
    setSelectedModule(config.moduleId.toString());
    setIntervalDays(config.recurrenceIntervalDays);
    setCompletionDays(config.completionDays || 5);
    setIsActive(config.isActive);
    setIsAdding(false);
  };

<<<<<<< HEAD
  if (loading) return <div className="p-8 flex items-center justify-center text-text-secondary h-64">Loading configurations...</div>;
=======
  const handleDelete = async (configId) => {
    if (!window.confirm('Are you sure you want to remove this recurring configuration?')) return;
    try {
      await recurringApi.delete(configId);
      toast.success('Configuration removed.');
      await loadData();
    } catch (error) {
      console.error('Failed to delete config', error);
      toast.error('Failed to delete configuration');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-400 h-64">
        Loading recurring training rules...
      </div>
    );
  }
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad

  const availableModules = modules.filter(m => 
    !configs.some(c => c.moduleId === m.moduleId)
  );

  return (
<<<<<<< HEAD
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-8 flex flex-col min-h-[calc(100vh-64px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Recurring Training</h1>
          <p className="text-sm text-text-secondary mt-1">Configure compliance rules for modules that must be repeated annually.</p>
        </div>
        
        {!isAdding && !editingId && availableModules.length > 0 && (
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            <span>New Config</span>
          </Button>
=======
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Recurring Training
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set up modules to automatically re-assign to employees on a cycle (e.g. every 90 days).
          </p>
        </div>
        
        {!isAdding && !editingId && availableModules.length > 0 && (
          <button onClick={() => setIsAdding(true)} className="btn-primary shadow-md hover:shadow-lg">
            <Plus size={16} />
            <span>New Rule</span>
          </button>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
        )}
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
<<<<<<< HEAD
        <Card className="mb-10 relative overflow-hidden border-primary/20 shadow-lg">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-light"></div>
          <CardContent className="p-8">
            <h3 className="text-xl font-bold text-text mb-6 flex items-center gap-3 tracking-tight">
              <div className="p-2 bg-primary-light rounded-xl text-primary">
                <RotateCw size={20} strokeWidth={2.5} />
              </div>
              {isAdding ? 'New Configuration' : 'Edit Configuration'}
            </h3>
            
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              {isAdding && (
                <div className="md:col-span-2">
                  <label className="block text-xs uppercase tracking-widest font-bold text-text-secondary mb-1.5">Training Module</label>
=======
        <div className="card p-6 md:p-8 mb-8 border border-blue-200/80 dark:border-blue-900/60 shadow-xl bg-white dark:bg-[#111827] animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500"></div>
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2.5 tracking-tight">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                <RotateCw size={18} strokeWidth={2.5} />
              </div>
              {isAdding ? 'New Recurring Rule' : 'Edit Recurring Rule'}
            </h3>

            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg">
              <X size={18} />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isAdding ? (
                <div className="form-group mb-0 md:col-span-3">
                  <label className="form-label">Training Module</label>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
                  <select 
                    required
                    value={selectedModule}
                    onChange={e => setSelectedModule(e.target.value)}
<<<<<<< HEAD
                    className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-sm text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium"
                  >
                    <option value="">Select a module...</option>
                    {availableModules.map(m => (
                      <option key={m.moduleId} value={m.moduleId}>{m.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="md:col-span-1">
                <label className="block text-xs uppercase tracking-widest font-bold text-text-secondary mb-1.5">Interval (Days)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-text-secondary" />
                  </div>
                  <input 
                    type="number"
                    min="1"
                    max="3650"
                    required
                    value={intervalDays}
                    onChange={e => setIntervalDays(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-text"
                  />
                </div>
              </div>

              {editingId && (
                <div className="md:col-span-1 flex items-center h-[38px]">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox"
                        checked={isActive}
                        onChange={e => setIsActive(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                    <span className="text-sm font-bold text-text-secondary group-hover:text-text transition-colors uppercase tracking-wider">Active</span>
                  </label>
                </div>
              )}

              <div className="flex gap-3 pb-1 md:col-span-1 justify-end w-full">
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save size={16} className="mr-2" /> Save
                </Button>
              </div>
            </form>
            
            <div className="mt-6 flex items-start gap-3 text-sm text-primary bg-primary-light/50 p-4 rounded-xl border border-primary/10">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed font-medium">
                When an employee completes a recurring training, their progress automatically resets to "Not Started" after the interval passes, ensuring continuous compliance.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-hover border-b border-border">
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Module</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">Interval</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">Status</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {configs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-text-secondary text-sm">
                    No recurring configurations active.
                  </td>
                </tr>
              ) : (
                configs.map(config => (
                  <tr key={config.configId} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4">
                      <div className="font-semibold text-text tracking-tight text-sm">{config.moduleTitle}</div>
                      <Badge variant="default" className="mt-1">{config.moduleType}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface text-text-secondary rounded-lg text-sm font-medium border border-border shadow-sm">
                        <Calendar size={14} className="text-text-secondary" />
                        {config.recurrenceIntervalDays} Days
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {config.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button 
                        variant="secondary"
                        size="sm"
                        onClick={() => startEdit(config)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
=======
                    className="input-field font-semibold text-sm"
                  >
                    <option value="">-- Select a training module to automate --</option>
                    {availableModules.map(m => (
                      <option key={m.moduleId} value={m.moduleId}>
                        [{m.category || 'HR'}] {m.title} ({m.type})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group mb-0 md:col-span-3">
                  <label className="form-label">Module</label>
                  <div className="input-field bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                    {configs.find(c => c.configId === editingId)?.moduleTitle}
                  </div>
                </div>
              )}

              {/* Completion Window */}
              <div className="form-group mb-0">
                <label className="form-label flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-600" />
                  Completion Window (Days)
                </label>
                <input 
                  type="number" 
                  min="1"
                  max="180"
                  required
                  value={completionDays}
                  onChange={e => setCompletionDays(e.target.value)}
                  className="input-field text-sm"
                  placeholder="e.g. 5 days to complete"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Days employee has to complete after assignment/re-assignment.
                </p>
              </div>

              {/* Recurrence Interval */}
              <div className="form-group mb-0">
                <label className="form-label flex items-center gap-1.5">
                  <RotateCw size={14} className="text-indigo-600" />
                  Recurrence Cycle (Days)
                </label>
                <input 
                  type="number" 
                  min="7"
                  max="730"
                  required
                  value={intervalDays}
                  onChange={e => setIntervalDays(e.target.value)}
                  className="input-field text-sm"
                  placeholder="e.g. 90 days after completion"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Days after completion before module automatically re-assigns.
                </p>
              </div>

              {/* Active Toggle */}
              <div className="form-group mb-0 flex flex-col justify-end">
                <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white block">Rule Active</span>
                    <span className="text-[10px] text-slate-400">Background engine will process resets</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={resetForm} className="btn-secondary px-5 text-xs font-bold">
                Cancel
              </button>
              <button type="submit" className="btn-primary px-6 text-xs font-bold shadow-md">
                <Save size={15} />
                {isAdding ? 'Create Rule' : 'Update Rule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Configs Table */}
      <div className="card shadow-sm border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Module</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Domain</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Completion Window</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Re-assign Every</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {configs.map((config) => (
                <tr key={config.configId} className="table-row-hover hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 max-w-xs">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{config.moduleTitle}</p>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{config.moduleType}</span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${config.category === 'IT' ? 'badge-it' : 'badge-hr'}`}>
                      {config.category === 'IT' ? <Shield className="w-3 h-3 mr-1" /> : <Building2 className="w-3 h-3 mr-1" />}
                      {config.category === 'IT' ? 'IT' : 'HR'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200/80 dark:border-blue-900">
                      <Clock size={13} /> {config.completionDays || 5} Days to Complete
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200/80 dark:border-indigo-900">
                      <RotateCw size={13} /> Every {config.recurrenceIntervalDays} Days
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${config.isActive ? 'badge-success' : 'badge-neutral'}`}>
                      {config.isActive ? '● Active' : '○ Paused'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        onClick={() => startEdit(config)}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Rule"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(config.configId)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Delete Rule"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {configs.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 text-sm">
                    No recurring training rules configured yet. Create one to automate compliance renewal cycles.
                  </td>
                </tr>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
              )}
            </tbody>
          </table>
        </div>
<<<<<<< HEAD
      </Card>
=======
      </div>
>>>>>>> c82bfbef095a0618f2e81bd94d2b320ca44209ad
    </div>
  );
}
