'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import ParchmentCard from '@/components/ui/ParchmentCard';
import MagicalButton from '@/components/ui/MagicalButton';

interface BookProgress {
  questionsAnswered: number;
  questionsCorrect: number;
  pointsEarned: number;
  completed: boolean;
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
  progress: {
    easy: BookProgress | null;
    normal: BookProgress | null;
    hard: BookProgress | null;
  };
}

interface DifficultyConfig {
  key: 'easy' | 'normal' | 'hard';
  borderColor: string;
  bgAccent: string;
  textColor: string;
  iconColor: string;
  icon: string;
}

const difficulties: DifficultyConfig[] = [
  {
    key: 'easy',
    borderColor: 'border-emerald-400/50',
    bgAccent: 'from-emerald-50 via-green-50 to-emerald-50',
    textColor: 'text-emerald-800',
    iconColor: 'text-emerald-600',
    icon: '\u2605',
  },
  {
    key: 'normal',
    borderColor: 'border-blue-400/50',
    bgAccent: 'from-blue-50 via-sky-50 to-blue-50',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-600',
    icon: '\u2605\u2605',
  },
  {
    key: 'hard',
    borderColor: 'border-amber-500/50',
    bgAccent: 'from-amber-50 via-orange-50 to-amber-50',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-600',
    icon: '\u2605\u2605\u2605',
  },
];

export default function BookDifficultyPage({
  params,
}: {
  params: Promise<{ bookSlug: string }>;
}) {
  const { bookSlug } = use(params);
  const router = useRouter();
  const { user, loading: userLoading, refreshUser } = useUser();
  const { t, language } = useTranslation();
  const [book, setBook] = useState<Book | null>(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [error, setError] = useState('');
  const [confirmingReset, setConfirmingReset] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  const fetchBook = async () => {
    try {
      const response = await fetch('/api/books');
      if (!response.ok) throw new Error('Failed to fetch books');

      const data = await response.json();
      const found = data.books.find(
        (b: Book) => b.slug === bookSlug
      );

      if (!found) {
        setError(t('bookDetail.notFound'));
        return;
      }

      if (!found.unlocked) {
        setError(t('bookDetail.locked', { points: found.pointsToUnlock }));
        return;
      }

      setBook(found);
    } catch {
      setError(t('bookDetail.error'));
    } finally {
      setLoadingBook(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    setLoadingBook(true);
    setError('');
    setBook(null);

    fetchBook();
  }, [user, bookSlug, language]);

  const handleStartOver = async (difficulty: string) => {
    setResetting(true);
    setResetError('');

    try {
      const response = await fetch('/api/quiz/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookSlug, difficulty }),
      });

      if (!response.ok) throw new Error('Reset failed');

      setConfirmingReset(null);
      await refreshUser();
      await fetchBook();
    } catch {
      setResetError(t('bookDetail.startOverError'));
    } finally {
      setResetting(false);
    }
  };

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
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 mb-6"
        >
          <Link
            href="/books"
            className="inline-flex items-center gap-2 text-amber-300/70 hover:text-amber-200 transition-colors text-lg"
          >
            <span>&larr;</span>
            <span>{t('bookDetail.backToBookshelf')}</span>
          </Link>
        </motion.div>

        {/* Loading state */}
        {loadingBook && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-5xl text-amber-400 mb-4"
            >
              &#9733;
            </motion.div>
            <p className="text-amber-200/60 text-lg">{t('bookDetail.loading')}</p>
          </div>
        )}

        {/* Error / locked state */}
        {error && !loadingBook && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-6">&#128274;</div>
            <p className="text-amber-300 text-xl mb-6 max-w-md mx-auto">{error}</p>
            <MagicalButton
              variant="secondary"
              onClick={() => router.push('/books')}
            >
              {t('bookDetail.returnToBookshelf')}
            </MagicalButton>
          </motion.div>
        )}

        {/* Book content */}
        {book && !loadingBook && !error && (
          <>
            {/* Book title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h1 className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-bold text-amber-100 mb-3">
                {book.title}
              </h1>
              <p className="text-amber-200/60 text-lg max-w-md mx-auto">
                {book.description}
              </p>
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mx-auto mt-4" />
            </motion.div>

            {/* Choose difficulty label */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="font-[family-name:var(--font-cinzel)] text-xl text-amber-200/80 text-center mb-8"
            >
              {t('bookDetail.chooseChallenge')}
            </motion.h2>

            {/* Difficulty cards */}
            <div className="flex flex-col gap-5">
              {difficulties.map((diff, index) => {
                const progress = book.progress[diff.key];
                const isCompleted = progress?.completed ?? false;
                const questionsCorrect = progress?.questionsCorrect ?? 0;
                const questionsAnswered = progress?.questionsAnswered ?? 0;
                const hasProgress = questionsAnswered > 0;
                const isConfirming = confirmingReset === diff.key;

                return (
                  <motion.div
                    key={diff.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <Link href={`/books/${bookSlug}/${diff.key}`}>
                      <ParchmentCard hoverable className={`${diff.borderColor} border-2`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`text-2xl ${diff.iconColor}`}>
                                {diff.icon}
                              </span>
                              <h3
                                className={`font-[family-name:var(--font-cinzel)] text-xl font-bold ${diff.textColor}`}
                              >
                                {diff.key === 'easy' ? t('difficulty.firstYears') : diff.key === 'normal' ? t('difficulty.owls') : t('difficulty.newts')}
                              </h3>
                            </div>
                            <p className={`text-sm font-semibold ${diff.textColor} opacity-60 mb-2`}>
                              {diff.key === 'easy' ? t('difficulty.easy') : diff.key === 'normal' ? t('difficulty.normal') : t('difficulty.hard')}
                            </p>
                            <p className="text-slate-600 text-base">
                              {diff.key === 'easy' ? t('difficulty.easyDesc') : diff.key === 'normal' ? t('difficulty.normalDesc') : t('difficulty.hardDesc')}
                            </p>
                          </div>

                          {/* Completion status */}
                          <div className="flex-shrink-0 text-right">
                            {isCompleted ? (
                              <div className="flex flex-col items-end">
                                <span className="text-emerald-600 font-bold text-sm mb-1">
                                  {t('status.complete')}
                                </span>
                                <span className="text-slate-500 text-sm">
                                  {questionsCorrect}/{questionsAnswered}
                                </span>
                              </div>
                            ) : questionsAnswered > 0 ? (
                              <div className="flex flex-col items-end">
                                <span className="text-amber-600 font-bold text-sm mb-1">
                                  {t('status.inProgress')}
                                </span>
                                <span className="text-slate-500 text-sm">
                                  {questionsAnswered}/10
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-sm italic">
                                {t('status.notStarted')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Start Over button */}
                        {hasProgress && !isConfirming && (
                          <div className="mt-3 pt-3 border-t border-slate-200/50">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setConfirmingReset(diff.key);
                                setResetError('');
                              }}
                              className="text-sm text-slate-500 hover:text-red-600 transition-colors"
                            >
                              {t('bookDetail.startOver')}
                            </button>
                          </div>
                        )}

                        {/* Inline confirmation */}
                        {isConfirming && (
                          <div
                            className="mt-3 pt-3 border-t border-slate-200/50"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <p className="text-sm text-slate-600 mb-2">
                              {t('bookDetail.startOverConfirm', { points: progress?.pointsEarned ?? 0 })}
                            </p>
                            {resetError && (
                              <p className="text-sm text-red-600 mb-2">{resetError}</p>
                            )}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={resetting}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleStartOver(diff.key);
                                }}
                                className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              >
                                {resetting ? '...' : t('bookDetail.startOverYes')}
                              </button>
                              <button
                                type="button"
                                disabled={resetting}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setConfirmingReset(null);
                                  setResetError('');
                                }}
                                className="text-sm px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors disabled:opacity-50"
                              >
                                {t('bookDetail.startOverCancel')}
                              </button>
                            </div>
                          </div>
                        )}
                      </ParchmentCard>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
