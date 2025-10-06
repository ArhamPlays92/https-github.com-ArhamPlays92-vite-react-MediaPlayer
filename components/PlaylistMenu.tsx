import React from 'react';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';

interface PlaylistMenuProps {
    onClose: () => void;
    onRename: () => void;
    onDelete: () => void;
}

const PlaylistMenu: React.FC<PlaylistMenuProps> = ({ onClose, onRename, onDelete }) => {
    
    const handleRename = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRename();
        onClose();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete();
        onClose();
    };

    return (
        <div className="absolute right-0 top-full mt-2 w-40 bg-gray-900 border border-gray-800 rounded-md shadow-lg z-30">
            <div className="p-1">
                <button
                    onClick={handleRename}
                    className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-white/20 rounded flex items-center gap-3 focus:outline-none focus-visible:bg-white/30"
                >
                    <EditIcon className="w-4 h-4" />
                    Rename
                </button>
                <button
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/30 rounded flex items-center gap-3 focus:outline-none focus-visible:bg-red-500/40"
                >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                </button>
            </div>
        </div>
    );
};

export default PlaylistMenu;