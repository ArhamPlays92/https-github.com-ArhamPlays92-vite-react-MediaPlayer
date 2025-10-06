import React from 'react';
import { MediaItem, Playlist } from '../types';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import EditIcon from './icons/EditIcon';
import { LIKED_SONGS_PLAYLIST_ID } from '../constants';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface MediaItemMenuProps {
    item: MediaItem;
    playlists: Playlist[];
    onAddToPlaylist: (mediaId: number, playlistId: number) => void;
    onAddToQueue?: (item: MediaItem) => void;
    onClose: () => void;
    onRemoveFromPlaylist?: (mediaId: number, playlistId: number) => void;
    contextPlaylistId?: number;
    onRenameRequest?: () => void;
    onDeleteRequest?: () => void;
    onSelectRequest?: () => void;
}

const MediaItemMenu: React.FC<MediaItemMenuProps> = ({ 
    item, 
    playlists, 
    onAddToPlaylist, 
    onAddToQueue,
    onClose,
    onRemoveFromPlaylist,
    contextPlaylistId,
    onRenameRequest,
    onDeleteRequest,
    onSelectRequest
}) => {
    
    const handleSelectPlaylist = (playlistId: number) => {
        onAddToPlaylist(item.id, playlistId);
        onClose();
    };
    
    const handleRemoveFromPlaylist = (playlistId: number) => {
        if (onRemoveFromPlaylist) {
            onRemoveFromPlaylist(item.id, playlistId);
        }
        onClose();
    }
    
    const playlistsIn = playlists.filter(p => p.mediaIds.includes(item.id));
    const playlistsNotIn = playlists.filter(p => !p.mediaIds.includes(item.id) && p.id !== LIKED_SONGS_PLAYLIST_ID);

    // If we're inside a specific playlist view, simplify the menu
    if (contextPlaylistId && onRemoveFromPlaylist) {
        return (
            <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 rounded-md shadow-lg z-30">
                <div className="p-1">
                     {onAddToQueue && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddToQueue(item); onClose(); }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded flex items-center gap-3 focus:outline-none focus-visible:bg-white/30"
                        >
                            <PlusIcon className="w-4 h-4" />
                            Add to Queue
                        </button>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleRemoveFromPlaylist(contextPlaylistId); }}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/30 rounded flex items-center gap-3 focus:outline-none focus-visible:bg-red-500/40"
                    >
                        <TrashIcon className="w-4 h-4" />
                        Remove from this Playlist
                    </button>
                </div>
            </div>
        );
    }
    
    // Global menu view
    return (
        <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-800 rounded-md shadow-lg z-30">
            <div className="p-1 max-h-80 overflow-y-auto">
                {onAddToQueue && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToQueue(item); onClose(); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded flex items-center gap-3 focus:outline-none focus-visible:bg-white/30"
                    >
                        <PlusIcon className="w-4 h-4" />
                        Add to Queue
                    </button>
                )}

                {(onSelectRequest || onRenameRequest || onDeleteRequest) && <div className="h-px bg-white/10 my-1" />}

                {onSelectRequest && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onSelectRequest(); onClose(); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded flex items-center gap-3 focus:outline-none focus-visible:bg-white/30"
                    >
                        <CheckCircleIcon className="w-4 h-4" />
                        Select
                    </button>
                )}
                {onRenameRequest && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onRenameRequest(); onClose(); }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded flex items-center gap-3 focus:outline-none focus-visible:bg-white/30"
                    >
                        <EditIcon className="w-4 h-4" />
                        Rename
                    </button>
                )}
                {onDeleteRequest && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onDeleteRequest(); onClose(); }}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/30 rounded flex items-center gap-3 focus:outline-none focus-visible:bg-red-500/40"
                    >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                    </button>
                )}


                {playlistsIn.length > 0 && (
                    <>
                        <div className="h-px bg-white/10 my-1" />
                        <p className="px-3 py-2 text-xs font-semibold text-gray-300">In Playlists</p>
                        {playlistsIn.map(playlist => (
                            <div key={playlist.id} className="group/item flex justify-between items-center w-full text-left px-3 py-2 text-sm text-gray-200 rounded">
                                <span className="truncate">{playlist.name}</span>
                                {onRemoveFromPlaylist && 
                                    <button onClick={(e) => { e.stopPropagation(); handleRemoveFromPlaylist(playlist.id); }} className="opacity-0 group-hover/item:opacity-100 text-gray-300 hover:text-white rounded focus:outline-none focus-visible:bg-white/20" title="Remove">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                }
                            </div>
                        ))}
                    </>
                )}

                {playlistsNotIn.length > 0 && (
                    <>
                         <div className="h-px bg-white/10 my-1" />
                        <p className="px-3 py-2 text-xs font-semibold text-gray-300">Add to playlist</p>
                        {playlistsNotIn.map(playlist => (
                            <button
                                key={playlist.id}
                                onClick={(e) => { e.stopPropagation(); handleSelectPlaylist(playlist.id); }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded focus:outline-none focus-visible:bg-white/30"
                            >
                                {playlist.name}
                            </button>
                        ))}
                    </>
                )}
                
                {playlists.length <= 1 && playlistsNotIn.length === 0 && (
                     <>
                        <div className="h-px bg-white/10 my-1" />
                        <p className="px-3 py-2 text-sm text-gray-500">No other playlists yet.</p>
                     </>
                )}
            </div>
        </div>
    );
};

export default MediaItemMenu;