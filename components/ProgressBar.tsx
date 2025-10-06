import React, { useRef, useState, useCallback, useEffect } from 'react';

interface ProgressBarProps {
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
    size?: 'normal' | 'small';
}

const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek, size = 'normal' }) => {
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [isSeeking, setIsSeeking] = useState(false);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverPosition, setHoverPosition] = useState(0);

    const getSeekTime = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!progressBarRef.current || duration === 0) return 0;
        const rect = progressBarRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = Math.max(0, Math.min(duration, (clickX / width) * duration));
        return newTime;
    }, [duration]);

    const handleMouseMoveOnBar = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressBarRef.current || duration === 0) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const hoverX = e.clientX - rect.left;
        setHoverPosition(hoverX);
        const time = (hoverX / rect.width) * duration;
        setHoverTime(time);
    };

    const handleMouseLeaveBar = () => {
        setHoverTime(null);
    };

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
        ? "absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full transform translate-x-1/2 opacity-100 transition-opacity"
        : `absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transform translate-x-1/2 ${isSeeking ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`;


    return (
        <div 
            ref={progressBarRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMoveOnBar}
            onMouseLeave={handleMouseLeaveBar}
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
            {hoverTime !== null && size !== 'small' && (
                <div 
                    className="absolute bottom-full mb-2 transform -translate-x-1/2 bg-black/80 rounded px-2 py-1 text-xs text-white pointer-events-none"
                    style={{ left: `${hoverPosition}px` }}
                >
                    {formatTime(hoverTime)}
                </div>
            )}
        </div>
    );
};
export default ProgressBar;
