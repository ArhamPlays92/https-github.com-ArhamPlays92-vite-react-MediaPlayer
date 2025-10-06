
import React from 'react';
import { MediaItem, RepeatMode } from '../types';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import VolumeUpIcon from './icons/VolumeUpIcon';
import VolumeDownIcon from './icons/VolumeDownIcon';
import VolumeMuteIcon from './icons/VolumeMuteIcon';
import ShuffleIcon from './icons/ShuffleIcon';
import RepeatIcon from './icons/RepeatIcon';
import SkipNextIcon from './icons/SkipNextIcon';
import SkipPreviousIcon from './icons/SkipPreviousIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';

interface AudioPlayerProps {
  media: MediaItem;
  onMinimize: () => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffling: boolean;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onRepeatToggle: () => void;
  onShuffleToggle: () => void;
  onNext: () => void;
  onPrevious: () => void;
  isNextAvailable: boolean;
  isPreviousAvailable: boolean;
}


const AudioPlayer: React.FC<AudioPlayerProps> = ({ 
  media, 
  onMinimize,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  repeatMode,
  isShuffling,
  onTogglePlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onRepeatToggle,
  onShuffleToggle,
  onNext,
  onPrevious,
  isNextAvailable,
  isPreviousAvailable,
}) => {
  
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleVolumeChangeInternal = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };
  
  const handleSeekInternal = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  const VolumeIcon = isMuted || volume === 0 ? VolumeMuteIcon : volume < 0.5 ? VolumeDownIcon : VolumeUpIcon;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-sans animate-fade-in">
        {/* Background */}
        <div 
            style={{ backgroundImage: `url(${media.coverArt})` }}
            className="absolute inset-0 bg-cover bg-center blur-3xl scale-125 opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-10 p-4 md:p-6">
             <button onClick={onMinimize} className="text-gray-300 hover:text-white transition-colors rounded-full p-2 bg-black/20 hover:bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80" aria-label="Back to library">
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
        </header>

        {/* Main Content */}
        <main className="relative z-10 flex flex-col items-center justify-center flex-grow px-4 text-center overflow-hidden pt-16 pb-4">
            <img 
              src={media.coverArt} 
              alt={media.title} 
              className="w-full max-w-xs md:max-w-md aspect-square rounded-lg shadow-2xl shadow-black/50 object-cover animate-slide-up-fade-in" 
            />
            <div className="mt-6">
                <h2 className="text-2xl md:text-4xl font-bold text-white">{media.title}</h2>
                <p className="text-gray-300 text-base md:text-lg mt-1">{media.artist}</p>
            </div>
        </main>

        {/* Footer Controls */}
        <footer className="relative z-10 flex-shrink-0 p-4 md:p-8 space-y-4">
            {/* Seek Bar */}
            <div className="w-full">
                <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeekInternal}
                    className="w-full"
                    aria-label="Seek slider"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center space-x-6">
                <button 
                    onClick={onShuffleToggle} 
                    className={`p-2 rounded-full transition-colors ${isShuffling ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'} focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80`}
                    aria-label="Shuffle"
                >
                    <ShuffleIcon isActive={isShuffling}/>
                </button>
                <button onClick={onPrevious} disabled={!isPreviousAvailable} className="text-gray-300 hover:text-white transition-colors p-2 rounded-full disabled:opacity-50 disabled:hover:text-gray-300" aria-label="Previous track">
                    <SkipPreviousIcon className="w-10 h-10"/>
                </button>
                <button onClick={onTogglePlayPause} className="bg-white text-black rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shadow-lg hover:bg-gray-200 transition-transform hover:scale-105 active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-white relative" aria-label={isPlaying ? "Pause" : "Play"}>
                    <span className={`absolute transition-all duration-200 ease-in-out ${isPlaying ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`} aria-hidden="true"><PlayIcon size={40} /></span>
                    <span className={`absolute transition-all duration-200 ease-in-out ${isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} aria-hidden="true"><PauseIcon size={40} /></span>
                </button>
                <button onClick={onNext} disabled={!isNextAvailable} className="text-gray-300 hover:text-white transition-colors p-2 rounded-full disabled:opacity-50 disabled:hover:text-gray-300" aria-label="Next track">
                    <SkipNextIcon className="w-10 h-10"/>
                </button>
                <button 
                    onClick={onRepeatToggle} 
                    className={`p-2 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'} focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80`}
                    aria-label="Repeat"
                >
                    <RepeatIcon mode={repeatMode} />
                </button>
            </div>
            
            {/* Volume Control (Desktop only) */}
             <div className="hidden md:flex items-center justify-center space-x-3 pt-4">
                <button onClick={onToggleMute} className="text-gray-400 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"><VolumeIcon /></button>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChangeInternal}
                    className="w-28"
                    aria-label="Volume slider"
                />
             </div>
        </footer>
    </div>
  );
};

export default AudioPlayer;
