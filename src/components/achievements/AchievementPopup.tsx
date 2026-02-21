'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/components/providers/LanguageProvider';
import type { AchievementDef } from '@/lib/achievements/definitions';

interface AchievementPopupProps {
  achievements: AchievementDef[];
  onDismiss: () => void;
}

export default function AchievementPopup({ achievements, onDismiss }: AchievementPopupProps) {
  const { language } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (achievements.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4, delay: index * 0.15 }}
            onClick={onDismiss}
            className="cursor-pointer flex items-center gap-3 bg-gradient-to-r from-amber-900/95 to-amber-800/95 border border-amber-400/40 rounded-xl px-5 py-3 shadow-2xl shadow-amber-500/20 backdrop-blur-sm"
          >
            <span className="text-3xl">{achievement.icon}</span>
            <div>
              <p className="text-amber-300 text-xs font-bold uppercase tracking-wider">
                Achievement Unlocked!
              </p>
              <p className="text-amber-100 font-bold text-sm">
                {language === 'fr' ? achievement.nameFr : achievement.nameEn}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
