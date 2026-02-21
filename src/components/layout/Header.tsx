'use client';

import Link from 'next/link';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import LanguageToggle from '@/components/ui/LanguageToggle';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  const { user, loading } = useUser();
  const { t } = useTranslation();

  return (
    <header
      className={`
        sticky top-0 z-40 w-full
        bg-gradient-to-r from-indigo-950 via-purple-950 to-indigo-950
        border-b border-yellow-600/30
        shadow-lg shadow-black/20
        ${className}
      `}
    >
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-xl md:text-2xl font-extrabold tracking-wide text-yellow-400 group-hover:text-yellow-300 transition-colors">
            {t('header.title')}
          </span>
        </Link>

        {!loading && user && (
          <div className="flex items-center gap-3">
            <span className="text-sm md:text-base font-medium text-purple-200">
              {user.firstName}
            </span>
            <div className="flex items-center gap-1.5 bg-yellow-500/20 rounded-full px-3 py-1">
              <svg
                className="w-4 h-4 text-yellow-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span className="text-sm font-bold text-yellow-400">
                {user.totalPoints}
              </span>
            </div>
            <LanguageToggle />
            <Link
              href="/wordle"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/10 hover:bg-yellow-500/25 transition-colors"
              title="Wordle"
            >
              <svg
                className="w-4 h-4 text-yellow-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="2" y="2" width="9" height="9" rx="1" />
                <rect x="13" y="2" width="9" height="9" rx="1" />
                <rect x="2" y="13" width="9" height="9" rx="1" />
                <rect x="13" y="13" width="9" height="9" rx="1" />
              </svg>
            </Link>
            <Link
              href="/leaderboard"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/10 hover:bg-yellow-500/25 transition-colors"
              title="Leaderboard"
            >
              <svg
                className="w-4 h-4 text-yellow-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
