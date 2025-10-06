import React, { useRef, useState, useCallback, useEffect } from 'react';

interface ProgressBarProps {
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
    size?: 'normal' | 'small';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek, size = 'normal' }) => {
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [isSeeking, setIsSeeking] = useState(false);

    const getSeekTime = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!progressBarRef.current || duration === 0) return 0;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = Math.max(0, Math.min(duration, (clickX / width) * duration));
        return newTime;
    }, [duration]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsSeeking(true);
        const newTime = getSeekTime(e);
        onSeek(newTime);
    }, [getSeekTime, onSeek]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isSeeking) {
            const newTime = getSeekTime(e);
            onSeek(newTime);
        }
    }, [isSeeking, getSeekTime, onSeek]);

    const handleMouseUp = useCallback(() => {
        setIsSeeking(false);
    }, []);

    useEffect(() => {
        if (isSeeking) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isSeeking, handleMouseMove, handleMouseUp]);

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    const containerClasses = size === 'small' 
        ? "w-full cursor-pointer group py-1" 
        : "w-full cursor-pointer group py-2";

    const trackClasses = size === 'small'
        ? "w-full h-1 bg-white/20 rounded-full relative"
        : "w-full h-1.5 bg-white/20 rounded-full relative";

    const thumbClasses = size === 'small'
        ? "absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full transform translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
        : "absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transform translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity";


    return (
        <div 
            ref={progressBarRef}
            onMouseDown={handleMouseDown}
            className={containerClasses}
            style={{ touchAction: 'none' }} // Prevent scrolling on mobile
        >
            <div className={trackClasses}>
                <div 
                    style={{ width: `${progress}%` }} 
                    className="h-full bg-white rounded-full relative"
                >
                    <div className={thumbClasses} />
                </div>
            </div>
        </div>
    );
};
export default ProgressBar;