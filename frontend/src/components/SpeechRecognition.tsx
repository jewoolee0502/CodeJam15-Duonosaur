import React from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface SpeechRecognitionProps {
  onTranscript?: (transcript: string) => void;
  onWordDetected?: (word: string) => void;
  targetWords?: string[];
  language?: string;
  continuous?: boolean;
  className?: string;
  buttonClassName?: string;
  showTranscript?: boolean;
}

export function SpeechRecognition({
  onTranscript,
  onWordDetected,
  targetWords = [],
  language = 'en-US',
  continuous = true,
  className = '',
  buttonClassName = '',
  showTranscript = false,
}: SpeechRecognitionProps) {
  const {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: language,
    continuous,
    interimResults: true,
  });

  // Notify parent of transcript changes
  React.useEffect(() => {
    if (onTranscript && transcript) {
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  // Check for target words
  React.useEffect(() => {
    if (onWordDetected && targetWords.length > 0 && transcript) {
      const lowerTranscript = transcript.toLowerCase().trim();
      for (const word of targetWords) {
        if (lowerTranscript.includes(word.toLowerCase())) {
          onWordDetected(word);
          break;
        }
      }
    }
  }, [transcript, targetWords, onWordDetected]);

  const handleToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`} style={{ color: '#EF4444' }}>
        <AlertCircle className="w-4 h-4" />
        <span>Speech recognition not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        onClick={handleToggle}
        className={`px-4 py-2 rounded-xl border-2 flex items-center gap-2 transition-colors ${
          isListening
            ? 'bg-green-500 hover:bg-green-600 border-green-600'
            : 'bg-white hover:bg-gray-50 border-gray-300'
        } ${buttonClassName}`}
        style={
          isListening
            ? {
                backgroundColor: '#22C55E',
                borderColor: '#16A34A',
                color: 'white',
              }
            : {
                borderColor: '#B8621B',
                color: '#B8621B',
              }
        }
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5" />
            <span>Stop Listening</span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            <span>Start Listening</span>
          </>
        )}
      </button>

      {error && (
        <div className="text-sm flex items-center gap-2" style={{ color: '#EF4444' }}>
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {showTranscript && transcript && (
        <div
          className="text-sm p-2 rounded-lg bg-gray-100"
          style={{ color: '#8B6F47' }}
        >
          <strong>You said:</strong> {transcript}
        </div>
      )}

      {isListening && (
        <div className="text-xs text-center" style={{ color: '#8B6F47' }}>
          Listening...
        </div>
      )}
    </div>
  );
}

