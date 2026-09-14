import { useState, useEffect, useRef } from "react";
import { Plus, Play, FileText, Loader2, RefreshCw, Trash2, Edit2, UploadCloud, CheckCircle } from "lucide-react";
import { modulesApi, mediaApi } from "../../api/apiClient";

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [availableMedia, setAvailableMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = useRef(null);
  
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

  const handleFileDrop = async (e) => {
    e.preventDefault();
    if (uploading) return;
    
    const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
    if (!file) return;

    await uploadFile(file);
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadError("");
    setUploadSuccess("");

    try {
      const res = await mediaApi.upload(file, (percent) => {
        setUploadProgress(percent);
      });
      setUploadSuccess(`Successfully uploaded ${res.data.data.fileName}`);
      await refreshMedia();
      
      // Auto-select the uploaded file if we are editing an item
      if (newModule.items.length === 1 && !newModule.items[0].contentUrl) {
        handleItemChange(0, 'contentUrl', res.data.data.fileName);
      }
    } catch (error) {
      console.error("Upload failed", error);
      setUploadError(error.response?.data?.message || "Upload failed. Max size is 500MB.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
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
    setUploadError("");
    setUploadSuccess("");
    setIsModalOpen(true);
  };

  const openEditModal = async (module) => {
    setEditingModuleId(module.moduleId);
    setUploadError("");
    setUploadSuccess("");
    
    const items = module.items && module.items.length > 0 ? module.items.map(item => ({
      title: item.title,
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
        type: newModule.type,
        description: newModule.description,
        duration: durationMins.toString(),
        durationSeconds: durationMins * 60,
        policyContent: newModule.policyContent,
        isActive: true,
        items: newModule.items.map(item => ({
          title: item.title,
          contentUrl: item.contentUrl ? `${import.meta.env.VITE_API_URL || 'http://localhost:5155'}/media/${item.contentUrl}` : "",
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
      <div className="main-header -mx-8 -mt-8 mb-8 px-8 py-6 flex justify-between items-center bg-white shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Module Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage training modules and video assets.</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary shadow-md hover:shadow-lg">
          <Plus className="h-4 w-4" />
          <span>New Module</span>
        </button>
      </div>

      <div className="card shadow-sm border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Items</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modules.map((module) => (
                <tr key={module.moduleId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-semibold text-slate-700">{module.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{module.description}</p>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${
                      module.type === 'Video' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {module.type === 'Video' ? <Play className="h-3 w-3 mr-1.5" /> : <FileText className="h-3 w-3 mr-1.5" />}
                      {module.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600">
                    {module.duration} mins
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600">
                    {module.items?.length || 0} part(s)
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openEditModal(module)}
                      className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors inline-flex"
                      title="Edit Module"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {modules.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-400 text-sm">
                    No modules found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col border-0">
            <div className="p-6 border-b border-slate-100 shrink-0 bg-white">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                {editingModuleId ? "Edit Module" : "Create New Module"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Configure module details and upload or select media files.
              </p>
            </div>
            
            <form onSubmit={handleSubmitModule} className="flex flex-col overflow-hidden h-full">
              <div className="p-6 space-y-6 bg-slate-50 overflow-y-auto">
                
                {/* File Upload Section */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 tracking-tight">Upload Media</h3>
                  
                  <label 
                    className={`upload-zone flex flex-col items-center justify-center ${uploading ? 'uploading' : ''}`}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                  >
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef}
                      accept=".mp4,.webm,.pdf" 
                      onChange={handleFileDrop}
                      disabled={uploading}
                    />
                    
                    {uploading ? (
                      <div className="w-full max-w-xs">
                        <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-3 shadow-sm">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                        <p className="text-xs text-slate-500 mt-1">MP4, WEBM, PDF up to 500MB</p>
                      </>
                    )}
                  </label>

                  {uploadSuccess && (
                    <div className="mt-3 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg flex items-center border border-emerald-100">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {uploadSuccess}
                    </div>
                  )}
                  {uploadError && (
                    <div className="mt-3 p-3 bg-rose-50 text-rose-700 text-sm rounded-lg border border-rose-100">
                      {uploadError}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="form-group mb-0">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      required
                      value={newModule.title}
                      onChange={e => setNewModule({...newModule, title: e.target.value})}
                      className="input-field"
                      placeholder="E.g., Security Training"
                    />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Type</label>
                    <select
                      value={newModule.type}
                      onChange={e => setNewModule({...newModule, type: e.target.value})}
                      className="input-field"
                      disabled={!!editingModuleId}
                    >
                      <option value="Video">Video Course</option>
                      <option value="PDF">Document</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    required
                    value={newModule.description}
                    onChange={e => setNewModule({...newModule, description: e.target.value})}
                    className="input-field resize-none h-20"
                    placeholder="Brief description..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Total Duration (mins)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newModule.duration}
                    onChange={e => setNewModule({...newModule, duration: e.target.value})}
                    className="input-field w-1/2"
                  />
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">Playlist Items</h3>
                    <button type="button" onClick={refreshMedia} className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center font-medium bg-indigo-50 px-2 py-1 rounded-md">
                      <RefreshCw className="h-3 w-3 mr-1" /> Refresh list
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newModule.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex-1 grid gap-3">
                          <input
                            type="text"
                            required
                            value={item.title}
                            onChange={e => handleItemChange(index, 'title', e.target.value)}
                            className="input-field text-sm"
                            placeholder={`Part ${index + 1} Title`}
                          />
                          <select
                            required
                            value={item.contentUrl}
                            onChange={e => handleItemChange(index, 'contentUrl', e.target.value)}
                            className="input-field text-sm font-medium"
                          >
                            <option value="">-- Select uploaded file --</option>
                            {availableMedia
                              .filter(f => newModule.type === 'Video' ? f.toLowerCase().match(/\.(mp4|webm)$/) : f.toLowerCase().endsWith('.pdf'))
                              .map(file => (
                              <option key={file} value={file}>{file}</option>
                            ))}
                          </select>
                        </div>
                        {newModule.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors mt-0.5"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="mt-4 text-sm text-indigo-600 font-semibold hover:text-indigo-700 flex items-center py-2 px-3 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Add Part
                  </button>
                </div>

                {newModule.type === 'PDF' && (
                  <div className="form-group pt-5 border-t border-slate-200">
                    <label className="form-label">Consent Text</label>
                    <textarea
                      value={newModule.policyContent}
                      onChange={e => setNewModule({...newModule, policyContent: e.target.value})}
                      className="input-field resize-none h-20"
                      placeholder="I have read and agree..."
                    />
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-slate-100 shrink-0 flex space-x-3 bg-white">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || newModule.items.length === 0 || uploading}
                  className="btn-primary flex-1"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (editingModuleId ? "Save Changes" : "Create Module")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
