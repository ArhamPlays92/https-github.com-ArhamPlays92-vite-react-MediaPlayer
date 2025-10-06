import React from 'react';

type RepeatMode = 'off' | 'one' | 'all';

interface RepeatIconProps {
    className?: string;
    mode: RepeatMode;
}

const RepeatIcon: React.FC<RepeatIconProps> = ({ className = "w-6 h-6", mode }) => (
    <div className="relative">
        <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
        </svg>
        {mode === 'one' && (
            <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-white text-black rounded-full w-4 h-4 flex items-center justify-center">1</span>
        )}
    </div>
);

export default RepeatIcon;