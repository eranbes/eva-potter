'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import SparkleEffect from '@/components/ui/SparkleEffect';
import ParchmentCard from '@/components/ui/ParchmentCard';

interface ResultsSummaryProps {
  correctCount: number;
  totalQuestions: number;
  pointsEarned: number;
  message: string;
  className?: string;
}

export default function ResultsSummary({
  correctCount,
  totalQuestions,
  pointsEarned,
  message,
  className = '',
}: ResultsSummaryProps) {
  const [displayPoints, setDisplayPoints] = useState(0);

  useEffect(() => {
    if (pointsEarned <= 0) return;

    const duration = 1500;
    const steps = 30;
    const increment = pointsEarned / steps;
    const interval = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= pointsEarned) {
        setDisplayPoints(pointsEarned);
        clearInterval(timer);
      } else {
        setDisplayPoints(Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [pointsEarned]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <ParchmentCard className="relative overflow-hidden">
        <SparkleEffect trigger={correctCount >= 7} count={15} />

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
            className="mb-4"
          >
            <span className="text-5xl md:text-6xl font-extrabold text-amber-800">
              {correctCount}
            </span>
            <span className="text-2xl md:text-3xl font-bold text-amber-600">
              /{totalQuestions}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-2 mb-4 bg-yellow-100 rounded-full px-5 py-2"
          >
            <svg className="w-6 h-6 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="text-xl font-bold text-amber-800">
              +{displayPoints} points
            </span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-lg md:text-xl text-amber-800 font-medium leading-relaxed max-w-md"
          >
            {message}
          </motion.p>
        </div>
      </ParchmentCard>
    </motion.div>
  );
}
