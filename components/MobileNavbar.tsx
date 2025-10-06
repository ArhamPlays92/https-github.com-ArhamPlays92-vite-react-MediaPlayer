import React from 'react';
import { View } from '../types';
import BrowseIcon from './icons/BrowseIcon';
import AudioIcon from './icons/AudioIcon';
import VideoIcon from './icons/VideoIcon';
import PlaylistIcon from './icons/PlaylistIcon';

interface MobileNavbarProps {
  currentView: View;
  setView: (view: View) => void;
}

const MobileNavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}> = ({ label, isActive, onClick, icon }) => {
  const activeClasses = isActive ? 'text-white' : 'text-gray-400';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 hover:text-white ${activeClasses} focus:outline-none focus-visible:bg-white/10 rounded-lg`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const MobileNavbar: React.FC<MobileNavbarProps> = ({ currentView, setView }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 z-20 bg-black/75 backdrop-blur-xl border-t border-white/10 flex justify-around items-center lg:hidden">
      <MobileNavButton
        label="Audio"
        isActive={currentView === View.AUDIO}
        onClick={() => setView(View.AUDIO)}
        icon={<AudioIcon />}
      />
      <MobileNavButton
        label="Video"
        isActive={currentView === View.VIDEO}
        onClick={() => setView(View.VIDEO)}
        icon={<VideoIcon />}
      />
      <MobileNavButton
        label="Browse"
        isActive={currentView === View.BROWSE}
        onClick={() => setView(View.BROWSE)}
        icon={<BrowseIcon />}
      />
       <MobileNavButton
        label="Playlists"
        isActive={currentView === View.PLAYLIST}
        onClick={() => setView(View.PLAYLIST)}
        icon={<PlaylistIcon />}
      />
    </nav>
  );
};

export default MobileNavbar;