import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, RotateCcw, Play, Pause } from 'lucide-react';
import dinoImage from 'figma:asset/3a519b4fad679bec0e5a1851cb49a7ecc7330095.png';

interface JumpGameProps {
  onBack: () => void;
}

interface Obstacle {
  x: number;
  gapY: number;
  gapSize: number;
  passed: boolean;
}

type GameState = 'ready' | 'playing' | 'paused' | 'gameOver';

export function JumpGame({ onBack }: JumpGameProps) {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dinoY, setDinoY] = useState(250);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  
  const velocityRef = useRef(0);
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLDivElement>(null);

  const GRAVITY = 0.1;
  const JUMP_STRENGTH = -5;
  const DINO_SIZE = 50;
  const OBSTACLE_WIDTH = 60;
  const OBSTACLE_GAP = 250;
  const OBSTACLE_SPEED = 1.5;
  const GAME_WIDTH = 400;
  const GAME_HEIGHT = 600;

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setDinoY(250);
    velocityRef.current = 0;
    setObstacles([
      { x: GAME_WIDTH + 100, gapY: 250, gapSize: OBSTACLE_GAP, passed: false },
      { x: GAME_WIDTH + 350, gapY: 200, gapSize: OBSTACLE_GAP, passed: false },
    ]);
  };

  const jump = () => {
    if (gameState === 'playing') {
      velocityRef.current = JUMP_STRENGTH;
    } else if (gameState === 'ready') {
      startGame();
    }
  };

  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      setGameState('playing');
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        jump();
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const gameLoop = () => {
      // Update dino position
      velocityRef.current += GRAVITY;
      setDinoY(prev => {
        const newY = prev + velocityRef.current;
        
        // Check boundary collision
        if (newY < 0 || newY > GAME_HEIGHT - DINO_SIZE) {
          setGameState('gameOver');
          if (score > highScore) {
            setHighScore(score);
          }
          return prev;
        }
        
        return newY;
      });

      // Update obstacles
      setObstacles(prev => {
        let newObstacles = prev.map(obs => ({ ...obs, x: obs.x - OBSTACLE_SPEED }));
        let newScore = score;

        // Check collisions and scoring
        newObstacles.forEach(obs => {
          const dinoLeft = 80;
          const dinoRight = dinoLeft + DINO_SIZE;
          const dinoTop = dinoY;
          const dinoBottom = dinoY + DINO_SIZE;

          const obsLeft = obs.x;
          const obsRight = obs.x + OBSTACLE_WIDTH;
          const gapTop = obs.gapY;
          const gapBottom = obs.gapY + obs.gapSize;

          // Check if dino passed obstacle
          if (!obs.passed && dinoLeft > obsRight) {
            obs.passed = true;
            newScore++;
          }

          // Check collision
          if (dinoRight > obsLeft && dinoLeft < obsRight) {
            if (dinoTop < gapTop || dinoBottom > gapBottom) {
              setGameState('gameOver');
              if (newScore > highScore) {
                setHighScore(newScore);
              }
            }
          }
        });

        if (newScore !== score) {
          setScore(newScore);
        }

        // Remove off-screen obstacles and add new ones
        newObstacles = newObstacles.filter(obs => obs.x > -OBSTACLE_WIDTH);
        
        if (newObstacles.length < 3) {
          const lastObs = newObstacles[newObstacles.length - 1];
          if (lastObs.x < GAME_WIDTH - 250) {
            const gapY = Math.random() * (GAME_HEIGHT - OBSTACLE_GAP - 100) + 50;
            newObstacles.push({
              x: GAME_WIDTH,
              gapY,
              gapSize: OBSTACLE_GAP,
              passed: false,
            });
          }
        }

        return newObstacles;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, dinoY, score, highScore]);

  return (
    <div className="h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#F5E5C7' }}>
      <div className="w-full max-w-md px-2 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl border-2 hover:bg-white/50 transition-colors text-xs sm:text-sm"
            style={{ borderColor: '#B8621B', color: '#B8621B' }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Menu</span>
          </button>
          
          <div className="text-center">
            <div className="text-2xl sm:text-3xl" style={{ color: '#B8621B' }}>{score}</div>
            <div className="text-xs" style={{ color: '#8B6F47' }}>Score</div>
          </div>

          {gameState === 'playing' && (
            <button
              onClick={togglePause}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center hover:bg-white/50 transition-colors"
              style={{ borderColor: '#B8621B', color: '#B8621B' }}
            >
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          {gameState !== 'playing' && (
            <div className="w-10 h-10 sm:w-12 sm:h-12"></div>
          )}
        </div>

        {/* Game Canvas */}
        <div 
          ref={canvasRef}
          onClick={jump}
          className="relative border-4 rounded-2xl overflow-hidden cursor-pointer w-full mx-auto"
          style={{ 
            maxWidth: GAME_WIDTH,
            aspectRatio: `${GAME_WIDTH} / ${GAME_HEIGHT}`,
            backgroundColor: '#FFE8D6',
            borderColor: '#B8621B',
          }}
        >
          {/* Obstacles */}
          {gameState !== 'ready' && obstacles.map((obs, idx) => (
            <div key={idx}>
              {/* Top pipe */}
              <div
                className="absolute rounded-lg"
                style={{
                  left: obs.x,
                  top: 0,
                  width: OBSTACLE_WIDTH,
                  height: obs.gapY,
                  backgroundColor: '#B8621B',
                }}
              />
              {/* Bottom pipe */}
              <div
                className="absolute rounded-lg"
                style={{
                  left: obs.x,
                  top: obs.gapY + obs.gapSize,
                  width: OBSTACLE_WIDTH,
                  height: GAME_HEIGHT - (obs.gapY + obs.gapSize),
                  backgroundColor: '#B8621B',
                }}
              />
            </div>
          ))}

          {/* Dino */}
          {gameState !== 'ready' && (
            <div
              className="absolute transition-transform"
              style={{
                left: 80,
                top: dinoY,
                width: DINO_SIZE,
                height: DINO_SIZE,
                transform: velocityRef.current < 0 ? 'rotate(-15deg)' : 'rotate(15deg)',
              }}
            >
              <img 
                src={dinoImage} 
                alt="Dinosaur" 
                className="w-full h-full object-contain"
                style={{ filter: 'none' }}
              />
            </div>
          )}

          {/* Ready State */}
          {gameState === 'ready' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
              <div className="bg-white rounded-3xl p-8 text-center border-4 shadow-2xl" style={{ borderColor: '#B8621B' }}>
                <img src={dinoImage} alt="Dinosaur" className="w-24 h-24 object-contain mx-auto mb-4" />
                <h2 className="text-2xl mb-2" style={{ color: '#B8621B' }}>Jump Game</h2>
                <p className="text-sm mb-4" style={{ color: '#8B6F47' }}>
                  Click or press Space/Enter to jump
                </p>
                <button
                  onClick={startGame}
                  className="px-6 py-3 rounded-xl border-2 flex items-center gap-2 mx-auto hover:bg-white transition-colors"
                  style={{ borderColor: '#B8621B', color: '#B8621B', backgroundColor: '#FFD7B5' }}
                >
                  <Play className="w-5 h-5" />
                  Start Game
                </button>
                {highScore > 0 && (
                  <p className="text-sm mt-4" style={{ color: '#8B6F47' }}>
                    High Score: {highScore}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Paused State */}
          {gameState === 'paused' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
              <div className="bg-white rounded-3xl p-8 text-center border-4 shadow-2xl" style={{ borderColor: '#B8621B' }}>
                <h2 className="text-2xl mb-4" style={{ color: '#B8621B' }}>Paused</h2>
                <button
                  onClick={togglePause}
                  className="px-6 py-3 rounded-xl border-2 flex items-center gap-2 mx-auto hover:bg-white transition-colors"
                  style={{ borderColor: '#B8621B', color: '#B8621B', backgroundColor: '#FFD7B5' }}
                >
                  <Play className="w-5 h-5" />
                  Resume
                </button>
              </div>
            </div>
          )}

          {/* Game Over State */}
          {gameState === 'gameOver' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
              <div className="bg-white rounded-3xl p-8 text-center border-4 shadow-2xl" style={{ borderColor: '#B8621B' }}>
                <h2 className="text-2xl mb-2" style={{ color: '#B8621B' }}>Game Over!</h2>
                <div className="text-4xl mb-2" style={{ color: '#B8621B' }}>{score}</div>
                <p className="text-sm mb-1" style={{ color: '#8B6F47' }}>Final Score</p>
                {score >= highScore && score > 0 && (
                  <p className="text-sm mb-4" style={{ color: '#B8621B' }}>🎉 New High Score!</p>
                )}
                {highScore > 0 && score < highScore && (
                  <p className="text-sm mb-4" style={{ color: '#8B6F47' }}>
                    High Score: {highScore}
                  </p>
                )}
                <button
                  onClick={startGame}
                  className="px-6 py-3 rounded-xl border-2 flex items-center gap-2 mx-auto hover:bg-white transition-colors"
                  style={{ borderColor: '#B8621B', color: '#B8621B', backgroundColor: '#FFD7B5' }}
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center">
          <p className="text-sm" style={{ color: '#8B6F47' }}>
            {gameState === 'ready' && 'Click or press Space/Enter to start'}
            {gameState === 'playing' && 'Click or Space/Enter to jump • P to pause'}
            {gameState === 'paused' && 'Press P or click Resume to continue'}
            {gameState === 'gameOver' && 'Click Play Again to retry'}
          </p>
        </div>
      </div>
    </div>
  );
}