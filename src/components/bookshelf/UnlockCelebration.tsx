'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import SparkleEffect from '@/components/ui/SparkleEffect';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface UnlockCelebrationProps {
  books: Array<{ bookId: number; title: string }>;
  onClose: () => void;
}

export default function UnlockCelebration({
  books,
  onClose,
}: UnlockCelebrationProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bookTitle = books.map(b => b.title).join(', ');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 1.5, 1], opacity: [0, 0.8, 0] }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500"
        />

        <SparkleEffect trigger={true} count={20} />

        <motion.div
          initial={{ scale: 0.3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200 }}
          className="relative z-10 flex flex-col items-center text-center px-8"
        >
          <motion.div
            initial={{ rotate: -15, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 300 }}
            className="mb-4"
          >
            <svg
              className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_16px_rgba(250,204,21,0.6)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </motion.div>

          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl md:text-3xl font-bold text-yellow-300 mb-2 drop-shadow-lg"
          >
            {t('unlock.bookUnlocked')}
          </motion.h2>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xl md:text-2xl font-semibold text-white drop-shadow-md"
          >
            {bookTitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1.2 }}
            className="text-sm text-slate-300 mt-4"
          >
            {t('unlock.tapToContinue')}
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
