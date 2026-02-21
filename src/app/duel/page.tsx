'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import MagicalButton from '@/components/ui/MagicalButton';
import DuelRound from '@/components/duel/DuelRound';
import { spells, type Spell } from '@/lib/duel/spells';

const TOTAL_ROUNDS = 5;

interface RoundResult {
  spell: Spell;
  correct: boolean;
  timeMs: number;
  points: number;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandomSpells(count: number): Spell[] {
  return shuffleArray(spells).slice(0, count);
}

function calculateRoundPoints(correct: boolean, timeMs: number): number {
  if (!correct) return 0;
  if (timeMs < 1000) return 30;
  if (timeMs < 2000) return 25;
  if (timeMs < 3000) return 20;
  if (timeMs < 5000) return 15;
  return 0;
}

type GamePhase = 'playing' | 'feedback' | 'results';

export default function DuelPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useUser();
  const { t, language } = useTranslation();

  const [selectedSpells, setSelectedSpells] = useState<Spell[]>(() => pickRandomSpells(TOTAL_ROUNDS));
  const [currentRound, setCurrentRound] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  const handleAnswer = useCallback(
    (correct: boolean, timeMs: number) => {
      const points = calculateRoundPoints(correct, timeMs);
      const result: RoundResult = {
        spell: selectedSpells[currentRound],
        correct,
        timeMs,
        points,
      };

      setLastResult(result);
      setResults((prev) => [...prev, result]);
      setPhase('feedback');
    },
    [currentRound, selectedSpells]
  );

  // Auto-advance from feedback to next round or results
  useEffect(() => {
    if (phase !== 'feedback') return;

    const timer = setTimeout(() => {
      if (currentRound + 1 >= TOTAL_ROUNDS) {
        setPhase('results');
      } else {
        setCurrentRound((prev) => prev + 1);
        setPhase('playing');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [phase, currentRound]);

  // Submit results to API when game ends
  useEffect(() => {
    if (phase !== 'results' || !user) return;
    if (results.length !== TOTAL_ROUNDS) return;
    if (hasSubmittedRef.current) return;

    hasSubmittedRef.current = true;

    const submitResults = async () => {
      setIsSubmitting(true);
      const roundsCorrect = results.filter((r) => r.correct).length;
      const totalPoints = results.reduce((sum, r) => sum + r.points, 0);

      try {
        await fetch('/api/duel/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roundsCorrect,
            pointsAwarded: totalPoints,
          }),
        });
        await refreshUser();
      } catch {
        // Silently fail
      } finally {
        setIsSubmitting(false);
      }
    };

    submitResults();
  }, [phase, results, user, refreshUser]);

  const handlePlayAgain = useCallback(() => {
    setSelectedSpells(pickRandomSpells(TOTAL_ROUNDS));
    setCurrentRound(0);
    setResults([]);
    setPhase('playing');
    setLastResult(null);
    setIsSubmitting(false);
    hasSubmittedRef.current = false;
  }, []);

  const totalPoints = results.reduce((sum, r) => sum + r.points, 0);
  const roundsCorrect = results.filter((r) => r.correct).length;

  const getResultMessage = () => {
    if (roundsCorrect === TOTAL_ROUNDS) return t('duel.perfect');
    if (roundsCorrect >= 4) return t('duel.great');
    if (roundsCorrect >= 2) return t('duel.good');
    return t('duel.practice');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        <Header />
        <main className="mx-auto max-w-lg px-4 py-6 flex flex-col items-center">
          <div className="text-purple-300 text-lg animate-pulse mt-20">
            {t('duel.loading')}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-6 flex flex-col items-center gap-4">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-heading font-bold text-yellow-400 text-glow-gold">
          {t('duel.title')}
        </h1>
        <p className="text-purple-300 text-sm">{t('duel.subtitle')}</p>

        {/* Playing phase */}
        {phase === 'playing' && selectedSpells[currentRound] && (
          <DuelRound
            key={currentRound}
            spell={selectedSpells[currentRound]}
            onAnswer={handleAnswer}
            roundNumber={currentRound + 1}
            totalRounds={TOTAL_ROUNDS}
            language={language}
          />
        )}

        {/* Feedback phase */}
        {phase === 'feedback' && lastResult && (
          <div className="flex flex-col items-center gap-3 mt-8">
            <div
              className={`text-3xl font-heading font-bold ${
                lastResult.correct ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {lastResult.correct ? t('duel.correct') : lastResult.timeMs >= 5000 ? t('duel.timeUp') : t('duel.wrong')}
            </div>
            {lastResult.correct && lastResult.points > 0 && (
              <div className="text-yellow-300 text-lg font-bold">
                +{lastResult.points} pts
              </div>
            )}
          </div>
        )}

        {/* Results phase */}
        {phase === 'results' && (
          <div className="w-full max-w-md mx-auto flex flex-col items-center gap-6 mt-4">
            <h2 className="text-xl font-heading font-bold text-yellow-400">
              {t('duel.results')}
            </h2>

            <p className="text-purple-200 text-center">{getResultMessage()}</p>

            {/* Total points */}
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">
                +{totalPoints}
              </div>
              <div className="text-sm text-purple-300">{t('duel.totalPoints')}</div>
            </div>

            {/* Round breakdown */}
            <div className="w-full space-y-2">
              <h3 className="text-sm font-semibold text-purple-300 uppercase tracking-wide">
                {t('duel.roundBreakdown')}
              </h3>
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-4 py-2 rounded-lg bg-purple-900/30 border border-purple-500/20"
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${result.correct ? 'text-emerald-400' : 'text-red-400'}`}>
                      {result.correct ? '\u2713' : '\u2717'}
                    </span>
                    <span className="text-purple-200 text-sm font-medium">
                      {result.spell.name}
                    </span>
                  </div>
                  <span className="text-yellow-300 text-sm font-bold">
                    +{result.points}
                  </span>
                </div>
              ))}
            </div>

            <MagicalButton onClick={handlePlayAgain}>
              {t('duel.playAgain')}
            </MagicalButton>
          </div>
        )}
      </main>
    </div>
  );
}
