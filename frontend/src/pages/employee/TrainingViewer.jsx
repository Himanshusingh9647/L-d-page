import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modulesApi, progressApi, assignmentsApi } from '../../api/apiClient';
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, ListVideo, PlayCircle } from 'lucide-react';

export default function TrainingViewer() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Playlist State
  const [currentItemIndex, setCurrentItemIndex] = useState(0);

  // Video specific state
  const videoRef = useRef(null);
  const [isVideoComplete, setIsVideoComplete] = useState(false);
  const [maxWatched, setMaxWatched] = useState(0);

  // PDF specific state
  const [pdfConsented, setPdfConsented] = useState(false);
  const [consentError, setConsentError] = useState('');

  useEffect(() => {
    loadData();
  }, [moduleId]);

  const loadData = async () => {
    try {
      const [modRes, myRes] = await Promise.all([
        modulesApi.getById(moduleId),
        assignmentsApi.getMy()
      ]);
      const moduleData = modRes.data.data;
      setModule(moduleData);
      
      const myProgress = myRes.data.data.find(p => p.moduleId === parseInt(moduleId));
      setProgress(myProgress);
      
      if (myProgress) {
        if (myProgress.status === 'Completed') {
          setIsVideoComplete(true);
          setPdfConsented(true);
        }
        
        if (moduleData.type === 'Video' && moduleData.items?.length > 0) {
          // Find the first uncompleted item to resume, or default to 0
          const firstUncompletedIndex = moduleData.items.findIndex(item => 
            !myProgress.completedItemIds?.includes(item.itemId)
          );
          const startingIndex = firstUncompletedIndex !== -1 ? firstUncompletedIndex : 0;
          setCurrentItemIndex(startingIndex);
          
          updateVideoStateForIndex(startingIndex, moduleData, myProgress);
        }
      }
    } catch (error) {
      console.error('Error loading training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateVideoStateForIndex = (index, modData, progData) => {
    if (!modData?.items || modData.items.length === 0) return;
    
    const currentItem = modData.items[index];
    const itemProg = progData?.itemProgresses?.find(ip => ip.itemId === currentItem.itemId);
    
    const isCompleted = progData?.completedItemIds?.includes(currentItem.itemId);
    setIsVideoComplete(!!isCompleted);
    setMaxWatched(itemProg?.maxWatchedSeconds || 0);

    if (videoRef.current) {
      videoRef.current.load(); // reload video source
    }
  };

  const selectPlaylistItem = (index) => {
    setCurrentItemIndex(index);
    updateVideoStateForIndex(index, module, progress);
  };

  const currentItem = module?.items?.[currentItemIndex];

  const handleVideoTimeUpdate = async () => {
    if (!videoRef.current || isVideoComplete || !module || !currentItem) return;
    
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    // Prevent skipping ahead
    if (currentTime > maxWatched + 2) {
      videoRef.current.currentTime = maxWatched;
      return;
    }

    if (currentTime > maxWatched) {
      setMaxWatched(currentTime);
    }

    // Save progress periodically (e.g., every 5 seconds)
    if (Math.floor(currentTime) % 5 === 0 && currentTime > 0) {
      const percent = (currentTime / duration) * 100;
      try {
        await progressApi.updateVideoTime({
          moduleId: module.moduleId,
          itemId: currentItem.itemId,
          resumeTimeSeconds: Math.floor(currentTime),
          maxWatchedSeconds: Math.floor(maxWatched),
          videoWatchedPercent: percent
        });
      } catch (err) {
        console.error('Failed to save progress', err);
      }
    }

    // Mark complete at 95%
    if ((currentTime / duration) >= 0.95 && !isVideoComplete) {
      setIsVideoComplete(true);
      try {
        await progressApi.completeVideo({
          moduleId: module.moduleId,
          itemId: currentItem.itemId
        });
        
        // Advance to next video if not the last one
        if (currentItemIndex < module.items.length - 1) {
          setTimeout(() => {
            selectPlaylistItem(currentItemIndex + 1);
          }, 2000);
        } else {
          loadData(); // reload overall progress
        }
      } catch (err) {
        console.error('Failed to complete video item', err);
      }
    }
  };

  const handleVideoLoaded = () => {
    const itemProg = progress?.itemProgresses?.find(ip => ip.itemId === currentItem?.itemId);
    if (videoRef.current && itemProg?.resumeTimeSeconds && !itemProg?.isCompleted) {
      videoRef.current.currentTime = itemProg.resumeTimeSeconds;
    }
  };

  const handlePdfConsent = async () => {
    try {
      await progressApi.consentPdf({ moduleId: module.moduleId });
      setPdfConsented(true);
      loadData(); // reload to get timestamp
    } catch (error) {
      setConsentError(error.response?.data?.message || 'Failed to record consent');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!module) return <div className="p-8">Training module not found.</div>;

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <div className="bg-slate-800 text-white p-4 flex items-center justify-between border-b border-slate-700 shadow-md shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-700 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-bold text-lg">{module.title}</h1>
            <p className="text-xs text-slate-400">{module.type} Module</p>
          </div>
        </div>
        
        <div>
          {progress?.status === 'Completed' ? (
            <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg font-medium text-sm">
              <CheckCircle2 size={16} />
              Completed on {new Date(progress.completedAt).toLocaleDateString()}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-500/20 text-amber-400 px-4 py-2 rounded-lg font-medium text-sm">
              <AlertCircle size={16} />
              Course In Progress
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Main Content Area */}
        <div className="flex-1 bg-black flex flex-col justify-center relative">
          {module.type === 'Video' ? (
            <div className="w-full h-full flex items-center justify-center">
              {currentItem?.contentUrl ? (
                <div className="relative w-full h-full max-h-screen flex flex-col items-center justify-center bg-black group">
                  <video
                    key={currentItem.itemId} // forces remount on source change
                    ref={videoRef}
                    src={currentItem.contentUrl}
                    controls={isVideoComplete} // Only allow seek if completed
                    controlsList={!isVideoComplete ? "nodownload noplaybackrate" : ""}
                    disablePictureInPicture
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoaded}
                    className="w-full h-full object-contain max-h-[80vh]"
                    autoPlay={false}
                  >
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Custom Play Button Overlay for incomplete videos */}
                  {!isVideoComplete && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()}
                         className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-colors flex items-center gap-2"
                       >
                         <PlayCircle size={18} />
                         {videoRef.current?.paused ? 'Play' : 'Pause'}
                       </button>
                       <div className="flex-1 bg-white/20 h-2.5 rounded-full overflow-hidden">
                         <div 
                           className="bg-indigo-500 h-full transition-all duration-300" 
                           style={{ width: `${(maxWatched / (videoRef.current?.duration || 1)) * 100}%` }}
                         ></div>
                       </div>
                       <span className="text-xs text-white/90 font-mono bg-black/50 px-2 py-1 rounded">
                          {Math.floor(videoRef.current?.currentTime || 0)}s / {Math.floor(videoRef.current?.duration || 0)}s
                       </span>
                    </div>
                  )}

                  {isVideoComplete && (
                    <div className="absolute top-4 right-4 bg-emerald-500/90 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg animate-fade-in">
                      <CheckCircle2 size={16} /> Part Completed
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <AlertCircle size={48} className="mb-2 opacity-50" />
                  <p>Video content unavailable.</p>
                </div>
              )}
            </div>
          ) : (
            // PDF Viewer
            <div className="flex flex-col h-full bg-slate-50 w-full">
              <div className="p-6 border-b border-slate-200 bg-white">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Policy Document</h2>
                <p className="text-slate-500">Please read the following policy carefully.</p>
              </div>
              <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto prose prose-slate prose-lg bg-white p-12 rounded-xl shadow-sm border border-slate-200 whitespace-pre-wrap">
                  {module.policyContent || "No content provided."}
                </div>
              </div>
              
              {!pdfConsented ? (
                <div className="p-6 bg-white border-t border-slate-200 flex flex-col items-center justify-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                  {consentError && <p className="text-red-500 text-sm mb-3">{consentError}</p>}
                  <p className="text-sm text-slate-600 mb-4 text-center max-w-xl">
                    By clicking the button below, I acknowledge that I have read and understood the policy outlined in this document.
                  </p>
                  <button 
                    onClick={handlePdfConsent}
                    className="btn-primary px-8 py-3 text-lg"
                  >
                    <ShieldCheck size={20} />
                    I Read & Consent
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-emerald-50 border-t border-emerald-100 flex items-center justify-center text-emerald-700 font-medium gap-2">
                  <CheckCircle2 size={24} className="text-emerald-500" />
                  Consent recorded successfully on {new Date(progress?.consentedAt).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Playlist Sidebar */}
        {module.type === 'Video' && module.items?.length > 1 && (
          <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-700 flex flex-col shrink-0 overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
              <h3 className="text-white font-bold flex items-center gap-2">
                <ListVideo size={18} className="text-indigo-400" /> Course Content
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {progress?.completedItemIds?.length || 0} of {module.items.length} parts completed
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {module.items.map((item, index) => {
                const isItemComplete = progress?.completedItemIds?.includes(item.itemId);
                const isActive = index === currentItemIndex;
                
                return (
                  <button
                    key={item.itemId}
                    onClick={() => selectPlaylistItem(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3
                      ${isActive ? 'bg-indigo-600/20 border border-indigo-500/30' : 'hover:bg-slate-800 border border-transparent'}
                    `}
                  >
                    <div className={`mt-0.5 shrink-0 ${isItemComplete ? 'text-emerald-400' : isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                      {isItemComplete ? <CheckCircle2 size={16} /> : <PlayCircle size={16} />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {index + 1}. {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isItemComplete ? 'Completed' : isActive ? 'Now Playing' : 'Pending'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
