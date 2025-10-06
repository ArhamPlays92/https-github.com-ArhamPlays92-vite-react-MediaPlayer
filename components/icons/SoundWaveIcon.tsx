import React from 'react';

const SoundWaveIcon: React.FC<{className?: string}> = ({className = "w-5 h-5"}) => (
  <div className={`flex items-end justify-between ${className}`} style={{height: '16px', width: '16px'}}>
    <span className="w-1 bg-current" style={{height: '100%', animation: 'wave 1s ease-in-out -0.4s infinite'}}></span>
    <span className="w-1 bg-current" style={{height: '50%', animation: 'wave 1s ease-in-out -0.2s infinite'}}></span>
    <span className="w-1 bg-current" style={{height: '100%', animation: 'wave 1s ease-in-out 0s infinite'}}></span>
  </div>
);

export default SoundWaveIcon;