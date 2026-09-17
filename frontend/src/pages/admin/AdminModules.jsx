import { useState, useEffect, useRef } from "react";
import { Plus, Play, FileText, Loader2, RefreshCw, Trash2, Edit2, UploadCloud } from "lucide-react";
import { modulesApi, mediaApi } from "../../api/apiClient";
import { useToast } from "../../context/ToastContext";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [availableMedia, setAvailableMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();
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

    try {
      const res = await mediaApi.upload(file, (percent) => {
        setUploadProgress(percent);
      });
      toast.success(`Successfully uploaded ${res.data.data.fileName}`);
      await refreshMedia();
      
      // Auto-select the uploaded file if we are editing an item
      if (newModule.items.length === 1 && !newModule.items[0].contentUrl) {
        handleItemChange(0, 'contentUrl', res.data.data.fileName);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error(error.response?.data?.message || "Upload failed. Max size is 500MB.");
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
    setIsModalOpen(true);
  };

  const openEditModal = async (module) => {
    setEditingModuleId(module.moduleId);
    
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
        toast.success("Module updated successfully!");
      } else {
        await modulesApi.create(payload);
        toast.success("Module created successfully!");
      }

      setIsModalOpen(false);
      setNewModule(initialModuleState);
      setEditingModuleId(null);
      fetchData();
    } catch (error) {
      console.error("Failed to save module", error);
      toast.error(error.response?.data?.message || "Failed to save module");
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
    <div className="p-6 lg:p-8 max-w-[1440px] mx-auto space-y-8 flex flex-col min-h-[calc(100vh-64px)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Module Management</h1>
          <p className="text-sm text-text-secondary mt-1">Manage training modules and video assets.</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4 mr-2" />
          <span>New Module</span>
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-hover border-b border-border">
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Title</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Duration</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider">Items</th>
                <th className="p-4 text-xs font-semibold text-text-secondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {modules.map((module) => (
                <tr key={module.moduleId} className="hover:bg-surface-hover transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-semibold text-text">{module.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5 truncate max-w-xs">{module.description}</p>
                  </td>
                  <td className="p-4">
                    <Badge variant={module.type === 'Video' ? 'primary' : 'warning'}>
                      {module.type === 'Video' ? <Play className="h-3 w-3 mr-1.5" /> : <FileText className="h-3 w-3 mr-1.5" />}
                      {module.type}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm font-medium text-text-secondary">
                    {module.duration} mins
                  </td>
                  <td className="p-4 text-sm font-medium text-text-secondary">
                    {module.items?.length || 0} part(s)
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openEditModal(module)}
                      className="p-2 text-text-secondary hover:text-primary rounded-lg hover:bg-primary-light transition-colors inline-flex"
                      title="Edit Module"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {modules.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-text-secondary text-sm">
                    No modules found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col border-0">
            <div className="p-6 border-b border-border shrink-0 bg-surface">
              <h2 className="text-xl font-bold text-text tracking-tight">
                {editingModuleId ? "Edit Module" : "Create New Module"}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                Configure module details and upload or select media files.
              </p>
            </div>
            
            <form onSubmit={handleSubmitModule} className="flex flex-col overflow-hidden h-full">
              <div className="p-6 space-y-6 bg-background overflow-y-auto">
                
                {/* File Upload Section */}
                <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                  <h3 className="text-sm font-bold text-text mb-3 tracking-tight">Upload Media</h3>
                  
                  <label 
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors cursor-pointer ${uploading ? 'bg-surface-hover border-border' : 'border-border hover:border-primary hover:bg-primary-light/50'}`}
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
                        <div className="flex justify-between text-xs mb-1 font-medium text-text-secondary">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-surface-hover rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center text-primary mb-3 shadow-sm">
                          <UploadCloud className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-text">Click to upload or drag and drop</p>
                        <p className="text-xs text-text-secondary mt-1">MP4, WEBM, PDF up to 500MB</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1.5">Title</label>
                    <input
                      type="text"
                      required
                      value={newModule.title}
                      onChange={e => setNewModule({...newModule, title: e.target.value})}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="E.g., Security Training"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-text mb-1.5">Type</label>
                    <select
                      value={newModule.type}
                      onChange={e => setNewModule({...newModule, type: e.target.value})}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50"
                      disabled={!!editingModuleId}
                    >
                      <option value="Video">Video Course</option>
                      <option value="PDF">Document</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-1.5">Description</label>
                  <textarea
                    required
                    value={newModule.description}
                    onChange={e => setNewModule({...newModule, description: e.target.value})}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none h-20"
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text mb-1.5">Total Duration (mins)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newModule.duration}
                    onChange={e => setNewModule({...newModule, duration: e.target.value})}
                    className="w-1/2 px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div className="pt-5 border-t border-border">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-text tracking-tight">Playlist Items</h3>
                    <button type="button" onClick={refreshMedia} className="text-xs text-primary hover:text-indigo-700 flex items-center font-medium bg-primary-light px-2 py-1 rounded-md">
                      <RefreshCw className="h-3 w-3 mr-1" /> Refresh list
                    </button>
                  </div>

                  <div className="space-y-3">
                    {newModule.items.map((item, index) => (
                      <div key={index} className="flex items-start gap-3 bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <div className="flex-1 grid gap-3">
                          <input
                            type="text"
                            required
                            value={item.title}
                            onChange={e => handleItemChange(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            placeholder={`Part ${index + 1} Title`}
                          />
                          <select
                            required
                            value={item.contentUrl}
                            onChange={e => handleItemChange(index, 'contentUrl', e.target.value)}
                            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium"
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
                            className="text-text-secondary hover:text-danger hover:bg-danger/10 p-2 rounded-lg transition-colors mt-0.5"
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
                    className="mt-4 text-sm text-primary font-semibold flex items-center py-2 px-3 rounded-lg hover:bg-primary-light transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Add Part
                  </button>
                </div>

                {newModule.type === 'PDF' && (
                  <div className="pt-5 border-t border-border">
                    <label className="block text-sm font-semibold text-text mb-1.5">Consent Text</label>
                    <textarea
                      value={newModule.policyContent}
                      onChange={e => setNewModule({...newModule, policyContent: e.target.value})}
                      className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none h-20"
                      placeholder="I have read and agree..."
                    />
                  </div>
                )}
              </div>

              <div className="p-5 border-t border-border shrink-0 flex space-x-3 bg-surface">
                <Button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || newModule.items.length === 0 || uploading}
                  className="flex-1"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2 inline" /> : null}
                  {editingModuleId ? "Save Changes" : "Create Module"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
