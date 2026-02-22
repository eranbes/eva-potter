'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import ParchmentCard from '@/components/ui/ParchmentCard';
import HouseBadge from '@/components/ui/HouseBadge';
import { dragons as allDragons, type DragonDef } from '@/lib/dragons/definitions';
import type { PatronusAnimal } from '@/lib/patronus/animals';
import type { AchievementDef } from '@/lib/achievements/definitions';

interface ProfileUser {
  id: string;
  firstName: string;
  totalPoints: number;
  house: string | null;
  patronus: PatronusAnimal | null;
  createdAt: string;
}

interface ProfileAchievement extends AchievementDef {
  unlocked: boolean;
  unlockedAt: string | null;
}

interface ProfileDragon {
  dragonType: string;
  obtainedAt: string;
  dragon: DragonDef | null;
}

interface ProfileData {
  user: ProfileUser;
  achievements: ProfileAchievement[];
  dragons: ProfileDragon[];
}

export default function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { t, language } = useTranslation();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/player/${id}`);
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data: ProfileData = await response.json();
        setProfile(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, id, language]);

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

  const uniqueDragonTypes = profile
    ? new Set(profile.dragons.map((d) => d.dragonType))
    : new Set<string>();

  const unlockedCount = profile
    ? profile.achievements.filter((a) => a.unlocked).length
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 pb-12 max-w-3xl mx-auto w-full">
        {/* Back to leaderboard */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 mb-6"
        >
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 text-amber-300/70 hover:text-amber-200 transition-colors text-lg"
          >
            <span>&larr;</span>
            <span>{t('profile.backToLeaderboard')}</span>
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
            {t('profile.title')}
          </h1>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-5xl text-amber-400 mb-4"
            >
              &#9733;
            </motion.div>
            <p className="text-amber-200/60 text-lg">{t('profile.loading')}</p>
          </div>
        )}

        {/* Not found */}
        {notFound && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-amber-400 text-lg">{t('profile.notFound')}</p>
          </motion.div>
        )}

        {/* Profile content */}
        {!loading && !notFound && profile && (
          <>
            {/* Player header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8"
            >
              <ParchmentCard>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="font-[family-name:var(--font-cinzel)] text-xl font-bold text-slate-800">
                        {profile.user.firstName}
                      </h2>
                      {profile.user.house && (
                        <HouseBadge house={profile.user.house} size="sm" />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <svg
                        className="w-4 h-4 text-amber-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      <span className="font-bold text-sm text-slate-600">
                        {profile.user.totalPoints} points
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs">
                      {t('profile.memberSince', {
                        date: new Date(profile.user.createdAt).toLocaleDateString(
                          language === 'fr' ? 'fr-FR' : 'en-US',
                          { year: 'numeric', month: 'long', day: 'numeric' }
                        ),
                      })}
                    </p>
                  </div>
                </div>
              </ParchmentCard>
            </motion.div>

            {/* Patronus */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <ParchmentCard>
                <h3 className="font-[family-name:var(--font-cinzel)] text-lg font-bold text-slate-800 mb-3">
                  {t('patronus.title')}
                </h3>
                {profile.user.patronus ? (
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{profile.user.patronus.emoji}</span>
                    <p className="text-slate-700 font-bold text-lg">
                      {language === 'fr'
                        ? profile.user.patronus.nameFr
                        : profile.user.patronus.nameEn}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">{t('profile.notRevealed')}</p>
                )}
              </ParchmentCard>
            </motion.div>

            {/* Dragon Collection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-8"
            >
              <ParchmentCard>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-[family-name:var(--font-cinzel)] text-lg font-bold text-slate-800">
                    {t('dragons.title')}
                  </h3>
                  <p className="text-slate-500 text-xs">
                    {t('dragons.collected', { count: uniqueDragonTypes.size })}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {allDragons.map((def) => {
                    const owned = uniqueDragonTypes.has(def.id);
                    const name = language === 'fr' ? def.nameFr : def.nameEn;
                    const rarityLabel = t(`dragons.rarity.${def.rarity}`);
                    return (
                      <div
                        key={def.id}
                        className={`flex items-center gap-3 rounded-lg p-2.5 border ${
                          owned
                            ? 'bg-slate-50 border-slate-200'
                            : 'bg-slate-100/50 border-slate-200/50 opacity-40 grayscale'
                        }`}
                      >
                        <span className="text-3xl">{owned ? def.emoji : '❓'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-800 font-medium text-sm truncate">
                            {owned ? name : '???'}
                          </p>
                          <span
                            className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                            style={{
                              background: owned ? `${def.color}22` : '#94a3b822',
                              color: owned ? def.color : '#94a3b8',
                            }}
                          >
                            {rarityLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ParchmentCard>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-8"
            >
              <ParchmentCard>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-[family-name:var(--font-cinzel)] text-lg font-bold text-slate-800">
                    {t('profile.achievements')}
                  </h3>
                  <p className="text-slate-500 text-xs">
                    {t('profile.achievementsCount', {
                      count: unlockedCount,
                      total: profile.achievements.length,
                    })}
                  </p>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {profile.achievements.map((a) => {
                    const name = language === 'fr' ? a.nameFr : a.nameEn;
                    return (
                      <div
                        key={a.id}
                        className={`flex flex-col items-center text-center gap-1 ${
                          a.unlocked ? '' : 'opacity-30 grayscale'
                        }`}
                        title={name}
                      >
                        <span className="text-2xl">{a.icon}</span>
                        <p className="text-slate-600 text-[10px] leading-tight line-clamp-2">
                          {name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </ParchmentCard>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
