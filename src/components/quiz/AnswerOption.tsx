'use client';

interface AnswerOptionProps {
  option: string;
  text: string;
  selected?: boolean;
  correct?: boolean;
  wrong?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

type VisualState = 'default' | 'selected' | 'correct' | 'incorrect';

const stateClasses: Record<VisualState, string> = {
  default:
    'bg-white/80 border-amber-200 hover:border-yellow-400 hover:bg-yellow-50/60 text-amber-950',
  selected:
    'bg-yellow-100 border-yellow-400 text-amber-950 ring-2 ring-yellow-400/50',
  correct:
    'bg-emerald-100 border-emerald-400 text-emerald-900 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-200/40',
  incorrect:
    'bg-amber-100 border-amber-400 text-amber-900 ring-2 ring-amber-400/50',
};

const letterBgClasses: Record<VisualState, string> = {
  default: 'bg-amber-100 text-amber-700',
  selected: 'bg-yellow-400 text-amber-900',
  correct: 'bg-emerald-400 text-white',
  incorrect: 'bg-amber-400 text-amber-900',
};

export default function AnswerOption({
  option,
  text,
  selected = false,
  correct,
  wrong,
  disabled = false,
  onClick,
  className = '',
}: AnswerOptionProps) {
  let state: VisualState = 'default';
  if (correct) state = 'correct';
  else if (wrong) state = 'incorrect';
  else if (selected) state = 'selected';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex w-full items-center gap-3 min-h-[48px] p-3 md:p-4
        rounded-xl border-2 text-left
        transition-all duration-200
        ${stateClasses[state]}
        ${disabled && state === 'default' ? 'opacity-60 cursor-not-allowed' : ''}
        ${!disabled ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
        ${className}
      `}
    >
      <span
        className={`
          flex-shrink-0 flex items-center justify-center
          w-9 h-9 rounded-lg font-bold text-base
          transition-colors duration-200
          ${letterBgClasses[state]}
        `}
      >
        {option}
      </span>
      <span className="text-lg md:text-xl font-medium leading-snug">
        {text}
      </span>
    </button>
  );
}
