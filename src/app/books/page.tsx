'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import BookshelfGrid from '@/components/bookshelf/BookshelfGrid';

interface BookProgress {
  questionsAnswered: number;
  questionsCorrect: number;
  pointsEarned: number;
  completed: boolean;
}

interface Book {
  id: number;
  title: string;
  slug: string;
  description: string;
  coverImage: string;
  sortOrder: number;
  pointsToUnlock: number;
  unlocked: boolean;
  progress: {
    easy: BookProgress | null;
    normal: BookProgress | null;
    hard: BookProgress | null;
  };
}

export default function BooksPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { t, language } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/');
    }
    // Redirect unsorted users to the Sorting Ceremony
    if (!userLoading && user && !user.house) {
      router.replace('/sorting');
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!user) return;

    setLoadingBooks(true);
    setError('');

    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data.books);
      } catch {
        setError(t('books.error'));
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, [user, language]);

  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl text-amber-400"
        >
          &#9733;
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 sm:px-6 pb-12 max-w-5xl mx-auto w-full">
        {/* Welcome greeting */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mt-6 mb-8"
        >
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl font-bold text-amber-100 mb-2">
            {t('books.welcomeBack', { name: user.firstName })}
          </h1>
          <p className="text-xl text-amber-300">
            <span className="inline-block mr-1">&#9889;</span>
            {t('books.points', { count: user.totalPoints })}
          </p>
        </motion.div>

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="font-[family-name:var(--font-cinzel)] text-xl text-amber-200/70 text-center">
            {t('books.chooseBook')}
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mx-auto mt-2" />
        </motion.div>

        {/* Loading state */}
        {loadingBooks && (
          <div className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-5xl text-amber-400 mb-4"
            >
              &#9733;
            </motion.div>
            <p className="text-amber-200/60 text-lg">{t('books.loading')}</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-amber-400 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-amber-300 underline hover:text-amber-200 transition-colors"
            >
              {t('books.tryAgain')}
            </button>
          </motion.div>
        )}

        {/* Bookshelf */}
        {!loadingBooks && !error && (
          <BookshelfGrid books={books} />
        )}
      </main>
    </div>
  );
}
