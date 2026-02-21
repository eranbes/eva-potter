'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/providers/UserProvider';
import { useTranslation } from '@/components/providers/LanguageProvider';
import Header from '@/components/layout/Header';
import MagicalButton from '@/components/ui/MagicalButton';
import PotionCard from '@/components/potions/PotionCard';
import { ingredients, type Ingredient } from '@/lib/potions/ingredients';

interface Card {
  id: number;
  ingredient: Ingredient;
  flipped: boolean;
  matched: boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickRandom<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}

function createCards(): Card[] {
  const selected = pickRandom(ingredients, 8);
  const pairs = [...selected, ...selected];
  const shuffled = shuffleArray(pairs);
  return shuffled.map((ingredient, index) => ({
    id: index,
    ingredient,
    flipped: false,
    matched: false,
  }));
}

export default function PotionsPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useUser();
  const { t, language } = useTranslation();

  const [cards, setCards] = useState<Card[]>(() => createCards());
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [matchCount, setMatchCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lockRef = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  // Timer
  useEffect(() => {
    if (!timerRunning) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning]);

  // Check for matches when two cards are flipped
  useEffect(() => {
    if (flippedIds.length !== 2) return;

    lockRef.current = true;
    const [first, second] = flippedIds;
    const firstCard = cards.find((c) => c.id === first);
    const secondCard = cards.find((c) => c.id === second);

    if (firstCard && secondCard && firstCard.ingredient.id === secondCard.ingredient.id) {
      // Match found
      setCards((prev) =>
        prev.map((c) =>
          c.id === first || c.id === second ? { ...c, matched: true } : c
        )
      );
      setMatchCount((prev) => prev + 1);
      setFlippedIds([]);
      lockRef.current = false;
    } else {
      // No match - flip back after delay
      const timeout = setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === first || c.id === second ? { ...c, flipped: false } : c
          )
        );
        setFlippedIds([]);
        lockRef.current = false;
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [flippedIds, cards]);

  // Game completion
  useEffect(() => {
    if (matchCount === 8 && !gameComplete) {
      setTimerRunning(false);
      setGameComplete(true);
      submitResult(timer);
    }
  }, [matchCount, gameComplete]);

  const submitResult = async (timeSeconds: number) => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/potions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSeconds }),
      });
      if (res.ok) {
        const data = await res.json();
        setPointsAwarded(data.pointsAwarded);
        await refreshUser();
      }
    } catch {
      // Silently fail
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = useCallback(
    (id: number) => {
      if (lockRef.current || gameComplete) return;

      const card = cards.find((c) => c.id === id);
      if (!card || card.flipped || card.matched) return;

      // Start timer on first flip
      if (!timerRunning) {
        setTimerRunning(true);
      }

      setCards((prev) =>
        prev.map((c) => (c.id === id ? { ...c, flipped: true } : c))
      );
      setFlippedIds((prev) => [...prev, id]);
    },
    [cards, timerRunning, gameComplete]
  );

  const handleNewGame = useCallback(() => {
    setCards(createCards());
    setFlippedIds([]);
    setMatchCount(0);
    setTimer(0);
    setTimerRunning(false);
    setGameComplete(false);
    setPointsAwarded(0);
    setIsSubmitting(false);
    lockRef.current = false;
  }, []);

  const getIngredientName = (ingredient: Ingredient) =>
    language === 'fr' ? ingredient.nameFr : ingredient.nameEn;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
        <Header />
        <main className="mx-auto max-w-lg px-4 py-6 flex flex-col items-center">
          <div className="text-purple-300 text-lg animate-pulse mt-20">
            {t('potions.loading')}
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
          {t('potions.title')}
        </h1>
        <p className="text-purple-300 text-sm">{t('potions.subtitle')}</p>

        {/* Stats bar */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-purple-200">
            <span className="text-lg">⏱</span>
            <span className="font-mono font-bold">{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-2 text-purple-200">
            <span className="text-lg">🫕</span>
            <span className="font-bold">{matchCount}/8 {t('potions.pairs')}</span>
          </div>
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-4 gap-2 md:gap-3 w-full max-w-sm">
          {cards.map((card) => (
            <PotionCard
              key={card.id}
              ingredient={card.ingredient}
              flipped={card.flipped}
              matched={card.matched}
              onClick={() => handleCardClick(card.id)}
              name={getIngredientName(card.ingredient)}
            />
          ))}
        </div>

        {/* Completion overlay */}
        {gameComplete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
            <div className="bg-gradient-to-b from-purple-900 via-indigo-950 to-purple-900 border border-yellow-500/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
              <h2 className="text-2xl font-heading font-bold text-yellow-400 mb-4">
                {t('potions.complete')}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="text-purple-200">
                  <span className="text-sm">{t('potions.timeResult')}</span>
                  <span className="block text-2xl font-mono font-bold text-yellow-300">
                    {formatTime(timer)}
                  </span>
                </div>

                {pointsAwarded > 0 && (
                  <div className="text-emerald-300 text-lg font-bold animate-pulse">
                    +{pointsAwarded} {t('potions.pointsEarned')}
                  </div>
                )}
              </div>

              <MagicalButton onClick={handleNewGame}>
                {t('potions.playAgain')}
              </MagicalButton>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
