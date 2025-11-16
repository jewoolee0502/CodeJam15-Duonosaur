# Whack-a-Mole: “Grammaire Smash!”

### AI-Generated French Grammar Learning Mini-Game — Design Document (Markdown)

---

## 1. Concept Overview

“Grammaire Smash!” is a French-learning mini-game where each mole pops up displaying a **short French sentence**. Some sentences are **grammatically correct**, others contain **errors**.

The player must:

- **Whack only the incorrect sentences**
- Ignore the correct ones

**Key Requirement:** Before each game session, the backend **AI Sentence Generator** produces a fresh batch of correct + incorrect French sentences.

Designed for a hackathon:

- Creativity over completeness
- Simple, polished core loop
- No accounts or heavy backend structure

---

## 2. Learning & AI Goals

### 2.1 Learning Objectives

The game helps players improve at spotting:

- Verb conjugation errors
- Gender/number agreement mistakes
- Article misuse
- Incorrect adjective placement
- Bad prepositions
- Dropped or extra words
- Common A1–B1 grammar pitfalls

### 2.2 AI Objectives

The backend AI must:

- Generate a new sentence dataset before each game
- Output a mix of correct and error-injected sentences
- Tag each sentence with metadata:
  - `is_correct`
  - `error_type`
  - `difficulty`
- Optionally adapt to player performance

---

## 3. Gameplay Flow

### 3.1 Session Flow

1. Player taps **Play**
2. App requests fresh sentences from backend
3. Backend generates ~50–100 sentences
4. **Animated instruction sequence plays** (3–5 seconds)
5. Game starts and moles pop up with assigned sentences
6. Player taps incorrect sentences
7. Timer ends or lives run out
8. Show summary screen

### 3.2 Animated How-to-Play Sequence

Before the first mole appears, a short, loopable animated instruction plays on top of a dimmed version of the board:

- Step 1: A hand icon taps the **Play** button.
- Step 2: A mole pops up with a clearly **incorrect** sentence (e.g., "C'est une bon idée.").
  - The incorrect word is briefly highlighted in red.
- Step 3: The hand icon taps the mole → smash animation → text label: "Incorrect → WHACK!".
- Step 4: A mole pops up with a **correct** sentence (e.g., "C'est une bonne idée.").
  - The sentence is highlighted in green.
- Step 5: The hand icon hovers but does **not** tap → text label: "Correct → DO NOT WHACK".

Interaction:
- A **"Got it"** button or a countdown (3…2…1…) ends the animation.
- For later sessions, player can skip the instructions with a **"Skip Tutorial"** button.

The animated sequence should be simple, using the same art assets as the game (moles, sentences, hand icon) so that the player immediately recognizes the real gameplay.

### 3.3 Whack Rules

- If **incorrect** → tap
- If **correct** → do NOT tap
- Tapping a correct one → penalty
- Missing an incorrect one → penalty

---

## 4. Sentence Generation System

### 4.1 AI Backend Endpoint

`POST /generate_sentences`

**Input Example:**

```json
{
  "difficulty": "A2",
  "num_sentences": 80,
  "user_stats": {
    "recent_accuracy": 0.72,
    "weak_error_types": ["conjugation"]
  }
}
```

**Output Example:**

```json
{
  "sentences": [
    {
      "text": "C'est une bon idée.",
      "is_correct": false,
      "error_type": "adjective_agreement",
      "difficulty": "A2"
    }
  ]
}
```

### 4.2 Generation Logic

For each sentence:

1. AI generates a **correct** French sentence
2. Randomly decides to make it incorrect by injecting one controlled error:
   - Wrong article
   - Wrong conjugation
   - Wrong adjective agreement
   - Wrong word order
   - Wrong preposition
3. Applies metadata

### 4.3 Difficulty Levels

- **A1:** 2–4 word sentences, very obvious errors
- **A2:** mid-length sentences, tenses + agreement
- **B1:** longer sentences, subtle mistakes

---

## 5. Core Gameplay Design

### 5.1 Game Board

- 6–9 holes in a grid
- Moles appear for 1–3 seconds
- Each mole displays one sentence

### 5.2 Player Interaction

- Tap to “whack” a mole
- If incorrect → good
- If correct → penalty
- Ignoring incorrect → penalty

---

## 6. Scoring System

### 6.1 Points

- Hit incorrect sentence: **+100**
- Hit correct sentence: **–100**
- Miss incorrect sentence: **–50**
- Ignore correct sentence: **+10** (or neutral)

### 6.2 Streaks

- +1 streak per correct decision
- Every 5 streaks → multiplier + effect

### 6.3 Round End

- **60–90 second timer**, or
- **3–5 lives**

---

## 7. Summary & Feedback

**End-of-Round Summary Includes:**

- Score
- Accuracy
- Hits/misses
- Mistakes by grammar type
- Adaptive AI message

---

## 8. UI / UX Design

### 8.1 Layout

**Top:** Score, Timer, Difficulty icon

**Middle:** Whac-a-Mole board

**Bottom:** Hint text

### 8.2 Visual Style

- Fun, cartoon-like moles
- Green spark → correct hit
- Red flash → mistake
- Smooth pop-in animations

### 8.3 Sound

- Pop for mole appearance
- Whack sound for hits
- Soft buzzer for mistakes

---

## 9. React Native Architecture

### 9.1 Entities

- `Mole` (text, visibility timer)
- `Hole` (static positions)
- `SentenceQueue` (AI-generated list)
- `ScoreManager`
- `Timer`

### 9.2 Game Systems (react-native-game-engine)

- SentenceSpawnSystem
- HitDetectionSystem
- ScoringSystem
- AnimationSystem
- TimerSystem

### 9.3 Local State Only

- Difficulty
- Last round stats
- Current sentence batch

---

## 10. AI Integration Pattern

### 10.1 Pre-Game

1. Player taps Play
2. App sends API request
3. AI returns sentences
4. Game begins immediately

### 10.2 Optional Adaptation

After each round, send:

```json
{
  "accuracy": 0.78,
  "mistakes_by_type": {
    "conjugation": 5,
    "agreement": 2
  }
}
```

Backend can adjust next batch accordingly.
