
import React from 'react';
import { Album, Artist } from '../types';
import AlbumCard from './AlbumCard';
import ArtistCard from './ArtistCard';

interface AudioLibraryProps {
    albums: Album[];
    artists: Artist[];
    onSelectAlbum: (album: Album) => void;
    onSelectArtist: (artist: Artist) => void;
}

const AudioLibrary: React.FC<AudioLibraryProps> = ({ albums, artists, onSelectAlbum, onSelectArtist }) => {
    return (
        <div className="space-y-12">
            <section>
                <h2 className="text-3xl font-bold mb-6 text-gray-200">Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {albums.map(album => (
                        <AlbumCard key={album.id} album={album} onClick={() => onSelectAlbum(album)} />
                    ))}
                </div>
            </section>
            
            <section>
                <h2 className="text-3xl font-bold mb-6 text-gray-200">Artists</h2>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {artists.map(artist => (
                        <ArtistCard key={artist.id} artist={artist} onClick={() => onSelectArtist(artist)} />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default AudioLibrary;