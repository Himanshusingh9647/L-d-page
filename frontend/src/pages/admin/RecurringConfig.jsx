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

  if (loading) return <div className="p-8 flex items-center justify-center text-slate-400 h-64">Loading configurations...</div>;

  const availableModules = modules.filter(m => 
    !configs.some(c => c.moduleId === m.moduleId)
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Recurring Training</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium">Automate periodic compliance renewals.</p>
        </div>
        
        {!isAdding && !editingId && availableModules.length > 0 && (
          <button onClick={() => setIsAdding(true)} className="btn-primary shadow-md hover:shadow-lg">
            <Plus size={18} />
            <span>New Config</span>
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white rounded-3xl p-8 mb-10 border border-slate-100 shadow-xl shadow-indigo-100/20 animate-fade-in relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <RotateCw size={20} strokeWidth={2.5} />
            </div>
            {isAdding ? 'New Configuration' : 'Edit Configuration'}
          </h3>
          
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            {isAdding && (
              <div className="form-group mb-0 md:col-span-2">
                <label className="form-label text-xs uppercase tracking-widest font-bold">Training Module</label>
                <select 
                  required
                  value={selectedModule}
                  onChange={e => setSelectedModule(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                >
                  <option value="">Select a module...</option>
                  {availableModules.map(m => (
                    <option key={m.moduleId} value={m.moduleId}>{m.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group mb-0 md:col-span-1">
              <label className="form-label text-xs uppercase tracking-widest font-bold">Interval (Days)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="number"
                  min="1"
                  max="3650"
                  required
                  value={intervalDays}
                  onChange={e => setIntervalDays(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            {editingId && (
              <div className="form-group mb-0 flex items-center h-[50px] md:col-span-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-slate-800 transition-colors uppercase tracking-wider">Active</span>
                </label>
              </div>
            )}

            <div className="flex gap-3 pb-1 md:col-span-1 justify-end md:justify-end w-full">
              <button type="button" onClick={resetForm} className="px-5 py-2.5 rounded-xl font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-all">
                Cancel
              </button>
              <button type="submit" className="btn-primary py-2.5 shadow-md">
                <Save size={18} className="mr-1" /> Save
              </button>
            </div>
          </form>
          
          <div className="mt-6 flex items-start gap-3 text-sm text-indigo-700 bg-indigo-50/80 p-4 rounded-xl border border-indigo-100">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed font-medium">
              When an employee completes a recurring training, their progress automatically resets to "Not Started" after the interval passes, ensuring continuous compliance.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Module</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Interval</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="p-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {configs.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-12 text-center text-slate-400 font-medium">
                  No recurring configurations active.
                </td>
              </tr>
            ) : (
              configs.map(config => (
                <tr key={config.configId} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-slate-800 tracking-tight">{config.moduleTitle}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 bg-slate-100 inline-block px-2 py-0.5 rounded shadow-sm">{config.moduleType}</div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold border border-slate-200 shadow-sm">
                      <Calendar size={16} className="text-slate-400" />
                      {config.recurrenceIntervalDays} Days
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    {config.isActive ? (
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm inline-block">Active</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 border border-slate-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm inline-block">Inactive</span>
                    )}
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => startEdit(config)}
                      className="text-indigo-600 hover:text-white font-bold bg-indigo-50 hover:bg-indigo-600 px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow-md border border-indigo-100 hover:border-transparent opacity-0 group-hover:opacity-100"
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
