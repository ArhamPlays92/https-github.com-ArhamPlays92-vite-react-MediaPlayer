

import React, { useState, useRef, useEffect } from 'react';
import { MediaItem, Playlist } from '../types';
import MoreVerticalIcon from './icons/MoreVerticalIcon';
import MediaItemMenu from './MediaItemMenu';
import Marquee from './Marquee';
import SelectionCheckbox from './SelectionCheckbox';

interface LibraryListItemProps {
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

const LibraryListItem: React.FC<LibraryListItemProps> = ({ 
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
            className={`flex items-center p-1.5 rounded-lg group transition-colors duration-200 cursor-pointer ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
            onClick={onSelect}
        >
            {isSelectionMode && (
                <div className="mr-3 flex-shrink-0 pointer-events-none">
                    <SelectionCheckbox isSelected={!!isSelected} />
                </div>
            )}
            <div
                className="flex items-center flex-grow min-w-0"
            >
                <div className="relative w-10 h-10 flex-shrink-0 mr-3 rounded overflow-hidden">
                    <img
                        src={item.coverArt}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex-grow min-w-0">
                    <Marquee as="h3" text={item.title} className="text-base font-semibold text-gray-200 group-hover:text-white transition-colors" />
                    <Marquee as="p" text={item.artist} className="text-sm text-gray-400" />
                </div>
            </div>

            <div className="relative ml-auto pl-2" ref={menuRef}>
                {!isSelectionMode && <button 
                    onClick={handleMenuToggle} 
                    className="p-1.5 rounded-full opacity-70 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="More options"
                >
                    <MoreVerticalIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />
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

export default LibraryListItem;