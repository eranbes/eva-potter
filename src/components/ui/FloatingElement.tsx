'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface FloatingElementProps {
  children: ReactNode;
  amplitude?: number;
  speed?: number;
  delay?: number;
  duration?: number;
  className?: string;
}

export default function FloatingElement({
  children,
  amplitude = 10,
  speed,
  delay = 0,
  duration,
  className = '',
}: FloatingElementProps) {
  const dur = duration ?? speed ?? 3;
  return (
    <motion.div
      className={className}
      animate={{
        y: [-amplitude, amplitude, -amplitude],
      }}
      transition={{
        duration: dur,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
