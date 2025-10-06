import React from 'react';

const OpeningAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center">
        {/* Icon */}
        <div className="animate-scale-up">
           <svg className="w-20 h-20 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"></path></svg>
        </div>
        {/* Text */}
        <h1 className="text-3xl font-bold text-gray-200 tracking-tight mt-6 animate-fade-in-delay">
            Media Player
        </h1>
      </div>
    </div>
  );
};

export default OpeningAnimation;
