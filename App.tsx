

import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import OpeningAnimation from './components/OpeningAnimation';
import AlbumView from './components/AlbumView';
import ArtistView from './components/ArtistView';
import MediaLibraryView from './components/MediaLibraryView';
import { MEDIA_FILES, INITIAL_PLAYLISTS, LIKED_SONGS_PLAYLIST_ID } from './constants';
import { MediaItem, View, MediaType, LibraryViewMode, Playlist, Album, Artist, LibrarySubView } from './types';
import { useAudioPlayer } from './hooks/useAudioPlayer';

type ConfirmationState = {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>(View.AUDIO);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [localMediaFiles, setLocalMediaFiles] = useState<MediaItem[]>([]);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [libraryViewMode, setLibraryViewMode] = useState<LibraryViewMode>('list');
  const [playlists, setPlaylists] = useState<Playlist[]>(INITIAL_PLAYLISTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [audioLibrarySubView, setAudioLibrarySubView] = useState<LibrarySubView>('all');
  const [videoLibrarySubView, setVideoLibrarySubView] = useState<LibrarySubView>('all');

  const [confirmationModal, setConfirmationModal] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [isScrolled, setIsScrolled] = useState(false);
  
  const requestConfirmation = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmationModal(prev => ({ ...prev, isOpen: false }));
      },
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const player = useAudioPlayer();
  const allMedia = useMemo(() => [...MEDIA_FILES, ...localMediaFiles], [localMediaFiles]);
  const allAudioFiles = useMemo(() => allMedia.filter(file => file.type === MediaType.AUDIO), [allMedia]);
  const allVideoFiles = useMemo(() => allMedia.filter(file => file.type === MediaType.VIDEO), [allMedia]);

  const audioAlbums = useMemo<Album[]>(() => {
    const albumMap = new Map<string, MediaItem[]>();
    allAudioFiles.forEach(song => {
        if (!song.album) return;
        const albumId = `${song.artist}|${song.album}`;
        if (!albumMap.has(albumId)) {
            albumMap.set(albumId, []);
        }
        albumMap.get(albumId)!.push(song);
    });

    return Array.from(albumMap.entries()).map(([id, songs]) => ({
        id,
        title: songs[0].album,
        artist: songs[0].artist,
        coverArt: songs[0].coverArt,
        items: songs,
    })).sort((a,b) => a.title.localeCompare(b.title));
  }, [allAudioFiles]);

  const audioArtists = useMemo<Artist[]>(() => {
      const artistMap = new Map<string, MediaItem[]>();
      allAudioFiles.forEach(song => {
          if (!artistMap.has(song.artist)) {
              artistMap.set(song.artist, []);
          }
          artistMap.get(song.artist)!.push(song);
      });

      return Array.from(artistMap.entries()).map(([name, songs]) => {
          const artistAlbums = audioAlbums.filter(album => album.artist === name);
          return {
              id: name,
              name,
              coverArt: artistAlbums[0]?.coverArt || songs[0]?.coverArt || '',
              albums: artistAlbums
          };
      }).filter(artist => artist.name).sort((a,b) => a.name.localeCompare(b.name));
  }, [allAudioFiles, audioAlbums]);

  const videoAlbums = useMemo<Album[]>(() => {
    const albumMap = new Map<string, MediaItem[]>();
    allVideoFiles.forEach(video => {
        if (!video.album) return;
        const albumId = `${video.artist}|${video.album}`;
        if (!albumMap.has(albumId)) {
            albumMap.set(albumId, []);
        }
        albumMap.get(albumId)!.push(video);
    });

    return Array.from(albumMap.entries()).map(([id, videos]) => ({
        id,
        title: videos[0].album,
        artist: videos[0].artist,
        coverArt: videos[0].coverArt,
        items: videos,
    })).sort((a,b) => a.title.localeCompare(b.title));
  }, [allVideoFiles]);

  const videoArtists = useMemo<Artist[]>(() => {
      const artistMap = new Map<string, MediaItem[]>();
      allVideoFiles.forEach(video => {
          if (!artistMap.has(video.artist)) {
              artistMap.set(video.artist, []);
          }
          artistMap.get(video.artist)!.push(video);
      });

      return Array.from(artistMap.entries()).map(([name, videos]) => {
          const artistAlbums = videoAlbums.filter(album => album.artist === name);
          return {
              id: name,
              name,
              coverArt: artistAlbums[0]?.coverArt || videos[0]?.coverArt || '',
              albums: artistAlbums
          };
      }).filter(artist => artist.name).sort((a,b) => a.name.localeCompare(b.name));
  }, [allVideoFiles, videoAlbums]);


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
    if (selectedMedia && selectedMedia.type === MediaType.VIDEO) {
      setSelectedMedia(null);
    }
    setSearchQuery('');
    setActivePlaylist(null);
    setSelectedAlbum(null);
    setSelectedArtist(null);
  };

  const handleSelectPlaylist = (playlist: Playlist) => {
    setActivePlaylist(playlist);
    setCurrentView(View.PLAYLIST);
    setSearchQuery('');
    setSelectedAlbum(null);
    setSelectedArtist(null);
  };

  const handleBackToPlaylists = () => {
    setActivePlaylist(null);
  };
  
  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setSelectedArtist(null);
    setActivePlaylist(null);
    // This is a bit of a hack, but ensures the view is correct
    const type = album.items[0]?.type;
    if (type === MediaType.AUDIO) setCurrentView(View.AUDIO);
    if (type === MediaType.VIDEO) setCurrentView(View.VIDEO);
  };
  
  const handleSelectArtist = (artist: Artist) => {
    setSelectedArtist(artist);
    setSelectedAlbum(null);
    setActivePlaylist(null);
    const type = artist.albums[0]?.items[0]?.type;
    if (type === MediaType.AUDIO) setCurrentView(View.AUDIO);
    if (type === MediaType.VIDEO) setCurrentView(View.VIDEO);
  };

  const handleBackToLibrary = () => {
      setSelectedAlbum(null);
      setSelectedArtist(null);
  };


  const handleSetLocalFiles = (newFiles: MediaItem[]) => {
    setLocalMediaFiles(prevFiles => {
      // Revoke old blob URLs to prevent memory leaks
      prevFiles.forEach(file => {
        if (file.src.startsWith('blob:')) {
          URL.revokeObjectURL(file.src);
        }
      });
      return newFiles;
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
    const mainContentWrapper = (content: React.ReactNode) => {
      const isLibraryView = (currentView === View.AUDIO || currentView === View.VIDEO) && !selectedAlbum && !selectedArtist && !searchQuery;
      // The library view handles its own padding to allow the tab bar border to be full-width.
      // Other views get padding from this wrapper.
      return <div className={isLibraryView ? '' : 'p-4'}>{content}</div>;
    };

    if (selectedMedia && selectedMedia.type === MediaType.VIDEO) {
      return mainContentWrapper(<VideoPlayer media={selectedMedia} onBack={handleBackFromVideo} />);
    }

    if (searchQuery) {
      return mainContentWrapper(<SearchView 
        searchQuery={searchQuery}
        allMedia={allMedia}
        playlists={playlists}
        onSelectMedia={handleSelectMedia}
        onSelectPlaylist={handleSelectPlaylist}
        onAddToPlaylist={handleAddToPlaylist}
        onAddToQueue={player.addToQueue}
      />);
    }

    let viewContent: React.ReactNode;
    switch (currentView) {
      case View.AUDIO:
        if (selectedAlbum) {
          viewContent = <AlbumView 
            album={selectedAlbum} 
            onBack={handleBackToLibrary}
            onSelectMedia={handleSelectMedia}
            onAddToPlaylist={handleAddToPlaylist}
            onAddToQueue={player.addToQueue}
            playlists={playlists}
          />
        } else if (selectedArtist) {
            viewContent = <ArtistView 
              artist={selectedArtist}
              onBack={handleBackToLibrary}
              onSelectAlbum={handleSelectAlbum}
            />
        } else {
          viewContent = <MediaLibraryView 
              mediaType={MediaType.AUDIO}
              allMediaForType={allAudioFiles}
              albums={audioAlbums}
              artists={audioArtists}
              activeSubView={audioLibrarySubView}
              onSetSubView={setAudioLibrarySubView}
              onSelectAlbum={handleSelectAlbum}
              onSelectArtist={handleSelectArtist}
              onSelectMedia={handleSelectMedia}
              viewMode={libraryViewMode}
              setViewMode={setLibraryViewMode}
              playlists={playlists}
              onAddToPlaylist={handleAddToPlaylist}
              onAddToQueue={player.addToQueue}
          />
        }
        break;
      case View.VIDEO:
        if (selectedAlbum) {
          viewContent = <AlbumView 
            album={selectedAlbum} 
            onBack={handleBackToLibrary}
            onSelectMedia={handleSelectMedia}
            onAddToPlaylist={handleAddToPlaylist}
            onAddToQueue={player.addToQueue}
            playlists={playlists}
          />
        } else if (selectedArtist) {
            viewContent = <ArtistView 
              artist={selectedArtist}
              onBack={handleBackToLibrary}
              onSelectAlbum={handleSelectAlbum}
            />
        } else {
          viewContent = <MediaLibraryView
              mediaType={MediaType.VIDEO}
              allMediaForType={allVideoFiles}
              albums={videoAlbums}
              artists={videoArtists}
              activeSubView={videoLibrarySubView}
              onSetSubView={setVideoLibrarySubView}
              onSelectAlbum={handleSelectAlbum}
              onSelectArtist={handleSelectArtist}
              onSelectMedia={handleSelectMedia}
              viewMode={libraryViewMode}
              setViewMode={setLibraryViewMode}
              playlists={playlists}
              onAddToPlaylist={handleAddToPlaylist}
              onAddToQueue={player.addToQueue}
          />
        }
        break;
      case View.PLAYLIST:
        viewContent = <Playlists
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
          initialSelectedPlaylist={activePlaylist}
          onBackToPlaylists={handleBackToPlaylists}
        />;
        break;
      case View.BROWSE:
      default:
        viewContent = <Browse 
          onLibraryScanned={handleSetLocalFiles} 
          onSelectMedia={handleSelectMedia}
          onAddToQueue={player.addToQueue}
          onAddToPlaylist={handleAddToPlaylist}
          playlists={playlists}
          requestConfirmation={requestConfirmation}
        />;
        break;
    }
    return mainContentWrapper(viewContent);
  };

  const mainPaddingBottom = player.audioPlayerState !== 'hidden' 
    ? 'pb-44 lg:pb-28'
    : 'pb-24 lg:pb-8';
    
  const likedSongIds = playlists.find(p => p.id === LIKED_SONGS_PLAYLIST_ID)?.mediaIds || [];

  if (isLoading) {
    return <OpeningAnimation />;
  }

  return (
    <div className="text-gray-200 min-h-screen font-sans animate-fade-in-long">
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
      <main className={`pt-14 transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-24'} ${mainPaddingBottom}`}>
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