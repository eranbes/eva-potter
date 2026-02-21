'use client';

import { useMemo } from 'react';
import FloatingElement from '@/components/ui/FloatingElement';

interface MagicalBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

interface StarConfig {
  id: number;
  left: string;
  top: string;
  size: number;
  amplitude: number;
  speed: number;
  opacity: number;
}

export default function MagicalBackground({ children, className = '' }: MagicalBackgroundProps) {
  // Generate star positions once on mount (stable across re-renders)
  const stars: StarConfig[] = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: `${(i * 37 + 13) % 100}%`,
        top: `${(i * 53 + 7) % 100}%`,
        size: (i % 3) + 1,
        amplitude: (i % 4) + 4,
        speed: (i % 3) + 3,
        opacity: 0.2 + ((i % 5) * 0.1),
      })),
    []
  );

  return (
    <>
      {/* Background layer — fixed behind everything */}
      <div
        className={`
          fixed inset-0 -z-10 overflow-hidden pointer-events-none
          bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950
          ${className}
        `}
      >
        {/* Subtle radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-indigo-800/10 rounded-full blur-3xl" />

        {/* Floating stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute"
            style={{
              left: star.left,
              top: star.top,
              opacity: star.opacity,
            }}
          >
            <FloatingElement
              amplitude={star.amplitude}
              speed={star.speed}
            >
              <svg
                width={star.size * 6}
                height={star.size * 6}
                viewBox="0 0 24 24"
                fill="none"
                className="text-yellow-300"
              >
                <path
                  d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z"
                  fill="currentColor"
                />
              </svg>
            </FloatingElement>
          </div>
        ))}
      </div>
      {/* Page content — in normal document flow */}
      {children}
    </>
  );
}
