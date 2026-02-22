'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/providers/LanguageProvider';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MaintenanceProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [maintenanceAt, setMaintenanceAt] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for maintenance status every 10 seconds
  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const res = await fetch('/api/admin/maintenance');
        if (!res.ok) return;
        const data = await res.json();

        if (!active) return;

        if (data.active && data.maintenanceAt) {
          setMaintenanceAt(data.maintenanceAt);
        } else {
          setMaintenanceAt(null);
          setSecondsLeft(null);
        }
      } catch {
        // Silently fail — next poll will retry
      }
    };

    poll();
    const pollInterval = setInterval(poll, 10000);
    return () => {
      active = false;
      clearInterval(pollInterval);
    };
  }, []);

  // Countdown timer — ticks every second when maintenance is active
  useEffect(() => {
    if (!maintenanceAt) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const tick = () => {
      const diff = Math.floor((new Date(maintenanceAt).getTime() - Date.now()) / 1000);
      setSecondsLeft(diff);
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [maintenanceAt]);

  const showBanner = secondsLeft !== null && secondsLeft > 0;
  const showTakeover = secondsLeft !== null && secondsLeft <= 0;

  return (
    <>
      {children}

      <AnimatePresence>
        {showBanner && (
          <motion.div
            key="maintenance-banner"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-[9998] pointer-events-none"
          >
            <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-4 py-3 text-center shadow-lg shadow-amber-500/20">
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="text-amber-950 font-bold font-[family-name:var(--font-cinzel)] text-sm md:text-base">
                  {t('maintenance.banner')}
                </span>
                <span className="bg-amber-900/80 text-amber-100 px-3 py-1 rounded-full font-mono text-sm font-bold tabular-nums min-w-[4rem] text-center">
                  {formatTime(secondsLeft!)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTakeover && (
          <motion.div
            key="maintenance-takeover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm"
          >
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-amber-400/60"
                  initial={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    scale: Math.random() * 0.5 + 0.5,
                  }}
                  animate={{
                    y: [null, `${Math.random() * -30 - 10}vh`],
                    opacity: [0.2, 0.8, 0.2],
                  }}
                  transition={{
                    duration: Math.random() * 4 + 3,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>

            <div className="text-center px-6 relative">
              {/* Spinning star */}
              <motion.div
                className="text-5xl mb-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                &#10022;
              </motion.div>

              <motion.h1
                className="text-2xl md:text-4xl font-bold font-[family-name:var(--font-cinzel)] text-amber-400 mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {t('maintenance.takeover')}
              </motion.h1>

              <motion.p
                className="text-amber-200/80 text-lg font-[family-name:var(--font-lora)]"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {t('maintenance.backSoon')}
              </motion.p>

              {/* Pulsing dots */}
              <motion.div
                className="flex gap-2 justify-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-amber-400"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
