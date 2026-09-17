import { useState, useEffect } from 'react';
import { recurringApi, modulesApi } from '../../api/apiClient';
import { RotateCw, Save, X, Plus, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

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

  if (loading) return <div className="p-8 flex items-center justify-center text-text-secondary h-64">Loading configurations...</div>;

  const availableModules = modules.filter(m => 
    !configs.some(c => c.moduleId === m.moduleId)
  );

  return (
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
        )}
      </div>

      {(isAdding || editingId) && (
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
                  <select 
                    required
                    value={selectedModule}
                    onChange={e => setSelectedModule(e.target.value)}
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
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
