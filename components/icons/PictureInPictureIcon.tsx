import React from 'react';

const PictureInPictureIcon: React.FC<{className?: string}> = ({className = "w-6 h-6"}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 15.424V8.576a2.25 2.25 0 00-2.25-2.25h-5.379a2.25 2.25 0 00-2.25 2.25v6.848a2.25 2.25 0 002.25 2.25h5.379A2.25 2.25 0 0021 15.424z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.875 18.75H3.375A2.25 2.25 0 011.125 16.5V6.75A2.25 2.25 0 013.375 4.5h12.75A2.25 2.25 0 0118.375 6.75v5.25" />
    </svg>
);

export default PictureInPictureIcon;
