
import React from 'react';
import { Album } from '../types';
import Marquee from './Marquee';

interface AlbumCardProps {
    album: Album;
    onClick: () => void;
}

const AlbumCard: React.FC<AlbumCardProps> = ({ album, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="group relative rounded-lg focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black focus-within:ring-white cursor-pointer"
        >
            <div className="relative rounded-lg overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors shadow-lg">
                <img 
                    src={album.coverArt} 
                    alt={album.title} 
                    className="w-full aspect-square object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" 
                />
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-sm">
                    <div className="w-14 h-14 border-2 border-white/50 rounded-full flex items-center justify-center group-hover:border-white transition-colors">
                        <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"></path></svg>
                    </div>
                </div>
            </div>
            <div className="pt-4">
                <Marquee as="h3" text={album.title} className="text-base font-semibold text-gray-200 group-hover:text-white transition-colors" />
                <Marquee as="p" text={album.artist} className="text-sm text-gray-400" />
            </div>
        </div>
    );
};

export default AlbumCard;