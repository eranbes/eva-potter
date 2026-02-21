'use client';

import { motion } from 'framer-motion';

interface StarRatingProps {
  rating?: number;
  score?: number;
  total?: number;
  className?: string;
}

function getStars(score: number, total: number): number {
  const ratio = score / total;
  if (ratio >= 0.7) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}

function Star({ filled, index }: { filled: boolean; index: number }) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={`w-10 h-10 ${filled ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' : 'text-slate-600'}`}
      fill="currentColor"
      initial={{ opacity: 0, scale: 0, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        delay: index * 0.3,
        duration: 0.5,
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </motion.svg>
  );
}

export default function StarRating({ rating, score, total = 10, className = '' }: StarRatingProps) {
  // If rating is provided directly, use it; otherwise compute from score/total
  const starCount = rating ?? (score !== undefined ? getStars(score, total) : 1);
  // Clamp to max 5
  const maxStars = Math.min(starCount, 5);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {Array.from({ length: Math.max(maxStars, 3) }, (_, i) => (
        <Star key={i} filled={i < maxStars} index={i} />
      ))}
    </div>
  );
}
