import React, { useState, useEffect } from 'react';
import { MediaItem, Playlist } from '../types';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';
import { LIKED_SONGS_PLAYLIST_ID } from '../constants';
import { MEDIA_FILES } from '../constants'; // To get cover arts

interface AddToPlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    media: MediaItem;
    playlists: Playlist[];
    onAddToPlaylist: (mediaId: number, playlistId: number) => void;
    onCreatePlaylist: (name: string, mediaId?: number) => void;
}

const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
    isOpen,
    onClose,
    media,
    playlists,
    onAddToPlaylist,
    onCreatePlaylist
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    useEffect(() => {
        if (!isOpen) {
            // Reset state when modal closes
            setTimeout(() => {
                setIsCreating(false);
                setNewPlaylistName('');
            }, 300); // Delay to allow animation
        }
    }, [isOpen]);


    if (!isOpen) return null;

    const handleCreatePlaylist = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlaylistName.trim()) {
            onCreatePlaylist(newPlaylistName.trim(), media.id);
            onClose();
        }
    };
    
    const handleSelectPlaylist = (playlistId: number) => {
        onAddToPlaylist(media.id, playlistId);
        onClose();
    }

    const availablePlaylists = playlists.filter(p => p.id !== LIKED_SONGS_PLAYLIST_ID && !p.mediaIds.includes(media.id));
    
    const findCoverArt = (playlist: Playlist) => {
        const firstMediaId = playlist.mediaIds[0];
        if (!firstMediaId) return `https://picsum.photos/seed/${playlist.id}/80`;
        const mediaItem = MEDIA_FILES.find(m => m.id === firstMediaId);
        return mediaItem ? mediaItem.coverArt : `https://picsum.photos/seed/${playlist.id}/80`;
    }

    return (
        <div className="fixed inset-0 z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="add-to-playlist-heading">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            
            <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-xl border-t border-white/10 rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up-fade-in">
                <header className="p-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
                    <h3 id="add-to-playlist-heading" className="text-xl font-bold text-gray-200 tracking-tight">
                        {isCreating ? 'Create New Playlist' : 'Add to Playlist'}
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80" aria-label="Close">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>

                {isCreating ? (
                    <form onSubmit={handleCreatePlaylist} className="p-4 flex flex-col gap-4">
                         <input
                            type="text"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            placeholder="Playlist Name"
                            className="w-full bg-black/30 border border-gray-700 rounded-lg py-3 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-transparent transition-all"
                            autoFocus
                         />
                         <div className="flex justify-end gap-2">
                             <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 font-semibold text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-gray-500">Cancel</button>
                             <button type="submit" className="px-4 py-2 font-semibold text-black bg-white rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-white">Create & Add</button>
                         </div>
                    </form>
                ) : (
                    <>
                        <div className="overflow-y-auto flex-grow p-2">
                            <button
                                onClick={() => setIsCreating(true)}
                                className="w-full flex items-center p-3 rounded-lg gap-3 hover:bg-white/5 transition-colors focus:outline-none focus-visible:bg-white/10"
                            >
                                <div className="w-12 h-12 rounded bg-gray-800 flex items-center justify-center flex-shrink-0">
                                    <PlusIcon className="w-6 h-6 text-gray-300" />
                                </div>
                                <div className="flex-grow min-w-0 text-left">
                                    <p className="font-semibold text-gray-200">New Playlist</p>
                                </div>
                            </button>
                            {availablePlaylists.map(playlist => {
                                return (
                                    <button
                                        key={playlist.id}
                                        onClick={() => handleSelectPlaylist(playlist.id)}
                                        className="w-full flex items-center p-3 rounded-lg gap-3 hover:bg-white/5 transition-colors focus:outline-none focus-visible:bg-white/10"
                                    >
                                        <img src={findCoverArt(playlist)} alt={playlist.name} className="w-12 h-12 rounded object-cover flex-shrink-0 bg-gray-800" />
                                        <div className="flex-grow min-w-0 text-left">
                                            <p className="font-semibold truncate text-gray-200">{playlist.name}</p>
                                            <p className="text-sm text-gray-400 truncate">{playlist.mediaIds.length} items</p>
                                        </div>
                                    </button>
                                )
                            })}
                            {availablePlaylists.length === 0 && (
                                <p className="text-gray-500 text-center p-4 mt-4">All playlists already contain this song.</p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default AddToPlaylistModal;
