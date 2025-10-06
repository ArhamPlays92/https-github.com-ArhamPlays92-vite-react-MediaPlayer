import React from 'react';
import { View } from '../types';
import BrowseIcon from './icons/BrowseIcon';
import AudioIcon from './icons/AudioIcon';
import VideoIcon from './icons/VideoIcon';
import PlaylistIcon from './icons/PlaylistIcon';
import MicIcon from './icons/MicIcon';

interface NavbarProps {
  currentView: View;
  setView: (view: View) => void;
  isExpanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  isExpanded: boolean;
}> = ({ label, isActive, onClick, icon, isExpanded }) => {
  const baseClasses = 'flex items-center w-full p-3 text-sm font-semibold transition-colors duration-200 rounded-lg overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50';
  
  const activeClasses = isActive 
    ? 'bg-white/10 text-white' 
    : 'text-gray-400 hover:bg-white/5 hover:text-white';
    
  const layoutClasses = isExpanded ? 'justify-start' : 'justify-center';

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${activeClasses} ${layoutClasses}`}
    >
      <div className="w-6 h-6 flex-shrink-0">{icon}</div>
      {isExpanded && <span className="ml-4 whitespace-nowrap">{label}</span>}
    </button>
  );
};

const Navbar: React.FC<NavbarProps> = ({ currentView, setView, isExpanded, onMouseEnter, onMouseLeave }) => {
  return (
    <aside 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`fixed top-20 left-0 h-[calc(100vh-5rem)] z-10 bg-black/50 backdrop-blur-lg border-r border-gray-800 hidden md:flex flex-col p-2 space-y-2 transition-all duration-300 ease-in-out ${isExpanded ? 'w-60' : 'w-20'}`}
    >
      <NavButton 
        label="Audio" 
        isActive={currentView === View.AUDIO} 
        onClick={() => setView(View.AUDIO)} 
        icon={<AudioIcon />}
        isExpanded={isExpanded}
      />
      <NavButton 
        label="Video" 
        isActive={currentView === View.VIDEO} 
        onClick={() => setView(View.VIDEO)}
        icon={<VideoIcon />}
        isExpanded={isExpanded}
      />
      <NavButton 
        label="Browse" 
        isActive={currentView === View.BROWSE} 
        onClick={() => setView(View.BROWSE)} 
        icon={<BrowseIcon />}
        isExpanded={isExpanded}
      />
       <NavButton 
        label="Playlists" 
        isActive={currentView === View.PLAYLIST} 
        onClick={() => setView(View.PLAYLIST)}
        icon={<PlaylistIcon />}
        isExpanded={isExpanded}
      />
      <NavButton 
        label="Transcribe" 
        isActive={currentView === View.TRANSCRIBE} 
        onClick={() => setView(View.TRANSCRIBE)}
        icon={<MicIcon />}
        isExpanded={isExpanded}
      />
    </aside>
  );
};

export default Navbar;