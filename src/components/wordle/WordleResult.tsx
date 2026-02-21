'use client';

import { useTranslation } from '@/components/providers/LanguageProvider';

interface WordleResultProps {
  won: boolean;
  word: string;
  guessesUsed: number;
  pointsAwarded: number;
  onPlayAgain: () => void;
}

export default function WordleResult({
  won,
  word,
  guessesUsed,
  pointsAwarded,
  onPlayAgain,
}: WordleResultProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="
          relative mx-4 w-full max-w-sm
          bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900
          border border-indigo-500/30
          rounded-2xl p-6 md:p-8
          shadow-2xl shadow-indigo-900/40
          text-center
        "
      >
        {/* Header icon / emoji area */}
        <div
          className={`
            text-5xl md:text-6xl mb-4
            ${won ? 'animate-wordle-bounce' : ''}
          `}
        >
          {won ? (
            <span role="img" aria-label="celebration">
              &#x2728;
            </span>
          ) : (
            <span role="img" aria-label="sad">
              &#x1F614;
            </span>
          )}
        </div>

        {/* Win/Lose message */}
        <h2
          className="text-2xl md:text-3xl font-bold mb-2 text-glow-gold"
          style={{ color: won ? 'var(--color-gold-light)' : '#f87171' }}
        >
          {won ? t('wordle.win') : t('wordle.lose', { word: word.toUpperCase() })}
        </h2>

        {/* Guesses used (win only) */}
        {won && (
          <p className="text-slate-300 text-sm md:text-base mb-1">
            {t('wordle.guessesUsed', { count: guessesUsed })}
          </p>
        )}

        {/* Points awarded */}
        <div className="mt-4 mb-6">
          <p
            className="text-lg md:text-xl font-semibold text-glow-gold"
            style={{ color: 'var(--color-gold)' }}
          >
            {t('wordle.pointsEarned', { points: pointsAwarded })}
          </p>
        </div>

        {/* Play Again button */}
        <button
          onClick={onPlayAgain}
          className="
            w-full py-3 px-6 rounded-xl
            bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-500
            text-amber-950 font-bold text-base md:text-lg
            shadow-lg shadow-yellow-500/25
            hover:shadow-yellow-400/40 hover:scale-[1.03]
            active:scale-95
            transition-all duration-200
            cursor-pointer select-none
          "
        >
          {t('wordle.playAgain')}
        </button>
      </div>
    </div>
  );
}
