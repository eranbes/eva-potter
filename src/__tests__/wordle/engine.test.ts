import { describe, it, expect } from 'vitest';
import { evaluateGuess, calculatePoints, buildKeyboardState, type GuessResult } from '@/lib/wordle/engine';

// ---------------------------------------------------------------------------
// evaluateGuess
// ---------------------------------------------------------------------------
describe('evaluateGuess', () => {
  it('returns all correct when guess exactly matches target', () => {
    const result = evaluateGuess('CRANE', 'CRANE');
    expect(result).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  it('returns all absent when no letters match', () => {
    const result = evaluateGuess('FLIMP', 'DOTEY');
    expect(result).toEqual(['absent', 'absent', 'absent', 'absent', 'absent']);
  });

  it('returns a mix of correct, present, and absent', () => {
    // Target: CRANE
    // Guess:  CRATE
    // C -> correct (pos 0)
    // R -> correct (pos 1)
    // A -> present (A is in target at pos 2, guess has it at pos 2... wait)
    // Let's be precise:
    // C(0)=C(0) correct, R(1)=R(1) correct, A(2)=A(2)... actually that's also correct
    // Use a clearer example:
    // Target: CRANE
    // Guess:  CHARM
    // C(0)=C(0) correct
    // H(1)!=R(1), H not in CRANE -> absent
    // A(2)!=A(2)... wait CRANE[2]='A', CHARM[2]='A' -> correct
    // R(3)!=N(3), R is in CRANE -> present
    // M(4)!=E(4), M not in CRANE -> absent
    const result = evaluateGuess('CHARM', 'CRANE');
    expect(result).toEqual(['correct', 'absent', 'correct', 'present', 'absent']);
  });

  it('marks only as many present as there are unmatched occurrences in the target (duplicate letters in guess)', () => {
    // Target: PLANT (one L)
    // Guess:  LLAMA
    // L(0)!=P(0), L is in PLANT (1 occurrence) -> present, remaining L count goes to 0
    // L(1)!=L(1)... wait PLANT[1]='L', so L(1)=L(1) -> correct
    // Hmm, first pass marks exact matches first. Let me re-think:
    //
    // First pass (exact matches):
    //   L(0) vs P(0) -> no match
    //   L(1) vs L(1) -> correct, remaining['L'] decremented from 1 to 0
    //   A(2) vs A(2) -> correct, remaining['A'] decremented from 1 to 0
    //   M(3) vs N(3) -> no match
    //   A(4) vs T(4) -> no match
    //
    // Second pass:
    //   L(0): remaining['L'] = 0 -> absent
    //   M(3): remaining['M'] = undefined -> absent
    //   A(4): remaining['A'] = 0 -> absent
    const result = evaluateGuess('LLAMA', 'PLANT');
    expect(result).toEqual(['absent', 'correct', 'correct', 'absent', 'absent']);
  });

  it('handles duplicate letters where one is correct and extras are absent', () => {
    // Target: ABBEY (two B's)
    // Guess:  BOBBB
    // Wait, let's use a 5-letter example that's cleaner.
    //
    // Target: ROBOT (one O at pos 1, one O at pos 3)
    // Guess:  OOMOO
    // First pass:
    //   O(0) vs R(0) -> no
    //   O(1) vs O(1) -> correct, remaining['O'] 2->1
    //   M(2) vs B(2) -> no
    //   O(3) vs O(3) -> correct, remaining['O'] 1->0
    //   O(4) vs T(4) -> no
    // Second pass:
    //   O(0): remaining['O'] = 0 -> absent
    //   M(2): remaining['M'] = undefined -> absent
    //   O(4): remaining['O'] = 0 -> absent
    const result = evaluateGuess('OOMOO', 'ROBOT');
    expect(result).toEqual(['absent', 'correct', 'absent', 'correct', 'absent']);
  });

  it('handles duplicate in guess where one is correct and one is present', () => {
    // Target: STOMP (one S at pos 0)
    // Actually let me pick a cleaner example:
    // Target: LOOSE (two O's at pos 1 and 2)
    // Guess:  BLOOD
    // First pass:
    //   B(0) vs L(0) -> no
    //   L(1) vs O(1) -> no
    //   O(2) vs O(2) -> correct, remaining['O'] 2->1
    //   O(3) vs S(3) -> no
    //   D(4) vs E(4) -> no
    // Second pass:
    //   B(0): remaining['B'] = 0 -> absent
    //   L(1): remaining['L'] = 1->0 -> present
    //   O(3): remaining['O'] = 1->0 -> present
    //   D(4): remaining['D'] = 0 -> absent
    const result = evaluateGuess('BLOOD', 'LOOSE');
    expect(result).toEqual(['absent', 'present', 'correct', 'present', 'absent']);
  });

  it('is case insensitive (lowercase guess vs uppercase target)', () => {
    const result = evaluateGuess('crane', 'CRANE');
    expect(result).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  it('is case insensitive (uppercase guess vs lowercase target)', () => {
    const result = evaluateGuess('CRANE', 'crane');
    expect(result).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  it('is case insensitive (mixed case)', () => {
    const result = evaluateGuess('cRaNe', 'CrAnE');
    expect(result).toEqual(['correct', 'correct', 'correct', 'correct', 'correct']);
  });

  it('works with different word lengths (3 letters)', () => {
    // Target: CAT
    // Guess:  TAC
    // First pass: T(0)!=C(0), A(1)=A(1) correct, C(2)!=T(2)
    // remaining after first pass: C=1, T=1
    // Second pass: T(0) remaining['T']=1->0 -> present, C(2) remaining['C']=1->0 -> present
    const result = evaluateGuess('TAC', 'CAT');
    expect(result).toEqual(['present', 'correct', 'present']);
  });

  it('works with different word lengths (7 letters)', () => {
    const result = evaluateGuess('ABCDEFG', 'ABCDEFG');
    expect(result).toEqual([
      'correct', 'correct', 'correct', 'correct', 'correct', 'correct', 'correct',
    ]);
  });
});

// ---------------------------------------------------------------------------
// calculatePoints
// ---------------------------------------------------------------------------
describe('calculatePoints', () => {
  it('returns 60 points for winning in 1 guess', () => {
    expect(calculatePoints(1, true)).toBe(60);
  });

  it('returns 50 points for winning in 2 guesses', () => {
    expect(calculatePoints(2, true)).toBe(50);
  });

  it('returns 40 points for winning in 3 guesses', () => {
    expect(calculatePoints(3, true)).toBe(40);
  });

  it('returns 30 points for winning in 4 guesses', () => {
    expect(calculatePoints(4, true)).toBe(30);
  });

  it('returns 20 points for winning in 5 guesses', () => {
    expect(calculatePoints(5, true)).toBe(20);
  });

  it('returns 10 points for winning in 6 guesses', () => {
    expect(calculatePoints(6, true)).toBe(10);
  });

  it('returns 0 points for a loss regardless of guessesUsed', () => {
    expect(calculatePoints(1, false)).toBe(0);
    expect(calculatePoints(3, false)).toBe(0);
    expect(calculatePoints(6, false)).toBe(0);
    expect(calculatePoints(10, false)).toBe(0);
  });

  it('returns 0 points for an out-of-range guess count even when won', () => {
    expect(calculatePoints(0, true)).toBe(0);
    expect(calculatePoints(7, true)).toBe(0);
    expect(calculatePoints(100, true)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// buildKeyboardState
// ---------------------------------------------------------------------------
describe('buildKeyboardState', () => {
  it('returns all 26 letters as unused when given an empty guesses array', () => {
    const state = buildKeyboardState([]);
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const letter of letters) {
      expect(state[letter]).toBe('unused');
    }
    expect(Object.keys(state)).toHaveLength(26);
  });

  it('updates key states from a single guess', () => {
    // Target implied by tiles:
    // Guess: CRANE -> tiles: correct, absent, present, absent, correct
    const guesses: GuessResult[] = [
      {
        guess: 'CRANE',
        tiles: ['correct', 'absent', 'present', 'absent', 'correct'],
      },
    ];
    const state = buildKeyboardState(guesses);

    expect(state['C']).toBe('correct');
    expect(state['R']).toBe('absent');
    expect(state['A']).toBe('present');
    expect(state['N']).toBe('absent');
    expect(state['E']).toBe('correct');
    // Letters not guessed remain unused
    expect(state['Z']).toBe('unused');
    expect(state['X']).toBe('unused');
  });

  it('gives correct priority over present', () => {
    // First guess: A is present
    // Second guess: A is correct
    const guesses: GuessResult[] = [
      {
        guess: 'ABCDE',
        tiles: ['present', 'absent', 'absent', 'absent', 'absent'],
      },
      {
        guess: 'FGHIA',
        tiles: ['absent', 'absent', 'absent', 'absent', 'correct'],
      },
    ];
    const state = buildKeyboardState(guesses);

    expect(state['A']).toBe('correct');
  });

  it('gives present priority over absent', () => {
    // First guess: S is absent
    // Second guess: S is present
    const guesses: GuessResult[] = [
      {
        guess: 'STONE',
        tiles: ['absent', 'absent', 'absent', 'absent', 'absent'],
      },
      {
        guess: 'ARISE',
        tiles: ['absent', 'absent', 'absent', 'present', 'absent'],
      },
    ];
    const state = buildKeyboardState(guesses);

    // S was absent in first guess, then present in second -> present wins
    expect(state['S']).toBe('present');
  });

  it('does not downgrade correct to present or absent', () => {
    // First guess: T is correct
    // Second guess: T is absent
    const guesses: GuessResult[] = [
      {
        guess: 'TEMPO',
        tiles: ['correct', 'absent', 'absent', 'absent', 'absent'],
      },
      {
        guess: 'FLOAT',
        tiles: ['absent', 'absent', 'absent', 'absent', 'absent'],
      },
    ];
    const state = buildKeyboardState(guesses);

    // T was correct in first guess; should NOT be downgraded by absent in second
    expect(state['T']).toBe('correct');
  });

  it('does not downgrade present to absent', () => {
    const guesses: GuessResult[] = [
      {
        guess: 'RAISE',
        tiles: ['absent', 'absent', 'absent', 'present', 'absent'],
      },
      {
        guess: 'STONE',
        tiles: ['absent', 'absent', 'absent', 'absent', 'absent'],
      },
    ];
    const state = buildKeyboardState(guesses);

    // S was present in first guess, absent in second -> present should persist
    expect(state['S']).toBe('present');
  });

  it('accumulates state correctly across multiple guesses', () => {
    const guesses: GuessResult[] = [
      {
        guess: 'CRANE',
        tiles: ['absent', 'absent', 'present', 'absent', 'correct'],
      },
      {
        guess: 'SLATE',
        tiles: ['absent', 'absent', 'correct', 'absent', 'correct'],
      },
      {
        guess: 'PLAGE',
        tiles: ['present', 'absent', 'correct', 'absent', 'correct'],
      },
    ];
    const state = buildKeyboardState(guesses);

    expect(state['C']).toBe('absent');
    expect(state['R']).toBe('absent');
    expect(state['A']).toBe('correct');  // present -> correct (upgraded)
    expect(state['N']).toBe('absent');
    expect(state['E']).toBe('correct');
    expect(state['S']).toBe('absent');
    expect(state['L']).toBe('absent');
    expect(state['T']).toBe('absent');
    expect(state['P']).toBe('present');
    expect(state['G']).toBe('absent');
    // Unguessed letters remain unused
    expect(state['Z']).toBe('unused');
    expect(state['Q']).toBe('unused');
  });

  it('handles lowercase guess letters by normalizing to uppercase keys', () => {
    const guesses: GuessResult[] = [
      {
        guess: 'crane',
        tiles: ['correct', 'absent', 'present', 'absent', 'correct'],
      },
    ];
    const state = buildKeyboardState(guesses);

    expect(state['C']).toBe('correct');
    expect(state['R']).toBe('absent');
    expect(state['A']).toBe('present');
    expect(state['N']).toBe('absent');
    expect(state['E']).toBe('correct');
  });

  it('treats tbd and empty tile states as unused (no upgrade)', () => {
    const guesses: GuessResult[] = [
      {
        guess: 'ABCDE',
        tiles: ['tbd', 'empty', 'absent', 'present', 'correct'],
      },
    ];
    const state = buildKeyboardState(guesses);

    expect(state['A']).toBe('unused');  // tbd -> unused
    expect(state['B']).toBe('unused');  // empty -> unused
    expect(state['C']).toBe('absent');
    expect(state['D']).toBe('present');
    expect(state['E']).toBe('correct');
  });
});
