# CodeJam15-Duonosaur

A collection of French learning games built for a hackathon. This project contains two interactive mini-games designed to make learning French fun and engaging through gameplay.

## Games

### 1. Dinolingo

A Chrome-dino-style endless runner where players must **pronounce French words** to control their character. Players see two French words displayed (e.g., "sauter" for jump and "baisser" for duck) and must speak the correct word when obstacles approach to perform the corresponding action.

#### Key Features

- **Voice-Controlled Gameplay**: Players use speech recognition to trigger actions by pronouncing French words
- **Endless Runner Mechanics**: Character runs continuously with jump and duck actions to avoid obstacles
- **Word Progression System**: Start with 5 unlocked words, unlock new words as you progress (up to 10 unlocked words)
- **On-Device Speech Recognition**: Uses React Native speech recognition libraries for low-latency, on-device processing
- **Polished UI**: Duolingo-inspired friendly design with bright colors, rounded shapes, and a cute mascot character

#### Gameplay Flow

1. Game starts with the mascot running
2. Two French words are displayed (e.g., *sauter* vs *baisser*)
3. When an obstacle approaches, the required word glows
4. Player taps the microphone button and pronounces the word
5. Speech recognition verifies the pronunciation
6. If correct → character performs the action (jump/duck)
7. If incorrect → collision and game over
8. After each obstacle, new word pairs are selected from unlocked words

#### Word System

- Starts with 5 basic verbs unlocked (e.g., *sauter*, *baisser*, *manger*, *aller*, *venir*)
- Bank of 200 common French words available
- Unlock 1–2 new words after each run based on score
- Maximum 10 unlocked words at a time
- All progression stored locally (no backend required)

---

### 2. Whack-a-mole

**"Grammaire Smash!"** — A whack-a-mole style game where moles pop up displaying French sentences. Players must identify and whack moles showing **grammatically incorrect** sentences while avoiding the correct ones.

#### Key Features

- **AI-Generated Sentences**: Backend generates fresh batches of correct and incorrect French sentences before each game session
- **Grammar Learning**: Helps players spot common French grammar errors including:
  - Verb conjugation errors
  - Gender/number agreement mistakes
  - Article misuse
  - Incorrect adjective placement
  - Bad prepositions
  - Common A1–B1 grammar pitfalls
- **Adaptive Difficulty**: Supports A1, A2, and B1 difficulty levels with optional performance-based adaptation
- **Interactive Tutorial**: Animated instruction sequence teaches players the core gameplay mechanics
- **React Native Game Engine**: Built using React Native with game engine architecture for smooth gameplay

#### Gameplay Flow

1. Player taps **Play**
2. App requests fresh sentences from backend AI
3. Backend generates ~50–100 sentences
4. Animated tutorial sequence plays (3–5 seconds)
5. Game starts and moles pop up with assigned sentences
6. Player taps incorrect sentences to whack them
7. Timer ends or lives run out
8. Summary screen shows score, accuracy, and mistakes by grammar type

#### Scoring System

- Hit incorrect sentence: **+100 points**
- Hit correct sentence: **–100 points**
- Miss incorrect sentence: **–50 points**
- Ignore correct sentence: **+10 points**
- Streak system with multipliers every 5 correct decisions

#### Game Board

- 6–9 holes in a grid layout
- Moles appear for 1–3 seconds
- Each mole displays one French sentence
- Visual feedback: green spark for correct hits, red flash for mistakes

---

## Technical Stack

Both games are built using **React Native** with a focus on:
- Simple, polished core gameplay loops
- No backend complexity (local state management)
- Hackathon-friendly architecture prioritizing demo quality over production features
- On-device processing where possible for low latency

## Project Goals

Designed for a hackathon environment with emphasis on:
- **Creativity over completeness**
- **Simple, polished core loops**
- **Working demos** that clearly demonstrate learning concepts
- **No accounts or heavy backend structure**
