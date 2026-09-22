import { FileText } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modulesApi, progressApi, assignmentsApi } from '../../api/apiClient';
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle, ListVideo, PlayCircle, Lock, SquareCheckBig } from 'lucide-react';

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
  const [undertakingChecked, setUndertakingChecked] = useState(false);
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

  // ── Strict Anti-Skip: Seeking handler ──────────────────────────────────────
  const handleSeeking = useCallback(() => {
    if (!videoRef.current || isVideoComplete) return;
    // Snap back to maxWatched if user tries to seek ahead
    if (videoRef.current.currentTime > maxWatched + 0.5) {
      videoRef.current.currentTime = maxWatched;
    }
  }, [maxWatched, isVideoComplete]);

  // ── Strict Anti-Skip: Rate change handler ──────────────────────────────────
  const handleRateChange = useCallback(() => {
    if (!videoRef.current || isVideoComplete) return;
    if (videoRef.current.playbackRate !== 1) {
      videoRef.current.playbackRate = 1;
    }
  }, [isVideoComplete]);

  // ── Strict Anti-Skip: Keyboard blocker ─────────────────────────────────────
  const handleVideoKeyDown = useCallback((e) => {
    if (isVideoComplete) return;
    const blockedKeys = ['ArrowRight', 'ArrowLeft', 'KeyL', 'KeyJ'];
    // Block arrow keys, L/J (YouTube-style skip), and digit keys (seek to %)
    if (blockedKeys.includes(e.code) || (e.code.startsWith('Digit') && !e.ctrlKey)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [isVideoComplete]);

  const handleVideoTimeUpdate = async () => {
    if (!videoRef.current || isVideoComplete || !module || !currentItem) return;
    
    const currentTime = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    
    // Strict Anti-skip: No tolerance — snap back immediately
    if (currentTime > maxWatched + 0.5) {
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
    // Consider it scrolled to bottom if within 30px of the bottom
    if (scrollTop + clientHeight >= scrollHeight - 30) {
      setHasScrolledToBottom(true);
    }
  };

  const handlePdfConsent = async () => {
    if (!hasScrolledToBottom) {
      setConsentError('Please scroll through the entire document first.');
      return;
    }
    if (!undertakingChecked) {
      setConsentError('Please check the undertaking checkbox to confirm you have read and understood the document.');
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

  if (loading) return <div className="p-8 h-screen flex items-center justify-center text-text-secondary bg-background font-medium">Loading...</div>;
  if (!module) return <div className="p-8 h-screen flex items-center justify-center text-text-secondary bg-background font-medium">Training module not found.</div>;

  return (
    <div className="h-screen bg-slate-900 flex flex-col font-sans overflow-hidden">
      <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-slate-400 hover:text-white hover:bg-white/10">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="font-semibold text-lg tracking-tight">{module.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">{module.type} Course</span>
              <span className="text-slate-600">•</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${module.category === 'IT' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                {module.category === 'IT' ? 'IT Security' : 'HR Policy'}
              </span>
            </div>
          </div>
        </div>
        
        <div>
          {progress?.status === 'Completed' ? (
            <Badge variant="success" className="px-3 py-1.5 font-medium tracking-wide uppercase">
              <CheckCircle2 size={14} className="mr-1.5" />
              Completed {new Date(progress.completedAt).toLocaleDateString()}
            </Badge>
          ) : (
            <Badge variant="warning" className="px-3 py-1.5 font-medium tracking-wide uppercase">
              <AlertCircle size={14} className="mr-1.5" />
              In Progress
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* Main Content Area */}
        <div className="flex-1 bg-black flex flex-col justify-center relative">
          {module.type === 'Video' ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              {currentItem?.contentUrl ? (
                <div 
                  className="relative w-full h-full max-w-5xl mx-auto flex flex-col items-center justify-center group bg-black rounded-xl overflow-hidden ring-1 ring-white/10 shadow-2xl"
                  onKeyDown={handleVideoKeyDown}
                  tabIndex={-1}
                >
                  <video
                    key={currentItem.itemId}
                    ref={videoRef}
                    src={currentItem.contentUrl}
                    controls={isVideoComplete}
                    controlsList={!isVideoComplete ? "nodownload noplaybackrate nofullscreen" : ""}
                    disablePictureInPicture
                    onTimeUpdate={handleVideoTimeUpdate}
                    onLoadedMetadata={handleVideoLoaded}
                    onSeeking={handleSeeking}
                    onRateChange={handleRateChange}
                    onContextMenu={(e) => { if (!isVideoComplete) e.preventDefault(); }}
                    className="w-full h-full object-contain"
                    autoPlay={false}
                    style={!isVideoComplete ? { pointerEvents: 'auto' } : {}}
                  >
                    Your browser does not support the video tag.
                  </video>
                  
                  {/* Anti-Skip Notice */}
                  {!isVideoComplete && (
                    <div className="absolute top-4 left-4 bg-amber-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-lg ring-1 ring-amber-400/50 uppercase tracking-wider animate-pulse">
                      <Lock size={12} /> Skipping Disabled
                    </div>
                  )}

                  {/* Custom Play Button Overlay for incomplete videos */}
                  {!isVideoComplete && (
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={() => videoRef.current?.paused ? videoRef.current?.play() : videoRef.current?.pause()}
                         className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                       >
                         {videoRef.current?.paused ? <PlayCircle size={20} className="ml-1" /> : <div className="w-3 h-3 bg-white" style={{ clipPath: 'polygon(0 0, 35% 0, 35% 100%, 0 100%, 65% 0, 100% 0, 100% 100%, 65% 100%)' }} />}
                       </button>
                       <div className="flex-1 bg-white/20 h-1.5 rounded-full overflow-hidden">
                         <div 
                           className="bg-indigo-500 h-full transition-all relative" 
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
            // Document Viewer (Supports Option 1 & 2 PDF iframe AND Option 3 Rich Document)
            <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 w-full relative">
              {module.contentUrl ? (
                // PDF Viewer from public documents or media
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 flex flex-col p-4 pb-32 overflow-y-auto"
                >
                  <div className="w-full max-w-5xl mx-auto h-[120vh] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 shrink-0">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{module.title}</span>
                      </div>
                      <a
                        href={module.contentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        Open in Full Tab
                      </a>
                    </div>
                    <iframe 
                      src={module.contentUrl} 
                      className="w-full flex-1 border-0" 
                      title={module.title} 
                    />
                  </div>
                </div>
              ) : (
                // Option 3: Rich Document / Paste Viewer
                <div 
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 p-6 md:p-10 pb-36 overflow-y-auto scroll-smooth"
                >
                  <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-14 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 rich-document-body min-h-[140vh]">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
                      <div className="flex items-center gap-2.5">
                        <span className={`badge ${module.category === 'IT' ? 'badge-it' : 'badge-hr'}`}>
                          {module.category === 'IT' ? 'IT Security Document' : 'HR Enterprise Policy'}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">• {module.duration || 10} min read</span>
                      </div>
                      <button
                        onClick={() => window.print()}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                      >
                        Print / Save Copy
                      </button>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
                      {module.title}
                    </h1>

                    {module.policyContent ? (
                      <div dangerouslySetInnerHTML={{ __html: module.policyContent.replace(/\n/g, '<br/>') }} />
                    ) : (
                      <p className="text-slate-400 italic">No document content has been provided for this policy.</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="absolute bottom-0 inset-x-0 p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] z-20">
                {consentError && <p className="text-rose-500 text-sm mb-2 font-medium flex items-center gap-1.5"><AlertCircle size={14}/>{consentError}</p>}
                
                {!pdfConsented ? (
                  <>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 text-center max-w-xl uppercase tracking-wider">
                      {hasScrolledToBottom ? "You have reached the end of the document." : "Please scroll through the entire document to continue."}
                    </p>

                    {/* Undertaking Checkbox — enabled only after scrolling to bottom */}
                    <label 
                      className={`flex items-start gap-3 max-w-xl px-4 py-3 rounded-xl border mb-3 transition-all select-none ${
                        hasScrolledToBottom 
                          ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100/80 dark:hover:bg-blue-950/60' 
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={undertakingChecked}
                        disabled={!hasScrolledToBottom}
                        onChange={(e) => setUndertakingChecked(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 accent-blue-600 shrink-0"
                      />
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        <strong>Employee Undertaking:</strong> I hereby confirm that I have thoroughly read, understood, and agree to comply with all the policies, guidelines, and procedures outlined in this document. I acknowledge my responsibility to adhere to these requirements.
                      </span>
                    </label>

                    <button 
                      onClick={handlePdfConsent}
                      disabled={!hasScrolledToBottom || !undertakingChecked}
                      className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm ${
                        hasScrolledToBottom && undertakingChecked
                          ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {hasScrolledToBottom && undertakingChecked ? <ShieldCheck size={19} /> : <Lock size={17} />}
                      Submit Undertaking & Complete
                    </button>
                  </>
                ) : (
                  <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-6 py-2.5 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-sm gap-2 shadow-sm">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    Completed — Undertaking Acknowledged & Recorded in Portal
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
              <div className="mt-4">
                <ProgressBar 
                  value={((progress?.completedItemIds?.length || 0) / module.items.length) * 100}
                  className="h-1.5 bg-slate-800"
                  indicatorClassName="bg-indigo-500"
                />
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
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 relative overflow-hidden group border
                      ${isActive ? 'bg-indigo-600/10 border-indigo-500/30 shadow-none' : 'hover:bg-white/5 border-transparent'}
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
