import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db, schema } from '@/db';
import { eq } from 'drizzle-orm';
import { checkAchievements } from '@/lib/achievements/checker';

const COOKIE_NAME = 'eva_potter_user_id';
const MAX_POSSIBLE_POINTS = 150; // 5 rounds * 30 max per round

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

    if (typeof pointsAwarded !== 'number' || pointsAwarded < 0 || pointsAwarded > MAX_POSSIBLE_POINTS) {
      return NextResponse.json(
        { error: `pointsAwarded must be a number between 0 and ${MAX_POSSIBLE_POINTS}` },
        { status: 400 }
      );
    }

    await db.insert(schema.duelResults).values({
      userId,
      roundsCorrect,
      totalRounds: 5,
      pointsAwarded,
      playedAt: new Date().toISOString(),
    });

    await db
      .update(schema.users)
      .set({
        totalPoints: user.totalPoints + pointsAwarded,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.id, userId));

    const [updatedUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId));

    const newAchievements = await checkAchievements(userId, db);

    return NextResponse.json({
      pointsAwarded,
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
