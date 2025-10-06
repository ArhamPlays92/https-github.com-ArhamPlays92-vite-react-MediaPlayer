
import React from 'react';

const PlayIcon: React.FC<{size?: number, className?: string}> = ({size = 32, className}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8 5.14v14l11-7-11-7z" />
  </svg>
);

export default PlayIcon;