

import React, { useState, useRef, useEffect } from 'react';
import { Playlist, MediaItem, LibraryViewMode } from '../types';
import Library from './Library';
import PlusIcon from './icons/PlusIcon';
import PlaylistCard from './PlaylistCard';
import ChevronLeftIcon from './icons/ChevronLeftIcon';

interface PlaylistsProps {
  playlists: Playlist[];
  onCreatePlaylist: (name: string) => void;
  onDeletePlaylist: (id: number) => void;
  onRenamePlaylist: (id: number, newName: string) => void;
  allMedia: MediaItem[];
  onSelectMedia: (media: MediaItem, queueContext?: MediaItem[]) => void;
  viewMode: LibraryViewMode;
  setViewMode: (mode: LibraryViewMode) => void;
  onAddToPlaylist: (mediaId: number, playlistId: number) => void;
  onAddToQueue?: (item: MediaItem) => void;
  onRemoveFromPlaylist: (mediaId: number, playlistId: number) => void;
  onRemoveLocalFile: (mediaId: number) => void;
  initialSelectedPlaylist: Playlist | null;
  onBackToPlaylists: () => void;
}

const CreatePlaylistCard: React.FC<{ onCreate: (name: string) => void }> = ({ onCreate }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreate(name.trim());
            setName('');
            setIsCreating(false);
        }
    };

    if (isCreating) {
        return (
            <form onSubmit={handleSubmit} className="aspect-square w-full flex flex-col justify-between bg-black/50 backdrop-blur-lg border-2 border-dashed border-white/20 rounded-lg p-4">
                 <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Playlist Name"
                    className="w-full bg-transparent text-white text-center focus:outline-none placeholder-gray-400 focus-visible:ring-1 focus-visible:ring-white rounded"
                    autoFocus
                    onBlur={() => { if(!name.trim()) setIsCreating(false)}}
                 />
                 <button type="submit" className="bg-white text-black font-semibold py-2 px-4 rounded-md text-sm hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-black">Create</button>
            </form>
        )
    }

    return (
         <div 
            onClick={() => setIsCreating(true)} 
            onKeyDown={(e) => {if(e.key === 'Enter' || e.key === ' ') setIsCreating(true)}}
            tabIndex={0}
            className="cursor-pointer group aspect-square w-full flex flex-col items-center justify-center bg-black/50 backdrop-blur-lg border-2 border-dashed border-white/20 rounded-lg hover:border-white/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-black focus-visible:ring-white/70"
        >
            <PlusIcon className="w-8 h-8 text-gray-400 mb-2 group-hover:text-white transition-colors" />
            <span className="text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">Create New Playlist</span>
        </div>
    );
};

const Playlists: React.FC<PlaylistsProps> = ({ 
    playlists, 
    onCreatePlaylist, 
    onDeletePlaylist, 
    onRenamePlaylist, 
    allMedia, 
    onSelectMedia, 
    viewMode, 
    setViewMode, 
    onAddToPlaylist,
    onAddToQueue,
    onRemoveFromPlaylist,
    onRemoveLocalFile,
    initialSelectedPlaylist,
    onBackToPlaylists
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(initialSelectedPlaylist || null);
  const [renamingPlaylistId, setRenamingPlaylistId] = useState<number | null>(null);

  useEffect(() => {
    setSelectedPlaylist(initialSelectedPlaylist || null);
  }, [initialSelectedPlaylist]);

  const handleBack = () => {
    setSelectedPlaylist(null);
    onBackToPlaylists();
  }

  if (selectedPlaylist) {
    const playlistMedia = allMedia.filter(media => selectedPlaylist.mediaIds.includes(media.id));
    const coverArts = playlistMedia.map(m => m.coverArt).slice(0, 4);
    const filledArts = [...coverArts, ...Array(4 - coverArts.length).fill(null)];

    return (
      <div>
        <button onClick={handleBack} className="mb-6 text-gray-400 hover:text-white transition-colors rounded flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 -ml-1 p-1">
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Back to Playlists</span>
        </button>
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
            <div className="relative aspect-square w-32 md:w-48 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-800">
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
                        <svg className="w-1/2 h-1/2 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
                    </div>
                )}
            </div>
            <div className="text-center sm:text-left">
                 <h1 className="text-3xl md:text-5xl font-bold text-white">{selectedPlaylist.name}</h1>
                 <p className="text-gray-400 mt-2">{playlistMedia.length} items</p>
            </div>
        </div>
        <Library
          title="Tracks"
          mediaFiles={playlistMedia}
          onSelectMedia={onSelectMedia as (media: MediaItem, queueContext: MediaItem[]) => void}
          viewMode={viewMode}
          setViewMode={setViewMode}
          playlists={playlists}
          onAddToPlaylist={onAddToPlaylist}
          onAddToQueue={onAddToQueue}
          onRemoveLocalFile={onRemoveLocalFile}
          onRemoveFromPlaylist={(mediaId: number) => onRemoveFromPlaylist(mediaId, selectedPlaylist.id)}
          playlistContextId={selectedPlaylist.id}
        />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-200">Playlists</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <CreatePlaylistCard onCreate={onCreatePlaylist} />
        {playlists.map(playlist => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            allMedia={allMedia}
            onClick={() => setSelectedPlaylist(playlist)}
            onDelete={() => onDeletePlaylist(playlist.id)}
            onRename={(newName: string) => {
              onRenamePlaylist(playlist.id, newName);
              setRenamingPlaylistId(null);
            }}
            isRenaming={renamingPlaylistId === playlist.id}
            onSetRenaming={() => setRenamingPlaylistId(playlist.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Playlists;