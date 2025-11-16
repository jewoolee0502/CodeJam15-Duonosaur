import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(
  options: SpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    lang = 'en-US',
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
  } = options;

  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef('');
  const shouldBeListeningRef = useRef(false); // Track if we want to be listening
  const isStartingRef = useRef(false); // Track if we're currently trying to start
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Track retry timeout

  // Helper function to safely start recognition
  const safeStartRecognition = useCallback(() => {
    if (!recognitionRef.current || !shouldBeListeningRef.current || isStartingRef.current) {
      return false;
    }

    // Check if recognition is already running
    try {
      // Try to start - will throw if already started
      isStartingRef.current = true;
      recognitionRef.current.start();
      return true;
    } catch (err: any) {
      isStartingRef.current = false;
      if (err.message?.includes('already started') || err.name === 'InvalidStateError') {
        // Already running, which is fine
        console.log('Recognition already started, continuing...');
        return true;
      }
      console.error('Failed to start recognition:', err);
      return false;
    }
  }, []);

  // Check browser support and initialize
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      return;
    }

    // Check for Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser');
      return;
    }

    setIsSupported(true);
    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;

    // Configure recognition
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = lang;
    recognition.maxAlternatives = maxAlternatives;

    // Handle results
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current;
      let hasFinalResult = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
          hasFinalResult = true;
        } else {
          interimTranscript += transcript;
        }
      }

      finalTranscriptRef.current = finalTranscript;
      setTranscript(finalTranscript.trim() + interimTranscript);
    };

    // Handle errors
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      isStartingRef.current = false; // Reset starting flag on error
      
      // Clear any pending retry
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      let errorMessage: string | null = null;
      let shouldRetry = false;
      
      switch (event.error) {
        case 'no-speech':
          // No speech detected - this is normal, don't retry (onend will handle it)
          return; // Let onend handle the restart
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your microphone.';
          setIsListening(false);
          shouldBeListeningRef.current = false;
          break;
        case 'not-allowed':
          errorMessage = 'Microphone permission denied. Please allow microphone access.';
          setIsListening(false);
          shouldBeListeningRef.current = false;
          break;
        case 'network':
          // Network error - often transient, let onend handle restart
          // Don't show error immediately, let it retry naturally
          console.warn('Network error detected - will retry via onend handler');
          return; // Let onend handle the restart
        case 'aborted':
          // User stopped, not really an error
          return;
        case 'service-not-allowed':
          errorMessage = 'Speech recognition service not allowed.';
          setIsListening(false);
          shouldBeListeningRef.current = false;
          break;
        default:
          errorMessage = `Speech recognition error: ${event.error}`;
          setIsListening(false);
          shouldBeListeningRef.current = false;
      }

      // Only set error if we have a message
      if (errorMessage) {
        setError(errorMessage);
      }
    };

    // Handle end event
    recognition.onend = () => {
      isStartingRef.current = false; // Reset starting flag
      
      // Clear any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      // Auto-restart only if continuous mode is enabled
      // In non-continuous mode (one word at a time), stop after each word
      if (shouldBeListeningRef.current && continuous) {
        // Use a small delay to avoid immediate restart conflicts
        retryTimeoutRef.current = setTimeout(() => {
          retryTimeoutRef.current = null;
          if (shouldBeListeningRef.current && recognitionRef.current) {
            // Use the safe start function
            if (!safeStartRecognition()) {
              // If safe start failed, try direct start
              try {
                recognitionRef.current.start();
              } catch (err) {
                console.log('Recognition restart failed:', err);
              }
            }
          }
        }, 300); // Small delay to prevent rapid restarts
      } else {
        // Non-continuous mode: stop listening after each word
        setIsListening(false);
        // Don't reset shouldBeListeningRef here - let user control it via button
        // This way they can click again to listen for the next word
      }
    };

    // Handle start event
    recognition.onstart = () => {
      isStartingRef.current = false; // Reset starting flag
      setError(null);
      setIsListening(true);
    };

    // Cleanup on unmount
    return () => {
      // Clear any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors during cleanup
        }
        recognitionRef.current = null;
      }
    };
  }, [lang, continuous, interimResults, maxAlternatives]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition is not available');
      return;
    }

    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    shouldBeListeningRef.current = true; // Mark that we want to be listening
    finalTranscriptRef.current = '';
    setTranscript('');
    setError(null);
    
    // Use safe start function
    if (!safeStartRecognition()) {
      // If safe start failed, try direct start as fallback
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        if (err.message?.includes('already started') || err.name === 'InvalidStateError') {
          // Already listening, which is fine
          shouldBeListeningRef.current = true;
          return;
        }
        setError('Failed to start speech recognition');
        shouldBeListeningRef.current = false;
        console.error('Error starting recognition:', err);
      }
    }
  }, [isSupported, safeStartRecognition]);

  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false; // Mark that we want to stop listening
    isStartingRef.current = false; // Reset starting flag
    
    // Clear any pending retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    finalTranscriptRef.current = '';
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

