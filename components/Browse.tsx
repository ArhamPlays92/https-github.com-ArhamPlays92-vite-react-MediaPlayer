

import React, { useRef } from 'react';
import { MediaItem, MediaType, LibraryViewMode, Playlist } from '../types';
import FileUploadIcon from './icons/FileUploadIcon';
import LibraryCard from './LibraryCard';
import LibraryListItem from './LibraryListItem';
import ViewModeToggle from './ViewModeToggle';

interface BrowseProps {
  onFilesAdded: (newFiles: MediaItem[]) => void;
  localMediaFiles: MediaItem[];
  onSelectMedia: (media: MediaItem, queueContext?: MediaItem[]) => void;
  viewMode: LibraryViewMode;
  setViewMode: (mode: LibraryViewMode) => void;
  playlists: Playlist[];
  onAddToPlaylist: (mediaId: number, playlistId: number) => void;
  onRemoveLocalFile: (mediaId: number) => void;
  onRemoveFromPlaylist: (mediaId: number, playlistId: number) => void;
}

const Browse: React.FC<BrowseProps> = ({ onFilesAdded, localMediaFiles, onSelectMedia, viewMode, setViewMode, playlists, onAddToPlaylist, onRemoveLocalFile, onRemoveFromPlaylist }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newMediaItems: MediaItem[] = Array.from(files).map((file, index) => {
      const isAudio = file.type.startsWith('audio/');
      const isVideo = file.type.startsWith('video/');

      if (!isAudio && !isVideo) {
        return null;
      }
      
      return {
        id: Date.now() + index, // Simple unique ID
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        artist: 'Local File',
        type: isAudio ? MediaType.AUDIO : MediaType.VIDEO,
        src: URL.createObjectURL(file),
        coverArt: `https://picsum.photos/seed/${Date.now() + index}/400`, // Generic placeholder
      };
    }).filter((item): item is MediaItem => item !== null);

    if (newMediaItems.length > 0) {
        onFilesAdded(newMediaItems);
    }

    // Reset file input to allow selecting the same file again
    if(inputRef.current) {
        inputRef.current.value = "";
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-200">Add to Library</h2>
        <div 
          className="bg-black/50 backdrop-blur-lg rounded-lg p-8 flex flex-col items-center justify-center border-2 border-dashed border-white/20 hover:border-white/40 hover:bg-black/70 transition-colors duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:ring-white"
          onClick={handleClick}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick() }}
          tabIndex={0}
          role="button"
          aria-label="Select files to add to library"
        >
          <FileUploadIcon className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-300 mb-4 text-center">Select audio and video files from your device.</p>
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            multiple
            accept="audio/*,video/*"
            className="hidden"
          />
          <button
            className="bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-300 pointer-events-none"
          >
              Select Files
          </button>
        </div>
      </div>
      
      {localMediaFiles.length > 0 && (
        <div>
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-200">Your Added Files</h2>
            {/* View toggle is now exclusive to mobile */}
            <div className="md:hidden">
              <ViewModeToggle viewMode={viewMode} setViewMode={setViewMode} />
            </div>
          </div>
          
          <>
            {/* Mobile view (respects toggle) */}
            <div className="md:hidden">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {localMediaFiles.map((item) => (
                    <LibraryCard 
                      key={item.id} 
                      item={item} 
                      onSelect={() => onSelectMedia(item, localMediaFiles)} 
                      playlists={playlists}
                      onAddToPlaylist={onAddToPlaylist}
                      onRemoveLocalFile={onRemoveLocalFile}
                      onRemoveFromPlaylist={onRemoveFromPlaylist}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  {localMediaFiles.map((item) => (
                    <LibraryListItem 
                      key={item.id} 
                      item={item} 
                      onSelect={() => onSelectMedia(item, localMediaFiles)} 
                      playlists={playlists}
                      onAddToPlaylist={onAddToPlaylist}
                      onRemoveLocalFile={onRemoveLocalFile}
                      onRemoveFromPlaylist={onRemoveFromPlaylist}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop view (always grid) */}
            <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {localMediaFiles.map((item) => (
                <LibraryCard 
                  key={item.id} 
                  item={item} 
                  onSelect={() => onSelectMedia(item, localMediaFiles)} 
                  playlists={playlists}
                  onAddToPlaylist={onAddToPlaylist}
                  onRemoveLocalFile={onRemoveLocalFile}
                  onRemoveFromPlaylist={onRemoveFromPlaylist}
                />
              ))}
            </div>
          </>
        </div>
      )}
    </div>
  );
};

export default Browse;
