import { useState, useEffect, useRef } from "react";
import { 
  Plus, Play, FileText, Loader2, RefreshCw, Trash2, Edit2, 
  UploadCloud, CheckCircle, FolderOpen, Copy, Eye, Search, 
  Filter, Shield, Building2, Sparkles, BookOpen, AlertCircle,
  Clock, RotateCw
} from "lucide-react";
import { modulesApi, mediaApi } from "../../api/apiClient";
import { useToast } from "../../context/ToastContext";

export default function AdminModules() {
  const [modules, setModules] = useState([]);
  const [availableMedia, setAvailableMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const toast = useToast();
  const fileInputRef = useRef(null);
  
  const [editingModuleId, setEditingModuleId] = useState(null);
  
  // PDF 3-Way Options: 'upload' | 'shared_path' | 'rich_text'
  const [docOption, setDocOption] = useState('upload');
  const [sharedPathInput, setSharedPathInput] = useState('');
  const [previewDocUrl, setPreviewDocUrl] = useState('');
  const [richPreviewMode, setRichPreviewMode] = useState(false);

  const initialModuleState = {
    title: "",
    type: "Video",
    category: "HR", // "IT" or "HR"
    description: "",
    duration: 10,
    completionWindowDays: 5,
    recurrenceCycleDays: 0, // 0 = not recurring
    policyContent: "",
    contentUrl: "",
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
      toast.error("Failed to load modules");
    } finally {
      setLoading(false);
    }
  };

  const refreshMedia = async () => {
    try {
      const res = await mediaApi.getAvailableFiles();
      setAvailableMedia(res.data.data || []);
      toast.info("Media library refreshed");
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
      
      // Auto-select uploaded file
      if (newModule.type === 'PDF') {
        setNewModule(prev => ({
          ...prev,
          contentUrl: res.data.data.url || `${import.meta.env.VITE_API_URL || 'http://localhost:5155'}/media/${res.data.data.fileName}`
        }));
      } else if (newModule.items.length === 1 && !newModule.items[0].contentUrl) {
        handleItemChange(0, 'contentUrl', res.data.data.fileName);
      }
    } catch (error) {
      console.error("Upload failed", error);
      toast.error(error.response?.data?.message || "Upload failed. Max size is 500MB.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
    setDocOption('upload');
    setSharedPathInput('');
    setPreviewDocUrl('');
    setRichPreviewMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (module) => {
    setEditingModuleId(module.moduleId);
    
    const items = module.items && module.items.length > 0 ? module.items.map(item => ({
      title: item.title,
      contentUrl: item.contentUrl ? item.contentUrl.split('/').pop() : ""
    })) : [{ title: "Part 1", contentUrl: "" }];

    let detectedDocOption = 'upload';
    if (module.contentUrl && module.contentUrl.startsWith('/documents/')) {
      detectedDocOption = 'shared_path';
      setSharedPathInput(module.contentUrl.replace('/documents/', ''));
    } else if (module.policyContent && module.policyContent.trim().length > 0 && !module.contentUrl) {
      detectedDocOption = 'rich_text';
    }

    setDocOption(detectedDocOption);
    setPreviewDocUrl(module.contentUrl || '');

    setNewModule({
      title: module.title,
      type: module.type,
      category: module.category || 'HR',
      description: module.description || "",
      duration: module.duration ? parseInt(module.duration) || 10 : 10,
      completionWindowDays: module.completionWindowDays || 5,
      recurrenceCycleDays: module.recurrenceCycleDays || 0,
      policyContent: module.policyContent || "",
      contentUrl: module.contentUrl || "",
      items: items
    });
    
    setIsModalOpen(true);
  };

  const copyPublicFolderPath = () => {
    const publicPath = "frontend/public/documents/";
    navigator.clipboard.writeText(publicPath);
    toast.success(`Copied "${publicPath}" to clipboard! Paste your clean PDF there.`);
  };

  const testSharedPreview = () => {
    if (!sharedPathInput.trim()) {
      toast.error("Please enter a file name (e.g., policy_2026.pdf)");
      return;
    }
    const cleanName = sharedPathInput.trim().replace(/^\/+/, '').replace(/^documents\//, '');
    const fullUrl = `/documents/${cleanName}`;
    setPreviewDocUrl(fullUrl);
    setNewModule(prev => ({ ...prev, contentUrl: fullUrl }));
    toast.info(`Previewing ${fullUrl}`);
  };

  const handleSubmitModule = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const durationMins = parseInt(newModule.duration) || 10;
      
      let finalContentUrl = newModule.contentUrl;
      let finalPolicyContent = newModule.policyContent;

      if (newModule.type === 'PDF') {
        if (docOption === 'shared_path') {
          const cleanName = sharedPathInput.trim().replace(/^\/+/, '').replace(/^documents\//, '');
          finalContentUrl = `/documents/${cleanName}`;
        } else if (docOption === 'rich_text') {
          finalContentUrl = ""; // Saved directly in policyContent
        }
      }

      const payload = {
        title: newModule.title,
        type: newModule.type,
        category: newModule.category || 'HR',
        description: newModule.description,
        duration: durationMins.toString(),
        durationSeconds: durationMins * 60,
        completionWindowDays: parseInt(newModule.completionWindowDays) || 5,
        recurrenceCycleDays: parseInt(newModule.recurrenceCycleDays) || 0,
        contentUrl: finalContentUrl,
        policyContent: finalPolicyContent,
        isActive: true,
        items: newModule.type === 'Video' ? newModule.items.map(item => ({
          title: item.title,
          contentUrl: item.contentUrl ? `${import.meta.env.VITE_API_URL || 'http://localhost:5155'}/media/${item.contentUrl}` : "",
        })) : []
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

  const filteredModules = modules.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategoryFilter === 'ALL' || (m.category || 'HR') === selectedCategoryFilter;
    const matchesType = selectedTypeFilter === 'ALL' || m.type === selectedTypeFilter;
    return matchesSearch && matchesCategory && matchesType;
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Training Modules
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create and manage training modules for employees.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary shadow-md hover:shadow-lg">
          <Plus className="h-4 w-4" />
          <span>New Training Module</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between border-slate-200/80 dark:border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10 text-sm py-2"
          />
        </div>

        {/* Category & Type Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1">Type:</span>
          {['ALL', 'IT', 'HR'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'ALL' ? 'All' : cat}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>

          <span className="text-xs font-bold text-slate-400 uppercase mr-1">Format:</span>
          {['ALL', 'Video', 'PDF'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTypeFilter(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTypeFilter === t
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t === 'ALL' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Table */}
      <div className="card shadow-sm border-slate-200/80 dark:border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Module</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Domain</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Format</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Content</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredModules.map((module) => (
                <tr key={module.moduleId} className="table-row-hover hover:bg-slate-50/70 transition-colors">
                  <td className="p-4 max-w-sm">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{module.title}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5 line-clamp-1">{module.description || "No description"}</p>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${module.category === 'IT' ? 'badge-it' : 'badge-hr'}`}>
                      {module.category === 'IT' ? <Shield className="w-3 h-3 mr-1" /> : <Building2 className="w-3 h-3 mr-1" />}
                      {module.category === 'IT' ? 'IT' : 'HR'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`badge ${
                      module.type === 'Video' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {module.type === 'Video' ? <Play className="h-3 w-3 mr-1.5" /> : <FileText className="h-3 w-3 mr-1.5" />}
                      {module.type}
                    </span>
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {module.duration || 10} mins
                  </td>
                  <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                    {module.type === 'Video' 
                      ? `${module.items?.length || 0} part(s)` 
                      : module.contentUrl?.startsWith('/documents/') 
                        ? <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle size={13}/> Shared Path</span>
                        : module.policyContent ? 'Text Content' : 'Uploaded PDF'}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openEditModal(module)}
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors inline-flex cursor-pointer"
                      title="Edit Module"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredModules.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
                    No modules found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Module Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-3xl shadow-2xl max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-[#111827] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                  {editingModuleId ? "Edit Module" : "New Training Module"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Fill in the details below to {editingModuleId ? 'update' : 'create'} a training module.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`badge ${newModule.category === 'IT' ? 'badge-it' : 'badge-hr'}`}>
                  {newModule.category === 'IT' ? 'IT Security' : 'HR Policy'}
                </span>
              </div>
            </div>
            
            <form onSubmit={handleSubmitModule} className="flex flex-col overflow-hidden h-full">
              <div className="p-6 space-y-6 bg-slate-50/50 dark:bg-[#0f172a] overflow-y-auto">
                
                {/* Basic Info */}
                <div className="form-group mb-0">
                  <label className="form-label">Module Title</label>
                  <input
                    type="text"
                    required
                    value={newModule.title}
                    onChange={e => setNewModule({...newModule, title: e.target.value})}
                    className="input-field text-sm"
                    placeholder="e.g. Samsung Code of Conduct Training"
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label">Description</label>
                  <textarea
                    required
                    value={newModule.description}
                    onChange={e => setNewModule({...newModule, description: e.target.value})}
                    className="input-field resize-none h-16 text-sm"
                    placeholder="Brief description of this training module..."
                  />
                </div>

                {/* Domain, Format, Duration Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group mb-0">
                    <label className="form-label">Domain</label>
                    <select
                      value={newModule.category}
                      onChange={e => setNewModule({...newModule, category: e.target.value})}
                      className="input-field text-sm"
                    >
                      <option value="HR">HR</option>
                      <option value="IT">IT</option>
                    </select>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">Format</label>
                    <select
                      value={newModule.type}
                      onChange={e => setNewModule({...newModule, type: e.target.value})}
                      className="input-field text-sm"
                      disabled={!!editingModuleId}
                    >
                      <option value="Video">Video</option>
                      <option value="PDF">Document / PDF</option>
                    </select>
                  </div>

                  <div className="form-group mb-0">
                    <label className="form-label">Duration (Mins)</label>
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

                {/* Completion Window & Recurring Toggle */}
                <div className="form-group mb-0">
                  <label className="form-label flex items-center gap-1.5">
                    <Clock size={14} className="text-blue-600" />
                    Completion Window (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    required
                    value={newModule.completionWindowDays}
                    onChange={e => setNewModule({...newModule, completionWindowDays: e.target.value})}
                    className="input-field text-sm"
                    placeholder="e.g. 5"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Days an employee has to complete this after assignment.
                  </p>
                </div>

                {/* Recurring Toggle */}
                <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <RotateCw size={18} className={parseInt(newModule.recurrenceCycleDays) > 0 ? 'text-indigo-600' : 'text-slate-400'} />
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Recurring Training</p>
                        <p className="text-[11px] text-slate-400">Auto re-assign this module after completion</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const isCurrentlyRecurring = parseInt(newModule.recurrenceCycleDays) > 0;
                        setNewModule({...newModule, recurrenceCycleDays: isCurrentlyRecurring ? 0 : 90});
                      }}
                      className={`relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer ${
                        parseInt(newModule.recurrenceCycleDays) > 0
                          ? 'bg-indigo-600 shadow-inner'
                          : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${
                        parseInt(newModule.recurrenceCycleDays) > 0 ? 'left-[26px]' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  {parseInt(newModule.recurrenceCycleDays) > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <label className="form-label flex items-center gap-1.5 text-xs">
                        <RotateCw size={13} className="text-indigo-600" />
                        Recurrence Cycle (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="730"
                        value={newModule.recurrenceCycleDays}
                        onChange={e => setNewModule({...newModule, recurrenceCycleDays: e.target.value})}
                        className="input-field text-sm"
                        placeholder="e.g. 90"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        e.g. 90 = auto re-assign every 90 days after completion.
                      </p>
                    </div>
                  )}
                </div>

                {/* ── 3-WAY DOCUMENT UPLOAD SYSTEM (When Type is PDF) ── */}
                {newModule.type === 'PDF' && (
                  <div className="bg-white dark:bg-[#1e293b] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          <BookOpen size={16} className="text-blue-600" />
                          Document Upload Options
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Use Option 2 or 3 if Samsung encryption corrupts uploaded PDFs.
                        </p>
                      </div>
                    </div>

                    {/* 3 Tabs */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setDocOption('upload')}
                        className={`py-2 px-2.5 rounded-lg transition-all ${
                          docOption === 'upload' 
                            ? 'bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        1. Upload PDF
                      </button>

                      <button
                        type="button"
                        onClick={() => setDocOption('shared_path')}
                        className={`py-2 px-2.5 rounded-lg transition-all ${
                          docOption === 'shared_path' 
                            ? 'bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        2. Shared / Public Path
                      </button>

                      <button
                        type="button"
                        onClick={() => setDocOption('rich_text')}
                        className={`py-2 px-2.5 rounded-lg transition-all ${
                          docOption === 'rich_text' 
                            ? 'bg-white dark:bg-[#111827] text-blue-600 dark:text-blue-400 shadow-sm' 
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        3. Paste Text / Rich Doc
                      </button>
                    </div>

                    {/* Option 1 Content */}
                    {docOption === 'upload' && (
                      <div className="space-y-3 pt-2">
                        <label 
                          className={`upload-zone flex flex-col items-center justify-center ${uploading ? 'uploading' : ''}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleFileDrop}
                        >
                          <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef}
                            accept=".pdf" 
                            onChange={handleFileDrop}
                            disabled={uploading}
                          />
                          
                          {uploading ? (
                            <div className="w-full max-w-xs">
                              <div className="flex justify-between text-xs mb-1 font-medium text-slate-600">
                                <span>Uploading document...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${uploadProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/60 rounded-full flex items-center justify-center text-blue-600 mb-2">
                                <UploadCloud className="h-6 w-6" />
                              </div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Click to upload standard PDF</p>
                              <p className="text-xs text-slate-400 mt-0.5">Direct file upload up to 500MB</p>
                              {newModule.contentUrl && (
                                <span className="mt-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                                  Current: {newModule.contentUrl.split('/').pop()}
                                </span>
                              )}
                            </>
                          )}
                        </label>
                      </div>
                    )}

                    {/* Option 2 Content: Shared Public Folder Path (NASCAR DLP Bypass) */}
                    {docOption === 'shared_path' && (
                      <div className="space-y-4 pt-2">
                        <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-slate-600 dark:text-slate-300 space-y-2">
                          <div className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300">
                            <FolderOpen size={16} />
                            Samsung NASCAR DLP Bypass Workflow:
                          </div>
                          <p>
                            1. Copy your clean, unencrypted PDF into the public documents directory.
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-mono">
                              frontend/public/documents/
                            </code>
                            <button
                              type="button"
                              onClick={copyPublicFolderPath}
                              className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Copy size={12} /> Copy Path
                            </button>
                          </div>
                          <p>2. Enter the file name below and click "Test Preview" to confirm.</p>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={sharedPathInput}
                            onChange={(e) => setSharedPathInput(e.target.value)}
                            placeholder="e.g. Code_of_Conduct_2026.pdf"
                            className="input-field text-sm font-mono flex-1"
                          />
                          <button
                            type="button"
                            onClick={testSharedPreview}
                            className="btn-secondary px-4 text-xs font-bold shrink-0"
                          >
                            <Eye size={14} /> Test Preview
                          </button>
                        </div>

                        {previewDocUrl && (
                          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden h-44 bg-slate-100 dark:bg-slate-900 flex flex-col">
                            <div className="bg-slate-200 dark:bg-slate-800 px-3 py-1.5 text-[11px] font-mono text-slate-600 dark:text-slate-300 flex justify-between items-center">
                              <span>Source: {previewDocUrl}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">● Active preview</span>
                            </div>
                            <iframe src={previewDocUrl} className="w-full flex-1 border-0" title="PDF Preview" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Option 3 Content: Paste Rich Text / Tables / Images (100% NASCAR-Proof) */}
                    {docOption === 'rich_text' && (
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Paste text, formatted tables, lists, or inline images. NASCAR DLP cannot corrupt pasted web text!
                          </span>
                          <button
                            type="button"
                            onClick={() => setRichPreviewMode(!richPreviewMode)}
                            className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <Eye size={13} /> {richPreviewMode ? "Back to Editor" : "Live Document Preview"}
                          </button>
                        </div>

                        {richPreviewMode ? (
                          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-900 max-h-60 overflow-y-auto rich-document-body">
                            {newModule.policyContent ? (
                              <div dangerouslySetInnerHTML={{ __html: newModule.policyContent.replace(/\n/g, '<br/>') }} />
                            ) : (
                              <p className="text-slate-400 text-xs italic">No content pasted yet.</p>
                            )}
                          </div>
                        ) : (
                          <textarea
                            value={newModule.policyContent}
                            onChange={(e) => setNewModule({ ...newModule, policyContent: e.target.value })}
                            className="input-field font-sans text-xs h-40 leading-relaxed resize-none"
                            placeholder="Paste your document content here (supports formatted text, bullet points, HTML tables, and copy-pasted screenshots)..."
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Video Playlist Management (When Type is Video) */}
                {newModule.type === 'Video' && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white tracking-tight">Video Playlist Parts</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Employees must complete each part sequentially.</p>
                      </div>
                      <button 
                        type="button" 
                        onClick={refreshMedia} 
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center font-medium bg-blue-50 dark:bg-blue-950/50 px-2 py-1 rounded-md"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" /> Refresh Library
                      </button>
                    </div>

                    <div className="space-y-3">
                      {newModule.items.map((item, index) => (
                        <div key={index} className="flex items-start gap-3 bg-white dark:bg-[#1e293b] p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="flex-1 grid gap-2.5">
                            <input
                              type="text"
                              required
                              value={item.title}
                              onChange={e => handleItemChange(index, 'title', e.target.value)}
                              className="input-field text-sm"
                              placeholder={`Part ${index + 1} Title (e.g. Module Overview)`}
                            />
                            <select
                              required
                              value={item.contentUrl}
                              onChange={e => handleItemChange(index, 'contentUrl', e.target.value)}
                              className="input-field text-sm font-medium"
                            >
                              <option value="">-- Select video file from library --</option>
                              {availableMedia
                                .filter(f => f.toLowerCase().match(/\.(mp4|webm)$/))
                                .map(file => (
                                <option key={file} value={file}>{file}</option>
                              ))}
                            </select>
                          </div>
                          {newModule.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-slate-400 hover:text-rose-500 p-2 rounded-lg transition-colors mt-0.5"
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
                      className="mt-4 text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center py-2 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Playlist Part
                    </button>
                  </div>
                )}

              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800 shrink-0 flex space-x-3 bg-white dark:bg-[#111827]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploading}
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
