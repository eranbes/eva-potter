'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import ParchmentCard from '@/components/ui/ParchmentCard';

interface AchievementData {
  id: string;
  nameEn: string;
  nameFr: string;
  descEn: string;
  descFr: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

export default function AchievementsPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { t, language } = useTranslation();
  const [achievementsList, setAchievementsList] = useState<AchievementData[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchAchievements = async () => {
      try {
        const response = await fetch('/api/achievements');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setAchievementsList(data.achievements);
      } catch {
        setError('Failed to load achievements');
      } finally {
        setLoadingAchievements(false);
      }
    };

    fetchAchievements();
  }, [user]);

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

  const unlockedCount = achievementsList.filter((a) => a.unlocked).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 pb-12 max-w-3xl mx-auto w-full">
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
            <span>{t('achievements.backToBookshelf')}</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-amber-100 mb-2">
            {t('achievements.title')}
          </h1>
          <p className="text-amber-200/60 text-lg">
            {t('achievements.subtitle')}
          </p>
          {!loadingAchievements && (
            <p className="text-amber-300/50 text-sm mt-2">
              {unlockedCount} / {achievementsList.length}
            </p>
          )}
        </motion.div>

        {loadingAchievements && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-5xl text-amber-400 mb-4"
            >
              &#9733;
            </motion.div>
          </div>
        )}

        {error && !loadingAchievements && (
          <div className="text-center py-12">
            <p className="text-amber-400 text-lg">{error}</p>
          </div>
        )}

        {!loadingAchievements && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ParchmentCard>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {achievementsList.map((achievement, index) => {
                  const name = language === 'fr' ? achievement.nameFr : achievement.nameEn;
                  const desc = language === 'fr' ? achievement.descFr : achievement.descEn;

                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                      className={`flex flex-col items-center text-center p-3 rounded-xl border ${
                        achievement.unlocked
                          ? 'bg-amber-100/50 border-amber-400/30'
                          : 'bg-slate-200/30 border-slate-300/20 opacity-50'
                      }`}
                    >
                      <span className={`text-3xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                        {achievement.unlocked ? achievement.icon : '\u{1F512}'}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          achievement.unlocked ? 'text-amber-800' : 'text-slate-500'
                        }`}
                      >
                        {achievement.unlocked ? name : t('achievements.locked')}
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        {achievement.unlocked && achievement.unlockedAt
                          ? t('achievements.earned', {
                              date: new Date(achievement.unlockedAt).toLocaleDateString(
                                language === 'fr' ? 'fr-FR' : 'en-US',
                                { month: 'short', day: 'numeric' }
                              ),
                            })
                          : desc}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </ParchmentCard>
          </motion.div>
        )}
      </main>
    </div>
  );
}
