import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, Playlist } from '../types';
import MoreVerticalIcon from './icons/MoreVerticalIcon';
import MediaItemMenu from './MediaItemMenu';

interface LibraryCardProps {
    item: MediaItem;
    onSelect: () => void;
    playlists: Playlist[];
    onAddToPlaylist: (mediaId: number, playlistId: number) => void;
    onAddToQueue?: (item: MediaItem) => void;
    onRemoveLocalFile?: (mediaId: number) => void;
    onRemoveFromPlaylist?: (mediaId: number, playlistId: number) => void;
    contextPlaylistId?: number;
}

const LibraryCard: React.FC<LibraryCardProps> = ({ item, onSelect, playlists, onAddToPlaylist, onAddToQueue, onRemoveLocalFile, onRemoveFromPlaylist, contextPlaylistId }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);
    
    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(prev => !prev);
    };

    return (
        <div className="group relative rounded-lg focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black focus-within:ring-white">
            <div 
                className="cursor-pointer"
                onClick={onSelect}
            >
                <div className="relative rounded-lg overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors shadow-lg">
                    <img 
                        src={item.coverArt} 
                        alt={item.title} 
                        className="w-full h-48 object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-sm">
                        <div className="w-14 h-14 border-2 border-white/50 rounded-full flex items-center justify-center group-hover:border-white transition-colors">
                            <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
                        </div>
                    </div>
                </div>
                
                <div className="pt-4">
                    <h3 className="text-base font-semibold truncate text-gray-200 group-hover:text-white transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.artist}</p>
                </div>
            </div>

            <div className="absolute top-2 right-2" ref={menuRef}>
                 <button 
                    onClick={handleMenuToggle} 
                    className="p-1.5 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="More options"
                >
                    <MoreVerticalIcon className="w-5 h-5 text-white" />
                </button>

                {menuOpen && (
                    <MediaItemMenu
                        item={item}
                        playlists={playlists}
                        onAddToPlaylist={onAddToPlaylist}
                        onAddToQueue={onAddToQueue}
                        onClose={() => setMenuOpen(false)}
                        onRemoveFromPlaylist={onRemoveFromPlaylist}
                        onRemoveLocalFile={onRemoveLocalFile}
                        contextPlaylistId={contextPlaylistId}
                    />
                )}
            </div>
        </div>
    );
};

export default LibraryCard;