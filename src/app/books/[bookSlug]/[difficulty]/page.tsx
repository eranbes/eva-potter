'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import QuestionCard from '@/components/quiz/QuestionCard';
import AnswerOption from '@/components/quiz/AnswerOption';
import AnswerFeedback from '@/components/quiz/AnswerFeedback';
import QuizProgressBar from '@/components/quiz/QuizProgressBar';
import SparkleEffect from '@/components/ui/SparkleEffect';
import MagicalButton from '@/components/ui/MagicalButton';
import UnlockCelebration from '@/components/bookshelf/UnlockCelebration';
import GobletOfFortune from '@/components/ui/GobletOfFortune';
import AchievementPopup from '@/components/achievements/AchievementPopup';
import { achievements as achievementDefs } from '@/lib/achievements/definitions';
import type { AchievementDef } from '@/lib/achievements/definitions';

interface Question {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  sortOrder: number;
  alreadyAnswered: boolean;
  previousAnswer?: string;
}

interface AnswerResult {
  correct: boolean;
  correctOption: string;
  explanation: string;
  pointsAwarded: number;
  totalPoints: number;
  newUnlocks: Array<{ bookId: number; title: string }>;
  quizCompleted: boolean;
  newAchievements?: string[];
}

interface QuizAnswer {
  questionId: number;
  questionText: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  explanation: string;
  pointsAwarded: number;
  options: { A: string; B: string; C: string; D: string };
}

interface Book {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  sortOrder: number;
  pointsToUnlock: number;
  unlocked: boolean;
}

// Self-contained component for a single question.
// Selection state lives HERE so it resets when this component remounts (via key change).
function ActiveQuestion({
  question,
  questionNumber,
  totalQuestions,
  onAnswered,
  onNext,
  isLast,
}: {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswered: (questionId: number, selectedOption: string) => Promise<AnswerResult>;
  onNext: () => void;
  isLast: boolean;
}) {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const phase: 'picking' | 'feedback' = answerResult ? 'feedback' : 'picking';

  // Shuffle answer display order per question (seeded by question id for stability)
  const shuffledOptions = useMemo(() => {
    const opts: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D'];
    let seed = question.id * 2654435761;
    for (let i = opts.length - 1; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) & 0xffffffff;
      const j = (seed >>> 0) % (i + 1);
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    return opts;
  }, [question.id]);

  const handleSubmit = async () => {
    if (!selectedOption || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await onAnswered(question.id, selectedOption);
      setAnswerResult(result);
      if (result.pointsAwarded > 0) {
        setShowSparkle(true);
        setTimeout(() => setShowSparkle(false), 1500);
      }
    } catch (err) {
      console.error('ActiveQuestion submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p className="text-amber-300/60 text-sm mb-2 text-center">
        {t('quiz.questionOf', { current: questionNumber, total: totalQuestions })}
      </p>

      <QuestionCard question={question.questionText} />

      <div className="mt-6 flex flex-col gap-3 relative">
        {showSparkle && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <SparkleEffect />
          </div>
        )}

        {shuffledOptions.map((originalOption, index) => {
          const displayLabel = (['A', 'B', 'C', 'D'] as const)[index];
          const optionText =
            originalOption === 'A'
              ? question.optionA
              : originalOption === 'B'
              ? question.optionB
              : originalOption === 'C'
              ? question.optionC
              : question.optionD;

          const isSelected = selectedOption === originalOption;
          const showResult = phase === 'feedback' && answerResult;
          const isCorrect = showResult && originalOption === answerResult.correctOption;
          const isWrong = showResult && isSelected && !answerResult.correct;

          return (
            <AnswerOption
              key={originalOption}
              option={displayLabel}
              text={optionText}
              selected={isSelected}
              correct={showResult ? isCorrect || false : undefined}
              wrong={showResult ? isWrong || false : undefined}
              disabled={phase === 'feedback' || isSubmitting}
              onClick={() => {
                if (phase === 'picking' && !isSubmitting) {
                  setSelectedOption(originalOption);
                }
              }}
            />
          );
        })}
      </div>

      <div className="mt-6">
        {phase === 'picking' && (
          <div className="flex justify-center">
            <MagicalButton
              size="lg"
              disabled={!selectedOption || isSubmitting}
              onClick={handleSubmit}
              className="font-[family-name:var(--font-cinzel)] w-full sm:w-auto"
            >
              {isSubmitting ? t('quiz.castingSpell') : t('quiz.submitAnswer')}
            </MagicalButton>
          </div>
        )}

        {phase === 'feedback' && answerResult && (
          <div className="space-y-4">
            <AnswerFeedback
              correct={answerResult.correct}
              explanation={answerResult.explanation}
              pointsAwarded={answerResult.pointsAwarded}
            />
            <div className="flex justify-center">
              <MagicalButton
                size="lg"
                onClick={onNext}
                className="font-[family-name:var(--font-cinzel)] w-full sm:w-auto"
              >
                {isLast ? t('quiz.seeResults') : t('quiz.nextQuestion')}
              </MagicalButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizPlayPage({
  params,
}: {
  params: Promise<{ bookSlug: string; difficulty: string }>;
}) {
  const { bookSlug, difficulty } = use(params);
  const router = useRouter();
  const { user, loading: userLoading, refreshUser } = useUser();
  const { t, language } = useTranslation();

  const [quizState, setQuizState] = useState<'loading' | 'playing' | 'complete'>('loading');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [totalPointsEarned, setTotalPointsEarned] = useState(0);
  const [newUnlocks, setNewUnlocks] = useState<Array<{ bookId: number; title: string }>>([]);
  const [showUnlockCelebration, setShowUnlockCelebration] = useState(false);
  const [showGoblet, setShowGoblet] = useState(false);
  const [pendingNext, setPendingNext] = useState<(() => void) | null>(null);
  const [bookId, setBookId] = useState<number | null>(null);
  const [popupAchievements, setPopupAchievements] = useState<AchievementDef[]>([]);
  const [bookTitle, setBookTitle] = useState('');
  const [error, setError] = useState('');

  const validDifficulties = ['easy', 'normal', 'hard', 'expert'];
  const isValidDifficulty = validDifficulties.includes(difficulty);

  // Refs for latest state in callbacks
  const answersRef = React.useRef<QuizAnswer[]>([]);
  answersRef.current = answers;
  const totalPointsRef = React.useRef(0);
  totalPointsRef.current = totalPointsEarned;
  const quizLoadedRef = useRef(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  const fetchBookId = useCallback(async () => {
    try {
      const response = await fetch('/api/books');
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      const found = data.books.find((b: Book) => b.slug === bookSlug);
      if (!found) {
        setError(t('quiz.bookNotFound'));
        return null;
      }
      if (!found.unlocked) {
        setError(t('quiz.bookLocked', { points: found.pointsToUnlock }));
        return null;
      }
      setBookId(found.id);
      setBookTitle(found.title);
      return found.id;
    } catch {
      setError(t('quiz.fetchError'));
      return null;
    }
  }, [bookSlug, language]);

  const loadQuiz = useCallback(async () => {
    if (!user || !isValidDifficulty) return;
    setQuizState('loading');
    const resolvedBookId = await fetchBookId();
    if (!resolvedBookId) return;
    try {
      const questionsRes = await fetch(
        `/api/books/${resolvedBookId}/questions?difficulty=${difficulty}`
      );
      if (!questionsRes.ok) {
        const errData = await questionsRes.json();
        throw new Error(errData.error || 'Failed to fetch questions');
      }
      const questionsData = await questionsRes.json();
      const allQuestions: Question[] = questionsData.questions;
      if (allQuestions.length === 0) {
        setError(t('quiz.noQuestions'));
        return;
      }
      // Filter to only unanswered questions so returning users see just the new ones
      const unanswered = allQuestions.filter((q) => !q.alreadyAnswered);
      if (unanswered.length === 0) {
        router.replace(`/books/${bookSlug}`);
        return;
      }
      setQuestions(unanswered);
      setCurrentIndex(0);
      setQuizState('playing');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong loading the quiz. Peeves might be involved!'
      );
    }
  }, [user, isValidDifficulty, difficulty, fetchBookId, router, bookSlug]);

  useEffect(() => {
    if (user && isValidDifficulty && !quizLoadedRef.current) {
      quizLoadedRef.current = true;
      loadQuiz();
    }
  }, [user, isValidDifficulty, loadQuiz]);

  // Called by ActiveQuestion when user submits an answer
  const handleAnswered = async (questionId: number, selectedOption: string): Promise<AnswerResult> => {
    const question = questions.find((q) => q.id === questionId)!;

    const response = await fetch('/api/quiz/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, selectedOption }),
    });

    if (!response.ok) {
      const errData = await response.json();
      setError(errData.error || 'Failed to submit answer');
      throw new Error(errData.error);
    }

    const result: AnswerResult = await response.json();

    const newAnswer: QuizAnswer = {
      questionId: question.id,
      questionText: question.questionText,
      selectedOption,
      correctOption: result.correctOption,
      isCorrect: result.correct,
      explanation: result.explanation,
      pointsAwarded: result.pointsAwarded,
      options: {
        A: question.optionA,
        B: question.optionB,
        C: question.optionC,
        D: question.optionD,
      },
    };

    setAnswers((prev) => [...prev, newAnswer]);

    if (result.pointsAwarded > 0) {
      setTotalPointsEarned((prev) => prev + result.pointsAwarded);
    }

    if (result.newUnlocks.length > 0) {
      setNewUnlocks(result.newUnlocks);
      setTimeout(() => setShowUnlockCelebration(true), 800);
    }

    // Show achievement popup if new achievements were unlocked
    if (result.newAchievements && result.newAchievements.length > 0) {
      const defs = result.newAchievements
        .map((id) => achievementDefs.find((a) => a.id === id))
        .filter((a): a is AchievementDef => a !== undefined);
      if (defs.length > 0) {
        setPopupAchievements(defs);
      }
    }

    // Fire-and-forget so the result is returned to ActiveQuestion immediately
    refreshUser();
    return result;
  };

  // The actual advance logic (called directly or after goblet dismissal)
  const advanceToNext = useCallback(() => {
    const idx = currentIndex + 1;

    if (idx >= questions.length) {
      // Quiz done — navigate to results
      const resultsData = {
        bookSlug,
        bookTitle,
        difficulty,
        bookId,
        answers: answersRef.current,
        totalPointsEarned: totalPointsRef.current,
        totalQuestions: questions.length,
      };
      sessionStorage.setItem('quiz_results', JSON.stringify(resultsData));
      router.push(`/books/${bookSlug}/${difficulty}/results`);
      return;
    }

    setCurrentIndex(idx);
  }, [currentIndex, questions, bookSlug, bookTitle, difficulty, bookId, router]);

  // Called by ActiveQuestion when user clicks Next / See Results
  const handleNext = () => {
    // Check if this is the last question (going to results) — don't trigger goblet
    const isLast = isLastQuestion();

    // ~5% chance to show the Goblet of Fortune, only if not the last question and user has points
    if (!isLast && user && user.totalPoints > 0 && Math.random() < 0.05) {
      setPendingNext(() => advanceToNext);
      setShowGoblet(true);
      return;
    }

    advanceToNext();
  };

  // Is the current question the last one?
  const isLastQuestion = () => {
    return currentIndex + 1 >= questions.length;
  };

  // --- Render ---

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

  if (!isValidDifficulty) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-amber-300 text-xl mb-4">
              {t('quiz.invalidDifficulty')}
            </p>
            <MagicalButton variant="secondary" onClick={() => router.push(`/books/${bookSlug}`)}>
              {t('quiz.chooseDifficulty')}
            </MagicalButton>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <div className="text-5xl mb-4">&#128171;</div>
            <p className="text-amber-300 text-xl mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <MagicalButton variant="secondary" onClick={() => router.push(`/books/${bookSlug}`)}>
                {t('quiz.backToBook')}
              </MagicalButton>
              <MagicalButton onClick={() => window.location.reload()}>{t('quiz.tryAgain')}</MagicalButton>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const difficultyLabel =
    difficulty === 'easy' ? t('difficulty.firstYears') : difficulty === 'normal' ? t('difficulty.owls') : difficulty === 'hard' ? t('difficulty.newts') : t('difficulty.orderOfThePhoenix');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {showUnlockCelebration && newUnlocks.length > 0 && (
        <UnlockCelebration books={newUnlocks} onClose={() => setShowUnlockCelebration(false)} />
      )}

      {showGoblet && (
        <GobletOfFortune
          onDismiss={() => {
            setShowGoblet(false);
            if (pendingNext) {
              pendingNext();
              setPendingNext(null);
            }
          }}
        />
      )}

      {popupAchievements.length > 0 && (
        <AchievementPopup
          achievements={popupAchievements}
          onDismiss={() => setPopupAchievements([])}
        />
      )}

      <main className="flex-1 px-4 sm:px-6 pb-12 max-w-2xl mx-auto w-full">
        <div className="mt-4 mb-4 flex items-center justify-between">
          <Link
            href={`/books/${bookSlug}`}
            className="text-amber-300/70 hover:text-amber-200 transition-colors"
          >
            &larr; {t('quiz.back')}
          </Link>
          <span className="text-amber-200/60 text-sm font-[family-name:var(--font-cinzel)]">
            {bookTitle} &middot; {difficultyLabel}
          </span>
        </div>

        <QuizProgressBar current={currentIndex + 1} total={questions.length} className="mb-6" />

        {quizState === 'loading' && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-5xl text-amber-400 mb-4"
            >
              &#9733;
            </motion.div>
            <p className="text-amber-200/60 text-lg">{t('quiz.loading')}</p>
          </div>
        )}

        {quizState === 'playing' && currentQuestion && (
          <ActiveQuestion
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            onAnswered={handleAnswered}
            onNext={handleNext}
            isLast={isLastQuestion()}
          />
        )}

        {totalPointsEarned > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 bg-amber-900/90 border border-amber-500/30 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-amber-200 text-xs sm:text-sm backdrop-blur-sm"
          >
            {t('quiz.pointsThisQuiz', { points: totalPointsEarned })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
