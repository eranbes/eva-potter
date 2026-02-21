import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, desc } from 'drizzle-orm';

const COOKIE_NAME = 'eva_potter_user_id';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(COOKIE_NAME)?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const results = await db
      .select()
      .from(schema.wordleResults)
      .where(eq(schema.wordleResults.userId, userId))
      .orderBy(desc(schema.wordleResults.playedAt));

    const gamesPlayed = results.length;
    const gamesWon = results.filter((r) => r.won).length;
    const winPercentage = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

    // Calculate current streak (consecutive wins from most recent game backwards)
    let currentStreak = 0;
    for (const result of results) {
      if (result.won) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate max streak (max consecutive wins ever)
    let maxStreak = 0;
    let streak = 0;
    for (const result of results) {
      if (result.won) {
        streak++;
        if (streak > maxStreak) {
          maxStreak = streak;
        }
      } else {
        streak = 0;
      }
    }

    // Guess distribution (only count winning games)
    const guessDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    for (const result of results) {
      if (result.won && result.guessesUsed >= 1 && result.guessesUsed <= 6) {
        guessDistribution[result.guessesUsed]++;
      }
    }

    // Total points from wordle games
    const totalPoints = results.reduce((sum, r) => sum + r.pointsAwarded, 0);

    return NextResponse.json({
      gamesPlayed,
      gamesWon,
      winPercentage,
      currentStreak,
      maxStreak,
      guessDistribution,
      totalPoints,
    });
  } catch (error) {
    console.error('Error fetching wordle stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wordle stats' },
      { status: 500 }
    );
  }
}
