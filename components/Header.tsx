
import React, { useState } from 'react';
import SearchIcon from './icons/SearchIcon';
import CloseIcon from './icons/CloseIcon';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, isScrolled }) => {
  const [isMobileSearchActive, setMobileSearchActive] = useState(false);

  // The header should be opaque if scrolled OR if the mobile search is active for a better UI.
  const headerIsOpaque = isScrolled || isMobileSearchActive;

  const scrolledClasses = headerIsOpaque
    ? 'bg-black/50 backdrop-blur-lg border-b border-gray-800'
    : 'border-b border-transparent';

  return (
    <header className={`p-4 sticky w-full top-0 z-20 h-20 flex items-center transition-all duration-300 ${scrolledClasses}`}>
      <div className="container mx-auto flex justify-between items-center gap-4">
        {/* Title/Logo */}
        <div className={`flex items-center space-x-3 ${isMobileSearchActive ? 'hidden' : 'flex'}`}>
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path></svg>
          <h1 className="text-xl md:text-2xl font-bold text-gray-200 tracking-tight">Media Player</h1>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden sm:flex flex-1 justify-end">
          <div className="relative w-full max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-black/30 border border-gray-700 rounded-lg py-2 pl-10 pr-4 block w-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Mobile Search Experience */}
        <div className={`sm:hidden flex items-center ${isMobileSearchActive ? 'flex-1' : ''}`}>
          {isMobileSearchActive ? (
            <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="w-5 h-5 text-gray-500" />
                </div>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="bg-black/30 border border-gray-700 rounded-lg py-2 pl-10 pr-10 block w-full text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-transparent"
                    autoFocus
                />
                <button 
                  onClick={() => {setMobileSearchActive(false); onSearchChange('');}} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  aria-label="Close search"
                >
                  <CloseIcon className="w-5 h-5"/>
                </button>
            </div>
          ) : (
            <button 
              onClick={() => setMobileSearchActive(true)}
              className="p-2 text-gray-300 hover:text-white"
              aria-label="Open search"
            >
              <SearchIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
