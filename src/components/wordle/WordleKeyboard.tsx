'use client';

type KeyState = 'correct' | 'present' | 'absent' | 'unused';

interface WordleKeyboardProps {
  keyStates: Record<string, KeyState>;
  onKey: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

const keyStateClasses: Record<KeyState, string> = {
  unused: 'bg-slate-500 hover:bg-slate-400 text-white',
  correct: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  present: 'bg-yellow-600 hover:bg-yellow-500 text-white',
  absent: 'bg-gray-700 hover:bg-gray-600 text-gray-300',
};

export default function WordleKeyboard({
  keyStates,
  onKey,
  onEnter,
  onBackspace,
}: WordleKeyboardProps) {
  const handleClick = (key: string) => {
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'BACKSPACE') {
      onBackspace();
    } else {
      onKey(key);
    }
  };

  const getKeyState = (key: string): KeyState => {
    return keyStates[key] ?? 'unused';
  };

  return (
    <div className="flex flex-col items-center gap-1.5">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 md:gap-1.5">
          {row.map((key) => {
            const isSpecial = key === 'ENTER' || key === 'BACKSPACE';
            const state = isSpecial ? 'unused' : getKeyState(key);

            return (
              <button
                key={key}
                onClick={() => handleClick(key)}
                className={`
                  flex items-center justify-center
                  rounded-md font-bold uppercase select-none
                  transition-colors duration-150 cursor-pointer
                  active:scale-95
                  ${
                    isSpecial
                      ? 'w-[52px] md:w-[66px] h-[48px] md:h-[58px] text-xs md:text-sm bg-slate-500 hover:bg-slate-400 text-white'
                      : `w-[32px] md:w-[40px] lg:w-[44px] h-[48px] md:h-[58px] text-sm md:text-base ${keyStateClasses[state]}`
                  }
                `}
              >
                {key === 'BACKSPACE' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 md:w-6 md:h-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2.515 10.674a1.875 1.875 0 000 2.652L8.89 19.7c.352.352.829.55 1.326.55H19.5a3 3 0 003-3V6.75a3 3 0 00-3-3h-9.284c-.497 0-.974.198-1.326.55l-6.375 6.374zM12.53 9.22a.75.75 0 10-1.06 1.06L13.19 12l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L15.31 12l1.72-1.72a.75.75 0 10-1.06-1.06l-1.72 1.72-1.72-1.72z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : key === 'ENTER' ? (
                  'Enter'
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
