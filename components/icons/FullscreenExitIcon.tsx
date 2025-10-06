import React from 'react';

const FullscreenExitIcon: React.FC<{className?: string}> = ({className = "w-6 h-6"}) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14h4v4m-4-4l7-7m-7 11v-4h4m-4 4l7-7M4 10h4V4m-4 4l7-7m11 7v4h-4m4-4l7-7" />
    </svg>
);

export default FullscreenExitIcon;
