import { useState, useRef, useCallback, useEffect } from 'react';
import { MediaItem, RepeatMode } from '../types';

type AudioPlayerState = 'hidden' | 'minimized' | 'expanded';

const shuffleArray = (array: MediaItem[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const [audioPlayerState, setAudioPlayerState] = useState<AudioPlayerState>('hidden');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, _setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [isShuffling, setIsShuffling] = useState(false);
  const [playQueue, setPlayQueue] = useState<MediaItem[]>([]);
  const [shuffledPlayQueue, setShuffledPlayQueue] = useState<MediaItem[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(-1);

  const currentTrack = (isShuffling ? shuffledPlayQueue : playQueue)?.[currentQueueIndex] ?? null;

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioPlayerState('hidden');
    setPlayQueue([]);
    setShuffledPlayQueue([]);
    setCurrentQueueIndex(-1);
  }, []);

  const selectTrack = useCallback((media: MediaItem, queueContext?: MediaItem[]) => {
    if (currentTrack?.id === media.id && audioPlayerState !== 'hidden') {
      setAudioPlayerState('expanded');
    } else {
      const newQueue = queueContext && queueContext.length > 0 ? [...queueContext] : [media];
      setPlayQueue(newQueue);

      const newShuffledQueue = shuffleArray(newQueue);
      setShuffledPlayQueue(newShuffledQueue);

      const activeQueue = isShuffling ? newShuffledQueue : newQueue;
      const newIndex = activeQueue.findIndex(item => item.id === media.id);
      
      setCurrentQueueIndex(newIndex > -1 ? newIndex : 0);
      setAudioPlayerState('expanded');
    }
  }, [currentTrack?.id, audioPlayerState, isShuffling]);

  const minimizePlayer = useCallback(() => setAudioPlayerState('minimized'), []);
  const expandPlayer = useCallback(() => setAudioPlayerState('expanded'), []);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play().catch(error => console.error("Audio play failed:", error));
      } else {
        audioRef.current.pause();
      }
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);
  
  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      const newMuted = !audioRef.current.muted;
      audioRef.current.muted = newMuted;
      if (!newMuted && audioRef.current.volume === 0) {
        audioRef.current.volume = 0.5;
        _setVolume(0.5);
      }
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
        if (prev === 'off') return 'all';
        if (prev === 'all') return 'one';
        return 'off';
    });
  }, []);

  const nextTrack = useCallback(() => {
    const activeQueue = isShuffling ? shuffledPlayQueue : playQueue;
    if (activeQueue.length === 0) return;

    if (activeQueue.length === 1 && repeatMode === 'all') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      return;
    }

    let nextIndex = currentQueueIndex + 1;
    if (nextIndex >= activeQueue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }
    setCurrentQueueIndex(nextIndex);
  }, [currentQueueIndex, isShuffling, shuffledPlayQueue, playQueue, repeatMode]);
  
  const previousTrack = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (currentQueueIndex > 0) {
      setCurrentQueueIndex(prev => prev - 1);
    }
  }, [currentQueueIndex]);

  const toggleShuffle = useCallback(() => {
    const newIsShuffling = !isShuffling;
    setIsShuffling(newIsShuffling);

    if (currentTrack) {
        const newActiveQueue = newIsShuffling ? shuffledPlayQueue : playQueue;
        const newIndex = newActiveQueue.findIndex(item => item.id === currentTrack.id);
        if (newIndex > -1) {
            setCurrentQueueIndex(newIndex);
        }
    }
  }, [isShuffling, currentTrack, playQueue, shuffledPlayQueue]);

  const handleEnded = useCallback(() => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
       const activeQueue = isShuffling ? shuffledPlayQueue : playQueue;
       const isLastTrack = currentQueueIndex >= activeQueue.length - 1;

       if (!isLastTrack || repeatMode === 'all') {
         nextTrack();
       } else {
         setIsPlaying(false);
       }
    }
  }, [repeatMode, isShuffling, shuffledPlayQueue, playQueue, currentQueueIndex, nextTrack]);

  const removeFromQueue = useCallback((mediaId: number) => {
    if (currentQueueIndex === -1 || !playQueue.some(t => t.id === mediaId)) {
        return;
    }

    const currentTrackIdBeforeRemoval = (isShuffling ? shuffledPlayQueue : playQueue)[currentQueueIndex]?.id;

    const newPlayQueue = playQueue.filter(item => item.id !== mediaId);
    const newShuffledQueue = shuffledPlayQueue.filter(item => item.id !== mediaId);

    if (newPlayQueue.length === 0) {
        closePlayer();
        return;
    }
    
    setPlayQueue(newPlayQueue);
    setShuffledPlayQueue(newShuffledQueue);

    const activeQueueAfterRemoval = isShuffling ? newShuffledQueue : newPlayQueue;
    
    let newIndex;
    if (mediaId === currentTrackIdBeforeRemoval) {
        newIndex = Math.min(currentQueueIndex, activeQueueAfterRemoval.length - 1);
    } else {
        newIndex = activeQueueAfterRemoval.findIndex(item => item.id === currentTrackIdBeforeRemoval);
        if (newIndex === -1) {
            closePlayer();
            return;
        }
    }
    
    setCurrentQueueIndex(newIndex);

  }, [playQueue, shuffledPlayQueue, currentQueueIndex, isShuffling, closePlayer]);
  
  const reorderQueue = useCallback((startIndex: number, endIndex: number) => {
    const activeQueue = isShuffling ? shuffledPlayQueue : playQueue;
    const setActiveQueue = isShuffling ? setShuffledPlayQueue : setPlayQueue;

    if (startIndex === endIndex || !activeQueue[startIndex] || !activeQueue[endIndex]) {
        return;
    }

    const newQueue = [...activeQueue];
    const [movedItem] = newQueue.splice(startIndex, 1);
    newQueue.splice(endIndex, 0, movedItem);

    setActiveQueue(newQueue);
    
    if (currentQueueIndex === startIndex) {
        setCurrentQueueIndex(endIndex);
    } else if (startIndex < currentQueueIndex && endIndex >= currentQueueIndex) {
        setCurrentQueueIndex(prev => prev - 1);
    } else if (startIndex > currentQueueIndex && endIndex <= currentQueueIndex) {
        setCurrentQueueIndex(prev => prev + 1);
    }
  }, [isShuffling, shuffledPlayQueue, playQueue, currentQueueIndex]);
  
  const addToQueue = useCallback((mediaItem: MediaItem) => {
    // If song is already in the queue, do nothing.
    if (playQueue.find(track => track.id === mediaItem.id)) {
        return;
    }

    // If there is no active queue, start a new one with this track.
    if (audioPlayerState === 'hidden' || currentQueueIndex === -1) {
        const newQueue = [mediaItem];
        setPlayQueue(newQueue);
        setShuffledPlayQueue(newQueue); // A queue of one doesn't need shuffling
        setCurrentQueueIndex(0);
        setAudioPlayerState('minimized'); // Start with mini player
        return;
    }

    // If there is an active queue, add the song after the current one.
    const insertIndex = currentQueueIndex + 1;
    const newPlayQueue = [...playQueue];
    newPlayQueue.splice(insertIndex, 0, mediaItem);
    setPlayQueue(newPlayQueue);

    // And also update the shuffled queue. Add it after the current track in the shuffled queue.
    const newShuffledQueue = [...shuffledPlayQueue];
    const currentTrackInShuffledQueueIndex = shuffledPlayQueue.findIndex(track => track.id === currentTrack?.id);
    
    if (currentTrackInShuffledQueueIndex > -1) {
        newShuffledQueue.splice(currentTrackInShuffledQueueIndex + 1, 0, mediaItem);
    } else {
        // Fallback: if current track isn't found in shuffled queue (shouldn't happen), add to end.
        newShuffledQueue.push(mediaItem);
    }
    setShuffledPlayQueue(newShuffledQueue);

  }, [playQueue, shuffledPlayQueue, currentQueueIndex, currentTrack, audioPlayerState]);


  useEffect(() => {
    const audio = audioRef.current;
    if (audio && currentTrack && audio.src !== currentTrack.src) {
        audio.src = currentTrack.src;
        audio.load();
        audio.play().catch(e => console.error("Error auto-playing new media:", e));
    } else if (audio && !currentTrack && audioPlayerState === 'hidden') {
        audio.src = '';
    }
  }, [currentTrack, audioPlayerState]);

  useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onTimeUpdate = () => setCurrentTime(audio.currentTime);
      const onLoadedMetadata = () => setDuration(audio.duration);
      const onVolumeChange = () => {
          _setVolume(audio.volume);
          setIsMuted(audio.muted);
      };

      audio.addEventListener('play', onPlay);
      audio.addEventListener('pause', onPause);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('timeupdate', onTimeUpdate);
      audio.addEventListener('loadedmetadata', onLoadedMetadata);
      audio.addEventListener('volumechange', onVolumeChange);
      
      return () => {
          audio.removeEventListener('play', onPlay);
          audio.removeEventListener('pause', onPause);
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('timeupdate', onTimeUpdate);
          audio.removeEventListener('loadedmetadata', onLoadedMetadata);
          audio.removeEventListener('volumechange', onVolumeChange);
      };
  }, [handleEnded]);

  const activeQueue = isShuffling ? shuffledPlayQueue : playQueue;
  const isNextAvailable = repeatMode === 'all' ? activeQueue.length > 0 : currentQueueIndex < activeQueue.length - 1;
  const isPreviousAvailable = currentQueueIndex > 0;

  return {
    audioRef,
    audioPlayerState,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffling,
    selectTrack,
    closePlayer,
    minimizePlayer,
    expandPlayer,
    togglePlayPause,
    seek,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    nextTrack,
    previousTrack,
    removeFromQueue,
    isNextAvailable,
    isPreviousAvailable,
    reorderQueue,
    playQueue,
    shuffledPlayQueue,
    currentQueueIndex,
    addToQueue,
  };
};