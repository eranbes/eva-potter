'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface SparkleEffectProps {
  trigger?: boolean;
  count?: number;
  className?: string;
}

export default function SparkleEffect({
  trigger = true,
  count = 12,
  className = '',
}: SparkleEffectProps) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const generateSparkles = useCallback(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.6,
    }));
  }, [count]);

  useEffect(() => {
    if (trigger) {
      setSparkles(generateSparkles());
      const timer = setTimeout(() => setSparkles([]), 2000);
      return () => clearTimeout(timer);
    } else {
      setSparkles([]);
    }
  }, [trigger, generateSparkles]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: sparkle.size,
              height: sparkle.size,
            }}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0],
              rotate: [0, 180],
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 1.2,
              delay: sparkle.delay,
              ease: 'easeInOut',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-full h-full text-yellow-300 drop-shadow-[0_0_4px_rgba(250,204,21,0.8)]"
            >
              <path
                d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z"
                fill="currentColor"
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
