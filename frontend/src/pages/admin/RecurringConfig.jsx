import { useState, useEffect } from 'react';
import { recurringApi, modulesApi } from '../../api/apiClient';
import { RotateCw, Save, X, Plus, AlertCircle, Calendar } from 'lucide-react';

export default function RecurringConfig() {
  const [configs, setConfigs] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [selectedModule, setSelectedModule] = useState('');
  const [intervalDays, setIntervalDays] = useState(90);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [confRes, modRes] = await Promise.all([
        recurringApi.getAll(),
        modulesApi.getAll()
      ]);
      setConfigs(confRes.data.data);
      setModules(modRes.data.data);
    } catch (error) {
      console.error('Error loading recurring configs:', error);
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
          recurrenceIntervalDays: parseInt(intervalDays)
        });
      } else if (editingId) {
        await recurringApi.update(editingId, {
          recurrenceIntervalDays: parseInt(intervalDays),
          isActive
        });
      }
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving config:', error);
      alert(error.response?.data?.message || 'Error saving configuration');
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setSelectedModule('');
    setIntervalDays(90);
    setIsActive(true);
  };

  const startEdit = (config) => {
    setEditingId(config.configId);
    setIntervalDays(config.recurrenceIntervalDays);
    setIsActive(config.isActive);
    setIsAdding(false);
  };

  if (loading) return <div className="p-8">Loading configurations...</div>;

  const availableModules = modules.filter(m => 
    !configs.some(c => c.moduleId === m.moduleId)
  );

  return (
    <div className="p-8">
      <div className="main-header -mx-8 -mt-8 mb-8 px-8 py-6 flex justify-between items-center bg-white border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Recurring Training</h1>
          <p className="text-slate-500 mt-1">Configure trainings that employees must repeat periodically.</p>
        </div>
        
        {!isAdding && !editingId && availableModules.length > 0 && (
          <button onClick={() => setIsAdding(true)} className="btn-primary">
            <Plus size={18} />
            Add Configuration
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="card p-6 mb-8 bg-indigo-50/50 border-indigo-100 shadow-inner animate-fade-in">
          <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
            <RotateCw size={20} className="text-indigo-600" />
            {isAdding ? 'New Recurring Configuration' : 'Edit Recurring Configuration'}
          </h3>
          
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {isAdding && (
              <div className="form-group mb-0 md:col-span-2">
                <label className="form-label">Training Module</label>
                <select 
                  required
                  value={selectedModule}
                  onChange={e => setSelectedModule(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select a module...</option>
                  {availableModules.map(m => (
                    <option key={m.moduleId} value={m.moduleId}>{m.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group mb-0">
              <label className="form-label">Recurrence Interval (Days)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <input 
                  type="number"
                  min="1"
                  max="3650"
                  required
                  value={intervalDays}
                  onChange={e => setIntervalDays(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
            </div>

            {editingId && (
              <div className="form-group mb-0 flex items-center h-[42px]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </label>
              </div>
            )}

            <div className="flex gap-2 pb-0.5 md:col-span-1 justify-end md:justify-start">
              <button type="submit" className="btn-primary flex-1 md:flex-none">
                <Save size={16} /> Save
              </button>
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
          
          <div className="mt-4 flex items-start gap-2 text-sm text-indigo-700 bg-indigo-100/50 p-3 rounded-lg border border-indigo-200/50">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <p>
              When an employee completes a recurring training, it will automatically be reset to "Not Started" after the specified interval, requiring them to complete it again.
            </p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Module</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Interval</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {configs.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">
                  No recurring configurations found.
                </td>
              </tr>
            ) : (
              configs.map(config => (
                <tr key={config.configId} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4">
                    <div className="font-semibold text-slate-800">{config.moduleTitle}</div>
                    <div className="text-xs text-slate-500 uppercase mt-0.5">{config.moduleType}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                      <Calendar size={14} className="text-slate-500" />
                      {config.recurrenceIntervalDays} Days
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {config.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-neutral">Inactive</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => startEdit(config)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
