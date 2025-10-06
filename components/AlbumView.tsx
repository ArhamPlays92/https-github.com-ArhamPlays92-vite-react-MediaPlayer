

import React from 'react';
import { Album, MediaItem, Playlist } from '../types';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import Marquee from './Marquee';
import LibraryListItem from './LibraryListItem';

interface AlbumViewProps {
  album: Album;
  onBack: () => void;
  onSelectMedia: (media: MediaItem, queueContext: MediaItem[]) => void;
  playlists: Playlist[];
  onAddToPlaylist: (mediaId: number, playlistId: number) => void;
  onAddToQueue: (item: MediaItem) => void;
}

const AlbumView: React.FC<AlbumViewProps> = ({ 
    album, 
    onBack, 
    onSelectMedia, 
    playlists, 
    onAddToPlaylist, 
    onAddToQueue 
}) => {
    return (
        <div>
            <button 
                onClick={onBack} 
                className="mb-6 text-gray-400 hover:text-white transition-colors rounded flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 -ml-1 p-1"
            >
                <ChevronLeftIcon className="w-5 h-5" />
                <span>Back to Library</span>
            </button>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 mb-6">
                <img 
                    src={album.coverArt} 
                    alt={album.title} 
                    className="w-28 h-28 md:w-40 md:h-40 flex-shrink-0 rounded-lg shadow-lg border border-gray-800" 
                />
                <div className="text-center sm:text-left min-w-0">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider">Album</p>
                    <Marquee as="h1" text={album.title} className="text-3xl md:text-5xl font-bold text-white mt-1" />
                    <Marquee as="p" text={album.artist} className="text-gray-400 mt-2 text-lg" />
                </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              {album.items.map((item) => (
                <LibraryListItem 
                  key={item.id} 
                  item={item} 
                  onSelect={() => onSelectMedia(item, album.items)} 
                  playlists={playlists}
                  onAddToPlaylist={onAddToPlaylist}
                  onAddToQueue={onAddToQueue}
                />
              ))}
            </div>
        </div>
    );
};

export default AlbumView;