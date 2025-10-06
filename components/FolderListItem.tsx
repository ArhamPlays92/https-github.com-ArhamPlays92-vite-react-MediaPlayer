
import React from 'react';
import FolderIcon from './icons/FolderIcon';
import SelectionCheckbox from './SelectionCheckbox';

interface FolderListItemProps {
  name: string;
  onClick: () => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  children?: React.ReactNode;
}

const FolderListItem: React.FC<FolderListItemProps> = ({ name, onClick, isSelectionMode, isSelected, children }) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center p-1.5 rounded-lg group hover:bg-white/5 transition-colors duration-200 w-full text-left cursor-pointer"
    >
      {isSelectionMode && (
        <div className="mr-3 flex-shrink-0 pointer-events-none">
          <SelectionCheckbox isSelected={isSelected} />
        </div>
      )}
      <div className="relative w-10 h-10 flex-shrink-0 mr-3 rounded flex items-center justify-center bg-gray-800/50 group-hover:bg-gray-800 transition-colors">
        <FolderIcon className="w-6 h-6 text-gray-400" />
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-base font-semibold text-gray-200 truncate group-hover:text-white">{name}</p>
        <p className="text-sm text-gray-500">Folder</p>
      </div>
      {children}
    </div>
  );
};

export default FolderListItem;
