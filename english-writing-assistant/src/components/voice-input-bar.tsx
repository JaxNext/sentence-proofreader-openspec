"use client";

import { useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";

interface VoiceInputBarProps {
  disabled?: boolean;
  onTextChange: (updater: (prev: string) => string) => void;
}

export default function VoiceInputBar({ disabled, onTextChange }: VoiceInputBarProps) {
  const textBeforeListeningRef = useRef("");

  const {
    isListening,
    isSupported,
    startListening,
    stopListening,
    error: speechError,
  } = useSpeechRecognition({
    onTranscriptChange: (transcript) => {
      const base = textBeforeListeningRef.current;
      onTextChange(() => {
        const separator = base.trim() ? " " : "";
        return base.trim() + separator + transcript;
      });
    },
  });

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      onTextChange((current) => {
        textBeforeListeningRef.current = current;
        return current;
      });
      startListening();
    }
  };

  if (!isSupported) return null;

  return (
    <>
      <div className="absolute bottom-4 right-2 flex items-center gap-2">
        <button
          onClick={toggleListening}
          disabled={disabled}
          className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isListening
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          }`}
          title={isListening ? "Stop recording" : "Start voice input"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </div>
      {isListening && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-3 py-1">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-red-600 font-medium">Recording...</span>
        </div>
      )}
      {speechError && !isListening && (
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
          <span className="text-xs text-amber-700">{speechError}</span>
        </div>
      )}
    </>
  );
}
