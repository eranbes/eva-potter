import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq, desc } from 'drizzle-orm';
import { checkAchievements } from '@/lib/achievements/checker';

const COOKIE_NAME = 'eva_potter_user_id';
const MAX_POINTS_PER_ROUND = 30;
const DUEL_COOLDOWN_MS = 30_000; // 30 seconds between duels

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { roundsCorrect, pointsAwarded } = body;

    if (typeof roundsCorrect !== 'number' || roundsCorrect < 0 || roundsCorrect > 5) {
      return NextResponse.json(
        { error: 'roundsCorrect must be a number between 0 and 5' },
        { status: 400 }
      );
    }

    // Server-side: cap points to what's possible for the given roundsCorrect
    const maxAllowed = roundsCorrect * MAX_POINTS_PER_ROUND;
    const sanitizedPoints = (typeof pointsAwarded === 'number' && pointsAwarded >= 0)
      ? Math.min(pointsAwarded, maxAllowed)
      : 0;

    // Cooldown: reject if last duel was too recent
    const [lastDuel] = await db
      .select({ playedAt: schema.duelResults.playedAt })
      .from(schema.duelResults)
      .where(eq(schema.duelResults.userId, userId))
      .orderBy(desc(schema.duelResults.playedAt))
      .limit(1);

    if (lastDuel) {
      const elapsed = Date.now() - new Date(lastDuel.playedAt).getTime();
      if (elapsed < DUEL_COOLDOWN_MS) {
        return NextResponse.json(
          { error: 'Too soon! Wait before duelling again.' },
          { status: 429 }
        );
      }
    }

    await db.insert(schema.duelResults).values({
      userId,
      roundsCorrect,
      totalRounds: 5,
      pointsAwarded: sanitizedPoints,
      playedAt: new Date().toISOString(),
    });

    await db
      .update(schema.users)
      .set({
        totalPoints: user.totalPoints + sanitizedPoints,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.id, userId));

    const [updatedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    const newAchievements = await checkAchievements(userId, db);

    return NextResponse.json({
      pointsAwarded: sanitizedPoints,
      totalPoints: updatedUser.totalPoints,
      newAchievements,
    });
  } catch (error) {
    console.error('Error completing duel:', error);
    return NextResponse.json(
      { error: 'Failed to record duel result' },
      { status: 500 }
    );
  }
}
