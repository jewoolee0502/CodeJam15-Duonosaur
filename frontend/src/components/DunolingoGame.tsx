import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  Mic,
  MicOff,
} from "lucide-react";
import dinoImage from "../assets/dinosaur_running_improved.gif";

interface DunolingoGameProps {
  onBack: () => void;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
  passed: boolean;
}

type GameState = "ready" | "playing" | "paused" | "gameOver";
type WordState = "neutral" | "correct" | "wrong";

export function DunolingoGame({ onBack }: DunolingoGameProps) {
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
  const gameLoopRef = useRef<number>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const GRAVITY = 0.6;
  const JUMP_STRENGTH = -12;
  const DINO_SIZE = 50;
  const GROUND_HEIGHT = 20;
  const GROUND_OFFSET = 150;
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 600;
  const DINO_X = 100;

  const correctAnswer = "Ordinateur";
  const wrongAnswer = "Clavier";
  const correctWords = ["ordinateur", "computer"];
  const wrongWords = ["clavier", "keyboard"];

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setDinoY(0);
    setIsJumping(false);
    velocityRef.current = 0;
    setGameSpeed(3);
    setWordState("neutral");
    setObstacles([
      {
        x: GAME_WIDTH + 200,
        width: 20,
        height: 40,
        passed: false,
      },
    ]);
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
      recognitionRef.current.maxAlternatives = 3;

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const result = event.results[current][0];
        const transcript = result.transcript
          .toLowerCase()
          .trim();

        if (result.confidence > 0.3) {
          setSpokenText(transcript);
          console.log("You said:", transcript);

          if (
            correctWords.some((word) =>
              transcript.includes(word),
            )
          ) {
            setWordState("correct");
            setVoiceFeedback("✓ Correct!");
            jump();
            setTimeout(() => {
              setVoiceFeedback("");
              setWordState("neutral");
            }, 1500);
          } else if (
            wrongWords.some((word) => transcript.includes(word))
          ) {
            setWordState("wrong");
            setVoiceFeedback("✗ Wrong word!");
            setTimeout(() => {
              setVoiceFeedback("");
              setWordState("neutral");
            }, 1500);
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "no-speech") {
          recognitionRef.current.stop();
          setTimeout(
            () => isListening && recognitionRef.current.start(),
            100,
          );
        } else {
          setIsListening(false);
          setVoiceFeedback("Error - try again");
          setTimeout(() => setVoiceFeedback(""), 1500);
        }
      };

      recognitionRef.current.onend = () => {
        if (isListening && gameState === "playing") {
          setTimeout(() => recognitionRef.current.start(), 100);
        } else {
          setIsListening(false);
        }
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
    if (recognitionRef.current) {
      setSpokenText("");
      setVoiceFeedback("Listening...");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      } else if (e.code === "KeyP") {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () =>
      window.removeEventListener("keydown", handleKeyPress);
  }, [gameState, isJumping]);

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

        if (
          newObstacles.length === 0 ||
          newObstacles[newObstacles.length - 1].x <
            GAME_WIDTH - 300
        ) {
          const minGap = 250;
          const maxGap = 400;
          const gap =
            Math.random() * (maxGap - minGap) + minGap;

          const lastObsX =
            newObstacles.length > 0
              ? newObstacles[newObstacles.length - 1].x
              : GAME_WIDTH;

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

          newObstacles.push({
            x: lastObsX + gap,
            width,
            height,
            passed: false,
          });
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
          onClick={jump}
          className="relative border-4 rounded-2xl overflow-hidden cursor-pointer w-full mx-auto"
          style={{
            height: GAME_HEIGHT,
            backgroundColor: "#FFE8D6",
            borderColor: "#B8621B",
          }}
        >
          <div
            className="absolute top-4 left-1/2 transform -translate-x-1/2 text-3xl px-6 py-2 rounded-xl bg-white/90 border-2"
            style={{ color: "#B8621B", borderColor: "#B8621B" }}
          >
            Computer
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
              style={getWordStyle(true)}
            >
              {correctAnswer}
            </div>
            <div
              className="text-2xl px-6 py-3 rounded-xl border-2 transition-all duration-300"
              style={getWordStyle(false)}
            >
              {wrongAnswer}
            </div>
          </div>

          {gameState !== "ready" &&
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

          {gameState !== "ready" && (
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

          {gameState === "ready" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
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
                <p
                  className="text-sm mb-4"
                  style={{ color: "#8B6F47" }}
                >
                  Press Space or click to jump over obstacles
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
                {highScore > 0 && (
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

          {gameState === "gameOver" && (
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
              "Click or press Space to start"}
            {gameState === "playing" &&
              "Space or Click to jump • P to pause"}
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