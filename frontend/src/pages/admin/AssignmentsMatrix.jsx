import { useState, useEffect } from 'react';
import { assignmentsApi } from '../../api/apiClient';
import { 
  Save, Loader2, CheckSquare, Square, XCircle, Search, Filter, 
  RotateCw, Calendar, Clock, Shield, Building2, Check, Sparkles 
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AssignmentsMatrix() {
  const [data, setData] = useState({ employees: [], modules: [], assignments: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState({});
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Assignment configuration
  const [isRecurring, setIsRecurring] = useState(true);
  const [recurrenceDays, setRecurrenceDays] = useState(90);
  const [completionDays, setCompletionDays] = useState(5);
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
      toast.error('Failed to load assignment matrix');
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

  // Bulk column assign/unassign for visible employees
  const bulkToggleModule = (moduleId, assign) => {
    const visibleEmployees = getFilteredEmployees();
    setChanges(prev => {
      const next = { ...prev };
      visibleEmployees.forEach(emp => {
        next[`${emp.userId}-${moduleId}`] = assign;
      });
      return next;
    });
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
            dueDate: globalDueDate || null,
            isRecurring: isRecurring,
            recurrenceIntervalDays: isRecurring ? parseInt(recurrenceDays) || 90 : null,
            completionDays: parseInt(completionDays) || 5
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

  // Filtered lists
  const getFilteredEmployees = () => {
    return data.employees.filter(emp => {
      const matchesSearch = emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeCode.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  const filteredModules = data.modules.filter(mod => {
    if (selectedCategory === 'ALL') return true;
    return (mod.category || 'HR') === selectedCategory;
  });

  const filteredEmployees = getFilteredEmployees();
  const hasChanges = Object.keys(changes).length > 0;

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-400 h-64">
        <Loader2 className="animate-spin text-blue-600 mr-2" size={24} />
        Loading Assignment Matrix...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900">
              Curriculum Assignment Engine
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Training Assignment Matrix
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Assign mandatory IT Security & HR modules to employees with dual-window recurrence.
          </p>
        </div>

        {/* Action Save Bar */}
        {hasChanges && (
          <div className="flex flex-wrap gap-3 items-center animate-fade-in bg-blue-50/80 dark:bg-blue-950/70 px-4 py-2.5 rounded-2xl border border-blue-200 dark:border-blue-900 shadow-lg">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
              Unsaved changes ({Object.keys(changes).length})
            </span>

            <div className="h-4 w-[1px] bg-blue-200 dark:bg-blue-800 mx-1"></div>

            <button 
              onClick={discardChanges} 
              className="text-slate-500 dark:text-slate-400 hover:text-slate-700 font-semibold text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/50 transition-colors"
            >
              Discard
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="btn-primary py-2 px-4 text-xs font-bold shadow-md hover:shadow-lg cursor-pointer"
            >
              {saving ? <Loader2 size={15} className="animate-spin mr-1.5" /> : <Save size={15} className="mr-1.5" />}
              Save Assignments
            </button>
          </div>
        )}
      </div>

      {/* Configuration & Filter Bar */}
      <div className="card p-5 mb-6 border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-sm">
        
        {/* Top row: Recurring Configuration Settings */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="flex items-center gap-1">
                <RotateCw size={14} className="text-blue-600" />
                Recurring Training
              </span>
            </label>

            {isRecurring && (
              <>
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Clock size={13} className="text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Completion Window:</span>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={completionDays}
                    onChange={(e) => setCompletionDays(e.target.value)}
                    className="w-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-center font-bold text-blue-600 dark:text-blue-400"
                  />
                  <span className="font-semibold text-slate-600 dark:text-slate-300">days</span>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <RotateCw size={13} className="text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Re-assign every:</span>
                  <input
                    type="number"
                    min="1"
                    max="730"
                    value={recurrenceDays}
                    onChange={(e) => setRecurrenceDays(e.target.value)}
                    className="w-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-center font-bold text-blue-600 dark:text-blue-400"
                  />
                  <span className="font-semibold text-slate-600 dark:text-slate-300">days</span>
                </div>
              </>
            )}

            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <Calendar size={13} className="text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400 font-medium">Explicit Due Date:</span>
              <input
                type="date"
                value={globalDueDate}
                onChange={(e) => setGlobalDueDate(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 font-medium outline-none text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <span className="text-slate-400 italic text-[11px]">
            * Settings will apply to new assignments saved in this session.
          </span>
        </div>

        {/* Bottom row: Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search employee by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 text-xs py-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase">Track:</span>
              {['ALL', 'IT', 'HR'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'ALL' ? 'All Tracks' : cat === 'IT' ? 'IT Security' : 'HR Culture'}
                </button>
              ))}
            </div>


          </div>
        </div>
      </div>

      {/* Interactive Matrix Table */}
      <div className="card border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden overflow-x-auto relative">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-r border-slate-200 dark:border-slate-700 min-w-[240px] sticky left-0 z-20 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)]">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Employee ({filteredEmployees.length})
                </span>
              </th>
              {filteredModules.map(module => (
                <th key={module.moduleId} className="p-3.5 bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 min-w-[170px] text-center">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate tracking-tight max-w-[170px] mx-auto" title={module.title}>
                    {module.title}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-1.5">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${module.category === 'IT' ? 'badge-it' : 'badge-hr'}`}>
                      {module.category || 'HR'}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">
                      {module.type}
                    </span>
                  </div>

                  {/* Bulk Column Assign Tool */}
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-center gap-2">
                    <button
                      onClick={() => bulkToggleModule(module.moduleId, true)}
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-bold"
                      title="Assign to all visible employees"
                    >
                      + All
                    </button>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <button
                      onClick={() => bulkToggleModule(module.moduleId, false)}
                      className="text-[10px] text-slate-400 hover:text-rose-500 font-bold"
                      title="Clear for all visible employees"
                    >
                      Clear
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredEmployees.map(employee => (
              <tr key={employee.userId} className="table-row-hover hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                <td className="p-3.5 bg-white dark:bg-[#111827] group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800/80 border-r border-slate-100 dark:border-slate-800 sticky left-0 z-10 shadow-[4px_0_10px_-4px_rgba(0,0,0,0.05)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900">
                      {employee.initials || 'EM'}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {employee.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {employee.employeeCode}
                      </div>
                    </div>
                  </div>
                </td>

                {filteredModules.map(module => {
                  const assigned = isAssigned(employee.userId, module.moduleId);
                  const status = getStatus(employee.userId, module.moduleId);
                  const isModified = changes[`${employee.userId}-${module.moduleId}`] !== undefined;

                  return (
                    <td 
                      key={module.moduleId}
                      onClick={() => toggleAssignment(employee.userId, module.moduleId)}
                      className="p-3 text-center cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/30 transition-colors select-none"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                          assigned 
                            ? isModified
                              ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/40 scale-105'
                              : status === 'Completed'
                                ? 'bg-emerald-500 text-white shadow-sm'
                                : 'bg-blue-600 text-white shadow-sm'
                            : isModified
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 border border-rose-300'
                              : 'border border-slate-200 dark:border-slate-700 text-transparent hover:border-slate-400'
                        }`}>
                          {assigned ? <Check size={16} strokeWidth={3} /> : <span className="opacity-0">•</span>}
                        </div>
                        
                        {assigned && (
                          <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${
                            status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                          }`}>
                            {status || 'Pending'}
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={filteredModules.length + 1} className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                  No employees found matching your search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
