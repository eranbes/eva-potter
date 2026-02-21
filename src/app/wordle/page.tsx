'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import WordleBoard from '@/components/wordle/WordleBoard';
import WordleKeyboard from '@/components/wordle/WordleKeyboard';
import WordleHint from '@/components/wordle/WordleHint';
import WordleResult from '@/components/wordle/WordleResult';
import { getRandomWord, getWord, type WordEntry } from '@/lib/wordle/words';
import { evaluateGuess, calculatePoints, buildKeyboardState, type GuessResult } from '@/lib/wordle/engine';
import GobletOfFortune from '@/components/ui/GobletOfFortune';

const MAX_GUESSES = 6;

export default function WordlePage() {
  const { user, loading, refreshUser } = useUser();
  const { t, language } = useTranslation();

  const [wordEntry, setWordEntry] = useState<WordEntry | null>(null);
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGoblet, setShowGoblet] = useState(false);

  // Pick a random word on mount
  useEffect(() => {
    setWordEntry(getRandomWord());
  }, []);

  // Start a fresh game
  const startNewGame = useCallback(() => {
    setWordEntry(getRandomWord());
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setWon(false);
    setPointsAwarded(0);
    setShakeRow(null);
    setIsSubmitting(false);
  }, []);

  // Play Again with ~5% chance for Goblet of Fortune
  const handlePlayAgain = useCallback(() => {
    if (user && user.totalPoints > 0 && Math.random() < 0.05) {
      setShowGoblet(true);
      return;
    }
    startNewGame();
  }, [user, startNewGame]);

  // The active word depends on the language
  const activeWord = wordEntry ? getWord(wordEntry, language) : '';

  // Auto-clear shake animation
  useEffect(() => {
    if (shakeRow !== null) {
      const timer = setTimeout(() => setShakeRow(null), 500);
      return () => clearTimeout(timer);
    }
  }, [shakeRow]);

  // Submit the current guess
  const handleSubmit = useCallback(async () => {
    if (!wordEntry || isSubmitting || gameOver) return;

    // Must be the correct length
    if (currentGuess.length !== activeWord.length) {
      setShakeRow(guesses.length);
      return;
    }

    setIsSubmitting(true);

    const tiles = evaluateGuess(currentGuess, activeWord);
    const newGuess: GuessResult = { guess: currentGuess, tiles };
    const updatedGuesses = [...guesses, newGuess];

    setGuesses(updatedGuesses);
    setCurrentGuess('');

    const isWon = tiles.every((tile) => tile === 'correct');
    const isLost = updatedGuesses.length >= MAX_GUESSES && !isWon;

    if (isWon || isLost) {
      const points = calculatePoints(updatedGuesses.length, isWon);
      setGameOver(true);
      setWon(isWon);
      setPointsAwarded(points);

      // Record result on the server if user is logged in
      if (user) {
        try {
          await fetch('/api/wordle/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              word: activeWord,
              won: isWon,
              guessesUsed: updatedGuesses.length,
            }),
          });
          await refreshUser();
        } catch {
          // Silently fail — points will sync on next page load
        }
      }
    }

    setIsSubmitting(false);
  }, [wordEntry, activeWord, currentGuess, guesses, isSubmitting, gameOver, user, refreshUser]);

  // Keyboard callbacks for the on-screen keyboard
  const handleKey = useCallback(
    (key: string) => {
      if (gameOver || isSubmitting) return;
      if (currentGuess.length < activeWord.length) {
        setCurrentGuess((prev) => prev + key.toUpperCase());
      }
    },
    [gameOver, isSubmitting, currentGuess, wordEntry],
  );

  const handleBackspace = useCallback(() => {
    if (gameOver || isSubmitting) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [gameOver, isSubmitting]);

  const handleEnter = useCallback(() => {
    if (gameOver || isSubmitting) return;
    handleSubmit();
  }, [gameOver, isSubmitting, handleSubmit]);

  // Physical keyboard support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (gameOver || isSubmitting) return;

      // Ignore key events when an input/textarea is focused
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        setCurrentGuess((prev) => {
          if (prev.length < activeWord.length) {
            return prev + e.key.toUpperCase();
          }
          return prev;
        });
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameOver, isSubmitting, activeWord, handleSubmit]);

  // Build keyboard color state from completed guesses
  const keyStates = buildKeyboardState(guesses);

  // Loading states
  if (loading || !wordEntry) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        <Header />
        <main className="mx-auto max-w-lg px-4 py-6 flex flex-col items-center gap-4">
          <div className="text-purple-300 text-lg animate-pulse mt-20">
            {t('wordle.loading')}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-6 flex flex-col items-center gap-4">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-yellow-400 text-glow-gold">
          {t('wordle.title')}
        </h1>
        <p className="text-purple-300 text-sm">{t('wordle.subtitle')}</p>

        {/* Hint badge */}
        <WordleHint category={wordEntry.category} wordLength={activeWord.length} />

        {/* Board */}
        <WordleBoard
          guesses={guesses}
          currentGuess={currentGuess}
          wordLength={activeWord.length}
          shakeRow={shakeRow}
        />

        {/* Keyboard */}
        <WordleKeyboard
          keyStates={keyStates}
          onKey={handleKey}
          onEnter={handleEnter}
          onBackspace={handleBackspace}
        />

        {/* Result modal */}
        {gameOver && (
          <WordleResult
            won={won}
            word={activeWord}
            guessesUsed={guesses.length}
            pointsAwarded={pointsAwarded}
            onPlayAgain={handlePlayAgain}
          />
        )}

        {/* Goblet of Fortune overlay */}
        {showGoblet && (
          <GobletOfFortune
            onDismiss={() => {
              setShowGoblet(false);
              startNewGame();
            }}
          />
        )}
      </main>
    </div>
  );
}
