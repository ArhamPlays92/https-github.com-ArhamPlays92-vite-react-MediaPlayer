import React, { useState, useRef, useEffect } from 'react';
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
import ChevronDownIcon from './icons/ChevronDownIcon';
import DragHandleIcon from './icons/DragHandleIcon';
import SoundWaveIcon from './icons/SoundWaveIcon';
import ListIcon from './icons/ListIcon';
import CloseIcon from './icons/CloseIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import CheckIcon from './icons/CheckIcon';
import SearchIcon from './icons/SearchIcon';
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
  playQueue: MediaItem[];
  shuffledPlayQueue: MediaItem[];
  currentQueueIndex: number;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  onRemoveFromQueue: (mediaId: number) => void;
  onAddToQueue: (item: MediaItem) => void;
  allAudioFiles: MediaItem[];
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
  playQueue,
  shuffledPlayQueue,
  currentQueueIndex,
  reorderQueue,
  onRemoveFromQueue,
  onAddToQueue,
  allAudioFiles,
}) => {
  const [isQueueVisible, setIsQueueVisible] = useState(false);
  const [queueView, setQueueView] = useState<'queue' | 'add'>('queue');
  const [addSongsSearch, setAddSongsSearch] = useState('');
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const dragItem = React.useRef<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const mainEl = mainRef.current;
    if (!mainEl) return;

    const handleScroll = () => {
        setIsScrolled(mainEl.scrollTop > 10);
    };

    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
        mainEl.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const closeQueueModal = () => {
    setIsQueueVisible(false);
    setTimeout(() => {
        setQueueView('queue');
        setAddSongsSearch('');
    }, 300); // Allow animation to finish
  };
  
  const filteredAddSongs = addSongsSearch
    ? allAudioFiles.filter(item => 
        item.title.toLowerCase().includes(addSongsSearch.toLowerCase()) ||
        item.artist.toLowerCase().includes(addSongsSearch.toLowerCase())
      )
    : allAudioFiles;


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

  const activeQueue = isShuffling ? shuffledPlayQueue : playQueue;

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDraggedIndex(index);
  };

  const handleDrop = (dropIndex: number) => {
    if (dragItem.current !== null && dragItem.current !== dropIndex) {
      reorderQueue(dragItem.current, dropIndex);
    }
    dragItem.current = null;
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    dragItem.current = null;
    setDraggedIndex(null);
  };
  
  const headerIsOpaque = isScrolled;
  const scrolledClasses = headerIsOpaque
    ? 'bg-black/50 backdrop-blur-lg border-b border-gray-800'
    : 'border-b border-transparent';

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col font-sans animate-fade-in">
        {/* Background */}
        <div 
            style={{ backgroundImage: `url(${media.coverArt})` }}
            className="absolute inset-0 bg-cover bg-center blur-3xl scale-125 opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

        {/* Player Section */}
        <div className="relative z-10 flex flex-col flex-grow h-full">
            <header className={`p-4 md:p-6 w-full flex justify-between items-center transition-all duration-300 sticky top-0 z-20 ${scrolledClasses}`}>
                 <button onClick={onMinimize} className="text-gray-300 hover:text-white transition-colors rounded-full p-2 bg-black/20 hover:bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80" aria-label="Minimize player">
                    <ChevronDownIcon className="w-6 h-6" />
                </button>
                <div className="md:hidden text-center">
                    <p className="text-xs text-gray-400 uppercase tracking-widest">Now Playing</p>
                    <h3 className="text-sm font-semibold text-white truncate px-2">{media.title}</h3>
                </div>
                <button onClick={() => setIsQueueVisible(true)} className="text-gray-300 hover:text-white transition-colors rounded-full p-2 bg-black/20 hover:bg-black/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80" aria-label="Show queue">
                  <ListIcon className="w-6 h-6" />
                </button>
            </header>

            <main ref={mainRef} className="relative z-10 flex flex-col items-center justify-start flex-grow px-4 text-center overflow-y-auto pb-4">
                <div className="relative w-full max-w-xs md:max-w-md aspect-square mt-8 md:mt-4 flex-shrink-0">
                    <img 
                      src={media.coverArt} 
                      alt={media.title} 
                      className="w-full h-full rounded-lg object-cover shadow-2xl shadow-black/50" 
                    />
                </div>
                <div className="mt-6">
                    <h2 className="text-2xl md:text-4xl font-bold text-white">{media.title}</h2>
                    <p className="text-gray-300 text-base md:text-lg mt-1">{media.artist}</p>
                </div>
            </main>

            <footer className="relative z-10 flex-shrink-0 p-4 md:p-8 space-y-4 max-w-xl mx-auto w-full">
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
                <div className="flex items-center justify-center space-x-6">
                    <button 
                        onClick={onShuffleToggle} 
                        className={`p-2 rounded-full transition-colors ${isShuffling ? 'text-white' : 'text-gray-400 hover:text-white'} focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80`}
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
                        className={`p-2 rounded-full transition-colors ${repeatMode !== 'off' ? 'text-white' : 'text-gray-400 hover:text-white'} focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80`}
                        aria-label="Repeat"
                    >
                        <RepeatIcon mode={repeatMode} />
                    </button>
                </div>
                 <div className="flex md:hidden items-center justify-center space-x-3 pt-4">
                    <button onClick={onToggleMute} className="text-gray-400 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"><VolumeIcon /></button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChangeInternal}
                        className="w-full"
                        aria-label="Volume slider"
                    />
                 </div>
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

        {/* Queue Modal */}
        {isQueueVisible && (
            <div className="fixed inset-0 z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="queue-heading">
                <div className="absolute inset-0 bg-black/60" onClick={closeQueueModal} />
                
                <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-xl border-t border-white/10 rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up-fade-in">
                    {queueView === 'queue' && (
                        <>
                            {/* QUEUE VIEW */}
                            <header className="p-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
                                <h3 id="queue-heading" className="text-xl font-bold text-gray-200 tracking-tight">Up Next</h3>
                                <button onClick={closeQueueModal} className="p-2 text-gray-400 hover:text-white rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80" aria-label="Close queue">
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            </header>
                            <div className="overflow-y-auto flex-grow p-2">
                                {activeQueue.length > 0 ? activeQueue.map((item, index) => {
                                    const isActive = index === currentQueueIndex;
                                    return (
                                        <div
                                            key={item.id}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={() => handleDrop(index)}
                                            onDragEnd={handleDragEnd}
                                            className={`group flex items-center p-2 rounded-lg gap-3 transition-all duration-200 ${
                                                draggedIndex === index ? 'opacity-30' : 'opacity-100'
                                            } ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}`}
                                        >
                                            <div className="text-gray-400 cursor-grab touch-none" aria-label="Drag to reorder">
                                                <DragHandleIcon className="w-5 h-5" />
                                            </div>
                                            <img src={item.coverArt} alt={item.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                                            <div className="flex-grow min-w-0">
                                                <p className={`font-semibold truncate ${isActive ? 'text-white' : 'text-gray-200'}`}>{item.title}</p>
                                                <p className="text-sm text-gray-400 truncate">{item.artist}</p>
                                            </div>
                                            <div className="flex-shrink-0 ml-2">
                                                {isActive ? (
                                                    <SoundWaveIcon className="text-white" />
                                                ) : (
                                                    <button 
                                                        onClick={() => onRemoveFromQueue(item.id)} 
                                                        className="p-1 text-gray-500 hover:text-white focus:text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity rounded-full hover:bg-white/10 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/50"
                                                        aria-label={`Remove ${item.title} from queue`}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-gray-500 text-center p-4">Queue is empty.</p>
                                )}
                            </div>
                            <footer className="p-4 border-t border-white/10 flex-shrink-0">
                                <button
                                    onClick={() => setQueueView('add')}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-base font-bold bg-white text-black rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-white"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Add Songs
                                </button>
                            </footer>
                        </>
                    )}
                    {queueView === 'add' && (
                        <>
                            {/* ADD SONGS VIEW */}
                            <header className="p-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
                                <button onClick={() => setQueueView('queue')} className="p-2 -ml-2 text-gray-300 hover:text-white rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80" aria-label="Back to queue">
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                                <h3 id="queue-heading" className="text-xl font-bold text-gray-200 tracking-tight">Add Songs</h3>
                                <button onClick={closeQueueModal} className="p-2 -mr-2 text-gray-400 hover:text-white rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80" aria-label="Close">
                                    <CloseIcon className="w-5 h-5" />
                                </button>
                            </header>
                             <div className="p-4 flex-shrink-0">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <input
                                    type="text"
                                    placeholder="Search your audio..."
                                    value={addSongsSearch}
                                    onChange={(e) => setAddSongsSearch(e.target.value)}
                                    className="bg-black/30 border border-gray-700 rounded-lg py-2 pl-10 pr-4 block w-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>
                            <div className="overflow-y-auto flex-grow px-2 pb-2">
                                {filteredAddSongs.length > 0 ? filteredAddSongs.map(item => {
                                    const isAlreadyInQueue = playQueue.some(track => track.id === item.id);
                                    return (
                                        <div key={item.id} className="group flex items-center p-2 rounded-lg gap-3 hover:bg-white/5 transition-colors">
                                            <img src={item.coverArt} alt={item.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                                            <div className="flex-grow min-w-0">
                                                <p className="font-semibold truncate text-gray-200">{item.title}</p>
                                                <p className="text-sm text-gray-400 truncate">{item.artist}</p>
                                            </div>
                                            <button 
                                                onClick={() => onAddToQueue(item)}
                                                disabled={isAlreadyInQueue}
                                                className="p-2 text-gray-300 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:text-green-400 enabled:hover:bg-white/10 enabled:hover:text-white"
                                                aria-label={isAlreadyInQueue ? `${item.title} is in queue` : `Add ${item.title} to queue`}
                                            >
                                                {isAlreadyInQueue ? <CheckIcon className="w-5 h-5" /> : <PlusIcon className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    )
                                }) : (
                                    <p className="text-gray-500 text-center p-4">No songs found.</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        )}
    </div>
  );
};

export default AudioPlayer;