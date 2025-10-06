import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MediaItem } from '../types';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import VolumeUpIcon from './icons/VolumeUpIcon';
import VolumeDownIcon from './icons/VolumeDownIcon';
import VolumeMuteIcon from './icons/VolumeMuteIcon';
import FullscreenEnterIcon from './icons/FullscreenEnterIcon';
import FullscreenExitIcon from './icons/FullscreenExitIcon';
import PictureInPictureIcon from './icons/PictureInPictureIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import CCIcon from './icons/CCIcon';
import SettingsIcon from './icons/SettingsIcon';
import LockIcon from './icons/LockIcon';
import UnlockIcon from './icons/UnlockIcon';
import RewindIcon from './icons/RewindIcon';
import FastForwardIcon from './icons/FastForwardIcon';
import Marquee from './Marquee';
import ProgressBar from './ProgressBar';
import Transcribe from './Transcribe';
import TranscriptionPanel from './TranscriptionPanel';
import Toast from './Toast';
import { idb } from '../utils';
import { GoogleGenAI } from '@google/genai';


interface VideoPlayerProps {
  media: MediaItem;
  onBack: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ media, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const tapTimeoutRef = useRef<number | null>(null);
  const rewindTimeoutRef = useRef<number | null>(null);
  const forwardTimeoutRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isVolumeSliderVisible, setVolumeSliderVisible] = useState(false);
  const [isSettingsMenuVisible, setSettingsMenuVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [showRewind, setShowRewind] = useState(false);
  const [showForward, setShowForward] = useState(false);

  const [isTranscriptionPanelOpen, setIsTranscriptionPanelOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  
  useEffect(() => {
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }, []);

  const handleTranscriptChunk = useCallback((chunk: string) => {
    setTranscript(prev => prev + chunk);
  }, []);

  const handleAskQuestion = async () => {
    if (!userQuery.trim() || !videoRef.current || !aiRef.current) return;
    
    setIsAiLoading(true);
    setAiResponse('');
    
    try {
        const video = videoRef.current;
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const ctx = tempCanvas.getContext('2d');
        if (!ctx) throw new Error("Could not get canvas context");
        
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const base64Data = tempCanvas.toDataURL('image/jpeg').split(',')[1];

        const prompt = `Based on the current video frame and the transcript so far, answer the following question concisely.
        Transcript: "${transcript}"
        Question: "${userQuery}"`;
        
        const imagePart = {
            inlineData: {
                mimeType: 'image/jpeg',
                data: base64Data,
            },
        };
        const textPart = { text: prompt };

        const response = await aiRef.current.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
        });

        setAiResponse(response.text);
    } catch (error) {
        console.error("AI question error:", error);
        setAiResponse("Sorry, I couldn't answer that question. Please try again.");
    } finally {
        setIsAiLoading(false);
    }
  };

  const toggleTranscriptionPanel = () => {
      const willBeOpen = !isTranscriptionPanelOpen;
      setIsTranscriptionPanelOpen(willBeOpen);
      if (willBeOpen) {
        setTranscriptionError(null);
        setTranscript('');
        setAiResponse('');
        setUserQuery('');
      }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const showControls = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(() => setIsControlsVisible(false), 3000);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.error);
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted && volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    }
  };

  const handleSeek = useCallback((newTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen().catch(console.error);
    } else {
        document.exitFullscreen();
    }
  }, []);
  
  const togglePiP = useCallback(async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (error) {
        console.error("PiP failed:", error);
      }
    }
  }, []);

  const changePlaybackRate = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setSettingsMenuVisible(false);
    }
  }, []);

  const handleVideoAreaTap = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();

    if (isLocked) {
        showControls();
        return;
    }

    if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;

        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const tapX = e.clientX - rect.left;

        if (tapX < rect.width / 2) {
            handleSeek(Math.max(0, currentTime - 10));
            if (rewindTimeoutRef.current) clearTimeout(rewindTimeoutRef.current);
            setShowRewind(true);
            rewindTimeoutRef.current = window.setTimeout(() => setShowRewind(false), 600);
        } else {
            handleSeek(Math.min(duration, currentTime + 10));
            if (forwardTimeoutRef.current) clearTimeout(forwardTimeoutRef.current);
            setShowForward(true);
            forwardTimeoutRef.current = window.setTimeout(() => setShowForward(false), 600);
        }
    } else {
        tapTimeoutRef.current = window.setTimeout(() => {
            setIsControlsVisible(v => !v);
            tapTimeoutRef.current = null;
        }, 300);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlayPause(); break;
        case 'KeyM': toggleMute(); break;
        case 'KeyF': toggleFullscreen(); break;
        case 'ArrowRight': handleSeek(Math.min(duration, currentTime + 5)); break;
        case 'ArrowLeft': handleSeek(Math.max(0, currentTime - 5)); break;
      }
    };
    
    const container = containerRef.current;
    container?.focus();
    container?.addEventListener('keydown', handleKeyDown);

    return () => container?.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, toggleMute, toggleFullscreen, handleSeek, currentTime, duration, isLocked]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
            setSettingsMenuVisible(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsMenuRef]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId: number;
    const draw = () => {
      if(ctx) ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
        if (!video) return;
        setCurrentTime(video.currentTime);
        if (duration > 0 && duration - video.currentTime < 5) {
            idb.delete(`video-progress-${media.id}`);
        }
    };
    const handleLoadedMetadata = async () => {
        if (!video) return;
        setDuration(video.duration);
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        const savedTime = await idb.get<number>(`video-progress-${media.id}`);
        if (savedTime && video.duration > savedTime && savedTime > 1) {
            video.currentTime = savedTime;
            setToastMessage(`Resumed from ${formatTime(savedTime)}`);
            toastTimeoutRef.current = window.setTimeout(() => setToastMessage(null), 3500);
        }
    };
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause',handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [media.id, duration]);

  useEffect(() => {
    const saveProgress = () => {
        if (videoRef.current && duration > 0 && isPlaying) {
            const time = videoRef.current.currentTime;
            if (duration - time > 5) idb.set(`video-progress-${media.id}`, time);
        }
    };
    const intervalId = setInterval(saveProgress, 5000);
    return () => {
        clearInterval(intervalId);
        saveProgress();
    };
}, [isPlaying, media.id, duration]);
  
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.src = media.src;
        videoRef.current.load();
        videoRef.current.play().catch(console.error);
    }
    showControls();
    const currentSrc = media.src;
    return () => {
      if (currentSrc.startsWith('blob:')) URL.revokeObjectURL(currentSrc);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
      if (rewindTimeoutRef.current) clearTimeout(rewindTimeoutRef.current);
      if (forwardTimeoutRef.current) clearTimeout(forwardTimeoutRef.current);
    };
  }, [media, showControls]);

  const VolumeIcon = isMuted || volume === 0 ? VolumeMuteIcon : volume < 0.5 ? VolumeDownIcon : VolumeUpIcon;
  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-sans animate-fade-in outline-none"
        onMouseMove={!isLocked ? showControls : undefined}
        tabIndex={-1}
    >
        {toastMessage && <Toast message={toastMessage} />}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 blur-2xl scale-125" width="160" height="90" />
        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 z-10" onClick={handleVideoAreaTap} />

        <video 
            ref={videoRef} 
            className="w-full h-full max-h-full max-w-full object-contain z-0" 
            crossOrigin="anonymous"
        />
        
        <Transcribe 
            videoRef={videoRef} 
            isActive={isTranscriptionPanelOpen && isPlaying}
            onTranscriptChunk={handleTranscriptChunk} 
            onError={setTranscriptionError}
        />

        <div className="absolute inset-0 flex items-center justify-between w-full h-full pointer-events-none z-20 px-8 sm:px-16">
            <div className={`transition-opacity duration-300 ${showRewind ? 'opacity-100' : 'opacity-0'}`}>
                {showRewind && <div className="animate-seek-indicator bg-black/50 rounded-full p-3 sm:p-4"><RewindIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" /></div>}
            </div>
            <div className={`transition-opacity duration-300 ${showForward ? 'opacity-100' : 'opacity-0'}`}>
                {showForward && <div className="animate-seek-indicator bg-black/50 rounded-full p-3 sm:p-4"><FastForwardIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" /></div>}
            </div>
        </div>

        {isLocked && (
            <div className={`absolute inset-0 z-40 flex items-center justify-start p-4 sm:p-6 transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <button onClick={() => setIsLocked(false)} className="p-3 bg-black/50 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white pointer-events-auto" aria-label="Unlock screen">
                    <UnlockIcon className="w-6 h-6 text-white"/>
                </button>
            </div>
        )}

        <div className={`absolute top-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${isControlsVisible && !isLocked ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex justify-between items-center gap-4">
                <button onClick={onBack} className="text-gray-300 hover:text-white transition-colors rounded-full p-2 bg-black/20 hover:bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80" aria-label="Back">
                    <ChevronLeftIcon className="w-6 h-6" />
                </button>
                <div className="text-right min-w-0 flex-1">
                    <Marquee as="h3" text={media.title} className="font-semibold text-lg text-gray-100" />
                    <Marquee as="p" text={media.artist} className="text-sm text-gray-400" />
                </div>
            </div>
        </div>
        
        <div className={`absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isControlsVisible && !isLocked ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex flex-col space-y-3">
                <div className="w-full">
                    <ProgressBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <button onClick={togglePlayPause} className="text-white hover:text-gray-300 transition-colors rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                            {isPlaying ? <PauseIcon size={32} /> : <PlayIcon size={32} />}
                        </button>
                        <div 
                          className="relative flex items-center"
                          onMouseEnter={() => setVolumeSliderVisible(true)}
                          onMouseLeave={() => setVolumeSliderVisible(false)}
                        >
                            <button onClick={(e) => { e.stopPropagation(); setVolumeSliderVisible(v => !v); }} className="text-white hover:text-gray-300 transition-colors rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"><VolumeIcon size={24} /></button>
                            <div className={`transition-all duration-200 ease-in-out overflow-hidden ${isVolumeSliderVisible ? 'w-24 ml-2' : 'w-0'}`}>
                              <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={handleVolumeChange} className="w-full" aria-label="Volume slider" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                       <button onClick={() => setIsLocked(true)} className="text-white hover:text-gray-300 transition-colors rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Lock screen"><LockIcon className="w-6 h-6" /></button>
                       <button onClick={toggleTranscriptionPanel} className="text-white hover:text-gray-300 transition-colors rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Show transcript"><CCIcon className="w-6 h-6" /></button>
                       {document.pictureInPictureEnabled && (<button onClick={togglePiP} className="text-white hover:text-gray-300 transition-colors rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Picture in picture"><PictureInPictureIcon className="w-6 h-6" /></button>)}
                       <div className="relative" ref={settingsMenuRef}>
                         <button onClick={() => setSettingsMenuVisible(v => !v)} className="text-white hover:text-gray-300 transition-colors rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Settings"><SettingsIcon className="w-6 h-6" /></button>
                         {isSettingsMenuVisible && (
                           <div className="absolute bottom-full right-0 mb-2 w-32 bg-black/80 backdrop-blur-md rounded-lg p-2 animate-fade-in">
                             <p className="text-xs text-gray-400 px-2 pb-1">Speed</p>
                             <ul>{playbackRates.map(rate => (<li key={rate}><button onClick={() => changePlaybackRate(rate)} className={`w-full text-left text-sm rounded px-2 py-1 transition-colors ${playbackRate === rate ? 'bg-white/20 text-white' : 'text-gray-300 hover:bg-white/10'}`}>{rate === 1 ? 'Normal' : `${rate}x`}</button></li>))}</ul>
                           </div>
                         )}
                       </div>
                       <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Fullscreen">{isFullscreen ? <FullscreenExitIcon className="w-6 h-6" /> : <FullscreenEnterIcon className="w-6 h-6" />}</button>
                    </div>
                </div>
            </div>
        </div>
        
        <TranscriptionPanel isOpen={isTranscriptionPanelOpen} onClose={toggleTranscriptionPanel} transcript={transcript} onQueryChange={setUserQuery} onQuerySubmit={handleAskQuestion} userQuery={userQuery} aiResponse={aiResponse} isAiLoading={isAiLoading} error={transcriptionError} />
    </div>
  );
};

export default VideoPlayer;