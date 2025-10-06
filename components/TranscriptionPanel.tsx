
import React, { useRef, useEffect } from 'react';
import CloseIcon from './icons/CloseIcon';
import SendIcon from './icons/SendIcon';
import SpinnerIcon from './icons/SpinnerIcon';

interface TranscriptionPanelProps {
    isOpen: boolean;
    onClose: () => void;
    transcript: string;
    onQueryChange: (query: string) => void;
    onQuerySubmit: () => void;
    userQuery: string;
    aiResponse: string;
    isAiLoading: boolean;
    error: string | null;
}

const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({
    isOpen,
    onClose,
    transcript,
    onQueryChange,
    onQuerySubmit,
    userQuery,
    aiResponse,
    isAiLoading,
    error,
}) => {
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [transcript]);

    useEffect(() => {
        if(isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300); // Allow animation to finish
        }
    }, [isOpen]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onQuerySubmit();
    };

    const containerClasses = isOpen
        ? 'translate-x-0'
        : 'translate-x-full';

    return (
        <div 
            className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-black/80 backdrop-blur-lg border-l border-white/10 z-30 transform transition-transform duration-300 ease-in-out ${containerClasses}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="transcription-heading"
        >
            <div className="flex flex-col h-full">
                {/* Header */}
                <header className="p-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
                    <h2 id="transcription-heading" className="text-xl font-bold text-gray-200">Transcript & AI</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80" aria-label="Close panel">
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </header>
                
                {/* Main Content */}
                <div className="flex-grow p-4 overflow-y-auto">
                    {error && <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-md my-2" role="alert">{error}</div>}

                    {/* Transcript */}
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Transcript</h3>
                        <div className="bg-white/5 p-3 rounded-lg min-h-[100px] max-h-64 overflow-y-auto text-gray-300 leading-relaxed">
                           {transcript || <span className="text-gray-500">Waiting for audio...</span>}
                           <div ref={transcriptEndRef} />
                        </div>
                    </div>

                     {/* AI Assistant */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Ask about this video</h3>
                        <div className="bg-white/5 p-3 rounded-lg min-h-[80px]">
                           {isAiLoading && <div className="flex justify-center items-center h-full"><SpinnerIcon /></div>}
                           {!isAiLoading && aiResponse && <p className="text-gray-300 whitespace-pre-wrap">{aiResponse}</p>}
                           {!isAiLoading && !aiResponse && <p className="text-gray-500">Ask a question to get started.</p>}
                        </div>
                    </div>
                </div>

                {/* Footer Input */}
                <footer className="p-4 border-t border-white/10 flex-shrink-0">
                    <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userQuery}
                            onChange={(e) => onQueryChange(e.target.value)}
                            placeholder="e.g., What is this video about?"
                            className="flex-grow bg-black/30 border border-gray-700 rounded-lg py-2 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/80"
                            disabled={isAiLoading}
                        />
                        <button 
                            type="submit" 
                            className="bg-white text-black rounded-lg p-2.5 disabled:bg-gray-400 hover:bg-gray-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                            disabled={isAiLoading || !userQuery}
                            aria-label="Ask question"
                        >
                            <SendIcon className="w-5 h-5"/>
                        </button>
                    </form>
                </footer>
            </div>
        </div>
    );
};

export default TranscriptionPanel;