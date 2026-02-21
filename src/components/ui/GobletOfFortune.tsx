'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/providers/LanguageProvider';
import { useUser } from '@/components/providers/UserProvider';

type Phase = 'bet' | 'pick' | 'reveal' | 'result';

const FLAME_COLORS = [
  { key: 1, label: 'goblet.red', idle: 'from-red-500 to-orange-400', glow: 'shadow-red-500/60' },
  { key: 2, label: 'goblet.blue', idle: 'from-blue-500 to-cyan-400', glow: 'shadow-blue-500/60' },
  { key: 3, label: 'goblet.gold', idle: 'from-yellow-400 to-amber-300', glow: 'shadow-yellow-400/60' },
];

const WIN_GLOW = 'from-yellow-300 to-amber-200 shadow-yellow-300/80';
const LOSE_DIM = 'from-gray-600 to-gray-500 shadow-gray-500/20';

interface GobletOfFortuneProps {
  onDismiss: () => void;
}

export default function GobletOfFortune({ onDismiss }: GobletOfFortuneProps) {
  const { t } = useTranslation();
  const { user, refreshUser } = useUser();

  const [phase, setPhase] = useState<Phase>('bet');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [chosenFlame, setChosenFlame] = useState<number | null>(null);
  const [winningPosition, setWinningPosition] = useState<number | null>(null);
  const [won, setWon] = useState(false);
  const [pointsChange, setPointsChange] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPoints = user?.totalPoints ?? 0;

  const betOptions = [10, 25, 50, 100].filter((v) => v <= totalPoints);
  const showAllIn = totalPoints > 0 && !betOptions.includes(totalPoints);

  const handleBetSelect = (amount: number) => {
    setBetAmount(amount);
    setPhase('pick');
  };

  const handleFlamePick = async (position: number) => {
    if (isSubmitting) return;
    setChosenFlame(position);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: betAmount, choice: position }),
      });

      if (!res.ok) {
        // On error, just dismiss
        onDismiss();
        return;
      }

      const data = await res.json();
      setWinningPosition(data.winningPosition);
      setWon(data.won);
      setPointsChange(Math.abs(data.pointsChange));
      setPhase('reveal');

      // After reveal animation, show result
      setTimeout(() => {
        setPhase('result');
        refreshUser();
      }, 1500);
    } catch {
      onDismiss();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-gradient-to-b from-indigo-950 to-slate-950 border border-amber-500/30 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl shadow-amber-500/10"
        >
          {/* Title */}
          <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-5xl mb-3">&#x1F525;</div>
            <h2 className="text-2xl font-bold text-amber-300 font-[family-name:var(--font-cinzel)]">
              {t('goblet.title')}
            </h2>
            <p className="text-amber-200/60 text-base mt-2">{t('goblet.subtitle')}</p>
          </motion.div>

          {/* Bet phase */}
          {phase === 'bet' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6"
            >
              <p className="text-amber-200 text-base mb-5">{t('goblet.betPrompt')}</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {betOptions.map((amount) => (
                  <motion.button
                    key={amount}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBetSelect(amount)}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-700 to-amber-600 text-amber-100 font-bold text-base shadow-lg shadow-amber-700/30 cursor-pointer"
                  >
                    {amount}
                  </motion.button>
                ))}
                {showAllIn && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBetSelect(totalPoints)}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-red-700 to-red-600 text-red-100 font-bold text-base shadow-lg shadow-red-700/30 cursor-pointer"
                  >
                    {t('goblet.allIn')} ({totalPoints})
                  </motion.button>
                )}
              </div>
              <button
                onClick={onDismiss}
                className="mt-5 text-amber-300/50 hover:text-amber-300/80 text-base transition-colors cursor-pointer"
              >
                {t('goblet.skip')}
              </button>
            </motion.div>
          )}

          {/* Pick flame phase */}
          {phase === 'pick' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <p className="text-amber-200 text-base mb-5">{t('goblet.flamePrompt')}</p>
              <div className="flex gap-5 justify-center">
                {FLAME_COLORS.map((flame) => (
                  <motion.button
                    key={flame.key}
                    whileHover={{ scale: 1.1, y: -4 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFlamePick(flame.key)}
                    disabled={isSubmitting}
                    className={`
                      flex flex-col items-center gap-3 p-3 rounded-xl cursor-pointer
                      ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    <div
                      className={`w-20 h-24 rounded-full bg-gradient-to-t ${flame.idle} shadow-lg ${flame.glow} relative`}
                    >
                      <motion.div
                        animate={{ y: [-2, 2, -2], opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`absolute inset-0 rounded-full bg-gradient-to-t ${flame.idle} blur-sm`}
                      />
                    </div>
                    <span className="text-amber-200/80 text-sm font-bold">{t(flame.label)}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Reveal phase */}
          {phase === 'reveal' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6"
            >
              <div className="flex gap-5 justify-center">
                {FLAME_COLORS.map((flame) => {
                  const isWinner = flame.key === winningPosition;
                  const isChosen = flame.key === chosenFlame;
                  const gradientClass = isWinner ? WIN_GLOW : LOSE_DIM;

                  return (
                    <motion.div
                      key={flame.key}
                      animate={
                        isWinner
                          ? { scale: [1, 1.2, 1.1], y: [0, -8, -4] }
                          : { scale: 0.8, opacity: 0.4 }
                      }
                      transition={{ duration: 0.8 }}
                      className="flex flex-col items-center gap-3 p-3"
                    >
                      <div
                        className={`w-20 h-24 rounded-full bg-gradient-to-t ${gradientClass} shadow-lg relative`}
                      >
                        {isWinner && (
                          <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                            className="absolute inset-0 rounded-full bg-gradient-to-t from-yellow-300 to-amber-200 blur-md"
                          />
                        )}
                      </div>
                      <span className="text-amber-200/80 text-sm font-bold">
                        {t(flame.label)}
                        {isChosen ? ' \u2190' : ''}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Result phase */}
          {phase === 'result' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <div className="text-5xl mb-4">{won ? '\u2728' : '\ud83d\udca8'}</div>
              <p
                className={`text-xl font-bold mb-2 ${
                  won ? 'text-yellow-300' : 'text-red-300'
                }`}
              >
                {won
                  ? t('goblet.win', { points: pointsChange })
                  : t('goblet.lose', { points: pointsChange })}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
                className="mt-5 px-8 py-3.5 rounded-xl bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-500 text-amber-950 font-bold text-lg shadow-lg shadow-yellow-500/25 cursor-pointer"
              >
                {t('goblet.continue')}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
