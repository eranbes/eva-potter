'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/components/providers/LanguageProvider';

type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

interface BookProgress {
  completed: boolean;
  questionsCorrect: number;
}

interface BookCardProps {
  id: number;
  title: string;
  description: string;
  coverImage?: string;
  unlocked: boolean;
  pointsToUnlock: number;
  userPoints: number;
  progress: Partial<Record<Difficulty, BookProgress | null>>;
  onClick?: () => void;
  className?: string;
}

const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-emerald-500',
  normal: 'bg-yellow-500',
  hard: 'bg-orange-500',
  expert: 'bg-purple-500',
};

export default function BookCard({
  title,
  description,
  unlocked,
  pointsToUnlock,
  userPoints,
  progress,
  onClick,
  className = '',
}: BookCardProps) {
  const { t } = useTranslation();
  const pointsNeeded = Math.max(0, pointsToUnlock - userPoints);

  const difficultyLabels: Record<Difficulty, string> = {
    easy: t('difficulty.easy'),
    normal: t('difficulty.normal'),
    hard: t('difficulty.hard'),
    expert: t('difficulty.expert'),
  };

  return (
    <motion.button
      type="button"
      onClick={unlocked ? onClick : undefined}
      whileHover={unlocked ? { scale: 1.04, y: -4 } : undefined}
      whileTap={unlocked ? { scale: 0.97 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        relative flex flex-col items-center text-center
        w-full rounded-2xl p-4 md:p-5 border-2
        transition-all duration-300
        ${
          unlocked
            ? 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-yellow-400/60 shadow-lg shadow-yellow-500/15 cursor-pointer hover:shadow-yellow-400/30'
            : 'bg-slate-200/60 border-slate-300 cursor-default'
        }
        ${className}
      `}
    >
      {/* Lock overlay for locked books */}
      {!unlocked && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-slate-400/30 backdrop-blur-[1px]">
          <svg
            className="w-10 h-10 text-slate-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0110 0v4" />
          </svg>
          <span className="text-sm font-bold text-slate-600">
            {t('bookCard.pointsToUnlock', { points: pointsNeeded })}
          </span>
        </div>
      )}

      {/* Book cover representation */}
      <div
        className={`
          w-full aspect-[3/4] rounded-xl mb-3 flex items-center justify-center
          ${
            unlocked
              ? 'bg-gradient-to-br from-red-900 via-red-800 to-amber-900 shadow-inner'
              : 'bg-slate-300'
          }
        `}
      >
        <span
          className={`text-base md:text-lg font-bold px-3 text-center leading-tight ${
            unlocked ? 'text-yellow-200' : 'text-slate-500'
          }`}
        >
          {title}
        </span>
      </div>

      {/* Book title below cover */}
      <h3
        className={`text-sm md:text-base font-bold mb-1 leading-tight ${
          unlocked ? 'text-amber-900' : 'text-slate-500'
        }`}
      >
        {title}
      </h3>

      {/* Completion badges */}
      {unlocked && (
        <div className="flex items-center gap-1.5 mt-2">
          {(['easy', 'normal', 'hard', 'expert'] as Difficulty[]).map((diff) => {
            const p = progress[diff];
            const completed = p?.completed ?? false;
            return (
              <div
                key={diff}
                className={`
                  flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                  ${
                    completed
                      ? `${difficultyColors[diff]} text-white`
                      : 'bg-slate-200 text-slate-400'
                  }
                `}
                title={`${difficultyLabels[diff]}${completed ? ' - Completed!' : ''}`}
              >
                {completed && (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {difficultyLabels[diff][0]}
              </div>
            );
          })}
        </div>
      )}
    </motion.button>
  );
}
