'use client';

import { useTranslation } from '@/components/providers/LanguageProvider';

interface WordleHintProps {
  category: string;
  wordLength: number;
}

export default function WordleHint({ category, wordLength }: WordleHintProps) {
  const { t } = useTranslation();

  const translatedCategory = t('wordle.category.' + category);
  const hintText = t('wordle.hint', { category: translatedCategory, length: wordLength });

  return (
    <div className="flex justify-center mb-4">
      <span
        className="
          inline-flex items-center gap-2
          px-5 py-2 rounded-full
          bg-indigo-900/60 border border-indigo-500/30
          text-gold-light text-sm md:text-base font-semibold
          text-glow-gold
        "
        style={{ color: 'var(--color-gold-light)' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 md:w-5 md:h-5 opacity-80"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
            clipRule="evenodd"
          />
        </svg>
        {hintText}
      </span>
    </div>
  );
}
