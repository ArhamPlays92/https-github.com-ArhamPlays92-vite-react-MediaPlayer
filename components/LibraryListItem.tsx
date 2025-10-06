import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, Playlist } from '../types';
import PlayIcon from './icons/PlayIcon';
import MoreVerticalIcon from './icons/MoreVerticalIcon';
import MediaItemMenu from './MediaItemMenu';

interface LibraryListItemProps {
    item: MediaItem;
    onSelect: () => void;
    playlists: Playlist[];
    onAddToPlaylist: (mediaId: number, playlistId: number) => void;
    onRemoveLocalFile?: (mediaId: number) => void;
    onRemoveFromPlaylist?: (mediaId: number, playlistId: number) => void;
    contextPlaylistId?: number;
}

const LibraryListItem: React.FC<LibraryListItemProps> = ({ item, onSelect, playlists, onAddToPlaylist, onRemoveLocalFile, onRemoveFromPlaylist, contextPlaylistId }) => {
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
        <div
            className="flex items-center p-2 rounded-lg group hover:bg-white/5 transition-colors duration-200 focus-within:ring-1 focus-within:ring-white/50"
        >
            <div
                className="flex items-center flex-grow min-w-0 cursor-pointer"
                onClick={onSelect}
            >
                <div className="relative w-12 h-12 flex-shrink-0 mr-4 rounded overflow-hidden">
                    <img
                        src={item.coverArt}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60">
                        <PlayIcon size={20} />
                    </div>
                </div>
                <div className="flex-grow min-w-0">
                    <h3 className="text-base font-semibold truncate text-gray-200 group-hover:text-white transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-400 truncate">{item.artist}</p>
                </div>
            </div>

            <div className="relative ml-auto pl-2" ref={menuRef}>
                <button 
                    onClick={handleMenuToggle} 
                    className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="More options"
                >
                    <MoreVerticalIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </button>
                {menuOpen && (
                    <MediaItemMenu 
                        item={item}
                        playlists={playlists}
                        onAddToPlaylist={onAddToPlaylist}
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

export default LibraryListItem;