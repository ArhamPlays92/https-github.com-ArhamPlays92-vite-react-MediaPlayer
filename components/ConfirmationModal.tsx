import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
    >
      <div 
        className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-6 w-full max-w-sm m-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-400 mb-6">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-gray-300 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 focus-visible:ring-red-500"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;