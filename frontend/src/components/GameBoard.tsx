import { useState, useEffect } from 'react';
import { Hole } from './Hole';

interface Exercise {
  sentence: string;
  mistake: string;
}

interface GameBoardProps {
  isPlaying: boolean;
  onWhack: (hit: boolean) => void;
  exercises: Exercise[];
  currentExerciseIndex: number;
  onAdvanceExercise: (correct: boolean) => void;
}

export function GameBoard({ isPlaying, onWhack, exercises, currentExerciseIndex, onAdvanceExercise }: GameBoardProps) {
  const [activeMoles, setActiveMoles] = useState<Map<number, string>>(new Map());
  const [hitWords, setHitWords] = useState<Set<string>>(new Set());
  const [wordHoleMap, setWordHoleMap] = useState<Map<string, number>>(new Map());
  const holes = Array.from({ length: 9 }, (_, i) => i);
  const currentExercise = exercises[currentExerciseIndex];
  const words = currentExercise?.sentence ? currentExercise.sentence.split(' ') : [];

  useEffect(() => {
    setHitWords(new Set());
    setActiveMoles(new Map());
  }, [currentExerciseIndex]);

  // When a new exercise starts, assign each word a fixed hole (randomized)
  useEffect(() => {
    if (!words || words.length === 0) {
      setWordHoleMap(new Map());
      return;
    }

    const holePool = [...holes];
    for (let i = holePool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [holePool[i], holePool[j]] = [holePool[j], holePool[i]];
    }

    const map = new Map<string, number>();
    for (let i = 0; i < words.length && i < holePool.length; i++) {
      map.set(words[i], holePool[i]);
    }
    setWordHoleMap(map);
  }, [currentExerciseIndex]);

  useEffect(() => {
    if (!isPlaying) {
      setActiveMoles(new Map());
      return;
    }

    const popUpMoles = () => {
      const availableWords = words.filter(w => !hitWords.has(w));
      if (availableWords.length === 0) return;

      const newActiveMoles = new Map<number, string>();
      // Use the fixed mapping from word to hole so words don't move between cycles
      for (const w of availableWords) {
        const holeIndex = wordHoleMap.get(w);
        if (holeIndex !== undefined) {
          newActiveMoles.set(holeIndex, w);
        }
      }

      setActiveMoles(newActiveMoles);
      const hideTime = 1200 + Math.random() * 400;
      setTimeout(() => setActiveMoles(new Map()), hideTime);
    };

    const interval = setInterval(() => {
      popUpMoles();
    }, 1800 + Math.random() * 800);
    popUpMoles();
    return () => clearInterval(interval);
  }, [isPlaying, words, hitWords]);

  const handleMoleClick = (holeIndex: number) => {
    const word = activeMoles.get(holeIndex);
    if (!word) return;

    setActiveMoles(new Map());
    setHitWords((prev: Set<string>) => new Set([...Array.from(prev), word]));

    if (word === currentExercise.mistake) {
      onAdvanceExercise(true);
    } else {
      onWhack(false);
      onAdvanceExercise(false);
    }
  };

  const handleMissClick = () => {
    if (isPlaying) {
      onWhack(false);
    }
  };

  return (
    <div 
      className="bg-white rounded-xl p-8 shadow-2xl border-4"
      style={{ borderColor: '#B8621B' }}
      onClick={handleMissClick}
    >
      <div className="text-center mb-6 text-2xl font-semibold" style={{ color: '#6B5335' }}>
        {currentExercise?.sentence}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {holes.map((holeIndex) => (
          <Hole
            key={holeIndex}
            isActive={activeMoles.has(holeIndex)}
            word={activeMoles.get(holeIndex)}
            onClick={() => handleMoleClick(holeIndex)}
            isPlaying={isPlaying}
          />
        ))}
      </div>
    </div>
  );
}