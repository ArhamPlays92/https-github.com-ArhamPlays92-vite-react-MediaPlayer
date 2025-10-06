

import React, { useState, useRef, useEffect } from 'react';
import { Playlist, MediaItem } from '../types';
import MoreVerticalIcon from './icons/MoreVerticalIcon';
import PlaylistMenu from './PlaylistMenu';
import Marquee from './Marquee';

interface PlaylistCardProps {
    playlist: Playlist;
    allMedia: MediaItem[];
    onClick: () => void;
    onDelete?: () => void;
    onRename?: (newName: string) => void;
    isRenaming?: boolean;
    onSetRenaming?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, allMedia, onClick, onDelete, onRename, isRenaming, onSetRenaming }) => {
    const [name, setName] = useState(playlist.name);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    useEffect(() => {
        if(isRenaming) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [isRenaming]);

    useEffect(() => {
        setName(playlist.name);
    }, [playlist.name]);

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMenuOpen(prev => !prev);
    };

    const handleRenameSubmit = () => {
        if (onRename && name.trim() && name.trim() !== playlist.name) {
            onRename(name.trim());
        } else {
            setName(playlist.name); // Revert if empty or unchanged
        }
    };
    
    const coverArts = playlist.mediaIds
        .map(id => allMedia.find(media => media.id === id)?.coverArt)
        .filter((art): art is string => !!art)
        .slice(0, 4);
    
    const filledArts = [...coverArts, ...Array(4 - coverArts.length).fill(null)];

    return (
        <div className="group relative rounded-lg focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black focus-within:ring-white">
            <div onClick={isRenaming ? undefined : onClick} className="cursor-pointer">
                <div className="relative aspect-square w-full bg-gray-800 rounded-lg overflow-hidden border border-gray-800 group-hover:border-white/30 transition-colors">
                    {coverArts.length > 0 ? (
                        <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                            {filledArts.map((art, i) => (
                                <div key={i} className="bg-gray-900">
                                    {art && <img src={art} alt="" className="w-full h-full object-cover"/>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <svg className="w-1/3 h-1/3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
                        </div>
                    )}
                </div>
                <div className="pt-3">
                    {isRenaming && onRename ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onBlur={handleRenameSubmit}
                            onKeyDown={e => { if (e.key === 'Enter') inputRef.current?.blur() }}
                            className="w-full bg-gray-800 text-base font-semibold text-white rounded px-1 -m-1 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                    ) : (
                        <Marquee as="h3" text={playlist.name} className="text-base font-semibold text-gray-200 group-hover:text-white" />
                    )}
                    <p className="text-sm text-gray-400">{playlist.mediaIds.length} items</p>
                </div>
            </div>
            
            {onDelete && onRename && onSetRenaming && (
                <div className="absolute top-2 right-2" ref={menuRef}>
                    <button 
                        onClick={handleMenuToggle} 
                        className="p-1.5 bg-black/50 rounded-full opacity-70 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        aria-label="Playlist options"
                    >
                        <MoreVerticalIcon className="w-5 h-5 text-white" />
                    </button>
                    {menuOpen && (
                        <PlaylistMenu
                            onClose={() => setMenuOpen(false)}
                            onDelete={onDelete}
                            onRename={() => {
                                if(onSetRenaming) {
                                    setMenuOpen(false);
                                    onSetRenaming();
                                }
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default PlaylistCard;