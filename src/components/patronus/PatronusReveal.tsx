'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/providers/LanguageProvider';
import type { PatronusAnimal } from '@/lib/patronus/animals';

interface PatronusRevealProps {
  animal: PatronusAnimal;
  onClose: () => void;
}

export default function PatronusReveal({ animal, onClose }: PatronusRevealProps) {
  const { t, language } = useTranslation();
  const [phase, setPhase] = useState<'mist' | 'reveal' | 'done'>('mist');

  const animalName = language === 'fr' ? animal.nameFr : animal.nameEn;

  useEffect(() => {
    const mistTimer = setTimeout(() => setPhase('reveal'), 2000);
    const doneTimer = setTimeout(() => setPhase('done'), 3500);
    return () => {
      clearTimeout(mistTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={phase === 'done' ? onClose : undefined}
      >
        {/* Dark overlay */}
        <motion.div
          className="absolute inset-0 bg-slate-950/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Silvery mist particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 8 + 4,
                height: Math.random() * 8 + 4,
                background: `radial-gradient(circle, rgba(192,216,255,${Math.random() * 0.6 + 0.2}), transparent)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50, Math.random() * 60 - 30],
                y: [0, Math.random() * -80 - 20, Math.random() * -120 - 40],
                opacity: phase === 'mist' ? [0, 0.8, 0.4] : [0.4, 0],
                scale: phase === 'mist' ? [0, 1.5, 1] : [1, 0],
              }}
              transition={{
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 1.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Central glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(192,216,255,0.3), transparent 70%)',
          }}
          animate={{
            scale: phase === 'mist' ? [0.5, 1.5, 1] : phase === 'reveal' ? [1, 2, 1.5] : 1.5,
            opacity: phase === 'mist' ? [0, 0.6, 0.3] : phase === 'reveal' ? [0.3, 0.8, 0.4] : 0.2,
          }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />

        {/* Animal reveal */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          <AnimatePresence>
            {(phase === 'reveal' || phase === 'done') && (
              <>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                  }}
                  className="text-8xl sm:text-9xl drop-shadow-[0_0_30px_rgba(192,216,255,0.6)]"
                >
                  {animal.emoji}
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-bold text-center"
                  style={{
                    background: 'linear-gradient(to right, #c0d8ff, #e8f0ff, #c0d8ff)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {t('patronus.isA', { animal: animalName })}
                </motion.h2>
              </>
            )}
          </AnimatePresence>

          {phase === 'done' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-sm mt-4"
            >
              {t('unlock.tapToContinue')}
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
