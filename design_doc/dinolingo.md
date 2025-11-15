# French Dino — One‑Day Hackathon Design Document

## 1. Goal

Build a **simple, fun, visually polished demo** that presents our idea: a Chrome-dino–style endless runner where players must **pronounce a French word** to jump or duck.

This is for a **hackathon**, so we optimize for:

- **Minimum code**
- **Maximum clarity of the concept**
- **Pretty, friendly UI (Duolingo-like)**
- **A working demo**, not a full product

No backend features like database, accounts, real scoring models, etc.

---

## 2. Core MVP Features 

1. **Endless-runner**

   - Character running
   - Two simple actions: **jump** and **duck**
   - 2–3 obstacle types

2. **Two French words displayed**

   - Example: "sauter" (jump) and "baisser" (duck)
   - Highlight which one is needed when obstacle appears

3. **Voice input to trigger action**

   - User hits a microphone button
   - They say the chosen word
   - We do **speech detection** to check pronoucation

4. **Basic correctness check**

   - If recognized text contains the expected word → success
   - Otherwise → fail and show collision

5. **Polished UI**

   - Cute mascot/dino
   - Rounded shapes, friendly colors
   - Minimal animations: running, jumping, ducking

This is enough to clearly demonstrate the learning mechanic.

---

## 4. Gameplay Flow

1. Game starts → mascot runs
2. Two words shown: e.g. *sauter* (jump) vs *baisser* (duck)
3. Obstacle approaches → required word glows
4. User taps the mic button → says the word
5. Backend STT returns recognized text
6. If match → perform action
7. If wrong → hit obstacle, game over
8. **After every obstacle, the two words change to new ones** chosen from unlocked list

---

## 5. UI / Art Direction&#x20;

**Visual goals:**

- Use bright colors and rounded shapes
- A cute character (dino or mascot)
- Duolingo-like simplicity but **not copying Duolingo**

**Screens needed:**

1. **Title screen**

   - Mascot
   - "Learn French by Playing!"
   - Start button

2. **Game screen**

   - Running background
   - Mascot and obstacles
   - Two words displayed clearly
   - Microphone button
   - Feedback animations
   - current score

3. **Ending screen**

   - Score
   - &#x20;new words unlocked

---

## 6. Speech Recognition

Speech recognition is **required** and handled entirely on-device using **React Native speech recognition libraries** for lower latency.

### Approach

Use **`react-native-voice`** or **Expo Speech / Web Speech API (if supported on device)**.

Flow:

- User taps microphone
- RN Speech Recognition starts listening
- User says the target word
- Recognized text returned immediately on-device
- If recognized text contains expected word → jump/duck
- If incorrect → collision

No backend required. Everything stays on the phone for the fastest response.:

- Press microphone
- We show a modal: "Say the word now!"
- Randomly accept 80% if mic is detected
- This guarantees the demo works even in loud rooms

This is acceptable for hackathon demo **as long as you explain it**.

---

## 7. Code Components Breakdown&#x20;

### React Native Components

- `GameScreen` — runner, obstacles, character actions
- `WordPrompt` — shows two French words
- `VoiceInput` — wrapper for speech-to-text or fake recognition
- `Character` — controls animations

### Game Logic

- Simple timer-based obstacle spawn
- Collision detection using bounding boxes
- Action triggers based on speech result

---

## 8. Progression, Word List, and Scoring

### Word List & Unlock System (Demo-Friendly)

- User gain score based on the move distance of the dino

* Start with **5 unlocked words** (e.g., basic verbs like *sauter*, *baisser*, *manger*, *aller*, *venir*).
* Only **unlocked words** can appear in the game.
* Keep a small bank of **200 common French words** (noun/verb mix).
* After each run:
  - If user score ≥ threshold → unlock 1–2 new words.
  - Maximum unlocked words = **10**
* Store unlocked words in simple **in-memory array** on the frontend (no database).

This provides simple learning progression without backend complexity.

No leaderboard, no XP, no auth.

---



---

