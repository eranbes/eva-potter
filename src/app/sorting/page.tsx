'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import MagicalButton from '@/components/ui/MagicalButton';
import { sortingQuestions } from '@/lib/sorting/questions';

const houseStyles: Record<string, { gradient: string; glow: string; emoji: string }> = {
  gryffindor: {
    gradient: 'from-red-700 via-red-600 to-yellow-600',
    glow: 'shadow-red-500/50',
    emoji: '\u{1F981}',
  },
  slytherin: {
    gradient: 'from-emerald-800 via-emerald-700 to-slate-400',
    glow: 'shadow-emerald-500/50',
    emoji: '\u{1F40D}',
  },
  ravenclaw: {
    gradient: 'from-blue-800 via-blue-700 to-amber-500',
    glow: 'shadow-blue-500/50',
    emoji: '\u{1F985}',
  },
  hufflepuff: {
    gradient: 'from-yellow-600 via-yellow-500 to-slate-800',
    glow: 'shadow-yellow-500/50',
    emoji: '\u{1F9A1}',
  },
};

export default function SortingPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useUser();
  const { t, language } = useTranslation();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [phase, setPhase] = useState<'questions' | 'sorting' | 'reveal'>('questions');
  const [house, setHouse] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  // If the user already has a house, redirect
  useEffect(() => {
    if (!loading && user && user.house) {
      router.replace('/books');
    }
  }, [user, loading, router]);


  const handleSelectOption = async (optionIndex: number) => {
    const newAnswers = [...answers, optionIndex];
    setAnswers(newAnswers);

    if (newAnswers.length < 4) {
      // Move to next question
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // All questions answered — submit to API
      setPhase('sorting');

      try {
        const response = await fetch('/api/sorting', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to sort');
        }

        // Dramatic pause before reveal
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setHouse(data.house);
        setPhase('reveal');
        await refreshUser();
      } catch {
        // On error, go back to start
        setCurrentQuestion(0);
        setAnswers([]);
        setPhase('questions');
      }
    }
  };

  if (loading || !user) {
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

  const question = sortingQuestions[currentQuestion];
  const style = house ? houseStyles[house] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 pb-12 max-w-2xl mx-auto w-full flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === 'questions' && question && (
            <motion.div
              key={`question-${currentQuestion}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-8">
                <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-amber-100 mb-2">
                  {t('sorting.title')}
                </h1>
                <p className="text-amber-200/60 text-lg">
                  {t('sorting.subtitle')}
                </p>
              </div>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mb-8">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      i < currentQuestion
                        ? 'bg-amber-400'
                        : i === currentQuestion
                        ? 'bg-amber-400 animate-pulse'
                        : 'bg-amber-400/20'
                    }`}
                  />
                ))}
              </div>

              <div className="mb-6">
                <p className="text-amber-100 text-xl text-center font-[family-name:var(--font-cinzel)]">
                  {language === 'fr' ? question.questionFr : question.questionEn}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {question.options.map((option: { labelEn: string; labelFr: string }, index: number) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectOption(index)}
                    className="w-full text-left px-5 py-4 rounded-xl bg-amber-900/30 border border-amber-500/20 hover:border-amber-400/50 hover:bg-amber-900/50 text-amber-100 transition-all"
                  >
                    {language === 'fr' ? option.labelFr : option.labelEn}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'sorting' && (
            <motion.div
              key="sorting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-7xl mb-6"
              >
                &#x1F9D9;
              </motion.div>
              <p className="text-amber-200 text-xl font-[family-name:var(--font-cinzel)]">
                {t('sorting.reveal')}
              </p>
            </motion.div>
          )}

          {phase === 'reveal' && house && style && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="text-center w-full max-w-lg"
            >
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4 text-amber-200/80 text-lg font-[family-name:var(--font-cinzel)]"
              >
                {t('sorting.yourHouse')}
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                className={`inline-block rounded-2xl bg-gradient-to-br ${style.gradient} px-10 py-8 shadow-2xl ${style.glow}`}
              >
                <div className="text-6xl mb-3">{style.emoji}</div>
                <h2 className="font-[family-name:var(--font-cinzel)] text-4xl font-bold text-white">
                  {t(`sorting.${house}`)}
                </h2>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 text-amber-200/70 text-base max-w-sm mx-auto"
              >
                {t(`sorting.${house}Desc`)}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="mt-8"
              >
                <MagicalButton
                  size="lg"
                  onClick={() => router.push('/books')}
                  className="font-[family-name:var(--font-cinzel)]"
                >
                  {t('sorting.continue')}
                </MagicalButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
