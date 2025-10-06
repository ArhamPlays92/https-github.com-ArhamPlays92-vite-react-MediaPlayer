import React from 'react';
import ResumeIcon from './icons/ResumeIcon';

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3 z-30 animate-toast-in">
      <ResumeIcon className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
