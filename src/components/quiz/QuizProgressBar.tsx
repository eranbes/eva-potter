'use client';

import ProgressBar from '@/components/ui/ProgressBar';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface QuizProgressBarProps {
  current: number;
  total: number;
  pointsEarned?: number;
  className?: string;
}

export default function QuizProgressBar({
  current,
  total,
  pointsEarned,
  className = '',
}: QuizProgressBarProps) {
  const { t } = useTranslation();

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-amber-200">
          {t('progressBar.questionOf', { current, total })}
        </span>
        {pointsEarned !== undefined && (
          <span className="text-sm font-bold text-yellow-400 flex items-center gap-1">
            <svg
              className="w-4 h-4 text-yellow-400"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
            {t('progressBar.pts', { points: pointsEarned })}
          </span>
        )}
      </div>
      <ProgressBar current={current} total={total} />
    </div>
  );
}
