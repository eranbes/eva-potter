'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import ParchmentCard from '@/components/ui/ParchmentCard';

interface LeaderboardEntry {
  id: string;
  rank: number;
  firstName: string;
  totalPoints: number;
  isCurrentUser: boolean;
}

interface HouseStanding {
  house: string;
  totalPoints: number;
  memberCount: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { t, language } = useTranslation();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [houseStandings, setHouseStandings] = useState<HouseStanding[]>([]);
  const [activeTab, setActiveTab] = useState<'players' | 'houses'>('players');
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchLeaderboard = async () => {
      try {
        const response = await fetch('/api/leaderboard');
        if (!response.ok) throw new Error('Failed to fetch leaderboard');

        const data = await response.json();
        setLeaderboard(data.leaderboard);
        setHouseStandings(data.houseStandings || []);
      } catch {
        setError(t('leaderboard.error'));
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
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

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-500';
      case 2:
        return 'text-slate-400';
      case 3:
        return 'text-amber-600';
      default:
        return 'text-slate-500';
    }
  };

  const getRankLabel = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  // Check if the current user was appended (not in top 50)
  const top50 = leaderboard.filter((_, i) => i < 50 || leaderboard[i].isCurrentUser);
  const appendedUser = leaderboard.length > 50 ? leaderboard[leaderboard.length - 1] : null;
  const mainList = appendedUser ? leaderboard.slice(0, -1) : leaderboard;

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
            <span>{t('leaderboard.backToBookshelf')}</span>
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
            {t('leaderboard.title')}
          </h1>
          <p className="text-amber-200/60 text-lg">
            {t('leaderboard.subtitle')}
          </p>
        </motion.div>

        {/* Tabs */}
        {!loadingLeaderboard && !error && (
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setActiveTab('players')}
              className={`px-4 py-2 rounded-lg font-[family-name:var(--font-cinzel)] text-sm transition-colors ${
                activeTab === 'players'
                  ? 'bg-amber-500/30 text-amber-100 border border-amber-400/40'
                  : 'text-amber-200/50 hover:text-amber-200/80'
              }`}
            >
              {t('leaderboard.playersTab')}
            </button>
            <button
              onClick={() => setActiveTab('houses')}
              className={`px-4 py-2 rounded-lg font-[family-name:var(--font-cinzel)] text-sm transition-colors ${
                activeTab === 'houses'
                  ? 'bg-amber-500/30 text-amber-100 border border-amber-400/40'
                  : 'text-amber-200/50 hover:text-amber-200/80'
              }`}
            >
              {t('leaderboard.housesTab')}
            </button>
          </div>
        )}

        {/* Loading state */}
        {loadingLeaderboard && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-5xl text-amber-400 mb-4"
            >
              &#9733;
            </motion.div>
            <p className="text-amber-200/60 text-lg">{t('leaderboard.loading')}</p>
          </div>
        )}

        {/* Error state */}
        {error && !loadingLeaderboard && (
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

        {/* House standings */}
        {!loadingLeaderboard && !error && activeTab === 'houses' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ParchmentCard>
              {houseStandings.length === 0 ? (
                <p className="text-slate-500 text-center py-8">{t('leaderboard.noHouses')}</p>
              ) : (
                <div className="divide-y divide-amber-200/40">
                  {houseStandings.map((standing, index) => {
                    const houseColorMap: Record<string, string> = {
                      gryffindor: 'bg-red-700/20 border-red-500/30',
                      slytherin: 'bg-emerald-800/20 border-emerald-500/30',
                      ravenclaw: 'bg-blue-800/20 border-blue-500/30',
                      hufflepuff: 'bg-yellow-600/20 border-yellow-500/30',
                    };
                    const houseEmoji: Record<string, string> = {
                      gryffindor: '\u{1F981}',
                      slytherin: '\u{1F40D}',
                      ravenclaw: '\u{1F985}',
                      hufflepuff: '\u{1F9A1}',
                    };
                    const colors = houseColorMap[standing.house] || '';
                    const emoji = houseEmoji[standing.house] || '';
                    const isUserHouse = user?.house === standing.house;

                    return (
                      <motion.div
                        key={standing.house}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                        className={`flex items-center gap-3 py-4 px-3 rounded-lg ${
                          isUserHouse ? `${colors} border` : ''
                        }`}
                      >
                        <span className="text-2xl w-10 text-center">{emoji}</span>
                        <span className="flex-1 font-bold text-base text-slate-700 font-[family-name:var(--font-cinzel)]">
                          {t(`sorting.${standing.house}`)}
                          {isUserHouse && (
                            <span className="text-amber-600 text-sm ml-2">{t('leaderboard.you')}</span>
                          )}
                        </span>
                        <div className="text-right">
                          <div className="flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="12" r="10" />
                            </svg>
                            <span className="font-bold text-sm text-slate-600">
                              {standing.totalPoints}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400">
                            {standing.memberCount} {t('leaderboard.players')}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </ParchmentCard>
          </motion.div>
        )}

        {/* Leaderboard content */}
        {!loadingLeaderboard && !error && activeTab === 'players' && leaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ParchmentCard>
              <div className="divide-y divide-amber-200/40">
                {mainList.map((entry, index) => (
                  <motion.div
                    key={`${entry.rank}-${entry.firstName}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                    className={`flex items-center gap-3 py-3 px-2 rounded-lg ${
                      entry.isCurrentUser
                        ? 'bg-amber-400/20 border border-amber-400/30'
                        : ''
                    }`}
                  >
                    {/* Rank */}
                    <span
                      className={`w-10 text-center font-bold text-lg font-[family-name:var(--font-cinzel)] ${getRankStyle(
                        entry.rank
                      )}`}
                    >
                      {getRankLabel(entry.rank)}
                    </span>

                    {/* Name */}
                    <Link
                      href={`/player/${entry.id}`}
                      className={`flex-1 font-medium text-base hover:text-amber-600 transition-colors ${
                        entry.isCurrentUser
                          ? 'text-amber-800 font-bold'
                          : 'text-slate-700'
                      }`}
                    >
                      {entry.firstName}
                      {entry.isCurrentUser && (
                        <span className="text-amber-600 text-sm ml-2">{t('leaderboard.you')}</span>
                      )}
                    </Link>

                    {/* Points */}
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="w-4 h-4 text-amber-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      <span
                        className={`font-bold text-sm ${
                          entry.isCurrentUser ? 'text-amber-700' : 'text-slate-600'
                        }`}
                      >
                        {entry.totalPoints}
                      </span>
                    </div>
                  </motion.div>
                ))}

                {/* Appended current user (not in top 50) */}
                {appendedUser && (
                  <>
                    <div className="py-2 text-center">
                      <span className="text-slate-400 text-sm tracking-widest">
                        &middot; &middot; &middot;
                      </span>
                    </div>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 }}
                      className="flex items-center gap-3 py-3 px-2 rounded-lg bg-amber-400/20 border border-amber-400/30"
                    >
                      <span className="w-10 text-center font-bold text-lg font-[family-name:var(--font-cinzel)] text-slate-500">
                        #{appendedUser.rank}
                      </span>
                      <Link
                        href={`/player/${appendedUser.id}`}
                        className="flex-1 font-bold text-base text-amber-800 hover:text-amber-600 transition-colors"
                      >
                        {appendedUser.firstName}
                        <span className="text-amber-600 text-sm ml-2">{t('leaderboard.you')}</span>
                      </Link>
                      <div className="flex items-center gap-1.5">
                        <svg
                          className="w-4 h-4 text-amber-500"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                        <span className="font-bold text-sm text-amber-700">
                          {appendedUser.totalPoints}
                        </span>
                      </div>
                    </motion.div>
                  </>
                )}
              </div>
            </ParchmentCard>
          </motion.div>
        )}
      </main>
    </div>
  );
}
