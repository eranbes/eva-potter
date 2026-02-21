'use client';

import { Ingredient } from '@/lib/potions/ingredients';

interface PotionCardProps {
  ingredient: Ingredient;
  flipped: boolean;
  matched: boolean;
  onClick: () => void;
  name: string;
}

export default function PotionCard({ ingredient, flipped, matched, onClick, name }: PotionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={flipped || matched}
      className="perspective-[600px] w-full aspect-square cursor-pointer disabled:cursor-default"
      aria-label={flipped || matched ? name : 'Hidden card'}
    >
      <div
        className={`
          relative w-full h-full transition-transform duration-500
          [transform-style:preserve-3d]
          ${flipped || matched ? '[transform:rotateY(180deg)]' : ''}
        `}
      >
        {/* Back face (hidden state) */}
        <div
          className={`
            absolute inset-0 [backface-visibility:hidden]
            rounded-xl border-2 border-purple-500/40
            bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-950
            flex items-center justify-center
            shadow-lg shadow-purple-900/30
            hover:border-purple-400/60 hover:shadow-purple-500/20
            transition-colors duration-200
          `}
        >
          <span className="text-3xl md:text-4xl">🫕</span>
        </div>

        {/* Front face (revealed state) */}
        <div
          className={`
            absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]
            rounded-xl border-2
            ${matched
              ? 'border-emerald-400/70 shadow-lg shadow-emerald-400/30 bg-gradient-to-br from-emerald-900/80 via-emerald-950 to-emerald-900/80'
              : 'border-yellow-500/50 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800'
            }
            flex flex-col items-center justify-center gap-1 p-1
          `}
        >
          <span className="text-2xl md:text-3xl">{ingredient.emoji}</span>
          <span className="text-[10px] md:text-xs font-semibold text-purple-200 text-center leading-tight">
            {name}
          </span>
        </div>
      </div>
    </button>
  );
}
