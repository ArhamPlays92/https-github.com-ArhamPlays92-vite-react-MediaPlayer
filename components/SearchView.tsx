

import React from 'react';
import { MediaItem, Playlist, MediaType } from '../types';
import LibraryListItem from './LibraryListItem';
import LibraryCard from './LibraryCard';
import PlaylistCard from './PlaylistCard';

interface SearchViewProps {
    searchQuery: string;
    allMedia: MediaItem[];
    playlists: Playlist[];
    onSelectMedia: (media: MediaItem, queueContext?: MediaItem[]) => void;
    onSelectPlaylist: (playlist: Playlist) => void;
    onAddToPlaylist: (mediaId: number, playlistId: number) => void;
    onRemoveLocalFile: (mediaId: number) => void;
}

const SearchView: React.FC<SearchViewProps> = ({
    searchQuery,
    allMedia,
    playlists: allPlaylists,
    onSelectMedia,
    onSelectPlaylist,
    onAddToPlaylist,
    onRemoveLocalFile
}) => {
    const lowerCaseQuery = searchQuery.toLowerCase();

    const audioResults = allMedia.filter(item =>
      item.type === MediaType.AUDIO &&
      (item.title.toLowerCase().includes(lowerCaseQuery) || item.artist.toLowerCase().includes(lowerCaseQuery))
    );
  
    const videoResults = allMedia.filter(item =>
      item.type === MediaType.VIDEO &&
      (item.title.toLowerCase().includes(lowerCaseQuery) || item.artist.toLowerCase().includes(lowerCaseQuery))
    );
  
    const playlistResults = allPlaylists.filter(item =>
      item.name.toLowerCase().includes(lowerCaseQuery)
    );

    const hasResults = audioResults.length > 0 || videoResults.length > 0 || playlistResults.length > 0;

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-200">Results for "{searchQuery}"</h2>

            {!hasResults && (
                <p className="text-gray-500">No results found.</p>
            )}

            {videoResults.length > 0 && (
                <section className="mb-10">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-300">Videos</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {videoResults.map(item => (
                            <LibraryCard
                                key={item.id}
                                item={item}
                                onSelect={() => onSelectMedia(item)}
                                playlists={allPlaylists}
                                onAddToPlaylist={onAddToPlaylist}
                                onRemoveLocalFile={onRemoveLocalFile}
                            />
                        ))}
                    </div>
                </section>
            )}

            {playlistResults.length > 0 && (
                <section className="mb-10">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-300">Playlists</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {playlistResults.map(playlist => (
                            <PlaylistCard
                                key={playlist.id}
                                playlist={playlist}
                                allMedia={allMedia}
                                onClick={() => onSelectPlaylist(playlist)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {audioResults.length > 0 && (
                <section className="mb-10">
                    <h3 className="text-2xl font-semibold mb-4 text-gray-300">Audio</h3>
                    <div className="flex flex-col space-y-1 max-w-3xl">
                        {audioResults.map(item => (
                            <LibraryListItem
                                key={item.id}
                                item={item}
                                onSelect={() => onSelectMedia(item, audioResults)}
                                playlists={allPlaylists}
                                onAddToPlaylist={onAddToPlaylist}
                                onRemoveLocalFile={onRemoveLocalFile}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
};

export default SearchView;
