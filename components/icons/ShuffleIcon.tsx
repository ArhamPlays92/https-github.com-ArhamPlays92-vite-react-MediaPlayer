import React from 'react';

const ShuffleIcon: React.FC<{className?: string, isActive?: boolean}> = ({className = "w-6 h-6", isActive = false}) => (
    <div className="relative">
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.95 18.95l-4.24-4.24m-4.24-4.24L4.05 3.05m0 15.9l5.66-5.66m8.49-8.49l-5.66 5.66M4.05 18.95H7.5v-3.45m12.45-12.45H16.5v3.45" />
        </svg>
        {isActive && (
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
        )}
    </div>
);

export default ShuffleIcon;