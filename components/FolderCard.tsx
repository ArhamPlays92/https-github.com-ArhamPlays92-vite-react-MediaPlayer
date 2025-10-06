
import React, { useState, useRef, useEffect } from 'react';
import FolderIcon from './icons/FolderIcon';
import SelectionCheckbox from './SelectionCheckbox';
import MoreVerticalIcon from './icons/MoreVerticalIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface FolderCardProps {
  name: string;
  onClick: () => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onRenameRequest?: () => void;
  onDeleteRequest?: () => void;
  onSelectRequest?: () => void;
}

const FolderCard: React.FC<FolderCardProps> = ({ name, onClick, isSelectionMode, isSelected, onRenameRequest, onDeleteRequest, onSelectRequest }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
              setMenuOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);
  
  const handleMenuToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuOpen(prev => !prev);
  };

  return (
    <div
      onClick={onClick}
      className={`relative group flex flex-col items-center text-center p-2 rounded-lg transition-colors cursor-pointer ${isSelected ? 'bg-white/10' : 'hover:bg-white/5'}`}
    >
      {isSelectionMode && (
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <SelectionCheckbox isSelected={isSelected} />
        </div>
      )}
      <FolderIcon className="w-20 h-20 text-gray-500 group-hover:text-gray-400" />
      <p className="text-sm font-semibold text-gray-200 mt-2 truncate w-full">{name}</p>

      {!isSelectionMode && (
          <div className="absolute top-4 right-4" ref={menuRef}>
            <button onClick={handleMenuToggle} className="p-1.5 bg-black/50 rounded-full opacity-70 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hover:bg-black/75 focus:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="More options">
              <MoreVerticalIcon className="w-5 h-5 text-white" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-gray-900 border border-gray-800 rounded-md shadow-lg z-30">
                <div className="p-1">
                  {onSelectRequest && <button onClick={(e) => { e.stopPropagation(); onSelectRequest(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded flex items-center gap-3"><CheckCircleIcon className="w-4 h-4"/> Select</button>}
                  {onRenameRequest && <button onClick={(e) => { e.stopPropagation(); onRenameRequest(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded flex items-center gap-3"><EditIcon className="w-4 h-4"/> Rename</button>}
                  {onDeleteRequest && <button onClick={(e) => { e.stopPropagation(); onDeleteRequest(); setMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/30 rounded flex items-center gap-3"><TrashIcon className="w-4 h-4"/> Delete</button>}
                </div>
              </div>
            )}
          </div>
      )}
    </div>
  );
};

export default FolderCard;