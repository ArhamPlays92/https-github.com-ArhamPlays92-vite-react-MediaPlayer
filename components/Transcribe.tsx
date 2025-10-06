import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, LiveSession } from '@google/genai';
import { createBlob } from '../utils';

type Status = 'Idle' | 'Connecting' | 'Listening' | 'Error' | 'Stopped';

const Transcribe: React.FC = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [status, setStatus] = useState<Status>('Idle');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const fullInputTranscriptionRef = useRef('');

  const stopTranscription = useCallback(async () => {
    setIsTranscribing(false);
    setStatus('Stopped');

    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  const startTranscription = useCallback(async () => {
    setStatus('Connecting');
    setIsTranscribing(true);
    setHistory([]);
    setCurrentTranscript('');
    fullInputTranscriptionRef.current = '';

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Listening');
            // FIX: Cast window to any to support webkitAudioContext for older browsers.
            audioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = audioContextRef.current.createMediaStreamSource(stream);
            scriptProcessorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(audioContextRef.current.destination);
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              fullInputTranscriptionRef.current += text;
              setCurrentTranscript(fullInputTranscriptionRef.current);
            }
            if (message.serverContent?.turnComplete) {
                if(fullInputTranscriptionRef.current.trim()){
                    setHistory(prev => [...prev, fullInputTranscriptionRef.current.trim()]);
                }
                fullInputTranscriptionRef.current = '';
                setCurrentTranscript('');
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('API Error:', e);
            setStatus('Error');
            stopTranscription();
          },
          onclose: (e: CloseEvent) => {
            stopTranscription();
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
      });

    } catch (error) {
      console.error('Failed to get media stream or start transcription:', error);
      setStatus('Error');
      setIsTranscribing(false);
    }
  }, [stopTranscription]);

  const handleToggleTranscription = useCallback(() => {
    if (isTranscribing) {
      stopTranscription();
    } else {
      startTranscription();
    }
  }, [isTranscribing, startTranscription, stopTranscription]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTranscription();
    };
  }, [stopTranscription]);

  const getStatusIndicator = () => {
    switch (status) {
      case 'Listening':
        return <><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span><span className="ml-2">Listening...</span></>;
      case 'Connecting':
        return 'Connecting...';
      case 'Error':
        return 'An error occurred. Please try again.';
      case 'Stopped':
        return 'Transcription stopped.';
      case 'Idle':
      default:
        return 'Ready to transcribe.';
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center space-y-6">
      <h2 className="text-3xl font-bold text-gray-200 text-center">Live Audio Transcription</h2>
      <p className="text-gray-500 text-center">Click the button below and start speaking. Your words will be transcribed in real-time.</p>
      
      <div className="w-full bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button 
            onClick={handleToggleTranscription} 
            className={`px-6 py-3 font-semibold rounded-lg transition-all duration-300 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
              isTranscribing 
              ? 'bg-red-600 text-white hover:bg-red-500 focus:ring-red-500' 
              : 'bg-gray-200 text-black hover:bg-white focus:ring-white'
            }`}
          >
            {isTranscribing ? 'Stop Transcribing' : 'Start Transcribing'}
          </button>
          <div className="text-gray-400 flex items-center">{getStatusIndicator()}</div>
        </div>
      </div>

      <div className="w-full bg-gray-900 border border-gray-800 rounded-lg shadow-lg p-6 space-y-4 min-h-[300px]">
        <h3 className="text-xl font-semibold text-gray-200 border-b border-gray-700 pb-2">Transcript</h3>
        <div className="space-y-2 text-gray-400 h-64 overflow-y-auto pr-2">
            {history.map((text, index) => (
                <p key={index}>{text}</p>
            ))}
            {currentTranscript && <p className="text-white">{currentTranscript}</p>}
            {history.length === 0 && !currentTranscript && status !== 'Error' && <p className="text-gray-500">Waiting for audio...</p>}
        </div>
      </div>
    </div>
  );
};

export default Transcribe;