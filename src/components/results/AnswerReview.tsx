'use client';

import { motion } from 'framer-motion';
import ParchmentCard from '@/components/ui/ParchmentCard';
import { useTranslation } from '@/components/providers/LanguageProvider';

interface QuizAnswer {
  questionId: number;
  questionText: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  explanation: string;
  pointsAwarded: number;
  options: { A: string; B: string; C: string; D: string };
}

interface AnswerReviewProps {
  answers: QuizAnswer[];
  className?: string;
}

export default function AnswerReview({ answers, className = '' }: AnswerReviewProps) {
  const { t } = useTranslation();

  return (
    <div className={`space-y-4 ${className}`}>
      {answers.map((answer, index) => (
        <motion.div
          key={answer.questionId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08 }}
        >
          <ParchmentCard className="relative">
            <div className="flex items-start gap-3">
              <span
                className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                  answer.isCorrect
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {answer.isCorrect ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-600 mb-1">
                  {t('review.question', { number: index + 1 })}
                </p>
                <p className="text-base md:text-lg font-medium text-amber-950 mb-2">
                  {answer.questionText}
                </p>

                <div
                  className={`rounded-lg p-2 px-3 mb-1 text-base ${
                    answer.isCorrect
                      ? 'bg-emerald-100/70 text-emerald-800'
                      : 'bg-amber-100/70 text-amber-800'
                  }`}
                >
                  <span className="font-semibold">{t('review.yourAnswer')}</span>{' '}
                  {answer.options[answer.selectedOption as keyof typeof answer.options]}
                </div>

                {!answer.isCorrect && (
                  <div className="rounded-lg p-2 px-3 mb-1 text-base bg-emerald-100/70 text-emerald-800">
                    <span className="font-semibold">{t('review.correctAnswer')}</span>{' '}
                    {answer.options[answer.correctOption as keyof typeof answer.options]}
                  </div>
                )}

                {answer.explanation && (
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed italic">
                    {answer.explanation}
                  </p>
                )}
              </div>
            </div>
          </ParchmentCard>
        </motion.div>
      ))}
    </div>
  );
}
