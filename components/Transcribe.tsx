
import React, { useEffect, useRef } from 'react';
import { GoogleGenAI, LiveSession } from '@google/genai';
import { createBlob } from '../utils';

interface TranscribeProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    isActive: boolean;
    onTranscriptChunk: (chunk: string) => void;
    onError: (error: string) => void;
}

const Transcribe: React.FC<TranscribeProps> = ({ videoRef, isActive, onTranscriptChunk, onError }) => {
    const sessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    useEffect(() => {
        if (isActive && !sessionRef.current && videoRef.current) {
            const startSession = async () => {
                try {
                    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                    const sessionPromise = ai.live.connect({
                        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                        callbacks: {
                            onopen: () => {
                                const videoElement = videoRef.current;
                                if (!videoElement) return;

                                const stream = (videoElement as any).captureStream ? (videoElement as any).captureStream() : null;
                                if (!stream || stream.getAudioTracks().length === 0) {
                                    onError("This video has no audio track or audio capture is not supported.");
                                    return;
                                }

                                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
                                audioContextRef.current = audioContext;

                                const source = audioContext.createMediaStreamSource(stream);
                                mediaStreamSourceRef.current = source;
                                
                                const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
                                scriptProcessorRef.current = scriptProcessor;

                                scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                    const pcmBlob = createBlob(inputData);
                                    sessionPromise.then((session) => {
                                        session.sendRealtimeInput({ media: pcmBlob });
                                    });
                                };
                                source.connect(scriptProcessor);
                                scriptProcessor.connect(audioContext.destination);
                            },
                            onmessage: (message) => {
                                if (message.serverContent?.inputTranscription) {
                                    const text = message.serverContent.inputTranscription.text;
                                    onTranscriptChunk(text);
                                }
                            },
                            onerror: (e) => {
                                console.error('Live session error:', e);
                                onError('Transcription service error. Please try again.');
                            },
                            onclose: () => {},
                        },
                        config: {
                            inputAudioTranscription: {},
                        },
                    });

                    sessionRef.current = await sessionPromise;
                } catch (e) {
                    console.error("Failed to start transcription session", e);
                    if (e instanceof Error) {
                        onError(`Transcription failed: ${e.message}`);
                    } else {
                        onError('An unknown error occurred during transcription setup.');
                    }
                }
            };
            startSession();
        } else if (!isActive && sessionRef.current) {
            // Stop session
            sessionRef.current.close();
            sessionRef.current = null;
            if (scriptProcessorRef.current) {
                scriptProcessorRef.current.disconnect();
                scriptProcessorRef.current = null;
            }
            if(mediaStreamSourceRef.current) {
                mediaStreamSourceRef.current.disconnect();
                mediaStreamSourceRef.current = null;
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(console.error);
                audioContextRef.current = null;
            }
        }
    }, [isActive, videoRef, onTranscriptChunk, onError]);
    
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (sessionRef.current) sessionRef.current.close();
            if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
            if (mediaStreamSourceRef.current) mediaStreamSourceRef.current.disconnect();
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') audioContextRef.current.close().catch(console.error);
        };
    }, []);

    return null;
};

export default Transcribe;
