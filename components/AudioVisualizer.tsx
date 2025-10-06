import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    isPlaying: boolean;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyser, isPlaying }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameIdRef = useRef<number>();

    useEffect(() => {
        if (!analyser || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        // Set canvas dimensions based on its display size for high-DPI screens
        const scale = window.devicePixelRatio;
        canvas.width = Math.floor(canvas.clientWidth * scale);
        canvas.height = Math.floor(canvas.clientHeight * scale);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameIdRef.current = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 1.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
                
                if (barHeight > 0) {
                    const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
                    gradient.addColorStop(0, 'rgba(100, 116, 139, 0.5)'); // slate-500
                    gradient.addColorStop(1, 'rgba(203, 213, 225, 0.8)'); // slate-300
                    
                    ctx.fillStyle = gradient;
                    ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                }
                
                x += barWidth + (canvas.width * 0.01); // Add spacing between bars
            }
        };

        if (isPlaying) {
            draw();
        } else {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
            // Clear canvas when paused
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        return () => {
            if (animationFrameIdRef.current) {
                cancelAnimationFrame(animationFrameIdRef.current);
            }
        };

    }, [analyser, isPlaying]);

    return <canvas ref={canvasRef} className="absolute bottom-0 left-0 w-full h-1/2 opacity-75 pointer-events-none rounded-b-lg" />;
};

export default AudioVisualizer;
