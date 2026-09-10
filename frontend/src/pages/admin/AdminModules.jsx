import { useState, useEffect } from "react";
import { Plus, Play, FileText, Loader2, RefreshCw, Trash2, Edit2 } from "lucide-react";
import { modulesApi, mediaApi } from "../../api/apiClient";

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [availableMedia, setAvailableMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [editingModuleId, setEditingModuleId] = useState(null);
  
  const initialModuleState = {
    title: "",
    type: "Video",
    description: "",
    duration: 0,
    policyContent: "",
    items: [{ title: "Part 1", contentUrl: "" }]
  };

  const [newModule, setNewModule] = useState(initialModuleState);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [modulesRes, mediaRes] = await Promise.all([
        modulesApi.getAll(),
        mediaApi.getAvailableFiles()
      ]);
      setModules(modulesRes.data.data || []);
      setAvailableMedia(mediaRes.data.data || []);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMedia = async () => {
    try {
      const res = await mediaApi.getAvailableFiles();
      setAvailableMedia(res.data.data || []);
    } catch (error) {
      console.error("Failed to refresh media", error);
    }
  };

  const handleAddItem = () => {
    setNewModule({
      ...newModule,
      items: [...newModule.items, { title: `Part ${newModule.items.length + 1}`, contentUrl: "" }]
    });
  };

  const handleRemoveItem = (index) => {
    const updatedItems = newModule.items.filter((_, i) => i !== index);
    setNewModule({ ...newModule, items: updatedItems });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...newModule.items];
    updatedItems[index][field] = value;
    setNewModule({ ...newModule, items: updatedItems });
  };

  const openCreateModal = () => {
    setEditingModuleId(null);
    setNewModule(initialModuleState);
    setIsModalOpen(true);
  };

  const openEditModal = async (module) => {
    setEditingModuleId(module.moduleId);
    
    // Some modules might not have items populated in the summary list if the API doesn't return them, 
    // but our backend GetAll now returns items. Let's make sure items exist.
    const items = module.items && module.items.length > 0 ? module.items.map(item => ({
      title: item.title,
      // Strip out the base URL to just get the filename
      contentUrl: item.contentUrl ? item.contentUrl.split('/').pop() : ""
    })) : [{ title: "Part 1", contentUrl: "" }];

    setNewModule({
      title: module.title,
      type: module.type,
      description: module.description || "",
      duration: module.duration || 0,
      policyContent: module.policyContent || "",
      items: items
    });
    
    setIsModalOpen(true);
  };

  const handleSubmitModule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const durationMins = parseInt(newModule.duration) || 0;
      
      const payload = {
        title: newModule.title,
        type: newModule.type, // Usually type isn't updated in our DTO but we pass it anyway
        description: newModule.description,
        duration: durationMins.toString(),
        durationSeconds: durationMins * 60,
        policyContent: newModule.policyContent,
        isActive: true, // required by UpdateModuleRequest
        items: newModule.items.map(item => ({
          title: item.title,
          contentUrl: item.contentUrl ? `http://localhost:5155/media/${item.contentUrl}` : "",
        }))
      };

      if (editingModuleId) {
        await modulesApi.update(editingModuleId, payload);
      } else {
        await modulesApi.create(payload);
      }

      setIsModalOpen(false);
      setNewModule(initialModuleState);
      setEditingModuleId(null);
      fetchData();
    } catch (error) {
      console.error("Failed to save module", error);
      alert("Failed to save module. See console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="main-header -mx-8 -mt-8 mb-8 px-8 py-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Module Management</h1>
          <p className="text-slate-500 mt-1">Manage training modules and linked media files.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" />
          <span>New Module</span>
        </button>
      </div>

      <div className="card">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-sm font-semibold text-slate-600">Title</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Type</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Duration</th>
              <th className="p-4 text-sm font-semibold text-slate-600">Items</th>
              <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {modules.map((module) => (
              <tr key={module.moduleId} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <p className="text-sm font-semibold text-slate-800">{module.title}</p>
                  <p className="text-xs text-slate-500 truncate max-w-xs">{module.description}</p>
                </td>
                <td className="p-4">
                  <span className={`badge ${
                    module.type === 'Video' ? 'badge-info' : 'badge-warning'
                  }`}>
                    {module.type === 'Video' ? <Play className="h-3 w-3 mr-1" /> : <FileText className="h-3 w-3 mr-1" />}
                    <span>{module.type}</span>
                  </span>
                </td>
                <td className="p-4 text-sm font-medium text-slate-600">
                  {module.duration} mins
                </td>
                <td className="p-4 text-xs font-medium text-slate-600">
                  {module.items?.length || 0} part(s)
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => openEditModal(module)}
                    className="p-2 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors inline-flex"
                    title="Edit Module"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {modules.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  No modules found. Create one to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="card w-full max-w-lg shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                {editingModuleId ? "Edit Module" : "Create New Module"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {editingModuleId ? "Update the details and parts of this module." : "Add one or more parts to build a course playlist."}
              </p>
            </div>
            
            <form onSubmit={handleSubmitModule} className="flex flex-col overflow-hidden h-full">
              <div className="p-6 space-y-4 bg-slate-50 overflow-y-auto">
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    required
                    value={newModule.title}
                    onChange={e => setNewModule({...newModule, title: e.target.value})}
                    className="input-field"
                    placeholder="E.g., React Masterclass"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    required
                    value={newModule.description}
                    onChange={e => setNewModule({...newModule, description: e.target.value})}
                    className="input-field resize-none h-20"
                    placeholder="Brief description of the overall module..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      value={newModule.type}
                      onChange={e => setNewModule({...newModule, type: e.target.value})}
                      className="input-field"
                      disabled={!!editingModuleId} // Disable changing type if editing
                    >
                      <option value="Video">Video Course</option>
                      <option value="PDF">Document</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Est. Total Duration (mins)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={newModule.duration}
                      onChange={e => setNewModule({...newModule, duration: e.target.value})}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Playlist Items</h3>
                    <button type="button" onClick={refreshMedia} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center font-medium">
                      <RefreshCw className="h-3 w-3 mr-1" /> Refresh files
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newModule.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            required
                            value={item.title}
                            onChange={e => handleItemChange(index, 'title', e.target.value)}
                            className="input-field py-1.5 text-sm"
                            placeholder={`Part ${index + 1} Title`}
                          />
                          <select
                            required
                            value={item.contentUrl}
                            onChange={e => handleItemChange(index, 'contentUrl', e.target.value)}
                            className="input-field py-1.5 text-sm"
                          >
                            <option value="">-- Select {newModule.type} file --</option>
                            {availableMedia
                              .filter(f => newModule.type === 'Video' ? f.toLowerCase().endsWith('.mp4') : f.toLowerCase().endsWith('.pdf'))
                              .map(file => (
                              <option key={file} value={file}>{file}</option>
                            ))}
                          </select>
                        </div>
                        {newModule.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-slate-400 hover:text-rose-500 p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="mt-3 text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add another part
                  </button>
                </div>

                {newModule.type === 'PDF' && (
                  <div className="form-group pt-4 border-t border-slate-200">
                    <label className="form-label">Policy Content / Consent Text</label>
                    <textarea
                      value={newModule.policyContent}
                      onChange={e => setNewModule({...newModule, policyContent: e.target.value})}
                      className="input-field resize-none h-20"
                      placeholder="E.g., I have read and agree to these policies."
                    />
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200 shrink-0 flex space-x-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || newModule.items.length === 0}
                  className="btn-primary flex-1"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingModuleId ? "Save Changes" : "Create Course")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
