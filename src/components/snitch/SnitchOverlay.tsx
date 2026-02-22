'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface SnitchOverlayProps {
  eventId: number;
  expiresAt: string;
  rewardPoints: number;
  onClaim: (eventId: number) => Promise<ClaimResult>;
  onDismiss: () => void;
}

interface ClaimResult {
  success: boolean;
  pointsAwarded?: number;
  expired?: boolean;
  winner?: { name: string; points: number };
}

export default function SnitchOverlay({
  eventId,
  expiresAt,
  rewardPoints,
  onClaim,
  onDismiss,
}: SnitchOverlayProps) {
  const { t } = useTranslation();
  const claimingRef = useRef(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [snitchPos, setSnitchPos] = useState({ x: 50, y: 50 });

  // Countdown timer
  useEffect(() => {
    const update = () => {
      const remaining = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0 && !result) {
        setResult({ success: false, expired: true });
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, result]);

  // Move snitch around randomly
  useEffect(() => {
    const move = () => {
      setSnitchPos({
        x: 15 + Math.random() * 70,
        y: 15 + Math.random() * 60,
      });
    };
    move();
    const interval = setInterval(move, 500);
    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss after showing result
  useEffect(() => {
    if (result) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [result, onDismiss]);

  const handleCatch = useCallback(async () => {
    if (claimingRef.current || result) return;
    claimingRef.current = true;

    try {
      const claimResult = await onClaim(eventId);
      setResult(claimResult);
    } catch {
      claimingRef.current = false;
    }
  }, [eventId, onClaim, result]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
      >
        {/* Pulsing golden background */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-900/90 via-amber-900/90 to-yellow-800/90" />

        {/* Sparkle particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full"
              initial={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                opacity: 0,
              }}
              animate={{
                y: [null, `${Math.random() * 100}vh`],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {!result ? (
          /* Active snitch phase */
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Title */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="absolute top-12 text-center z-10"
            >
              <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-yellow-300 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]">
                {t('snitch.title')}
              </h1>
              <p className="text-lg md:text-xl text-yellow-200/90 mt-2 font-lora">
                {t('snitch.tapToCatch')}
              </p>
            </motion.div>

            {/* Timer */}
            <div className="absolute top-32 md:top-36 z-10">
              <span className="text-2xl font-bold text-yellow-100 font-mono bg-black/30 px-4 py-1 rounded-full">
                {timeLeft}s
              </span>
            </div>

            {/* Reward display */}
            <div className="absolute bottom-16 z-10">
              <span className="text-xl text-yellow-200 font-cinzel bg-black/30 px-6 py-2 rounded-full">
                {t('snitch.reward', { points: String(rewardPoints) })}
              </span>
            </div>

            {/* Flying snitch */}
            <motion.div
              className="absolute z-20 cursor-pointer"
              animate={{
                left: `${snitchPos.x}%`,
                top: `${snitchPos.y}%`,
              }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              style={{ transform: 'translate(-50%, -50%)' }}
              onClick={handleCatch}
            >
              <div className="relative">
                {/* Wings */}
                <motion.div
                  className="absolute -left-7 top-1/2 -translate-y-1/2 text-2xl md:text-3xl origin-right"
                  animate={{ rotate: [-20, 20, -20] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  <span className="text-yellow-200/80 drop-shadow-lg">&#10048;</span>
                </motion.div>
                <motion.div
                  className="absolute -right-7 top-1/2 -translate-y-1/2 text-2xl md:text-3xl origin-left"
                  animate={{ rotate: [20, -20, 20] }}
                  transition={{ duration: 0.3, repeat: Infinity }}
                >
                  <span className="text-yellow-200/80 drop-shadow-lg">&#10048;</span>
                </motion.div>

                {/* Snitch ball */}
                <motion.div
                  className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.8),0_0_60px_rgba(234,179,8,0.4)]"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </div>
        ) : (
          /* Result phase */
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 text-center p-8"
          >
            {result.success ? (
              <>
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1 }}
                  className="text-7xl mb-4"
                >
                  &#9885;
                </motion.div>
                <h2 className="text-4xl font-cinzel font-bold text-yellow-300 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] mb-4">
                  {t('snitch.caught')}
                </h2>
                <p className="text-2xl text-yellow-100 font-lora">
                  +{result.pointsAwarded} {t('snitch.points')}
                </p>
              </>
            ) : result.expired ? (
              <>
                <div className="text-7xl mb-4 opacity-50">&#9885;</div>
                <h2 className="text-3xl font-cinzel font-bold text-yellow-300/60 mb-4">
                  {t('snitch.escaped')}
                </h2>
              </>
            ) : (
              <>
                <div className="text-7xl mb-4">&#9885;</div>
                <h2 className="text-3xl font-cinzel font-bold text-yellow-300 mb-2">
                  {t('snitch.tooLate')}
                </h2>
                <p className="text-xl text-yellow-200 font-lora">
                  {t('snitch.caughtBy', { name: result.winner?.name || '???' })}
                </p>
                <p className="text-lg text-yellow-200/70 font-lora mt-1">
                  +{result.winner?.points} {t('snitch.points')}
                </p>
              </>
            )}

            <p className="text-yellow-200/50 mt-6 text-sm">{t('snitch.dismissing')}</p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
