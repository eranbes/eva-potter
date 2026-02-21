'use client';

import { useTranslation } from '@/components/providers/LanguageProvider';

interface LanguageToggleProps {
  className?: string;
}

export default function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { language, setLanguage } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
        text-sm font-bold tracking-wide
        bg-yellow-500/20 hover:bg-yellow-500/30
        border border-yellow-500/30 hover:border-yellow-400/50
        text-yellow-400 hover:text-yellow-300
        transition-all duration-200
        ${className}
      `}
      aria-label={language === 'en' ? 'Switch to French' : 'Passer en anglais'}
    >
      <span className={language === 'en' ? 'opacity-100' : 'opacity-50'}>EN</span>
      <span className="text-yellow-500/50">/</span>
      <span className={language === 'fr' ? 'opacity-100' : 'opacity-50'}>FR</span>
    </button>
  );
}
