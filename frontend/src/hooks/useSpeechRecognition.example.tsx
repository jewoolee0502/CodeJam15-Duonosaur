/**
 * Example usage of useSpeechRecognition hook
 * 
 * This file demonstrates different ways to use the Web Speech API
 * with the useSpeechRecognition hook in React components.
 */

import React from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';
import { SpeechRecognition } from '../components/SpeechRecognition';

// Example 1: Basic usage with hook
export function BasicSpeechExample() {
  const {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'en-US',
    continuous: true,
    interimResults: true,
  });

  return (
    <div>
      {!isSupported && <p>Speech recognition not supported</p>}
      {error && <p>Error: {error}</p>}
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop' : 'Start'} Listening
      </button>
      <p>Transcript: {transcript}</p>
    </div>
  );
}

// Example 2: Word detection
export function WordDetectionExample() {
  const targetWords = ['hello', 'world', 'test'];
  
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: 'en-US',
    continuous: false,
  });

  // Check for target words
  React.useEffect(() => {
    if (transcript) {
      const lowerTranscript = transcript.toLowerCase();
      for (const word of targetWords) {
        if (lowerTranscript.includes(word)) {
          console.log(`Detected word: ${word}`);
          // Handle detected word
          break;
        }
      }
    }
  }, [transcript, targetWords]);

  return (
    <div>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop' : 'Start'} Listening
      </button>
      <p>Say: {targetWords.join(', ')}</p>
      <p>You said: {transcript}</p>
    </div>
  );
}

// Example 3: Using the SpeechRecognition component
export function ComponentExample() {
  const handleTranscript = (transcript: string) => {
    console.log('Transcript received:', transcript);
  };

  const handleWordDetected = (word: string) => {
    console.log('Word detected:', word);
    alert(`You said: ${word}`);
  };

  return (
    <SpeechRecognition
      onTranscript={handleTranscript}
      onWordDetected={handleWordDetected}
      targetWords={['hello', 'world']}
      language="en-US"
      showTranscript={true}
    />
  );
}

// Example 4: French language learning
export function FrenchLearningExample() {
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    lang: 'fr-FR',
    continuous: false,
    interimResults: true,
  });

  const checkPronunciation = () => {
    const correctWord = 'bonjour';
    if (transcript.toLowerCase().includes(correctWord)) {
      alert('Correct! Well done!');
    } else {
      alert('Try again!');
    }
    resetTranscript();
  };

  return (
    <div>
      <h2>Practice: Say "Bonjour"</h2>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop' : 'Start'} Recording
      </button>
      {transcript && (
        <>
          <p>You said: {transcript}</p>
          <button onClick={checkPronunciation}>Check</button>
        </>
      )}
    </div>
  );
}

