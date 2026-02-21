'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import ResultsSummary from '@/components/results/ResultsSummary';
import AnswerReview from '@/components/results/AnswerReview';
import StarRating from '@/components/ui/StarRating';
import MagicalButton from '@/components/ui/MagicalButton';
import SparkleEffect from '@/components/ui/SparkleEffect';

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

interface QuizResults {
  bookSlug: string;
  bookTitle: string;
  difficulty: string;
  bookId: number;
  answers: QuizAnswer[];
  totalPointsEarned: number;
  totalQuestions: number;
}

export default function ResultsPage({
  params,
}: {
  params: Promise<{ bookSlug: string; difficulty: string }>;
}) {
  const { bookSlug, difficulty } = use(params);
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { t } = useTranslation();
  const [results, setResults] = useState<QuizResults | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/');
      return;
    }

    // Load results from sessionStorage
    const stored = sessionStorage.getItem('quiz_results');
    if (stored) {
      try {
        const parsed: QuizResults = JSON.parse(stored);

        // Verify the results match this page
        if (parsed.bookSlug === bookSlug && parsed.difficulty === difficulty) {
          setResults(parsed);

          // Trigger celebration if they scored well
          const correctCount = parsed.answers.filter((a) => a.isCorrect).length;
          if (correctCount >= Math.ceil(parsed.answers.length * 0.6)) {
            setTimeout(() => setShowCelebration(true), 500);
          }
        }
      } catch {
        // Invalid data - ignore
      }
    }
  }, [user, userLoading, router, bookSlug, difficulty]);

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

  if (!results || results.answers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-amber-300 text-xl mb-6">
              {t('results.noResults')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <MagicalButton
                variant="secondary"
                onClick={() => router.push(`/books/${bookSlug}/${difficulty}`)}
              >
                {t('results.takeQuiz')}
              </MagicalButton>
              <MagicalButton onClick={() => router.push('/books')}>
                {t('results.backToBookshelf')}
              </MagicalButton>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const correctCount = results.answers.filter((a) => a.isCorrect).length;
  const totalAnswered = results.answers.length;
  const percentage = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;

  // Calculate star rating (1-5 stars)
  const starRating =
    percentage >= 90 ? 5 : percentage >= 70 ? 4 : percentage >= 50 ? 3 : percentage >= 30 ? 2 : 1;

  const difficultyLabel =
    difficulty === 'easy'
      ? t('difficulty.firstYears')
      : difficulty === 'normal'
      ? t('difficulty.owls')
      : t('difficulty.newts');

  // Encouraging message based on performance
  const getMessage = () => {
    if (percentage === 100) return t('results.outstanding');
    if (percentage >= 80) return t('results.exceeds');
    if (percentage >= 60) return t('results.acceptable');
    if (percentage >= 40) return t('results.notBad');
    return t('results.keepTrying');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 pb-12 max-w-2xl mx-auto w-full">
        {/* Celebration sparkles */}
        {showCelebration && (
          <div className="fixed inset-0 pointer-events-none z-50">
            <SparkleEffect />
          </div>
        )}

        {/* Title area */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-8 mb-6"
        >
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-amber-100 mb-2">
            {t('results.title')}
          </h1>
          <p className="text-amber-200/60">
            {results.bookTitle} &middot; {difficultyLabel}
          </p>
        </motion.div>

        {/* Results summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ResultsSummary
            correctCount={correctCount}
            totalQuestions={totalAnswered}
            pointsEarned={results.totalPointsEarned}
            message={getMessage()}
          />
        </motion.div>

        {/* Star rating */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-center mt-6 mb-2"
        >
          <StarRating rating={starRating} />
        </motion.div>

        {/* Animated points counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="text-center mb-8"
        >
          <motion.p
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.9,
              type: 'spring',
              stiffness: 200,
            }}
            className="text-2xl font-bold text-amber-300"
          >
            {t('results.pointsEarned', { points: results.totalPointsEarned })}
          </motion.p>
          <p className="text-amber-200/50 text-sm mt-1">
            {t('results.totalPoints', { points: user.totalPoints })}
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-10"
        >
          <MagicalButton
            variant="primary"
            onClick={() => {
              sessionStorage.removeItem('quiz_results');
              router.push(`/books/${bookSlug}/${difficulty}`);
            }}
            className="font-[family-name:var(--font-cinzel)]"
          >
            {t('results.tryAgain')}
          </MagicalButton>
          <Link href={`/books/${bookSlug}`}>
            <MagicalButton
              variant="secondary"
              className="font-[family-name:var(--font-cinzel)] w-full"
            >
              {t('results.chooseDifficulty')}
            </MagicalButton>
          </Link>
          <Link href="/books">
            <MagicalButton
              variant="secondary"
              className="font-[family-name:var(--font-cinzel)] w-full"
            >
              {t('results.backToBookshelf')}
            </MagicalButton>
          </Link>
        </motion.div>

        {/* Divider */}
        <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent mx-auto mb-8" />

        {/* Answer review */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <h2 className="font-[family-name:var(--font-cinzel)] text-xl text-amber-200/80 text-center mb-6">
            {t('results.answerReview')}
          </h2>
          <AnswerReview answers={results.answers} />
        </motion.div>
      </main>
    </div>
  );
}
