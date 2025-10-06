
import React from 'react';

const SkipNextIcon: React.FC<{className?: string}> = ({className = "w-6 h-6"}) => (
    <svg className={className} xmlns="http://www.w.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
);

export default SkipNextIcon;
