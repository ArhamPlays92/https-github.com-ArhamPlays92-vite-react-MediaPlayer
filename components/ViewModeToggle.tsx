import React from 'react';
import { LibraryViewMode } from '../types';
import GridIcon from './icons/GridIcon';
import ListIcon from './icons/ListIcon';

interface ViewModeToggleProps {
  viewMode: LibraryViewMode;
  setViewMode: (mode: LibraryViewMode) => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, setViewMode }) => {
  const baseButtonClasses = 'p-2 rounded-md transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50';
  const activeButtonClasses = 'bg-white/10 text-white';
  const inactiveButtonClasses = 'text-gray-500 hover:bg-white/5 hover:text-gray-300';

  return (
    <div className="flex items-center space-x-1 bg-gray-900/50 border border-gray-800 rounded-lg p-1">
      <button 
        onClick={() => setViewMode('list')}
        className={`${baseButtonClasses} ${viewMode === 'list' ? activeButtonClasses : inactiveButtonClasses}`}
        aria-label="List view"
        title="List view"
      >
        <ListIcon className="w-5 h-5" />
      </button>
      <button 
        onClick={() => setViewMode('grid')}
        className={`${baseButtonClasses} ${viewMode === 'grid' ? activeButtonClasses : inactiveButtonClasses}`}
        aria-label="Grid view"
        title="Grid view"
      >
        <GridIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ViewModeToggle;