'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/providers/LanguageProvider';
import type { DragonDef } from '@/lib/dragons/definitions';

type Phase = 'idle' | 'cracking' | 'hatching' | 'reveal' | 'done';

interface DragonEggHatchProps {
  dragon: DragonDef;
  onClose: () => void;
}

const rarityGradients: Record<string, string> = {
  common: 'linear-gradient(to right, #22c55e, #86efac, #22c55e)',
  rare: 'linear-gradient(to right, #3b82f6, #93c5fd, #3b82f6)',
  legendary: 'linear-gradient(to right, #f59e0b, #fde68a, #f59e0b)',
};

export default function DragonEggHatch({ dragon, onClose }: DragonEggHatchProps) {
  const { t, language } = useTranslation();
  const [phase, setPhase] = useState<Phase>('idle');

  const dragonName = language === 'fr' ? dragon.nameFr : dragon.nameEn;
  const rarityLabel = t(`dragons.rarity.${dragon.rarity}`);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('cracking'), 500),
      setTimeout(() => setPhase('hatching'), 2500),
      setTimeout(() => setPhase('reveal'), 4000),
      setTimeout(() => setPhase('done'), 5500),
    ];
    return () => timers.forEach(clearTimeout);
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

        {/* Ambient particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 25 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 6 + 3,
                height: Math.random() * 6 + 3,
                background: `radial-gradient(circle, ${dragon.glowColor}, transparent)`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 80 - 40, Math.random() * 60 - 30],
                y: [0, Math.random() * -60 - 20, Math.random() * -100 - 30],
                opacity: phase === 'hatching' || phase === 'reveal'
                  ? [0, 0.9, 0.5]
                  : phase === 'idle' || phase === 'cracking'
                  ? [0, 0.4, 0.2]
                  : [0.3, 0],
                scale: phase === 'hatching' ? [0.5, 2, 1.5] : [0, 1, 0.8],
              }}
              transition={{
                duration: Math.random() * 2 + 1.5,
                delay: Math.random() * 1,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>

        {/* Central glow */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 250,
            height: 250,
            background: `radial-gradient(circle, ${dragon.glowColor}, transparent 70%)`,
          }}
          animate={{
            scale: phase === 'idle' ? [0.3, 0.6] :
                   phase === 'cracking' ? [0.6, 1, 0.8] :
                   phase === 'hatching' ? [0.8, 2.5, 1.5] :
                   1.5,
            opacity: phase === 'idle' ? 0.3 :
                     phase === 'cracking' ? [0.3, 0.6, 0.4] :
                     phase === 'hatching' ? [0.4, 1, 0.5] :
                     0.3,
          }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Egg (visible during idle + cracking) */}
          {(phase === 'idle' || phase === 'cracking') && (
            <motion.div
              className="text-8xl sm:text-9xl select-none"
              animate={
                phase === 'idle'
                  ? { rotate: [-3, 3, -3], scale: [1, 1.02, 1] }
                  : { rotate: [-8, 8, -6, 6, -4, 4, 0], scale: [1, 1.05, 0.98, 1.03, 1] }
              }
              transition={
                phase === 'idle'
                  ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                  : { duration: 0.4, repeat: Infinity, ease: 'easeInOut' }
              }
              style={{
                filter: phase === 'cracking'
                  ? `drop-shadow(0 0 20px ${dragon.glowColor})`
                  : `drop-shadow(0 0 10px rgba(245,158,11,0.4))`,
              }}
            >
              🥚
            </motion.div>
          )}

          {/* Flash during hatching */}
          {phase === 'hatching' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            >
              <div
                className="w-64 h-64 rounded-full"
                style={{
                  background: `radial-gradient(circle, white, ${dragon.color}, transparent)`,
                }}
              />
            </motion.div>
          )}

          {/* Dragon reveal */}
          {(phase === 'reveal' || phase === 'done') && (
            <>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 200,
                  damping: 15,
                  delay: 0.1,
                }}
                className="text-8xl sm:text-9xl"
                style={{
                  filter: `drop-shadow(0 0 30px ${dragon.glowColor})`,
                }}
              >
                {dragon.emoji}
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="font-[family-name:var(--font-cinzel)] text-2xl sm:text-3xl font-bold text-center"
                style={{
                  background: rarityGradients[dragon.rarity],
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {dragonName}
              </motion.h2>

              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="px-3 py-1 rounded-full text-sm font-bold"
                style={{
                  background: `${dragon.color}33`,
                  color: dragon.color,
                  border: `1px solid ${dragon.color}66`,
                }}
              >
                {rarityLabel}
              </motion.span>
            </>
          )}

          {/* Tap to continue */}
          {phase === 'done' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 text-sm mt-4"
            >
              {t('dragons.tapToContinue')}
            </motion.p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
