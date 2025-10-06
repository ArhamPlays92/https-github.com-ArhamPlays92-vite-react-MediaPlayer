
import React from 'react';

const VolumeMuteIcon: React.FC<{size?: number}> = ({size = 24}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 9v6h4l5 5V4l-5 5H7z"/>
    </svg>
);

export default VolumeMuteIcon;
