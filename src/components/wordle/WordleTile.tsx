'use client';

interface WordleTileProps {
  letter: string;
  state: 'correct' | 'present' | 'absent' | 'empty' | 'tbd';
  delay?: number;
  position?: number;
}

const stateClasses: Record<WordleTileProps['state'], string> = {
  empty: 'border-2 border-slate-600 bg-transparent',
  tbd: 'border-2 border-slate-500 bg-slate-700/50',
  correct: 'border-0 bg-emerald-600',
  present: 'border-0 bg-yellow-600',
  absent: 'border-0 bg-gray-600',
};

export default function WordleTile({
  letter,
  state,
  position = 0,
}: WordleTileProps) {
  const isRevealed = state === 'correct' || state === 'present' || state === 'absent';

  return (
    <div
      className={`
        w-[48px] h-[48px] md:w-[56px] md:h-[56px] lg:w-[64px] lg:h-[64px]
        flex items-center justify-center
        text-2xl font-bold uppercase text-white
        select-none transition-colors duration-100
        ${stateClasses[state]}
        ${isRevealed ? 'animate-wordle-flip' : ''}
      `}
      style={
        isRevealed
          ? { animationDelay: `${position * 150}ms`, animationFillMode: 'both' }
          : undefined
      }
    >
      {letter}
    </div>
  );
}
