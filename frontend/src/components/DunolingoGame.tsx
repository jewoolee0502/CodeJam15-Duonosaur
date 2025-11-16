import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  Mic,
  MicOff,
  Loader2,
} from "lucide-react";
import dinoImage from "../assets/dinosaur_running_improved.gif";

interface DunolingoGameProps {
  onBack: () => void;
  exercises?: DinoExercise[];
  isLoading?: boolean;
  onRefetch?: () => Promise<void>;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
  passed: boolean;
}

type GameState = "ready" | "playing" | "paused" | "gameOver";
type WordState = "neutral" | "correct" | "wrong";

interface DinoExercise {
  english_word: string,
  right_translation: string,
  wrong_translation: string
}

export function DunolingoGame({ onBack, exercises: propDinoExercises = [], isLoading = false, onRefetch }: DunolingoGameProps) {
  const [gameState, setGameState] =
    useState<GameState>("ready");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [dinoY, setDinoY] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [gameSpeed, setGameSpeed] = useState(3);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [voiceFeedback, setVoiceFeedback] = useState("");
  const [wordState, setWordState] =
    useState<WordState>("neutral");

  const velocityRef = useRef(0);
  const dinoExerciseListRef = useRef<DinoExercise[]>([]);
  const [dinoExercises, setDinoExercises] = useState<DinoExercise[]>(propDinoExercises);
  const [currentDinoExerciseIndex, setCurrentDinoExerciseIndex] = useState(0);
  const dinoExerciseIndexRef = useRef(0);
  const [isCorrectAnswerOnLeft, setIsCorrectAnswerOnLeft] = useState(true);
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const lastJumpedWordRef = useRef<string>(''); // Track last word that triggered jump to prevent duplicate jumps
  const shouldBeListeningRef = useRef(false); // Track if we want to be listening
  const isStartingRef = useRef(false); // Track if we're currently trying to start
  const pendingCorrectWordRef = useRef(false); // Track if we detected correct word but haven't jumped yet
  const hasJumpedForCurrentObstacleRef = useRef(false); // Track if we've already jumped for the current obstacle
  const gameStateRef = useRef<GameState>(gameState); // Track game state for use in speech recognition handler
  
  // Helper function to randomly assign correct answer position
  const randomizeAnswerPosition = () => {
    setIsCorrectAnswerOnLeft(Math.random() < 0.5);
  };
  
  // keep dinoExerciseIndexRef in sync with state
  useEffect(() => {
    dinoExerciseIndexRef.current = currentDinoExerciseIndex;
    // Randomly assign correct answer position when exercise changes
    randomizeAnswerPosition();
  }, [currentDinoExerciseIndex]);

  // Update dinoExercises when propDinoExercises changes
  useEffect(() => {
    if (propDinoExercises.length > 0) {
      dinoExerciseListRef.current = propDinoExercises;
      setDinoExercises(propDinoExercises);
      setCurrentDinoExerciseIndex(0);
      // Randomly assign correct answer position for first exercise
      randomizeAnswerPosition();
    }
  }, [propDinoExercises]);

  // Keep gameStateRef in sync with gameState
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const GRAVITY = 0.45;
  const JUMP_STRENGTH = -12;
  const DINO_SIZE = 50;
  const GROUND_HEIGHT = 20;
  const GROUND_OFFSET = 150;
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const DINO_X = 100;

  const createObstacle = () => {
    const obstacleType = Math.random();
    let width, height;

    if (obstacleType < 0.3) {
      width = 20;
      height = 50;
    } else if (obstacleType < 0.6) {
      width = 30;
      height = 40;
    } else {
      width = 40;
      height = 30;
    }

    // Spawn obstacles 500px away from the dinosaur
    // Dinosaur is at DINO_X (100), so obstacles start at 100 + 500 = 600px
    const spawnDistance = DINO_X + 300; // 600px from left edge

    return {
      x: spawnDistance,
      width,
      height,
      passed: false,
    };
  };

  const startGame = async () => {
    // If game is over and onRefetch is available, refetch dino exercises
    if (gameState === "gameOver" && onRefetch) {
      await onRefetch();
      // Reset to ready state after refetching so user sees "Start Game" button with new data
      setGameState("ready");
      setScore(0);
      setDinoY(0);
      setIsJumping(false);
      velocityRef.current = 0;
      setGameSpeed(3);
      setWordState("neutral");
      pendingCorrectWordRef.current = false;
      hasJumpedForCurrentObstacleRef.current = false;
      setObstacles([]);
      setCurrentDinoExerciseIndex(0);
      randomizeAnswerPosition();
      return;
    }
    setGameState("playing");
    setScore(0);
    setDinoY(0);
    setIsJumping(false);
    velocityRef.current = 0;
    setGameSpeed(3);
    setWordState("neutral");
    pendingCorrectWordRef.current = false;
    hasJumpedForCurrentObstacleRef.current = false;
    setObstacles([]);
    // Randomly assign correct answer position when starting game
    randomizeAnswerPosition();
  };

  const jump = () => {
    if (gameState === "playing" && !isJumping) {
      velocityRef.current = JUMP_STRENGTH;
      setIsJumping(true);
    } else if (gameState === "ready") {
      startGame();
    }
  };

  const togglePause = () => {
    if (gameState === "playing") {
      setGameState("paused");
    } else if (gameState === "paused") {
      setGameState("playing");
    }
  };

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "webkitSpeechRecognition" in window
    ) {
      const SpeechRecognition = (window as any)
        .webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = "fr-FR";
      recognitionRef.current.maxAlternatives = 1; // Reduce to 1 for faster processing

      // Pre-compute normalized answers for faster matching
      // We'll compute current dinoExercise values inside the onresult handler using refs so we always use the latest dinoExercise.

      recognitionRef.current.onresult = (event: any) => {
        const currDinoExercise = dinoExerciseListRef.current[dinoExerciseIndexRef.current];
        if (!currDinoExercise) {
          // No dinoExercise loaded yet; ignore speech events
          return;
        }
        const correctAnswerLower = (currDinoExercise.right_translation || "").toLowerCase().trim();
        const wrongAnswerLower = (currDinoExercise.wrong_translation || "").toLowerCase().trim();
        const correctAnswerMinLength = Math.max(3, Math.floor(correctAnswerLower.length * 0.6)); // Check when ~60% of word is spoken

        // Process all results immediately, prioritizing speed
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i][0];
          const isFinal = event.results[i].isFinal;
          
          // Extremely low confidence threshold for fastest detection - accept any result
          const confidenceThreshold = isFinal ? 0.01 : 0.0;
          
          if (result.confidence > confidenceThreshold) {
            // Fast normalization - minimal processing
            const transcript = result.transcript
              .toLowerCase()
              .replace(/[.,!?;:\s]+/g, ' ') // Remove punctuation and normalize spaces in one pass
              .trim();
            
            setSpokenText(transcript);
            console.log("You said:", transcript, isFinal ? "(final)" : "(interim)", "confidence:", result.confidence);

            // Fast word extraction
            const words = transcript.split(/\s+/).filter(w => w.length > 0);
            
            // Generate obstacle when any word is detected (only on final results to avoid duplicates)
            if (isFinal && words.length > 0 && gameStateRef.current === "playing") {
              // Create a new obstacle when a word is detected - no limit, infinite obstacles
              setObstacles((prev) => {
                return [...prev, createObstacle()];
              });
            }
            
            // Check for exact match first (fastest path)
            let matchedWord = null;
            for (const word of words) {
              if (word === correctAnswerLower) {
                matchedWord = word;
                break;
              }
            }
            
            // If exact match found, mark as pending and wait for optimal jump timing
            if (matchedWord && matchedWord !== lastJumpedWordRef.current) {
              lastJumpedWordRef.current = matchedWord;
              
              // Set pending flag - jump will happen when obstacle is near
              pendingCorrectWordRef.current = true;
              hasJumpedForCurrentObstacleRef.current = false;
              
              requestAnimationFrame(() => {
                setWordState("correct");
                // setVoiceFeedback("✓ Correct! Waiting for obstacle...");
              });
              
              // Skip processing other words once we found a match
              continue;
            }
            
            // Check for partial match on interim results for even faster detection
            if (!isFinal && words.length > 0) {
              const lastWord = words[words.length - 1];
              // Check if the last word is a prefix of the correct answer (user is still speaking)
              // This allows jumping when ~60% of the word is detected
              if (lastWord.length >= correctAnswerMinLength && 
                  correctAnswerLower.startsWith(lastWord) &&
                  lastWord !== lastJumpedWordRef.current) {
                // Very likely the correct word is being spoken - mark as pending
                lastJumpedWordRef.current = lastWord;
                
                // Set pending flag - jump will happen when obstacle is near
                pendingCorrectWordRef.current = true;
                hasJumpedForCurrentObstacleRef.current = false;
                
                requestAnimationFrame(() => {
                  setWordState("correct");
                  // setVoiceFeedback("✓ Correct! Waiting for obstacle...");
                });
                
                continue;
              }
            }
            
            // Check for wrong answer only on final results
            if (isFinal) {
              const hasWrongAnswer = words.some(word => word === wrongAnswerLower);
              if (hasWrongAnswer) {
                setWordState("wrong");
                // setVoiceFeedback("✗ Wrong word!");
                setTimeout(() => {
                  setVoiceFeedback("");
                  setWordState("neutral");
                }, 1000);
              }
            }
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        isStartingRef.current = false; // Reset starting flag
        
        if (event.error === "no-speech") {
          // No speech detected - this is normal, let onend handle restart
          return;
        } else if (event.error === "aborted") {
          // User stopped - this is fine
          return;
        } else if (event.error === "not-allowed") {
          setIsListening(false);
          shouldBeListeningRef.current = false;
          setVoiceFeedback("Microphone permission denied");
          setTimeout(() => setVoiceFeedback(""), 2000);
        } else {
          // Other errors - try to restart if we should be listening
          setIsListening(false);
          setVoiceFeedback("Error - retrying...");
          setTimeout(() => {
            if (shouldBeListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error("Failed to restart after error:", e);
                setVoiceFeedback("Error - try clicking Start Listening again");
                setTimeout(() => setVoiceFeedback(""), 2000);
              }
            }
          }, 500);
        }
      };

      recognitionRef.current.onend = () => {
        isStartingRef.current = false; // Reset starting flag
        
        // Auto-restart if we should still be listening
        if (shouldBeListeningRef.current && recognitionRef.current) {
          setTimeout(() => {
            if (shouldBeListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                // Recognition might already be starting or stopped
                console.log("Recognition restart skipped:", e);
              }
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current.onstart = () => {
        isStartingRef.current = false;
        setIsListening(true);
        setVoiceFeedback(""); // No message when listening starts
      };

      recognitionRef.current.onaudiostart = () =>
        console.log("Audio detected");
      recognitionRef.current.onspeechstart = () =>
        console.log("Speech detected");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, gameState]);

  const startListening = () => {
    if (!recognitionRef.current) {
      setVoiceFeedback("Speech recognition not available");
      setTimeout(() => setVoiceFeedback(""), 2000);
      return;
    }

    // Prevent multiple simultaneous start attempts
    if (isStartingRef.current || isListening) {
      console.log("Already starting or listening");
      return;
    }

    try {
      shouldBeListeningRef.current = true;
      isStartingRef.current = true;
      setSpokenText("");
      setVoiceFeedback(""); // No message when starting
      setIsListening(true);
      
      recognitionRef.current.start();
    } catch (err: any) {
      isStartingRef.current = false;
      console.error("Error starting recognition:", err);
      
      if (err.message?.includes('already started') || err.name === 'InvalidStateError') {
        // Already started - this is fine, just update state
        shouldBeListeningRef.current = true;
        setIsListening(true);
        setVoiceFeedback(""); // No message when already started
      } else {
        shouldBeListeningRef.current = false;
        setIsListening(false);
        setVoiceFeedback("Failed to start - try again");
        setTimeout(() => setVoiceFeedback(""), 2000);
      }
    }
  };

  const stopListening = () => {
    shouldBeListeningRef.current = false;
    isStartingRef.current = false;
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
    setIsListening(false);
    setVoiceFeedback("");
  };

  // Stop microphone immediately when game is over
  useEffect(() => {
    if (gameState === "gameOver") {
      stopListening();
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "KeyP") {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () =>
      window.removeEventListener("keydown", handleKeyPress);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = () => {
      velocityRef.current += GRAVITY;
      setDinoY((prev) => {
        const newY = prev + velocityRef.current;

        if (newY >= 0) {
          setIsJumping(false);
          velocityRef.current = 0;
          return 0;
        }

        return newY;
      });

      setObstacles((prev) => {
        let newObstacles = prev.map((obs) => ({
          ...obs,
          x: obs.x - gameSpeed,
        }));
        let newScore = score;

        // Find the nearest unpased obstacle
        const nearestObstacle = newObstacles
          .filter(obs => !obs.passed)
          .sort((a, b) => a.x - b.x)[0];

        // Check if we have a pending correct word and should jump
        if (pendingCorrectWordRef.current && nearestObstacle && !hasJumpedForCurrentObstacleRef.current && dinoY === 0) {
          const dinoRight = DINO_X + DINO_SIZE;
          const obsLeft = nearestObstacle.x;
          const distanceToObstacle = obsLeft - dinoRight;
          
          // Optimal jump distance: when obstacle is 20-50 pixels away
          // Jump closer for more exciting gameplay
          const maxJumpDistance = 50;
          const minJumpDistance = 20;
          
          if (distanceToObstacle <= maxJumpDistance && distanceToObstacle >= minJumpDistance) {
            // Trigger jump at optimal timing (close to obstacle)
            hasJumpedForCurrentObstacleRef.current = true;
            jump();
            // setVoiceFeedback("✓ Jumping!");
          } else if (distanceToObstacle < minJumpDistance && distanceToObstacle > 0) {
            // Very close but still ahead - jump immediately to avoid collision
            hasJumpedForCurrentObstacleRef.current = true;
            jump();
            // setVoiceFeedback("✓ Jumping!");
          } else if (distanceToObstacle < 0) {
            // Obstacle already passed - reset state (word detected too late)
            pendingCorrectWordRef.current = false;
            hasJumpedForCurrentObstacleRef.current = false;
            lastJumpedWordRef.current = '';
            setWordState("neutral");
            // setVoiceFeedback("Too late - obstacle passed");
            setTimeout(() => setVoiceFeedback(""), 1500);
          }
        }

        newObstacles.forEach((obs) => {
          const dinoLeft = DINO_X;
          const dinoRight = DINO_X + DINO_SIZE;
          const dinoTop =
            GAME_HEIGHT - GROUND_HEIGHT - DINO_SIZE + dinoY;
          const dinoBottom =
            GAME_HEIGHT - GROUND_HEIGHT + dinoY;

          const obsLeft = obs.x;
          const obsRight = obs.x + obs.width;
          const obsTop =
            GAME_HEIGHT - GROUND_HEIGHT - obs.height;
          const obsBottom = GAME_HEIGHT - GROUND_HEIGHT;

          if (!obs.passed && dinoRight > obsRight) {
            obs.passed = true;
            newScore++;
            
            // Reset pending state after successfully passing obstacle
            if (pendingCorrectWordRef.current && hasJumpedForCurrentObstacleRef.current) {
              // advance to next dinoExercise when user passed an obstacle using a correct spoken word
              pendingCorrectWordRef.current = false;
              hasJumpedForCurrentObstacleRef.current = false;
              lastJumpedWordRef.current = '';
              setWordState("neutral");
              setVoiceFeedback("");

              if (dinoExerciseListRef.current.length > 0) {
                setCurrentDinoExerciseIndex((prev) => {
                  const nextIdx = (prev + 1) % dinoExerciseListRef.current.length;
                  return nextIdx;
                });
              }
            }

          }

          if (dinoRight > obsLeft && dinoLeft < obsRight) {
            if (dinoBottom > obsTop && dinoTop < obsBottom) {
              setGameState("gameOver");
              if (newScore > highScore) {
                setHighScore(newScore);
              }
            }
          }
        });

        if (newScore !== score) {
          setScore(newScore);
          if (newScore % 5 === 0 && newScore > 0) {
            setGameSpeed((prev) => Math.min(prev + 0.5, 12));
          }
        }

        newObstacles = newObstacles.filter(
          (obs) => obs.x > -obs.width,
        );

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
  }, [
    gameState,
    dinoY,
    score,
    highScore,
    gameSpeed,
    isJumping,
  ]);

  const getWordStyle = (isCorrect: boolean) => {
    if (wordState === "neutral") {
      return {
        color: "#B8621B",
        borderColor: "#FFD7B5",
        backgroundColor: "white",
      };
    }
    if (isCorrect && wordState === "correct") {
      return {
        color: "#22C55E",
        borderColor: "#22C55E",
        backgroundColor: "#F0FDF4",
      };
    }
    if (!isCorrect && wordState === "wrong") {
      return {
        color: "#EF4444",
        borderColor: "#EF4444",
        backgroundColor: "#FEF2F2",
      };
    }
    return {
      color: "#B8621B",
      borderColor: "#FFD7B5",
      backgroundColor: "white",
    };
  };

  return (
    <div
      className="h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#F5E5C7" }}
    >
      <div className="w-full max-w-4xl px-2 sm:px-4">
        <div className="flex items-center justify-between mb-2 sm:mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-xl border-2 hover:bg-white/50 transition-colors text-xs sm:text-sm"
            style={{ borderColor: "#B8621B", color: "#B8621B" }}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Menu</span>
          </button>

          <div className="text-center">
            <div
              className="text-2xl sm:text-3xl"
              style={{ color: "#B8621B" }}
            >
              {score}
            </div>
            <div
              className="text-xs"
              style={{ color: "#8B6F47" }}
            >
              Score
            </div>
          </div>

          {gameState === "playing" && (
            <button
              onClick={togglePause}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center hover:bg-white/50 transition-colors"
              style={{
                borderColor: "#B8621B",
                color: "#B8621B",
              }}
            >
              <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}
          {gameState !== "playing" && (
            <div className="w-10 h-10 sm:w-12 sm:h-12"></div>
          )}
        </div>

        <div
          ref={canvasRef}
          className="relative border-4 rounded-2xl overflow-hidden w-full mx-auto"
          style={{
            height: GAME_HEIGHT,
            backgroundColor: "#FFE8D6",
            borderColor: "#B8621B",
          }}
        >
          {!isLoading && gameState === "playing" && (
            <>
              <div
                className="absolute top-4 left-1/2 transform -translate-x-1/2 text-3xl px-6 py-2 rounded-xl bg-white/90 border-2"
                style={{ color: "#B8621B", borderColor: "#B8621B" }}
              >
                {dinoExercises[currentDinoExerciseIndex]?.english_word ?? (dinoExerciseListRef.current[dinoExerciseIndexRef.current]?.english_word ?? "Loading...")}
              </div>

              <div
                className="absolute left-0 right-0"
                style={{
                  bottom: GROUND_OFFSET,
                  height: GROUND_HEIGHT,
                  backgroundColor: "#B8621B",
                }}
              />

              <div
                className="absolute left-0 right-0 bottom-0 flex items-center justify-center gap-8"
                style={{
                  height: GROUND_OFFSET,
                  backgroundColor: "#B8621B",
                }}
              >
                <div
                  className="text-2xl px-6 py-3 rounded-xl border-2 transition-all duration-300"
                  style={getWordStyle(isCorrectAnswerOnLeft)}
                >
                  {isCorrectAnswerOnLeft 
                    ? (dinoExercises[currentDinoExerciseIndex]?.right_translation ?? (dinoExerciseListRef.current[dinoExerciseIndexRef.current]?.right_translation ?? "Ordinateur"))
                    : (dinoExercises[currentDinoExerciseIndex]?.wrong_translation ?? (dinoExerciseListRef.current[dinoExerciseIndexRef.current]?.wrong_translation ?? "Clavier"))}
                </div>
                <div
                  className="text-2xl px-6 py-3 rounded-xl border-2 transition-all duration-300"
                  style={getWordStyle(!isCorrectAnswerOnLeft)}
                >
                  {!isCorrectAnswerOnLeft 
                    ? (dinoExercises[currentDinoExerciseIndex]?.right_translation ?? (dinoExerciseListRef.current[dinoExerciseIndexRef.current]?.right_translation ?? "Ordinateur"))
                    : (dinoExercises[currentDinoExerciseIndex]?.wrong_translation ?? (dinoExerciseListRef.current[dinoExerciseIndexRef.current]?.wrong_translation ?? "Clavier"))}
                </div>
              </div>
            </>
          )}

          {!isLoading && gameState === "playing" &&
            obstacles.map((obs, idx) => (
              <div
                key={idx}
                className="absolute rounded"
                style={{
                  left: obs.x,
                  bottom: GROUND_HEIGHT + GROUND_OFFSET,
                  width: obs.width,
                  height: obs.height,
                  backgroundColor: "#B8621B",
                }}
              />
            ))}

          {!isLoading && gameState === "playing" && (
            <div
              className="absolute"
              style={{
                left: DINO_X,
                bottom: GROUND_HEIGHT + GROUND_OFFSET - dinoY,
                width: DINO_SIZE,
                height: DINO_SIZE,
              }}
            >
              <img
                src={dinoImage}
                alt="Dinosaur"
                className="w-full h-full object-contain"
                style={{ filter: "none" }}
              />
            </div>
          )}

          {(gameState === "ready" || isLoading) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: isLoading ? "#F5E5C7" : "rgba(0, 0, 0, 0.1)" }}>
              <div
                className="bg-white rounded-3xl p-8 text-center border-4 shadow-2xl"
                style={{ borderColor: "#B8621B" }}
              >
                <img
                  src={dinoImage}
                  alt="Dinosaur"
                  className="w-24 h-24 object-contain mx-auto mb-4"
                />
                <h2
                  className="text-2xl mb-2"
                  style={{ color: "#B8621B" }}
                >
                  Dinolingo
                </h2>
                {isLoading ? (
                  <>
                    <p
                      className="text-sm mb-4"
                      style={{ color: "#8B6F47" }}
                    >
                      Loading dino exercises...
                    </p>
                    <div className="flex justify-center mb-4">
                      <Loader2 
                        className="w-8 h-8" 
                        style={{ 
                          color: "#B8621B",
                          animation: "spin 1s linear infinite"
                        }}
                      />
                    </div>
                  </>
                ) : dinoExercises.length > 0 ? (
                  <>
                    <p
                      className="text-sm mb-4"
                      style={{ color: "#8B6F47" }}
                    >
                      Say the correct word to jump over obstacles
                    </p>
                    <button
                      onClick={startGame}
                      className="px-6 py-3 rounded-xl border-2 flex items-center gap-2 mx-auto hover:bg-white transition-colors"
                      style={{
                        borderColor: "#B8621B",
                        color: "#B8621B",
                        backgroundColor: "#FFD7B5",
                      }}
                    >
                      <Play className="w-5 h-5" />
                      Start Game
                    </button>
                  </>
                ) : (
                  <>
                    <p
                      className="text-sm mb-4"
                      style={{ color: "#EF4444" }}
                    >
                      Failed to load dino exercises. Please try again.
                    </p>
                    <button
                      onClick={onBack}
                      className="px-6 py-3 rounded-xl border-2 flex items-center gap-2 mx-auto hover:bg-white transition-colors"
                      style={{
                        borderColor: "#B8621B",
                        color: "#B8621B",
                        backgroundColor: "#FFD7B5",
                      }}
                    >
                      Back to Menu
                    </button>
                  </>
                )}
                {highScore > 0 && !isLoading && dinoExercises.length > 0 && (
                  <p
                    className="text-sm mt-4"
                    style={{ color: "#8B6F47" }}
                  >
                    High Score: {highScore}
                  </p>
                )}
              </div>
            </div>
          )}

          {gameState === "paused" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
              <div
                className="bg-white rounded-3xl p-8 text-center border-4 shadow-2xl"
                style={{ borderColor: "#B8621B" }}
              >
                <h2
                  className="text-2xl mb-4"
                  style={{ color: "#B8621B" }}
                >
                  Paused
                </h2>
                <button
                  onClick={togglePause}
                  className="px-6 py-3 rounded-xl border-2 flex items-center gap-2 mx-auto hover:bg-white transition-colors"
                  style={{
                    borderColor: "#B8621B",
                    color: "#B8621B",
                    backgroundColor: "#FFD7B5",
                  }}
                >
                  <Play className="w-5 h-5" />
                  Resume
                </button>
              </div>
            </div>
          )}

          {gameState === "gameOver" && !isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30">
              <div
                className="bg-white rounded-3xl p-8 text-center border-4 shadow-2xl"
                style={{ borderColor: "#B8621B" }}
              >
                <h2
                  className="text-2xl mb-2"
                  style={{ color: "#B8621B" }}
                >
                  Game Over!
                </h2>
                <div
                  className="text-4xl mb-2"
                  style={{ color: "#B8621B" }}
                >
                  {score}
                </div>
                <p
                  className="text-sm mb-1"
                  style={{ color: "#8B6F47" }}
                >
                  Final Score
                </p>
                {score >= highScore && score > 0 && (
                  <p
                    className="text-sm mb-4"
                    style={{ color: "#B8621B" }}
                  >
                    🎉 New High Score!
                  </p>
                )}
                {highScore > 0 && score < highScore && (
                  <p
                    className="text-sm mb-4"
                    style={{ color: "#8B6F47" }}
                  >
                    High Score: {highScore}
                  </p>
                )}
                <button
                  onClick={startGame}
                  className="px-6 py-3 rounded-xl border-2 flex items-center gap-2 mx-auto hover:bg-white transition-colors"
                  style={{
                    borderColor: "#B8621B",
                    color: "#B8621B",
                    backgroundColor: "#FFD7B5",
                  }}
                >
                  <RotateCcw className="w-5 h-5" />
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm" style={{ color: "#8B6F47" }}>
            {gameState === "ready" &&
              "Turn on your mic to jump"}
            {gameState === "playing" &&
              "Speak the correct word to jump"}
            {gameState === "paused" &&
              "Press P or click Resume to continue"}
            {gameState === "gameOver" &&
              "Click Play Again to retry"}
          </p>
        </div>

        {voiceFeedback && (
          <div
            className="mt-2 text-center"
            style={{ color: "#B8621B" }}
          >
            {voiceFeedback}
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={
              isListening ? stopListening : startListening
            }
            className="px-6 py-3 rounded-xl border-2 flex items-center gap-2 mx-auto hover:bg-white transition-colors"
            style={{
              borderColor: "#B8621B",
              color: "#B8621B",
              backgroundColor: isListening
                ? "#22C55E"
                : "#FFD7B5",
            }}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            {isListening ? "Stop Listening" : "Start Listening"}
          </button>
        </div>
      </div>
    </div>
  );
}