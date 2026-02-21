'use client';

import { motion } from 'framer-motion';
import SparkleEffect from '@/components/ui/SparkleEffect';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface AnswerFeedbackProps {
  correct: boolean;
  explanation: string;
  pointsAwarded?: number;
  correctAnswer?: string;
  playerName?: string;
  className?: string;
}

export default function AnswerFeedback({
  correct,
  explanation,
  pointsAwarded = 0,
  className = '',
}: AnswerFeedbackProps) {
  const { t } = useTranslation();
  const message = t(correct ? 'feedback.correctMessages' : 'feedback.incorrectMessages');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`relative rounded-2xl p-5 md:p-6 ${
        correct
          ? 'bg-emerald-50 border-2 border-emerald-300'
          : 'bg-amber-50 border-2 border-amber-300'
      } ${className}`}
    >
      <SparkleEffect trigger={correct} count={10} />

      <div className="relative z-10">
        <p
          className={`text-xl md:text-2xl font-bold mb-3 ${
            correct ? 'text-emerald-800' : 'text-amber-800'
          }`}
        >
          {message}
        </p>

        {correct && pointsAwarded > 0 && (
          <p className="text-emerald-700 font-semibold mb-2">
            {t('feedback.points', { points: pointsAwarded })}
          </p>
        )}

        {explanation && (
          <div className={`rounded-xl p-4 ${
            correct ? 'bg-emerald-100/60' : 'bg-amber-100/60'
          }`}>
            <p className="text-base md:text-lg text-slate-800 leading-relaxed">
              <span className="font-semibold">{t('feedback.didYouKnow')}</span> {explanation}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
