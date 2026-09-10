import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  ArrowLeft,
  Maximize,
  Minimize,
} from 'lucide-react';

export default function VideoPlayer({ module }) {
  const navigate = useNavigate();
  const { state, dispatch, getModuleProgress } = useApp();
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [maxWatched, setMaxWatched] = useState(0);
  const [skipWarning, setSkipWarning] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef(null);

  // Resume from saved position
  useEffect(() => {
    const progress = getModuleProgress(state.currentUserId, module.id);
    if (progress?.resumeTime > 0) {
      setMaxWatched(progress.resumeTime);
      if (videoRef.current) {
        videoRef.current.currentTime = progress.resumeTime;
      }
    }
  }, [module.id, state.currentUserId, getModuleProgress]);

  // Save resume time on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        dispatch({
          type: 'UPDATE_RESUME_TIME',
          payload: {
            userId: state.currentUserId,
            moduleId: module.id,
            resumeTime: videoRef.current.currentTime,
          },
        });
      }
    };
  }, [module.id, state.currentUserId, dispatch]);

  // Auto-hide controls
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (playing) {
      hideTimer.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [playing]);

  useEffect(() => {
    resetHideTimer();
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [playing, resetHideTimer]);

  // ── Video event handlers ──
  const onTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setMaxWatched((prev) => Math.max(prev, v.currentTime));
  };

  const onLoadedMetadata = () => {
    const v = videoRef.current;
    if (!v) return;
    setDuration(v.duration);
    // Seek to resume position
    const progress = getModuleProgress(state.currentUserId, module.id);
    if (progress?.resumeTime > 0) {
      v.currentTime = progress.resumeTime;
      setMaxWatched(progress.resumeTime);
    }
  };

  const onEnded = () => {
    setPlaying(false);
    dispatch({
      type: 'MARK_COMPLETE',
      payload: { userId: state.currentUserId, moduleId: module.id },
    });
    dispatch({
      type: 'SHOW_TOAST',
      payload: { message: `✅ "${module.title}" completed!`, toastType: 'success' },
    });
    setTimeout(() => navigate('/'), 1500);
  };

  // ── Controls ──
  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // ── Non-skippable scrub logic ──
  const handleScrub = (e) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    const seekTo = pct * duration;

    if (seekTo > maxWatched + 0.5) {
      // Block forward skip
      v.currentTime = maxWatched;
      setSkipWarning(true);
      setTimeout(() => setSkipWarning(false), 2000);
    } else {
      v.currentTime = seekTo;
      setCurrentTime(seekTo);
    }
  };

  // ── Helpers ──
  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const currentPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  const maxPct = duration > 0 ? (maxWatched / duration) * 100 : 0;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Module title */}
      <h2 className="text-2xl font-bold text-slate-800 mb-1">{module.title}</h2>
      <p className="text-sm text-slate-500 mb-6">{module.description}</p>

      {/* Video container */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden bg-black shadow-2xl group"
        onMouseMove={resetHideTimer}
        onMouseLeave={() => playing && setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={module.videoUrl}
          poster={module.posterUrl}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onEnded={onEnded}
          onClick={togglePlay}
          className="w-full aspect-video cursor-pointer"
          playsInline
          controlsList="nodownload"
          disablePictureInPicture
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* Play overlay (when paused) */}
        {!playing && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          >
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 hover:scale-110 transition-transform">
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            </div>
          </div>
        )}

        {/* Skip warning toast */}
        {skipWarning && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 backdrop-blur-sm text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg animate-shake">
            ⚠ You cannot skip ahead
          </div>
        )}

        {/* Custom control bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pt-10 pb-4 transition-opacity duration-300 ${
            showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress bar */}
          <div
            className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer group/bar mb-4"
            onClick={handleScrub}
          >
            {/* Max watched (buffer) */}
            <div
              className="absolute top-0 left-0 h-full bg-white/30 rounded-full"
              style={{ width: `${maxPct}%` }}
            />
            {/* Current position */}
            <div
              className="absolute top-0 left-0 h-full bg-teal-400 rounded-full transition-[width] duration-100"
              style={{ width: `${currentPct}%` }}
            />
            {/* Scrub head */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-teal-400 rounded-full shadow-lg border-2 border-white opacity-0 group-hover/bar:opacity-100 transition-opacity"
              style={{ left: `calc(${currentPct}% - 8px)` }}
            />
          </div>

          {/* Button row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button
                onClick={toggleMute}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <span className="text-white/80 text-sm font-mono tabular-nums ml-1">
                {fmt(currentTime)} / {fmt(duration)}
              </span>
            </div>
            <button
              onClick={toggleFullscreen}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Info below video */}
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-sm text-amber-800 font-medium">
          📋 This is a mandatory training video. You must watch the entire video to mark it as complete.
          Skipping ahead is disabled.
        </p>
      </div>
    </div>
  );
}
