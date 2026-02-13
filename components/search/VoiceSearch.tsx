"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";

interface VoiceSearchProps {
    onResult: (text: string) => void;
    className?: string;
}

export function VoiceSearch({ onResult, className }: VoiceSearchProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            setIsSupported(true);
        }
    }, []);

    const startListening = () => {
        if (!isSupported) return;


        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsListening(true);
        };


        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsListening(false);
        };


        recognition.onerror = (event: any) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    if (!isSupported) return null;

    return (
        <button
            type="button"
            onClick={startListening}
            className={`p-2 rounded-full transition-colors ${isListening ? "bg-red-500/10 text-red-500 animate-pulse" : "hover:bg-muted text-muted-foreground hover:text-foreground"} ${className}`}
            title="Voice Search"
        >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
    );
}
