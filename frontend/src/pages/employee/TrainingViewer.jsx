import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modulesApi, progressApi, assignmentsApi } from '../../api/apiClient';
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, ListVideo, PlayCircle, Lock } from 'lucide-react';

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
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollContainerRef = useRef(null);

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
          setHasScrolledToBottom(true);
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
    
    // Perfect Tracking: Anti-skip logic (max 2 seconds ahead of maxWatched allowed for buffering)
    if (currentTime > maxWatched + 2) {
      videoRef.current.currentTime = maxWatched;
      return;
    }

    if (currentTime > maxWatched) {
      setMaxWatched(currentTime);
    }

    // Save progress periodically (debounced/throttled conceptually via modulo 3 seconds)
    if (Math.floor(currentTime) % 3 === 0 && currentTime > 0) {
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

    // Mark complete atomically at 95%
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

  const handleScroll = (e) => {
    if (pdfConsented || hasScrolledToBottom) return;
    
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Consider it scrolled to bottom if within 50px of the bottom
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      setHasScrolledToBottom(true);
    }
  };

  const handlePdfConsent = async () => {
    if (!hasScrolledToBottom) {
      setConsentError('Please read through the entire document first.');
      return;
    }

    try {
      await progressApi.consentPdf({ moduleId: module.moduleId });
      setPdfConsented(true);
      loadData(); // reload to get timestamp
    } catch (error) {
      setConsentError(error.response?.data?.message || 'Failed to record consent');
    }
  };

  if (loading) return <div className="p-8 h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  if (!module) return <div className="p-8 h-screen flex items-center justify-center text-slate-500">Training module not found.</div>;

  return (
    <div className="h-screen bg-slate-900 flex flex-col font-sans overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="font-semibold text-lg tracking-tight">{module.title}</h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">{module.type} Module</p>
          </div>
        </div>
        
        <div>
          {progress?.status === 'Completed' ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full font-medium text-xs tracking-wide uppercase">
              <CheckCircle2 size={14} />
              Completed {new Date(progress.completedAt).toLocaleDateString()}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full font-medium text-xs tracking-wide uppercase">
              <AlertCircle size={14} />
              In Progress
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Main Content Area */}
        <div className="flex-1 bg-black flex flex-col justify-center relative">
          {module.type === 'Video' ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              {currentItem?.contentUrl ? (
                <div className="relative w-full h-full max-w-5xl mx-auto flex flex-col items-center justify-center group bg-black rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                  <video
                    key={currentItem.itemId} // forces remount on source change
                    ref={videoRef}
                    src={currentItem.contentUrl}
                    controls={isVideoComplete} // Only allow seek if completed
                    controlsList={!isVideoComplete ? "nodownload noplaybackrate" : ""}
                    disablePictureInPicture
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoaded}
                    className="w-full h-full object-contain"
                    autoPlay={false}
                  >
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Custom Play Button Overlay for incomplete videos */}
                  {!isVideoComplete && (
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()}
                         className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg"
                       >
                         {videoRef.current?.paused ? <PlayCircle size={20} className="ml-1" /> : <div className="w-3 h-3 bg-white" style={{ clipPath: 'polygon(0 0, 35% 0, 35% 100%, 0 100%, 65% 0, 100% 0, 100% 100%, 65% 100%)' }} />}
                       </button>
                       <div className="flex-1 bg-white/20 h-1.5 rounded-full overflow-hidden">
                         <div 
                           className="bg-indigo-500 h-full transition-all duration-300 relative" 
                           style={{ width: `${(maxWatched / (videoRef.current?.duration || 1)) * 100}%` }}
                         >
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full"></div>
                         </div>
                       </div>
                       <span className="text-xs text-white/70 font-mono tracking-wider">
                          {Math.floor(videoRef.current?.currentTime || 0)}s / {Math.floor(videoRef.current?.duration || 0)}s
                       </span>
                    </div>
                  )}

                  {isVideoComplete && (
                    <div className="absolute top-6 right-6 bg-emerald-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-xl animate-fade-in ring-1 ring-emerald-400/50">
                      <CheckCircle2 size={16} /> Completed
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 flex flex-col items-center">
                  <AlertCircle size={48} className="mb-3 opacity-20" />
                  <p className="text-sm font-medium">Video content unavailable.</p>
                </div>
              )}
            </div>
          ) : (
            // PDF Viewer (Scroll tracking implemented)
            <div className="flex flex-col h-full bg-slate-50 w-full relative">
              <div 
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 p-8 overflow-y-auto scroll-smooth"
              >
                <div className="max-w-3xl mx-auto prose prose-slate bg-white p-12 rounded-2xl shadow-sm border border-slate-200 whitespace-pre-wrap min-h-[150vh]">
                  <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">Policy Document</h2>
                  {module.policyContent || "No content provided."}
                </div>
              </div>
              
              <div className="absolute bottom-0 inset-x-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 flex flex-col items-center justify-center shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)]">
                {consentError && <p className="text-rose-500 text-sm mb-3 font-medium flex items-center gap-1.5"><AlertCircle size={14}/>{consentError}</p>}
                
                {!pdfConsented ? (
                  <>
                    <p className="text-xs font-medium text-slate-500 mb-4 text-center max-w-xl uppercase tracking-wider">
                      {hasScrolledToBottom ? "You may now consent to this policy." : "Please scroll to the bottom of the document to consent."}
                    </p>
                    <button 
                      onClick={handlePdfConsent}
                      disabled={!hasScrolledToBottom}
                      className={`px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm ${
                        hasScrolledToBottom 
                          ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md hover:-translate-y-0.5' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      {hasScrolledToBottom ? <ShieldCheck size={20} /> : <Lock size={18} />}
                      I Have Read & Consent
                    </button>
                  </>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-xl flex items-center justify-center text-emerald-700 font-semibold gap-2 shadow-sm">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    Consent Recorded
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Playlist Sidebar */}
        {module.type === 'Video' && module.items?.length > 1 && (
          <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-white/10 flex flex-col shrink-0 overflow-hidden relative z-10 shadow-2xl">
            <div className="p-5 border-b border-white/10 bg-slate-800/50">
              <h3 className="text-white font-semibold flex items-center gap-2 tracking-tight">
                <ListVideo size={18} className="text-indigo-400" /> Course Playlist
              </h3>
              <div className="mt-4 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${((progress?.completedItemIds?.length || 0) / module.items.length) * 100}%`}}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-medium tracking-widest uppercase">
                {progress?.completedItemIds?.length || 0} / {module.items.length} parts completed
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              {module.items.map((item, index) => {
                const isItemComplete = progress?.completedItemIds?.includes(item.itemId);
                const isActive = index === currentItemIndex;
                
                return (
                  <button
                    key={item.itemId}
                    onClick={() => selectPlaylistItem(index)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 relative overflow-hidden group
                      ${isActive ? 'bg-indigo-600/10 border-indigo-500/30 shadow-inner' : 'hover:bg-white/5 border-transparent'}
                      border
                    `}
                  >
                    {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-full"></div>}
                    <div className={`mt-0.5 shrink-0 transition-colors ${isItemComplete ? 'text-emerald-400' : isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`}>
                      {isItemComplete ? <CheckCircle2 size={16} /> : <PlayCircle size={16} />}
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium tracking-tight ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {index + 1}. {item.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-1 font-medium tracking-wider uppercase">
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
