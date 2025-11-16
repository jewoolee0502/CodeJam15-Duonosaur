import { useState, useEffect, useRef } from 'react';
import { Hole } from './Hole';

interface Exercise {
  sentence: string;
  mistake: string;
  words?: string[];
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
  const hideTimeoutRef = useRef<number | null>(null);
  const popTimeoutRef = useRef<number | null>(null);
  const currentExercise = exercises[currentExerciseIndex];
  // Helper to normalize words for comparison (removes punctuation, lowercases)
  const normalize = (s?: string) =>
    (s || '').replace(/[^0-9A-Za-zÀ-ž']/g, '').toLowerCase();
  // Prefer an explicit words array on the exercise (better tokenization),
  // otherwise fall back to splitting the sentence by whitespace.
  const words = currentExercise
    ? (currentExercise.words && currentExercise.words.length > 0
        ? currentExercise.words
        : currentExercise.sentence.split(/\s+/))
    : [];

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
  }, [currentExerciseIndex, words]);

  useEffect(() => {
    if (!isPlaying) {
      setActiveMoles(new Map());
      return;
    }

    // Use a single sequential pop scheduler so moles are never synchronized
    const schedulePop = () => {
      // If game stopped, don't schedule
      if (!isPlaying) return;

      const availableWords = words.filter(w => !hitWords.has(w));
      if (availableWords.length === 0) {
        // nothing left; try again later
        popTimeoutRef.current = window.setTimeout(schedulePop, 2000);
        return;
      }

      // Weighted selection: make the exercise mistake ~30% more likely to be chosen
      const targetNorm = normalize(currentExercise?.mistake);
      let totalWeight = 0;
      const weights = availableWords.map(w => {
        const wNorm = normalize(w);
        const weight = (targetNorm && wNorm === targetNorm) ? 1.3 : 1.0;
        totalWeight += weight;
        return weight;
      });

      let r = Math.random() * totalWeight;
      let chosenIndex = 0;
      for (let i = 0; i < availableWords.length; i++) {
        r -= weights[i];
        if (r <= 0) {
          chosenIndex = i;
          break;
        }
      }

      const word = availableWords[chosenIndex];
      const holeIndex = wordHoleMap.get(word);
      if (holeIndex === undefined) {
        popTimeoutRef.current = window.setTimeout(schedulePop, 1000);
        return;
      }

      setActiveMoles(new Map([[holeIndex, word]]));

      // Make mole visible much longer so gameplay is slower
      const hideTime = 3000 + Math.random() * 1000; // 4000-5000ms

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      hideTimeoutRef.current = window.setTimeout(() => {
        setActiveMoles(new Map());
        hideTimeoutRef.current = null;

        // schedule next pop after a small randomized gap so pops are not synchronized
        const gap = 800 + Math.random() * 1200; // 800-3000ms
        popTimeoutRef.current = window.setTimeout(schedulePop, gap);
      }, hideTime);
    };

    // start the initial pop cycle (randomized initial delay)
    if (popTimeoutRef.current) {
      clearTimeout(popTimeoutRef.current);
      popTimeoutRef.current = null;
    }
    popTimeoutRef.current = window.setTimeout(schedulePop, 600 + Math.random() * 1000);

    return () => {
      if (popTimeoutRef.current) {
        clearTimeout(popTimeoutRef.current);
        popTimeoutRef.current = null;
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [isPlaying, words, hitWords, wordHoleMap]);

  const handleMoleClick = (holeIndex: number) => {
    const word = activeMoles.get(holeIndex);
    if (!word) return;

    setActiveMoles(new Map());
    setHitWords((prev: Set<string>) => new Set([...Array.from(prev), word]));

    const normalize = (s: string | undefined) =>
      (s || '').replace(/[^0-9A-Za-zÀ-ž']/g, '').toLowerCase();

    const clicked = normalize(word);
    const target = normalize(currentExercise?.mistake);
    console.debug('GameBoard: clicked=', word, 'clickedNorm=', clicked, 'target=', currentExercise?.mistake, 'targetNorm=', target);

    if (clicked && target && clicked === target) {
      // Correct: advance the exercise and let parent increment the score
      console.debug('GameBoard: MATCH -> onAdvanceExercise(true)');
      // Notify parent this was a successful whack (score increment) and then advance
      onWhack(true);
      onAdvanceExercise(true);
    } else {
      // Incorrect: count as a missed click and advance the exercise
      console.debug('GameBoard: MISS -> onWhack(false) + onAdvanceExercise(false)');
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