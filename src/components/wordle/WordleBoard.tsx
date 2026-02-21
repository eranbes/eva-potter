'use client';

import WordleTile from '@/components/wordle/WordleTile';

interface GuessRow {
  guess: string;
  tiles: Array<'correct' | 'present' | 'absent' | 'empty' | 'tbd'>;
}

interface WordleBoardProps {
  guesses: Array<GuessRow>;
  currentGuess: string;
  wordLength: number;
  maxGuesses?: number;
  shakeRow?: number | null;
}

export default function WordleBoard({
  guesses,
  currentGuess,
  wordLength,
  maxGuesses = 6,
  shakeRow = null,
}: WordleBoardProps) {
  const rows: Array<{ letters: string[]; states: Array<'correct' | 'present' | 'absent' | 'empty' | 'tbd'> }> = [];

  // Completed guesses
  for (let i = 0; i < guesses.length; i++) {
    const { guess, tiles } = guesses[i];
    const letters = guess.split('');
    // Pad if guess is shorter than wordLength
    while (letters.length < wordLength) {
      letters.push('');
    }
    const states = [...tiles];
    while (states.length < wordLength) {
      states.push('empty');
    }
    rows.push({ letters, states });
  }

  // Current guess row (only if we haven't used all guesses)
  if (guesses.length < maxGuesses) {
    const currentLetters = currentGuess.split('');
    const letters: string[] = [];
    const states: Array<'correct' | 'present' | 'absent' | 'empty' | 'tbd'> = [];

    for (let i = 0; i < wordLength; i++) {
      if (i < currentLetters.length) {
        letters.push(currentLetters[i]);
        states.push('tbd');
      } else {
        letters.push('');
        states.push('empty');
      }
    }
    rows.push({ letters, states });
  }

  // Future empty rows
  while (rows.length < maxGuesses) {
    const letters = Array(wordLength).fill('');
    const states: Array<'correct' | 'present' | 'absent' | 'empty' | 'tbd'> = Array(wordLength).fill('empty');
    rows.push({ letters, states });
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`
            flex gap-1.5
            ${shakeRow === rowIndex ? 'animate-wordle-shake' : ''}
          `}
        >
          {row.letters.map((letter, colIndex) => (
            <WordleTile
              key={`${rowIndex}-${colIndex}`}
              letter={letter}
              state={row.states[colIndex]}
              position={colIndex}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
