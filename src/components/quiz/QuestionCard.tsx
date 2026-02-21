'use client';

import { motion } from 'framer-motion';
import ParchmentCard from '@/components/ui/ParchmentCard';

interface QuestionCardProps {
  question: string;
  questionNumber?: number;
  totalQuestions?: number;
  className?: string;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  className = '',
}: QuestionCardProps) {
  return (
    <motion.div
      key={question}
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -60 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={className}
    >
      <ParchmentCard>
        {questionNumber && totalQuestions && (
          <p className="text-sm font-semibold text-amber-700 mb-3">
            Question {questionNumber} of {totalQuestions}
          </p>
        )}
        <h2 className="text-xl md:text-2xl font-bold text-amber-950 leading-relaxed">
          {question}
        </h2>
      </ParchmentCard>
    </motion.div>
  );
}
