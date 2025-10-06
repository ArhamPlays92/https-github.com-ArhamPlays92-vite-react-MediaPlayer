

import React from 'react';
import { MediaItem } from '../types';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import CloseIcon from './icons/CloseIcon';
import SkipNextIcon from './icons/SkipNextIcon';
import SkipPreviousIcon from './icons/SkipPreviousIcon';
import HeartIcon from './icons/HeartIcon';
import Marquee from './Marquee';
import ProgressBar from './ProgressBar';

interface MiniPlayerProps {
  media: MediaItem;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onExpand: () => void;
  onClose: () => void;
  onTogglePlayPause: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  isNextAvailable: boolean;
  isPreviousAvailable: boolean;
  onToggleLike: (mediaId: number) => void;
  likedSongIds: number[];
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({
  media,
  isPlaying,
  currentTime,
  duration,
  onExpand,
  onClose,
  onTogglePlayPause,
  onSeek,
  onNext,
  onPrevious,
  isNextAvailable,
  isPreviousAvailable,
  onToggleLike,
  likedSongIds
}) => {
  const isLiked = likedSongIds.includes(media.id);

  return (
    <div className="fixed left-0 right-0 bottom-16 lg:bottom-0 h-20 bg-black/50 backdrop-blur-lg border-t border-gray-800 z-40 flex flex-col animate-slide-up-fade-in">
      {/* Progress Bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-auto"
      >
        <ProgressBar
            currentTime={currentTime}
            duration={duration}
            onSeek={onSeek}
            size="small"
        />
      </div>

      <div className="flex items-center justify-between w-full h-full px-4">
        {/* Track Info */}
        <div 
            onClick={onExpand} 
            className="flex items-center gap-4 cursor-pointer flex-grow min-w-0"
        >
          <img
            src={media.coverArt}
            alt={media.title}
            className="w-12 h-12 rounded object-cover"
          />
          <div className="min-w-0">
            <Marquee as="h3" text={media.title} className="text-sm font-semibold text-white" />
            <Marquee as="p" text={media.artist} className="text-xs text-gray-400" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-0 sm:space-x-1 pl-2">
           <button
            onClick={(e) => { e.stopPropagation(); onToggleLike(media.id); }}
            className={`p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 ${isLiked ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            aria-label={isLiked ? "Unlike song" : "Like song"}
          >
            <HeartIcon filled={isLiked} className="w-5 h-5" />
          </button>
           <button 
            onClick={(e) => { e.stopPropagation(); onPrevious(); }}
            disabled={!isPreviousAvailable}
            className="text-white hover:text-gray-300 p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:opacity-50 disabled:hover:text-white"
            aria-label="Previous track"
          >
            <SkipPreviousIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePlayPause(); }}
            className="text-white hover:text-gray-300 p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying 
                ? <PauseIcon size={28} className="w-7 h-7" /> 
                : <PlayIcon size={28} className="w-7 h-7" />
            }
          </button>
           <button 
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            disabled={!isNextAvailable}
            className="text-white hover:text-gray-300 p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:opacity-50 disabled:hover:text-white"
            aria-label="Next track"
          >
            <SkipNextIcon className="w-6 h-6" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="text-gray-400 hover:text-white p-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            aria-label="Close player"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;