'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import ParchmentCard from '@/components/ui/ParchmentCard';
import MagicalButton from '@/components/ui/MagicalButton';
import WordleBoard from '@/components/wordle/WordleBoard';
import WordleKeyboard from '@/components/wordle/WordleKeyboard';
import WordleHint from '@/components/wordle/WordleHint';
import { evaluateGuess, buildKeyboardState, type GuessResult } from '@/lib/wordle/engine';
import { getWord, type WordEntry } from '@/lib/wordle/words';

const MAX_GUESSES = 6;

interface DailyQuestion {
  id: number;
  bookId: number;
  difficulty: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

interface DailyData {
  dateKey: string;
  dailyQuestion: DailyQuestion | null;
  dailyWord: {
    word: string;
    wordFr?: string;
    category: string;
    hintEn: string;
    hintFr: string;
  };
  quizCompleted: boolean;
  wordleCompleted: boolean;
}

export default function DailyPage() {
  const router = useRouter();
  const { user, loading: userLoading, refreshUser } = useUser();
  const { t, language } = useTranslation();

  const [data, setData] = useState<DailyData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{
    correct: boolean;
    correctOption: string;
    explanation: string;
    pointsAwarded: number;
  } | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);

  // Wordle state
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [wordleGameOver, setWordleGameOver] = useState(false);
  const [wordleWon, setWordleWon] = useState(false);
  const [wordlePoints, setWordlePoints] = useState(0);
  const [shakeRow, setShakeRow] = useState<number | null>(null);
  const [wordleSubmitting, setWordleSubmitting] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchDaily = async () => {
      try {
        const res = await fetch('/api/daily');
        if (!res.ok) throw new Error('Failed to fetch');
        const json: DailyData = await res.json();
        setData(json);
      } catch {
        setError(t('daily.loading'));
      } finally {
        setLoadingData(false);
      }
    };
    fetchDaily();
  }, [user, language]);

  // Auto-clear shake
  useEffect(() => {
    if (shakeRow !== null) {
      const timer = setTimeout(() => setShakeRow(null), 500);
      return () => clearTimeout(timer);
    }
  }, [shakeRow]);

  const activeWord = data?.dailyWord
    ? getWord(data.dailyWord as WordEntry, language)
    : '';

  // Quiz submit
  const handleQuizSubmit = async () => {
    if (!data?.dailyQuestion || !selectedOption || quizSubmitting) return;
    setQuizSubmitting(true);

    try {
      const res = await fetch('/api/daily/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'quiz',
          questionId: data.dailyQuestion.id,
          selectedOption,
        }),
      });

      const json = await res.json();
      if (res.ok) {
        setQuizResult({
          correct: json.correct,
          correctOption: json.correctOption,
          explanation: json.explanation,
          pointsAwarded: json.pointsAwarded,
        });
        setData((prev) => prev ? { ...prev, quizCompleted: true } : prev);
        await refreshUser();
      }
    } catch {
      // silently fail
    } finally {
      setQuizSubmitting(false);
    }
  };

  // Wordle submit
  const handleWordleSubmit = useCallback(async () => {
    if (!data?.dailyWord || wordleSubmitting || wordleGameOver) return;

    if (currentGuess.length !== activeWord.length) {
      setShakeRow(guesses.length);
      return;
    }

    setWordleSubmitting(true);

    const tiles = evaluateGuess(currentGuess, activeWord);
    const newGuess: GuessResult = { guess: currentGuess, tiles };
    const updatedGuesses = [...guesses, newGuess];

    setGuesses(updatedGuesses);
    setCurrentGuess('');

    const isWon = tiles.every((tile) => tile === 'correct');
    const isLost = updatedGuesses.length >= MAX_GUESSES && !isWon;

    if (isWon || isLost) {
      setWordleGameOver(true);
      setWordleWon(isWon);

      try {
        const res = await fetch('/api/daily/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'wordle',
            won: isWon,
            guessesUsed: updatedGuesses.length,
          }),
        });

        const json = await res.json();
        if (res.ok) {
          setWordlePoints(json.pointsAwarded);
          setData((prev) => prev ? { ...prev, wordleCompleted: true } : prev);
          await refreshUser();
        }
      } catch {
        // silently fail
      }
    }

    setWordleSubmitting(false);
  }, [data, activeWord, currentGuess, guesses, wordleSubmitting, wordleGameOver, refreshUser]);

  // Keyboard handlers
  const handleKey = useCallback(
    (key: string) => {
      if (wordleGameOver || wordleSubmitting || data?.wordleCompleted) return;
      if (currentGuess.length < activeWord.length) {
        setCurrentGuess((prev) => prev + key.toUpperCase());
      }
    },
    [wordleGameOver, wordleSubmitting, data?.wordleCompleted, currentGuess, activeWord],
  );

  const handleBackspace = useCallback(() => {
    if (wordleGameOver || wordleSubmitting || data?.wordleCompleted) return;
    setCurrentGuess((prev) => prev.slice(0, -1));
  }, [wordleGameOver, wordleSubmitting, data?.wordleCompleted]);

  const handleEnter = useCallback(() => {
    if (wordleGameOver || wordleSubmitting || data?.wordleCompleted) return;
    handleWordleSubmit();
  }, [wordleGameOver, wordleSubmitting, data?.wordleCompleted, handleWordleSubmit]);

  // Physical keyboard
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (wordleGameOver || wordleSubmitting || data?.wordleCompleted) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleWordleSubmit();
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
  }, [wordleGameOver, wordleSubmitting, data?.wordleCompleted, activeWord, handleWordleSubmit]);

  const keyStates = buildKeyboardState(guesses);

  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl text-amber-400"
        >
          &#9733;
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 pb-12 max-w-3xl mx-auto w-full">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-6 mb-8"
        >
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-amber-100 mb-2">
            {t('daily.title')}
          </h1>
          <p className="text-amber-200/60 text-lg">
            {t('daily.subtitle')}
          </p>
        </motion.div>

        {loadingData && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-5xl text-amber-400 mb-4"
            >
              &#9733;
            </motion.div>
            <p className="text-amber-200/60 text-lg">{t('daily.loading')}</p>
          </div>
        )}

        {error && !loadingData && (
          <div className="text-center py-12">
            <p className="text-amber-400 text-lg">{error}</p>
          </div>
        )}

        {!loadingData && !error && data && (
          <div className="flex flex-col gap-8">
            {/* Daily Quiz Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ParchmentCard>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[family-name:var(--font-cinzel)] text-xl font-bold text-slate-800">
                    {t('daily.quiz')}
                  </h2>
                  <span className="bg-amber-500 text-amber-950 text-xs font-bold px-2 py-1 rounded-full">
                    {t('daily.bonus')}
                  </span>
                </div>

                {data.quizCompleted && !quizResult ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-medium">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t('daily.quizCompleted')}
                  </div>
                ) : data.dailyQuestion ? (
                  <div>
                    <p className="text-slate-700 font-medium mb-4">
                      {data.dailyQuestion.questionText}
                    </p>

                    <div className="flex flex-col gap-2 mb-4">
                      {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                        const optionText =
                          opt === 'A' ? data.dailyQuestion!.optionA :
                          opt === 'B' ? data.dailyQuestion!.optionB :
                          opt === 'C' ? data.dailyQuestion!.optionC :
                          data.dailyQuestion!.optionD;

                        const isSelected = selectedOption === opt;
                        const showResult = quizResult !== null;
                        const isCorrectAnswer = quizResult?.correctOption === opt;

                        let borderClass = 'border-amber-200/60';
                        if (showResult) {
                          if (isCorrectAnswer) borderClass = 'border-emerald-500 bg-emerald-50';
                          else if (isSelected && !quizResult.correct) borderClass = 'border-red-400 bg-red-50';
                        } else if (isSelected) {
                          borderClass = 'border-amber-500 bg-amber-100';
                        }

                        return (
                          <button
                            key={opt}
                            onClick={() => !quizResult && setSelectedOption(opt)}
                            disabled={!!quizResult}
                            className={`text-left px-4 py-3 rounded-xl border-2 transition-all ${borderClass} ${
                              !quizResult ? 'hover:border-amber-400 cursor-pointer' : ''
                            }`}
                          >
                            <span className="font-bold text-slate-600 mr-2">{opt}.</span>
                            <span className="text-slate-700">{optionText}</span>
                          </button>
                        );
                      })}
                    </div>

                    {quizResult ? (
                      <div className={`p-3 rounded-xl ${quizResult.correct ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                        {quizResult.correct && (
                          <p className="text-emerald-700 font-bold mb-1">
                            +{quizResult.pointsAwarded} {t('daily.bonusPoints')}
                          </p>
                        )}
                        {quizResult.explanation && (
                          <p className="text-slate-600 text-sm">{quizResult.explanation}</p>
                        )}
                      </div>
                    ) : (
                      <MagicalButton
                        onClick={handleQuizSubmit}
                        disabled={!selectedOption || quizSubmitting}
                        size="sm"
                      >
                        {quizSubmitting ? '...' : t('daily.submit')}
                      </MagicalButton>
                    )}
                  </div>
                ) : null}
              </ParchmentCard>
            </motion.div>

            {/* Daily Wordle Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-slate-800/60 border border-amber-500/20 rounded-2xl p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-[family-name:var(--font-cinzel)] text-xl font-bold text-amber-100">
                    {t('daily.wordle')}
                  </h2>
                  <span className="bg-amber-500 text-amber-950 text-xs font-bold px-2 py-1 rounded-full">
                    {t('daily.bonus')}
                  </span>
                </div>

                {data.wordleCompleted && !wordleGameOver ? (
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {t('daily.wordleCompleted')}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <WordleHint
                      category={data.dailyWord.category as 'character' | 'spell' | 'creature' | 'place' | 'object' | 'potion'}
                      wordLength={activeWord.length}
                    />

                    <WordleBoard
                      guesses={guesses}
                      currentGuess={currentGuess}
                      wordLength={activeWord.length}
                      shakeRow={shakeRow}
                    />

                    {wordleGameOver && (
                      <div className={`text-center p-3 rounded-xl ${wordleWon ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        <p className={`font-bold ${wordleWon ? 'text-emerald-400' : 'text-red-400'}`}>
                          {wordleWon ? t('wordle.win') : t('wordle.lose', { word: activeWord })}
                        </p>
                        {wordlePoints > 0 && (
                          <p className="text-amber-300 font-bold mt-1">
                            +{wordlePoints} {t('daily.bonusPoints')}
                          </p>
                        )}
                      </div>
                    )}

                    {!wordleGameOver && !data.wordleCompleted && (
                      <WordleKeyboard
                        keyStates={keyStates}
                        onKey={handleKey}
                        onEnter={handleEnter}
                        onBackspace={handleBackspace}
                      />
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Come back tomorrow */}
            {data.quizCompleted && data.wordleCompleted && !quizResult && !wordleGameOver && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-amber-300/60 italic text-lg"
              >
                {t('daily.comeBackTomorrow')}
              </motion.p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
