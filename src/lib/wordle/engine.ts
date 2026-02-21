export type TileState = 'correct' | 'present' | 'absent' | 'empty' | 'tbd';
export type KeyState = 'correct' | 'present' | 'absent' | 'unused';

export interface GuessResult {
  guess: string;
  tiles: TileState[];
}

/**
 * Evaluate a guess against the target word using the standard Wordle algorithm.
 *
 * Returns an array of TileState values:
 *   - 'correct' (green): letter is in the correct position
 *   - 'present' (yellow): letter exists in the target but in a different position
 *   - 'absent' (gray): letter does not exist in the target (or all occurrences are already matched)
 *
 * Duplicate letter handling:
 *   1. First pass: mark exact positional matches as 'correct' and count remaining
 *      unmatched occurrences of each letter in the target.
 *   2. Second pass: for each non-exact-match position, if the letter still has
 *      remaining unmatched occurrences in the target, mark as 'present' and
 *      decrement the count; otherwise mark as 'absent'.
 */
export function evaluateGuess(guess: string, target: string): TileState[] {
  const g = guess.toUpperCase();
  const t = target.toUpperCase();
  const length = g.length;

  const tiles: TileState[] = new Array(length).fill('absent');

  // Count remaining unmatched letters in the target.
  // We decrement during the first pass for exact matches, then during the
  // second pass for present matches.
  const remaining: Record<string, number> = {};
  for (const ch of t) {
    remaining[ch] = (remaining[ch] ?? 0) + 1;
  }

  // First pass: mark exact matches ('correct') and consume those letters.
  for (let i = 0; i < length; i++) {
    if (g[i] === t[i]) {
      tiles[i] = 'correct';
      remaining[g[i]]--;
    }
  }

  // Second pass: for non-exact positions, check for 'present' or 'absent'.
  for (let i = 0; i < length; i++) {
    if (tiles[i] === 'correct') {
      continue;
    }
    if ((remaining[g[i]] ?? 0) > 0) {
      tiles[i] = 'present';
      remaining[g[i]]--;
    } else {
      tiles[i] = 'absent';
    }
  }

  return tiles;
}

/**
 * Calculate points based on the number of guesses used.
 *
 * Scoring table:
 *   1 guess  = 60 points
 *   2 guesses = 50 points
 *   3 guesses = 40 points
 *   4 guesses = 30 points
 *   5 guesses = 20 points
 *   6 guesses = 10 points
 *   loss      =  0 points
 */
export function calculatePoints(guessesUsed: number, won: boolean): number {
  if (!won) {
    return 0;
  }
  const pointsByGuess: Record<number, number> = {
    1: 60,
    2: 50,
    3: 40,
    4: 30,
    5: 20,
    6: 10,
  };
  return pointsByGuess[guessesUsed] ?? 0;
}

/**
 * Build keyboard state from all guesses made so far.
 *
 * Each letter key is assigned a state based on the best result observed:
 *   - 'correct' takes priority over everything
 *   - 'present' takes priority over 'absent'
 *   - 'absent' takes priority over 'unused'
 *   - 'unused' is the default for letters not yet guessed
 *
 * Returns a record mapping each uppercase letter (A-Z) to its KeyState.
 */
export function buildKeyboardState(guesses: GuessResult[]): Record<string, KeyState> {
  const priority: Record<TileState, number> = {
    correct: 3,
    present: 2,
    absent: 1,
    tbd: 0,
    empty: 0,
  };

  const tileToKey: Record<TileState, KeyState> = {
    correct: 'correct',
    present: 'present',
    absent: 'absent',
    tbd: 'unused',
    empty: 'unused',
  };

  const state: Record<string, KeyState> = {};

  // Initialize all letters as 'unused'.
  for (let code = 65; code <= 90; code++) {
    state[String.fromCharCode(code)] = 'unused';
  }

  for (const { guess, tiles } of guesses) {
    const g = guess.toUpperCase();
    for (let i = 0; i < g.length; i++) {
      const letter = g[i];
      const tile = tiles[i];
      const candidateKey = tileToKey[tile];
      const candidatePriority = priority[tile];
      const currentPriority = priority[
        // Reverse-map the current KeyState back to a comparable TileState for priority lookup.
        state[letter] === 'correct'
          ? 'correct'
          : state[letter] === 'present'
            ? 'present'
            : state[letter] === 'absent'
              ? 'absent'
              : 'empty'
      ];

      if (candidatePriority > currentPriority) {
        state[letter] = candidateKey;
      }
    }
  }

  return state;
}
