



import React from 'react';
import { MediaItem, Album, Artist, LibrarySubView, MediaType, LibraryViewMode, Playlist } from '../types';
import Library from './Library';
import AlbumCard from './AlbumCard';
import ArtistCard from './ArtistCard';

interface TabButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ label, isActive, onClick }) => {
  return (
      <button
          onClick={onClick}
          className={`px-4 py-3 text-base font-semibold transition-colors whitespace-nowrap border-b-2 ${
              isActive
              ? 'text-white border-white'
              : 'text-gray-500 border-transparent hover:text-gray-200 hover:border-gray-500'
          }`}
          role="tab"
          aria-selected={isActive}
      >
          {label}
      </button>
  );
};

interface MediaLibraryViewProps {
  mediaType: MediaType;
  allMediaForType: MediaItem[];
  albums: Album[];
  artists: Artist[];
  activeSubView: LibrarySubView;
  onSetSubView: (view: LibrarySubView) => void;
  onSelectAlbum: (album: Album) => void;
  onSelectArtist: (artist: Artist) => void;
  onSelectMedia: (media: MediaItem, queueContext: MediaItem[]) => void;
  viewMode: LibraryViewMode;
  setViewMode: (mode: LibraryViewMode) => void;
  playlists: Playlist[];
  onAddToPlaylist: (mediaId: number, playlistId: number) => void;
  onAddToQueue?: (item: MediaItem) => void;
}

const MediaLibraryView: React.FC<MediaLibraryViewProps> = ({
  mediaType,
  allMediaForType,
  albums,
  artists,
  activeSubView,
  onSetSubView,
  onSelectAlbum,
  onSelectArtist,
  onSelectMedia,
  viewMode,
  setViewMode,
  playlists,
  onAddToPlaylist,
  onAddToQueue,
}) => {
  
  const renderContent = () => {
      switch(activeSubView) {
          case 'albums':
              return (
                  albums.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {albums.map(album => (
                            <AlbumCard key={album.id} album={album} onClick={() => onSelectAlbum(album)} />
                        ))}
                    </div>
                  ) : <p className="text-gray-500">No albums found in your library.</p>
              );
          case 'artists':
              return (
                   artists.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                       {artists.map(artist => (
                           <ArtistCard key={artist.id} artist={artist} onClick={() => onSelectArtist(artist)} />
                       ))}
                   </div>
                   ) : <p className="text-gray-500">No artists found in your library.</p>
              );
          case 'all':
          default:
              return (
                  <Library 
                      title={mediaType === MediaType.AUDIO ? "All Audio" : "All Videos"}
                      mediaFiles={allMediaForType} 
                      onSelectMedia={onSelectMedia} 
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                      playlists={playlists}
                      onAddToPlaylist={onAddToPlaylist}
                      onAddToQueue={onAddToQueue}
                  />
              );
      }
  };

  return (
      <div>
          <div className="flex items-center space-x-2 border-b border-gray-800 px-4" role="tablist" aria-label="Library view">
              <TabButton label="All" isActive={activeSubView === 'all'} onClick={() => onSetSubView('all')} />
              <TabButton label="Albums" isActive={activeSubView === 'albums'} onClick={() => onSetSubView('albums')} />
              <TabButton label="Artists" isActive={activeSubView === 'artists'} onClick={() => onSetSubView('artists')} />
          </div>
          <div role="tabpanel" className="px-4 pt-4">
            {renderContent()}
          </div>
      </div>
  );
};

export default MediaLibraryView;