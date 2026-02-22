'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import ParchmentCard from '@/components/ui/ParchmentCard';
import MagicalButton from '@/components/ui/MagicalButton';
import ProgressBar from '@/components/ui/ProgressBar';
import PatronusReveal from '@/components/patronus/PatronusReveal';
import DragonEggHatch from '@/components/dragons/DragonEggHatch';
import { getPatronusById, type PatronusAnimal } from '@/lib/patronus/animals';
import { getDragonById, DRAGON_EGG_COST, type DragonDef } from '@/lib/dragons/definitions';

interface DifficultyProgress {
  questionsAnswered: number;
  questionsCorrect: number;
  pointsEarned: number;
  completed: boolean;
  totalQuestions: number;
}

interface BookProgressData {
  book: {
    id: number;
    title: string;
    slug: string;
    sortOrder: number;
    pointsToUnlock: number;
    unlocked: boolean;
  };
  difficulties: {
    easy: DifficultyProgress | null;
    normal: DifficultyProgress | null;
    hard: DifficultyProgress | null;
    expert: DifficultyProgress | null;
  };
}

interface ProgressResponse {
  user: {
    firstName: string;
    totalPoints: number;
  };
  bookProgress: BookProgressData[];
}

export default function ProgressPage() {
  const router = useRouter();
  const { user, loading: userLoading, refreshUser } = useUser();
  const { t, language } = useTranslation();
  const [progress, setProgress] = useState<ProgressResponse | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [error, setError] = useState('');
  const [patronusRevealAnimal, setPatronusRevealAnimal] = useState<PatronusAnimal | null>(null);
  const [patronusLoading, setPatronusLoading] = useState(false);
  const [dragonHatchAnimal, setDragonHatchAnimal] = useState<DragonDef | null>(null);
  const [dragonLoading, setDragonLoading] = useState(false);
  const [userDragons, setUserDragons] = useState<Array<{ dragonType: string; obtainedAt: string }>>([]);
  const [dragonsLoaded, setDragonsLoaded] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      try {
        const [progressRes, dragonsRes] = await Promise.all([
          fetch('/api/progress'),
          fetch('/api/dragons'),
        ]);

        if (!progressRes.ok) throw new Error('Failed to fetch progress');
        const data: ProgressResponse = await progressRes.json();
        setProgress(data);

        if (dragonsRes.ok) {
          const dragonsData = await dragonsRes.json();
          setUserDragons(dragonsData.dragons ?? []);
        }
        setDragonsLoaded(true);
      } catch {
        setError(t('progress.error'));
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchProgress();
  }, [user, language]);

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

  // Calculate overall stats
  const calculateStats = () => {
    if (!progress) return { totalAnswered: 0, totalCorrect: 0, totalPoints: 0 };

    let totalAnswered = 0;
    let totalCorrect = 0;
    let totalPoints = 0;

    for (const bp of progress.bookProgress) {
      for (const diff of ['easy', 'normal', 'hard', 'expert'] as const) {
        const d = bp.difficulties[diff];
        if (d) {
          totalAnswered += d.questionsAnswered;
          totalCorrect += d.questionsCorrect;
          totalPoints += d.pointsEarned;
        }
      }
    }

    return { totalAnswered, totalCorrect, totalPoints };
  };

  const stats = calculateStats();

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'text-emerald-700';
      case 'normal':
        return 'text-blue-700';
      case 'hard':
        return 'text-amber-700';
      case 'expert':
        return 'text-purple-700';
      default:
        return 'text-slate-700';
    }
  };

  const getDifficultyLabel = (diff: string) => {
    switch (diff) {
      case 'easy':
        return t('difficulty.firstYears');
      case 'normal':
        return t('difficulty.owls');
      case 'hard':
        return t('difficulty.newts');
      case 'expert':
        return t('difficulty.orderOfThePhoenix');
      default:
        return diff;
    }
  };

  const getDifficultyBarColor = (diff: string) => {
    switch (diff) {
      case 'easy':
        return 'bg-emerald-500';
      case 'normal':
        return 'bg-blue-500';
      case 'hard':
        return 'bg-amber-500';
      case 'expert':
        return 'bg-purple-500';
      default:
        return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 pb-12 max-w-3xl mx-auto w-full">
        {/* Back to bookshelf */}
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
            <span>{t('progress.backToBookshelf')}</span>
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-amber-100 mb-2">
            {t('progress.title')}
          </h1>
          <p className="text-amber-200/60 text-lg">
            {t('progress.subtitle')}
          </p>
        </motion.div>

        {/* Loading state */}
        {loadingProgress && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-5xl text-amber-400 mb-4"
            >
              &#9733;
            </motion.div>
            <p className="text-amber-200/60 text-lg">{t('progress.loading')}</p>
          </div>
        )}

        {/* Error state */}
        {error && !loadingProgress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-amber-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-amber-300 underline hover:text-amber-200 transition-colors"
            >
              {t('books.tryAgain')}
            </button>
          </motion.div>
        )}

        {/* Progress content */}
        {!loadingProgress && !error && progress && (
          <>
            {/* Overall stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-3 gap-2 sm:gap-3 mb-10"
            >
              <div className="bg-slate-800/60 border border-amber-500/20 rounded-xl p-3 sm:p-4 text-center">
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.3, type: 'spring' }}
                  className="text-2xl sm:text-3xl font-bold text-amber-300 font-[family-name:var(--font-cinzel)]"
                >
                  {user.totalPoints}
                </motion.p>
                <p className="text-amber-200/50 text-sm mt-1">{t('progress.totalPoints')}</p>
              </div>
              <div className="bg-slate-800/60 border border-amber-500/20 rounded-xl p-3 sm:p-4 text-center">
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4, type: 'spring' }}
                  className="text-2xl sm:text-3xl font-bold text-amber-300 font-[family-name:var(--font-cinzel)]"
                >
                  {stats.totalAnswered}
                </motion.p>
                <p className="text-amber-200/50 text-sm mt-1">{t('progress.questions')}</p>
              </div>
              <div className="bg-slate-800/60 border border-amber-500/20 rounded-xl p-3 sm:p-4 text-center">
                <motion.p
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.5, type: 'spring' }}
                  className="text-2xl sm:text-3xl font-bold text-amber-300 font-[family-name:var(--font-cinzel)]"
                >
                  {stats.totalCorrect}
                </motion.p>
                <p className="text-amber-200/50 text-sm mt-1">{t('progress.correct')}</p>
              </div>
            </motion.div>

            {/* Patronus Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-10"
            >
              <ParchmentCard>
                <h3 className="font-[family-name:var(--font-cinzel)] text-lg font-bold text-slate-800 mb-3">
                  {t('patronus.title')}
                </h3>

                {user.patronus ? (() => {
                  const animal = getPatronusById(user.patronus!);
                  if (!animal) return null;
                  const name = language === 'fr' ? animal.nameFr : animal.nameEn;
                  return (
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{animal.emoji}</span>
                      <div>
                        <p className="text-slate-700 font-bold text-lg">{name}</p>
                        <p className="text-slate-500 text-sm">{t('patronus.revealed')}</p>
                      </div>
                    </div>
                  );
                })() : user.totalPoints >= 500 ? (
                  <div className="text-center">
                    <p className="text-slate-600 mb-3">{t('patronus.reveal')}</p>
                    <MagicalButton
                      onClick={async () => {
                        if (patronusLoading) return;
                        setPatronusLoading(true);
                        try {
                          const res = await fetch('/api/patronus', { method: 'POST' });
                          const json = await res.json();
                          if (res.ok && json.patronus) {
                            setPatronusRevealAnimal(json.patronus);
                            await refreshUser();
                          }
                        } catch {
                          // silently fail
                        } finally {
                          setPatronusLoading(false);
                        }
                      }}
                      disabled={patronusLoading}
                      size="md"
                    >
                      {patronusLoading ? '...' : t('patronus.revealButton')}
                    </MagicalButton>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-600 mb-2">
                      {t('patronus.locked', { points: '500' })}
                    </p>
                    <ProgressBar
                      current={user.totalPoints}
                      total={500}
                      className="h-2"
                    />
                    <p className="text-slate-500 text-xs mt-1">
                      {t('patronus.pointsNeeded', { current: user.totalPoints, needed: 500 })}
                    </p>
                  </div>
                )}
              </ParchmentCard>
            </motion.div>

            {/* Patronus Reveal Overlay */}
            {patronusRevealAnimal && (
              <PatronusReveal
                animal={patronusRevealAnimal}
                onClose={() => setPatronusRevealAnimal(null)}
              />
            )}

            {/* Dragon Nursery Section */}
            {dragonsLoaded && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mb-10"
              >
                <ParchmentCard>
                  <h3 className="font-[family-name:var(--font-cinzel)] text-lg font-bold text-slate-800 mb-3">
                    {t('dragons.title')}
                  </h3>

                  {user.totalPoints < DRAGON_EGG_COST && userDragons.length === 0 ? (
                    // Locked: not enough points and no dragons yet
                    <div>
                      <p className="text-slate-600 mb-2">
                        {t('dragons.locked')}
                      </p>
                      <ProgressBar
                        current={user.totalPoints}
                        total={DRAGON_EGG_COST}
                        className="h-2"
                      />
                      <p className="text-slate-500 text-xs mt-1">
                        {user.totalPoints} / {DRAGON_EGG_COST} points
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Dragon collection grid */}
                      {userDragons.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-600 text-sm font-medium">
                              {t('dragons.collection')}
                            </p>
                            <p className="text-slate-500 text-xs">
                              {t('dragons.collected', {
                                count: new Set(userDragons.map((d) => d.dragonType)).size,
                              })}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {userDragons.map((ud, idx) => {
                              const def = getDragonById(ud.dragonType);
                              if (!def) return null;
                              const name = language === 'fr' ? def.nameFr : def.nameEn;
                              const rarityLabel = t(`dragons.rarity.${def.rarity}`);
                              const dateStr = new Date(ud.obtainedAt).toLocaleDateString(
                                language === 'fr' ? 'fr-FR' : 'en-US',
                                { month: 'short', day: 'numeric' }
                              );
                              return (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 bg-slate-50 rounded-lg p-2.5 border border-slate-200"
                                >
                                  <span className="text-3xl">{def.emoji}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-slate-800 font-medium text-sm truncate">{name}</p>
                                    <div className="flex items-center gap-2">
                                      <span
                                        className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                                        style={{
                                          background: `${def.color}22`,
                                          color: def.color,
                                        }}
                                      >
                                        {rarityLabel}
                                      </span>
                                      <span className="text-slate-400 text-xs">{dateStr}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {new Set(userDragons.map((d) => d.dragonType)).size < 3 && (
                            <p className="text-center text-slate-500 text-xs mt-2">
                              {t('dragons.collectAll')}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Buy egg button */}
                      <div className="text-center">
                        {user.totalPoints >= DRAGON_EGG_COST ? (
                          <MagicalButton
                            onClick={async () => {
                              if (dragonLoading) return;
                              setDragonLoading(true);
                              try {
                                const res = await fetch('/api/dragons', { method: 'POST' });
                                const json = await res.json();
                                if (res.ok && json.dragon) {
                                  setDragonHatchAnimal(json.dragon);
                                  setUserDragons((prev) => [
                                    ...prev,
                                    { dragonType: json.dragon.id, obtainedAt: new Date().toISOString() },
                                  ]);
                                  await refreshUser();
                                }
                              } catch {
                                // silently fail
                              } finally {
                                setDragonLoading(false);
                              }
                            }}
                            disabled={dragonLoading}
                            size="md"
                          >
                            {dragonLoading ? '...' : `🥚 ${t('dragons.buyEgg')} (${t('dragons.cost')})`}
                          </MagicalButton>
                        ) : userDragons.length > 0 ? (
                          <p className="text-slate-500 text-sm">
                            {t('dragons.notEnoughPoints')} ({user.totalPoints}/{DRAGON_EGG_COST})
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}
                </ParchmentCard>
              </motion.div>
            )}

            {/* Dragon Egg Hatch Overlay */}
            {dragonHatchAnimal && (
              <DragonEggHatch
                dragon={dragonHatchAnimal}
                onClose={() => setDragonHatchAnimal(null)}
              />
            )}

            {/* Hogwarts Express journey visualization */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="font-[family-name:var(--font-cinzel)] text-xl text-amber-200/80 text-center mb-8"
            >
              {t('progress.hogwartsExpress')}
            </motion.h2>

            {/* Journey stops */}
            <div className="relative">
              {/* Vertical train track line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/60 via-amber-400/40 to-amber-500/20" />

              <div className="flex flex-col gap-6">
                {progress.bookProgress.map((bp, index) => {
                  const isUnlocked = bp.book.unlocked;
                  const hasAnyProgress = Object.values(bp.difficulties).some(
                    (d) => d !== null
                  );

                  // Calculate book completion percentage
                  let bookAnswered = 0;
                  let bookTotal = 0;
                  for (const diff of ['easy', 'normal', 'hard', 'expert'] as const) {
                    const d = bp.difficulties[diff];
                    bookTotal += d?.totalQuestions ?? 20;
                    if (d) {
                      bookAnswered += d.questionsAnswered;
                    }
                  }
                  const bookPercent =
                    bookTotal > 0
                      ? Math.round((bookAnswered / bookTotal) * 100)
                      : 0;

                  return (
                    <motion.div
                      key={bp.book.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                      className="relative pl-16"
                    >
                      {/* Train stop marker */}
                      <div
                        className={`absolute left-4 top-4 w-5 h-5 rounded-full border-2 z-10 ${
                          hasAnyProgress
                            ? 'bg-amber-400 border-amber-300'
                            : isUnlocked
                            ? 'bg-slate-600 border-amber-500/50'
                            : 'bg-slate-700 border-slate-500'
                        }`}
                      >
                        {hasAnyProgress && (
                          <div className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-30" />
                        )}
                      </div>

                      {/* Stop number */}
                      <div className="absolute left-2.5 top-4 w-8 h-5 flex items-center justify-center">
                        <span
                          className={`text-xs font-bold ${
                            hasAnyProgress
                              ? 'text-amber-900'
                              : isUnlocked
                              ? 'text-amber-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {index + 1}
                        </span>
                      </div>

                      {/* Book progress card */}
                      <ParchmentCard
                        className={`${
                          !isUnlocked ? 'opacity-50 grayscale' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h3 className="font-[family-name:var(--font-cinzel)] text-base font-bold text-slate-800">
                            {bp.book.title}
                          </h3>
                          {!isUnlocked && (
                            <span className="text-slate-500 text-sm flex-shrink-0">
                              &#128274; {bp.book.pointsToUnlock} pts
                            </span>
                          )}
                        </div>

                        {isUnlocked && (
                          <>
                            {/* Overall book progress bar */}
                            <div className="mb-3">
                              <ProgressBar
                                current={bookPercent}
                                total={100}
                                className="h-2"
                              />
                              <p className="text-slate-500 text-xs mt-1">
                                {t('progress.overall', { percent: bookPercent })}
                              </p>
                            </div>

                            {/* Per-difficulty status */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {(['easy', 'normal', 'hard', 'expert'] as const).map(
                                (diff) => {
                                  const d = bp.difficulties[diff];
                                  const answered = d?.questionsAnswered ?? 0;
                                  const correct = d?.questionsCorrect ?? 0;
                                  const completed = d?.completed ?? false;
                                  const total = d?.totalQuestions ?? 20;

                                  return (
                                    <div
                                      key={diff}
                                      className="text-center"
                                    >
                                      <p
                                        className={`text-xs font-bold ${getDifficultyColor(
                                          diff
                                        )}`}
                                      >
                                        {getDifficultyLabel(diff)}
                                      </p>
                                      {d ? (
                                        <>
                                          <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                            <div
                                              className={`h-full rounded-full transition-all duration-500 ${getDifficultyBarColor(
                                                diff
                                              )}`}
                                              style={{
                                                width: `${
                                                  total > 0 ? (answered / total) * 100 : 0
                                                }%`,
                                              }}
                                            />
                                          </div>
                                          <p className="text-slate-500 text-xs mt-0.5">
                                            {completed ? (
                                              <span className="text-emerald-600">
                                                {correct}/{total}
                                              </span>
                                            ) : (
                                              `${answered}/${total}`
                                            )}
                                          </p>
                                        </>
                                      ) : (
                                        <p className="text-slate-400 text-xs mt-1 italic">
                                          --
                                        </p>
                                      )}
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </>
                        )}
                      </ParchmentCard>
                    </motion.div>
                  );
                })}

                {/* Final destination */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: 1.2 }}
                  className="relative pl-16 pb-4"
                >
                  <div className="absolute left-4 top-2 w-5 h-5 rounded-full bg-amber-500/30 border-2 border-amber-400/50 z-10" />
                  <p className="text-amber-300/60 italic text-sm pt-1">
                    {t('progress.hogwartsAwaits')}
                  </p>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
