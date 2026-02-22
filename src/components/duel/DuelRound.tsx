'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { type Spell } from '@/lib/duel/spells';

interface DuelRoundProps {
  spell: Spell;
  onAnswer: (correct: boolean, timeMs: number) => void;
  roundNumber: number;
  totalRounds: number;
  language: 'en' | 'fr';
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const ROUND_TIME_MS = 5000;

export default function DuelRound({ spell, onAnswer, roundNumber, totalRounds, language }: DuelRoundProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [correctEffect, setCorrectEffect] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(ROUND_TIME_MS);
  const [answered, setAnswered] = useState(false);
  const answeredRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const animFrameRef = useRef<number | null>(null);

  // Build shuffled options on mount / spell change
  useEffect(() => {
    const correct = language === 'fr' ? spell.effectFr : spell.effectEn;
    const wrong = language === 'fr' ? spell.wrongEffectsFr : spell.wrongEffectsEn;
    setCorrectEffect(correct);
    setOptions(shuffleArray([correct, ...wrong]));
    setAnswered(false);
    answeredRef.current = false;
    setTimeRemaining(ROUND_TIME_MS);
    startTimeRef.current = Date.now();
  }, [spell, language]);

  // Countdown timer using requestAnimationFrame for smooth bar
  useEffect(() => {
    if (answered) return;

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, ROUND_TIME_MS - elapsed);
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        if (answeredRef.current) return;
        answeredRef.current = true;
        setAnswered(true);
        onAnswer(false, ROUND_TIME_MS);
        return;
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [answered, onAnswer]);

  const handleAnswer = useCallback(
    (effect: string) => {
      if (answeredRef.current) return;
      answeredRef.current = true;
      setAnswered(true);
      const elapsed = Date.now() - startTimeRef.current;
      const isCorrect = effect === correctEffect;
      onAnswer(isCorrect, elapsed);
    },
    [correctEffect, onAnswer]
  );

  const barPercent = (timeRemaining / ROUND_TIME_MS) * 100;

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6">
      {/* Round indicator */}
      <div className="text-sm text-purple-300 font-medium">
        {roundNumber} / {totalRounds}
      </div>

      {/* Spell name */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-yellow-400 text-glow-gold">
          {spell.name}
        </h2>
      </div>

      {/* Timer bar */}
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-colors duration-300 ${
            barPercent > 50 ? 'bg-emerald-500' : barPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${barPercent}%`, transition: 'width 100ms linear' }}
        />
      </div>

      {/* Answer options */}
      <div className="w-full flex flex-col gap-3">
        {options.map((effect, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleAnswer(effect)}
            disabled={answered}
            className={`
              w-full px-4 py-3 rounded-xl text-left font-medium text-sm md:text-base
              border-2 transition-all duration-200
              ${answered
                ? effect === correctEffect
                  ? 'border-emerald-400 bg-emerald-900/50 text-emerald-200'
                  : 'border-slate-600/30 bg-slate-800/30 text-slate-500'
                : 'border-purple-500/30 bg-purple-900/30 text-purple-100 hover:border-yellow-500/50 hover:bg-purple-800/40 cursor-pointer'
              }
            `}
          >
            {effect}
          </button>
        ))}
      </div>
    </div>
  );
}
