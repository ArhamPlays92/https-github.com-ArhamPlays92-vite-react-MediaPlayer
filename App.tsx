import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Library from './components/Library';
import AudioPlayer from './components/AudioPlayer';
import VideoPlayer from './components/VideoPlayer';
import Navbar from './components/Navbar';
import MobileNavbar from './components/MobileNavbar';
import Browse from './components/Browse';
import Playlists from './components/Playlists';
import ConfirmationModal from './components/ConfirmationModal';
import SearchView from './components/SearchView';
import MiniPlayer from './components/MiniPlayer';
import Transcribe from './components/Transcribe';
import { MEDIA_FILES, INITIAL_PLAYLISTS, LIKED_SONGS_PLAYLIST_ID } from './constants';
import { MediaItem, View, MediaType, LibraryViewMode, Playlist } from './types';
import { useAudioPlayer } from './hooks/useAudioPlayer';

type ConfirmationState = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

function App() {
  const [currentView, setCurrentView] = useState<View>(View.AUDIO);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [localMediaFiles, setLocalMediaFiles] = useState<MediaItem[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [libraryViewMode, setLibraryViewMode] = useState<LibraryViewMode>('list');
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [selectedAudioCategory, setSelectedAudioCategory] = useState<string>('All');
  const [selectedVideoCategory, setSelectedVideoCategory] = useState<string>('All');
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // A small threshold to prevent firing on minimal scroll
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial check in case the page loads scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const player = useAudioPlayer();
  
  const handleSelectMedia = useCallback((media: MediaItem, queueContext?: MediaItem[]) => {
    setSearchQuery(''); 
    
    if (media.type === MediaType.AUDIO) {
      player.selectTrack(media, queueContext);
    } else {
      if (player.audioPlayerState !== 'hidden') {
        player.closePlayer();
      }
      setSelectedMedia(media);
    }
  }, [player]);

  const handleBackFromVideo = useCallback(() => {
    setSelectedMedia(null);
  }, []);

  const handleSetView = (view: View) => {
    setCurrentView(view);
    // Don't deselect audio, just videos
    if (selectedMedia && selectedMedia.type === MediaType.VIDEO) {
      setSelectedMedia(null);
    }
    setSearchQuery(''); // Clear search when changing view
    setActivePlaylist(null); // Clear active playlist
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setActivePlaylist(playlist);
    setCurrentView(View.PLAYLIST);
    setSearchQuery('');
  };

  const handleBackToPlaylists = () => {
    setActivePlaylist(null);
  };

  const handleAddLocalFiles = (newFiles: MediaItem[]) => {
    setLocalMediaFiles(prevFiles => {
      const existingSrcs = new Set(prevFiles.map(f => f.src));
      const uniqueNewFiles = newFiles.filter(f => !existingSrcs.has(f.src));
      return [...prevFiles, ...uniqueNewFiles];
    });
  };

  const handleRemoveLocalFile = (mediaId: number) => {
     setConfirmationModal({
      isOpen: true,
      title: "Remove File",
      message: "Are you sure you want to permanently remove this file from your library? This action will also remove it from all playlists.",
      onConfirm: () => {
        player.removeFromQueue(mediaId);
        setLocalMediaFiles(prev => prev.filter(file => file.id !== mediaId));
        setPlaylists(prev => prev.map(p => ({
            ...p,
            mediaIds: p.mediaIds.filter(id => id !== mediaId)
        })));
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
    });
  };

  const handleCreatePlaylist = (name: string, mediaIdToAdd?: number) => {
    if (name.trim() === '') return;
    const newPlaylist: Playlist = {
      id: Date.now(),
      name,
      mediaIds: mediaIdToAdd ? [mediaIdToAdd] : [],
    };
    setPlaylists(prev => [...prev, newPlaylist]);
  };

  const handleDeletePlaylist = (playlistId: number) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Playlist",
      message: "Are you sure you want to delete this playlist? This action cannot be undone.",
      onConfirm: () => {
        setPlaylists(prev => prev.filter(p => p.id !== playlistId));
        setConfirmationModal({ ...confirmationModal, isOpen: false });
      },
    });
  };

  const handleRenamePlaylist = (playlistId: number, newName: string) => {
    setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, name: newName } : p));
  };
  
  const handleAddToPlaylist = (mediaId: number, playlistId: number) => {
    setPlaylists(prevPlaylists =>
      prevPlaylists.map(playlist => {
        if (playlist.id === playlistId) {
          if (playlist.mediaIds.includes(mediaId)) return playlist;
          return { ...playlist, mediaIds: [...playlist.mediaIds, mediaId] };
        }
        return playlist;
      })
    );
  };

  const handleRemoveFromPlaylist = (mediaId: number, playlistId: number) => {
    if(activePlaylist?.id === playlistId) {
      player.removeFromQueue(mediaId);
    }
    setPlaylists(prev => prev.map(p => {
        if (p.id === playlistId) {
            return { ...p, mediaIds: p.mediaIds.filter(id => id !== mediaId) };
        }
        return p;
    }));
  };
  
  const handleToggleLike = (mediaId: number) => {
    setPlaylists(prev => prev.map(p => {
        if (p.id === LIKED_SONGS_PLAYLIST_ID) {
            const isLiked = p.mediaIds.includes(mediaId);
            if (isLiked) {
                return { ...p, mediaIds: p.mediaIds.filter(id => id !== mediaId) };
            } else {
                return { ...p, mediaIds: [...p.mediaIds, mediaId] };
            }
        }
        return p;
    }));
  }

  const renderContent = () => {
    if (selectedMedia && selectedMedia.type === MediaType.VIDEO) {
      return <VideoPlayer media={selectedMedia} onBack={handleBackFromVideo} />;
    }

    const allMedia = [...MEDIA_FILES, ...localMediaFiles];

    if (searchQuery) {
      return <SearchView 
        searchQuery={searchQuery}
        allMedia={allMedia}
        playlists={playlists}
        onSelectMedia={handleSelectMedia}
        onSelectPlaylist={handleSelectPlaylist}
        onAddToPlaylist={handleAddToPlaylist}
        onAddToQueue={player.addToQueue}
        onRemoveLocalFile={handleRemoveLocalFile}
      />
    }

    switch (currentView) {
      case View.AUDIO:
        const audioFiles = allMedia.filter(file => file.type === MediaType.AUDIO);
        return <Library 
          title="Audio Tracks" 
          mediaFiles={audioFiles} 
          onSelectMedia={handleSelectMedia}
          viewMode={libraryViewMode}
          setViewMode={setLibraryViewMode} 
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          onAddToQueue={player.addToQueue}
          onRemoveLocalFile={handleRemoveLocalFile}
          onRemoveFromPlaylist={handleRemoveFromPlaylist}
          selectedCategory={selectedAudioCategory}
          onSelectCategory={setSelectedAudioCategory}
        />;
      case View.VIDEO:
        const videoFiles = allMedia.filter(file => file.type === MediaType.VIDEO);
        return <Library 
          title="Videos" 
          mediaFiles={videoFiles} 
          onSelectMedia={handleSelectMedia} 
          viewMode={libraryViewMode}
          setViewMode={setLibraryViewMode}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          onAddToQueue={player.addToQueue}
          onRemoveLocalFile={handleRemoveLocalFile}
          onRemoveFromPlaylist={handleRemoveFromPlaylist}
          selectedCategory={selectedVideoCategory}
          onSelectCategory={setSelectedVideoCategory}
        />;
      case View.PLAYLIST:
        return <Playlists
          playlists={playlists}
          onCreatePlaylist={handleCreatePlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          onRenamePlaylist={handleRenamePlaylist}
          allMedia={allMedia}
          onSelectMedia={handleSelectMedia}
          viewMode={libraryViewMode}
          setViewMode={setLibraryViewMode}
          onAddToPlaylist={handleAddToPlaylist}
          onAddToQueue={player.addToQueue}
          onRemoveFromPlaylist={handleRemoveFromPlaylist}
          onRemoveLocalFile={handleRemoveLocalFile}
          initialSelectedPlaylist={activePlaylist}
          onBackToPlaylists={handleBackToPlaylists}
        />;
      case View.TRANSCRIBE:
        return <Transcribe />;
      case View.BROWSE:
      default:
        return <Browse 
          onFilesAdded={handleAddLocalFiles} 
          localMediaFiles={localMediaFiles}
          onSelectMedia={handleSelectMedia}
          viewMode={libraryViewMode}
          setViewMode={setLibraryViewMode}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          onAddToQueue={player.addToQueue}
          onRemoveLocalFile={handleRemoveLocalFile}
          onRemoveFromPlaylist={handleRemoveFromPlaylist}
        />;
    }
  };

  const mainPaddingBottom = player.audioPlayerState !== 'hidden' 
    ? 'pb-44 md:pb-28' // More padding when mini player is visible
    : 'pb-24 md:pb-8';
    
  const allMedia = [...MEDIA_FILES, ...localMediaFiles];
  const allAudioFiles = allMedia.filter(file => file.type === MediaType.AUDIO);
  const likedSongIds = playlists.find(p => p.id === LIKED_SONGS_PLAYLIST_ID)?.mediaIds || [];

  return (
    <div className="text-gray-200 min-h-screen font-sans">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} isScrolled={isScrolled} />
      <Navbar 
        currentView={currentView} 
        setView={handleSetView} 
        isExpanded={isSidebarExpanded}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      />
       <MobileNavbar 
        currentView={currentView} 
        setView={handleSetView} 
      />
      <main className={`pt-24 p-4 transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'md:pl-64' : 'md:pl-24'} ${mainPaddingBottom}`}>
        {renderContent()}
      </main>

      <audio ref={player.audioRef} />

      {player.currentTrack && player.audioPlayerState === 'expanded' && (
        <AudioPlayer 
          media={player.currentTrack} 
          onMinimize={player.minimizePlayer}
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          volume={player.volume}
          isMuted={player.isMuted}
          repeatMode={player.repeatMode}
          isShuffling={player.isShuffling}
          onTogglePlayPause={player.togglePlayPause}
          onSeek={player.seek}
          onVolumeChange={player.setVolume}
          onToggleMute={player.toggleMute}
          onRepeatToggle={player.toggleRepeat}
          onShuffleToggle={player.toggleShuffle}
          onNext={player.nextTrack}
          onPrevious={player.previousTrack}
          isNextAvailable={player.isNextAvailable}
          isPreviousAvailable={player.isPreviousAvailable}
          playQueue={player.playQueue}
          shuffledPlayQueue={player.shuffledPlayQueue}
          currentQueueIndex={player.currentQueueIndex}
          reorderQueue={player.reorderQueue}
          onRemoveFromQueue={player.removeFromQueue}
          onAddToQueue={player.addToQueue}
          allAudioFiles={allAudioFiles}
          onToggleLike={handleToggleLike}
          likedSongIds={likedSongIds}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          onCreatePlaylist={handleCreatePlaylist}
        />
      )}

      {player.currentTrack && player.audioPlayerState === 'minimized' && (
        <MiniPlayer
          media={player.currentTrack}
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          onExpand={player.expandPlayer}
          onClose={player.closePlayer}
          onTogglePlayPause={player.togglePlayPause}
          onSeek={player.seek}
          onNext={player.nextTrack}
          onPrevious={player.previousTrack}
          isNextAvailable={player.isNextAvailable}
          isPreviousAvailable={player.isPreviousAvailable}
          onToggleLike={handleToggleLike}
          likedSongIds={likedSongIds}
        />
      )}

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
      />
    </div>
  );
}

export default App;