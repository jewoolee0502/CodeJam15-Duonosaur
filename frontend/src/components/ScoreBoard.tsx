import { Clock, Trophy, Target, Crosshair } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  timeLeft: number;
  highScore: number;
  isPlaying: boolean;
  accuracy: number;
}

export function ScoreBoard({ score, timeLeft, highScore, isPlaying, accuracy }: ScoreBoardProps) {
  return (
    /* REPETITION: All 4 cards use identical structure - icon, label, value */
    /* BALANCE: Equal width columns create perfect symmetry */
    /* ALIGNMENT: Grid creates strong horizontal lines */
    <div className="grid grid-cols-4 gap-3">
      
      {/* CONTRAST: Each card has distinct color icon for instant recognition */}
      
      {/* Score Card */}
      <div className="bg-white rounded-lg p-4 shadow-lg border-2" style={{ borderColor: '#B8621B' }}>
        {/* ALIGNMENT: Centered content within card */}
        <div className="flex flex-col items-center gap-2">
          {/* CONTRAST: Orange icon against white background */}
          <div className="rounded-lg p-2" style={{ backgroundColor: '#FFD7B5' }}>
            <Target className="w-5 h-5" style={{ color: '#B8621B' }} />
          </div>
          <div className="text-center">
            {/* HIERARCHY: Label is small and subtle */}
            <p className="text-xs uppercase tracking-wide" style={{ color: '#8B6F47' }}>Score</p>
            {/* HIERARCHY: Value is large and prominent */}
            <p className="text-2xl" style={{ color: '#B8621B' }}>{score}</p>
          </div>
        </div>
      </div>

      {/* Time Card */}
      {/* CONTRAST: Warning state uses red color and pulsing ring */}
      <div className={`bg-white rounded-lg p-4 shadow-lg border-2 transition-all ${
        isPlaying && timeLeft <= 10 ? 'ring-4 ring-red-500/50' : ''
      }`} style={{ borderColor: '#B8621B' }}>
        <div className="flex flex-col items-center gap-2">
          <div className={`rounded-lg p-2 transition-colors`} style={{ backgroundColor: timeLeft <= 10 && isPlaying ? '#DC2626' : '#FFD7B5' }}>
            <Clock className="w-5 h-5" style={{ color: timeLeft <= 10 && isPlaying ? 'white' : '#B8621B' }} />
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide" style={{ color: '#8B6F47' }}>Time</p>
            {/* CONTRAST: Red text in warning state */}
            <p className="text-2xl transition-colors" style={{ color: timeLeft <= 10 && isPlaying ? '#DC2626' : '#B8621B' }}>{timeLeft}s</p>
          </div>
        </div>
      </div>

      {/* Accuracy Card */}
      <div className="bg-white rounded-lg p-4 shadow-lg border-2" style={{ borderColor: '#B8621B' }}>
        <div className="flex flex-col items-center gap-2">
          {/* CONTRAST: Peach for accuracy metric */}
          <div className="rounded-lg p-2" style={{ backgroundColor: '#FFD7B5' }}>
            <Crosshair className="w-5 h-5" style={{ color: '#B8621B' }} />
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide" style={{ color: '#8B6F47' }}>Accuracy</p>
            <p className="text-2xl" style={{ color: '#B8621B' }}>{accuracy}%</p>
          </div>
        </div>
      </div>

      {/* High Score Card */}
      <div className="bg-white rounded-lg p-4 shadow-lg border-2" style={{ borderColor: '#B8621B' }}>
        <div className="flex flex-col items-center gap-2">
          {/* CONTRAST: Peach for achievement/trophy */}
          <div className="rounded-lg p-2" style={{ backgroundColor: '#FFD7B5' }}>
            <Trophy className="w-5 h-5" style={{ color: '#B8621B' }} />
          </div>
          <div className="text-center">
            <p className="text-xs uppercase tracking-wide" style={{ color: '#8B6F47' }}>Best</p>
            <p className="text-2xl" style={{ color: '#B8621B' }}>{highScore}</p>
          </div>
        </div>
      </div>
    </div>
  );
}