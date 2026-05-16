"use client";

import { useState, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import { useAuthPrompt } from "@/components/auth/AuthPromptProvider";

interface VoiceSearchProps {
    onResult: (text: string) => void;
    className?: string;
}

export function VoiceSearch({ onResult, className }: VoiceSearchProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const { showDemoNotice } = useAuthPrompt();

    useEffect(() => {
        if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            setIsSupported(true);
        }
    }, []);

    const startListening = () => {
        showDemoNotice("Voice Search and AI Semantic Expansion are disabled in this demo showcase.");
        return;
        
        // Original logic preserved if needed for re-enablement
        /*
        if (!isSupported) return;
        ...
        */
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
