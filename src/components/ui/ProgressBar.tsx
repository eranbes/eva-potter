'use client';

import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export default function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-amber-200">
          {current}/{total}
        </span>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-700/60 border border-amber-900/30">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-400"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
        {/* Golden snitch indicator */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 border-2 border-yellow-200 shadow-lg shadow-yellow-400/50"
          initial={{ left: 0 }}
          animate={{ left: `calc(${Math.min(percentage, 100)}% - 12px)` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ left: 0 }}
        />
      </div>
    </div>
  );
}
