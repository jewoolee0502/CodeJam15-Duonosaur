import { useState, useEffect } from 'react';
import { Hole } from './Hole';

interface GameBoardProps {
  isPlaying: boolean;
  onWhack: (hit: boolean) => void;
}

export function GameBoard({ isPlaying, onWhack }: GameBoardProps) {
  const [activeMoles, setActiveMoles] = useState<Set<number>>(new Set());
  const holes = Array.from({ length: 9 }, (_, i) => i);

  useEffect(() => {
    if (!isPlaying) {
      setActiveMoles(new Set());
      return;
    }

    const popUpMole = () => {
      // Random number of moles (1-2)
      const numMoles = Math.random() > 0.5 ? 1 : 2;
      const newActiveMoles = new Set<number>();
      
      for (let i = 0; i < numMoles; i++) {
        let randomHole;
        do {
          randomHole = Math.floor(Math.random() * 9);
        } while (newActiveMoles.has(randomHole));
        newActiveMoles.add(randomHole);
      }
      
      setActiveMoles(newActiveMoles);

      // Hide moles after a consistent time (1000ms)
      const hideTime = 1000;
      setTimeout(() => {
        setActiveMoles(new Set());
      }, hideTime);
    };

    // Pop up moles at consistent intervals
    const interval = setInterval(() => {
      popUpMole();
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleMoleClick = (holeIndex: number) => {
    if (activeMoles.has(holeIndex)) {
      setActiveMoles(prev => {
        const newSet = new Set(prev);
        newSet.delete(holeIndex);
        return newSet;
      });
      onWhack(true);
    }
  };

  const handleMissClick = () => {
    if (isPlaying) {
      onWhack(false);
    }
  };

  return (
    /* CONTRAST: Very dark board against medium background creates depth */
    /* REPETITION: Rounded-xl consistent with all other components */
    /* ALIGNMENT: Centered container */
    <div 
      className="bg-white rounded-xl p-8 shadow-2xl border-4"
      style={{ borderColor: '#B8621B' }}
      onClick={handleMissClick}
    >
      {/* BALANCE: Perfect 3x3 symmetrical grid */}
      <div className="grid grid-cols-3 gap-6">
        {holes.map((holeIndex) => (
          <Hole
            key={holeIndex}
            isActive={activeMoles.has(holeIndex)}
            onClick={() => handleMoleClick(holeIndex)}
            isPlaying={isPlaying}
          />
        ))}
      </div>
    </div>
  );
}