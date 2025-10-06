
import React from 'react';
import { Artist, Album } from '../types';
import AlbumCard from './AlbumCard';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import Marquee from './Marquee';

interface ArtistViewProps {
  artist: Artist;
  onBack: () => void;
  onSelectAlbum: (album: Album) => void;
}

const ArtistView: React.FC<ArtistViewProps> = ({ artist, onBack, onSelectAlbum }) => {
    return (
        <div>
            <button 
                onClick={onBack} 
                className="mb-6 text-gray-400 hover:text-white transition-colors rounded flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 -ml-1 p-1"
            >
                <ChevronLeftIcon className="w-5 h-5" />
                <span>Back to Library</span>
            </button>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
                <img 
                    src={artist.coverArt} 
                    alt={artist.name} 
                    className="w-32 h-32 md:w-48 md:h-48 flex-shrink-0 rounded-full shadow-lg border-2 border-gray-800" 
                />
                <div className="text-center sm:text-left min-w-0">
                    <p className="text-sm font-bold text-gray-300 uppercase tracking-wider">Artist</p>
                    <Marquee as="h1" text={artist.name} className="text-3xl md:text-5xl font-bold text-white mt-1" />
                </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-6 text-gray-200">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {artist.albums.map(album => (
                    <AlbumCard key={album.id} album={album} onClick={() => onSelectAlbum(album)} />
                ))}
            </div>
        </div>
    );
};

export default ArtistView;