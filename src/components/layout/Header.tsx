'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import LanguageToggle from '@/components/ui/LanguageToggle';
import HouseBadge from '@/components/ui/HouseBadge';

interface HeaderProps {
  className?: string;
}

const navItems = [
  {
    href: '/books',
    titleKey: 'Books',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 4H3a1 1 0 00-1 1v14a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1zM4 18V6h7v12H4zm9 0V6h7v12h-7z" />
      </svg>
    ),
  },
  {
    href: '/wordle',
    titleKey: 'Wordle',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <rect x="2" y="2" width="9" height="9" rx="1" />
        <rect x="13" y="2" width="9" height="9" rx="1" />
        <rect x="2" y="13" width="9" height="9" rx="1" />
        <rect x="13" y="13" width="9" height="9" rx="1" />
      </svg>
    ),
  },
  {
    href: '/daily',
    titleKey: 'Daily',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
      </svg>
    ),
  },
  {
    href: '/potions',
    titleKey: 'Potions',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C12 2 8 6 8 10C8 12 9 14 9 14L7 20C7 21 8 22 9 22H15C16 22 17 21 17 20L15 14C15 14 16 12 16 10C16 6 12 2 12 2Z" />
      </svg>
    ),
  },
  {
    href: '/duel',
    titleKey: 'Duel',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M7 2L12 9L7 16H5L10 9L5 2H7ZM13 2L18 9L13 16H11L16 9L11 2H13Z" />
      </svg>
    ),
  },
  {
    href: '/leaderboard',
    titleKey: 'Leaderboard',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    ),
  },
  {
    href: '/achievements',
    titleKey: 'Achievements',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L15 8.5L22 9.5L17 14L18.5 21L12 17.5L5.5 21L7 14L2 9.5L9 8.5L12 2Z" />
        <circle cx="12" cy="13" r="3" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
];

export default function Header({ className = '' }: HeaderProps) {
  const { user, loading } = useUser();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

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
      {/* Top bar */}
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <span className="text-xl md:text-2xl font-extrabold tracking-wide text-yellow-400 group-hover:text-yellow-300 transition-colors">
            {t('header.title')}
          </span>
        </Link>

        {!loading && user && (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* User info — always visible */}
            <span className="text-sm font-medium text-purple-200 hidden sm:inline">
              {user.firstName}
            </span>
            {user.house && <HouseBadge house={user.house} size="sm" />}
            <div className="flex items-center gap-1.5 bg-yellow-500/20 rounded-full px-2.5 py-1">
              <svg
                className="w-3.5 h-3.5 text-yellow-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
              <span className="text-sm font-bold text-yellow-400">
                {user.totalPoints}
              </span>
            </div>

            {/* Desktop nav icons */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500/10 hover:bg-yellow-500/25 text-yellow-400 transition-colors"
                  title={item.titleKey}
                >
                  {item.icon}
                </Link>
              ))}
            </nav>

            <LanguageToggle className="hidden sm:inline-flex" />

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/25 text-yellow-400 transition-colors"
              aria-label="Menu"
            >
              {menuOpen ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {!loading && user && menuOpen && (
        <div className="md:hidden border-t border-yellow-600/20 bg-indigo-950/95 backdrop-blur-sm">
          <nav className="mx-auto max-w-4xl px-4 py-3 grid grid-cols-4 gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl bg-yellow-500/5 hover:bg-yellow-500/15 text-yellow-400 transition-colors"
              >
                {item.icon}
                <span className="text-[10px] font-medium text-yellow-300/70 leading-none">
                  {item.titleKey}
                </span>
              </Link>
            ))}
            {/* Language toggle in the grid on mobile */}
            <div className="flex flex-col items-center justify-center py-2.5 px-1 rounded-xl bg-yellow-500/5">
              <LanguageToggle className="sm:hidden !px-2 !py-1 !text-xs" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
