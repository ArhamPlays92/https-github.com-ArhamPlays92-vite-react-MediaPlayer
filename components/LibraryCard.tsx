

import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, Playlist } from '../types';
import MoreVerticalIcon from './icons/MoreVerticalIcon';
import MediaItemMenu from './MediaItemMenu';
import Marquee from './Marquee';
import SelectionCheckbox from './SelectionCheckbox';

interface LibraryCardProps {
    item: MediaItem;
    onSelect: (e: React.MouseEvent) => void;
    playlists: Playlist[];
    onAddToPlaylist: (mediaId: number, playlistId: number) => void;
    onAddToQueue?: (item: MediaItem) => void;
    onRemoveFromPlaylist?: (mediaId: number, playlistId: number) => void;
    contextPlaylistId?: number;
    isSelected?: boolean;
    isSelectionMode?: boolean;
    onRenameRequest?: () => void;
    onDeleteRequest?: () => void;
    onSelectRequest?: () => void;
}

const LibraryCard: React.FC<LibraryCardProps> = ({ 
    item, 
    onSelect, 
    playlists, 
    onAddToPlaylist, 
    onAddToQueue, 
    onRemoveFromPlaylist, 
    contextPlaylistId, 
    isSelected,
    isSelectionMode,
    onRenameRequest,
    onDeleteRequest,
    onSelectRequest,
}) => {
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
            onClick={onSelect}
            className={`group relative rounded-lg p-2 transition-colors duration-200 cursor-pointer ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
        >
            {isSelectionMode && (
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <SelectionCheckbox isSelected={!!isSelected} />
                </div>
            )}
            <div className="relative rounded-lg overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors shadow-lg">
                <img 
                    src={item.coverArt} 
                    alt={item.title} 
                    className="w-full aspect-video sm:aspect-square object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" 
                />
            </div>
            
            <div className="pt-3">
                <Marquee as="h3" text={item.title} className="text-base font-semibold text-gray-200 group-hover:text-white transition-colors" />
                <Marquee as="p" text={item.artist} className="text-sm text-gray-400" />
            </div>

            <div className="absolute top-4 right-4" ref={menuRef}>
                 {!isSelectionMode && <button 
                    onClick={handleMenuToggle} 
                    className="p-1.5 bg-black/50 rounded-full opacity-70 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="More options"
                >
                    <MoreVerticalIcon className="w-5 h-5 text-white" />
                </button>}

                {menuOpen && (
                    <MediaItemMenu
                        item={item}
                        playlists={playlists}
                        onAddToPlaylist={onAddToPlaylist}
                        onAddToQueue={onAddToQueue}
                        onClose={() => setMenuOpen(false)}
                        onRemoveFromPlaylist={onRemoveFromPlaylist}
                        contextPlaylistId={contextPlaylistId}
                        onRenameRequest={onRenameRequest}
                        onDeleteRequest={onDeleteRequest}
                        onSelectRequest={onSelectRequest}
                    />
                )}
            </div>
        </div>
    );
};

export default LibraryCard;