
import React from 'react';
import { MediaItem, LibraryViewMode, Playlist } from '../types';
import LibraryCard from './LibraryCard';
import LibraryListItem from './LibraryListItem';
import ViewModeToggle from './ViewModeToggle';

interface LibraryProps {
  mediaFiles: MediaItem[];
  onSelectMedia: (media: MediaItem, queueContext: MediaItem[]) => void;
  title: string;
  viewMode: LibraryViewMode;
  setViewMode: (mode: LibraryViewMode) => void;
  playlists: Playlist[];
  onAddToPlaylist: (mediaId: number, playlistId: number) => void;
  onAddToQueue?: (item: MediaItem) => void;
  onRemoveLocalFile?: (mediaId: number) => void;
  onRemoveFromPlaylist?: (mediaId: number, playlistId: number) => void;
  playlistContextId?: number;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

const Library: React.FC<LibraryProps> = ({ 
  mediaFiles, 
  onSelectMedia, 
  title, 
  viewMode, 
  setViewMode, 
  playlists, 
  onAddToPlaylist,
  onAddToQueue,
  onRemoveLocalFile,
  onRemoveFromPlaylist,
  playlistContextId,
  selectedCategory,
  onSelectCategory,
}) => {
  const categories = onSelectCategory ? ['All', ...Array.from(new Set(mediaFiles.flatMap(item => item.category ? [item.category] : [])))] : [];

  const filteredMedia = selectedCategory && selectedCategory !== 'All' 
    ? mediaFiles.filter(item => item.category === selectedCategory) 
    : mediaFiles;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-200">{title}</h2>
        {/* View toggle is now exclusive to mobile */}
        <div className="md:hidden">
          <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>

      {onSelectCategory && categories.length > 1 && (
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {filteredMedia.length === 0 ? (
        <p className="text-gray-500">
          {selectedCategory && selectedCategory !== 'All' 
              ? `No items in the "${selectedCategory}" category.` 
              : 'This collection is empty.'
          }
        </p>
      ) : (
        <>
        {/* Mobile view (respects toggle) */}
        <div className="md:hidden">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredMedia.map((item) => (
                <LibraryCard 
                  key={item.id} 
                  item={item} 
                  onSelect={() => onSelectMedia(item, filteredMedia)} 
                  playlists={playlists}
                  onAddToPlaylist={onAddToPlaylist}
                  onAddToQueue={onAddToQueue}
                  onRemoveLocalFile={onRemoveLocalFile}
                  onRemoveFromPlaylist={onRemoveFromPlaylist}
                  contextPlaylistId={playlistContextId}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col space-y-1">
              {filteredMedia.map((item) => (
                <LibraryListItem 
                  key={item.id} 
                  item={item} 
                  onSelect={() => onSelectMedia(item, filteredMedia)} 
                  playlists={playlists}
                  onAddToPlaylist={onAddToPlaylist}
                  onAddToQueue={onAddToQueue}
                  onRemoveLocalFile={onRemoveLocalFile}
                  onRemoveFromPlaylist={onRemoveFromPlaylist}
                  contextPlaylistId={playlistContextId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Desktop view (always grid) */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMedia.map((item) => (
            <LibraryCard 
              key={item.id} 
              item={item} 
              onSelect={() => onSelectMedia(item, filteredMedia)} 
              playlists={playlists}
              onAddToPlaylist={onAddToPlaylist}
              onAddToQueue={onAddToQueue}
              onRemoveLocalFile={onRemoveLocalFile}
              onRemoveFromPlaylist={onRemoveFromPlaylist}
              contextPlaylistId={playlistContextId}
            />
          ))}
        </div>
        </>
      )}
    </div>
  );
};

export default Library;