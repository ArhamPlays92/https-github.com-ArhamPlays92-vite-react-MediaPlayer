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
import Marquee from './Marquee';

interface VideoPlayerProps {
  media: MediaItem;
  onBack: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ media, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Format time for display
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const hideControls = () => setIsControlsVisible(false);

  const showControls = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = window.setTimeout(hideControls, 3000);
  }, []);

  // Play/Pause
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

  // Volume
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

  // Seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const newTime = parseFloat(e.target.value);
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen().catch(console.error);
    } else {
        document.exitFullscreen();
    }
  }, []);
  
  // Picture-in-Picture
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


  // Ambient Background Effect
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;

    const draw = () => {
      if(ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Event Listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    
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
  }, []);
  
  // Load media and setup controls visibility
  useEffect(() => {
    if (videoRef.current) {
        videoRef.current.src = media.src;
        videoRef.current.load();
        videoRef.current.play().catch(console.error);
    }
    showControls(); // show controls when new media is loaded
    
    const currentSrc = media.src;
    return () => {
      if (currentSrc.startsWith('blob:')) {
        URL.revokeObjectURL(currentSrc);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [media, showControls]);

  const VolumeIcon = isMuted || volume === 0 ? VolumeMuteIcon : volume < 0.5 ? VolumeDownIcon : VolumeUpIcon;

  return (
    <div 
        ref={containerRef}
        className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-sans animate-fade-in"
        onMouseMove={showControls}
        onClick={(e) => { if (e.target === videoRef.current) togglePlayPause() }}
    >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 blur-2xl scale-125" width="160" height="90" />
        <div className="absolute inset-0 bg-black/40" />

        <video 
            ref={videoRef} 
            className="w-full h-full max-h-full max-w-full object-contain z-10" 
            onClick={togglePlayPause}
            onDoubleClick={toggleFullscreen}
        />

        {/* Top Controls */}
        <div className={`absolute top-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
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
        
        {/* Bottom Controls */}
        <div className={`absolute bottom-0 left-0 right-0 z-20 p-4 md:p-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isControlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="flex flex-col space-y-3">
                <div className="w-full">
                    <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full"
                        aria-label="Seek slider"
                    />
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
                        <div className="hidden md:flex items-center space-x-2 w-28">
                            <button onClick={toggleMute} className="text-white hover:text-gray-300 transition-colors rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"><VolumeIcon size={24} /></button>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                                className="w-full"
                                aria-label="Volume slider"
                            />
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                       {document.pictureInPictureEnabled && (
                           <button onClick={togglePiP} className="text-white hover:text-gray-300 transition-colors rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Picture in picture">
                                <PictureInPictureIcon className="w-6 h-6" />
                           </button>
                       )}
                       <button onClick={toggleFullscreen} className="text-white hover:text-gray-300 transition-colors rounded-full p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Fullscreen">
                           {isFullscreen ? <FullscreenExitIcon className="w-6 h-6" /> : <FullscreenEnterIcon className="w-6 h-6" />}
                       </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default VideoPlayer;
