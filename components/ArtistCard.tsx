
import React from 'react';
import { Artist } from '../types';
import Marquee from './Marquee';

interface ArtistCardProps {
    artist: Artist;
    onClick: () => void;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, onClick }) => {
    return (
        <div 
            onClick={onClick}
            className="group flex flex-col items-center text-center p-2 rounded-lg focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-black focus-within:ring-white cursor-pointer"
        >
            <div className="relative rounded-full overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors shadow-lg w-full aspect-square">
                <img 
                    src={artist.coverArt} 
                    alt={artist.name} 
                    className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-105" 
                />
            </div>
            <div className="pt-4 w-full">
                <Marquee as="h3" text={artist.name} className="text-base font-semibold text-gray-200 group-hover:text-white transition-colors" />
            </div>
        </div>
    );
};

export default ArtistCard;