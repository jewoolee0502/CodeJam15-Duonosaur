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
  const [debugLog, setDebugLog] = useState('');

  // Sample exercises (replace or extend as needed)
  const exercises = [
    {
      id: 0,
      sentence: "J'aimes les pommes",
      mistake: 'aimes',
      words: ["J'", 'aimes', 'les', 'pommes']
    },
    {
      id: 1,
      sentence: 'Je mange un banane',
      mistake: 'un',
      words: ['Je', 'mange', 'un', 'banane']
    }
  ];

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
        setDebugLog('Whack: HIT');
      } else {
        setMissedClicks(prev => prev + 1);
        setDebugLog('Whack: MISS');
      }
    }
  }, [isPlaying, isPaused]);

  // Calculate accuracy for user feedback
  const accuracy = score + missedClicks > 0 
    ? Math.round((score / (score + missedClicks)) * 100) 
    : 0;

  const handleGameSelect = (game: 'whack-a-mole' | 'jump' | 'dunolingo' | 'chat-learning') => {
    if (game === 'whack-a-mole') {
      startGame();
    } else if (game === 'jump') {
      setCurrentScreen('jump');
    } else if (game === 'dunolingo') {
      setCurrentScreen('dunolingo');
    } else if (game === 'chat-learning') {
      setCurrentScreen('chat-learning');
    }
  };

  const handleAdvanceExercise = useCallback((correct: boolean) => {
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
      const [debugLog, setDebugLog] = useState('');

      // Sample exercises (replace or extend as needed)
      const exercises = [
        {
          id: 0,
          sentence: "J'aimes les pommes",
          mistake: 'aimes',
          words: ["J'", 'aimes', 'les', 'pommes']
        },
        {
          id: 1,
          sentence: 'Je mange un banane',
          mistake: 'mange',
          words: ['Je', 'mange', 'un', 'banane']
        }
      ];

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
            setDebugLog('Whack: HIT');
          } else {
            setMissedClicks(prev => prev + 1);
            setDebugLog('Whack: MISS');
          }
        }
      }, [isPlaying, isPaused]);

      // Calculate accuracy for user feedback
      const accuracy = score + missedClicks > 0 
        ? Math.round((score / (score + missedClicks)) * 100) 
        : 0;

      const handleGameSelect = (game: 'whack-a-mole' | 'jump' | 'dunolingo' | 'chat-learning') => {
        if (game === 'whack-a-mole') {
          startGame();
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
        setDebugLog(`advance: ${correct ? 'correct' : 'incorrect'}`);
        // Score is incremented via handleWhack when a correct hit occurs.
        setCurrentExerciseIndex(prev => (prev + 1) % exercises.length);
      }, [exercises.length]);

      const handleBackToMenu = () => {
        setCurrentScreen('menu');
        setIsPlaying(false);
        setIsPaused(false);
        setTimeLeft(30);
      };

      if (currentScreen === 'menu') {
        return <StartMenu onSelectGame={handleGameSelect} />;
      }

      if (currentScreen === 'start') {
        return <StartMenu onSelectGame={handleGameSelect} />;
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
          {/* Debug indicator (always visible) */}
          <div className="fixed left-4 bottom-4 text-xs px-3 py-2 rounded bg-white/90 border" style={{ borderColor: '#B8621B', color: '#6B5335' }}>
            <strong className="block">Debug</strong>
            <div>{debugLog}</div>
          </div>
        </div>
      );
    }