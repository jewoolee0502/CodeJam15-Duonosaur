import { useState, useEffect, useCallback } from 'react';
import { GameBoard } from './components/GameBoard';
import { ScoreBoard } from './components/ScoreBoard';
import { Button } from './components/ui/button';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { StartMenu } from './components/StartMenu';
import { JumpGame } from './components/JumpGame';
import { DunolingoGame } from './components/DunolingoGame';
import { ChatLearning } from './components/ChatLearning';

export default function App() {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [missedClicks, setMissedClicks] = useState(0);
  const [currentScreen, setCurrentScreen] = useState('start');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  interface MoleExcercise {
    exercise: string,
    words: string[],
    answer: string,
    explanation: string
  }

  // exercises loaded from backend (used for the whole game session)
  const [exercises, setExercises] = useState<MoleExcercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [exercisesError, setExercisesError] = useState<string | null>(null);

  // Load exercises once from backend. On failure try dummy endpoint as fallback.
  const loadExercises = useCallback(async () => {
    setLoadingExercises(true);
    setExercisesError(null);
    try {
      let res = await fetch('http://127.0.0.1:8000/mole/generate', { method: 'POST', headers: {
        "Content-Type": "application/json",
      } });
      if (!res.ok) {
        // fallback to dummy endpoint if primary fails
        res = await fetch('http://127.0.0.1:8000/mole/generate_dummy', { method: 'POST', headers: {
        "Content-Type": "application/json",
       } });
      }
      const data = await res.json();
      // backend may return either "exercise_list" or (in dummy) "exercice_list"
      const list = data.exercise_list ?? data.exercice_list ?? [];
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error('No exercises returned from server');
      }
      setExercises(list as MoleExcercise[]);
      return list;
    } catch (err: any) {
      console.error('Failed to load exercises:', err);
      setExercisesError(err?.message ?? 'Failed to load exercises');
      setExercises([]);
      throw err;
    } finally {
      setLoadingExercises(false);
    }
  }, []);

  useEffect(() => {
    if (isPlaying && !isPaused && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      setIsPaused(false);
      if (score > highScore) {
        setHighScore(score);
      }
    }
  }, [timeLeft, isPlaying, isPaused, score, highScore]);

  const startGame = useCallback(() => {
    setScore(0);
    setMissedClicks(0);
    setTimeLeft(30);
    setCurrentExerciseIndex(0);
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentScreen('game');
  }, []);

  const togglePause = useCallback(() => {
    if (isPlaying && timeLeft > 0) {
      setIsPaused(prev => !prev);
    }
  }, [isPlaying, timeLeft]);

  const handleWhack = useCallback((hit: boolean) => {
    if (isPlaying && !isPaused) {
      if (hit) {
        setScore(prev => prev + 1);
        // setDebugLog('Whack: HIT');
      } else {
        setMissedClicks(prev => prev + 1);
        // setDebugLog('Whack: MISS');
      }
    }
  }, [isPlaying, isPaused]);

  // Calculate accuracy for user feedback
  const accuracy = score + missedClicks > 0 
    ? Math.round((score / (score + missedClicks)) * 100) 
    : 0;

  // When user selects the whack game, load exercises once and then start the game.
  const handleGameSelect = async (game: 'whack-a-mole' | 'jump' | 'dunolingo' | 'chat-learning') => {
    if (game === 'whack-a-mole') {
      try {
        setCurrentScreen('loading');
        await loadExercises();
        startGame();
      } catch (err) {
        // keep user on start screen and show error — they can retry
        setCurrentScreen('start');
      }
    } else if (game === 'jump') {
      setCurrentScreen('jump');
    } else if (game === 'dunolingo') {
      setCurrentScreen('dunolingo');
    } else if (game === 'chat-learning') {
      setCurrentScreen('chat-learning');
    }
  };

  const handleAdvanceExercise = useCallback((correct: boolean) => {
    console.debug('App: handleAdvanceExercise correct=', correct);
    // setDebugLog(`advance: ${correct ? 'correct' : 'incorrect'}`);
    // Advance to next exercise
    setCurrentExerciseIndex(prev => (exercises.length > 0 ? (prev + 1) % exercises.length : prev + 1));
  }, [exercises.length]);
 
  const handleBackToMenu = () => {
    setCurrentScreen('menu');
    setIsPlaying(false);
    setIsPaused(false);
    setTimeLeft(30);
    setExercises([]);
  };
 
  if (currentScreen === 'menu') {
    return <StartMenu onSelectGame={handleGameSelect} />;
  }
 
  if (currentScreen === 'start') {
    return <StartMenu onSelectGame={handleGameSelect} />;
  }

  if (currentScreen === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5E5C7' }}>
        <div className="w-full max-w-2xl text-center space-y-4">
          <h2 style={{ color: '#B8621B' }}>Loading exercises…</h2>
          <p className="text-sm" style={{ color: '#8B6F47' }}>Please wait, loading exercises from the server.</p>
          {loadingExercises && <div className="text-sm" style={{ color: '#8B6F47' }}>Loading...</div>}
          {exercisesError && <div className="text-sm text-red-600">Loading Fails: {exercisesError}</div>}
          <div className="pt-3">
            <Button onClick={() => setCurrentScreen('start')} variant="outline" className="rounded-xl">
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }
 
  if (currentScreen === 'jump') {
    return <JumpGame onBack={handleBackToMenu} />;
  }
 
  if (currentScreen === 'dunolingo') {
    return <DunolingoGame onBack={handleBackToMenu} />;
  }
 
  if (currentScreen === 'chat-learning') {
    return <ChatLearning onBack={handleBackToMenu} />;
  }
 
  return (
    <div className="h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F5E5C7' }}>
      <div className="w-full max-w-4xl space-y-3">
        {/* Back to Menu Button */}
        <div className="flex items-center">
          <button 
            onClick={handleBackToMenu}
            className="flex items-center gap-2 text-sm hover:scale-105 transition-transform"
            style={{ color: '#B8621B' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Menu</span>
          </button>
        </div>
    
        {/* HIERARCHY: Title with clear game state */}
        <div className="text-center">
          <h1 className="tracking-tight text-4xl mb-1" style={{ color: '#B8621B' }}>
            Whack-A-Mole
          </h1>
          {/* VISIBILITY: Clear system status */}
          <div className="flex items-center justify-center gap-2 min-h-[20px]">
            {!isPlaying && timeLeft === 30 && (
              <p className="text-sm" style={{ color: '#B8621B' }}>Ready to play! Click Start</p>
            )}
            {isPlaying && !isPaused && (
              <p className="text-sm flex items-center gap-2" style={{ color: '#B8621B' }}>
                <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#B8621B' }}></span>
                Game in progress
              </p>
            )}
            {isPaused && (
              <p className="text-sm flex items-center gap-2" style={{ color: '#B8621B' }}>
                <Pause className="w-3.5 h-3.5" />
                Paused - Click Resume to continue
              </p>
            )}
            {timeLeft === 0 && !isPlaying && (
              <p className="text-sm" style={{ color: '#B8621B' }}>Game Over - Play again?</p>
            )}
          </div>
        </div>
    
        {/* RECOGNITION: Stats always visible */}
        <ScoreBoard 
          score={score} 
          timeLeft={timeLeft} 
          highScore={highScore}
          isPlaying={isPlaying}
          accuracy={accuracy}
        />

        {/* Game board with pause overlay */}
        <div className="relative">
          <GameBoard 
            isPlaying={isPlaying && !isPaused} 
            onWhack={handleWhack}
            exercises={exercises}
            currentExerciseIndex={currentExerciseIndex}
            onAdvanceExercise={handleAdvanceExercise}
          />
      
          {/* VISIBILITY: Pause overlay shows clear status */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
              <div className="bg-white rounded-2xl p-8 text-center space-y-4 shadow-2xl border-2" style={{ borderColor: '#B8621B' }}>
                <Pause className="w-16 h-16 mx-auto" style={{ color: '#B8621B' }} />
                <h2 style={{ color: '#B8621B' }}>Paused</h2>
                <p className="text-sm" style={{ color: '#8B6F47' }}>Click Resume to continue</p>
                <div className="flex gap-3">
                  <Button 
                    onClick={togglePause}
                    className="text-white rounded-xl"
                    style={{ backgroundColor: '#B8621B' }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                  <Button 
                    onClick={startGame}
                    variant="outline"
                    className="rounded-xl"
                    style={{ borderColor: '#B8621B', color: '#B8621B' }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* FEEDBACK: Game over overlay in center of screen */}
          {timeLeft === 0 && !isPlaying && score > 0 && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-20">
              <div className="bg-white rounded-2xl p-8 text-center space-y-4 shadow-2xl max-w-sm border-2" style={{ borderColor: '#B8621B' }}>
                <h2 style={{ color: '#B8621B' }}>Game Over!</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg p-4" style={{ backgroundColor: '#FFD7B5' }}>
                    <p className="text-xs" style={{ color: '#8B6F47' }}>Final Score</p>
                    <p style={{ color: '#B8621B' }}>{score}</p>
                  </div>
                  <div className="rounded-lg p-4" style={{ backgroundColor: '#FFD7B5' }}>
                    <p className="text-xs" style={{ color: '#8B6F47' }}>Accuracy</p>
                    <p style={{ color: '#B8621B' }}>{accuracy}%</p>
                  </div>
                </div>
                {score === highScore && score > 0 && (
                  <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#B8621B' }}>
                    <p className="text-white text-sm">🏆 New High Score!</p>
                  </div>
                )}
                <Button 
                  onClick={startGame}
                  className="text-white w-full rounded-xl"
                  style={{ backgroundColor: '#B8621B' }}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* CONTROL: User control buttons */}
        <div className="text-center">
          {!isPlaying ? (
            <div className="space-y-1.5">
              <Button 
                onClick={startGame}
                className="text-white px-10 py-5 rounded-xl shadow-lg transition-all hover:scale-105 text-base"
                style={{ backgroundColor: '#B8621B' }}
              >
                <Play className="w-5 h-5 mr-2" />
                {timeLeft === 0 ? 'Play Again' : 'Start Game'}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <Button 
                onClick={togglePause}
                variant="outline"
                className="rounded-lg border-2 px-4 py-2"
                style={{ borderColor: '#B8621B', color: '#B8621B', backgroundColor: 'rgba(184, 98, 27, 0.1)' }}
              >
                {isPaused ? <Play className="w-4 h-4 mr-1.5" /> : <Pause className="w-4 h-4 mr-1.5" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              <Button 
                onClick={startGame}
                variant="outline"
                className="rounded-lg border-2 px-4 py-2"
                style={{ borderColor: '#B8621B', color: '#B8621B', backgroundColor: 'rgba(184, 98, 27, 0.1)' }}
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Restart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
