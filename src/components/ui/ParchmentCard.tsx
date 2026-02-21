'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ParchmentCardProps {
  children: ReactNode;
  hoverable?: boolean;
  className?: string;
}

export default function ParchmentCard({
  children,
  hoverable = false,
  className = '',
}: ParchmentCardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.15)' } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50
        border border-amber-200/60
        rounded-2xl p-4 md:p-6 shadow-md
        ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
