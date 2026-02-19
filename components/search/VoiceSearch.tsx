"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

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
            toast.info("Listening...", { duration: 2000 });
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            onResult(transcript);
            setIsListening(false);
            toast.success("Voice command recognized");
        };

        recognition.onerror = (event: any) => {
            setIsListening(false);
            if (event.error === 'not-allowed') {
                toast.error("Microphone access denied. Please allow microphone access in your browser settings.");
            } else if (event.error === 'no-speech') {
                toast.error("No speech detected. Please try again.");
            } else {
                toast.error("Voice search failed. Please try again.");
                console.error("Speech recognition error", event.error);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        try {
            recognition.start();
        } catch (err) {
            console.error(err);
            toast.error("Failed to start voice recognition");
        }
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
